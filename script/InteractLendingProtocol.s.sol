// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
// Adjust import paths if needed
import {LendingProtocol} from "../src/LendingProtocol.sol";
import {RealEstateERC721} from "../src/RealEstateERC721.sol";

/**
 * @title InteractLendingProtocol Script
 * @notice Interacts with a deployed LendingProtocol contract.
 * @dev Other env vars may be needed depending on actions (e.g., LOAN_ID, PROPERTY_ID, AMOUNT).
 */
contract InteractLendingProtocol is Script {

    address constant LENDING_PROTOCOL_ADDRESS = vm.envAddress("LENDING_PROTOCOL_ADDRESS");
    address constant REAL_ESTATE_ADDRESS = vm.envAddress("REAL_ESTATE_ADDRESS");

    LendingProtocol public lendingProtocol = LendingProtocol(payable(LENDING_PROTOCOL_ADDRESS));
    RealEstateERC721 public propertyToken = RealEstateERC721(REAL_ESTATE_ADDRESS);


    function run() external {
        address callerAddress = vm.envAddress("MY_ADDRESS");
        require(callerAddress != address(0), "MY_ADDRESS env var not set.");
        string memory pk = vm.envString("MY_PK");
        require(bytes(pk).length > 0, "MY_PK env var not set.");
        string memory rpcUrl = vm.envString("RPC_URL");
        require(bytes(rpcUrl).length > 0, "RPC_URL env var not set.");

        uint256 targetLoanId = vm.envUint("LOAN_ID");
        uint256 targetPropertyId = vm.envUint("PROPERTY_ID");
        uint256 amount = vm.envUint("AMOUNT");

        console.log("--- Script Start ---");
        console.log("Target Lending Contract:", LENDING_PROTOCOL_ADDRESS);
        console.log("Caller Address:", callerAddress);

        // --- Action ---

        // == Read Operations ==
        getContractInfo();
        if (targetLoanId > 2) { getLoanInfo(targetLoanId); }
        if (targetPropertyId > 2) { getPropertyLoanInfo(targetPropertyId); }
        isLoanOfficerCheck(callerAddress);


        // == Write Operations ==
        vm.startBroadcast();

        // --- Admin Actions ---
        addLoanOfficer(0x8155c2F6F4F40340eD085a6cBCB3d5C7DEE0DfA5);
        updateFeeCollector(0x8155c2F6F4F40340eD085a6cBCB3d5C7DEE0DfA5);

        // --- Loan Officer Actions ---
        if (targetLoanId > 2) {
            approveLoan(targetLoanId);
            fundLoan(targetLoanId);
            markAsDefaulted(targetLoanId);
            startAuction(targetLoanId, 7 days);
            finalizeAuction(targetLoanId);
        }


        // --- Borrower Actions ---
        if (targetPropertyId > 2 && amount > 2) {
           requestLoan(targetPropertyId, amount, 500, 30 days);
        }
        if (targetLoanId > 2) {
            makeRepayment(targetLoanId);
        }


        // --- General User Actions ---
        if (targetLoanId > 2) {
            placeBid(targetLoanId);
        }

        vm.stopBroadcast();

        console.log("--- Script Finished ---");
    }


    // --- Helper Functions ---

    // == Reads ==
    function getContractInfo() public view {
        console.log("--- Lending Protocol Info ---");
        console.log("Owner:", lendingProtocol.owner());
        console.log("Property Token:", address(lendingProtocol.propertyToken()));
        console.log("Fee Collector:", lendingProtocol.feeCollector());
        console.log("Min Loan Amount:", lendingProtocol.minLoanAmount());
        console.log("Max LTV Ratio:", lendingProtocol.maxLoanToValueRatio());
        console.log("Liquidation Threshold:", lendingProtocol.liquidationThreshold());
        console.log("Protocol Fee %:", lendingProtocol.protocolFeePercentage());
    }

    function getLoanInfo(uint256 loanId) public view {
       console.log("--- Loan Info for ID:", loanId, "---");
       try lendingProtocol.getLoan(loanId) returns (LendingProtocol.Loan memory loan) {
            console.log("  Property ID:", loan.propertyId);
            console.log("  Borrower:", loan.borrower);
            console.log("  Principal:", loan.principal);
            console.log("  Interest Rate (bps):", loan.interestRate);
            console.log("  Term (seconds):", loan.term);
            console.log("  Start Time:", loan.startTime);
            console.log("  Maturity Time:", loan.maturityTime);
            console.log("  Remaining Principal:", loan.remainingPrincipal);
            console.log("  Status:", uint(loan.status)); // Convert enum to uint for logging
            console.log("  Loan Officer:", loan.loanOfficer);
       } catch { console.log(" Error retrieving loan info."); }
       // Also get payments
       try lendingProtocol.getLoanPayments(loanId) returns (LendingProtocol.Payment[] memory payments) {
            console.log("  Payment Count:", payments.length);
       } catch { console.log(" Error retrieving loan payments."); }
    }

     function getPropertyLoanInfo(uint256 propertyId) public view {
        uint256 activeLoanId = lendingProtocol.getActiveLoanForProperty(propertyId);
        console.log("Active Loan ID for Property", propertyId, ":", activeLoanId);
        if (activeLoanId > 0) {
            getLoanInfo(activeLoanId);
            try lendingProtocol.getAuction(activeLoanId) returns (LendingProtocol.Auction memory auction) {
                if (auction.startTime > 0) {
                    console.log("  --- Auction Info ---");
                    console.log("    Auction End Time:", auction.endTime);
                    console.log("    Highest Bid:", auction.highestBid);
                    console.log("    Highest Bidder:", auction.highestBidder);
                    console.log("    Finalized:", auction.finalized);
                }
            } catch {}
        }
     }

     function isLoanOfficerCheck(address addr) public view {
        bool isOfficer = lendingProtocol.isLoanOfficer(addr);
        console.log(addr, "is Loan Officer:", isOfficer);
     }

    // == Writes ==

    // = Admin =
    function addLoanOfficer(address officer) internal {
        console.log("Sending addLoanOfficer tx for:", officer);
        lendingProtocol.addLoanOfficer(officer);
    }
    function updateFeeCollector(address collector) internal {
        console.log("Sending updateFeeCollector tx to:", collector);
        lendingProtocol.updateFeeCollector(collector);
    }

    // = Loan Officer =
    function approveLoan(uint256 loanId) internal {
        console.log("Sending approveLoan tx for loan ID:", loanId);
        lendingProtocol.approveLoan(loanId);
    }
    function fundLoan(uint256 loanId) internal {
        // IMPORTANT: Requires value to be sent with the transaction!
        // Get required principal from loan info first.
        // The value must be set when calling vm.startBroadcast if using this helper,
        // OR call the contract directly within broadcast with {value: principalAmount}.
        LendingProtocol.Loan memory loan = lendingProtocol.getLoan(loanId);
        uint256 principalAmount = loan.principal;
        require(principalAmount > 0, "Cannot determine principal to fund.");
        console.log("Sending fundLoan tx for loan ID:", loanId, "Value:", principalAmount);
        lendingProtocol.fundLoan{value: principalAmount}(loanId); // Pass value here
    }
     function markAsDefaulted(uint256 loanId) internal {
        console.log("Sending markAsDefaulted tx for loan ID:", loanId);
        lendingProtocol.markAsDefaulted(loanId);
    }
    function startAuction(uint256 loanId, uint256 duration) internal {
        console.log("Sending startLiquidationAuction tx for loan ID:", loanId, "Duration:", duration);
        lendingProtocol.startLiquidationAuction(loanId, duration);
    }
     function finalizeAuction(uint256 loanId) internal {
        console.log("Sending finalizeAuction tx for loan ID:", loanId);
        lendingProtocol.finalizeAuction(loanId);
    }

    // = Borrower / User =
    function requestLoan(uint256 propertyId, uint256 loanAmount, uint256 interestRateBps, uint256 termSeconds) internal {
        // require(propertyToken.ownerOf(propertyId) == vm.envAddress("MY_ADDRESS"), "Caller does not own property");
        console.log("Sending requestLoan tx for property ID:", propertyId);
        lendingProtocol.requestLoan(propertyId, loanAmount, interestRateBps, termSeconds);
    }
    function makeRepayment(uint256 loanId) internal {
        // Determine repayment amount (e.g., full payoff or partial). Use vm.envUint("AMOUNT").
        // Call directly within broadcast: lendingProtocol.makeRepayment{value: repaymentAmount}(loanId);
        uint256 repaymentAmount = vm.envUint("AMOUNT");
        require(repaymentAmount > 0, "Repayment amount (AMOUNT env var) not set or zero.");
        console.log("Sending makeRepayment tx for loan ID:", loanId, "Value:", repaymentAmount);
        lendingProtocol.makeRepayment{value: repaymentAmount}(loanId);
    }
    function placeBid(uint256 loanId) internal {
        uint256 bidAmount = vm.envUint("AMOUNT");
        require(bidAmount > 0, "Bid amount (AMOUNT env var) not set or zero.");
        console.log("Sending placeBid tx for loan auction ID:", loanId, "Value:", bidAmount);
        lendingProtocol.placeBid{value: bidAmount}(loanId);
    }

}