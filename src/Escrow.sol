// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title MicroMinds Escrow
/// @notice Holds native token (MON) deposits for consumers, allows an operator to
///         reserve funds per API call, then release to provider or refund to consumer.
///         Consumers and providers withdraw their own balances (pull-over-push).
/// @dev    Deployed on Monad testnet (chain 10143). No ERC-20, no proxy, no pause.
contract Escrow is Ownable, ReentrancyGuard {
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
    }

    // ──────────────────────────── State ─────────────────────────────

    /// @notice Withdrawable balance per account (consumer or provider).
    mapping(address => uint256) public balances;

    /// @notice Escrow records keyed by caller-generated call ID.
    mapping(bytes32 => Call) public calls;

    /// @notice Wallet authorized to reserve, release, and refund.
    address public operator;

    // ──────────────────────────── Events ────────────────────────────

    /// @notice Emitted when an account deposits native token.
    event Deposited(address indexed account, uint256 amount);

    /// @notice Emitted when an account withdraws native token.
    event Withdrawn(address indexed account, uint256 amount);

    /// @notice Emitted when the operator reserves funds for an API call.
    event Reserved(
        bytes32 indexed callId,
        address indexed consumer,
        address indexed provider,
        uint256 amount
    );

    /// @notice Emitted when the operator releases escrowed funds to the provider.
    event Released(bytes32 indexed callId, address indexed provider, uint256 amount);

    /// @notice Emitted when the operator refunds escrowed funds to the consumer.
    event Refunded(bytes32 indexed callId, address indexed consumer, uint256 amount);

    /// @notice Emitted when the owner changes the operator address.
    /// @dev    Not consumed by Envio indexer (addition beyond SKPL). Envio handles
    ///         the five events above only.
    event OperatorUpdated(address indexed oldOperator, address indexed newOperator);

    // ──────────────────────── Constructor ───────────────────────────

    /// @param initialOwner   Address that will own this contract (can change operator).
    /// @param initialOperator Address authorized to reserve / release / refund.
    constructor(address initialOwner, address initialOperator)
        Ownable(initialOwner)
    {
        if (initialOperator == address(0)) revert ZeroAddress();
        operator = initialOperator;
        emit OperatorUpdated(address(0), initialOperator);
    }

    // ──────────────────────── Modifiers ─────────────────────────────

    /// @dev Reverts if caller is not the current operator.
    modifier onlyOperator() {
        if (msg.sender != operator) revert NotOperator();
        _;
    }

    // ──────────────────────── Functions ─────────────────────────────

    /// @notice Deposit native token (MON) into the caller's escrow balance.
    function deposit() external payable {
        revert("TODO");
    }

    /// @notice Withdraw native token from the caller's escrow balance.
    /// @param amount Amount of native token to withdraw (must be > 0).
    function withdraw(uint256 amount) external nonReentrant {
        revert("TODO");
    }

    /// @notice Reserve funds from a consumer's balance for an API call.
    /// @param callId   Unique identifier for the API call (generated off-chain).
    /// @param consumer Address of the consumer whose balance is debited.
    /// @param provider Address of the provider who will receive payment on release.
    /// @param amount   Amount of native token to reserve (must be > 0).
    function reserve(
        bytes32 callId,
        address consumer,
        address provider,
        uint256 amount
    ) external onlyOperator {
        revert("TODO");
    }

    /// @notice Release reserved funds to the provider after successful API call.
    /// @param callId Identifier of a call in Reserved status.
    function release(bytes32 callId) external onlyOperator {
        revert("TODO");
    }

    /// @notice Refund reserved funds to the consumer after a failed API call.
    /// @param callId Identifier of a call in Reserved status.
    function refund(bytes32 callId) external onlyOperator {
        revert("TODO");
    }

    /// @notice Transfer operator role to a new address. Only callable by owner.
    /// @param newOperator The new operator address (must not be zero).
    function setOperator(address newOperator) external onlyOwner {
        revert("TODO");
    }

    /// @notice Retrieve the full Call struct for a given call ID.
    /// @param callId The call identifier to look up.
    /// @return The Call struct (consumer, status, provider, amount).
    function getCall(bytes32 callId) external view returns (Call memory) {
        return calls[callId];
    }

    // ─────────────────── Reject direct transfers ───────────────────

    /// @dev Reverts on plain MON transfers (no calldata, or unknown selector).
    receive() external payable {
        revert DirectPaymentNotAllowed();
    }

    fallback() external payable {
        revert DirectPaymentNotAllowed();
    }
}
