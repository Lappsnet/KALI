// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./RealEstateERC721.sol";
import "./RealEstateSale.sol";
import "./RentableToken.sol";
import "./LendingProtocol.sol";
import "./RentalAgreement.sol";

/**
 * @title MarketplaceOrchestrator
 * @dev Central hub for the real estate tokenization ecosystem
 */
contract MarketplaceOrchestrator is AccessControl {
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    
    RealEstateERC721 public propertyToken;
    RealEstateSale public saleContract;
    RentableToken public rentableToken;
    LendingProtocol public lendingProtocol;
    RentalAgreement public rentalAgreement;
    
    struct PropertyListing {
        uint256 propertyId;
        address owner;
        bool forSale;
        bool forRent;
        uint256 salePrice;
        uint256 monthlyRent;
        uint256 listedAt;
    }
    
    // Mapping from property ID to listing
    mapping(uint256 => PropertyListing) private _listings;
    
    // Array of all listed property IDs
    uint256[] private _listedProperties;
    
    // Events
    event PropertyListed(uint256 indexed propertyId, bool forSale, bool forRent, uint256 salePrice, uint256 monthlyRent);
    event PropertyUnlisted(uint256 indexed propertyId);
    event ListingUpdated(uint256 indexed propertyId, bool forSale, bool forRent, uint256 salePrice, uint256 monthlyRent);
    
    constructor(
        address propertyTokenAddress,
        address saleContractAddress,
        address rentableTokenAddress,
        address lendingProtocolAddress,
        address rentalAgreementAddress
    ) {
        propertyToken = RealEstateERC721(propertyTokenAddress);
        saleContract = RealEstateSale(payable(saleContractAddress));
        rentableToken = RentableToken(payable(rentableTokenAddress));
        lendingProtocol = LendingProtocol(payable(lendingProtocolAddress));
        rentalAgreement = RentalAgreement(payable(rentalAgreementAddress));
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }
    
    /**
     * @dev Lists a property for sale and/or rent
     * @param propertyId The ID of the property token
     * @param forSale Whether the property is for sale
     * @param forRent Whether the property is for rent
     * @param salePrice The sale price (if for sale)
     * @param monthlyRent The monthly rent (if for rent)
     */
    function listProperty(
        uint256 propertyId,
        bool forSale,
        bool forRent,
        uint256 salePrice,
        uint256 monthlyRent
    ) public {
        require(propertyToken.ownerOf(propertyId) == msg.sender, "Caller is not the property owner");
        require(forSale || forRent, "Property must be listed for sale or rent");
        
        if (forSale) {
            require(salePrice > 0, "Sale price must be greater than zero");
        }
        
        if (forRent) {
            require(monthlyRent > 0, "Monthly rent must be greater than zero");
        }
        
        // Check if property is already listed
        if (_listings[propertyId].listedAt == 0) {
            _listedProperties.push(propertyId);
        }
        
        _listings[propertyId] = PropertyListing({
            propertyId: propertyId,
            owner: msg.sender,
            forSale: forSale,
            forRent: forRent,
            salePrice: salePrice,
            monthlyRent: monthlyRent,
            listedAt: block.timestamp
        });
        
        emit PropertyListed(propertyId, forSale, forRent, salePrice, monthlyRent);
    }
    
    /**
     * @dev Unlists a property
     * @param propertyId The ID of the property token
     */
    function unlistProperty(uint256 propertyId) public {
        PropertyListing storage listing = _listings[propertyId];
        
        require(listing.listedAt > 0, "Property is not listed");
        require(listing.owner == msg.sender, "Caller is not the listing owner");
        
        // Remove from listings
        delete _listings[propertyId];
        
        // Remove from listed properties array
        for (uint256 i = 0; i < _listedProperties.length; i++) {
            if (_listedProperties[i] == propertyId) {
                _listedProperties[i] = _listedProperties[_listedProperties.length - 1];
                _listedProperties.pop();
                break;
            }
        }
        
        emit PropertyUnlisted(propertyId);
    }
    
    /**
     * @dev Updates a property listing
     * @param propertyId The ID of the property token
     * @param forSale Whether the property is for sale
     * @param forRent Whether the property is for rent
     * @param salePrice The sale price (if for sale)
     * @param monthlyRent The monthly rent (if for rent)
     */
    function updateListing(
        uint256 propertyId,
        bool forSale,
        bool forRent,
        uint256 salePrice,
        uint256 monthlyRent
    ) public {
        PropertyListing storage listing = _listings[propertyId];
        
        require(listing.listedAt > 0, "Property is not listed");
        require(listing.owner == msg.sender, "Caller is not the listing owner");
        require(forSale || forRent, "Property must be listed for sale or rent");
        
        if (forSale) {
            require(salePrice > 0, "Sale price must be greater than zero");
        }
        
        if (forRent) {
            require(monthlyRent > 0, "Monthly rent must be greater than zero");
        }
        
        listing.forSale = forSale;
        listing.forRent = forRent;
        listing.salePrice = salePrice;
        listing.monthlyRent = monthlyRent;
        
        emit ListingUpdated(propertyId, forSale, forRent, salePrice, monthlyRent);
    }
    
    /**
     * @dev Initiates a sale from a listing
     * @param propertyId The ID of the property token
     * @param saleDocumentURI URI to the legal sale documents
     * @return The ID of the newly created sale
     */
    function initiateSaleFromListing(
        uint256 propertyId,
        string memory saleDocumentURI
    ) public returns (uint256) {
        PropertyListing storage listing = _listings[propertyId];
        
        require(listing.listedAt > 0, "Property is not listed");
        require(listing.forSale, "Property is not for sale");
        require(propertyToken.ownerOf(propertyId) == listing.owner, "Listing owner no longer owns property");
        
        // Create sale in the sale contract
        uint256 saleId = saleContract.createSale(propertyId, listing.salePrice, saleDocumentURI);
        
        // Update listing
        listing.forSale = false;
        
        if (!listing.forRent) {
            // If not for rent either, unlist completely
            unlistProperty(propertyId);
        } else {
            emit ListingUpdated(propertyId, false, listing.forRent, 0, listing.monthlyRent);
        }
        
        return saleId;
    }
    
    /**
     * @dev Initiates a rental from a listing
     * @param propertyId The ID of the property token
     * @param tenant The address of the tenant
     * @param securityDeposit The security deposit amount
     * @param durationMonths The rental duration in months
     * @param agreementURI URI to the legal rental agreement
     * @return The ID of the newly created rental
     */
    function initiateRentalFromListing(
        uint256 propertyId,
        address tenant,
        uint256 securityDeposit,
        uint256 durationMonths,
        string memory agreementURI
    ) public payable returns (uint256) {
        PropertyListing storage listing = _listings[propertyId];
        
        require(listing.listedAt > 0, "Property is not listed");
        require(listing.forRent, "Property is not for rent");
        require(propertyToken.ownerOf(propertyId) == listing.owner, "Listing owner no longer owns property");
        
        // Create rental in the rental agreement contract
        uint256 rentalId = rentalAgreement.createRental{value: msg.value}(
            propertyId,
            tenant,
            listing.monthlyRent,
            securityDeposit,
            durationMonths,
            agreementURI
        );
        
        // Update listing
        listing.forRent = false;
        
        if (!listing.forSale) {
            // If not for sale either, unlist completely
            unlistProperty(propertyId);
        } else {
            emit ListingUpdated(propertyId, listing.forSale, false, listing.salePrice, 0);
        }
        
        return rentalId;
    }
    
    /**
     * @dev Gets a property listing
     * @param propertyId The ID of the property token
     * @return The property listing
     */
    function getListing(uint256 propertyId) public view returns (PropertyListing memory) {
        return _listings[propertyId];
    }
    
    /**
     * @dev Gets all listed properties
     * @return Array of property IDs
     */
    function getAllListedProperties() public view returns (uint256[] memory) {
        return _listedProperties;
    }
    
    /**
     * @dev Gets all properties listed for sale
     * @return Array of property IDs
     */
    function getPropertiesForSale() public view returns (uint256[] memory) {
        uint256 count = 0;
        
        // Count properties for sale
        for (uint256 i = 0; i < _listedProperties.length; i++) {
            if (_listings[_listedProperties[i]].forSale) {
                count++;
            }
        }
        
        // Create array of properties for sale
        uint256[] memory propertiesForSale = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < _listedProperties.length; i++) {
            if (_listings[_listedProperties[i]].forSale) {
                propertiesForSale[index] = _listedProperties[i];
                index++;
            }
        }
        
        return propertiesForSale;
    }
    
    /**
     * @dev Gets all properties listed for rent
     * @return Array of property IDs
     */
    function getPropertiesForRent() public view returns (uint256[] memory) {
        uint256 count = 0;
        
        // Count properties for rent
        for (uint256 i = 0; i < _listedProperties.length; i++) {
            if (_listings[_listedProperties[i]].forRent) {
                count++;
            }
        }
        
        // Create array of properties for rent
        uint256[] memory propertiesForRent = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < _listedProperties.length; i++) {
            if (_listings[_listedProperties[i]].forRent) {
                propertiesForRent[index] = _listedProperties[i];
                index++;
            }
        }
        
        return propertiesForRent;
    }
}

