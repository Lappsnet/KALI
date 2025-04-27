// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {RentalAgreement} from "../src/RentalAgreement.sol";
import {RealEstateERC721} from "../src/RealEstateERC721.sol";

/**
 * @title InteractRentalAgreement Script
 */
contract InteractRentalAgreement is Script {

    address constant RENTAL_AGREEMENT_ADDRESS = vm.envAddress("RENTAL_AGREEMENT_ADDRESS");
    address constant REAL_ESTATE_ADDRESS = vm.envAddress("REAL_ESTATE_ADDRESS");

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
        uint256 amountWei = vm.envUint("AMOUNT_WEI");

        console.log("--- Script Start ---");
        console.log("Target Rental Contract:"); console.logAddress(RENTAL_AGREEMENT_ADDRESS);
        console.log("Executing as Address:"); console.logAddress(callerAddress);

        // == Read Operations ==
        // if (rentalId > 0) { getRentalInfo(rentalId); }
        // checkRole(callerAddress, rentalAgreement.RENTAL_MANAGER_ROLE());
        // getPropertyTokenAddress();

        // == Write Operations ==
        console.log("--- Broadcasting Transactions ---");
        vm.startBroadcast();

        // --- Admin Actions ---
        grantManagerRole(0x251d8803f71a8402dD96893E0709588e99F6267c);

        // --- Landlord Actions ---
        if (propertyId > 0) { approvePropertyForRental(propertyId); }

        // --- Manager/Landlord/Tenant Actions ---
        if (propertyId > 0 && tenantAddress != address(0)) {
            createRentalExample(propertyId, tenantAddress);
        }
        if (rentalId > 0) { expireRental(rentalId); }
        if (rentalId > 0) { terminateRental(rentalId, "Lease violation - Test"); }
        if (rentalId > 0) { returnSecurityDepositExample(rentalId, 0); }
        if (rentalId > 0) { returnSecurityDepositExample(rentalId, 0); } // 0 deductions

        // --- Tenant Actions ---
        if (rentalId > 0) { payRent(rentalId); }

        vm.stopBroadcast();

        console.log("--- Script Finished ---");
    }

    // == Reads ==
    function getRentalInfo(uint256 rentalId) public view { }
    function checkRentOverdue(uint256 rentalId) public view { }
    function checkRole(address account, bytes32 role) public view { }
    function getPropertyTokenAddress() public view { }

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
         uint256 securityDepositWei = 0.1 ether;
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

     function payRent(uint256 rentalId) internal {
         uint256 rentAmountWei = 0.1 ether;
         require(rentAmountWei > 0, "Rent amount must be positive.");

         console.log("--> Sending payRent tx for rental ID:"); console.logUint(rentalId);
         console.log("    Amount (Wei):"); console.logUint(rentAmountWei);
         rentalAgreement.payRent{value: rentAmountWei}(rentalId);
         console.log("    payRent transaction sent.");
     }

}