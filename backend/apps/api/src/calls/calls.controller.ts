import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { CallsService } from './calls.service';
import { EscrowService } from '../escrow/escrow.service';
import { z } from 'zod';

// Extend Express Request to include walletAddress set by ApiKeyMiddleware
type AuthRequest = Request & { walletAddress: string };

const CallDto = z.object({
  listingId: z.string().uuid('listingId must be a valid UUID'),
  input: z.record(z.unknown()).default({}),
});

const CallsQueryDto = z.object({
  address: z.string().optional(),
  consumer: z.string().optional(),
  provider: z.string().optional(),
  role: z.enum(['consumer', 'provider']).optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

@Controller()
export class CallsController {
  constructor(
    private readonly callsService: CallsService,
    private readonly escrowService: EscrowService,
  ) {}

  /**
   * GET /me
   * Returns the authenticated consumer's wallet address.
   * Requires: x-api-key header (ApiKeyMiddleware sets req.walletAddress)
   */
  @Get('me')
  async getMe(@Req() req: AuthRequest) {
    const balance = await this.escrowService.getBalance(req.walletAddress);
    return {
      address: req.walletAddress,
      walletAddress: req.walletAddress, // backward compat
      balance: balance.toString(),
      balanceWei: balance.toString(),
      balanceTMON: (Number(balance) / 1e18).toFixed(6),
    };
  }

  /**
   * GET /calls
   * Returns the call history (paginated, newest first).
   * Query: address=0x...&role=consumer&limit=50&offset=0
   */
  @Get('calls')
  async getCalls(
    @Req() req: Request & { walletAddress?: string },
    @Query() query: unknown,
  ) {
    const parsed = CallsQueryDto.parse(query);
    const targetAddress = parsed.address || parsed.consumer || parsed.provider || req.walletAddress;

    const rows = await this.callsService.findCalls({
      address: targetAddress,
      consumer: parsed.consumer,
      provider: parsed.provider,
      role: parsed.role,
      limit: parsed.limit,
      offset: parsed.offset,
    });

    return rows.map((r) => ({
      callId: r.call_id,
      listingId: r.listing_id,
      listingName: r.listing_name,
      consumer: r.consumer,
      provider: r.provider,
      amountWei: r.amount_wei,
      amount: r.amount_wei,
      status: r.status,
      reason: r.reason,
      latencyMs: r.latency_ms,
      txReserve: r.tx_reserve,
      txFinal: r.tx_final,
      reserveTx: r.tx_reserve,
      finalTx: r.tx_final,
      createdAt: r.created_at,
      reservedAt: Math.floor(new Date(r.created_at).getTime() / 1000),
      finalizedAt: Math.floor(new Date(r.created_at).getTime() / 1000),
    }));
  }

  /**
   * POST /api/chat-agent (Primary)
   * POST /call (Alias)
   * Execute a micro-API call using the 10-step escrow flow.
   * Body: { listingId: UUID, input: object }
   * Returns: { callId, status, output, txHash, reason? }
   */
  @Post(['api/chat-agent', 'call'])
  @HttpCode(HttpStatus.OK)
  async call(@Req() req: AuthRequest, @Body() body: unknown) {
    const dto = CallDto.parse(body);
    const result = await this.callsService.executeCall(
      req.walletAddress,
      dto.listingId,
      dto.input,
    );

    const response: any = {
      callId: result.callId,
      status: result.status,
      txHash: result.txFinal,
      amountWei: result.amountWei,
    };
    if (result.status === 'released') {
      response.output = result.data;
    }
    if (result.reason) {
      response.reason = result.reason;
    }
    return response;
  }
}
