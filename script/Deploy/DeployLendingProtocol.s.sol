// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {LendingProtocol} from "../src/LendingProtocol.sol";


contract DeployLendingProtocol is Script {

    uint256 public constant MIN_LOAN_AMOUNT = 0.1 ether; 
    uint256 public constant MAX_LOAN_TO_VALUE_RATIO = 7000; // 70%
    uint256 public constant LIQUIDATION_THRESHOLD = 8500; // 85%
    uint256 public constant LIQUIDATION_PENALTY = 1000; // 10%
    uint256 public constant PROTOCOL_FEE_PERCENTAGE = 200; // 2%

    function run() external returns (LendingProtocol) {

        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        if (deployerPrivateKey == 0) {
            revert("PRIVATE_KEY environment variable not set.");
        }

        address realEstateTokenAddress = vm.envAddress("REAL_ESTATE_TOKEN_ADDRESS");
        if (realEstateTokenAddress == address(0)) {
            revert("REAL_ESTATE_TOKEN_ADDRESS environment variable not set.");
        }

        address feeCollectorAddress = vm.envAddress("FEE_COLLECTOR_ADDRESS");
        if (feeCollectorAddress == address(0)) {
            revert("FEE_COLLECTOR_ADDRESS environment variable not set.");
        }

        vm.startBroadcast(deployerPrivateKey);

        console.log("Deploying LendingProtocol with RealEstateERC721 at:", realEstateTokenAddress);
        LendingProtocol lendingProtocol = new LendingProtocol(
            realEstateTokenAddress,
            MIN_LOAN_AMOUNT,
            MAX_LOAN_TO_VALUE_RATIO,
            LIQUIDATION_THRESHOLD,
            LIQUIDATION_PENALTY,
            PROTOCOL_FEE_PERCENTAGE,
            feeCollectorAddress
        );
        console.log("LendingProtocol contract deployed to:", address(lendingProtocol));
        vm.stopBroadcast();

        return lendingProtocol;
      
        string memory deploymentInfo = string(abi.encodePacked(
            "LendingProtocol=", vm.toString(address(lendingProtocol)), "\n"
        ));
        string memory networkName = vm.toString(block.chainid);
        string memory filePath = string(abi.encodePacked("deployments/lending_protocol_", networkName, ".txt"));
        vm.createDir("deployments", true);
        vm.writeFile(filePath, deploymentInfo);
        console.log("Deployment address saved to", filePath);

    }
}
