import { Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { ApiException } from '../common/exceptions/api.exception';
import { HttpStatus } from '@nestjs/common';

interface ReservedCall {
  consumer: string;
  provider: string;
  amount: bigint;
  status: 'reserved' | 'released' | 'refunded';
  expiry: bigint;
}

/**
 * In-memory mock that mirrors the exact interface of RealEscrowService.
 * Used when ESCROW_MOCK=true (local development, CI).
 *
 * Balances start empty. Deposit via mockDeposit() before testing.
 * All txHash values are deterministic fakes (0xmock...).
 */
export class MockEscrowService {
  private readonly logger = new Logger('MockEscrowService');
  private readonly balances = new Map<string, bigint>();
  private readonly calls = new Map<string, ReservedCall>();

  constructor() {
    this.logger.warn('MockEscrowService: all transactions are simulated in-memory');
  }

  /** Pre-fund an address for testing (no real tx needed). */
  mockDeposit(account: string, amount: bigint): void {
    const addr = account.toLowerCase();
    this.balances.set(addr, (this.balances.get(addr) ?? 0n) + amount);
    this.logger.debug(`Mock deposit: ${addr} += ${amount} (balance: ${this.balances.get(addr)})`);
  }

  async getBalance(consumer: string): Promise<bigint> {
    return this.balances.get(consumer.toLowerCase()) ?? 0n;
  }

  async reserve(
    callId: `0x${string}`,
    consumer: string,
    provider: string,
    amount: bigint,
  ): Promise<`0x${string}`> {
    const addr = consumer.toLowerCase();
    const balance = this.balances.get(addr) ?? 0n;

    if (balance < amount) {
      throw new ApiException(
        'INSUFFICIENT_BALANCE',
        `Consumer ${consumer} has insufficient balance: need ${amount}, have ${balance}`,
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    if (this.calls.has(callId)) {
      throw new ApiException(
        'CALL_ALREADY_EXISTS',
        `Call ID ${callId} already exists`,
        HttpStatus.CONFLICT,
      );
    }

    this.balances.set(addr, balance - amount);
    this.calls.set(callId, {
      consumer: addr,
      provider: provider.toLowerCase(),
      amount,
      status: 'reserved',
      expiry: BigInt(Math.floor(Date.now() / 1000) + 86400), // +1 day
    });

    const txHash = `0xmock_reserve_${randomBytes(8).toString('hex')}` as `0x${string}`;
    this.logger.debug(`Mock reserve: callId=${callId} consumer=${addr} amount=${amount} tx=${txHash}`);
    return txHash;
  }

  async release(callId: `0x${string}`): Promise<`0x${string}`> {
    const call = this.calls.get(callId);
    if (!call) {
      throw new ApiException(
        'CALL_NOT_FOUND',
        `Call ID ${callId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    if (call.status !== 'reserved') {
      throw new ApiException(
        'CALL_ALREADY_SETTLED',
        `Call ID ${callId} is already ${call.status}`,
        HttpStatus.CONFLICT,
      );
    }

    call.status = 'released';
    const providerBalance = this.balances.get(call.provider) ?? 0n;
    this.balances.set(call.provider, providerBalance + call.amount);

    const txHash = `0xmock_release_${randomBytes(8).toString('hex')}` as `0x${string}`;
    this.logger.debug(`Mock release: callId=${callId} provider=${call.provider} amount=${call.amount} tx=${txHash}`);
    return txHash;
  }

  async refund(callId: `0x${string}`): Promise<`0x${string}`> {
    const call = this.calls.get(callId);
    if (!call) {
      throw new ApiException(
        'CALL_NOT_FOUND',
        `Call ID ${callId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    if (call.status !== 'reserved') {
      throw new ApiException(
        'CALL_ALREADY_SETTLED',
        `Call ID ${callId} is already ${call.status}`,
        HttpStatus.CONFLICT,
      );
    }

    call.status = 'refunded';
    const consumerBalance = this.balances.get(call.consumer) ?? 0n;
    this.balances.set(call.consumer, consumerBalance + call.amount);

    const txHash = `0xmock_refund_${randomBytes(8).toString('hex')}` as `0x${string}`;
    this.logger.debug(`Mock refund: callId=${callId} consumer=${call.consumer} amount=${call.amount} tx=${txHash}`);
    return txHash;
  }

  async getCall(callId: `0x${string}`): Promise<{ consumer: string; provider: string; amount: bigint; status: number; expiry: bigint }> {
    const call = this.calls.get(callId);
    if (!call) {
      return { consumer: '0x0000000000000000000000000000000000000000', provider: '0x0000000000000000000000000000000000000000', amount: 0n, status: 0, expiry: 0n };
    }
    const statusMap = { reserved: 1, released: 2, refunded: 3 };
    return {
      consumer: call.consumer,
      provider: call.provider,
      amount: call.amount,
      status: statusMap[call.status],
      expiry: call.expiry,
    };
  }
}
