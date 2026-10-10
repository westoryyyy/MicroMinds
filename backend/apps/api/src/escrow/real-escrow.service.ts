import { Injectable, Logger, OnModuleInit, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  type Address,
  type Hash,
  type LocalAccount,
  BaseError,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { nonceManager } from 'viem';
import { monadTestnet } from './chains';
import { ESCROW_ABI } from './escrow.abi';
import { loadDeployedEscrow } from './deployment-loader';
import { ApiException } from '../common/exceptions/api.exception';
import { toHttpException } from '../common/viem-error.util';

/**
 * Real EscrowService — talks to Monad testnet via Alchemy RPC (viem).
 *
 * Reads contract address from (in priority order):
 *   1. packages/contracts/deployments/monad-testnet.json
 *   2. ESCROW_ADDRESS env var
 *
 * Operator wallet loaded from OPERATOR_PRIVATE_KEY env var.
 * NEVER hardcodes addresses or private keys.
 */
@Injectable()
export class RealEscrowService implements OnModuleInit {
  private readonly logger = new Logger(RealEscrowService.name);

  private escrowAddress!: Address;
  private operatorAccount!: LocalAccount;
  private publicClient!: ReturnType<typeof createPublicClient>;
  private walletClient!: ReturnType<typeof createWalletClient>;
  private escrowAbi!: any;

  // Gas balance cache — refresh at most every 10 seconds to avoid RPC spam
  private cachedGasBalance: bigint = 0n;
  private gasCacheTs: number = 0;
  private readonly GAS_CACHE_TTL_MS = 10_000;
  private readonly MIN_GAS_BALANCE: bigint;

  constructor(private readonly config: ConfigService) {
    const minBalStr = this.config.get<string>('OPERATOR_MIN_BALANCE') ?? '0.05';
    this.MIN_GAS_BALANCE = parseEther(minBalStr);
  }

  onModuleInit(): void {
    const rpcUrl = this.config.getOrThrow<string>('ALCHEMY_RPC_URL');
    const privateKey = this.config.getOrThrow<string>(
      'OPERATOR_PRIVATE_KEY',
    ) as `0x${string}`;

    // Resolve contract address: deployment file > env var
    const deployment = loadDeployedEscrow();
    const address =
      deployment?.address ?? this.config.get<string>('ESCROW_ADDRESS');
    this.escrowAbi = deployment?.abi ?? ESCROW_ABI;

    if (!address) {
      throw new Error(
        'Escrow contract address not found. ' +
          'Either deploy the contract (which writes packages/contracts/deployments/monad-testnet.json) ' +
          'or set ESCROW_ADDRESS in your .env file.',
      );
    }

    this.escrowAddress = address as Address;
    this.logger.log(`Escrow address: ${this.escrowAddress}`);

    const transport = http(rpcUrl);

    this.publicClient = createPublicClient({
      chain: monadTestnet,
      transport,
    });

    // nonceManager prevents nonce collisions on fast Monad blocks
    this.operatorAccount = privateKeyToAccount(privateKey, { nonceManager });
    this.logger.log(`Operator wallet: ${this.operatorAccount.address}`);

    this.walletClient = createWalletClient({
      chain: monadTestnet,
      transport,
    });
  }

  /**
   * Read consumer's prepaid balance directly from the contract.
   * Always reads from chain — never cached.
   */
  async getBalance(consumer: string): Promise<bigint> {
    try {
      const balance = await this.publicClient.readContract({
        address: this.escrowAddress,
        abi: this.escrowAbi,
        functionName: 'balances',
        args: [consumer as Address],
      });
      return balance as bigint;
    } catch (err) {
      throw this.wrapLegacyError('getBalance', err);
    }
  }

  /**
   * Call reserve() on-chain: gas guard → simulate → write → receipt.
   * Returns the confirmed transaction hash.
   */
  async reserve(
    callId: `0x${string}`,
    consumer: string,
    provider: string,
    amount: bigint,
  ): Promise<Hash> {
    await this.assertOperatorHasGas();
    try {
      const { request } = await this.publicClient.simulateContract({
        account: this.operatorAccount,
        address: this.escrowAddress,
        abi: this.escrowAbi,
        functionName: 'reserve',
        args: [callId, consumer as Address, provider as Address, amount],
      });
      const hash = await this.walletClient.writeContract({
        ...request,
        account: this.operatorAccount,
        chain: monadTestnet,
      });
      this.logger.log(`reserve() submitted: callId=${callId} tx=${hash}`);
      await this.waitForTx(hash, 'reserve');
      return hash;
    } catch (err) {
      this.logger.error(
        `[RealEscrowService] reserve() error: ${err instanceof BaseError ? err.walk().message : String(err)}`,
      );
      throw toHttpException(err);
    }
  }

  /**
   * Call release() on-chain and wait for confirmation.
   */
  async release(callId: `0x${string}`): Promise<Hash> {
    await this.assertOperatorHasGas();
    try {
      const { request } = await this.publicClient.simulateContract({
        account: this.operatorAccount,
        address: this.escrowAddress,
        abi: this.escrowAbi,
        functionName: 'release',
        args: [callId],
      });
      const hash = await this.walletClient.writeContract({
        ...request,
        account: this.operatorAccount,
        chain: monadTestnet,
      });
      this.logger.log(`release() submitted: callId=${callId} tx=${hash}`);
      await this.waitForTx(hash, 'release');
      return hash;
    } catch (err) {
      this.logger.error(
        `[RealEscrowService] release() error: ${err instanceof BaseError ? err.walk().message : String(err)}`,
      );
      throw toHttpException(err);
    }
  }

  /**
   * Call refund() on-chain and wait for confirmation.
   */
  async refund(callId: `0x${string}`): Promise<Hash> {
    await this.assertOperatorHasGas();
    try {
      const { request } = await this.publicClient.simulateContract({
        account: this.operatorAccount,
        address: this.escrowAddress,
        abi: this.escrowAbi,
        functionName: 'refund',
        args: [callId],
      });
      const hash = await this.walletClient.writeContract({
        ...request,
        account: this.operatorAccount,
        chain: monadTestnet,
      });
      this.logger.log(`refund() submitted: callId=${callId} tx=${hash}`);
      await this.waitForTx(hash, 'refund');
      return hash;
    } catch (err) {
      this.logger.error(
        `[RealEscrowService] refund() error: ${err instanceof BaseError ? err.walk().message : String(err)}`,
      );
      throw toHttpException(err);
    }
  }

  /**
   * Fetch Call struct from chain (for idempotency checks).
   */
  async getCall(
    callId: `0x${string}`,
  ): Promise<{
    consumer: string;
    provider: string;
    amount: bigint;
    status: number;
    expiry: bigint;
  }> {
    try {
      const data = (await this.publicClient.readContract({
        address: this.escrowAddress,
        abi: this.escrowAbi,
        functionName: 'getCall',
        args: [callId],
      })) as any;

      if (Array.isArray(data)) {
        return {
          consumer: data[0],
          provider: data[1],
          amount: data[2],
          status: Number(data[3]),
          expiry: data[4],
        };
      }
      return {
        consumer: data.consumer,
        provider: data.provider,
        amount: data.amount,
        status: Number(data.status),
        expiry: data.expiry,
      };
    } catch (err) {
      throw this.wrapLegacyError('getCall', err);
    }
  }

  /**
   * Get operator wallet address (for health endpoint).
   */
  getOperatorAddress(): string {
    return this.operatorAccount?.address ?? '';
  }

  /**
   * Get operator gas balance (cached, for health endpoint).
   */
  async getOperatorBalance(): Promise<bigint> {
    return this.getCachedGasBalance();
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  /**
   * Proactive gas guard — throws 503 if operator balance is below threshold.
   * Result is cached for GAS_CACHE_TTL_MS to avoid RPC spam.
   */
  private async assertOperatorHasGas(): Promise<void> {
    const bal = await this.getCachedGasBalance();
    if (bal < this.MIN_GAS_BALANCE) {
      this.logger.error(
        `Operator wallet low on gas: ${bal} < ${this.MIN_GAS_BALANCE}`,
      );
      throw toHttpException(
        Object.assign(new Error('insufficient funds for gas'), {
          shortMessage: 'insufficient funds for gas',
          details: 'Operator had insufficient balance',
          message: 'insufficient balance',
        }),
      );
    }
  }

  private async getCachedGasBalance(): Promise<bigint> {
    const now = Date.now();
    if (now - this.gasCacheTs > this.GAS_CACHE_TTL_MS) {
      this.cachedGasBalance = await this.publicClient.getBalance({
        address: this.operatorAccount.address,
      });
      this.gasCacheTs = now;
    }
    return this.cachedGasBalance;
  }

  private async waitForTx(hash: Hash, label: string): Promise<void> {
    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash,
      timeout: 30_000,
    });

    if (receipt.status === 'reverted') {
      throw new ApiException(
        'TX_REVERTED',
        `Transaction ${label} (${hash}) was reverted on-chain`,
        HttpStatus.BAD_GATEWAY,
      );
    }

    this.logger.log(
      `${label} confirmed: tx=${hash} block=${receipt.blockNumber}`,
    );
  }

  /**
   * Legacy wrapError — kept for getBalance / getCall which don't need gas guard.
   */
  private wrapLegacyError(fn: string, err: unknown): ApiException {
    if (err instanceof ApiException) return err;
    if (err instanceof BaseError) {
      this.logger.error(
        `viem error in ${fn}(): ${err.shortMessage ?? err.message}`,
      );
      return new ApiException(
        'RPC_ERROR',
        `Chain communication error in ${fn}(): ${err.shortMessage ?? err.message}`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    const msg = err instanceof Error ? err.message : String(err);
    this.logger.error(`Unexpected error in EscrowService.${fn}(): ${msg}`);
    return new ApiException('INTERNAL_ERROR', msg, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
