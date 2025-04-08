// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/RealEstateERC721.sol";

contract RealEstateERC721Test is Test {
    RealEstateERC721 public token;
    
    address public admin;
    address public user1;
    address public user2;
    
    function setUp() public {
        // Set up accounts
        admin = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        // Deploy the contract
        token = new RealEstateERC721("Real Estate Token", "RET");
        
        // Give ETH to test accounts
        vm.deal(user1, 10 ether);
        vm.deal(user2, 10 ether);
    }
    
    // ==================
    // ADMIN TESTS
    // ==================
    
    function testAdminManagement() public {
        // Test adding admin
        address newAdmin = makeAddr("newAdmin");
        token.addAdministrator(newAdmin);
        assertTrue(token.administrators(newAdmin));
        
        // Test removing admin
        token.removeAdministrator(newAdmin);
        assertFalse(token.administrators(newAdmin));
        
        // Test ownership transfer
        address newOwner = makeAddr("newOwner");
        token.transferOwnership(newOwner);
        assertEq(token.owner(), newOwner);
    }
    
    function test_RevertWhen_NonOwnerAddsAdmin() public {
        // Switch to user1
        vm.startPrank(user1);
        
        // Should fail as user1 is not the owner
        address newAdmin = makeAddr("newAdmin");
        vm.expectRevert("RealEstateERC721: caller is not the owner");
        token.addAdministrator(newAdmin);
        
        vm.stopPrank();
    }
    
    // ==================
    // PROPERTY TESTS
    // ==================
    
    function testMintProperty() public {
        // Mint a property
        uint256 tokenId = token.mintProperty(
            user1,
            "PROP123456",
            "123 Main St, Anytown, USA",
            1000 * 10**18,  // 1000 ETH valuation
            "https://metadata.example.com/property/123456"
        );
        
        // Check token ownership
        assertEq(token.ownerOf(tokenId), user1);
        
        // Check property details
        RealEstateERC721.PropertyDetails memory details = token.getPropertyDetails(tokenId);
        
        assertEq(details.cadastralNumber, "PROP123456");
        assertEq(details.location, "123 Main St, Anytown, USA");
        assertEq(details.valuation, 1000 * 10**18);
        assertTrue(details.active);
        assertGt(details.lastUpdated, 0);
        assertEq(details.metadataURI, "https://metadata.example.com/property/123456");
    }
    
    function testUpdateProperty() public {
        // Mint a property
        uint256 tokenId = token.mintProperty(
            user1,
            "PROP123456",
            "123 Main St, Anytown, USA",
            1000 * 10**18,
            "https://metadata.example.com/property/123456"
        );
        
        // Update property valuation
        token.updatePropertyValuation(tokenId, 1200 * 10**18);
        
        // Update property location
        token.updatePropertyLocation(tokenId, "123 Main St, Apt 4B, Anytown, USA");
        
        // Update property status
        token.setPropertyStatus(tokenId, false);
        
        // Update property metadata
        token.setPropertyMetadataURI(tokenId, "https://metadata.example.com/property/123456/updated");
        
        // Check updated property details
        RealEstateERC721.PropertyDetails memory details = token.getPropertyDetails(tokenId);
        
        assertEq(details.cadastralNumber, "PROP123456");
        assertEq(details.location, "123 Main St, Apt 4B, Anytown, USA");
        assertEq(details.valuation, 1200 * 10**18);
        assertFalse(details.active);
        assertGt(details.lastUpdated, 0);
        assertEq(details.metadataURI, "https://metadata.example.com/property/123456/updated");
    }
    
    function test_RevertWhen_DuplicateCadastralNumber() public {
        // Mint first property
        token.mintProperty(
            user1,
            "PROP123456",
            "123 Main St, Anytown, USA",
            1000 * 10**18,
            "https://metadata.example.com/property/123456"
        );
        
        // Try to mint another property with the same cadastral number
        // This should fail
        vm.expectRevert("RealEstateERC721: property already tokenized");
        token.mintProperty(
            user2,
            "PROP123456",  // Same cadastral number
            "456 Second St, Anytown, USA",
            800 * 10**18,
            "https://metadata.example.com/property/456789"
        );
    }
    
    // ==================
    // TRANSFER TESTS
    // ==================
    
    function testTransferProperty() public {
        // Mint a property
        uint256 tokenId = token.mintProperty(
            user1,
            "PROP123456",
            "123 Main St, Anytown, USA",
            1000 * 10**18,
            "https://metadata.example.com/property/123456"
        );
        
        // Transfer from user1 to user2
        vm.startPrank(user1);
        token.transferFrom(user1, user2, tokenId);
        vm.stopPrank();
        
        // Check new owner
        assertEq(token.ownerOf(tokenId), user2);
        
        // Check balances
        assertEq(token.balanceOf(user1), 0);
        assertEq(token.balanceOf(user2), 1);
    }
    
    function testApproveAndTransfer() public {
        // Mint a property
        uint256 tokenId = token.mintProperty(
            user1,
            "PROP123456",
            "123 Main St, Anytown, USA",
            1000 * 10**18,
            "https://metadata.example.com/property/123456"
        );
        
        // User1 approves admin to transfer the token
        vm.startPrank(user1);
        token.approve(admin, tokenId);
        vm.stopPrank();
        
        // Check approval
        assertEq(token.getApproved(tokenId), admin);
        
        // Admin transfers the token from user1 to user2
        token.transferFrom(user1, user2, tokenId);
        
        // Check new owner
        assertEq(token.ownerOf(tokenId), user2);
    }
    
    function testApprovalForAll() public {
        // Mint a property
        uint256 tokenId = token.mintProperty(
            user1,
            "PROP123456",
            "123 Main St, Anytown, USA",
            1000 * 10**18,
            "https://metadata.example.com/property/123456"
        );
        
        // User1 approves admin for all tokens
        vm.startPrank(user1);
        token.setApprovalForAll(admin, true);
        vm.stopPrank();
        
        // Check approval for all
        assertTrue(token.isApprovedForAll(user1, admin));
        
        // Admin transfers the token from user1 to user2
        token.transferFrom(user1, user2, tokenId);
        
        // Check new owner
        assertEq(token.ownerOf(tokenId), user2);
    }
    
    // ==================
    // QUERY TESTS
    // ==================
    
    function testQueryFunctions() public {
        // Mint multiple properties
        uint256 tokenId1 = token.mintProperty(
            user1,
            "PROP123456",
            "123 Main St, Anytown, USA",
            1000 * 10**18,
            "https://metadata.example.com/property/123456"
        );
        
        uint256 tokenId2 = token.mintProperty(
            user2,
            "PROP789012",
            "789 Oak St, Anytown, USA",
            800 * 10**18,
            "https://metadata.example.com/property/789012"
        );
        
        // Test getAllTokenIds
        uint256[] memory allTokens = token.getAllTokenIds();
        assertEq(allTokens.length, 2);
        assertEq(allTokens[0], tokenId1);
        assertEq(allTokens[1], tokenId2);
        
        // Test getTokenIdByCadastralNumber
        uint256 foundTokenId = token.getTokenIdByCadastralNumber("PROP123456");
        assertEq(foundTokenId, tokenId1);
        
        // Test tokenURI
        string memory uri = token.tokenURI(tokenId1);
        assertEq(uri, "https://metadata.example.com/property/123456");
    }
}