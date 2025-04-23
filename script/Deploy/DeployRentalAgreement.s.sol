// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {RentalAgreement} from "../src/RentalAgreement.sol";
import {console} from "forge-std/console.sol"; // Import console for logging

contract DeployRentalAgreement is Script {

    function run() external returns (RentalAgreement) {

        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        if (deployerPrivateKey == 0) {
            revert("PRIVATE_KEY environment variable not set.");
        }

        address realEstateTokenAddress = vm.envAddress("REAL_ESTATE_TOKEN_ADDRESS");
        if (realEstateTokenAddress == address(0)) {
            revert("REAL_ESTATE_TOKEN_ADDRESS environment variable not set.");
        }

        vm.startBroadcast(deployerPrivateKey);

        console.log("Deploying RentalAgreement with RealEstateERC721 at:", realEstateTokenAddress);
        RentalAgreement rentalAgreement = new RentalAgreement(
            realEstateTokenAddress
        );
        console.log("RentalAgreement contract deployed to:", address(rentalAgreement));

        vm.stopBroadcast();
        return rentalAgreement;
    }
}
