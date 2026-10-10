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
    name: 'JSON Formatter',
    description: 'Format unreadable JSON strings into pretty JSON.',
    endpoint: 'http://localhost:3001/providers/json-format',
    price_wei: '100000000000000', // 0.0001 tMON
    schema_input: JSON.stringify({
      type: 'object',
      properties: { raw: { type: 'string' } },
      required: ['raw'],
    }),
    schema_output: JSON.stringify({
      type: 'object',
      properties: { formatted: { type: 'string' } },
      required: ['formatted'],
    }),
    timeout_ms: 5000,
    provider_address: '0x0000000000000000000000000000000000000001',
    category: 'utility',
  },
  {
    name: 'Text Extraction',
    description: 'Extract emails and phone numbers from raw text.',
    endpoint: 'http://localhost:3001/providers/text-extract',
    price_wei: '100000000000000', // 0.0001 tMON
    schema_input: JSON.stringify({
      type: 'object',
      properties: { text: { type: 'string' } },
      required: ['text'],
    }),
    schema_output: JSON.stringify({
      type: 'object',
      properties: {
        emails: { type: 'array', items: { type: 'string' } },
        phones: { type: 'array', items: { type: 'string' } },
      },
      required: ['emails', 'phones'],
    }),
    timeout_ms: 5000,
    provider_address: '0x0000000000000000000000000000000000000002',
    category: 'utility',
  },
  {
    name: 'URL Metadata',
    description: 'Get title and description of a web page.',
    endpoint: 'http://localhost:3001/providers/url-metadata',
    price_wei: '100000000000000', // 0.0001 tMON
    schema_input: JSON.stringify({
      type: 'object',
      properties: { url: { type: 'string' } },
      required: ['url'],
    }),
    schema_output: JSON.stringify({
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
      },
      required: ['title', 'description'],
    }),
    timeout_ms: 5000,
    provider_address: '0x0000000000000000000000000000000000000003',
    category: 'utility',
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
    timeout_ms: 25000, // AI listings ~25000 ms
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
