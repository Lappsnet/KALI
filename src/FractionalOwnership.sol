// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20, ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {AccessControlEnumerable} from "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {RealEstateERC721} from "./RealEstateERC721.sol";

contract FractionalOwnership is ERC20Burnable, AccessControlEnumerable, IERC721Receiver {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    RealEstateERC721 public propertyToken;

    struct FractionalizedProperty {
        uint256 propertyId;
        uint256 totalShares;
        uint256 sharePrice;
        bool active;
    }

    mapping(uint256 => FractionalizedProperty) private _fractionalizedProperties;

    event PropertyFractionalized(uint256 indexed propertyId, uint256 totalShares, uint256 sharePrice);
    event SharesPurchased(uint256 indexed propertyId, address buyer, uint256 shares, uint256 cost);
    event PropertyDefactionalized(uint256 indexed propertyId);

    constructor(address propertyTokenAddress) ERC20("Fractional Real Estate Token", "FRET") {
        propertyToken = RealEstateERC721(propertyTokenAddress);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function fractionalizeProperty(
        uint256 propertyId,
        uint256 totalShares,
        uint256 sharePrice
    ) public {
        require(propertyToken.ownerOf(propertyId) == msg.sender, "Caller is not the property owner");
        require(totalShares > 0, "Total shares must be greater than zero");
        require(sharePrice > 0, "Share price must be greater than zero");
        require(!_fractionalizedProperties[propertyId].active, "Property already fractionalized");

        // The contract needs to be approved or be the owner to transfer the ERC721
        propertyToken.safeTransferFrom(msg.sender, address(this), propertyId);

        _fractionalizedProperties[propertyId] = FractionalizedProperty({
            propertyId: propertyId,
            totalShares: totalShares,
            sharePrice: sharePrice,
            active: true
        });

        _mint(msg.sender, totalShares);

        emit PropertyFractionalized(propertyId, totalShares, sharePrice);
    }

    function purchaseShares(uint256 propertyId, uint256 shares) public payable {
        FractionalizedProperty storage property = _fractionalizedProperties[propertyId];

        require(property.active, "Property is not fractionalized");
        require(shares > 0, "Shares must be greater than zero");

        uint256 cost = shares * property.sharePrice;
        require(msg.value >= cost, "Insufficient payment");

        // Note: The findSeller logic here is basic and assumes ADMIN_ROLE members hold shares.
        // In a real marketplace, you might need a more sophisticated mechanism for buyers
        // to purchase shares from any holder, potentially through a separate exchange contract.
        address seller = findSeller(shares);
        require(seller != address(0), "No seller with enough shares");

        // Transfer shares from seller to buyer
        _transfer(seller, msg.sender, shares);

        // Transfer payment to seller
        payable(seller).transfer(cost);

        // Refund excess payment if any
        if (msg.value > cost) {
            payable(msg.sender).transfer(msg.value - cost);
        }

        emit SharesPurchased(propertyId, msg.sender, shares, cost);
    }

    // This findSeller function is a simplified example based on ADMIN_ROLE
    function findSeller(uint256 shares) private view returns (address) {
        uint256 adminCount = getRoleMemberCount(ADMIN_ROLE);

        for (uint256 i = 0; i < adminCount; i++) {
            address admin = getRoleMember(ADMIN_ROLE, i);
            // Check if the admin has enough shares
            if (balanceOf(admin) >= shares) {
                return admin;
            }
        }

        return address(0);
    }

    // Helper function to get admin addresses (can be useful for off-chain tools)
    function getAdmins() public view returns (address[] memory) {
        uint256 adminCount = getRoleMemberCount(ADMIN_ROLE);

        address[] memory admins = new address[](adminCount);

        for (uint256 i = 0; i < adminCount; i++) {
            admins[i] = getRoleMember(ADMIN_ROLE, i);
        }

        return admins;
    }


    function defractionalizeProperty(uint256 propertyId) public {
        FractionalizedProperty storage property = _fractionalizedProperties[propertyId];

        require(property.active, "Property is not fractionalized");
        // Ensure the caller owns all outstanding shares before defractionalizing
        require(balanceOf(msg.sender) == property.totalShares, "Caller does not own all shares");

        // Transfer the ERC721 back to the caller
        propertyToken.safeTransferFrom(address(this), msg.sender, propertyId);

        // Burn all the fractional shares held by the caller
        _burn(msg.sender, property.totalShares);

        // Mark the property as inactive
        property.active = false;

        emit PropertyDefactionalized(propertyId);
    }

    function getFractionalizedProperty(uint256 propertyId) public view returns (FractionalizedProperty memory) {
        return _fractionalizedProperties[propertyId];
    }

    function isPropertyFractionalized(uint256 propertyId) public view returns (bool) {
        return _fractionalizedProperties[propertyId].active;
    }

    // This function is required by the IERC721Receiver interface
    // It must return the specific bytes4 value to signal successful receipt
    function onERC721Received(
        address /* operator */, // The address which called `safeTransferFrom` function
        address /* from */,     // The address which previously owned the token
        uint256 /* tokenId */,  // The NFT identifier which is being transferred
        bytes calldata /* data */ // Additional data with no specified format
    ) external override pure returns (bytes4) { // Added 'pure' here
        return this.onERC721Received.selector;
    }

    // Required by AccessControlEnumerable and IERC721Receiver
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControlEnumerable)
        returns (bool)
    {
        return
            interfaceId == type(IERC721Receiver).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
