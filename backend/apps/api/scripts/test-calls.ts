/**
 * Phase 3 integration tests for CallsService (all in-process, no HTTP).
 * Run: npx ts-node scripts/test-calls.ts
 *
 * Tests:
 *   1. success → released
 *   2. invalid schema → refunded
 *   3. provider returns 500 → refunded
 *   4. provider timeout → refunded
 *   5. insufficient balance → rejected (no reserve)
 */
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { CallsService } from '../src/calls/calls.service';
import { MockEscrowService } from '../src/escrow/mock-escrow.service';
import { ValidationService } from '../src/validation/validation.service';

// ── Tiny mock setup ───────────────────────────────────────────────────────────

const CONSUMER = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';
const PROVIDER = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8';
const LISTING_ID = '87004abb-0ba4-457f-8d55-d03308f40b0c';
const ENDPOINT   = 'http://dummy-provider/api/weather';
const PRICE_WEI  = 1_000_000_000_000_000n; // 0.001 tMON

// Minimal mock listing that satisfies what CallsService reads
const mockListing = {
  id: LISTING_ID,
  name: 'Weather API',
  priceWei: PRICE_WEI.toString(),
  providerAddress: PROVIDER,
  endpoint: ENDPOINT,
  timeoutMs: 3000,
  schemaOutput: {
    type: 'object',
    required: ['city', 'temperature'],
    properties: {
      city:        { type: 'string' },
      temperature: { type: 'number' },
    },
  },
  schemaInput: {},
};

// Stub ListingsService
const listingsService = {
  findById: async (_id: string) => mockListing,
} as never;

// Build CallsService with mock pool (DB not used for these tests)
function buildSvc(escrow: MockEscrowService) {
  const pool = {
    query: async () => ({ rows: [] }),
  } as never;

  const validation = new ValidationService();

  return new CallsService(pool, escrow as never, validation, listingsService);
}

// ── Test runner ───────────────────────────────────────────────────────────────

type TestResult = { name: string; passed: boolean; error?: string };
const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ name, passed: true });
    console.log(`  ✅ PASS: ${name}`);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    results.push({ name, passed: false, error: msg });
    console.error(`  ❌ FAIL: ${name}\n       ${msg}`);
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n=== Phase 3: CallsService Tests ===\n');

  const axiosMock = new MockAdapter(axios);

  // ── Test 1: success → released ───────────────────────────────────────────
  await test('success → released', async () => {
    const escrow = new MockEscrowService();
    escrow.mockDeposit(CONSUMER, 5_000_000_000_000_000n);

    axiosMock.onPost(ENDPOINT).replyOnce(200, {
      city: 'Jakarta',
      temperature: 28.5,
    });

    const svc = buildSvc(escrow);
    const result = await svc.executeCall(CONSUMER, LISTING_ID, { city: 'Jakarta' });

    console.assert(result.status === 'released', `Expected released, got ${result.status}`);
    console.assert(result.data !== undefined, 'Expected data in response');
    console.assert(result.txReserve.startsWith('0xmock_reserve_'), `Bad txReserve: ${result.txReserve}`);
    console.assert(result.txFinal.startsWith('0xmock_release_'), `Bad txFinal: ${result.txFinal}`);
    // Provider got paid
    const providerBal = await escrow.getBalance(PROVIDER);
    console.assert(providerBal === PRICE_WEI, `Provider balance wrong: ${providerBal}`);
  });

  // ── Test 2: invalid schema → refunded ────────────────────────────────────
  await test('invalid schema → refunded', async () => {
    const escrow = new MockEscrowService();
    escrow.mockDeposit(CONSUMER, 5_000_000_000_000_000n);

    // Missing required 'temperature' field
    axiosMock.onPost(ENDPOINT).replyOnce(200, { city: 'Jakarta' });

    const svc = buildSvc(escrow);
    const result = await svc.executeCall(CONSUMER, LISTING_ID, { city: 'Jakarta' });

    console.assert(result.status === 'refunded', `Expected refunded, got ${result.status}`);
    console.assert(result.txFinal.startsWith('0xmock_refund_'), `Bad txFinal: ${result.txFinal}`);
    // Consumer gets money back
    const consumerBal = await escrow.getBalance(CONSUMER);
    console.assert(consumerBal === 5_000_000_000_000_000n, `Consumer not refunded: ${consumerBal}`);
  });

  // ── Test 3: provider 500 → refunded ──────────────────────────────────────
  await test('provider 500 → refunded', async () => {
    const escrow = new MockEscrowService();
    escrow.mockDeposit(CONSUMER, 5_000_000_000_000_000n);

    axiosMock.onPost(ENDPOINT).replyOnce(500, { error: 'Internal Server Error' });

    const svc = buildSvc(escrow);
    const result = await svc.executeCall(CONSUMER, LISTING_ID, { city: 'Jakarta' });

    console.assert(result.status === 'refunded', `Expected refunded, got ${result.status}`);
    console.assert(result.txFinal.startsWith('0xmock_refund_'), `Bad txFinal: ${result.txFinal}`);
  });

  // ── Test 4: provider timeout → refunded ──────────────────────────────────
  await test('provider timeout → refunded', async () => {
    const escrow = new MockEscrowService();
    escrow.mockDeposit(CONSUMER, 5_000_000_000_000_000n);

    // Simulate network timeout
    axiosMock.onPost(ENDPOINT).timeoutOnce();

    const svc = buildSvc(escrow);
    const result = await svc.executeCall(CONSUMER, LISTING_ID, { city: 'Jakarta' });

    console.assert(result.status === 'refunded', `Expected refunded, got ${result.status}`);
    console.assert(result.txFinal.startsWith('0xmock_refund_'), `Bad txFinal: ${result.txFinal}`);
  });

  // ── Test 5: insufficient balance → rejected (no reserve) ─────────────────
  await test('insufficient balance → rejected before reserve', async () => {
    const escrow = new MockEscrowService();
    // Do NOT fund the consumer

    const svc = buildSvc(escrow);
    try {
      await svc.executeCall(CONSUMER, LISTING_ID, { city: 'Jakarta' });
      throw new Error('Should have thrown INSUFFICIENT_BALANCE');
    } catch (e: unknown) {
      const err = e as { code?: string };
      console.assert(
        err.code === 'INSUFFICIENT_BALANCE',
        `Expected INSUFFICIENT_BALANCE, got ${err.code ?? String(e)}`,
      );
    }
  });

  // ── Summary ───────────────────────────────────────────────────────────────
  axiosMock.restore();
  const passed = results.filter((r) => r.passed).length;
  const total  = results.length;
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Results: ${passed}/${total} passed`);
  if (passed < total) {
    process.exit(1);
  } else {
    console.log('✅ All Phase 3 tests passed!\n');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
