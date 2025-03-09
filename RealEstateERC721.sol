// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RealEstateERC721 {
    // Almacenar información del inmueble
    struct PropertyDetails {
        string cadastralNumber; // Número de partida catastral
        string location;        // Ubicación del inmueble
        uint256 valuation;      // Valoración del inmueble en Wei
    }

    mapping(uint256 => PropertyDetails) public propertyDetails;
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    string private _name;
    string private _symbol;

    uint256[] private _allTokenIds;  // Array to store all token IDs

    // Eventos
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    // Función para obtener el nombre del token
    function name() public view returns (string memory) {
        return _name;
    }

    // Función para obtener el símbolo del token
    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _owners[tokenId] != address(0);
    }

    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        address owner = ownerOf(tokenId);
        return (spender == owner || getApproved(tokenId) == spender || isApprovedForAll(owner, spender));
    }

    function _mint(address to, uint256 tokenId) internal {
        require(to != address(0), "Address cannot be zero");
        require(!_exists(tokenId), "Token already exists");

        _balances[to] += 1;
        _owners[tokenId] = to;

        emit Transfer(address(0), to, tokenId);
    }

    // 🔄 Mint a new property token
    function mintProperty(
        address to,
        string memory _cadastralNumber,
        string memory _location,
        uint256 _valuation
    ) public {
        uint256 tokenId = uint256(keccak256(abi.encodePacked(_cadastralNumber, block.timestamp)));
        require(!_exists(tokenId), "Token already exists");

        _mint(to, tokenId);
        propertyDetails[tokenId] = PropertyDetails({
            cadastralNumber: _cadastralNumber,
            location: _location,
            valuation: _valuation
        });

        _allTokenIds.push(tokenId);  // Store the token ID
    }

    // 🚀 Check property details by token ID
    function getPropertyDetails(uint256 tokenId) public view returns (PropertyDetails memory) {
        require(_exists(tokenId), "Token does not exist");
        return propertyDetails[tokenId];
    }

    // 🔍 Get all minted token IDs
    function getAllTokenIds() public view returns (uint256[] memory) {
        return _allTokenIds;
    }

    // 🔍 Get token ID by cadastral number
    function getTokenIdByCadastralNumber(string memory _cadastralNumber) public view returns (uint256) {
        uint256 tokenId = uint256(keccak256(abi.encodePacked(_cadastralNumber, block.timestamp)));
        require(_exists(tokenId), "Token does not exist");
        return tokenId;
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "Token does not exist");
        return owner;
    }

    function balanceOf(address owner) public view returns (uint256) {
        require(owner != address(0), "Address cannot be zero");
        return _balances[owner];
    }

    // Implementación manual de safeTransferFrom
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not approved or owner");
        require(to != address(0), "Invalid recipient");

        _transfer(from, to, tokenId);
    }

    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal {
        require(ownerOf(tokenId) == from, "Incorrect owner");
        require(to != address(0), "Invalid recipient");

        // Limpiar aprobaciones
        _approve(address(0), tokenId);

        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }

    // Función para aprobar el uso de un token
    function approve(address to, uint256 tokenId) public {
        address owner = ownerOf(tokenId);
        require(to != owner, "Cannot approve to owner");
        require(msg.sender == owner || isApprovedForAll(owner, msg.sender), "Not approved or owner");

        _approve(to, tokenId);
    }

    function _approve(address to, uint256 tokenId) internal {
        _tokenApprovals[tokenId] = to;
        emit Approval(ownerOf(tokenId), to, tokenId);
    }

    function getApproved(uint256 tokenId) public view returns (address) {
        require(_exists(tokenId), "Token does not exist");
        return _tokenApprovals[tokenId];
    }

    function setApprovalForAll(address operator, bool approved) public {
        require(operator != msg.sender, "Cannot approve self");
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function isApprovedForAll(address owner, address operator) public view returns (bool) {
        return _operatorApprovals[owner][operator];
    }
}
