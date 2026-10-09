import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';

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
}

@Injectable()
export class CallsService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  /** Phase 3: full 10-step POST /call logic */
  async executeCall(_listingId: string, _input: unknown, _consumer: string): Promise<never> {
    throw new Error('CallsService.executeCall not yet implemented — Phase 3');
  }

  /** GET /calls?consumer=0x... */
  async findByConsumer(consumer: string): Promise<CallRow[]> {
    const { rows } = await this.pool.query<CallRow>(
      `SELECT * FROM calls WHERE consumer = $1 ORDER BY created_at DESC LIMIT 100`,
      [consumer.toLowerCase()],
    );
    return rows;
  }
}
