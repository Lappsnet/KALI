// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {MarketplaceOrchestrator} from "../src/MarketplaceOrchestrator.sol";
import {RealEstateERC721} from "../src/RealEstateERC721.sol";

/**
 * @title InteractMarketplaceOrchestrator Script
 * @notice Interacts with a deployed MarketplaceOrchestrator contract.
 * @dev Other env vars depend on action: PROPERTY_ID, SALE_PRICE, RENT_PRICE, TARGET_ADDRESS, DOC_URI etc.
 */
contract InteractMarketplaceOrchestrator is Script {

    address constant ORCHESTRATOR_ADDRESS = 0xD2DD7e9d3aDF3D1AdFed1eA5A2771ECf507885e5;

    MarketplaceOrchestrator public orchestrator = MarketplaceOrchestrator(ORCHESTRATOR_ADDRESS);

    function run() external {
        address callerAddress = vm.envAddress("MY_ADDRESS");
        require(callerAddress != address(0), "MY_ADDRESS env var not set.");
        string memory pk = vm.envString("MY_PK");
        require(bytes(pk).length > 0, "MY_PK env var not set.");
        string memory rpcUrl = vm.envString("RPC_URL");
        require(bytes(rpcUrl).length > 0, "RPC_URL env var not set.");

        uint256 propertyId = vm.envUint("PROPERTY_ID");         // e.g., export PROPERTY_ID=5
        uint256 salePriceWei = vm.envUint("SALE_PRICE_WEI");   // e.g., export SALE_PRICE_WEI=2 ether
        uint256 rentPriceWei = vm.envUint("RENT_PRICE_WEI");   // e.g., export RENT_PRICE_WEI=500000000000000000 (0.5 ETH)
        address targetAddress = vm.envAddress("TARGET_ADDRESS"); // For role grants
        address tenantAddress = vm.envAddress("TENANT_ADDRESS"); // For initiateRental
        string memory docUri = vm.envString("DOC_URI");         // e.g., export DOC_URI="ipfs://YourDocCID"

        console.log("--- Script Start: Interact MarketplaceOrchestrator ---");
        console.log("Target Orchestrator Contract:"); console.logAddress(ORCHESTRATOR_ADDRESS);
        console.log("Executing as Address:"); console.logAddress(callerAddress);

        // ---Action ---

        // == Read Operations ==
        //if (propertyId > 0) { getListingInfo(propertyId); }
        //getAllListings();
        //getSaleListings();
        //getRentListings();
        //if (targetAddress != address(0)) { checkRole(targetAddress, orchestrator.OPERATOR_ROLE()); }


        // == Write Operations ==
        
        vm.startBroadcast();


        // --- Property Owner Actions (MY_PK = Owner of PROPERTY_ID) ---
        // List Property (Requires PROPERTY_ID, SALE_PRICE_WEI, RENT_PRICE_WEI env vars)
        // Set prices to 0 if not listing for sale/rent respectively.
        //if (propertyId > 0) {
         //   bool listForSale = true; // Set true/false
         //   bool listForRent = true; // Set true/false
         //   exampleListProperty(propertyId, listForSale, listForRent, salePriceWei, rentPriceWei);
        //}
        // Unlist Property (Requires PROPERTY_ID env var)
        // if (propertyId > 0) { exampleUnlistProperty(propertyId); }
        // Update Listing (Requires PROPERTY_ID, SALE_PRICE_WEI, RENT_PRICE_WEI env vars)
        // if (propertyId > 0) {
        //     bool updateForSale = true; // Set true/false
        //     bool updateForRent = false; // Set true/false
        //     exampleUpdateListing(propertyId, updateForSale, updateForRent, salePriceWei, rentPriceWei);
        // }

        // --- Actions Initiating Other Contracts (Caller role depends on underlying contract) ---
        // Initiate Sale (Requires PROPERTY_ID, DOC_URI env vars. Caller must own property. NFT must be approved for Sale Contract)
        if (propertyId > 0 && bytes(docUri).length > 0) { exampleInitiateSale(propertyId, docUri); }
        // Initiate Rental (Requires PROPERTY_ID, TENANT_ADDRESS, DOC_URI env vars. Caller (Tenant) pays deposit.)
        // Property must be approved for Rental Contract by Landlord first.
        if (propertyId > 0 && tenantAddress != address(0) && bytes(docUri).length > 0) {
            uint256 deposit = 0.1 ether; // Example deposit amount - MUST MATCH RENTAL CONTRACT EXPECTATION
            uint256 duration = 12; // Example duration in months
            exampleInitiateRental(propertyId, tenantAddress, deposit, duration, docUri);
        }


        // --- Admin Role Actions ---
        if (targetAddress != address(0)) { exampleGrantOperatorRole(targetAddress); }
        if (targetAddress != address(0)) { exampleRevokeOperatorRole(targetAddress); }


        vm.stopBroadcast();
    

        console.log("--- Script Finished ---");
    }


    // == Reads ==
    function getListingInfo(uint256 propertyId) public view {
        console.log("Querying listing info for Property ID:"); console.logUint(propertyId);
        try orchestrator.getListing(propertyId) returns (MarketplaceOrchestrator.PropertyListing memory listing) {
            if (listing.listedAt == 0) {
                console.log("  Property not currently listed via orchestrator.");
                return;
            }
            console.log("  --- Listing Details ---");
            console.log("  Owner:"); console.logAddress(listing.owner);
            console.log("  For Sale:"); console.log(listing.forSale);
            console.log("  For Rent:"); console.log(listing.forRent);
            console.log("  Sale Price (Wei):"); console.logUint(listing.salePrice);
            console.log("  Monthly Rent (Wei):"); console.logUint(listing.monthlyRent);
            console.log("  Listed At:"); console.logUint(listing.listedAt);
            console.log("  ---------------------");
        } catch Error(string memory reason) { console.log(" Error getting listing:", reason); }
        catch { console.log(" Low-level error getting listing."); }
    }

    function getAllListings() public view {
        uint256[] memory ids = orchestrator.getAllListedProperties();
        console.log("All Listed Property IDs (Count:", ids.length, "):");
        for(uint i = 0; i < ids.length; ++i) {
            console.log("  - ", ids[i]);
        }
    }

    function getSaleListings() public view {
        uint256[] memory ids = orchestrator.getPropertiesForSale();
        console.log("Properties Listed For Sale (Count:", ids.length, "):");
        for(uint i = 0; i < ids.length; ++i) {
            console.log("  - ", ids[i]);
        }
    }

    function getRentListings() public view {
        uint256[] memory ids = orchestrator.getPropertiesForRent();
        console.log("Properties Listed For Rent (Count:", ids.length, "):");
        for(uint i = 0; i < ids.length; ++i) {
            console.log("  - ", ids[i]);
        }
    }

    function checkRole(address account, bytes32 role) public view {
         string memory roleName = "UNKNOWN_ROLE";
         if(role == orchestrator.DEFAULT_ADMIN_ROLE()) roleName = "DEFAULT_ADMIN_ROLE";
         else if (role == orchestrator.OPERATOR_ROLE()) roleName = "OPERATOR_ROLE";
         else roleName = vm.toString(role);

         bool hasIt = orchestrator.hasRole(role, account);
         console.log("Role check for account:"); console.logAddress(account);
         console.log("  Role Name Checked:", roleName);
         console.log("  Has Role:", hasIt);
    }


    // = Property Owner =
    function exampleListProperty(uint256 propertyId, bool forSale, bool forRent, uint256 salePrice, uint256 monthlyRent) internal {
        console.log("--> Sending listProperty tx for Property ID:"); console.logUint(propertyId);
        console.log("    For Sale:", forSale); console.log("    Sale Price:", salePrice);
        console.log("    For Rent:", forRent); console.log("    Rent Price:", monthlyRent);
        orchestrator.listProperty(propertyId, forSale, forRent, salePrice, monthlyRent);
        console.log("    listProperty transaction sent.");
    }

    function exampleUnlistProperty(uint256 propertyId) internal {
        console.log("--> Sending unlistProperty tx for Property ID:"); console.logUint(propertyId);
        orchestrator.unlistProperty(propertyId);
        console.log("    unlistProperty transaction sent.");
    }

    function exampleUpdateListing(uint256 propertyId, bool forSale, bool forRent, uint256 salePrice, uint256 monthlyRent) internal {
        console.log("--> Sending updateListing tx for Property ID:"); console.logUint(propertyId);
        console.log("    For Sale:", forSale); console.log("    Sale Price:", salePrice);
        console.log("    For Rent:", forRent); console.log("    Rent Price:", monthlyRent);
        orchestrator.updateListing(propertyId, forSale, forRent, salePrice, monthlyRent);
        console.log("    updateListing transaction sent.");
    }

    // = Initiating Actions on Other Contracts (Caller role varies) =
    function exampleInitiateSale(uint256 propertyId, string memory saleDocUri) internal {
        require(bytes(saleDocUri).length > 0, "Document URI needed.");
        console.log("--> Sending initiateSaleFromListing tx for Property ID:"); console.logUint(propertyId);
        console.log("    Document URI:", saleDocUri);
        orchestrator.initiateSaleFromListing(propertyId, saleDocUri);
        console.log("    initiateSaleFromListing transaction sent.");
    }

    function exampleInitiateRental(uint256 propertyId, address tenant, uint256 securityDeposit, uint256 durationMonths, string memory agreementUri) internal {
        require(tenant != address(0), "Tenant address needed.");
        require(securityDeposit > 0, "Security deposit needed.");
        require(durationMonths > 0, "Duration needed.");
        require(bytes(agreementUri).length > 0, "Agreement URI needed.");
        console.log("--> Sending initiateRentalFromListing tx for Property ID:"); console.logUint(propertyId);
        console.log("    Tenant:"); console.logAddress(tenant);
        console.log("    Security Deposit (msg.value):"); console.logUint(securityDeposit);
        orchestrator.initiateRentalFromListing{value: securityDeposit}(
            propertyId, tenant, securityDeposit, durationMonths, agreementUri
        );
        console.log("    initiateRentalFromListing transaction sent.");
    }

    // = Admin Role =
    function exampleGrantOperatorRole(address operator) internal {
        console.log("--> Sending grantRole(OPERATOR_ROLE) tx for:"); console.logAddress(operator);
        orchestrator.grantRole(orchestrator.OPERATOR_ROLE(), operator);
        console.log("    grantRole transaction sent.");
    }
    function exampleRevokeOperatorRole(address operator) internal {
        console.log("--> Sending revokeRole(OPERATOR_ROLE) tx for:"); console.logAddress(operator);
        orchestrator.revokeRole(orchestrator.OPERATOR_ROLE(), operator);
        console.log("    revokeRole transaction sent.");
    }

}