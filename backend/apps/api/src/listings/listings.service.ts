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
    const conditions: string[] = ['is_active = $1'];

    if (opts?.q) {
      params.push(`%${opts.q}%`);
      conditions.push(
        `(name ILIKE $${params.length} OR description ILIKE $${params.length})`,
      );
    }

    if (opts?.maxPrice) {
      params.push(opts.maxPrice);
      conditions.push(`price_wei <= $${params.length}`);
    }

    const where = conditions.join(' AND ');
    const { rows } = await this.pool.query<ListingRow>(
      `SELECT id, name, description, price_wei, category
       FROM listings
       WHERE ${where}
       ORDER BY created_at DESC`,
      params,
    );

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      priceWei: r.price_wei,
      category: r.category,
    }));
  }

  async findById(id: string): Promise<ListingDetail> {
    const { rows } = await this.pool.query<ListingRow>(
      `SELECT * FROM listings WHERE id = $1 AND is_active = true`,
      [id],
    );

    if (rows.length === 0) {
      throw new NotFoundException('Listing', id);
    }

    const parsed = ListingRowSchema.parse(rows[0]);

    return {
      id: parsed.id,
      name: parsed.name,
      description: parsed.description,
      priceWei: parsed.price_wei,
      category: parsed.category,
      schemaInput: parsed.schema_input,
      schemaOutput: parsed.schema_output,
      timeoutMs: parsed.timeout_ms,
      providerAddress: parsed.provider_address,
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
