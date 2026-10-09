import { Injectable, Logger, OnModuleInit, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createPublicClient,
  createWalletClient,
  http,
  type Address,
  type Hash,
  type LocalAccount,
  ContractFunctionRevertedError,
  BaseError,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { monadTestnet } from './chains';
import { ESCROW_ABI } from './escrow.abi';
import { loadDeployedEscrow, DeploymentData } from './deployment-loader';
import { ApiException } from '../common/exceptions/api.exception';

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

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const rpcUrl = this.config.getOrThrow<string>('ALCHEMY_RPC_URL');
    const privateKey = this.config.getOrThrow<string>(
      'OPERATOR_PRIVATE_KEY',
    ) as `0x${string}`;

    // Resolve contract address: deployment file > env var
    const deployment = loadDeployedEscrow();
    const address = deployment?.address ?? this.config.get<string>('ESCROW_ADDRESS');
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

    this.operatorAccount = privateKeyToAccount(privateKey);
    this.logger.log(`Operator wallet: ${this.operatorAccount.address}`);

    // viem v2: walletClient holds transport + chain; account passed per-call
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
      throw this.wrapError('getBalance', err);
    }
  }

  /**
   * Call reserve() on-chain and wait for confirmation.
   * Returns the confirmed transaction hash.
   */
  async reserve(
    callId: `0x${string}`,
    consumer: string,
    provider: string,
    amount: bigint,
  ): Promise<Hash> {
    try {
      const hash = await this.walletClient.writeContract({
        account: this.operatorAccount,
        chain: monadTestnet,
        address: this.escrowAddress,
        abi: this.escrowAbi,
        functionName: 'reserve',
        args: [callId, consumer as Address, provider as Address, amount],
      });

      this.logger.log(`reserve() submitted: callId=${callId} tx=${hash}`);
      await this.waitForTx(hash, 'reserve');
      return hash;
    } catch (err) {
      throw this.wrapError('reserve', err);
    }
  }

  /**
   * Call release() on-chain and wait for confirmation.
   */
  async release(callId: `0x${string}`): Promise<Hash> {
    try {
      const hash = await this.walletClient.writeContract({
        account: this.operatorAccount,
        chain: monadTestnet,
        address: this.escrowAddress,
        abi: this.escrowAbi,
        functionName: 'release',
        args: [callId],
      });

      this.logger.log(`release() submitted: callId=${callId} tx=${hash}`);
      await this.waitForTx(hash, 'release');
      return hash;
    } catch (err) {
      throw this.wrapError('release', err);
    }
  }

  /**
   * Call refund() on-chain and wait for confirmation.
   */
  async refund(callId: `0x${string}`): Promise<Hash> {
    try {
      const hash = await this.walletClient.writeContract({
        account: this.operatorAccount,
        chain: monadTestnet,
        address: this.escrowAddress,
        abi: this.escrowAbi,
        functionName: 'refund',
        args: [callId],
      });

      this.logger.log(`refund() submitted: callId=${callId} tx=${hash}`);
      await this.waitForTx(hash, 'refund');
      return hash;
    } catch (err) {
      throw this.wrapError('refund', err);
    }
  }

  /**
   * Fetch Call struct from chain.
   */
  async getCall(callId: `0x${string}`): Promise<{ consumer: string; provider: string; amount: bigint; status: number; expiry: bigint }> {
    try {
      const data = await this.publicClient.readContract({
        address: this.escrowAddress,
        abi: this.escrowAbi,
        functionName: 'getCall',
        args: [callId],
      }) as any;
      
      // data is a tuple or struct. viem usually returns an object if fields are named.
      // If it's a tuple: [consumer, provider, amount, status, expiry]
      // Wait, in solidity it's a struct. Viem returns an object for structs.
      if (Array.isArray(data)) {
        return {
          consumer: data[0],
          provider: data[1],
          amount: data[2],
          status: Number(data[3]),
          expiry: data[4]
        };
      }
      return {
        consumer: data.consumer,
        provider: data.provider,
        amount: data.amount,
        status: Number(data.status),
        expiry: data.expiry
      };
    } catch (err) {
      throw this.wrapError('getCall', err);
    }
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  private async waitForTx(hash: Hash, label: string): Promise<void> {
    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash,
      timeout: 30_000, // 30 s
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
   * Convert viem errors into structured ApiExceptions with clear messages.
   */
  private wrapError(fn: string, err: unknown): ApiException {
    if (err instanceof ApiException) return err;

    // Contract revert with reason string or custom error
    if (err instanceof BaseError) {
      const revert = err.walk((e) => e instanceof ContractFunctionRevertedError);
      if (revert instanceof ContractFunctionRevertedError) {
        const reason =
          revert.reason ?? revert.data?.errorName ?? 'unknown revert reason';
        this.logger.error(`Contract reverted in ${fn}(): ${reason}`);
        return new ApiException(
          'CONTRACT_REVERTED',
          `Escrow contract reverted in ${fn}(): ${reason}`,
          HttpStatus.BAD_GATEWAY,
        );
      }

      // RPC / network / timeout errors
      this.logger.error(
        `viem error in ${fn}(): ${err.shortMessage ?? err.message}`,
      );
      return new ApiException(
        'RPC_ERROR',
        `Chain communication error in ${fn}(): ${err.shortMessage ?? err.message}`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    // Unknown errors
    const msg = err instanceof Error ? err.message : String(err);
    this.logger.error(`Unexpected error in EscrowService.${fn}(): ${msg}`);
    return new ApiException('INTERNAL_ERROR', msg, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
