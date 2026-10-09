// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {Escrow} from "../src/Escrow.sol";

contract SmokeTest is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address user = vm.addr(pk);

        address escrowAddr = vm.envAddress("ESCROW_ADDRESS");
        Escrow escrow = Escrow(payable(escrowAddr));

        console.log("Running smoke test on Escrow at", escrowAddr);
        console.log("Caller:", user);

        vm.startBroadcast(pk);

        uint256 depositAmt = 0.01 ether;

        console.log("1. Depositing", depositAmt, "MON...");
        escrow.deposit{value: depositAmt}();

        uint256 bal = escrow.balances(user);
        console.log("   -> Balance after deposit:", bal);
        require(bal >= depositAmt, "Deposit failed");

        console.log("2. Withdrawing", depositAmt, "MON...");
        escrow.withdraw(depositAmt);

        uint256 balAfter = escrow.balances(user);
        console.log("   -> Balance after withdraw:", balAfter);
        require(balAfter == bal - depositAmt, "Withdraw failed");

        vm.stopBroadcast();

        console.log("Smoke test passed \xE2\x9C\x85");
    }
}
