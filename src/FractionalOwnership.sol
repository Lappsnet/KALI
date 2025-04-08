// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "./RealEstateERC721.sol";

/**
 * @title FractionalOwnership
 * @dev Contract for fractionalizing real estate ownership
 */
contract FractionalOwnership is ERC20Burnable, AccessControlEnumerable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    RealEstateERC721 public propertyToken;
    
    struct FractionalizedProperty {
        uint256 propertyId;
        uint256 totalShares;
        uint256 sharePrice;
        bool active;
    }
    
    // Mapping from property ID to fractionalized property
    mapping(uint256 => FractionalizedProperty) private _fractionalizedProperties;
    
    // Events
    event PropertyFractionalized(uint256 indexed propertyId, uint256 totalShares, uint256 sharePrice);
    event SharesPurchased(uint256 indexed propertyId, address buyer, uint256 shares, uint256 cost);
    event PropertyDefactionalized(uint256 indexed propertyId);
    
    constructor(address propertyTokenAddress) ERC20("Fractional Real Estate Token", "FRET") {
        propertyToken = RealEstateERC721(propertyTokenAddress);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Fractionalizes a property
     * @param propertyId The ID of the property token
     * @param totalShares The total number of shares to create
     * @param sharePrice The price per share in wei
     */
    function fractionalizeProperty(
        uint256 propertyId,
        uint256 totalShares,
        uint256 sharePrice
    ) public {
        require(propertyToken.ownerOf(propertyId) == msg.sender, "Caller is not the property owner");
        require(totalShares > 0, "Total shares must be greater than zero");
        require(sharePrice > 0, "Share price must be greater than zero");
        require(!_fractionalizedProperties[propertyId].active, "Property already fractionalized");
        
        // Transfer property to this contract
        propertyToken.safeTransferFrom(msg.sender, address(this), propertyId);
        
        // Create fractionalized property
        _fractionalizedProperties[propertyId] = FractionalizedProperty({
            propertyId: propertyId,
            totalShares: totalShares,
            sharePrice: sharePrice,
            active: true
        });
        
        // Mint initial shares to property owner
        _mint(msg.sender, totalShares);
        
        emit PropertyFractionalized(propertyId, totalShares, sharePrice);
    }
    
    /**
     * @dev Purchases shares of a fractionalized property
     * @param propertyId The ID of the property token
     * @param shares The number of shares to purchase
     */
    function purchaseShares(uint256 propertyId, uint256 shares) public payable {
        FractionalizedProperty storage property = _fractionalizedProperties[propertyId];
        
        require(property.active, "Property is not fractionalized");
        require(shares > 0, "Shares must be greater than zero");
        
        uint256 cost = shares * property.sharePrice;
        require(msg.value >= cost, "Insufficient payment");
        
        // Find a seller with enough shares
        address seller = findSeller(shares);
        require(seller != address(0), "No seller with enough shares");
        
        // Transfer shares from seller to buyer
        _transfer(seller, msg.sender, shares);
        
        // Transfer payment to seller
        payable(seller).transfer(cost);
        
        // Refund excess payment
        if (msg.value > cost) {
            payable(msg.sender).transfer(msg.value - cost);
        }
        
        emit SharesPurchased(propertyId, msg.sender, shares, cost);
    }
    
    /**
     * @dev Finds a seller with enough shares
     * @param shares The number of shares needed
     * @return The address of a seller with enough shares
     */
    function findSeller(uint256 shares) private view returns (address) {
        // In a real implementation, this would use an order book or similar mechanism
        // For simplicity, we'll just check if any admin has enough shares
        address[] memory admins = getAdmins();
        
        for (uint256 i = 0; i < admins.length; i++) {
            if (balanceOf(admins[i]) >= shares) {
                return admins[i];
            }
        }
        
        return address(0);
    }
    
    /**
     * @dev Gets all addresses with admin role
     * @return Array of admin addresses
     */
    function getAdmins() private view returns (address[] memory) {
        // Get the count of members with ADMIN_ROLE
        uint256 adminCount = getRoleMemberCount(ADMIN_ROLE);
        require(adminCount > 0, "No admins found");
        
        // Create array to hold admin addresses
        address[] memory admins = new address[](adminCount);
        
        // Populate the array with admin addresses
        for (uint256 i = 0; i < adminCount; i++) {
            admins[i] = getRoleMember(ADMIN_ROLE, i);
        }
        
        return admins;
    }
    
    /**
     * @dev Defractionalizes a property (converts back to single ownership)
     * @param propertyId The ID of the property token
     */
    function defractionalizeProperty(uint256 propertyId) public {
        FractionalizedProperty storage property = _fractionalizedProperties[propertyId];
        
        require(property.active, "Property is not fractionalized");
        require(balanceOf(msg.sender) == property.totalShares, "Caller does not own all shares");
        
        // Transfer property back to owner
        propertyToken.safeTransferFrom(address(this), msg.sender, propertyId);
        
        // Burn all shares
        _burn(msg.sender, property.totalShares);
        
        // Deactivate fractionalized property
        property.active = false;
        
        emit PropertyDefactionalized(propertyId);
    }
    
    /**
     * @dev Gets fractionalized property details
     * @param propertyId The ID of the property token
     * @return Fractionalized property details
     */
    function getFractionalizedProperty(uint256 propertyId) public view returns (FractionalizedProperty memory) {
        return _fractionalizedProperties[propertyId];
    }
    
    /**
     * @dev Checks if a property is fractionalized
     * @param propertyId The ID of the property token
     * @return Whether the property is fractionalized
     */
    function isPropertyFractionalized(uint256 propertyId) public view returns (bool) {
        return _fractionalizedProperties[propertyId].active;
    }
    
    // Override required functions
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControlEnumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

