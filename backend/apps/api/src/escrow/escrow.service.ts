import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MockEscrowService } from './mock-escrow.service';
import { RealEscrowService } from './real-escrow.service';

export type EscrowBackend = MockEscrowService | RealEscrowService;

/**
 * EscrowService — public facade used by CallsService.
 *
 * At startup it selects between:
 *   - MockEscrowService  when ESCROW_MOCK=true  (local dev / CI)
 *   - RealEscrowService  otherwise               (staging / production)
 *
 * Both backends expose the exact same async interface, so callers
 * don't need to know which one is active.
 */
@Injectable()
export class EscrowService implements OnModuleInit {
  private readonly logger = new Logger(EscrowService.name);
  private backend!: EscrowBackend;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const mock = this.config.get<string>('ESCROW_MOCK') === 'true';

    if (mock) {
      this.logger.warn(
        'ESCROW_MOCK=true — using in-memory mock. No real on-chain transactions.',
      );
      this.backend = new MockEscrowService();
    } else {
      this.logger.log('Using RealEscrowService (Monad testnet via Alchemy)');
      const real = new RealEscrowService(this.config);
      real.onModuleInit(); // initialise viem clients
      this.backend = real;
    }
  }

  /**
   * Read consumer's on-chain prepaid balance (wei).
   * In mock mode: in-memory balance.
   * In real mode: direct contract read, never cached.
   */
  async getBalance(consumer: string): Promise<bigint> {
    return this.backend.getBalance(consumer);
  }

  /**
   * Reserve funds from consumer balance.
   * @returns confirmed tx hash
   */
  async reserve(
    callId: `0x${string}`,
    consumer: string,
    provider: string,
    amount: bigint,
  ): Promise<`0x${string}`> {
    return this.backend.reserve(callId, consumer, provider, amount);
  }

  /**
   * Release reserved funds to provider (valid response).
   * @returns confirmed tx hash
   */
  async release(callId: `0x${string}`): Promise<`0x${string}`> {
    return this.backend.release(callId);
  }

  /**
   * Refund reserved funds to consumer (invalid/error/timeout).
   * @returns confirmed tx hash
   */
  async refund(callId: `0x${string}`): Promise<`0x${string}`> {
    return this.backend.refund(callId);
  }

  /**
   * Expose mock backend for test seeding (only available in mock mode).
   * Throws if called in real mode.
   */
  getMock(): MockEscrowService {
    if (!(this.backend instanceof MockEscrowService)) {
      throw new Error('getMock() called but EscrowService is in real mode');
    }
    return this.backend;
  }
}
