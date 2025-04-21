// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import {RealEstateSale} from "../src/RealEstateSale.sol";
// Although imported in the original, RealEstateERC721 and RentableToken
// are not directly used in the run function of this deployment script,
// only their addresses are passed to the constructor of RealEstateSale.
// import {RealEstateERC721} from "../src/RealEstateERC721.sol";
// import {RentableToken} from "../src/RentableToken.sol";


contract DeployRealEstateSale is Script {

    // Keeping this constant as it was in your original script,
    // but the script will prioritize the environment variable if set.
    uint256 public constant DEFAULT_PLATFORM_FEE_PERCENTAGE = 250; // 2.5% in basis points

    function run() external returns (RealEstateSale) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        if (deployerPrivateKey == 0) {
            revert("PRIVATE_KEY environment variable not set.");
        }

        // Read constructor arguments from environment variables
        address propertyTokenAddress = vm.envAddress("REAL_ESTATE_TOKEN_ADDRESS");
        if (propertyTokenAddress == address(0)) {
             revert("REAL_ESTATE_TOKEN_ADDRESS environment variable not set or is zero address.");
        }

        // RentableToken address is optional (can be address(0))
        address rentableTokenAddress = vm.envAddress("RENTABLE_TOKEN_ADDRESS");
        // No revert here, as it's allowed to be address(0)

        address feeCollectorAddress = vm.envAddress("FEE_COLLECTOR_ADDRESS");
         if (feeCollectorAddress == address(0)) {
             revert("FEE_COLLECTOR_ADDRESS environment variable not set or is zero address.");
        }

        // Determine platform fee percentage, prioritizing environment variable
        uint256 platformFeePercentage = DEFAULT_PLATFORM_FEE_PERCENTAGE;
        string memory customFee = vm.envString("PLATFORM_FEE_PERCENTAGE");
        if (bytes(customFee).length > 0) {
            platformFeePercentage = vm.parseUint(customFee);
        }

        // Validate fee percentage based on contract's requirement (<= 1000 basis points)
        if (platformFeePercentage > 1000) {
             revert("PLATFORM_FEE_PERCENTAGE too high (>1000 basis points).");
        }


        vm.startBroadcast(deployerPrivateKey);

        console.log("Deploying RealEstateSale contract...");
        console.log("  _propertyToken:", propertyTokenAddress);
        console.log("  _rentableToken:", rentableTokenAddress);
        console.log("  _platformFeePercentage (bp):", platformFeePercentage);
        console.log("  _feeCollector:", feeCollectorAddress);

        RealEstateSale realEstateSale = new RealEstateSale(
            propertyTokenAddress,
            rentableTokenAddress,
            platformFeePercentage,
            feeCollectorAddress
        );

        console.log("RealEstateSale contract deployed to:", address(realEstateSale));
        console.log("Please save this address for future use!");

        vm.stopBroadcast();

        return realEstateSale;
    }
}
