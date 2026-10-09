/**
 * Seed script: inserts 2 demo listings for testing GET /listings.
 * Run: ts-node scripts/seed.ts
 */
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const listings = [
  {
    name: 'Weather API',
    description: 'Get current weather for any city using OpenWeatherMap data.',
    endpoint: 'http://localhost:3001/dummy/weather',
    price_wei: '1000000000000000', // 0.001 tMON
    schema_input: JSON.stringify({
      type: 'object',
      properties: { city: { type: 'string' } },
      required: ['city'],
    }),
    schema_output: JSON.stringify({
      type: 'object',
      properties: {
        city: { type: 'string' },
        temperature: { type: 'number' },
        unit: { type: 'string' },
      },
      required: ['city', 'temperature'],
    }),
    timeout_ms: 5000,
    provider_address: '0x000000000000000000000000000000000000dead',
    category: 'weather',
  },
  {
    name: 'Text Summarizer',
    description: 'Summarize any long text into 2-3 sentences using AI.',
    endpoint: 'http://localhost:3001/dummy/summarize',
    price_wei: '5000000000000000', // 0.005 tMON
    schema_input: JSON.stringify({
      type: 'object',
      properties: { text: { type: 'string', minLength: 1 } },
      required: ['text'],
    }),
    schema_output: JSON.stringify({
      type: 'object',
      properties: { summary: { type: 'string' } },
      required: ['summary'],
    }),
    timeout_ms: 8000,
    provider_address: '0x000000000000000000000000000000000000dead',
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
