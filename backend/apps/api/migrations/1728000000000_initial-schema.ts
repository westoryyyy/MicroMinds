/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // ── listings ──────────────────────────────────────────────────────────────
  pgm.createTable('listings', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    name: { type: 'varchar(255)', notNull: true },
    description: { type: 'text', notNull: true },
    endpoint: { type: 'text', notNull: true },
    price_wei: {
      type: 'numeric(78,0)', // fits uint256
      notNull: true,
    },
    schema_input: { type: 'jsonb', notNull: true, default: '{}' },
    schema_output: { type: 'jsonb', notNull: true, default: '{}' },
    timeout_ms: { type: 'integer', notNull: true, default: 5000 },
    provider_address: { type: 'varchar(42)', notNull: true },
    category: { type: 'varchar(100)', notNull: false },
    is_active: { type: 'boolean', notNull: true, default: true },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  pgm.createIndex('listings', 'category');
  pgm.createIndex('listings', 'provider_address');
  pgm.createIndex('listings', 'is_active');

  // ── api_keys ──────────────────────────────────────────────────────────────
  pgm.createTable('api_keys', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    // SHA-256 hex digest — NEVER store plaintext key
    key_hash: { type: 'varchar(64)', notNull: true, unique: true },
    wallet_address: { type: 'varchar(42)', notNull: true },
    label: { type: 'varchar(100)', notNull: false },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
    last_used_at: { type: 'timestamptz', notNull: false },
  });

  pgm.createIndex('api_keys', 'wallet_address');

  // ── calls ─────────────────────────────────────────────────────────────────
  pgm.createTable('calls', {
    call_id: {
      type: 'varchar(66)', // "0x" + 64 hex chars (bytes32)
      primaryKey: true,
    },
    listing_id: {
      type: 'uuid',
      notNull: true,
      references: '"listings"',
      onDelete: 'RESTRICT',
    },
    consumer: { type: 'varchar(42)', notNull: true },
    provider: { type: 'varchar(42)', notNull: true },
    amount_wei: { type: 'numeric(78,0)', notNull: true },
    status: {
      type: 'varchar(20)',
      notNull: true,
      // 'reserved' | 'released' | 'refunded' | 'failed'
      check: "status IN ('reserved','released','refunded','failed')",
    },
    reason: { type: 'text', notNull: false },
    latency_ms: { type: 'integer', notNull: false },
    tx_reserve: { type: 'varchar(66)', notNull: false },
    tx_final: { type: 'varchar(66)', notNull: false },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  pgm.createIndex('calls', 'consumer');
  pgm.createIndex('calls', 'listing_id');
  pgm.createIndex('calls', 'status');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('calls');
  pgm.dropTable('api_keys');
  pgm.dropTable('listings');
}
