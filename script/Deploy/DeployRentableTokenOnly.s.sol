// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import {RentableToken} from "../src/RentableToken.sol";

contract DeployRentableTokenOnly is Script {
    string public constant RENTABLE_TOKEN_NAME = "Rentable Token";
    string public constant RENTABLE_TOKEN_SYMBOL = "RENT";
    uint256 public constant INITIAL_TOKEN_PRICE = 0.001 ether; // Initial price per token
    uint256 public constant INITIAL_YIELD_RATE = 500; // 5% annual yield rate

    function run() external returns (RentableToken) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        if (deployerPrivateKey == 0) {
            revert("PRIVATE_KEY environment variable not set.");
        }

        vm.startBroadcast(deployerPrivateKey);

        console.log("Deploying RentableToken contract...");
        console.log("_name:", RENTABLE_TOKEN_NAME);
        console.log("_symbol:", RENTABLE_TOKEN_SYMBOL);
        console.log("_initialTokenPrice:", INITIAL_TOKEN_PRICE);
        console.log("_initialYieldRate:", INITIAL_YIELD_RATE);

        RentableToken rentableToken = new RentableToken(
            RENTABLE_TOKEN_NAME,
            RENTABLE_TOKEN_SYMBOL,
            INITIAL_TOKEN_PRICE,
            INITIAL_YIELD_RATE
        );

        console.log("RentableToken contract deployed to:", address(rentableToken));
        console.log("Please save this address for future use!");
        vm.stopBroadcast();

        return rentableToken;
    }
}
