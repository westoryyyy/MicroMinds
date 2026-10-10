/**
 * Seed script: inserts demo listings for MicroMinds testing.
 * Run: ts-node scripts/seed.ts
 */
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const listings = [
  {
    name: 'x402 Fund Audit Agent',
    description: 'A paid AI audit service for crypto funds with x402-gated intake, reports, receipts, and settlement records.',
    endpoint: 'http://localhost:3001/providers/x402-audit',
    price_wei: '50000000000000000', // 0.05 tMON
    schema_input: JSON.stringify({
      type: 'object',
      properties: { contract_code: { type: 'string' } },
      required: ['contract_code'],
    }),
    schema_output: JSON.stringify({
      type: 'object',
      properties: { 
        vulnerabilities_found: { type: 'number' },
        audit_report: { type: 'string' } 
      },
      required: ['vulnerabilities_found', 'audit_report'],
    }),
    timeout_ms: 25000,
    provider_address: '0x0000000000000000000000000000000000000001',
    category: 'security',
  },
  {
    name: 'Wallet Portfolio Cleaner',
    description: 'A wallet cleanup app for low-value and suspicious tokens with thresholds, simulations, and safe actions.',
    endpoint: 'http://localhost:3001/providers/wallet-cleaner',
    price_wei: '2000000000000000', // 0.002 tMON
    schema_input: JSON.stringify({
      type: 'object',
      properties: { wallet_address: { type: 'string' } },
      required: ['wallet_address'],
    }),
    schema_output: JSON.stringify({
      type: 'object',
      properties: { 
        scam_tokens_detected: { type: 'number' },
        cleanup_instructions: { type: 'string' } 
      },
      required: ['scam_tokens_detected', 'cleanup_instructions'],
    }),
    timeout_ms: 10000,
    provider_address: '0x0000000000000000000000000000000000000002',
    category: 'utility',
  },
  {
    name: 'Social Trade Agent',
    description: 'An X-tagged trading bot with linked identities, scoped wallet permissions, simulations, and audit trails.',
    endpoint: 'http://localhost:3001/providers/social-trade',
    price_wei: '10000000000000000', // 0.01 tMON
    schema_input: JSON.stringify({
      type: 'object',
      properties: { twitter_intent: { type: 'string' } },
      required: ['twitter_intent'],
    }),
    schema_output: JSON.stringify({
      type: 'object',
      properties: { 
        trade_executed: { type: 'boolean' },
        tx_hash: { type: 'string' } 
      },
      required: ['trade_executed', 'tx_hash'],
    }),
    timeout_ms: 15000,
    provider_address: '0x0000000000000000000000000000000000000003',
    category: 'finance',
  },
  {
    name: 'Flaky Listing',
    description: 'Simulates failures (500 or bad schema) for testing refunds.',
    endpoint: 'http://localhost:3001/providers/flaky',
    price_wei: '500000000000000', // 0.0005 tMON
    schema_input: JSON.stringify({
      type: 'object',
      properties: { trigger: { type: 'string' } },
      required: ['trigger'],
    }),
    schema_output: JSON.stringify({
      type: 'object',
      properties: { result: { type: 'string' } },
      required: ['result'],
    }),
    timeout_ms: 5000,
    provider_address: '0x0000000000000000000000000000000000000004',
    category: 'testing',
  },
  {
    name: 'AI Assistant',
    description: 'LLM-backed AI Assistant.',
    endpoint: 'http://localhost:3001/providers/ai-assistant',
    price_wei: '5000000000000000', // 0.005 tMON
    schema_input: JSON.stringify({
      type: 'object',
      properties: { prompt: { type: 'string', maxLength: 1000 } },
      required: ['prompt'],
    }),
    schema_output: JSON.stringify({
      type: 'object',
      properties: { answer: { type: 'string' } },
      required: ['answer'],
    }),
    timeout_ms: 25000,
    provider_address: '0x0000000000000000000000000000000000000005',
    category: 'ai',
  },
];

async function seed() {
  console.log('🌱 Seeding listings...');
  for (const l of listings) {
    const { rows } = await pool.query(
      `INSERT INTO listings (name, description, endpoint, price_wei, schema_input, schema_output, timeout_ms, provider_address, category)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT DO NOTHING
       RETURNING id, name`,
      [
        l.name,
        l.description,
        l.endpoint,
        l.price_wei,
        l.schema_input,
        l.schema_output,
        l.timeout_ms,
        l.provider_address,
        l.category,
      ],
    );
    if (rows.length > 0) {
      console.log(`  ✅ Inserted: ${rows[0].name} (${rows[0].id})`);
    } else {
      console.log(`  ⏭  Already exists: ${l.name}`);
    }
  }
  await pool.end();
  console.log('✅ Done.');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
