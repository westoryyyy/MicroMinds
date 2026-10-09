/**
 * Escrow contract ABI — only the functions and events called by the gateway.
 * Interface is locked per spec; do not modify without team confirmation.
 *
 * Functions (operator-only unless noted):
 *   deposit() payable
 *   withdraw(uint256 amount)
 *   reserve(bytes32 callId, address consumer, address provider, uint256 amount) [onlyOperator]
 *   release(bytes32 callId) [onlyOperator]
 *   refund(bytes32 callId)  [onlyOperator]
 *   balances(address account) view -> uint256
 *
 * Events:
 *   Deposited(address indexed account, uint256 amount)
 *   Withdrawn(address indexed account, uint256 amount)
 *   Reserved(bytes32 indexed callId, address indexed consumer, address indexed provider, uint256 amount)
 *   Released(bytes32 indexed callId, address indexed provider, uint256 amount)
 *   Refunded(bytes32 indexed callId, address indexed consumer, uint256 amount)
 */
export const ESCROW_ABI = [
  // ── State-changing (operator) ───────────────────────────────────────────────
  {
    name: 'reserve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'callId', type: 'bytes32' },
      { name: 'consumer', type: 'address' },
      { name: 'provider', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'release',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'callId', type: 'bytes32' }],
    outputs: [],
  },
  {
    name: 'refund',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'callId', type: 'bytes32' }],
    outputs: [],
  },
  // ── View ────────────────────────────────────────────────────────────────────
  {
    name: 'balances',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  // ── Events ──────────────────────────────────────────────────────────────────
  {
    name: 'Reserved',
    type: 'event',
    inputs: [
      { name: 'callId', type: 'bytes32', indexed: true },
      { name: 'consumer', type: 'address', indexed: true },
      { name: 'provider', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'Released',
    type: 'event',
    inputs: [
      { name: 'callId', type: 'bytes32', indexed: true },
      { name: 'provider', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'Refunded',
    type: 'event',
    inputs: [
      { name: 'callId', type: 'bytes32', indexed: true },
      { name: 'consumer', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'Deposited',
    type: 'event',
    inputs: [
      { name: 'account', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'Withdrawn',
    type: 'event',
    inputs: [
      { name: 'account', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
] as const;
