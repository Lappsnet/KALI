// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/LendingProtocol.sol";
import "../src/RealEstateERC721.sol";

contract LendingProtocolTest is Test {
   RealEstateERC721 public realEstateToken;
   LendingProtocol public lendingProtocol;
   
   address public owner;
   address public loanOfficer;
   address public borrower;
   address public feeCollector;
   
   uint256 public propertyId;
   uint256 public loanId;
   
   // Protocol parameters
   uint256 public constant MIN_LOAN_AMOUNT = 1 ether;
   uint256 public constant MAX_LOAN_TO_VALUE_RATIO = 7000; // 70%
   uint256 public constant LIQUIDATION_THRESHOLD = 8500; // 85%
   uint256 public constant LIQUIDATION_PENALTY = 1000; // 10%
   uint256 public constant PROTOCOL_FEE_PERCENTAGE = 200; // 2%
   
   function setUp() public {
       owner = address(this);
       loanOfficer = address(0x1);
       borrower = address(0x2);
       feeCollector = address(0x3);
       
       // Fund all accounts with PLENTY of ETH
       vm.deal(owner, 1000 ether);
       vm.deal(loanOfficer, 1000 ether);
       vm.deal(borrower, 1000 ether);
       vm.deal(feeCollector, 1000 ether);
       
       // Deploy RealEstateERC721
       realEstateToken = new RealEstateERC721("Real Estate Token", "RET");
       
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
       
       // Add loan officer
       lendingProtocol.addLoanOfficer(loanOfficer);
       
       // Mint a property to the borrower
       vm.startPrank(owner);
       propertyId = realEstateToken.mintProperty(
           borrower,
           "PROP123",
           "123 Main St",
           100 ether, // Property value: 100 ETH
           "ipfs://property-metadata"
       );
       vm.stopPrank();
   }
   
   function testLoanRequest() public {
       // Request a loan as borrower
       uint256 loanAmount = 50 ether; // 50 ETH loan
       uint256 interestRate = 500; // 5% annual interest
       uint256 term = 365 days; // 1 year
       
       vm.startPrank(borrower);
       loanId = lendingProtocol.requestLoan(
           propertyId,
           loanAmount,
           interestRate,
           term
       );
       vm.stopPrank();
       
       // Check loan details
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
           address _loanOfficer,
           ,
           
       ) = lendingProtocol.loans(loanId);
       
       assertEq(_propertyId, propertyId);
       assertEq(_borrower, borrower);
       assertEq(_principal, loanAmount);
       assertEq(_interestRate, interestRate);
       assertEq(_term, term);
       assertEq(uint256(_status), uint256(LendingProtocol.LoanStatus.None)); // Pending approval
       assertEq(_loanOfficer, address(0)); // Not assigned yet
   }
   
   function testLoanApproval() public {
       // Setup: Request a loan
       uint256 loanAmount = 50 ether;
       uint256 interestRate = 500;
       uint256 term = 365 days;
       
       vm.prank(borrower);
       loanId = lendingProtocol.requestLoan(
           propertyId,
           loanAmount,
           interestRate,
           term
       );
       
       // Approve the loan as loan officer
       vm.prank(loanOfficer);
       lendingProtocol.approveLoan(loanId);
       
       // Check loan officer assignment
       (, , , , , , , , , , , , address _loanOfficer, , ) = lendingProtocol.loans(loanId);
       assertEq(_loanOfficer, loanOfficer);
   }
   
   function testLoanFunding() public {
       // Setup: Request and approve a loan
       uint256 loanAmount = 50 ether;
       uint256 interestRate = 500;
       uint256 term = 365 days;
       
       vm.prank(borrower);
       loanId = lendingProtocol.requestLoan(
           propertyId,
           loanAmount,
           interestRate,
           term
       );
       
       vm.prank(loanOfficer);
       lendingProtocol.approveLoan(loanId);
       
       // Approve property transfer
       vm.prank(borrower);
       realEstateToken.approve(address(lendingProtocol), propertyId);
       
       // Ensure loan officer has enough ETH
       vm.deal(loanOfficer, 100 ether);
       
       // Fund the loan as loan officer
       vm.prank(loanOfficer);
       lendingProtocol.fundLoan{value: loanAmount}(loanId);
       
       // Check loan status
       (, , , , , , , , , , , LendingProtocol.LoanStatus _status, , , ) = lendingProtocol.loans(loanId);
       assertEq(uint256(_status), uint256(LendingProtocol.LoanStatus.Active));
       
       // Check property ownership
       assertEq(realEstateToken.ownerOf(propertyId), address(lendingProtocol));
   }
   
   function testLoanRepayment() public {
       // Setup: Create and fund a loan
       setupFundedLoan();
       
       uint256 repaymentAmount = 10 ether;
       
       // Ensure borrower has enough ETH
       vm.deal(borrower, 100 ether);
       
       // Make a partial repayment
       vm.prank(borrower);
       lendingProtocol.makeRepayment{value: repaymentAmount}(loanId);
       
       // Check loan state after repayment
       (, , , , , , , , , uint256 _totalRepaid, uint256 _remainingPrincipal, , , , ) = lendingProtocol.loans(loanId);
       assertEq(_totalRepaid, repaymentAmount);
       assertTrue(_remainingPrincipal < 50 ether);
   }
   
   function testFullLoanRepayment() public {
       // Setup: Create and fund a loan
       setupFundedLoan();
       
       uint256 fullRepaymentAmount = 55 ether; // Principal + some interest
       
       // Ensure borrower has enough ETH
       vm.deal(borrower, 100 ether);
       
       // Make a full repayment
       vm.prank(borrower);
       lendingProtocol.makeRepayment{value: fullRepaymentAmount}(loanId);
       
       // Check loan status
       (, , , , , , , , , , uint256 _remainingPrincipal, LendingProtocol.LoanStatus _status, , , ) = lendingProtocol.loans(loanId);
       assertEq(uint256(_status), uint256(LendingProtocol.LoanStatus.Repaid));
       assertEq(_remainingPrincipal, 0);
       
       // Check property ownership returned to borrower
       assertEq(realEstateToken.ownerOf(propertyId), borrower);
   }
   
   function testLoanDefault() public {
       // Setup: Create and fund a loan
       setupFundedLoan();
       
       // Fast forward time past loan maturity
       vm.warp(block.timestamp + 366 days);
       
       // Mark loan as defaulted
       vm.prank(loanOfficer);
       lendingProtocol.markAsDefaulted(loanId);
       
       // Check loan status
       (, , , , , , , , , , , LendingProtocol.LoanStatus _status, , , ) = lendingProtocol.loans(loanId);
       assertEq(uint256(_status), uint256(LendingProtocol.LoanStatus.Defaulted));
   }
   
   function testLiquidationAuction() public {
       // Setup: Create and fund a loan, then default
       setupFundedLoan();
       vm.warp(block.timestamp + 366 days);
       vm.prank(loanOfficer);
       lendingProtocol.markAsDefaulted(loanId);
       
       // Start liquidation auction
       uint256 auctionDuration = 7 days;
       vm.prank(loanOfficer);
       lendingProtocol.startLiquidationAuction(loanId, auctionDuration);
       
       // Check auction details
       (
           uint256 _loanId,
           uint256 _propertyId,
           uint256 _startingPrice,
           ,
           uint256 _startTime,
           uint256 _endTime,
           ,
           ,
           bool _finalized
       ) = lendingProtocol.auctions(loanId);
       
       assertEq(_loanId, loanId);
       assertEq(_propertyId, propertyId);
       assertTrue(_startingPrice > 0);
       assertEq(_startTime, block.timestamp);
       assertEq(_endTime, block.timestamp + auctionDuration);
       assertFalse(_finalized);
   }
   
   function testAdminFunctions() public {
       address newLoanOfficer = address(0x4);
       
       // Add loan officer
       lendingProtocol.addLoanOfficer(newLoanOfficer);
       assertTrue(lendingProtocol.loanOfficers(newLoanOfficer));
       
       // Remove loan officer
       lendingProtocol.removeLoanOfficer(newLoanOfficer);
       assertFalse(lendingProtocol.loanOfficers(newLoanOfficer));
       
       // Update protocol parameters
       uint256 newMinLoanAmount = 2 ether;
       uint256 newMaxLoanToValueRatio = 6000; // 60%
       uint256 newLiquidationThreshold = 7500; // 75%
       uint256 newLiquidationPenalty = 1500; // 15%
       uint256 newProtocolFeePercentage = 300; // 3%
       
       lendingProtocol.updateProtocolParameters(
           newMinLoanAmount,
           newMaxLoanToValueRatio,
           newLiquidationThreshold,
           newLiquidationPenalty,
           newProtocolFeePercentage
       );
       
       assertEq(lendingProtocol.minLoanAmount(), newMinLoanAmount);
       assertEq(lendingProtocol.maxLoanToValueRatio(), newMaxLoanToValueRatio);
       assertEq(lendingProtocol.liquidationThreshold(), newLiquidationThreshold);
       assertEq(lendingProtocol.liquidationPenalty(), newLiquidationPenalty);
       assertEq(lendingProtocol.protocolFeePercentage(), newProtocolFeePercentage);
   }
   
   // Helper function to setup a funded loan
   function setupFundedLoan() internal {
       uint256 loanAmount = 50 ether;
       uint256 interestRate = 500;
       uint256 term = 365 days;
       
       // Ensure all accounts have enough ETH
       vm.deal(borrower, 100 ether);
       vm.deal(loanOfficer, 100 ether);
       
       vm.prank(borrower);
       loanId = lendingProtocol.requestLoan(
           propertyId,
           loanAmount,
           interestRate,
           term
       );
       
       vm.prank(loanOfficer);
       lendingProtocol.approveLoan(loanId);
       
       vm.prank(borrower);
       realEstateToken.approve(address(lendingProtocol), propertyId);
       
       vm.prank(loanOfficer);
       lendingProtocol.fundLoan{value: loanAmount}(loanId);
       
       // Verify loan is active
       (, , , , , , , , , , , LendingProtocol.LoanStatus _status, , , ) = lendingProtocol.loans(loanId);
       assertEq(uint256(_status), uint256(LendingProtocol.LoanStatus.Active));
   }
   
   // Fallback and receive functions to accept ETH
   receive() external payable {}
   fallback() external payable {}
}