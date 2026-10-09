// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IEscrow} from "./interfaces/IEscrow.sol";

/// @title MicroMinds Escrow
/// @notice Holds native token (MON) deposits for consumers, allows an operator to
///         reserve funds per API call, then release to provider or refund to consumer.
///         Consumers and providers withdraw their own balances (pull-over-push).
/// @dev    Deployed on Monad testnet (chain 10143). No ERC-20, no proxy, no pause.
contract Escrow is Ownable, ReentrancyGuard, IEscrow {
    // ──────────────────────────── State ─────────────────────────────

    /// @notice Withdrawable balance per account (consumer or provider).
    mapping(address => uint256) public balances;

    /// @notice Escrow records keyed by caller-generated call ID.
    mapping(bytes32 => Call) public calls;

    /// @notice Wallet authorized to reserve, release, and refund.
    address public operator;

    // ──────────────────────── Constructor ───────────────────────────

    /// @param initialOwner   Address that will own this contract (can change operator).
    /// @param initialOperator Address authorized to reserve / release / refund.
    constructor(address initialOwner, address initialOperator) Ownable(initialOwner) {
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
    function deposit() external payable override {
        if (msg.value == 0) revert ZeroAmount();
        balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    /// @notice Withdraw native token from the caller's escrow balance.
    /// @param amount Amount of native token to withdraw (must be > 0).
    function withdraw(uint256 amount) external override nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (balances[msg.sender] < amount) revert InsufficientBalance();

        balances[msg.sender] -= amount;
        emit Withdrawn(msg.sender, amount);

        (bool success,) = msg.sender.call{value: amount}("");
        if (!success) revert TransferFailed();
    }

    /// @notice Reserve funds from a consumer's balance for an API call.
    /// @param callId   Unique identifier for the API call (generated off-chain).
    /// @param consumer Address of the consumer whose balance is debited.
    /// @param provider Address of the provider who will receive payment on release.
    /// @param amount   Amount of native token to reserve (must be > 0).
    function reserve(bytes32 callId, address consumer, address provider, uint256 amount)
        external
        override
        onlyOperator
    {
        if (amount == 0) revert ZeroAmount();
        if (consumer == address(0) || provider == address(0)) revert ZeroAddress();
        if (calls[callId].status != Status.None) revert CallAlreadyExists();
        if (balances[consumer] < amount) revert InsufficientBalance();

        balances[consumer] -= amount;
        calls[callId] = Call({consumer: consumer, provider: provider, amount: amount, status: Status.Reserved});

        emit Reserved(callId, consumer, provider, amount);
    }

    /// @notice Release reserved funds to the provider after successful API call.
    /// @param callId Identifier of a call in Reserved status.
    function release(bytes32 callId) external override onlyOperator {
        Call storage c = calls[callId];
        if (c.status != Status.Reserved) revert CallNotReserved();

        c.status = Status.Released;
        balances[c.provider] += c.amount;

        emit Released(callId, c.provider, c.amount);
    }

    /// @notice Refund reserved funds to the consumer after a failed API call.
    /// @param callId Identifier of a call in Reserved status.
    function refund(bytes32 callId) external override onlyOperator {
        Call storage c = calls[callId];
        if (c.status != Status.Reserved) revert CallNotReserved();

        c.status = Status.Refunded;
        balances[c.consumer] += c.amount;

        emit Refunded(callId, c.consumer, c.amount);
    }

    /// @notice Transfer operator role to a new address. Only callable by owner.
    /// @param newOperator The new operator address (must not be zero).
    function setOperator(address newOperator) external override onlyOwner {
        if (newOperator == address(0)) revert ZeroAddress();
        address oldOperator = operator;
        operator = newOperator;
        emit OperatorUpdated(oldOperator, newOperator);
    }

    /// @notice Retrieve the full Call struct for a given call ID.
    /// @param callId The call identifier to look up.
    /// @return The Call struct (consumer, status, provider, amount).
    function getCall(bytes32 callId) external view override returns (Call memory) {
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
