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
import { z } from 'zod';

// Extend Express Request to include walletAddress set by ApiKeyMiddleware
type AuthRequest = Request & { walletAddress: string };

const CallDto = z.object({
  listingId: z.string().uuid('listingId must be a valid UUID'),
  input: z.record(z.unknown()).default({}),
});

const PaginationDto = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

@Controller()
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  /**
   * GET /me
   * Returns the authenticated consumer's wallet address.
   * Requires: x-api-key header (ApiKeyMiddleware sets req.walletAddress)
   */
  @Get('me')
  getMe(@Req() req: AuthRequest) {
    return {
      walletAddress: req.walletAddress,
    };
  }

  /**
   * GET /calls
   * Returns the caller's call history (paginated, newest first).
   * Query: limit=50&offset=0
   */
  @Get('calls')
  async getCalls(
    @Req() req: AuthRequest,
    @Query() query: unknown,
  ) {
    const { limit, offset } = PaginationDto.parse(query);
    const rows = await this.callsService.findByConsumer(
      req.walletAddress,
      limit,
      offset,
    );
    return rows.map((r) => ({
      callId: r.call_id,
      listingId: r.listing_id,
      consumer: r.consumer,
      provider: r.provider,
      amountWei: r.amount_wei,
      status: r.status,
      reason: r.reason,
      latencyMs: r.latency_ms,
      txReserve: r.tx_reserve,
      txFinal: r.tx_final,
      createdAt: r.created_at,
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
