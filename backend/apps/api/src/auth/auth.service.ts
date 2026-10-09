import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';
import { generateApiKey, hashApiKey } from './api-key.util';
import { UnauthorizedException } from '../common/exceptions/api.exception';

export interface ApiKeyRow {
  id: string;
  key_hash: string;
  wallet_address: string;
  label: string | null;
  created_at: Date;
}

@Injectable()
export class AuthService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  /**
   * Create a new API key bound to a wallet address.
   * Returns the PLAINTEXT key once (never stored).
   */
  async createApiKey(
    walletAddress: string,
    label?: string,
  ): Promise<{ key: string; id: string }> {
    const plaintext = generateApiKey();
    const keyHash = hashApiKey(plaintext);

    const { rows } = await this.pool.query<{ id: string }>(
      `INSERT INTO api_keys (key_hash, wallet_address, label)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [keyHash, walletAddress.toLowerCase(), label ?? null],
    );

    return { key: plaintext, id: rows[0].id };
  }

  /**
   * Validate an API key and return the associated wallet address.
   * Throws UnauthorizedException if invalid.
   */
  async validateApiKey(plaintext: string): Promise<string> {
    const keyHash = hashApiKey(plaintext);

    const { rows } = await this.pool.query<ApiKeyRow>(
      `UPDATE api_keys
       SET last_used_at = now()
       WHERE key_hash = $1
       RETURNING *`,
      [keyHash],
    );

    if (rows.length === 0) {
      throw new UnauthorizedException();
    }

    return rows[0].wallet_address;
  }
}
