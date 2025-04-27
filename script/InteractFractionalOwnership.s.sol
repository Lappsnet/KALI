// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {FractionalOwnership} from "../src/FractionalOwnership.sol";
import {RealEstateERC721} from "../src/RealEstateERC721.sol";

/**
 * @title InteractFractionalOwnership Script
 * @dev Required Env Vars: MY_PK, MY_ADDRESS, RPC_URL.
 * @dev Other env vars depend on action: PROPERTY_ID, TOTAL_SHARES, SHARE_PRICE, PURCHASE_SHARES, TARGET_ADDRESS.
 */
contract InteractFractionalOwnership is Script {

    address constant FRACTIONAL_OWNERSHIP_ADDRESS = vm.envAddress("FRACTIONAL_OWNERSHIP_ADDRESS");
    address constant NFT_CONTRACT_ADDRESS = vm.envAddress("NFT_CONTRACT_ADDRESS");

    FractionalOwnership public fractionalContract = FractionalOwnership(FRACTIONAL_OWNERSHIP_ADDRESS);
    RealEstateERC721 public propertyToken = RealEstateERC721(NFT_CONTRACT_ADDRESS);

    function run() external {
        address callerAddress = vm.envAddress("MY_ADDRESS");
        require(callerAddress != address(0), "MY_ADDRESS env var not set.");
        string memory pk = vm.envString("MY_PK");
        require(bytes(pk).length > 0, "MY_PK env var not set.");
        string memory rpcUrl = vm.envString("RPC_URL");
        require(bytes(rpcUrl).length > 0, "RPC_URL env var not set.");

        uint256 propertyId = vm.envUint("PROPERTY_ID");
        uint256 totalShares = vm.envUint("TOTAL_SHARES");
        uint256 sharePriceWei = vm.envUint("SHARE_PRICE_WEI");
        uint256 purchaseSharesAmount = vm.envUint("PURCHASE_SHARES");
        address targetAddress = vm.envAddress("TARGET_ADDRESS");

        console.log("--- Script Start: Interact FractionalOwnership ---");
        console.log("Target Fractional Contract:"); console.logAddress(FRACTIONAL_OWNERSHIP_ADDRESS);
        console.log("Target NFT Contract:"); console.logAddress(NFT_CONTRACT_ADDRESS);
        console.log("Executing as Address:"); console.logAddress(callerAddress);

        // --- Action ---

        // == Read Operations ==
        getContractInfo();
        if (propertyId > 0) { getPropertyFractionInfo(propertyId); }
        getHolderInfo(callerAddress);
        checkAdminRole(callerAddress);


        // == Write Operations ==
        
        vm.startBroadcast();

        // --- Prerequisites (Run with PROPERTY OWNER PK) ---
        // Action: Approve Fractional Contract to receive NFT (Run this BEFORE fractionalize)
        // --- Prerequisites (Run with PROPERTY OWNER PK) ---
        // Action: Approve Fractional Contract to receive NFT (Run this BEFORE fractionalize)
        // Requires PROPERTY_ID env var.
        // if (propertyId > 0) { exampleApproveNFTOwner(propertyId); }

        // --- Property Owner Actions (MY_PK = Owner of PROPERTY_ID) ---
        // Action: Fractionalize Property (Run AFTER approval is confirmed)
        // Requires PROPERTY_ID, TOTAL_SHARES, SHARE_PRICE_WEI env vars.
        // if (propertyId > 0 && totalShares > 0 && sharePriceWei > 0) {
        //     exampleFractionalizeProperty(propertyId, totalShares, sharePriceWei);
        // }

        // --- Public User Actions ---
        // Action: Purchase Shares (Run with BUYER PK. Buyer pays cost + gas)
        // Requires PROPERTY_ID, PURCHASE_SHARES env vars. Relies on an Admin holding enough shares initially.
        // if (propertyId > 0 && purchaseSharesAmount > 0) {
        //     examplePurchaseShares(propertyId, purchaseSharesAmount);
        // }
        // Action: Defractionalize Property (Run with PK of address holding ALL shares)
        // Requires PROPERTY_ID env var.
        // if (propertyId > 0) { exampleDefractionalizeProperty(propertyId); }


        // --- Admin Role Actions (MY_PK = DEFAULT_ADMIN_ROLE) ---
        // if (targetAddress != address(0)) { exampleGrantAdminRole(targetAddress); }
        // if (targetAddress != address(0)) { exampleRevokeAdminRole(targetAddress); }


        vm.stopBroadcast();
    

        console.log("--- Script Finished ---");
    }

    // == Reads ==
    function getContractInfo() public view {
        console.log("--- Fractional Ownership Info ---");
        console.log("Name:"); console.log(fractionalContract.name());
        console.log("Symbol:"); console.log(fractionalContract.symbol());
        console.log("Decimals:"); console.logUint(fractionalContract.decimals());
        console.log("Total Supply (FRET):"); console.logUint(fractionalContract.totalSupply());
        console.log("Property Token (NFT Addr):"); console.logAddress(fractionalContract.propertyToken());
    }

    function getPropertyFractionInfo(uint256 propertyId) public view {
        console.log("Querying fractional info for Property ID:"); console.logUint(propertyId);
        bool isActive = fractionalContract.isPropertyFractionalized(propertyId);
        console.log("  Is Active:", isActive);
        if (isActive) {
            try fractionalContract.getFractionalizedProperty(propertyId) returns (FractionalOwnership.FractionalizedProperty memory prop) {
                console.log("  --- Fractional Details ---");
                console.log("  Total Shares:"); console.logUint(prop.totalShares);
                console.log("  Share Price (Wei):"); console.logUint(prop.sharePrice);
                console.log("  ------------------------");
            } catch { console.log(" Error retrieving fractional details."); }
        }
    }

     function getHolderInfo(address account) public view {
        console.log("--- Holder Info for:"); console.logAddress(account); console.log("---");
        console.log("FRET Balance:"); console.logUint(fractionalContract.balanceOf(account));
    }

     function checkAdminRole(address account) public view {
         bytes32 adminRole = fractionalContract.ADMIN_ROLE();
         bool hasIt = fractionalContract.hasRole(adminRole, account);
         console.log("Role check for account:"); console.logAddress(account);
         console.log("  Role Name Checked: ADMIN_ROLE");
         console.log("  Has Role:", hasIt);
    }


    // == Writes ==

    // = Property Owner =
    function exampleApproveNFTOwner(uint256 propertyId) internal {
         console.log("--> Sending approve tx to RealEstate contract for property ID:"); console.logUint(propertyId);
         console.log("    Approving Fractional Contract:"); console.logAddress(FRACTIONAL_OWNERSHIP_ADDRESS);
         propertyToken.approve(FRACTIONAL_OWNERSHIP_ADDRESS, propertyId);
         console.log("    Approval transaction sent (wait for confirmation).");
    }

    function exampleFractionalizeProperty(uint256 propertyId, uint256 totalShares, uint256 sharePrice) internal {
        console.log("--> Sending fractionalizeProperty tx for Property ID:"); console.logUint(propertyId);
        console.log("    Total Shares:", totalShares);
        console.log("    Share Price (Wei):", sharePrice);
        fractionalContract.fractionalizeProperty(propertyId, totalShares, sharePrice);
        console.log("    fractionalizeProperty transaction sent.");
    }

    // = Public User =
    function examplePurchaseShares(uint256 propertyId, uint256 sharesToPurchase) internal {
        require(sharesToPurchase > 0, "Must purchase > 0 shares.");
        FractionalOwnership.FractionalizedProperty memory prop = fractionalContract.getFractionalizedProperty(propertyId);
        require(prop.active, "Property not active for purchase.");
        uint256 cost = sharesToPurchase * prop.sharePrice;
        require(cost > 0, "Calculated cost is zero.");

        console.log("--> Sending purchaseShares tx for Property ID:"); console.logUint(propertyId);
        console.log("    Shares to Purchase:", sharesToPurchase);
        console.log("    Calculated Cost (Wei - msg.value):"); console.logUint(cost);
        fractionalContract.purchaseShares{value: cost}(propertyId, sharesToPurchase);
        console.log("    purchaseShares transaction sent.");
    }

    function exampleDefractionalizeProperty(uint256 propertyId) internal {
        console.log("--> Sending defractionalizeProperty tx for Property ID:"); console.logUint(propertyId);
        fractionalContract.defractionalizeProperty(propertyId);
        console.log("    defractionalizeProperty transaction sent.");
    }

    // = Admin Role () =
    function exampleGrantAdminRole(address newAdmin) internal {
        console.log("--> Sending grantRole(ADMIN_ROLE) tx for:"); console.logAddress(newAdmin);
        fractionalContract.grantRole(fractionalContract.ADMIN_ROLE(), newAdmin);
        console.log("    grantRole transaction sent.");
    }
    function exampleRevokeAdminRole(address adminToRevoke) internal {
        console.log("--> Sending revokeRole(ADMIN_ROLE) tx for:"); console.logAddress(adminToRevoke);
        fractionalContract.revokeRole(fractionalContract.ADMIN_ROLE(), adminToRevoke);
        console.log("    revokeRole transaction sent.");
    }

} 