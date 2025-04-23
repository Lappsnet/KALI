// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import {MarketplaceOrchestrator} from "../src/MarketplaceOrchestrator.sol";

contract DeployMarketplaceOrchestrator is Script {

    function run() external returns (MarketplaceOrchestrator) {

        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        if (deployerPrivateKey == 0) {
            revert("PRIVATE_KEY environment variable not set.");
        }

        // Read constructor arguments from environment variables
        address propertyTokenAddress = vm.envAddress("REAL_ESTATE_TOKEN_ADDRESS");
        if (propertyTokenAddress == address(0)) {
            revert("REAL_ESTATE_TOKEN_ADDRESS environment variable not set.");
        }

        address saleContractAddress = vm.envAddress("REAL_ESTATE_SALE_ADDRESS");
        if (saleContractAddress == address(0)) {
            revert("REAL_ESTATE_SALE_ADDRESS environment variable not set.");
        }

        address rentableTokenAddress = vm.envAddress("RENTABLE_TOKEN_ADDRESS");
         if (rentableTokenAddress == address(0)) {
            revert("RENTABLE_TOKEN_ADDRESS environment variable not set.");
         }

        address lendingProtocolAddress = vm.envAddress("LENDING_PROTOCOL_ADDRESS");
        if (lendingProtocolAddress == address(0)) {
            revert("LENDING_PROTOCOL_ADDRESS environment variable not set.");
        }

        address rentalAgreementAddress = vm.envAddress("RENTAL_AGREEMENT_ADDRESS");
        if (rentalAgreementAddress == address(0)) {
            revert("RENTAL_AGREEMENT_ADDRESS environment variable not set.");
        }

        vm.startBroadcast(deployerPrivateKey);

        console.log("Deploying MarketplaceOrchestrator contract...");
        console.log("  propertyTokenAddress:", propertyTokenAddress);
        console.log("  saleContractAddress:", saleContractAddress);
        console.log("  rentableTokenAddress:", rentableTokenAddress);
        console.log("  lendingProtocolAddress:", lendingProtocolAddress);
        console.log("  rentalAgreementAddress:", rentalAgreementAddress);


        MarketplaceOrchestrator marketplaceOrchestrator = new MarketplaceOrchestrator(
            propertyTokenAddress,
            saleContractAddress,
            rentableTokenAddress,
            lendingProtocolAddress,
            rentalAgreementAddress
        );

        console.log("MarketplaceOrchestrator contract deployed to:", address(marketplaceOrchestrator));
        console.log("Please save this address for future use!");

        vm.stopBroadcast();

        return marketplaceOrchestrator;
    }
}
