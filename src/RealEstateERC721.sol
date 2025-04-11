// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

/**
 * @title RealEstateERC721
 * @dev Implementation of the ERC721 token standard for real estate tokenization
 * with property-specific functionality and enhanced security features.
 */
contract RealEstateERC721 {
    // ===============
    // STATE VARIABLES
    // ===============
    
    // Token metadata
    string private _name;
    string private _symbol;
    
    // Access control
    address public owner;
    mapping(address => bool) public administrators;
    
    // Token ID counter for sequential IDs
    uint256 private _tokenIdCounter;
    
    // Token data
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    
    // Property data
    struct PropertyDetails {
        string cadastralNumber;    // Unique cadastral reference
        string location;           // Physical location
        uint256 valuation;         // Property value in Wei
        bool active;               // Property status
        uint256 lastUpdated;       // Last update timestamp
        string metadataURI;        // URI for additional metadata
    }
    
    // Property mappings
    mapping(uint256 => PropertyDetails) public propertyDetails;
    mapping(string => uint256) private _cadastralToTokenId;
    uint256[] private _allTokenIds;
    
    // ======
    // EVENTS
    // ======
    
    // Standard ERC721 events
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    
    // Custom property events
    event PropertyMinted(uint256 indexed tokenId, string cadastralNumber, address indexed owner);
    event PropertyUpdated(uint256 indexed tokenId, string field, uint256 value);
    event PropertyStatusChanged(uint256 indexed tokenId, bool active);
    event PropertyMetadataUpdated(uint256 indexed tokenId, string metadataURI);
    event AdministratorAdded(address indexed admin);
    event AdministratorRemoved(address indexed admin);
    
    // ==========
    // MODIFIERS
    // ==========
    
    modifier onlyOwner() {
        require(msg.sender == owner, "RealEstateERC721: caller is not the owner");
        _;
    }
    
    modifier onlyAdmin() {
        require(msg.sender == owner || administrators[msg.sender], "RealEstateERC721: caller is not an administrator");
        _;
    }
    
    // ===========
    // CONSTRUCTOR
    // ===========
    
    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
        owner = msg.sender;
        administrators[msg.sender] = true;
    }
    
    // ======================
    // ADMINISTRATIVE FUNCTIONS
    // ======================
    
    /**
     * @dev Adds a new administrator
     * @param admin Address to be granted administrator privileges
     */
    function addAdministrator(address admin) external onlyOwner {
        require(admin != address(0), "RealEstateERC721: zero address");
        require(!administrators[admin], "RealEstateERC721: already an administrator");
        
        administrators[admin] = true;
        emit AdministratorAdded(admin);
    }
    
    /**
     * @dev Removes an administrator
     * @param admin Address to have administrator privileges revoked
     */
    function removeAdministrator(address admin) external onlyOwner {
        require(administrators[admin], "RealEstateERC721: not an administrator");
        require(admin != owner, "RealEstateERC721: cannot remove owner");
        
        administrators[admin] = false;
        emit AdministratorRemoved(admin);
    }
    
    /**
     * @dev Transfers ownership of the contract
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "RealEstateERC721: zero address");
        
        // Add new owner as administrator if not already
        if (!administrators[newOwner]) {
            administrators[newOwner] = true;
            emit AdministratorAdded(newOwner);
        }
        
        owner = newOwner;
    }
    
    // =================
    // PROPERTY FUNCTIONS
    // =================
    
    /**
     * @dev Mints a new property token
     * @param to Address to receive the token
     * @param _cadastralNumber Unique cadastral reference
     * @param _location Physical location of the property
     * @param _valuation Initial property valuation
     * @param _metadataURI URI for additional property metadata
     * @return tokenId The ID of the newly minted token
     */
    function mintProperty(
        address to,
        string memory _cadastralNumber,
        string memory _location,
        uint256 _valuation,
        string memory _metadataURI
    ) public onlyAdmin returns (uint256) {
        require(to != address(0), "RealEstateERC721: mint to zero address");
        require(bytes(_cadastralNumber).length > 0, "RealEstateERC721: empty cadastral number");
        require(_cadastralToTokenId[_cadastralNumber] == 0, "RealEstateERC721: property already tokenized");
        
        // Generate token ID
        uint256 tokenId = ++_tokenIdCounter;
        
        // Mint token
        _mint(to, tokenId);
        
        // Store property details
        propertyDetails[tokenId] = PropertyDetails({
            cadastralNumber: _cadastralNumber,
            location: _location,
            valuation: _valuation,
            active: true,
            lastUpdated: block.timestamp,
            metadataURI: _metadataURI
        });
        
        // Update mappings
        _cadastralToTokenId[_cadastralNumber] = tokenId;
        _allTokenIds.push(tokenId);
        
        emit PropertyMinted(tokenId, _cadastralNumber, to);
        
        return tokenId;
    }
    
    /**
     * @dev Updates property valuation
     * @param tokenId ID of the property token
     * @param newValuation Updated property valuation
     */
    function updatePropertyValuation(uint256 tokenId, uint256 newValuation) external onlyAdmin {
        require(_exists(tokenId), "RealEstateERC721: token does not exist");
        
        propertyDetails[tokenId].valuation = newValuation;
        propertyDetails[tokenId].lastUpdated = block.timestamp;
        
        emit PropertyUpdated(tokenId, "valuation", newValuation);
    }
    
    /**
     * @dev Updates property location
     * @param tokenId ID of the property token
     * @param newLocation Updated property location
     */
    function updatePropertyLocation(uint256 tokenId, string memory newLocation) external onlyAdmin {
        require(_exists(tokenId), "RealEstateERC721: token does not exist");
        
        propertyDetails[tokenId].location = newLocation;
        propertyDetails[tokenId].lastUpdated = block.timestamp;
        
        emit PropertyUpdated(tokenId, "location", block.timestamp);
    }
    
    /**
     * @dev Sets property active status
     * @param tokenId ID of the property token
     * @param active New active status
     */
    function setPropertyStatus(uint256 tokenId, bool active) external onlyAdmin {
        require(_exists(tokenId), "RealEstateERC721: token does not exist");
        
        propertyDetails[tokenId].active = active;
        propertyDetails[tokenId].lastUpdated = block.timestamp;
        
        emit PropertyStatusChanged(tokenId, active);
    }
    
    /**
     * @dev Updates property metadata URI
     * @param tokenId ID of the property token
     * @param metadataURI New metadata URI
     */
    function setPropertyMetadataURI(uint256 tokenId, string memory metadataURI) external onlyAdmin {
        require(_exists(tokenId), "RealEstateERC721: token does not exist");
        
        propertyDetails[tokenId].metadataURI = metadataURI;
        propertyDetails[tokenId].lastUpdated = block.timestamp;
        
        emit PropertyMetadataUpdated(tokenId, metadataURI);
    }
    
    // =================
    // QUERY FUNCTIONS
    // =================
    
    /**
     * @dev Gets all property token IDs
     * @return Array of all token IDs
     */
    function getAllTokenIds() external view returns (uint256[] memory) {
        return _allTokenIds;
    }
    
    /**
     * @dev Gets token ID by cadastral number
     * @param _cadastralNumber Cadastral reference to look up
     * @return Token ID associated with the cadastral number
     */
    function getTokenIdByCadastralNumber(string memory _cadastralNumber) external view returns (uint256) {
        uint256 tokenId = _cadastralToTokenId[_cadastralNumber];
        require(tokenId != 0, "RealEstateERC721: property not found");
        return tokenId;
    }
    
    /**
     * @dev Gets property details by token ID
     * @param tokenId ID of the property token
     * @return Property details struct
     */
    function getPropertyDetails(uint256 tokenId) external view returns (PropertyDetails memory) {
        require(_exists(tokenId), "RealEstateERC721: token does not exist");
        return propertyDetails[tokenId];

        
    }
    
    
    /**
     * @dev Gets property metadata URI
     * @param tokenId ID of the property token
     * @return Metadata URI string
     */
    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(_exists(tokenId), "RealEstateERC721: token does not exist");
        return propertyDetails[tokenId].metadataURI;
    }
    
    // =================
    // ERC721 FUNCTIONS
    // =================
    
    /**
     * @dev Gets the token name
     * @return Token name string
     */
    function name() external view returns (string memory) {
        return _name;
    }
    
    /**
     * @dev Gets the token symbol
     * @return Token symbol string
     */
    function symbol() external view returns (string memory) {
        return _symbol;
    }
    
    /**
     * @dev Gets the balance of an address
     * @param account Address to query
     * @return Number of tokens owned by the address
     */
    function balanceOf(address account) external view returns (uint256) {
        require(account != address(0), "RealEstateERC721: balance query for zero address");
        return _balances[account];
    }
    
    /**
     * @dev Gets the owner of a token
     * @param tokenId ID of the token
     * @return Address of the token owner
     */
    function ownerOf(uint256 tokenId) public view returns (address) {
        address tokenOwner = _owners[tokenId];
        require(tokenOwner != address(0), "RealEstateERC721: owner query for nonexistent token");
        return tokenOwner;
    }
    
    /**
     * @dev Approves an address to transfer a specific token
     * @param to Address to be approved
     * @param tokenId ID of the token
     */
    function approve(address to, uint256 tokenId) external {
        address tokenOwner = ownerOf(tokenId);
        require(to != tokenOwner, "RealEstateERC721: approval to current owner");
        require(
            msg.sender == tokenOwner || isApprovedForAll(tokenOwner, msg.sender),
            "RealEstateERC721: not owner or approved operator"
        );
        
        _approve(to, tokenId);
    }
    
    /**
     * @dev Gets the approved address for a token
     * @param tokenId ID of the token
     * @return Address approved for the token
     */
    function getApproved(uint256 tokenId) public view returns (address) {
        require(_exists(tokenId), "RealEstateERC721: approved query for nonexistent token");
        return _tokenApprovals[tokenId];
    }
    
    /**
     * @dev Sets or unsets approval for an operator to manage all of sender's tokens
     * @param operator Address to set approval for
     * @param approved Approval status
     */
    function setApprovalForAll(address operator, bool approved) external {
        require(operator != msg.sender, "RealEstateERC721: approve to caller");
        
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }
    
    /**
     * @dev Checks if an address is an approved operator for another address
     * @param tokenOwner Address that owns the tokens
     * @param operator Address to check if it has approval
     * @return Whether the operator is approved for all tokens of tokenOwner
     */
    function isApprovedForAll(address tokenOwner, address operator) public view returns (bool) {
    return _operatorApprovals[tokenOwner][operator];
    }
    
    /**
     * @dev Transfers a token from one address to another
     * @param from Address sending the token
     * @param to Address receiving the token
     * @param tokenId ID of the token
     */
    function transferFrom(address from, address to, uint256 tokenId) external {
        require(_isApprovedOrOwner(msg.sender, tokenId), "RealEstateERC721: transfer caller is not owner or approved");
        
        _transfer(from, to, tokenId);
    }
    
    /**
     * @dev Safely transfers a token from one address to another
     * @param from Address sending the token
     * @param to Address receiving the token
     * @param tokenId ID of the token
     */
    function safeTransferFrom(address from, address to, uint256 tokenId) external {
        safeTransferFrom(from, to, tokenId, "");
    }
    
    /**
     * @dev Safely transfers a token from one address to another with additional data
     * @param from Address sending the token
     * @param to Address receiving the token
     * @param tokenId ID of the token
     * @param data Additional data with no specified format
     */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "RealEstateERC721: transfer caller is not owner or approved");
        
        _safeTransfer(from, to, tokenId, data);
    }
    
    // =================
    // INTERNAL FUNCTIONS
    // =================
    
    /**
     * @dev Checks if a token exists
     * @param tokenId ID of the token
     * @return Whether the token exists
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _owners[tokenId] != address(0);
    }
    
    /**
     * @dev Checks if an address is the owner or approved for a token
     * @param spender Address to check
     * @param tokenId ID of the token
     * @return Whether the spender is the owner or approved
     */
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        require(_exists(tokenId), "RealEstateERC721: operator query for nonexistent token");
        address tokenOwner = ownerOf(tokenId);
        return (spender == tokenOwner || getApproved(tokenId) == spender || isApprovedForAll(tokenOwner, spender));
    }
    
    /**
     * @dev Internal function to mint a token
     * @param to Address to receive the token
     * @param tokenId ID of the token
     */
    function _mint(address to, uint256 tokenId) internal {
        require(to != address(0), "RealEstateERC721: mint to zero address");
        require(!_exists(tokenId), "RealEstateERC721: token already minted");
        
        _balances[to] += 1;
        _owners[tokenId] = to;
        
        emit Transfer(address(0), to, tokenId);
    }
    
    /**
     * @dev Internal function to approve an address for a token
     * @param to Address to be approved
     * @param tokenId ID of the token
     */
    function _approve(address to, uint256 tokenId) internal {
        _tokenApprovals[tokenId] = to;
        emit Approval(ownerOf(tokenId), to, tokenId);
    }
    
    /**
     * @dev Internal function to transfer a token
     * @param from Address sending the token
     * @param to Address receiving the token
     * @param tokenId ID of the token
     */
    function _transfer(address from, address to, uint256 tokenId) internal {
        require(ownerOf(tokenId) == from, "RealEstateERC721: transfer of token that is not owned");
        require(to != address(0), "RealEstateERC721: transfer to zero address");
        
        // Clear approvals
        _approve(address(0), tokenId);
        
        // Update balances
        _balances[from] -= 1;
        _balances[to] += 1;
        
        // Update ownership
        _owners[tokenId] = to;
        
        emit Transfer(from, to, tokenId);
    }
    
    /**
     * @dev Internal function to safely transfer a token
     * @param from Address sending the token
     * @param to Address receiving the token
     * @param tokenId ID of the token
     * @param data Additional data with no specified format
     */
    function _safeTransfer(address from, address to, uint256 tokenId, bytes memory data) internal {
        _transfer(from, to, tokenId);
        
        // Check if recipient is a contract
        if (_isContract(to)) {
            // This is a simplified check - in a production environment,
            // you would want to implement the full ERC721Receiver interface check
            require(
                _checkOnERC721Received(from, to, tokenId, data),
                "RealEstateERC721: transfer to non ERC721Receiver implementer"
            );
        }
    }
    
    /**
     * @dev Checks if an address is a contract
     * @param addr Address to check
     * @return Whether the address is a contract
     */
    function _isContract(address addr) internal view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(addr)
        }
        return size > 0;
    }
    
    function _checkOnERC721Received(
    address from,
    address to,
    uint256 tokenId,
    bytes memory data
) internal returns (bool) {
    if (_isContract(to)) {
        try IERC721Receiver(to).onERC721Received(msg.sender, from, tokenId, data) returns (bytes4 retval) {
            return retval == IERC721Receiver.onERC721Received.selector;
        } catch (bytes memory reason) {
            if (reason.length == 0) {
                revert("ERC721: transfer to non ERC721Receiver implementer");
            } else {
                assembly {
                    revert(add(32, reason), mload(reason))
                }
            }
        }
    } else {
        return true;
    }
}

}