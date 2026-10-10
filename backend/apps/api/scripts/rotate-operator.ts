/**
 * rotate-operator.ts
 *
 * Jalankan di luar sesi demo/rekaman; ada jeda singkat sampai OPERATOR_PK diganti.
 * Selama jeda itu, backend akan mengembalikan NotOperator pada setiap reserve().
 *
 * Usage:
 *   pnpm script scripts/rotate-operator.ts [<new-operator-address>] [--fund <amount-in-MON>]
 *
 * Env vars required:
 *   OWNER_PK          — private key of the contract owner (Ownable2Step)
 *   ALCHEMY_RPC_URL   — Alchemy RPC endpoint
 *   ESCROW_ADDRESS    — deployed Escrow contract address
 */

import { createWalletClient, createPublicClient, http, parseEther, generatePrivateKey } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { monadTestnet } from '../src/escrow/chains';

const OWNER_ABI = [
  { name: 'owner', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
  { name: 'operator', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
  { name: 'setOperator', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'newOperator', type: 'address' }], outputs: [] },
] as const;

async function main() {
  const ownerPk = process.env.OWNER_PK as `0x${string}`;
  const rpcUrl = process.env.ALCHEMY_RPC_URL as string;
  const escrowAddress = process.env.ESCROW_ADDRESS as `0x${string}`;

  if (!ownerPk || !rpcUrl || !escrowAddress) {
    console.error('Missing env: OWNER_PK, ALCHEMY_RPC_URL, ESCROW_ADDRESS');
    process.exit(1);
  }

  const ownerAccount = privateKeyToAccount(ownerPk);
  const transport = http(rpcUrl);

  const publicClient = createPublicClient({ chain: monadTestnet, transport });
  const walletClient = createWalletClient({ chain: monadTestnet, transport });

  // Verify caller is actual owner
  const onChainOwner = await publicClient.readContract({
    address: escrowAddress,
    abi: OWNER_ABI,
    functionName: 'owner',
  }) as string;

  if (onChainOwner.toLowerCase() !== ownerAccount.address.toLowerCase()) {
    console.error(`ABORT: OWNER_PK resolves to ${ownerAccount.address} but on-chain owner is ${onChainOwner}`);
    process.exit(1);
  }

  const currentOperator = await publicClient.readContract({
    address: escrowAddress,
    abi: OWNER_ABI,
    functionName: 'operator',
  }) as string;

  console.log(`Current operator on-chain: ${currentOperator}`);

  // Determine new operator address
  const args = process.argv.slice(2);
  const fundIdx = args.indexOf('--fund');
  const fundAmount = fundIdx !== -1 ? args[fundIdx + 1] : null;

  let newOperatorAddress: `0x${string}`;
  let newPrivateKey: string | null = null;

  // Check if first arg is an address (starts with 0x and is 42 chars)
  if (args[0] && args[0].startsWith('0x') && args[0].length === 42 && args[0] !== '--fund') {
    newOperatorAddress = args[0] as `0x${string}`;
    console.log(`Using provided operator address: ${newOperatorAddress}`);
  } else {
    // Generate a new keypair
    newPrivateKey = generatePrivateKey();
    const newAccount = privateKeyToAccount(newPrivateKey as `0x${string}`);
    newOperatorAddress = newAccount.address;
    console.log('\n=== NEW OPERATOR KEYPAIR (save these NOW) ===');
    console.log(`Private Key: ${newPrivateKey}`);
    console.log(`Address:     ${newOperatorAddress}`);
    console.log('=============================================\n');
  }

  // Optional: fund new operator
  if (fundAmount) {
    const amountWei = parseEther(fundAmount);
    console.log(`Funding new operator with ${fundAmount} MON...`);
    const fundHash = await walletClient.sendTransaction({
      account: ownerAccount,
      chain: monadTestnet,
      to: newOperatorAddress,
      value: amountWei,
    });
    await publicClient.waitForTransactionReceipt({ hash: fundHash });
    console.log(`Funded: tx=${fundHash}`);
  }

  // Call setOperator
  console.log(`Calling setOperator(${newOperatorAddress})...`);
  const hash = await walletClient.writeContract({
    account: ownerAccount,
    chain: monadTestnet,
    address: escrowAddress,
    abi: OWNER_ABI,
    functionName: 'setOperator',
    args: [newOperatorAddress],
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status === 'reverted') {
    console.error('setOperator() REVERTED!');
    process.exit(1);
  }

  console.log(`\n✅ setOperator() confirmed: tx=${hash}`);
  console.log('\n=== NEXT STEPS (do these NOW before any API calls) ===');
  console.log(`1. Update OPERATOR_PRIVATE_KEY in backend .env to: ${newPrivateKey ?? '<your-new-key>'}`);
  console.log('2. Restart the backend API server');
  console.log('3. Remove OWNER_PK from backend server environment');
  console.log('4. Verify: curl http://localhost:3001/health/operator');
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
