// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {DeployRentableToken} from "../script/DeployRentableToken.s.sol";
import {RealEstateERC721} from "../src/RealEstateERC721.sol";
import {RentableToken} from "../src/RentableToken.sol";
import {FractionalOwnership} from "../src/FractionalOwnership.sol";
import {RealEstateSale} from "../src/RealEstateSale.sol";
import {LendingProtocol} from "../src/LendingProtocol.sol";
import {RentalAgreement} from "../src/RentalAgreement.sol";
import {MarketplaceOrchestrator} from "../src/MarketplaceOrchestrator.sol";

contract DeployRentableTokenTest is Test {
    DeployRentableToken public deployer;
    
    // Contract instances
    RealEstateERC721 public realEstateToken;
    RentableToken public rentableToken;
    FractionalOwnership public fractionalOwnership;
    RealEstateSale public saleContract;
    LendingProtocol public lendingProtocol;
    RentalAgreement public rentalAgreement;
    MarketplaceOrchestrator public marketplaceOrchestrator;
    
    // Test accounts
    address public deployerAddress = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266; // First Anvil account
    address public feeCollector = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8; // Second Anvil account
    address public user1 = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC; // Third Anvil account
    address public user2 = 0x90F79bf6EB2c4f870365E785982E1f101E93b906; // Fourth Anvil account
    
    // Configuration parameters (should match the deployment script)
    string public constant REAL_ESTATE_TOKEN_NAME = "Real Estate Token";
    string public constant REAL_ESTATE_TOKEN_SYMBOL = "RET";
    
    string public constant RENTABLE_TOKEN_NAME = "Rentable Token";
    string public constant RENTABLE_TOKEN_SYMBOL = "RENT";
    uint256 public constant INITIAL_TOKEN_PRICE = 0.001 ether;
    uint256 public constant INITIAL_YIELD_RATE = 500; // 5%
    
    uint256 public constant PLATFORM_FEE_PERCENTAGE = 250; // 2.5%
    
    uint256 public constant MIN_LOAN_AMOUNT = 1 ether;
    uint256 public constant MAX_LOAN_TO_VALUE_RATIO = 7000; // 70%
    uint256 public constant LIQUIDATION_THRESHOLD = 8500; // 85%
    uint256 public constant LIQUIDATION_PENALTY = 1000; // 10%
    uint256 public constant PROTOCOL_FEE_PERCENTAGE = 200; // 2%
    
    function setUp() public {
        // Create a new instance of the deployment script
        deployer = new DeployRentableToken();
        
        // Fund test accounts
        vm.deal(deployerAddress, 1000 ether);
        vm.deal(feeCollector, 1000 ether);
        vm.deal(user1, 1000 ether);
        vm.deal(user2, 1000 ether);
        
        // Simulate the deployment
        vm.startPrank(deployerAddress);
        
        // Deploy RealEstateERC721
        realEstateToken = new RealEstateERC721(
            REAL_ESTATE_TOKEN_NAME,
            REAL_ESTATE_TOKEN_SYMBOL
        );
        
        // Deploy RentableToken
        rentableToken = new RentableToken(
            RENTABLE_TOKEN_NAME,
            RENTABLE_TOKEN_SYMBOL,
            INITIAL_TOKEN_PRICE,
            INITIAL_YIELD_RATE
        );
        
        // Deploy FractionalOwnership
        fractionalOwnership = new FractionalOwnership(
            address(realEstateToken)
        );
        
        // Deploy RealEstateSale
        saleContract = new RealEstateSale(
            address(realEstateToken),
            address(rentableToken),
            PLATFORM_FEE_PERCENTAGE,
            feeCollector
        );
        
        // Deploy LendingProtocol
        lendingProtocol = new LendingProtocol(
            address(realEstateToken),
            MIN_LOAN_AMOUNT,
            MAX_LOAN_TO_VALUE_RATIO,
            LIQUIDATION_THRESHOLD,
            LIQUIDATION_PENALTY,
            PROTOCOL_FEE_PERCENTAGE,
            feeCollector
        );
        
        // Deploy RentalAgreement
        rentalAgreement = new RentalAgreement(
            address(realEstateToken)
        );
        
        // Deploy MarketplaceOrchestrator
        marketplaceOrchestrator = new MarketplaceOrchestrator(
            address(realEstateToken),
            address(saleContract),
            address(rentableToken),
            address(lendingProtocol),
            address(rentalAgreement)
        );
        
        // Mint a property for testing
        realEstateToken.mintProperty(
            deployerAddress,
            "PROP123",
            "123 Main St, New York",
            100 ether,
            "ipfs://property-metadata-uri"
        );
        
        vm.stopPrank();
    }
    
    function testDeploymentConfiguration() public view {
        // Test RealEstateERC721 configuration
        assertEq(realEstateToken.name(), REAL_ESTATE_TOKEN_NAME);
        assertEq(realEstateToken.symbol(), REAL_ESTATE_TOKEN_SYMBOL);
        assertEq(realEstateToken.owner(), deployerAddress);
        
        // Test RentableToken configuration
        assertEq(rentableToken.name(), RENTABLE_TOKEN_NAME);
        assertEq(rentableToken.symbol(), RENTABLE_TOKEN_SYMBOL);
        assertEq(rentableToken.tokenPrice(), INITIAL_TOKEN_PRICE);
        assertEq(rentableToken.annualYieldRate(), INITIAL_YIELD_RATE);
        
        // Test FractionalOwnership configuration
        assertEq(address(fractionalOwnership.propertyToken()), address(realEstateToken));
        
        // Test RealEstateSale configuration
        assertEq(address(saleContract.propertyToken()), address(realEstateToken));
        assertEq(address(saleContract.rentableToken()), address(rentableToken));
        assertEq(saleContract.platformFeePercentage(), PLATFORM_FEE_PERCENTAGE);
        assertEq(saleContract.feeCollector(), feeCollector);
        
        // Test LendingProtocol configuration
        assertEq(address(lendingProtocol.propertyToken()), address(realEstateToken));
        assertEq(lendingProtocol.minLoanAmount(), MIN_LOAN_AMOUNT);
        assertEq(lendingProtocol.maxLoanToValueRatio(), MAX_LOAN_TO_VALUE_RATIO);
        assertEq(lendingProtocol.liquidationThreshold(), LIQUIDATION_THRESHOLD);
        assertEq(lendingProtocol.liquidationPenalty(), LIQUIDATION_PENALTY);
        assertEq(lendingProtocol.protocolFeePercentage(), PROTOCOL_FEE_PERCENTAGE);
        assertEq(lendingProtocol.feeCollector(), feeCollector);
        
        // Test RentalAgreement configuration
        assertEq(address(rentalAgreement.propertyToken()), address(realEstateToken));
        
        // Test MarketplaceOrchestrator configuration
        assertEq(address(marketplaceOrchestrator.propertyToken()), address(realEstateToken));
        assertEq(address(marketplaceOrchestrator.saleContract()), address(saleContract));
        assertEq(address(marketplaceOrchestrator.rentableToken()), address(rentableToken));
        assertEq(address(marketplaceOrchestrator.lendingProtocol()), address(lendingProtocol));
        assertEq(address(marketplaceOrchestrator.rentalAgreement()), address(rentalAgreement));
    }
    
    function testInitialPropertyMinting() public view {
        // Check that the property was minted correctly
        uint256[] memory allTokenIds = realEstateToken.getAllTokenIds();
        assertEq(allTokenIds.length, 1);
        
        uint256 propertyId = allTokenIds[0];
        assertEq(realEstateToken.ownerOf(propertyId), deployerAddress);
        
        // Check property details
        RealEstateERC721.PropertyDetails memory details = realEstateToken.getPropertyDetails(propertyId);
        assertEq(details.cadastralNumber, "PROP123");
        assertEq(details.location, "123 Main St, New York");
        assertEq(details.valuation, 100 ether);
        assertTrue(details.active);
    }
    
    function testBasicFunctionality() public {
        // Get the property ID
        uint256[] memory allTokenIds = realEstateToken.getAllTokenIds();
        uint256 propertyId = allTokenIds[0];
        
        // Test property listing in marketplace
        vm.startPrank(deployerAddress);
        
        // List property for sale
        uint256 salePrice = 80 ether;
        marketplaceOrchestrator.listProperty(
            propertyId,
            true, // For sale
            false, // Not for rent
            salePrice,
            0 // No monthly rent
        );
        
        // Check listing details
        MarketplaceOrchestrator.PropertyListing memory listing = marketplaceOrchestrator.getListing(propertyId);
        assertEq(listing.propertyId, propertyId);
        assertEq(listing.owner, deployerAddress);
        assertTrue(listing.forSale);
        assertFalse(listing.forRent);
        assertEq(listing.salePrice, salePrice);
        
        // Test property token approval for LendingProtocol
        realEstateToken.approve(address(lendingProtocol), propertyId);
        assertEq(realEstateToken.getApproved(propertyId), address(lendingProtocol));
        
        vm.stopPrank();
        
        // Test RentableToken purchase
        vm.startPrank(user1);
        uint256 purchaseAmount = 1 ether;
        uint256 tokensBefore = rentableToken.balanceOf(user1);
        rentableToken.purchaseTokens{value: purchaseAmount}();
        uint256 tokensAfter = rentableToken.balanceOf(user1);
        assertTrue(tokensAfter > tokensBefore);
        vm.stopPrank();
    }
    
    function testLoanRequestAndApproval() public {
        // Get the property ID
        uint256[] memory allTokenIds = realEstateToken.getAllTokenIds();
        uint256 propertyId = allTokenIds[0];
        
        // Request a loan
        vm.startPrank(deployerAddress);
        
        uint256 loanAmount = 50 ether; // 50% LTV
        uint256 interestRate = 500; // 5% annual interest
        uint256 term = 365 days; // 1 year
        
        uint256 loanId = lendingProtocol.requestLoan(
            propertyId,
            loanAmount,
            interestRate,
            term
        );
        
        // Verify loan request
        (
            uint256 _propertyId,
            address _borrower,
            uint256 _principal,
            uint256 _interestRate,
            ,
            uint256 _term,
            ,
            ,
            ,
            ,
            ,
            LendingProtocol.LoanStatus _status,
            ,
            ,
            
        ) = lendingProtocol.loans(loanId);
        
        assertEq(_propertyId, propertyId);
        assertEq(_borrower, deployerAddress);
        assertEq(_principal, loanAmount);
        assertEq(_interestRate, interestRate);
        assertEq(_term, term);
        assertEq(uint256(_status), uint256(LendingProtocol.LoanStatus.None)); // Pending approval
        
        vm.stopPrank();
    }
    
    function testFractionalOwnership() public {
        // Get the property ID
        uint256[] memory allTokenIds = realEstateToken.getAllTokenIds();
        uint256 propertyId = allTokenIds[0];
        
        vm.startPrank(deployerAddress);
        
        // Approve property transfer to FractionalOwnership contract
        realEstateToken.approve(address(fractionalOwnership), propertyId);
        
        // Fractionalize property
        uint256 totalShares = 1000; // 1000 shares
        uint256 sharePrice = 0.1 ether; // 0.1 ETH per share
        
        fractionalOwnership.fractionalizeProperty(
            propertyId,
            totalShares,
            sharePrice
        );
        
        // Verify fractionalization
        FractionalOwnership.FractionalizedProperty memory fractionalizedProperty = 
            fractionalOwnership.getFractionalizedProperty(propertyId);
        
        assertEq(fractionalizedProperty.propertyId, propertyId);
        assertEq(fractionalizedProperty.totalShares, totalShares);
        assertEq(fractionalizedProperty.sharePrice, sharePrice);
        assertTrue(fractionalizedProperty.active);
        
        // Verify property ownership transferred to contract
        assertEq(realEstateToken.ownerOf(propertyId), address(fractionalOwnership));
        
        // Verify deployer received shares
        assertEq(fractionalOwnership.balanceOf(deployerAddress), totalShares);
        
        vm.stopPrank();
    }
    
    // Add more tests as needed for other functionality
}