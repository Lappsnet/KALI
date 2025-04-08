// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/FractionalOwnership.sol";
import "../src/RealEstateERC721.sol";

contract FractionalOwnershipTest is Test {
    RealEstateERC721 public realEstateToken;
    FractionalOwnership public fractionalOwnership;
    
    address public owner;
    address public propertyOwner;
    address public buyer;
    
    uint256 public propertyId;
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    function setUp() public {
        owner = address(this);
        
        // Use regular addresses instead of precompiled ones
        propertyOwner = makeAddr("propertyOwner");
        buyer = makeAddr("buyer");
        
        // Fund all accounts with ETH
        vm.deal(owner, 1000 ether);
        vm.deal(propertyOwner, 1000 ether);
        vm.deal(buyer, 1000 ether);
        
        // Deploy RealEstateERC721
        realEstateToken = new RealEstateERC721("Real Estate Token", "RET");
        
        // Deploy FractionalOwnership
        fractionalOwnership = new FractionalOwnership(address(realEstateToken));
        
        // Mint a property to the property owner
        vm.startPrank(owner);
        propertyId = realEstateToken.mintProperty(
            propertyOwner,
            "PROP123",
            "123 Main St",
            100 ether, // Property value: 100 ETH
            "ipfs://property-metadata"
        );
        vm.stopPrank();
    }
    
    function testFractionalizeProperty() public {
        // Use non-ether denominated values for shares to avoid multiplication overflow
        uint256 totalShares = 1000; // Just 1000 shares, not 1000 ether
        uint256 sharePrice = 0.1 ether; // 0.1 ETH per share
        
        // Approve property transfer
        vm.prank(propertyOwner);
        realEstateToken.approve(address(fractionalOwnership), propertyId);
        
        // Fractionalize property
        vm.prank(propertyOwner);
        fractionalOwnership.fractionalizeProperty(
            propertyId,
            totalShares,
            sharePrice
        );
        
        // Check property ownership transferred to contract
        assertEq(realEstateToken.ownerOf(propertyId), address(fractionalOwnership));
        
        // Check property owner received shares
        assertEq(fractionalOwnership.balanceOf(propertyOwner), totalShares);
        
        // Check fractionalized property details
        FractionalOwnership.FractionalizedProperty memory fractionalizedProperty = fractionalOwnership.getFractionalizedProperty(propertyId);
        
        assertEq(fractionalizedProperty.propertyId, propertyId);
        assertEq(fractionalizedProperty.totalShares, totalShares);
        assertEq(fractionalizedProperty.sharePrice, sharePrice);
        assertTrue(fractionalizedProperty.active);
    }
    
    function testPurchaseShares() public {
        // Use non-ether denominated values for shares to avoid multiplication overflow
        uint256 totalShares = 1000; // Just 1000 shares, not 1000 ether
        uint256 sharePrice = 0.1 ether; // 0.1 ETH per share
        
        vm.prank(propertyOwner);
        realEstateToken.approve(address(fractionalOwnership), propertyId);
        
        vm.prank(propertyOwner);
        fractionalOwnership.fractionalizeProperty(
            propertyId,
            totalShares,
            sharePrice
        );
        
        // Grant ADMIN_ROLE to property owner to make them a potential seller
        vm.prank(owner);
        fractionalOwnership.grantRole(ADMIN_ROLE, propertyOwner);
        
        // Purchase shares - use non-ether denominated value
        uint256 sharesToBuy = 100; // Just 100 shares, not 100 ether
        
        // Calculate the correct cost
        uint256 cost = sharesToBuy * sharePrice; // 100 * 0.1 ether = 10 ether
        
        // Record initial balances
        uint256 initialBuyerBalance = buyer.balance;
        uint256 initialSellerBalance = propertyOwner.balance;
        
        // Ensure buyer has enough ETH
        vm.deal(buyer, cost);
        
        // Execute the purchase
        vm.prank(buyer);
        fractionalOwnership.purchaseShares{value: cost}(propertyId, sharesToBuy);
        
        // Check buyer received shares
        assertEq(fractionalOwnership.balanceOf(buyer), sharesToBuy);
        
        // Check property owner's shares reduced
        assertEq(fractionalOwnership.balanceOf(propertyOwner), totalShares - sharesToBuy);
        
        // Check ETH was transferred correctly
        assertEq(propertyOwner.balance, initialSellerBalance + cost);
    }
    
    function testDefractionalizeProperty() public {
        // Use non-ether denominated values for shares
        uint256 totalShares = 1000; // Just 1000 shares, not 1000 ether
        uint256 sharePrice = 0.1 ether; // 0.1 ETH per share
        
        vm.prank(propertyOwner);
        realEstateToken.approve(address(fractionalOwnership), propertyId);
        
        vm.prank(propertyOwner);
        fractionalOwnership.fractionalizeProperty(
            propertyId,
            totalShares,
            sharePrice
        );
        
        // Transfer all shares to buyer
        vm.prank(propertyOwner);
        fractionalOwnership.transfer(buyer, totalShares);
        
        // Defractionalize property
        vm.prank(buyer);
        fractionalOwnership.defractionalizeProperty(propertyId);
        
        // Check property ownership transferred back
        assertEq(realEstateToken.ownerOf(propertyId), buyer);
        
        // Check shares were burned
        assertEq(fractionalOwnership.balanceOf(buyer), 0);
        
        // Check property is no longer fractionalized
        FractionalOwnership.FractionalizedProperty memory fractionalizedProperty = fractionalOwnership.getFractionalizedProperty(propertyId);
        assertFalse(fractionalizedProperty.active);
    }
    
    function testAccessControl() public {
        // Grant admin role
        vm.prank(owner);
        fractionalOwnership.grantRole(ADMIN_ROLE, buyer);
        assertTrue(fractionalOwnership.hasRole(ADMIN_ROLE, buyer));
        
        // Revoke admin role
        vm.prank(owner);
        fractionalOwnership.revokeRole(ADMIN_ROLE, buyer);
        assertFalse(fractionalOwnership.hasRole(ADMIN_ROLE, buyer));
    }
    
    function testIsPropertyFractionalized() public {
        // Initially not fractionalized
        assertFalse(fractionalOwnership.isPropertyFractionalized(propertyId));
        
        // Fractionalize property
        uint256 totalShares = 1000; // Just 1000 shares, not 1000 ether
        uint256 sharePrice = 0.1 ether; // 0.1 ETH per share
        
        vm.prank(propertyOwner);
        realEstateToken.approve(address(fractionalOwnership), propertyId);
        
        vm.prank(propertyOwner);
        fractionalOwnership.fractionalizeProperty(
            propertyId,
            totalShares,
            sharePrice
        );
        
        // Now should be fractionalized
        assertTrue(fractionalOwnership.isPropertyFractionalized(propertyId));
    }
    
    // Add a receive function to the test contract to handle ETH transfers
    receive() external payable {}
}