import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { EscrowService } from './escrow.service';
import { ConfigService } from '@nestjs/config';

/**
 * EscrowController — debug/utility endpoints.
 * Only useful for development/testing; protected by the API key middleware
 * in production (via AppModule).
 */
@Controller('escrow')
export class EscrowController {
  constructor(
    private readonly escrowService: EscrowService,
    private readonly config: ConfigService,
  ) {}

  /**
   * GET /escrow/balance/:address
   * Returns the consumer's on-chain (or mock) balance in wei.
   */
  @Get('balance/:address')
  async getBalance(@Param('address') address: string) {
    const balance = await this.escrowService.getBalance(address);
    return {
      address,
      balanceWei: balance.toString(),
      // Human-readable tMON (18 decimals)
      balanceTMON: (Number(balance) / 1e18).toFixed(6),
    };
  }

  /**
   * POST /escrow/mock-deposit  (MOCK MODE ONLY)
   * Adds funds to a mock address for testing.
   * Body: { address: string, amountWei: string }
   */
  @Post('mock-deposit')
  mockDeposit(@Body() body: { address: string; amountWei: string }) {
    if (this.config.get('ESCROW_MOCK') !== 'true') {
      return { error: 'mock-deposit is only available when ESCROW_MOCK=true' };
    }
    const mock = this.escrowService.getMock();
    mock.mockDeposit(body.address, BigInt(body.amountWei));
    return {
      ok: true,
      address: body.address,
      depositedWei: body.amountWei,
    };
  }
}
