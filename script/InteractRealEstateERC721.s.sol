// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {Script, console} from "forge-std/Script.sol";
import {RealEstateERC721} from "../src/RealEstateERC721.sol";

contract InteractRealEstateERC721 is Script {

    address constant DEPLOYED_CONTRACT_ADDRESS = vm.envAddress("REAL_ESTATE_TOKEN_ADDRESS");

    RealEstateERC721 public realEstate = RealEstateERC721(DEPLOYED_CONTRACT_ADDRESS);

    function run() external {
        address callerAddress = vm.envAddress("MY_ADDRESS");
        require(callerAddress != address(0), "Error: MY_ADDRESS environment variable not set.");
        console.log("Running script with caller address:", callerAddress);
        exampleGetBalance(callerAddress);
        exampleReadOwnerOfToken(1);
        exampleGetPropertyDetails(1);
        exampleGetTokenURI(1); 


        vm.startBroadcast();

        // --- Minting--        
        uint256 newId = exampleMintProperty(callerAddress, vm.envString("METADATA_URI"));
        console.log("Minted Token ID:", newId);
        exampleGetPropertyDetails(newId);

        // --- Transfer ---
        exampleTransferToken(/*tokenId*/ 1, /*recipient*/ callerAddress);

        // --- Update Example ---
        exampleUpdateValuation(/*tokenId*/ 5, /*newValuation*/ 6 ether);
        exampleGetPropertyDetails(1);


        vm.stopBroadcast();

        console.log("Script finished.");
    }

    // == Read Operations ==

    function exampleGetBalance(address account) public view {
        if (account == address(0)) {
            console.log("Cannot get balance for zero address.");
            return;
        }
        uint256 balance = realEstate.balanceOf(account);
        console.log("Balance of", account, ":", balance);
    }

    function exampleReadOwnerOfToken(uint256 tokenId) public view {
        console.log("Querying owner of token ID:", tokenId);
        try realEstate.ownerOf(tokenId) returns (address owner) {
            console.log("  Owner:", owner);
        } catch Error(string memory reason) {
            console.log("  Error getting owner:", reason);
        } catch (bytes memory lowLevelData) {
            console.log("  Low-level error getting owner:", vm.toString(lowLevelData));
        }
    }

    function exampleGetPropertyDetails(uint256 tokenId) public view {
       console.log("Querying property details for token ID:", tokenId);
       try realEstate.getPropertyDetails(tokenId) returns (RealEstateERC721.PropertyDetails memory details) {
            console.log("  --- Property Details ---");
            console.log("  Cadastral Number:", details.cadastralNumber);
            console.log("  Location:", details.location);
            console.log("  Valuation (Wei):", details.valuation);
            console.log("  Active:", details.active);
            console.log("  Last Updated:", details.lastUpdated);
            console.log("  Metadata URI:", details.metadataURI);
            console.log("  ------------------------");
       } catch Error(string memory reason) {
            console.log("  Error getting details:", reason);
       } catch (bytes memory lowLevelData) {
            console.log("  Low-level error getting details:", vm.toString(lowLevelData));
       }
    }

     function exampleGetTokenURI(uint256 tokenId) public view {
        console.log("Querying token URI for token ID:", tokenId);
       try realEstate.tokenURI(tokenId) returns (string memory uri) {
            console.log("  Token URI:", uri);
       } catch Error(string memory reason) {
            console.log("  Error getting token URI:", reason);
       } catch (bytes memory lowLevelData) {
            console.log("  Low-level error getting token URI:", vm.toString(lowLevelData));
       }
    }


    // == Write Operations ==

    /**
     * @notice Mints a new property token. Caller must have 'onlyAdmin' role.
     * @param recipient The address to receive the new token.
     * @param metadataURI_ The IPFS URI (or other URI) for the token metadata (must be pre-uploaded).
     * @return newId The ID of the newly minted token.
     */

    function exampleMintProperty(address recipient, string memory metadataURI_) public returns (uint256) {
        require(recipient != address(0), "Mint recipient cannot be zero address");
        require(bytes(metadataURI_).length > 0, "Metadata URI cannot be empty. Set METADATA_URI env var.");

        string memory cadastralNumber = "CADAST_MINT_5";
        string memory location = "93 Rosa Ln, Mexico";
        uint256 valuation = 2.5 ether;

        console.log("Attempting to mint property:");
        console.log("  Recipient:", recipient);
        console.log("  Cadastral:", cadastralNumber);
        console.log("  Metadata URI:", metadataURI_);

        uint256 newId = realEstate.mintProperty(
            recipient,
            cadastralNumber,
            location,
            valuation,
            metadataURI_
        );
        console.log("Successfully minted property! New Token ID:", newId);
        return newId;
    }

    /**
     * @notice Updates the valuation of an existing token. Caller must have 'onlyAdmin' role.
     * @param tokenId The ID of the token to update.
     * @param newValuation The new valuation in Wei.
     */
     function exampleUpdateValuation(uint256 tokenId, uint256 newValuation) public {
        console.log("Attempting to update valuation for token", tokenId, "to", newValuation);
        realEstate.updatePropertyValuation(tokenId, newValuation);
        console.log("Valuation update transaction sent.");
    }

    /**
     * @notice Transfers a token. Caller (from MY_PK) must own the token or be approved.
     * @param tokenId The ID of the token to transfer.
     * @param recipient The address to receive the token.
     */
    function exampleTransferToken(uint256 tokenId, address recipient) public {
         require(recipient != address(0), "Transfer recipient cannot be zero address.");

        address from;
        try realEstate.ownerOf(tokenId) returns (address currentOwner) {
            from = currentOwner;
        } catch {
            console.log("Error: Could not get owner for token ID", tokenId, "- cannot transfer.");
            return;
        }

        // Check if the intended 'from' address matches the script caller's address
        // address scriptCaller = vm.addr(vm.envString("MY_PK")); // More robust way to get caller addr
        // require(from == scriptCaller, "Script caller does not own the token");
        // Note: The above check isn't strictly needed as transferFrom performs it,
        // but can be useful for script clarity or debugging.

        console.log("Attempting to transfer token:");
        console.log("  Token ID:", tokenId);
        console.log("  From (Current Owner):", from);
        console.log("  To (Recipient):", recipient);

        realEstate.transferFrom(from, recipient, tokenId);
        console.log("Token transfer transaction sent.");
    }
}