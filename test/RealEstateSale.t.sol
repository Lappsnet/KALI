// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {RealEstateSale} from "../src/RealEstateSale.sol";
import {RealEstateERC721} from "../src/RealEstateERC721.sol";
import {RentableToken} from "../src/RentableToken.sol";

contract RealEstateSaleTest is Test {
    RealEstateERC721 public realEstateToken;
    RentableToken public rentableToken;
    RealEstateSale public saleContract;
    
    address public owner;
    address public seller;
    address public buyer;
    address public notary;
    address public feeCollector;
    
    uint256 public propertyId;
    uint256 public saleId;
    
    // Sale parameters
    uint256 public constant PLATFORM_FEE_PERCENTAGE = 250; // 2.5%
    
    function setUp() public {
        owner = address(this);
        seller = address(0x1);
        buyer = address(0x2);
        notary = address(0x3);
        feeCollector = address(0x4);
        
        // Deploy contracts
        _deployContracts();
        
        // Mint a property to the seller
        vm.startPrank(owner);
        propertyId = realEstateToken.mintProperty(
            seller,
            "PROP123",
            "123 Main St",
            100 ether, // Property value: 100 ETH
            "ipfs://property-metadata"
        );
        vm.stopPrank();
        
        // Authorize notary
        saleContract.authorizeNotary(notary);
    }
    
    // Helper function to deploy contracts - reduces stack depth in setUp
    function _deployContracts() internal {
        // Deploy RealEstateERC721
        realEstateToken = new RealEstateERC721("Real Estate Token", "RET");
        
        // Deploy RentableToken
        rentableToken = new RentableToken(
            "Rentable Token",
            "RENT",
            0.001 ether, // Initial token price
            500 // 5% annual yield rate
        );
        
        // Deploy RealEstateSale
        saleContract = new RealEstateSale(
            address(realEstateToken),
            address(rentableToken),
            PLATFORM_FEE_PERCENTAGE,
            feeCollector
        );
    }
    
    function testCreateSale() public {
        uint256 price = 80 ether; // 80 ETH
        string memory saleDocumentURI = "ipfs://sale-documents";
        
        vm.prank(seller);
        saleId = saleContract.createSale(
            propertyId,
            price,
            saleDocumentURI
        );
        
        // Check sale details
        _verifySaleDetails(saleId, price, saleDocumentURI);
    }
    
    // Helper function to verify sale details
    function _verifySaleDetails(uint256 _saleId, uint256 _price, string memory _saleDocumentURI) internal view {
        (
            uint256 _propertyId,
            address _seller,
            ,
            uint256 _salePrice,
            ,
            RealEstateSale.SaleStatus _status,
            ,
            ,
            ,
            string memory _docURI,
            ,
            
        ) = saleContract.sales(_saleId);
        
        assertEq(_propertyId, propertyId);
        assertEq(_seller, seller);
        assertEq(_salePrice, _price);
        assertEq(uint256(_status), uint256(RealEstateSale.SaleStatus.Listed));
        assertEq(_docURI, _saleDocumentURI);
    }
    
    function testUpdateSalePrice() public {
        // Setup: Create a sale
        _createSale();
        
        // Update the price
        uint256 newPrice = 85 ether;
        vm.prank(seller);
        saleContract.updateSalePrice(saleId, newPrice);
        
        // Check updated price
        (, , , uint256 _price, , , , , , , , ) = saleContract.sales(saleId);
        assertEq(_price, newPrice);
    }
    
    // Helper function to create a sale
    function _createSale() internal {
        uint256 initialPrice = 80 ether;
        vm.prank(seller);
        saleId = saleContract.createSale(
            propertyId,
            initialPrice,
            "ipfs://sale-documents"
        );
    }
    
    function testConfigureRentableTokens() public {
        // Setup: Create a sale
        _createSale();
        
        // Setup tokens for seller
        _setupTokensForSeller();
        
        // Configure rentable tokens
        uint256 tokenAmount = rentableToken.balanceOf(seller);
        vm.startPrank(seller);
        rentableToken.approve(address(saleContract), tokenAmount);
        saleContract.configureRentableTokens(saleId, true, tokenAmount);
        vm.stopPrank();
        
        // Check rentable token configuration
        (, , , , , , , , , , bool _included, uint256 _amount) = saleContract.sales(saleId);
        assertTrue(_included);
        assertEq(_amount, tokenAmount);
    }
    
    // Helper function to setup tokens for seller
    function _setupTokensForSeller() internal {
        // Fund seller with ETH to purchase tokens
        vm.deal(seller, 1 ether);
        
        // Seller purchases tokens
        vm.prank(seller);
        rentableToken.purchaseTokens{value: 1 ether}();
    }
    
    function testCancelSale() public {
        // Setup: Create a sale
        _createSale();
        
        // Cancel the sale
        string memory reason = "Changed my mind";
        vm.prank(seller);
        saleContract.cancelSale(saleId, reason);
        
        // Check sale status
        (, , , , , RealEstateSale.SaleStatus _status, , , , , , ) = saleContract.sales(saleId);
        assertEq(uint256(_status), uint256(RealEstateSale.SaleStatus.Cancelled));
    }
    
    function testExpressInterest() public {
        // Setup: Create a sale
        _createSale();
        
        // Express interest
        vm.prank(buyer);
        saleContract.expressInterest(saleId);
        
        // Check sale status and buyer
        (, , address _buyer, , , RealEstateSale.SaleStatus _status, , , , , , ) = saleContract.sales(saleId);
        assertEq(_buyer, buyer);
        assertEq(uint256(_status), uint256(RealEstateSale.SaleStatus.PendingApproval));
    }
    
    function testDepositEscrow() public {
        // Setup: Create a sale and get it approved
        _createSaleAndApprove();
        
        // Deposit escrow
        uint256 price = 80 ether;
        vm.deal(buyer, price);
        vm.prank(buyer);
        saleContract.depositEscrow{value: price}(saleId);
        
        // Check escrow balance
        assertEq(saleContract.saleEscrow(saleId), price);
    }
    
    // Helper function to create a sale and get it approved
    function _createSaleAndApprove() internal {
        _createSale();
        
        vm.prank(buyer);
        saleContract.expressInterest(saleId);
        
        vm.prank(notary);
        saleContract.assignNotary(saleId);
        
        vm.prank(notary);
        saleContract.approveSale(saleId);
    }
    
    function testCompleteSale() public {
        // Setup: Create a sale, express interest, assign notary, approve, deposit escrow
        _createSaleAndApprove();
        
        // Deposit escrow
        uint256 price = 80 ether;
        vm.deal(buyer, price);
        vm.prank(buyer);
        saleContract.depositEscrow{value: price}(saleId);
        
        // Approve property transfer
        vm.prank(seller);
        realEstateToken.approve(address(saleContract), propertyId);
        
        // Complete sale
        vm.prank(notary);
        saleContract.completeSale(saleId);
        
        // Check sale status and property ownership
        _verifySaleCompleted();
    }
    
    // Helper function to verify sale completed
    function _verifySaleCompleted() internal view {
        // Check sale status
        (, , , , , RealEstateSale.SaleStatus _status, , , uint256 _completedAt, , , ) = saleContract.sales(saleId);
        assertEq(uint256(_status), uint256(RealEstateSale.SaleStatus.Completed));
        assertEq(_completedAt, block.timestamp);
        
        // Check property ownership transferred to buyer
        assertEq(realEstateToken.ownerOf(propertyId), buyer);
    }
    
    function testAuthorizeAndRemoveNotary() public {
        address newNotary = address(0x5);
        
        // Authorize notary
        saleContract.authorizeNotary(newNotary);
        assertTrue(saleContract.authorizedNotaries(newNotary));
        
        // Remove notary
        saleContract.removeNotary(newNotary);
        assertFalse(saleContract.authorizedNotaries(newNotary));
    }
    
    function testUpdatePlatformFee() public {
        uint256 newFeePercentage = 300; // 3%
        
        saleContract.updatePlatformFee(newFeePercentage);
        assertEq(saleContract.platformFeePercentage(), newFeePercentage);
    }
    
    function testUpdateFeeCollector() public {
        address newFeeCollector = address(0x6);
        
        saleContract.updateFeeCollector(newFeeCollector);
        assertEq(saleContract.feeCollector(), newFeeCollector);
    }
}

