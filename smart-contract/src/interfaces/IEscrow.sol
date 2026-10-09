// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title MicroMinds Escrow Interface
/// @notice Interface containing all external functions, events, errors, and data structures.
interface IEscrow {
    // ──────────────────────────── Errors ────────────────────────────

    /// @notice Caller is not the designated operator.
    error NotOperator();

    /// @notice Supplied amount is zero.
    error ZeroAmount();

    /// @notice Account balance is too low for the requested operation.
    error InsufficientBalance();

    /// @notice A call record with this ID already exists.
    error CallAlreadyExists();

    /// @notice The call record is not in Reserved status.
    error CallNotReserved();

    /// @notice Provided address is the zero address.
    error ZeroAddress();

    /// @notice Native token transfer via call{value}() failed.
    error TransferFailed();

    /// @notice Direct MON transfers (without calling deposit) are not allowed.
    error DirectPaymentNotAllowed();

    /// @notice The call has not reached its expiry time yet.
    error CallNotExpired();

    /// @notice Caller is not the consumer of this call.
    error NotConsumer();

    // ──────────────────────────── Types ─────────────────────────────

    /// @notice Lifecycle status of an API call escrow.
    enum Status {
        None,
        Reserved,
        Released,
        Refunded
    }

    /// @notice On-chain record of a single API call escrow.
    struct Call {
        address consumer;
        address provider;
        uint256 amount;
        Status status;
        uint256 expiry; // Timestamp when the consumer can forcefully refund
    }

    // ──────────────────────────── Events ────────────────────────────

    /// @notice Emitted when an account deposits native token.
    event Deposited(address indexed account, uint256 amount);

    /// @notice Emitted when an account withdraws native token.
    event Withdrawn(address indexed account, uint256 amount);

    /// @notice Emitted when the operator reserves funds for an API call.
    event Reserved(bytes32 indexed callId, address indexed consumer, address indexed provider, uint256 amount);

    /// @notice Emitted when the operator releases escrowed funds to the provider.
    event Released(bytes32 indexed callId, address indexed provider, uint256 amount);

    /// @notice Emitted when the operator refunds escrowed funds to the consumer.
    event Refunded(bytes32 indexed callId, address indexed consumer, uint256 amount);

    /// @notice Emitted when a consumer forcefully refunds after expiry.
    event RefundedForcibly(bytes32 indexed callId, address indexed consumer, uint256 amount);

    /// @notice Emitted when the owner changes the operator address.
    event OperatorUpdated(address indexed oldOperator, address indexed newOperator);

    // ────────────────────────── Functions ───────────────────────────

    function deposit() external payable;
    function withdraw(uint256 amount) external;
    function reserve(bytes32 callId, address consumer, address provider, uint256 amount) external;
    function release(bytes32 callId) external;
    function refund(bytes32 callId) external;
    function forceRefund(bytes32 callId) external;
    function setOperator(address newOperator) external;
    function getCall(bytes32 callId) external view returns (Call memory);
}
