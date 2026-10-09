/**
 * seed-phase4.ts — Seed 4 listings for Phase 4 dummy provider
 *
 * Run: npx ts-node scripts/seed-phase4.ts
 *
 * Provider: http://localhost:3002
 * Provider wallet: 0x000000000000000000000000000000000000dead (dummy)
 *
 * Listings:
 *   1. json-formatter   — 500_000_000_000_000 wei (0.0005 tMON), timeout=3000ms
 *   2. text-extractor   — 300_000_000_000_000 wei (0.0003 tMON), timeout=2000ms
 *   3. url-metadata     — 800_000_000_000_000 wei (0.0008 tMON), timeout=8000ms
 *   4. flaky-provider   — 200_000_000_000_000 wei (0.0002 tMON), timeout=2000ms
 */
import * as path from 'path';
import { Pool } from 'pg';

// Load .env
const dotenvPath = path.resolve(__dirname, '../.env');
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('dotenv').config({ path: dotenvPath });
} catch {
  /* dotenv optional */
}

const DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://postgres:kebunbunga24@localhost:5432/microminds';

const PROVIDER_BASE = 'http://localhost:3002';
// All dummy listings share the same dummy provider wallet
const PROVIDER_WALLET = '0x0000000000000000000000000000000000000001';

const listings = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'JSON Formatter',
    description:
      'Formats and prettifies a JSON object with optional key sorting and configurable indentation.',
    endpoint: `${PROVIDER_BASE}/provider/json-formatter`,
    price_wei: '500000000000000', // 0.0005 tMON
    schema_input: {
      type: 'object',
      required: ['data'],
      properties: {
        data: { type: 'object', description: 'JSON object to format' },
        indent: { type: 'number', default: 2, minimum: 0, maximum: 8 },
        sortKeys: { type: 'boolean', default: false },
      },
    },
    schema_output: {
      type: 'object',
      required: ['formatted', 'keyCount', 'byteSize'],
      properties: {
        formatted: { type: 'string', description: 'Pretty-printed JSON string' },
        keyCount:  { type: 'number', description: 'Total nested key count' },
        byteSize:  { type: 'number', description: 'UTF-8 byte size of formatted output' },
      },
    },
    timeout_ms: 3000,
    provider_address: PROVIDER_WALLET,
    category: 'utilities',
    is_active: true,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Text Extractor',
    description:
      'Analyzes plain text and extracts statistics: word count, sentence count, character count, unique words, and email addresses.',
    endpoint: `${PROVIDER_BASE}/provider/text-extractor`,
    price_wei: '300000000000000', // 0.0003 tMON
    schema_input: {
      type: 'object',
      required: ['text'],
      properties: {
        text: { type: 'string', description: 'Plain text to analyze', minLength: 1 },
        extractEmails: { type: 'boolean', default: false },
      },
    },
    schema_output: {
      type: 'object',
      required: ['wordCount', 'sentenceCount', 'charCount', 'uniqueWords', 'emails'],
      properties: {
        wordCount:     { type: 'number' },
        sentenceCount: { type: 'number' },
        charCount:     { type: 'number' },
        uniqueWords:   { type: 'number' },
        emails:        { type: 'array', items: { type: 'string' } },
      },
    },
    timeout_ms: 2000,
    provider_address: PROVIDER_WALLET,
    category: 'nlp',
    is_active: true,
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'URL Metadata Fetcher',
    description:
      'Fetches a URL and extracts its title, og:description, and HTTP status code. Useful for link previews.',
    endpoint: `${PROVIDER_BASE}/provider/url-metadata`,
    price_wei: '800000000000000', // 0.0008 tMON
    schema_input: {
      type: 'object',
      required: ['url'],
      properties: {
        url: { type: 'string', format: 'uri', description: 'HTTP/HTTPS URL to fetch' },
      },
    },
    schema_output: {
      type: 'object',
      required: ['url', 'title', 'description', 'statusCode'],
      properties: {
        url:         { type: 'string' },
        title:       { type: 'string' },
        description: { type: 'string' },
        statusCode:  { type: 'number' },
      },
    },
    timeout_ms: 8000,
    provider_address: PROVIDER_WALLET,
    category: 'web',
    is_active: true,
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Flaky Analyzer (Testing)',
    description:
      '[TEST] Intentionally unreliable endpoint — alternates between HTTP 500 and incorrect schema responses. Used to validate refund behavior.',
    endpoint: `${PROVIDER_BASE}/provider/flaky`,
    price_wei: '200000000000000', // 0.0002 tMON
    schema_input: {
      type: 'object',
      properties: {
        mode: {
          type: 'string',
          enum: ['server-error', 'wrong-schema', 'random'],
          default: 'random',
        },
      },
    },
    schema_output: {
      type: 'object',
      required: ['result', 'score'],
      properties: {
        result: { type: 'string' },
        score:  { type: 'number', minimum: 0, maximum: 100 },
      },
    },
    timeout_ms: 2000,
    provider_address: PROVIDER_WALLET,
    category: 'testing',
    is_active: true,
  },
];

async function main() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  console.log(`\n=== Phase 4: Seeding ${listings.length} listings ===\n`);

  for (const l of listings) {
    await pool.query(
      `INSERT INTO listings
         (id, name, description, endpoint, price_wei, schema_input, schema_output,
          timeout_ms, provider_address, category, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         endpoint = EXCLUDED.endpoint,
         price_wei = EXCLUDED.price_wei,
         schema_input = EXCLUDED.schema_input,
         schema_output = EXCLUDED.schema_output,
         timeout_ms = EXCLUDED.timeout_ms,
         provider_address = EXCLUDED.provider_address,
         category = EXCLUDED.category,
         is_active = EXCLUDED.is_active`,
      [
        l.id, l.name, l.description, l.endpoint, l.price_wei,
        JSON.stringify(l.schema_input), JSON.stringify(l.schema_output),
        l.timeout_ms, l.provider_address, l.category, l.is_active,
      ],
    );
    console.log(`  ✅ ${l.name} (${l.id})`);
    console.log(`     endpoint: ${l.endpoint}`);
    console.log(`     price:    ${l.price_wei} wei | timeout: ${l.timeout_ms}ms`);
    console.log(`     schema_output requires: [${Object.keys(l.schema_output.properties ?? {}).join(', ')}]\n`);
  }

  await pool.end();
  console.log(`Seeded ${listings.length} listings.\n`);
}

main().catch((e) => { console.error(e); process.exit(1); });
