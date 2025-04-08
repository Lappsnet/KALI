// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/RealEstateERC721.sol";
import "../src/RentableToken.sol";
import "../src/FractionalOwnership.sol";
import "../src/RealEstateSale.sol";
import "../src/LendingProtocol.sol";
import "../src/RentalAgreement.sol";
import "../src/MarketplaceOrchestrator.sol";

contract DeployRentableToken is Script {
    // Contract instances
    RealEstateERC721 public realEstateToken;
    RentableToken public rentableToken;
    FractionalOwnership public fractionalOwnership;
    RealEstateSale public saleContract;
    LendingProtocol public lendingProtocol;
    RentalAgreement public rentalAgreement;
    MarketplaceOrchestrator public marketplaceOrchestrator;
    
    // Configuration parameters
    string public constant REAL_ESTATE_TOKEN_NAME = "Real Estate Token";
    string public constant REAL_ESTATE_TOKEN_SYMBOL = "RET";
    
    string public constant RENTABLE_TOKEN_NAME = "Rentable Token";
    string public constant RENTABLE_TOKEN_SYMBOL = "RENT";
    uint256 public constant INITIAL_TOKEN_PRICE = 0.001 ether; // Initial price per token
    uint256 public constant INITIAL_YIELD_RATE = 500; // 5% annual yield rate
    
    uint256 public constant PLATFORM_FEE_PERCENTAGE = 250; // 2.5% platform fee
    
    uint256 public constant MIN_LOAN_AMOUNT = 1 ether;
    uint256 public constant MAX_LOAN_TO_VALUE_RATIO = 7000; // 70%
    uint256 public constant LIQUIDATION_THRESHOLD = 8500; // 85%
    uint256 public constant LIQUIDATION_PENALTY = 1000; // 10%
    uint256 public constant PROTOCOL_FEE_PERCENTAGE = 200; // 2%
    
    function run() external {
        // For local deployment, we'll use the first account from Anvil
        uint256 deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        
        // The fee collector will be the second account from Anvil
        address feeCollector = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy RealEstateERC721
        console.log("Deploying RealEstateERC721...");
        realEstateToken = new RealEstateERC721(
            REAL_ESTATE_TOKEN_NAME,
            REAL_ESTATE_TOKEN_SYMBOL
        );
        console.log("RealEstateERC721 deployed at:", address(realEstateToken));
        
        // Deploy RentableToken
        console.log("Deploying RentableToken...");
        rentableToken = new RentableToken(
            RENTABLE_TOKEN_NAME,
            RENTABLE_TOKEN_SYMBOL,
            INITIAL_TOKEN_PRICE,
            INITIAL_YIELD_RATE
        );
        console.log("RentableToken deployed at:", address(rentableToken));
        
        // Deploy FractionalOwnership
        console.log("Deploying FractionalOwnership...");
        fractionalOwnership = new FractionalOwnership(
            address(realEstateToken)
        );
        console.log("FractionalOwnership deployed at:", address(fractionalOwnership));
        
        // Deploy RealEstateSale
        console.log("Deploying RealEstateSale...");
        saleContract = new RealEstateSale(
            address(realEstateToken),
            address(rentableToken),
            PLATFORM_FEE_PERCENTAGE,
            feeCollector
        );
        console.log("RealEstateSale deployed at:", address(saleContract));
        
        // Deploy LendingProtocol
        console.log("Deploying LendingProtocol...");
        lendingProtocol = new LendingProtocol(
            address(realEstateToken),
            MIN_LOAN_AMOUNT,
            MAX_LOAN_TO_VALUE_RATIO,
            LIQUIDATION_THRESHOLD,
            LIQUIDATION_PENALTY,
            PROTOCOL_FEE_PERCENTAGE,
            feeCollector
        );
        console.log("LendingProtocol deployed at:", address(lendingProtocol));
        
        // Deploy RentalAgreement
        console.log("Deploying RentalAgreement...");
        rentalAgreement = new RentalAgreement(
            address(realEstateToken)
        );
        console.log("RentalAgreement deployed at:", address(rentalAgreement));
        
        // Deploy MarketplaceOrchestrator
        console.log("Deploying MarketplaceOrchestrator...");
        marketplaceOrchestrator = new MarketplaceOrchestrator(
            address(realEstateToken),
            address(saleContract),
            address(rentableToken),
            address(lendingProtocol),
            address(rentalAgreement)
        );
        console.log("MarketplaceOrchestrator deployed at:", address(marketplaceOrchestrator));
        
        // Create some initial data for testing
        // Mint a property
        uint256 propertyId = realEstateToken.mintProperty(
            0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266, // First Anvil account
            "PROP123",
            "123 Main St, New York",
            100 ether, // Property value: 100 ETH
            "ipfs://property-metadata-uri"
        );
        console.log("Minted property with ID:", propertyId);
        
        // Stop broadcasting transactions
        vm.stopBroadcast();
        
        // Save deployment information to a file
        saveDeployment();
    }
    
    function saveDeployment() internal {
        string memory deploymentInfo = string(abi.encodePacked(
            "RealEstateERC721=", vm.toString(address(realEstateToken)), "\n",
            "RentableToken=", vm.toString(address(rentableToken)), "\n",
            "FractionalOwnership=", vm.toString(address(fractionalOwnership)), "\n",
            "RealEstateSale=", vm.toString(address(saleContract)), "\n",
            "LendingProtocol=", vm.toString(address(lendingProtocol)), "\n",
            "RentalAgreement=", vm.toString(address(rentalAgreement)), "\n",
            "MarketplaceOrchestrator=", vm.toString(address(marketplaceOrchestrator)), "\n"
        ));
        
        // Create deployments directory if it doesn't exist
        vm.createDir("deployments", true);
        vm.writeFile("deployments/local.txt", deploymentInfo);
        console.log("Deployment information saved to deployments/local.txt");
        
        // Also output to console for easy reference
        console.log("\n--- Deployed Contracts ---");
        console.log("RealEstateERC721:", address(realEstateToken));
        console.log("RentableToken:", address(rentableToken));
        console.log("FractionalOwnership:", address(fractionalOwnership));
        console.log("RealEstateSale:", address(saleContract));
        console.log("LendingProtocol:", address(lendingProtocol));
        console.log("RentalAgreement:", address(rentalAgreement));
        console.log("MarketplaceOrchestrator:", address(marketplaceOrchestrator));
    }
}