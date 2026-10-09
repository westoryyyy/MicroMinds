# Integration Guide for MicroMinds Escrow

This document provides necessary integrations, RPC handling, error handling, and indexing guidelines for the Backend (Grace), Frontend (Renatha), and the Indexer team.

## Monad Testnet Network Details

All integrations must use the following configuration for the Monad Testnet:
- **Chain ID**: `10143`
- **Native Token**: `MON` (Do not use `tMON`)

## 1. Backend (Grace)

The backend acts as the `Operator` and initiates reservations, releases, and refunds.

### Example Viem Setup (Operator Wallet via Alchemy RPC)

```typescript
import { createWalletClient, createPublicClient, http, parseEther, keccak256, toBytes } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { monadTestnet } from 'viem/chains'; // Define if missing in viem

// 1. Setup Clients
const account = privateKeyToAccount('0xYOUR_OPERATOR_PRIVATE_KEY');
const publicClient = createPublicClient({
  chain: { id: 10143, name: 'Monad Testnet', network: 'monad-testnet', nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 }, rpcUrls: { default: { http: [process.env.ALCHEMY_RPC_URL] } } },
  transport: http()
});
const walletClient = createWalletClient({
  account,
  chain: { id: 10143, name: 'Monad Testnet', network: 'monad-testnet', nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 }, rpcUrls: { default: { http: [process.env.ALCHEMY_RPC_URL] } } },
  transport: http()
});

// 2. Reading Balance
const consumerBalance = await publicClient.readContract({
  address: '<TO_BE_FILLED>',
  abi: escrowAbi,
  functionName: 'balances',
  args: ['0xCONSUMER_ADDRESS']
});

// 3. Creating a bytes32 Call ID from UUID
import { v4 as uuidv4 } from 'uuid';
const uuid = uuidv4();
const callId = keccak256(toBytes(uuid)); 

// 4. Calling Reserve (Operator action)
const tx = await walletClient.writeContract({
  address: '<TO_BE_FILLED>',
  abi: escrowAbi,
  functionName: 'reserve',
  args: [callId, '0xCONSUMER_ADDRESS', '0xPROVIDER_ADDRESS', parseEther('1')],
  // IMPORTANT: Gas is charged by gas limit in Monad. Ensure gas limits are reasonable.
  // The operator wallet must have a balance > 10 MON to accommodate Reserve Balance rules.
});
```

### Backend Error Mapping
When calling contract functions, catching Custom Errors accurately translates to better API responses:
- `NotOperator()` → `403 Forbidden: Caller is not the operator.`
- `InsufficientBalance()` → `402 Payment Required: Consumer does not have enough MON.`
- `CallAlreadyExists()` → `409 Conflict: Call ID already utilized.`
- `CallNotReserved()` → `400 Bad Request: Call ID is not in a reserved state.`

## 2. Frontend (Renatha)

The frontend manages consumer-level interactions: mostly depositing and withdrawing native MON.

### Frontend Viem Logic

*(For wallet connection via Privy, verify with Privy docs to retrieve `walletClient`).*

```typescript
// Assuming walletClient is provided by Privy
import { createPublicClient, http, parseEther } from 'viem';

// 1. Read balance
const balance = await publicClient.readContract({
  address: '<TO_BE_FILLED>',
  abi: escrowAbi,
  functionName: 'balances',
  args: [walletClient.account.address]
});

// 2. Deposit Native MON
const depositTx = await walletClient.writeContract({
  address: '<TO_BE_FILLED>',
  abi: escrowAbi,
  functionName: 'deposit',
  value: parseEther('5') 
});

// 3. Withdraw
// IMPORTANT: Do NOT offer "withdraw max balance" unless the wallet has plenty of MON left, 
// because Monad enforces a 10 MON reserve balance. Emptying the wallet will cause execution reversion.
const withdrawTx = await walletClient.writeContract({
  address: '<TO_BE_FILLED>',
  abi: escrowAbi,
  functionName: 'withdraw',
  args: [parseEther('2')]
});
```

### Frontend Error Mapping
- `ZeroAmount()` → "Please enter an amount greater than 0."
- `InsufficientBalance()` → "Your escrow balance is insufficient for this withdrawal."
- `TransferFailed()` → "The withdrawal failed to be processed by the network."

## 3. Indexer (Envio)

*(Verify exact configuration structure with Envio docs).*

To index events reliably on Monad testnet, use the following `config.yaml` parameters (placeholders to be updated post-deploy):

- **Network**: `monad_testnet` (Chain 10143)
- **Start Block**: `<TO_BE_FILLED>`
- **Contract Address**: `<TO_BE_FILLED>`

### Event Signatures
1. `event Deposited(address indexed account, uint256 amount)`
   - Entity logic: Update User entity balance (+).
2. `event Withdrawn(address indexed account, uint256 amount)`
   - Entity logic: Update User entity balance (-).
3. `event Reserved(bytes32 indexed callId, address indexed consumer, address indexed provider, uint256 amount)`
   - Entity logic: Create a Call entity.
4. `event Released(bytes32 indexed callId, address indexed provider, uint256 amount)`
   - Entity logic: Update Call entity status.
5. `event Refunded(bytes32 indexed callId, address indexed consumer, uint256 amount)`
   - Entity logic: Update Call entity status.

## 4. Deployments Output

The file `deployments/monad-testnet.json` serves as the primary artifact for downstream teams (Frontend, Backend, and Indexer). It will contain:
- The deployed contract address.
- The ABI structure.
- The exact transaction hash and block number of deployment.

The structure mimics the output of Foundry deployments.

## Handoff Note Template

```
--- Handoff Note ---
Completed: 
Key Value: 
How to use: 
Unfinished or Risky: 
Interface Changes: 
--------------------
```
