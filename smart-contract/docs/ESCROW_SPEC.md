# MicroMinds Escrow Contract Specification

## 1. Overview
A *Pull-over-Push* based escrow system that accepts native token (MON) deposits. This contract allows an Operator to reserve, release, or refund funds for API Calls, while the participating entities (Consumers/Providers) handle their own withdrawals independently.

## 2. Data Structures and States
### 2.1 API Call State Machine (`Status` enum)
- `None` (0): The call ID has never been used or does not exist.
- `Reserved` (1): Funds have been successfully allocated and are awaiting resolution.
- `Released` (2): The API execution was successful; funds are forwarded to the Provider.
- `Refunded` (3): The API execution failed; funds are returned to the Consumer.

### 2.2 Call Entity (`struct Call`)
```solidity
struct Call {
    address consumer;
    address provider;
    uint256 amount;
    Status status;
    uint256 expiry;
}
```

## 3. Functions & Input Validation

### Public Functions for Users
1. **`deposit()`** `payable`
   - Adds `msg.value` to the native token balance of the sender (`msg.sender`).
2. **`withdraw(uint256 amount)`**
   - Validation: `amount > 0` (reverts with `ZeroAmount()`).
   - Validation: `balances[msg.sender] >= amount` (reverts with `InsufficientBalance()`).
   - Applies CEI (Checks-Effects-Interactions) pattern guarded by `nonReentrant`.
   - Reverts with `TransferFailed()` if `call{value: amount}("")` fails.
3. **`forceRefund(bytes32 callId)`**
   - Can only be called by the Consumer (`NotConsumer()`).
   - Returns stuck funds in `Reserved` status (`CallNotReserved()`) if the `expiry` time has passed (`CallNotExpired()`).

### Operator Functions
1. **`reserve(bytes32 callId, address consumer, address provider, uint256 amount)`**
   - Can only be called by the Operator (`NotOperator()`).
   - Input validation:
     - `amount > 0` (`ZeroAmount()`)
     - `consumer` and `provider` must not be `address(0)` (`ZeroAddress()`)
     - `calls[callId].status` must be `None` (`CallAlreadyExists()`)
   - Business validation: Consumer's balance must be >= amount (`InsufficientBalance()`).
   - Deducts consumer's balance, stores the struct, and sets `expiry` to `block.timestamp + 1 days`.
2. **`release(bytes32 callId)`**
   - Operator only.
   - `calls[callId].status` must be `Reserved` (`CallNotReserved()`).
   - Changes status to `Released` and adds `amount` to `balances[provider]`.
3. **`refund(bytes32 callId)`**
   - Operator only.
   - `calls[callId].status` must be `Reserved` (`CallNotReserved()`).
   - Changes status to `Refunded` and returns `amount` to `balances[consumer]`.

### Admin (Owner) Functions
1. **`setOperator(address newOperator)`**
   - Can only be called by the Owner (OpenZeppelin Ownable).
   - Validation: `newOperator != address(0)` (`ZeroAddress()`).
   - Updates the `operator` state variable.

## 4. Custom Errors
To optimize gas costs, custom Solidity errors are utilized instead of require strings.
1. `NotOperator()`: The caller is not the operator.
2. `ZeroAmount()`: The deposit/withdraw/reserve amount is 0.
3. `InsufficientBalance()`: The consumer's balance is insufficient during reserve/withdraw.
4. `CallAlreadyExists()`: The `callId` used for reserve is no longer `None`.
5. `CallNotReserved()`: Attempting to release/refund a call that is not reserved.
6. `ZeroAddress()`: The input address (operator/consumer/provider) is the zero address.
7. `TransferFailed()`: Native token transfer failed during withdrawal.
8. `DirectPaymentNotAllowed()`: A user attempted to send funds without calling `deposit()`.
9. `CallNotExpired()`: A user attempted to call `forceRefund` before the expiry time elapsed (1 day).
10. `NotConsumer()`: The caller of a consumer-protected function is not the authorized consumer.

## 5. Events
1. `Deposited(address indexed account, uint256 amount)`
2. `Withdrawn(address indexed account, uint256 amount)`
3. `Reserved(bytes32 indexed callId, address indexed consumer, address indexed provider, uint256 amount)`
4. `Released(bytes32 indexed callId, address indexed provider, uint256 amount)`
5. `Refunded(bytes32 indexed callId, address indexed consumer, uint256 amount)`
6. `RefundedForcibly(bytes32 indexed callId, address indexed consumer, uint256 amount)`
7. `OperatorUpdated(address indexed oldOperator, address indexed newOperator)`
   - *Note:* The `OperatorUpdated` event was added for internal tracking convenience and is not strictly required to be indexed by Envio handlers.

## 6. Security Defenses
- **Reject Direct Payments**: Implemented `receive()` and `fallback()` functions that always revert (`DirectPaymentNotAllowed()`).
- **No ERC-20 / Pausable**: The design is kept as minimal as possible to reduce attack vectors.
- **Reentrancy**: Protected by the `nonReentrant` modifier, specifically on the fund exit path `withdraw()`.
