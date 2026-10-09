import { Controller, Get, Post, Body, Query, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { CallsService } from './calls.service';

@Controller()
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  /**
   * POST /call
   * Phase 3: full 10-step implementation.
   */
  @Post('call')
  @HttpCode(HttpStatus.OK)
  async call(
    @Body() body: unknown,
    @Req() req: Request & { walletAddress: string },
  ) {
    const { listingId, input } = body as { listingId: string; input: unknown };
    return this.callsService.executeCall(listingId, input, req.walletAddress);
  }

  /**
   * GET /calls?consumer=0x...
   */
  @Get('calls')
  async findCalls(@Query('consumer') consumer: string) {
    return this.callsService.findByConsumer(consumer);
  }

  /**
   * GET /me — returns wallet address + on-chain balance.
   * Phase 2: balance wired after EscrowService is complete.
   */
  @Get('me')
  async me(@Req() req: Request & { walletAddress: string }) {
    return {
      walletAddress: req.walletAddress,
      balanceWei: null, // TODO Phase 2
    };
  }
}
