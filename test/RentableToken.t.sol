// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {RentableToken} from "../src/RentableToken.sol";
import {RealEstateERC721} from "../src/RealEstateERC721.sol";

contract RentableTokenTest is Test {
    RentableToken public token;
    RealEstateERC721 public propertyToken;
    
    address public admin;
    address public user1;
    address public user2;
    address public yieldManager;
    
    uint256 public propertyId;
    
    function setUp() public {
        // Set up accounts
        admin = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        yieldManager = makeAddr("yieldManager");
        
        // Deploy the contracts
        token = new RentableToken(
            "Rental Yield Token",
            "RYT",
            10**16,  // 0.01 ETH per token
            500      // 5% annual yield
        );
        
        propertyToken = new RealEstateERC721("Real Estate Token", "RET");
        
        // Mint a property
        propertyId = propertyToken.mintProperty(
            admin,
            "PROP123456",
            "123 Main St, Anytown, USA",
            1000 * 10**18,
            "https://metadata.example.com/property/123456"
        );
        
        // Link the rentable token to the property
        token.setPropertyReference(address(propertyToken), propertyId);
        
        // Grant yield manager role
        token.grantRole(token.YIELD_MANAGER_ROLE(), yieldManager);
        
        // Give ETH to test accounts
        vm.deal(user1, 10 ether);
        vm.deal(user2, 10 ether);
        
        // Mint some tokens to admin for testing
        token.purchaseTokens{value: 1 ether}();
    }
    
    // ==================
    // PURCHASE TESTS
    // ==================
    
    function testPurchaseTokens() public {
        // User1 purchases tokens
        vm.startPrank(user1);
        uint256 purchaseAmount = 1 ether;
        uint256 expectedTokens = (purchaseAmount * 10**18) / token.tokenPrice();
        
        uint256 tokensBought = token.purchaseTokens{value: purchaseAmount}();
        vm.stopPrank();
        
        // Check token balance
        assertEq(token.balanceOf(user1), expectedTokens);
        assertEq(tokensBought, expectedTokens);
        
        // Check contract ETH balance
        assertEq(address(token).balance, purchaseAmount + 1 ether); // +1 ether from setup
    }
    
    function testReceiveFunction() public {
        // User1 sends ETH directly to contract
        vm.startPrank(user1);
        uint256 sendAmount = 0.5 ether;
        uint256 expectedTokens = (sendAmount * 10**18) / token.tokenPrice();
        
        (bool success, ) = address(token).call{value: sendAmount}("");
        vm.stopPrank();
        
        // Check success and token balance
        assertTrue(success);
        assertEq(token.balanceOf(user1), expectedTokens);
        
        // Check contract ETH balance
        assertEq(address(token).balance, sendAmount + 1 ether); // +1 ether from setup
    }
    
    // ==================
    // YIELD TESTS
    // ==================
    
    function testYieldDistribution() public {
        // User1 purchases tokens
        vm.startPrank(user1);
        token.purchaseTokens{value: 1 ether}();
        vm.stopPrank();
        
        // Fast forward time
        uint256 distributionPeriod = token.yieldDistributionPeriod();
        vm.warp(block.timestamp + distributionPeriod + 1);
        
        // Distribute yield
        vm.startPrank(yieldManager);
        token.distributeYield();
        vm.stopPrank();
        
        // Check contract token balance (should have yield tokens)
        uint256 contractBalance = token.balanceOf(address(token));
        assertGt(contractBalance, 0);
    }
    
    function testYieldClaim() public {
        // User1 purchases tokens
        vm.startPrank(user1);
        token.purchaseTokens{value: 1 ether}();
        vm.stopPrank();
        
        // Fast forward time
        uint256 distributionPeriod = token.yieldDistributionPeriod();
        vm.warp(block.timestamp + distributionPeriod + 1);
        
        // Distribute yield
        vm.startPrank(yieldManager);
        token.distributeYield();
        vm.stopPrank();
        
        // Calculate claimable yield
        uint256 claimableYield = token.calculateClaimableYield(user1);
        
        // User1 claims yield
        vm.startPrank(user1);
        uint256 claimedYield = token.claimYield();
        vm.stopPrank();
        
        // Check claimed amount
        assertEq(claimedYield, claimableYield);
    }
    
    // ==================
    // STAKING TESTS
    // ==================
    
    function testStaking() public {
        // User1 purchases tokens
        vm.startPrank(user1);
        token.purchaseTokens{value: 1 ether}();
        
        // Get initial balance
        uint256 initialBalance = token.balanceOf(user1);
        
        // Stake half of the tokens for 90 days
        uint256 stakeAmount = initialBalance / 2;
        uint256 lockPeriod = 90 days;
        uint256 positionIndex = token.stakeTokens(stakeAmount, lockPeriod);
        vm.stopPrank();
        
        // Check user balance after staking
        assertEq(token.balanceOf(user1), initialBalance - stakeAmount);
        
        // Check staking position
        RentableToken.StakingPosition[] memory positions = token.getStakingPositions(user1);
        assertEq(positions.length, 1);
        assertEq(positions[0].amount, stakeAmount);
        assertEq(positions[0].lockPeriod, lockPeriod);
        
        // Fast forward time past lock period
        vm.warp(block.timestamp + lockPeriod + 1);
        
        // User1 unstakes tokens
        vm.startPrank(user1);
        (uint256 unstaked, uint256 yieldEarned) = token.unstakeTokens(positionIndex);
        vm.stopPrank();
        
        // Check unstaked amount
        assertEq(unstaked, stakeAmount);
        
        // Check yield earned
        assertGt(yieldEarned, 0);
        
        // Check final balance
        assertEq(token.balanceOf(user1), initialBalance + yieldEarned);
    }
    
    function test_RevertWhen_UnstakingBeforeLockPeriod() public {
        // User1 purchases tokens
        vm.startPrank(user1);
        token.purchaseTokens{value: 1 ether}();
        
        // Stake tokens for 90 days
        uint256 stakeAmount = token.balanceOf(user1) / 2;
        uint256 lockPeriod = 90 days;
        uint256 positionIndex = token.stakeTokens(stakeAmount, lockPeriod);
        
        // Fast forward time but not past lock period
        vm.warp(block.timestamp + 30 days);
        
        // Try to unstake tokens (should fail)
        vm.expectRevert("RentableToken: still in lock period");
        token.unstakeTokens(positionIndex);
        
        vm.stopPrank();
    }
    
    // ==================
    // TRANSFER LIMIT TESTS
    // ==================
    
    function testTransferLimits() public {
        // User1 purchases tokens
        vm.startPrank(user1);
        token.purchaseTokens{value: 1 ether}();
        
        uint256 balance = token.balanceOf(user1);
        uint256 maxTransfer = (balance * token.maxTransferPercentage()) / 10000;
        
        // Transfer just at the limit (should succeed)
        token.transfer(user2, maxTransfer);
        
        // Try to transfer more than limit (should fail)
        uint256 remainingBalance = token.balanceOf(user1);
        if (remainingBalance > 0) {
            vm.expectRevert("RentableToken: transfer exceeds limit");
            token.transfer(user2, remainingBalance);
        }
        
        vm.stopPrank();
    }
    
    function testTransferLimitExemption() public {
        // User1 purchases tokens
        vm.startPrank(user1);
        token.purchaseTokens{value: 1 ether}();
        vm.stopPrank();
        
        // Set user1 as exempt from transfer limits
        token.setTransferLimitExempt(user1, true);
        
        // User1 transfers more than the limit (should succeed)
        vm.startPrank(user1);
        uint256 balance = token.balanceOf(user1);
        token.transfer(user2, balance);  // Transfer entire balance
        vm.stopPrank();
        
        // Check balances
        assertEq(token.balanceOf(user1), 0);
        assertEq(token.balanceOf(user2), balance);
    }
    
    // ==================
    // ADMIN FUNCTION TESTS
    // ==================
    
    function testAdminFunctions() public {
        // Test setTokenPrice
        uint256 newPrice = 2 * 10**16;  // 0.02 ETH
        token.setTokenPrice(newPrice);
        assertEq(token.tokenPrice(), newPrice);
        
        // Test setAnnualYieldRate
        uint256 newRate = 700;  // 7%
        token.setAnnualYieldRate(newRate);
        assertEq(token.annualYieldRate(), newRate);
        
        // Test setYieldDistributionPeriod
        uint256 newPeriod = 60 days;
        token.setYieldDistributionPeriod(newPeriod);
        assertEq(token.yieldDistributionPeriod(), newPeriod);
        
        // Test setTransferLimits
        uint256 newMaxTransfer = 3000;  // 30%
        uint256 newMaxBurn = 1500;      // 15%
        token.setTransferLimits(newMaxTransfer, newMaxBurn);
        assertEq(token.maxTransferPercentage(), newMaxTransfer);
        assertEq(token.maxBurnPercentage(), newMaxBurn);
    }
    
    // ==================
    // EMERGENCY FUNCTION TESTS
    // ==================
    
    function testEmergencyPause() public {
        // Ensure admin has tokens to transfer
        uint256 adminBalance = token.balanceOf(admin);
        require(adminBalance > 0, "Admin needs tokens for test");
        
        // User1 purchases tokens
        vm.startPrank(user1);
        token.purchaseTokens{value: 1 ether}();
        vm.stopPrank();
        
        // Pause the contract
        token.setPaused(true);
        assertTrue(token.paused());
        
        // Try to transfer tokens (should fail)
        vm.startPrank(user1);
        vm.expectRevert("RentableToken: transfers paused");
        token.transfer(user2, 1);
        vm.stopPrank();
        
        // Admin should still be able to transfer
        uint256 transferAmount = 1;
        if (adminBalance >= transferAmount) {
            token.transfer(user2, transferAmount);
        }
        
        // Unpause the contract
        token.setPaused(false);
        assertFalse(token.paused());
        
        // User1 should be able to transfer again
        vm.startPrank(user1);
        token.transfer(user2, 1);
        vm.stopPrank();
    }
    
    function testEmergencyWithdraw() public {
        // User1 purchases tokens
        vm.startPrank(user1);
        token.purchaseTokens{value: 1 ether}();
        vm.stopPrank();
        
        // Check contract ETH balance
        uint256 contractBalance = address(token).balance;
        assertEq(contractBalance, 2 ether); // 1 ether from setup + 1 ether from purchase
        
        // Emergency withdraw
        address recipient = makeAddr("recipient");
        token.emergencyWithdraw(payable(recipient));
        
        // Check recipient balance
        assertEq(address(recipient).balance, contractBalance);
        
        // Check contract balance
        assertEq(address(token).balance, 0);
    }
}