// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {Escrow} from "../src/Escrow.sol";
import {IEscrow} from "../src/interfaces/IEscrow.sol";

contract Attacker {
    Escrow public escrow;
    bool public isAttacking;

    constructor(Escrow _escrow) {
        escrow = _escrow;
    }

    receive() external payable {
        if (isAttacking) {
            isAttacking = false; // Prevent infinite loop, only reenter once
            escrow.withdraw(msg.value);
        }
    }

    function attackDeposit() external payable {
        escrow.deposit{value: msg.value}();
    }

    function attackWithdraw(uint256 amount) external {
        isAttacking = true;
        escrow.withdraw(amount);
    }
}

contract EscrowTest is Test {
    Escrow public escrow;

    address public owner = address(1);
    address public operator = address(2);
    address public consumer = address(3);
    address public provider = address(4);

    event Deposited(address indexed account, uint256 amount);
    event Withdrawn(address indexed account, uint256 amount);
    event Reserved(bytes32 indexed callId, address indexed consumer, address indexed provider, uint256 amount);
    event Released(bytes32 indexed callId, address indexed provider, uint256 amount);
    event Refunded(bytes32 indexed callId, address indexed consumer, uint256 amount);
    event OperatorUpdated(address indexed oldOperator, address indexed newOperator);

    function setUp() public {
        vm.prank(owner);
        escrow = new Escrow(owner, operator);
        vm.deal(consumer, 100 ether);
    }

    // ─── INIT ───
    function test_Init_RevertsZeroOperator() public {
        vm.expectRevert(IEscrow.ZeroAddress.selector);
        new Escrow(owner, address(0));
    }

    // ─── DEPOSIT ───
    function test_Deposit_Success() public {
        vm.prank(consumer);
        vm.expectEmit(true, false, false, true);
        emit Deposited(consumer, 10 ether);
        escrow.deposit{value: 10 ether}();
        assertEq(escrow.balances(consumer), 10 ether);
        assertEq(address(escrow).balance, 10 ether);
    }

    function test_Deposit_RevertsZeroAmount() public {
        vm.prank(consumer);
        vm.expectRevert(IEscrow.ZeroAmount.selector);
        escrow.deposit{value: 0}();
    }

    function test_DirectPaymentNotAllowed() public {
        vm.prank(consumer);
        vm.expectRevert(IEscrow.DirectPaymentNotAllowed.selector);
        (bool success,) = address(escrow).call{value: 1 ether}("");
        require(success, "Call failed but not reverted as expected");
    }

    // ─── WITHDRAW ───
    function test_Withdraw_Success() public {
        vm.startPrank(consumer);
        escrow.deposit{value: 10 ether}();

        vm.expectEmit(true, false, false, true);
        emit Withdrawn(consumer, 4 ether);
        escrow.withdraw(4 ether);
        vm.stopPrank();

        assertEq(escrow.balances(consumer), 6 ether);
        assertEq(consumer.balance, 94 ether); // 100 - 10 + 4
        assertEq(address(escrow).balance, 6 ether);
    }

    function test_Withdraw_RevertsZeroAmount() public {
        vm.expectRevert(IEscrow.ZeroAmount.selector);
        escrow.withdraw(0);
    }

    function test_Withdraw_RevertsInsufficientBalance() public {
        vm.prank(consumer);
        escrow.deposit{value: 10 ether}();

        vm.prank(consumer);
        vm.expectRevert(IEscrow.InsufficientBalance.selector);
        escrow.withdraw(11 ether);
    }

    // ─── REENTRANCY ───
    function test_Withdraw_RevertsOnReentrancy() public {
        Attacker attacker = new Attacker(escrow);
        vm.deal(address(attacker), 10 ether);

        attacker.attackDeposit{value: 10 ether}();

        // The inner reentrant call reverts with ReentrancyGuardReentrantCall,
        // which causes the outer .call to fail and revert with TransferFailed.
        vm.expectRevert(IEscrow.TransferFailed.selector);
        attacker.attackWithdraw(10 ether);
    }

    // ─── RESERVE ───
    function test_Reserve_Success() public {
        vm.prank(consumer);
        escrow.deposit{value: 10 ether}();

        bytes32 callId = keccak256("call1");

        vm.prank(operator);
        vm.expectEmit(true, true, true, true);
        emit Reserved(callId, consumer, provider, 5 ether);
        escrow.reserve(callId, consumer, provider, 5 ether);

        assertEq(escrow.balances(consumer), 5 ether);
        IEscrow.Call memory c = escrow.getCall(callId);
        assertEq(c.consumer, consumer);
        assertEq(c.provider, provider);
        assertEq(c.amount, 5 ether);
        assertEq(uint256(c.status), uint256(IEscrow.Status.Reserved));
    }

    function test_Reserve_RevertsNotOperator() public {
        vm.expectRevert(IEscrow.NotOperator.selector);
        escrow.reserve(keccak256("call1"), consumer, provider, 5 ether);
    }

    function test_Reserve_RevertsZeroAmount() public {
        vm.prank(operator);
        vm.expectRevert(IEscrow.ZeroAmount.selector);
        escrow.reserve(keccak256("call1"), consumer, provider, 0);
    }

    function test_Reserve_RevertsZeroAddress() public {
        vm.startPrank(operator);
        vm.expectRevert(IEscrow.ZeroAddress.selector);
        escrow.reserve(keccak256("call1"), address(0), provider, 5 ether);

        vm.expectRevert(IEscrow.ZeroAddress.selector);
        escrow.reserve(keccak256("call2"), consumer, address(0), 5 ether);
        vm.stopPrank();
    }

    function test_Reserve_RevertsAlreadyExists() public {
        vm.prank(consumer);
        escrow.deposit{value: 10 ether}();

        bytes32 callId = keccak256("call1");
        vm.startPrank(operator);
        escrow.reserve(callId, consumer, provider, 5 ether);

        vm.expectRevert(IEscrow.CallAlreadyExists.selector);
        escrow.reserve(callId, consumer, provider, 5 ether);
        vm.stopPrank();
    }

    function test_Reserve_RevertsInsufficientBalance() public {
        vm.prank(consumer);
        escrow.deposit{value: 4 ether}();

        bytes32 callId = keccak256("call1");
        vm.prank(operator);
        vm.expectRevert(IEscrow.InsufficientBalance.selector);
        escrow.reserve(callId, consumer, provider, 5 ether);
    }

    // ─── RELEASE ───
    function test_Release_Success() public {
        vm.prank(consumer);
        escrow.deposit{value: 10 ether}();

        bytes32 callId = keccak256("call1");
        vm.startPrank(operator);
        escrow.reserve(callId, consumer, provider, 5 ether);

        vm.expectEmit(true, true, false, true);
        emit Released(callId, provider, 5 ether);
        escrow.release(callId);
        vm.stopPrank();

        assertEq(escrow.balances(provider), 5 ether);
        IEscrow.Call memory c = escrow.getCall(callId);
        assertEq(uint256(c.status), uint256(IEscrow.Status.Released));
    }

    function test_Release_RevertsNotReserved() public {
        bytes32 callId = keccak256("call1");
        vm.prank(operator);
        vm.expectRevert(IEscrow.CallNotReserved.selector);
        escrow.release(callId);
    }

    // ─── REFUND ───
    function test_Refund_Success() public {
        vm.prank(consumer);
        escrow.deposit{value: 10 ether}();

        bytes32 callId = keccak256("call1");
        vm.startPrank(operator);
        escrow.reserve(callId, consumer, provider, 5 ether);

        vm.expectEmit(true, true, false, true);
        emit Refunded(callId, consumer, 5 ether);
        escrow.refund(callId);
        vm.stopPrank();

        assertEq(escrow.balances(consumer), 10 ether);
        IEscrow.Call memory c = escrow.getCall(callId);
        assertEq(uint256(c.status), uint256(IEscrow.Status.Refunded));
    }

    // ─── SET OPERATOR ───
    function test_SetOperator_Success() public {
        vm.prank(owner);
        vm.expectEmit(true, true, false, false);
        emit OperatorUpdated(operator, address(5));
        escrow.setOperator(address(5));
        assertEq(escrow.operator(), address(5));
    }

    function test_SetOperator_RevertsNotOwner() public {
        vm.prank(operator);
        // Expect OpenZeppelin 5.0 custom error OwnableUnauthorizedAccount
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", operator));
        escrow.setOperator(address(5));
    }

    function test_SetOperator_RevertsZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(IEscrow.ZeroAddress.selector);
        escrow.setOperator(address(0));
    }

    // ─── FUZZ TESTS ───
    function testFuzz_Deposit(uint256 amount) public {
        vm.assume(amount > 0);
        vm.assume(amount < 1_000_000 ether); // prevent max value overflow in dealing
        vm.deal(consumer, amount);

        vm.prank(consumer);
        escrow.deposit{value: amount}();
        assertEq(escrow.balances(consumer), amount);
        assertEq(address(escrow).balance, amount);
    }

    function testFuzz_Withdraw(uint256 amount) public {
        vm.assume(amount > 0);
        vm.assume(amount < 1_000_000 ether);
        vm.deal(consumer, amount);

        vm.startPrank(consumer);
        escrow.deposit{value: amount}();
        escrow.withdraw(amount);
        vm.stopPrank();

        assertEq(escrow.balances(consumer), 0);
        assertEq(consumer.balance, amount);
    }
}
