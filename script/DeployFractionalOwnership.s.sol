// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import {FractionalOwnership} from "../src/FractionalOwnership.sol"; // Assuming FractionalOwnership is in src/

contract DeployFractionalOwnership is Script {

    function run() external returns (FractionalOwnership) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        if (deployerPrivateKey == 0) {
            revert("PRIVATE_KEY environment variable not set.");
        }

        // Read constructor argument from environment variable
        address propertyTokenAddress = vm.envAddress("REAL_ESTATE_TOKEN_ADDRESS");
        if (propertyTokenAddress == address(0)) {
             revert("REAL_ESTATE_TOKEN_ADDRESS environment variable not set or is zero address.");
        }

        vm.startBroadcast(deployerPrivateKey);

        console.log("Deploying FractionalOwnership contract...");
        console.log("  _propertyTokenAddress:", propertyTokenAddress);

        FractionalOwnership fractionalOwnership = new FractionalOwnership(
            propertyTokenAddress
        );

        console.log("FractionalOwnership contract deployed to:", address(fractionalOwnership));
        console.log("Please save this address for future use!");

        vm.stopBroadcast();

        // Removed the file writing section due to permissions errors.
        // The deployed address will be printed to the console above.

        return fractionalOwnership;
    }
}
