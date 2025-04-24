// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
// Adjust import paths if needed
import {RealEstateSale} from "../src/RealEstateSale.sol";
import {RealEstateERC721} from "../src/RealEstateERC721.sol";
import {RentableToken} from "../src/RentableToken.sol";

/**
 * @title InteractRealEstateSale Script
 * @notice Interacts with a deployed RealEstateSale contract.
 * @dev Required Env Vars: MY_PK, MY_ADDRESS, RPC_URL.
 * @dev Other env vars depend on action: PROPERTY_ID, SALE_ID, PRICE_WEI, BUYER_ADDRESS, NOTARY_ADDRESS, RENTABLE_AMOUNT etc.
 * @dev Run ONE action per execution with the correct PK/Role/Prerequisites.
 */
contract InteractRealEstateSale is Script {

    // <<< --- Configuration: Set Deployed Contract Addresses --- >>>
    address constant SALE_CONTRACT_ADDRESS = 0x43B69480Cf9308F10781fB3eEab20770c14ee73D; // <--- Verify/Replace if needed (Using address from previous context)
    address constant NFT_CONTRACT_ADDRESS = 0xD95d1FF6618AEE41e431C6A2cfa3D5e8ff3d5f33; // <--- Verify/Replace if needed
    address constant RENTABLE_TOKEN_ADDRESS = 0x407b230D1439A83Ed81577009e2118e7a4d50694; // <--- Verify/Replace if needed

    // Get contract instances
    RealEstateSale public saleContract = RealEstateSale(payable(SALE_CONTRACT_ADDRESS)); // Assume payable for safety, adjust if no receive/fallback
    RealEstateERC721 public propertyToken = RealEstateERC721(NFT_CONTRACT_ADDRESS);
    // Cast RentableToken to payable if it has receive() or payable fallback
    RentableToken public rentableToken = RentableToken(payable(RENTABLE_TOKEN_ADDRESS));

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
        uint256 propertyId = vm.envUint("PROPERTY_ID"); // e.g., export PROPERTY_ID=5
        uint256 saleId = vm.envUint("SALE_ID");         // e.g., export SALE_ID=1
        uint256 priceWei = vm.envUint("PRICE_WEI");     // e.g., export PRICE_WEI=1000000000000000000 (1 ETH)
        uint256 rentableAmount = vm.envUint("RENTABLE_AMOUNT"); // e.g., export RENTABLE_AMOUNT=500e18 (500 Tokens)
        address buyerAddress = vm.envAddress("BUYER_ADDRESS");     // e.g., export BUYER_ADDRESS=0x...
        address notaryAddress = vm.envAddress("NOTARY_ADDRESS");   // e.g., export NOTARY_ADDRESS=0x...
        address targetAddress = vm.envAddress("TARGET_ADDRESS"); // For admin actions

        console.log("--- Script Start: Interact RealEstateSale ---");
        console.log("Target Sale Contract:"); console.logAddress(SALE_CONTRACT_ADDRESS);
        console.log("Executing as Address:"); console.logAddress(callerAddress);

        // --- Choose ONE Action ---
        // Uncomment the desired read or write action.

        // == Read Operations Examples (No Broadcast Needed) ==
        //if (saleId > 0) { getSaleInfo(saleId); }
        //if (propertyId > 0) { getActiveSaleForProperty(propertyId); }
        //if (targetAddress != address(0)) { isNotaryCheck(targetAddress); }


        // == Write Operations Examples (Uncomment ONE action inside broadcast block) ==
        // ** Uncomment this block ONLY if performing a write transaction **
        
        vm.startBroadcast(); // Use PK matching the required role for the action below

        // --- CHOOSE ONE ACTION TO UNCOMMENT ---

        // --- Owner Role Actions (MY_PK = Owner) ---
        // if (targetAddress != address(0)) { exampleAuthorizeNotary(targetAddress); }
        // if (targetAddress != address(0)) { exampleRemoveNotary(targetAddress); }
        // exampleUpdatePlatformFee(300); // Example: 3.00% fee
        // if (targetAddress != address(0)) { exampleUpdateFeeCollector(targetAddress); }

        // --- Seller Role Actions (MY_PK = Owner of PROPERTY_ID) ---
        // Prerequisite: Seller must approve SALE_CONTRACT_ADDRESS on NFT_CONTRACT_ADDRESS for propertyId
        // if (propertyId > 0) { exampleApproveNFTSale(propertyId); } // Run this first!
        // Create Sale (Run with Seller PK, after approving NFT)
        // Requires PROPERTY_ID, PRICE_WEI env vars.
        // if (propertyId > 0 && priceWei > 0) {
        //     string memory docUri = "ipfs://YourSaleDocumentCID"; // Replace with actual URI
        //     exampleCreateSale(propertyId, priceWei, docUri);
        // }
        // Update Price (Run with Seller PK, requires SALE_ID, PRICE_WEI env vars, sale must be 'Listed')
        // if (saleId > 0 && priceWei > 0) { exampleUpdateSalePrice(saleId, priceWei); }
        // Configure Rentable Tokens (Run with Seller PK, requires SALE_ID, RENTABLE_AMOUNT env vars, sale must be 'Listed')
        // if (saleId > 0 && rentableAmount > 0) { exampleConfigureRentableTokens(saleId, true, rentableAmount); }
        // Cancel Sale (Run with Seller PK if 'Listed', or Seller/Notary if 'Pending/Approved')
        // Requires SALE_ID env var.
        // if (saleId > 0) { exampleCancelSale(saleId, "Seller cancelled listing"); }


        // --- Buyer Role Actions (MY_PK = Buyer) ---
        // Express Interest (Run with Buyer PK, requires SALE_ID env var, sale must be 'Listed')
        // if (saleId > 0) { exampleExpressInterest(saleId); }
        // Deposit Escrow (Run with Buyer PK, requires SALE_ID env var, sale must be 'Approved', send PRICE_WEI value)
        // if (saleId > 0) { exampleDepositEscrow(saleId); } // Reads PRICE_WEI from sale state


        // --- Notary Role Actions (MY_PK = Authorized Notary) ---
        // Assign Self as Notary (Run with Notary PK, requires SALE_ID env var, sale must be 'PendingApproval')
        // if (saleId > 0) { exampleAssignNotary(saleId); }
        // Approve Sale (Run with Assigned Notary PK, requires SALE_ID env var, sale must be 'PendingApproval')
        // if (saleId > 0) { exampleApproveSale(saleId); }
        // Complete Sale (Run with Assigned Notary PK, requires SALE_ID env var, sale must be 'Approved', escrow must be deposited)
        // if (saleId > 0) { exampleCompleteSale(saleId); }


        vm.stopBroadcast();
        */

        console.log("--- Script Finished ---");
    }

    // --- Helper Functions ---

    // == Reads ==
    function getSaleInfo(uint256 saleId) public view {
        console.log("Querying sale info for ID:"); console.logUint(saleId);
        try saleContract.getSale(saleId) returns (RealEstateSale.Sale memory sale) {
             console.log("  --- Sale Details ---");
             console.log("  Property ID:"); console.logUint(sale.propertyId);
             console.log("  Seller:"); console.logAddress(sale.seller);
             console.log("  Buyer:"); console.logAddress(sale.buyer);
             console.log("  Price (Wei):"); console.logUint(sale.price);
             console.log("  Notary:"); console.logAddress(sale.notary);
             console.log("  Status (Enum):"); console.logUint(uint(sale.status));
             console.log("  Created At:"); console.logUint(sale.createdAt);
             console.log("  Updated At:"); console.logUint(sale.updatedAt);
             console.log("  Completed At:"); console.logUint(sale.completedAt);
             console.log("  Document URI:"); console.log(sale.saleDocumentURI);
             console.log("  Rentable Tokens Included:"); console.log(sale.rentableTokensIncluded);
             console.log("  Rentable Token Amount:"); console.logUint(sale.rentableTokenAmount);
             console.log("  ---------------------");
             // Check escrow separately
             uint256 escrow = saleContract.getEscrowBalance(saleId);
             console.log("  Escrow Balance (Wei):"); console.logUint(escrow);
        } catch Error(string memory reason) { console.log(" Error getting sale:", reason); }
        catch { console.log(" Low-level error getting sale."); }
    }

    function getActiveSaleForProperty(uint256 propertyId) public view {
        uint256 activeSaleId = saleContract.getActiveSaleForProperty(propertyId);
        console.log("Active Sale ID for Property", propertyId, ":"); console.logUint(activeSaleId);
        if (activeSaleId > 0) { getSaleInfo(activeSaleId); }
    }

    function isNotaryCheck(address notary) public view {
        bool isAuth = saleContract.isAuthorizedNotary(notary);
        console.log("Is address an authorized notary?"); console.logAddress(notary);
        console.log("  Result:", isAuth);
    }

    // == Writes ==

    // = Owner Role =
    function exampleAuthorizeNotary(address notary) internal {
        console.log("--> Sending authorizeNotary tx for:"); console.logAddress(notary);
        saleContract.authorizeNotary(notary);
        console.log("    authorizeNotary transaction sent.");
    }
    function exampleRemoveNotary(address notary) internal {
        console.log("--> Sending removeNotary tx for:"); console.logAddress(notary);
        saleContract.removeNotary(notary);
        console.log("    removeNotary transaction sent.");
    }
    function exampleUpdatePlatformFee(uint256 newFeeBps) internal {
        console.log("--> Sending updatePlatformFee tx. New Fee (bps):"); console.logUint(newFeeBps);
        saleContract.updatePlatformFee(newFeeBps);
        console.log("    updatePlatformFee transaction sent.");
    }
    function exampleUpdateFeeCollector(address newCollector) internal {
        console.log("--> Sending updateFeeCollector tx. New Collector:"); console.logAddress(newCollector);
        saleContract.updateFeeCollector(newCollector);
        console.log("    updateFeeCollector transaction sent.");
    }

    // = Seller Role =
    // IMPORTANT: Run this BEFORE createSale using the Property Owner's PK
    function exampleApproveNFTSale(uint256 propertyId) internal {
         console.log("--> Sending approve tx to RealEstate contract for property ID:"); console.logUint(propertyId);
         console.log("    Approving Sale Contract:"); console.logAddress(SALE_CONTRACT_ADDRESS);
         // Calls approve on the NFT contract instance
         propertyToken.approve(SALE_CONTRACT_ADDRESS, propertyId);
         console.log("    Approval transaction sent (wait for confirmation).");
    }
    function exampleCreateSale(uint256 propertyId, uint256 price, string memory docUri) internal {
        require(price > 0, "Price must be positive.");
        console.log("--> Sending createSale tx for property ID:"); console.logUint(propertyId);
        console.log("    Price (Wei):"); console.logUint(price);
        console.log("    Document URI:"); console.log(docUri);
        saleContract.createSale(propertyId, price, docUri);
        console.log("    createSale transaction sent.");
        // Note: Sale ID needs to be retrieved from event log.
    }
    function exampleUpdateSalePrice(uint256 saleId, uint256 newPrice) internal {
        require(newPrice > 0, "New price must be positive.");
        console.log("--> Sending updateSalePrice tx for sale ID:"); console.logUint(saleId);
        console.log("    New Price (Wei):"); console.logUint(newPrice);
        saleContract.updateSalePrice(saleId, newPrice);
        console.log("    updateSalePrice transaction sent.");
    }
    function exampleConfigureRentableTokens(uint256 saleId, bool include, uint256 amount) internal {
        console.log("--> Sending configureRentableTokens tx for sale ID:"); console.logUint(saleId);
        console.log("    Include Tokens:", include);
        console.log("    Amount:", amount);
        saleContract.configureRentableTokens(saleId, include, amount);
        console.log("    configureRentableTokens transaction sent.");
    }
    function exampleCancelSale(uint256 saleId, string memory reason) internal {
        console.log("--> Sending cancelSale tx for sale ID:"); console.logUint(saleId);
        console.log("    Reason:", reason);
        saleContract.cancelSale(saleId, reason);
        console.log("    cancelSale transaction sent.");
    }

    // = Buyer Role =
    function exampleExpressInterest(uint256 saleId) internal {
        console.log("--> Sending expressInterest tx for sale ID:"); console.logUint(saleId);
        saleContract.expressInterest(saleId);
        console.log("    expressInterest transaction sent.");
    }
    function exampleDepositEscrow(uint256 saleId) internal {
        // Fetch the required price from the contract state
        RealEstateSale.Sale memory sale = saleContract.getSale(saleId);
        uint256 requiredPrice = sale.price;
        require(requiredPrice > 0, "Could not determine sale price for escrow.");
        console.log("--> Sending depositEscrow tx for sale ID:"); console.logUint(saleId);
        console.log("    Required Escrow (msg.value):"); console.logUint(requiredPrice);
        // Send the required price with the transaction
        saleContract.depositEscrow{value: requiredPrice}(saleId);
        console.log("    depositEscrow transaction sent.");
    }

    // = Notary Role =
    function exampleAssignNotary(uint256 saleId) internal {
        console.log("--> Sending assignNotary tx for sale ID:"); console.logUint(saleId);
        saleContract.assignNotary(saleId);
        console.log("    assignNotary transaction sent.");
    }
    function exampleApproveSale(uint256 saleId) internal {
        console.log("--> Sending approveSale tx for sale ID:"); console.logUint(saleId);
        saleContract.approveSale(saleId);
        console.log("    approveSale transaction sent.");
    }
    function exampleCompleteSale(uint256 saleId) internal {
        console.log("--> Sending completeSale tx for sale ID:"); console.logUint(saleId);
        saleContract.completeSale(saleId);
        console.log("    completeSale transaction sent.");
    }

} // End of contract InteractRealEstateSale
