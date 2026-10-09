import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';
import { NotFoundException } from '../common/exceptions/api.exception';
import {
  ListingDetail,
  ListingRow,
  ListingRowSchema,
  ListingSummary,
} from './listings.types';

@Injectable()
export class ListingsService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async findAll(opts?: {
    q?: string;
    maxPrice?: string;
  }): Promise<ListingSummary[]> {
    const params: unknown[] = [true];
    const conditions: string[] = ['l.is_active = $1'];

    if (opts?.q) {
      params.push(`%${opts.q}%`);
      conditions.push(
        `(l.name ILIKE $${params.length} OR l.description ILIKE $${params.length})`,
      );
    }

    if (opts?.maxPrice) {
      params.push(opts.maxPrice);
      conditions.push(`l.price_wei <= $${params.length}`);
    }

    const where = conditions.join(' AND ');
    const { rows } = await this.pool.query<ListingRow & { success_rate: string; avg_latency: string }>(
      `SELECT l.id, l.name, l.description, l.price_wei, l.category,
              COALESCE(
                ROUND(100.0 * SUM(CASE WHEN c.status = 'released' THEN 1 ELSE 0 END) / NULLIF(COUNT(c.call_id),0)),
                100
              )::int AS success_rate,
              COALESCE(AVG(CASE WHEN c.latency_ms IS NOT NULL THEN c.latency_ms END), 0)::int AS avg_latency
       FROM listings l
       LEFT JOIN calls c ON c.listing_id = l.id
       WHERE ${where}
       GROUP BY l.id
       ORDER BY l.created_at DESC`,
      params,
    );

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      priceWei: r.price_wei,
      category: r.category,
      successRate: Number(r.success_rate),
      avgLatencyMs: Number(r.avg_latency),
    }));
  }

  async findById(id: string): Promise<ListingDetail> {
    const { rows } = await this.pool.query<ListingRow & { success_rate: string; avg_latency: string }>(
      `SELECT l.*,
              COALESCE(
                ROUND(100.0 * SUM(CASE WHEN c.status = 'released' THEN 1 ELSE 0 END) / NULLIF(COUNT(c.call_id),0)),
                100
              )::int AS success_rate,
              COALESCE(AVG(CASE WHEN c.latency_ms IS NOT NULL THEN c.latency_ms END), 0)::int AS avg_latency
       FROM listings l
       LEFT JOIN calls c ON c.listing_id = l.id
       WHERE l.id = $1 AND l.is_active = true
       GROUP BY l.id`,
      [id],
    );

    if (rows.length === 0) {
      throw new NotFoundException('Listing', id);
    }

    const raw = rows[0];
    const parsed = ListingRowSchema.parse(raw);

    return {
      id: parsed.id,
      name: parsed.name,
      description: parsed.description,
      priceWei: parsed.price_wei,
      category: parsed.category,
      successRate: Number(raw.success_rate),
      avgLatencyMs: Number(raw.avg_latency),
      inputSchema: parsed.schema_input,
      outputSchema: parsed.schema_output,
      timeoutMs: parsed.timeout_ms,
      providerAddress: parsed.provider_address,
      endpoint: parsed.endpoint,
    };
  }

  /** Used internally by CallsService — returns raw row including endpoint */
  async findRawById(id: string): Promise<ListingRow> {
    const { rows } = await this.pool.query<ListingRow>(
      `SELECT * FROM listings WHERE id = $1 AND is_active = true`,
      [id],
    );

    if (rows.length === 0) {
      throw new NotFoundException('Listing', id);
    }

    return ListingRowSchema.parse(rows[0]);
  }
}
