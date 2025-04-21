// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {RealEstateERC721} from "../src/RealEstateERC721.sol"; 

contract DeployRealEstateERC721 is Script {

    string public constant TOKEN_NAME = "Kali Real Estate"; 
    string public constant TOKEN_SYMBOL = "KRE"; 

    function run() external returns (RealEstateERC721) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        if (deployerPrivateKey == 0) {
            revert("PRIVATE_KEY environment variable not set.");
        }

        vm.startBroadcast(deployerPrivateKey);

        RealEstateERC721 realEstateToken = new RealEstateERC721(
            TOKEN_NAME,
            TOKEN_SYMBOL
        );
        console.log("RealEstateERC721 contract deployed to:", address(realEstateToken));

        vm.stopBroadcast();

        return realEstateToken;

        string memory deploymentInfo = string(abi.encodePacked(
            "RealEstateERC721=", vm.toString(address(realEstateToken)), "\n"
        ));
        string memory networkName = vm.toString(block.chainid); 
        string memory filePath = string(abi.encodePacked("deployments/", networkName, ".txt"));
        vm.createDir("deployments", true); 
        vm.writeFile(filePath, deploymentInfo);
        console.log("Deployment address saved to", filePath);
    
    }
}

