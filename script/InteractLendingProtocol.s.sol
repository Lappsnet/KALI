// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
// Adjust import paths if needed
import {LendingProtocol} from "../src/LendingProtocol.sol";
import {RealEstateERC721} from "../src/RealEstateERC721.sol";

/**
 * @title InteractLendingProtocol Script
 * @notice Interacts with a deployed LendingProtocol contract.
 * @dev Requires environment variables: MY_PK, MY_ADDRESS, RPC_URL.
 * @dev Other env vars may be needed depending on actions (e.g., LOAN_ID, PROPERTY_ID, AMOUNT).
 */
contract InteractLendingProtocol is Script {

    // <<< --- Configuration: Set Deployed Contract Addresses --- >>>
    address constant LENDING_PROTOCOL_ADDRESS = 0x6B2C23cf212011beBF015FDF05E0E5414754701c; // <--- REPLACE THIS!
    address constant REAL_ESTATE_ADDRESS = 0xD95d1FF6618AEE41e431C6A2cfa3D5e8ff3d5f33; // <--- REPLACE (Needed for property context)

    // Get instance of the LendingProtocol contract
    LendingProtocol public lendingProtocol = LendingProtocol(payable(LENDING_PROTOCOL_ADDRESS));
    // Get instance of the RealEstateERC721 contract (needed for property info sometimes)
    RealEstateERC721 public propertyToken = RealEstateERC721(REAL_ESTATE_ADDRESS);


    // --- Main Execution Function ---
    function run() external {
        // Load required environment variables
        address callerAddress = vm.envAddress("MY_ADDRESS");
        require(callerAddress != address(0), "MY_ADDRESS env var not set.");
        string memory pk = vm.envString("MY_PK");
        require(bytes(pk).length > 0, "MY_PK env var not set.");
        string memory rpcUrl = vm.envString("RPC_URL");
        require(bytes(rpcUrl).length > 0, "RPC_URL env var not set.");

        // Optional environment variables for specific actions
        uint256 targetLoanId = vm.envUint("LOAN_ID");       // e.g., export LOAN_ID=1
        uint256 targetPropertyId = vm.envUint("PROPERTY_ID"); // e.g., export PROPERTY_ID=1
        uint256 amount = vm.envUint("AMOUNT");             // Amount in WEI, e.g., export AMOUNT=1000000000000000000

        console.log("--- Script Start ---");
        console.log("Target Lending Contract:", LENDING_PROTOCOL_ADDRESS);
        console.log("Caller Address:", callerAddress);

        // --- Choose Actions ---
        // Uncomment and modify the functions you want to execute below.

        // == Read Operations ==
        getContractInfo();
        if (targetLoanId > 2) { getLoanInfo(targetLoanId); }
        if (targetPropertyId > 2) { getPropertyLoanInfo(targetPropertyId); }
        isLoanOfficerCheck(callerAddress); // Check if caller is officer


        // == Write Operations ==
        // ** Uncomment the entire block below to execute state-changing transactions. **
        vm.startBroadcast();

        // --- Admin Actions (Requires MY_PK to be owner) ---
        //addLoanOfficer(0x8155c2F6F4F40340eD085a6cBCB3d5C7DEE0DfA5);
        updateFeeCollector(0x8155c2F6F4F40340eD085a6cBCB3d5C7DEE0DfA5);

        // --- Loan Officer Actions (Requires MY_PK to be an officer) ---
        if (targetLoanId > 2) {
            approveLoan(targetLoanId);
            fundLoan(targetLoanId); // This requires msg.value, see helper function notes
            markAsDefaulted(targetLoanId);
            startAuction(targetLoanId, 7 days); // 7 days duration example
            finalizeAuction(targetLoanId);
        }


        // --- Borrower Actions (Requires MY_PK to be borrower/property owner) ---
        if (targetPropertyId > 2 && amount > 2) {
           requestLoan(targetPropertyId, amount, 500, 30 days); // 5% rate, 30 day term example
        }
        if (targetLoanId > 2) {
            makeRepayment(targetLoanId); // Requires msg.value, see helper notes
        }


        // --- General User Actions ---
        if (targetLoanId > 2) {
            placeBid(targetLoanId); // Requires msg.value, see helper notes
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
            // Log details of last few payments if needed
       } catch { console.log(" Error retrieving loan payments."); }
    }

     function getPropertyLoanInfo(uint256 propertyId) public view {
        uint256 activeLoanId = lendingProtocol.getActiveLoanForProperty(propertyId);
        console.log("Active Loan ID for Property", propertyId, ":", activeLoanId);
        if (activeLoanId > 0) {
            getLoanInfo(activeLoanId);
            // Check for auction too
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
         // Optional: Check property owner matches callerAddress before sending
        // require(propertyToken.ownerOf(propertyId) == vm.envAddress("MY_ADDRESS"), "Caller does not own property");
        console.log("Sending requestLoan tx for property ID:", propertyId);
        lendingProtocol.requestLoan(propertyId, loanAmount, interestRateBps, termSeconds);
    }
    function makeRepayment(uint256 loanId) internal {
        // IMPORTANT: Requires value to be sent!
        // Determine repayment amount (e.g., full payoff or partial). Use vm.envUint("AMOUNT").
        // Call directly within broadcast: lendingProtocol.makeRepayment{value: repaymentAmount}(loanId);
        uint256 repaymentAmount = vm.envUint("AMOUNT");
        require(repaymentAmount > 0, "Repayment amount (AMOUNT env var) not set or zero.");
        console.log("Sending makeRepayment tx for loan ID:", loanId, "Value:", repaymentAmount);
        lendingProtocol.makeRepayment{value: repaymentAmount}(loanId);
    }
    function placeBid(uint256 loanId) internal {
        // IMPORTANT: Requires value (bid amount) to be sent! Use vm.envUint("AMOUNT").
        uint256 bidAmount = vm.envUint("AMOUNT");
        require(bidAmount > 0, "Bid amount (AMOUNT env var) not set or zero.");
         // Optional: Check auction exists and bid is high enough before sending
        console.log("Sending placeBid tx for loan auction ID:", loanId, "Value:", bidAmount);
        lendingProtocol.placeBid{value: bidAmount}(loanId);
    }

} // End of contract InteractLendingProtocol