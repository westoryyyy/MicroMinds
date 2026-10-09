// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {Escrow} from "../src/Escrow.sol";

contract DeployEscrow is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address owner = vm.addr(deployerPrivateKey);
        address operator = vm.envOr("OPERATOR_ADDRESS", owner);

        vm.startBroadcast(deployerPrivateKey);
        Escrow escrow = new Escrow(owner, operator);
        vm.stopBroadcast();

        console.log("Escrow deployed at:", address(escrow));
        console.log("Owner:", owner);
        console.log("Operator:", operator);
    }
}
