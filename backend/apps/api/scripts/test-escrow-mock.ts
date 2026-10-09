/**
 * Phase 2 unit test: exercise MockEscrowService reserve → release and reserve → refund.
 * Run: npx ts-node scripts/test-escrow-mock.ts
 */
import { MockEscrowService } from '../src/escrow/mock-escrow.service';

const CONSUMER = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';
const PROVIDER = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8';

async function main() {
  const svc = new MockEscrowService();

  console.log('\n--- Test 1: getBalance on empty wallet ---');
  const empty = await svc.getBalance(CONSUMER);
  console.assert(empty === 0n, `Expected 0, got ${empty}`);
  console.log(`  PASS: balance = ${empty}`);

  console.log('\n--- Test 2: mock deposit ---');
  svc.mockDeposit(CONSUMER, 5_000_000_000_000_000n); // 0.005 tMON
  const after = await svc.getBalance(CONSUMER);
  console.assert(after === 5_000_000_000_000_000n, `Expected 5e15, got ${after}`);
  console.log(`  PASS: balance after deposit = ${after}`);

  console.log('\n--- Test 3: reserve 0.001 tMON ---');
  const callId1 = '0x' + 'a'.repeat(64) as `0x${string}`;
  const tx1 = await svc.reserve(callId1, CONSUMER, PROVIDER, 1_000_000_000_000_000n);
  console.assert(tx1.startsWith('0xmock_reserve_'), `Expected mock tx, got ${tx1}`);
  const afterReserve = await svc.getBalance(CONSUMER);
  console.assert(afterReserve === 4_000_000_000_000_000n, `Expected 4e15, got ${afterReserve}`);
  console.log(`  PASS: reserve tx=${tx1}, consumer balance=${afterReserve}`);

  console.log('\n--- Test 4: release (provider gets paid) ---');
  const tx2 = await svc.release(callId1);
  console.assert(tx2.startsWith('0xmock_release_'), `Expected mock tx, got ${tx2}`);
  const providerBal = await svc.getBalance(PROVIDER);
  console.assert(providerBal === 1_000_000_000_000_000n, `Expected 1e15, got ${providerBal}`);
  console.log(`  PASS: release tx=${tx2}, provider balance=${providerBal}`);

  console.log('\n--- Test 5: reserve then refund (consumer gets back) ---');
  const callId2 = '0x' + 'b'.repeat(64) as `0x${string}`;
  await svc.reserve(callId2, CONSUMER, PROVIDER, 1_000_000_000_000_000n);
  const beforeRefund = await svc.getBalance(CONSUMER);
  const tx3 = await svc.refund(callId2);
  console.assert(tx3.startsWith('0xmock_refund_'), `Expected mock tx, got ${tx3}`);
  const afterRefund = await svc.getBalance(CONSUMER);
  console.assert(afterRefund === beforeRefund + 1_000_000_000_000_000n, `Refund failed`);
  console.log(`  PASS: refund tx=${tx3}, consumer balance restored to ${afterRefund}`);

  console.log('\n--- Test 6: duplicate callId → CONFLICT error ---');
  try {
    await svc.reserve(callId2, CONSUMER, PROVIDER, 1_000_000_000_000_000n);
    console.error('  FAIL: expected error for duplicate callId');
  } catch (e: unknown) {
    const err = e as { code?: string };
    console.assert(err.code === 'CALL_ALREADY_SETTLED' || err.code === 'CALL_ALREADY_EXISTS', `Wrong code: ${err.code}`);
    console.log(`  PASS: caught error code=${err.code}`);
  }

  console.log('\n--- Test 7: release already-released call → CONFLICT error ---');
  try {
    await svc.release(callId1);
    console.error('  FAIL: expected error for double-release');
  } catch (e: unknown) {
    const err = e as { code?: string };
    console.assert(err.code === 'CALL_ALREADY_SETTLED', `Wrong code: ${err.code}`);
    console.log(`  PASS: caught error code=${err.code}`);
  }

  console.log('\n--- Test 8: insufficient balance ---');
  const richConsumer = '0x' + 'c'.repeat(40);
  try {
    await svc.reserve('0x' + 'f'.repeat(64) as `0x${string}`, richConsumer, PROVIDER, 999n);
    console.error('  FAIL: expected INSUFFICIENT_BALANCE');
  } catch (e: unknown) {
    const err = e as { code?: string };
    console.assert(err.code === 'INSUFFICIENT_BALANCE', `Wrong code: ${err.code}`);
    console.log(`  PASS: caught error code=${err.code}`);
  }

  console.log('\n✅ All MockEscrowService tests passed!\n');
}

main().catch((e) => { console.error(e); process.exit(1); });
