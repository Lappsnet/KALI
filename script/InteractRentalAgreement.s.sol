// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {RentalAgreement} from "../src/RentalAgreement.sol";
import {RealEstateERC721} from "../src/RealEstateERC721.sol";

/**
 * @title InteractRentalAgreement Script
 * @notice Interacts with a deployed RentalAgreement contract.
 * @dev WARNING: Multiple write calls are uncommented below. This is for demonstration ONLY.
 * @dev Run ONE action per execution with the correct PK/Role/Prerequisites.
 * @dev Required Env Vars: MY_PK, MY_ADDRESS, RPC_URL. Others depend on uncommented action.
 */
contract InteractRentalAgreement is Script {

    // <<< --- Set Deployed Contract Addresses --- >>>
    address constant RENTAL_AGREEMENT_ADDRESS = 0x60B5cC9C3A6bb42A293Cd445d67DE23CcdA442c3; // <--- Verify/Replace
    address constant REAL_ESTATE_ADDRESS = 0xD95d1FF6618AEE41e431C6A2cfa3D5e8ff3d5f33; // <--- Verify/Replace

    RentalAgreement public rentalAgreement = RentalAgreement(payable(RENTAL_AGREEMENT_ADDRESS));
    RealEstateERC721 public propertyToken = RealEstateERC721(REAL_ESTATE_ADDRESS);

    function run() external {
        address callerAddress = vm.envAddress("MY_ADDRESS");
        require(callerAddress != address(0), "MY_ADDRESS env var not set.");
        string memory pk = vm.envString("MY_PK");
        require(bytes(pk).length > 0, "MY_PK env var not set.");
        string memory rpcUrl = vm.envString("RPC_URL");
        require(bytes(rpcUrl).length > 0, "RPC_URL env var not set.");

        uint256 propertyId = vm.envUint("PROPERTY_ID");
        uint256 rentalId = vm.envUint("RENTAL_ID");
        address tenantAddress = vm.envAddress("TENANT_ADDRESS");
        uint256 amountWei = vm.envUint("AMOUNT_WEI"); // Used only if payRent condition changes

        console.log("--- Script Start ---");
        console.log("Target Rental Contract:"); console.logAddress(RENTAL_AGREEMENT_ADDRESS);
        console.log("Executing as Address:"); console.logAddress(callerAddress);

        // == Read Operations (Optional - Uncomment if needed) ==
        // if (rentalId > 0) { getRentalInfo(rentalId); }
        // checkRole(callerAddress, rentalAgreement.RENTAL_MANAGER_ROLE());
        // getPropertyTokenAddress();

        // == Write Operations ==
        // WARNING: Running all these sequentially will likely fail due to role/dependency issues.
        console.log("--- Broadcasting Transactions (Multiple Actions Uncommented - Likely to Fail!) ---");
        vm.startBroadcast(); // Use PK matching the FIRST uncommented action's required role

        // --- Admin Actions (Requires OWNER PK) ---
        grantManagerRole(0x251d8803f71a8402dD96893E0709588e99F6267c); // Example: Grant role

        // --- Landlord Actions (Requires LANDLORD PK for propertyId) ---
        if (propertyId > 0) { approvePropertyForRental(propertyId); } // Must succeed before createRental

        // --- Manager/Landlord/Tenant Actions (Requires specific PKs/States) ---
        // Create requires TENANT PK (usually), property approved, tenant funds >= 0.1 ETH + Gas
        if (propertyId > 0 && tenantAddress != address(0)) {
            createRentalExample(propertyId, tenantAddress);
        }
        // Expire requires MANAGER PK, rental exists and time passed
        if (rentalId > 0) { expireRental(rentalId); }
        // Terminate requires MANAGER PK, rental exists
        if (rentalId > 0) { terminateRental(rentalId, "Lease violation - Test"); }
        // Return Deposit requires MANAGER PK, rental terminated/expired
        if (rentalId > 0) { returnSecurityDepositExample(rentalId, 0); } // 0 deductions

        // --- Tenant Actions (Requires TENANT PK for rentalId) ---
        // Pay Rent requires TENANT PK, rental exists, tenant funds >= 0.1 ETH + Gas
        if (rentalId > 0) { // Check only if rentalId is set
             payRent(rentalId); // Uses hardcoded 0.1 ETH now
        }

        vm.stopBroadcast();

        console.log("--- Script Finished ---");
    }

    // --- Helper Functions ---

    // == Reads ==
    function getRentalInfo(uint256 rentalId) public view { /* ... as before ... */ }
    function checkRentOverdue(uint256 rentalId) public view { /* ... as before ... */ }
    function checkRole(address account, bytes32 role) public view { /* ... as before ... */ }
    function getPropertyTokenAddress() public view { /* ... as before ... */ }

    // == Writes ==
    function grantManagerRole(address manager) internal {
        console.log("--> Sending grantRole(RENTAL_MANAGER_ROLE) tx for:"); console.logAddress(manager);
        rentalAgreement.grantRole(rentalAgreement.RENTAL_MANAGER_ROLE(), manager);
        console.log("    grantRole transaction sent.");
    }

    function approvePropertyForRental(uint256 propertyId) internal {
         console.log("--> Sending approve tx to RealEstate contract for property ID:"); console.logUint(propertyId);
         console.log("    Approving address (Rental Contract):"); console.logAddress(RENTAL_AGREEMENT_ADDRESS);
         propertyToken.approve(RENTAL_AGREEMENT_ADDRESS, propertyId);
         console.log("    Approval transaction sent.");
    }

    function createRentalExample(uint256 propertyId, address tenant) internal {
         uint256 monthlyRentWei = 0.5 ether;
         uint256 securityDepositWei = 0.1 ether; // Using 0.1 ETH deposit
         uint256 durationMonths = 12;
         string memory agreementIpfsUri = "ipfs://bafkreierpf7nj3z6nyzk2ift5hsdppcxxdqbmzbhv2xjkagvkpibxp2yga";

         console.log("--> Attempting createRental tx for property ID:"); console.logUint(propertyId);
         console.log("    Tenant:"); console.logAddress(tenant);
         console.log("    Security Deposit Required (msg.value):"); console.logUint(securityDepositWei);

         rentalAgreement.createRental{value: securityDepositWei}(
             propertyId, tenant, monthlyRentWei, securityDepositWei,
             durationMonths, agreementIpfsUri
         );
         console.log("    createRental transaction sent.");
    }

     function expireRental(uint256 rentalId) internal {
         console.log("--> Sending expireRental tx for rental ID:"); console.logUint(rentalId);
         rentalAgreement.expireRental(rentalId);
         console.log("    expireRental transaction sent.");
     }

     function terminateRental(uint256 rentalId, string memory reason) internal {
          console.log("--> Sending terminateRental tx for rental ID:"); console.logUint(rentalId);
          console.log("    Reason:"); console.log(reason);
          rentalAgreement.terminateRental(rentalId, reason);
          console.log("    terminateRental transaction sent.");
     }

     function returnSecurityDepositExample(uint256 rentalId, uint256 deductionsWei) internal {
         console.log("--> Sending returnSecurityDeposit tx for rental ID:"); console.logUint(rentalId);
         console.log("    Deductions (Wei):"); console.logUint(deductionsWei);
         rentalAgreement.returnSecurityDeposit(rentalId, deductionsWei);
         console.log("    returnSecurityDeposit transaction sent.");
     }

     function payRent(uint256 rentalId) internal { // Removed amount argument
         // --- *** UPDATED RENT AMOUNT *** ---
         uint256 rentAmountWei = 0.1 ether; // Hardcoded to 0.1 ETH
         // --- *** END UPDATE *** ---
         require(rentAmountWei > 0, "Rent amount must be positive."); // Keep check

         console.log("--> Sending payRent tx for rental ID:"); console.logUint(rentalId);
         console.log("    Amount (Wei):"); console.logUint(rentAmountWei); // Log the hardcoded amount
         rentalAgreement.payRent{value: rentAmountWei}(rentalId); // Send the hardcoded amount
         console.log("    payRent transaction sent.");
     }

}