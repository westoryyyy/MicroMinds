import {
  Injectable,
  Logger,
  Inject,
  HttpStatus,
} from '@nestjs/common';
import { Pool } from 'pg';
import { randomBytes } from 'crypto';
import axios, { AxiosError } from 'axios';
import { PG_POOL } from '../database/database.module';
import { EscrowService } from '../escrow/escrow.service';
import { ValidationService } from '../validation/validation.service';
import { ListingsService } from '../listings/listings.service';
import { ApiException } from '../common/exceptions/api.exception';

// ── Rate limiter (in-memory, per API-key, no Redis) ─────────────────────────
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_CALLS = 20;     // per API key per window

interface RateBucket {
  count: number;
  windowStart: number;
}

const rateBuckets = new Map<string, RateBucket>();

function checkRateLimit(walletAddress: string): void {
  const now = Date.now();
  const bucket = rateBuckets.get(walletAddress);

  if (!bucket || now - bucket.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateBuckets.set(walletAddress, { count: 1, windowStart: now });
    return;
  }

  bucket.count += 1;
  if (bucket.count > RATE_LIMIT_MAX_CALLS) {
    throw new ApiException(
      'RATE_LIMIT_EXCEEDED',
      `Rate limit exceeded: max ${RATE_LIMIT_MAX_CALLS} calls per minute per API key`,
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

// ── DB row types ─────────────────────────────────────────────────────────────
export interface CallRow {
  call_id: string;
  listing_id: string;
  consumer: string;
  provider: string;
  amount_wei: string;
  status: 'reserved' | 'released' | 'refunded' | 'failed';
  reason: string | null;
  latency_ms: number | null;
  tx_reserve: string | null;
  tx_final: string | null;
  created_at: Date;
  expiry: Date | null;
}

@Injectable()
export class CallsService {
  private readonly logger = new Logger(CallsService.name);

  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    private readonly escrow: EscrowService,
    private readonly validation: ValidationService,
    private readonly listings: ListingsService,
  ) {}

  // ── GET /calls ─────────────────────────────────────────────────────────────

  async findByConsumer(
    walletAddress: string,
    limit = 50,
    offset = 0,
  ): Promise<CallRow[]> {
    const { rows } = await this.pool.query<CallRow>(
      `SELECT * FROM calls
       WHERE consumer = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [walletAddress.toLowerCase(), limit, offset],
    );
    return rows;
  }

  // ── POST /call — 10-step gateway ───────────────────────────────────────────

  /**
   * Execute a micro-API call with escrow-based payment.
   *
   * Steps:
   *   1.  Check rate limit (per wallet, in-memory)
   *   2.  Fetch listing from DB (validates it exists and is active)
   *   3.  Check on-chain balance >= priceWei
   *   4.  Generate callId (bytes32 hex)
   *   5.  reserve() → funds locked
   *   6.  Call provider endpoint with timeout
   *   7a. Validate: status 2xx + JSON schema + latency <= timeoutMs
   *   7b. On any failure: refund()
   *   8.  release() (valid) or refund() (invalid/error)
   *   9.  Log call to DB
   *   10. Return response to consumer
   */
  async executeCall(
    walletAddress: string,
    listingId: string,
    inputData: unknown,
  ): Promise<{
    callId: string;
    status: 'released' | 'refunded';
    data?: unknown;
    latencyMs: number;
    txReserve: string;
    txFinal: string;
    reason?: string | null;
  }> {
    // ── Step 1: Rate limit ──────────────────────────────────────────────────
    checkRateLimit(walletAddress.toLowerCase());

    // ── Step 2: Fetch listing ───────────────────────────────────────────────
    const listing = await this.listings.findById(listingId);
    if (!listing.providerAddress) {
      throw new ApiException(
        'LISTING_INACTIVE',
        `Listing '${listingId}' is not active`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const amountWei = BigInt(listing.priceWei as string);
    const consumer = walletAddress.toLowerCase();
    const provider = listing.providerAddress.toLowerCase();
    const timeoutMs: number = (listing.timeoutMs as number) ?? 5000;

    // ── Step 3: Check on-chain balance ──────────────────────────────────────
    const balance = await this.escrow.getBalance(consumer);
    if (balance < amountWei) {
      throw new ApiException(
        'INSUFFICIENT_BALANCE',
        `Insufficient prepaid balance: need ${amountWei} wei, have ${balance} wei`,
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    // ── Step 4: Generate callId (32-byte hex = bytes32) ─────────────────────
    const callId = `0x${randomBytes(32).toString('hex')}` as `0x${string}`;
    this.logger.log(`[${callId}] Starting call: listing=${listingId} consumer=${consumer}`);

    // ── Step 5: reserve() ───────────────────────────────────────────────────
    const txReserve = await this.escrow.reserve(callId, consumer, provider, amountWei);
    this.logger.log(`[${callId}] Reserved: tx=${txReserve}`);

    // Fetch expiry from the contract (non-fatal)
    let expiryDate: Date | null = null;
    try {
      const callData = await this.escrow.getCall(callId);
      if (callData.expiry > 0n) {
        // Convert seconds to ms safely
        const expiryMs = Number(callData.expiry) * 1000;
        if (Number.isSafeInteger(expiryMs)) {
          expiryDate = new Date(expiryMs);
        }
      }
    } catch (err) {
      this.logger.warn(`[${callId}] Failed to fetch call struct for expiry: ${String(err)}`);
    }

    // Steps 6–9 wrapped in try/finally to guarantee refund on error
    let txFinal: string;
    let status: 'released' | 'refunded';
    let dbStatus: 'released' | 'refunded' | 'refunded_forcibly';
    let responseData: unknown;
    let latencyMs = 0;
    let reason: string | null = null;

    try {
      // ── Step 6: Call provider endpoint ─────────────────────────────────────
      const t0 = Date.now();
      let providerRes: { status: number; data: unknown } | null = null;
      let providerError: string | null = null;

      try {
        const res = await axios.post(
          listing.endpoint as string,
          inputData,
          {
            timeout: timeoutMs,
            validateStatus: () => true, // don't throw on non-2xx
          },
        );
        latencyMs = Date.now() - t0;
        providerRes = { status: res.status, data: res.data };
      } catch (err: unknown) {
        latencyMs = Date.now() - t0;
        const axErr = err as AxiosError;
        if (axErr.code === 'ECONNABORTED' || axErr.message?.includes('timeout')) {
          providerError = `Provider timeout after ${latencyMs}ms (limit: ${timeoutMs}ms)`;
        } else {
          providerError = `Provider unreachable: ${axErr.message}`;
        }
      }

      // ── Step 7: Validate response ───────────────────────────────────────────
      let valid = false;
      if (providerError) {
        reason = providerError;
      } else if (!providerRes) {
        reason = 'No response from provider';
      } else if (providerRes.status < 200 || providerRes.status >= 300) {
        reason = `Provider returned non-2xx status: ${providerRes.status}`;
      } else if (latencyMs > timeoutMs) {
        reason = `Provider response exceeded timeout: ${latencyMs}ms > ${timeoutMs}ms`;
      } else {
        // Schema validation (schemaOutput from listing)
        const schemaOutput = listing.schemaOutput as object | undefined;
        if (schemaOutput && Object.keys(schemaOutput).length > 0) {
          const validationResult = this.validation.validate(
            schemaOutput,
            providerRes.data,
          );
          if (!validationResult.valid) {
            reason = `Response schema invalid: ${validationResult.errors.join('; ')}`;
          } else {
            valid = true;
            responseData = providerRes.data;
          }
        } else {
          valid = true;
          responseData = providerRes.data;
        }
      }

      // ── Step 8: release or refund ───────────────────────────────────────────
      try {
        if (valid) {
          txFinal = await this.escrow.release(callId);
          status = 'released';
          dbStatus = 'released';
          this.logger.log(
            `[${callId}] RELEASED: latency=${latencyMs}ms tx=${txFinal}`,
          );
        } else {
          txFinal = await this.escrow.refund(callId);
          status = 'refunded';
          dbStatus = 'refunded';
          this.logger.warn(
            `[${callId}] REFUNDED: reason="${reason}" latency=${latencyMs}ms tx=${txFinal}`,
          );
        }
      } catch (err: unknown) {
        // Check if the operator transaction reverted because the consumer already forced a refund
        this.logger.warn(`[${callId}] Tx failed, checking on-chain status: ${String(err)}`);
        try {
          const callData = await this.escrow.getCall(callId);
          if (callData.status === 3) { // 3 = Refunded
            this.logger.warn(`[${callId}] Call was already force-refunded on-chain.`);
            txFinal = '0x_force_refunded';
            status = 'refunded';
            dbStatus = 'refunded_forcibly';
            reason = 'force_refunded_by_consumer';
          } else {
            throw err;
          }
        } catch (getErr) {
          throw err;
        }
      }
    } catch (err: unknown) {
      // Unexpected error after reserve — must refund
      this.logger.error(
        `[${callId}] Unexpected error after reserve, forcing refund: ${String(err)}`,
      );
      try {
        txFinal = await this.escrow.refund(callId);
        this.logger.log(`[${callId}] Emergency refund: tx=${txFinal}`);
        status = 'refunded';
        dbStatus = 'refunded';
      } catch (refundErr) {
        this.logger.error(`[${callId}] Emergency refund FAILED, checking if already refunded...`);
        try {
          const callData = await this.escrow.getCall(callId);
          if (callData.status === 3) {
             txFinal = '0x_force_refunded';
             status = 'refunded';
             dbStatus = 'refunded_forcibly';
             reason = 'force_refunded_by_consumer';
          } else {
             txFinal = '0x_refund_failed';
             status = 'failed' as any;
             dbStatus = 'failed' as any;
          }
        } catch (e) {
          txFinal = '0x_refund_failed';
          status = 'failed' as any;
          dbStatus = 'failed' as any;
        }
      }
      if (!reason) reason = err instanceof Error ? err.message : String(err);
      txFinal = txFinal!;
    }

    // ── Step 9: Log to DB ───────────────────────────────────────────────────
    await this.logCall({
      callId,
      listingId,
      consumer,
      provider,
      amountWei: amountWei.toString(),
      status: dbStatus,
      reason,
      latencyMs,
      txReserve,
      txFinal: txFinal!,
      expiry: expiryDate,
    });

    // ── Step 10: Respond ────────────────────────────────────────────────────
    return {
      callId,
      status,
      data: status === 'released' ? responseData : undefined,
      latencyMs,
      txReserve,
      txFinal: txFinal!,
      reason,
    };
  }

  // ── Private ─────────────────────────────────────────────────────────────────

  private async logCall(params: {
    callId: string;
    listingId: string;
    consumer: string;
    provider: string;
    amountWei: string;
    status: string;
    reason: string | null;
    latencyMs: number;
    txReserve: string;
    txFinal: string;
    expiry: Date | null;
  }): Promise<void> {
    try {
      await this.pool.query(
        `INSERT INTO calls
           (call_id, listing_id, consumer, provider, amount_wei,
            status, reason, latency_ms, tx_reserve, tx_final, expiry)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (call_id) DO NOTHING`,
        [
          params.callId,
          params.listingId,
          params.consumer,
          params.provider,
          params.amountWei,
          params.status,
          params.reason,
          params.latencyMs,
          params.txReserve,
          params.txFinal,
          params.expiry,
        ],
      );
    } catch (err) {
      // Logging failure should not fail the response
      this.logger.error(`[${params.callId}] Failed to log call to DB: ${String(err)}`);
    }
  }
}
