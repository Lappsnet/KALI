// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {RealEstateERC721} from "./RealEstateERC721.sol";
import {RentableToken} from "./RentableToken.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RealEstateSale
 * @dev Manages the sale process for tokenized real estate properties with notary verification,
 * escrow functionality, and integration with RealEstateERC721 and RentableToken.
 */
contract RealEstateSale is ReentrancyGuard {
    // ==========
    // STATE VARIABLES
    // ==========
    
    // Contract references
    RealEstateERC721 public propertyToken;
    RentableToken public rentableToken;
    
    // Contract owner
    address public owner;
    
    // Notary registry
    mapping(address => bool) public authorizedNotaries;
    
    // Sale status enum
    enum SaleStatus {
        None,
        Listed,
        PendingApproval,
        Approved,
        Completed,
        Cancelled
    }
    
    // Sale struct
    struct Sale {
        uint256 propertyId;
        address seller;
        address buyer;
        uint256 price;
        address notary;
        SaleStatus status;
        uint256 createdAt;
        uint256 updatedAt;
        uint256 completedAt;
        string saleDocumentURI;
        bool rentableTokensIncluded;
        uint256 rentableTokenAmount;
    }
    
    // Sale tracking
    mapping(uint256 => Sale) public sales;
    uint256 public saleCounter;
    mapping(uint256 => uint256) public propertyToActiveSale;
    
    // Escrow tracking
    mapping(uint256 => uint256) public saleEscrow;
    
    // Fee configuration
    uint256 public platformFeePercentage; // In basis points (e.g., 100 = 1%)
    address public feeCollector;
    
    // ==========
    // EVENTS
    // ==========
    event NotaryAuthorized(address indexed notary);
    event NotaryRemoved(address indexed notary);
    event SaleCreated(uint256 indexed saleId, uint256 indexed propertyId, address seller, uint256 price);
    event BuyerAssigned(uint256 indexed saleId, address buyer);
    event NotaryAssigned(uint256 indexed saleId, address notary);
    event SaleApproved(uint256 indexed saleId, address notary);
    event EscrowDeposited(uint256 indexed saleId, address buyer, uint256 amount);
    event SaleCompleted(uint256 indexed saleId, uint256 indexed propertyId, address seller, address buyer, uint256 price);
    event SaleCancelled(uint256 indexed saleId, string reason);
    event PriceUpdated(uint256 indexed saleId, uint256 oldPrice, uint256 newPrice);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeCollectorUpdated(address oldCollector, address newCollector);
    event RentableTokensConfigured(uint256 indexed saleId, bool included, uint256 amount);
    
    // ==========
    // MODIFIERS
    // ==========
    
    /**
     * @dev Ensures caller is the contract owner
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "RealEstateSale: caller is not the owner");
        _;
    }
    
    /**
     * @dev Ensures caller is an authorized notary
     */
    modifier onlyNotary() {
        require(authorizedNotaries[msg.sender], "RealEstateSale: caller is not an authorized notary");
        _;
    }
    
    /**
     * @dev Ensures caller is the seller of the specified sale
     * @param saleId ID of the sale
     */
    modifier onlySeller(uint256 saleId) {
        require(sales[saleId].seller == msg.sender, "RealEstateSale: caller is not the seller");
        _;
    }
    
    /**
     * @dev Ensures caller is the buyer of the specified sale
     * @param saleId ID of the sale
     */
    modifier onlyBuyer(uint256 saleId) {
        require(sales[saleId].buyer == msg.sender, "RealEstateSale: caller is not the buyer");
        _;
    }
    
    /**
     * @dev Ensures caller is the assigned notary of the specified sale
     * @param saleId ID of the sale
     */
    modifier onlySaleNotary(uint256 saleId) {
        require(sales[saleId].notary == msg.sender, "RealEstateSale: caller is not the assigned notary");
        _;
    }
    
    /**
     * @dev Ensures the sale is in the specified status
     * @param saleId ID of the sale
     * @param status Expected status
     */
    modifier inStatus(uint256 saleId, SaleStatus status) {
        require(sales[saleId].status == status, "RealEstateSale: invalid sale status");
        _;
    }
    
    // ===========
    // CONSTRUCTOR
    // ===========
    
    /**
     * @dev Initializes the contract with token references and fee configuration
     * @param _propertyToken Address of the RealEstateERC721 contract
     * @param _rentableToken Address of the RentableToken contract
     * @param _platformFeePercentage Initial platform fee percentage in basis points
     * @param _feeCollector Address to collect platform fees
     */
    constructor(
        address _propertyToken,
        address _rentableToken,
        uint256 _platformFeePercentage,
        address _feeCollector
    ) {
        require(_propertyToken != address(0), "RealEstateSale: invalid property token address");
        require(_feeCollector != address(0), "RealEstateSale: invalid fee collector address");
        require(_platformFeePercentage <= 1000, "RealEstateSale: fee percentage too high"); // Max 10%
        
        propertyToken = RealEstateERC721(_propertyToken);
        
        // RentableToken is optional
        if (_rentableToken != address(0)) {
            rentableToken = RentableToken(payable(_rentableToken));
        }
        
        owner = msg.sender;
        authorizedNotaries[msg.sender] = true; // Owner is a notary by default
        
        platformFeePercentage = _platformFeePercentage;
        feeCollector = _feeCollector;
        
        emit NotaryAuthorized(msg.sender);
    }
    
    // ======================
    // ADMINISTRATIVE FUNCTIONS
    // ======================
    
    /**
     * @dev Transfers ownership of the contract
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "RealEstateSale: invalid address");
        owner = newOwner;
    }
    
    /**
     * @dev Authorizes a new notary
     * @param notary Address to authorize as notary
     */
    function authorizeNotary(address notary) external onlyOwner {
        require(notary != address(0), "RealEstateSale: invalid address");
        require(!authorizedNotaries[notary], "RealEstateSale: already authorized");
        
        authorizedNotaries[notary] = true;
        emit NotaryAuthorized(notary);
    }
    
    /**
     * @dev Removes a notary's authorization
     * @param notary Address to remove authorization from
     */
    function removeNotary(address notary) external onlyOwner {
        require(authorizedNotaries[notary], "RealEstateSale: not authorized");
        require(notary != owner, "RealEstateSale: cannot remove owner");
        
        authorizedNotaries[notary] = false;
        emit NotaryRemoved(notary);
    }
    
    /**
     * @dev Updates the platform fee percentage
     * @param newFeePercentage New fee percentage in basis points
     */
    function updatePlatformFee(uint256 newFeePercentage) external onlyOwner {
        require(newFeePercentage <= 1000, "RealEstateSale: fee percentage too high"); // Max 10%
        
        uint256 oldFee = platformFeePercentage;
        platformFeePercentage = newFeePercentage;
        
        emit PlatformFeeUpdated(oldFee, newFeePercentage);
    }
    
    /**
     * @dev Updates the fee collector address
     * @param newFeeCollector New address to collect fees
     */
    function updateFeeCollector(address newFeeCollector) external onlyOwner {
        require(newFeeCollector != address(0), "RealEstateSale: invalid address");
        
        address oldCollector = feeCollector;
        feeCollector = newFeeCollector;
        
        emit FeeCollectorUpdated(oldCollector, newFeeCollector);
    }
    
    // ======================
    // SALE CREATION AND MANAGEMENT
    // ======================
    
    /**
     * @dev Creates a new property sale listing
     * @param propertyId ID of the property token
     * @param price Sale price in wei
     * @param saleDocumentURI URI for legal sale documents
     * @return saleId ID of the created sale
     */
    function createSale(
        uint256 propertyId,
        uint256 price,
        string memory saleDocumentURI
    ) external nonReentrant returns (uint256) {
        // Verify caller owns the property
        require(propertyToken.ownerOf(propertyId) == msg.sender, "RealEstateSale: caller is not the property owner");
        
        // Verify property is not already in an active sale
        require(propertyToActiveSale[propertyId] == 0, "RealEstateSale: property already in active sale");
        
        // Verify price is valid
        require(price > 0, "RealEstateSale: invalid price");
        
        // Create new sale
        uint256 saleId = ++saleCounter;
        
        sales[saleId] = Sale({
            propertyId: propertyId,
            seller: msg.sender,
            buyer: address(0),
            price: price,
            notary: address(0),
            status: SaleStatus.Listed,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            completedAt: 0,
            saleDocumentURI: saleDocumentURI,
            rentableTokensIncluded: false,
            rentableTokenAmount: 0
        });
        
        // Mark property as in active sale
        propertyToActiveSale[propertyId] = saleId;
        
        emit SaleCreated(saleId, propertyId, msg.sender, price);
        
        return saleId;
    }
    
    /**
     * @dev Updates the price of a sale
     * @param saleId ID of the sale
     * @param newPrice New sale price in wei
     */
    function updateSalePrice(uint256 saleId, uint256 newPrice) 
        external 
        onlySeller(saleId) 
        inStatus(saleId, SaleStatus.Listed) 
    {
        require(newPrice > 0, "RealEstateSale: invalid price");
        
        uint256 oldPrice = sales[saleId].price;
        sales[saleId].price = newPrice;
        sales[saleId].updatedAt = block.timestamp;
        
        emit PriceUpdated(saleId, oldPrice, newPrice);
    }
    
    /**
     * @dev Configures rentable tokens to be included in the sale
     * @param saleId ID of the sale
     * @param included Whether rentable tokens are included
     * @param amount Amount of rentable tokens to include
     */
    function configureRentableTokens(
        uint256 saleId,
        bool included,
        uint256 amount
    ) 
        external 
        onlySeller(saleId) 
        inStatus(saleId, SaleStatus.Listed) 
    {
        require(address(rentableToken) != address(0), "RealEstateSale: rentable token not configured");
        
        if (included) {
            require(amount > 0, "RealEstateSale: invalid token amount");
            
            // Verify seller has enough tokens
            require(
                rentableToken.balanceOf(sales[saleId].seller) >= amount,
                "RealEstateSale: insufficient token balance"
            );
        }
        
        sales[saleId].rentableTokensIncluded = included;
        sales[saleId].rentableTokenAmount = included ? amount : 0;
        sales[saleId].updatedAt = block.timestamp;
        
        emit RentableTokensConfigured(saleId, included, amount);
    }
    
    /**
     * @dev Cancels a sale
     * @param saleId ID of the sale
     * @param reason Reason for cancellation
     */
    function cancelSale(uint256 saleId, string memory reason) 
        external 
        nonReentrant 
    {
        Sale storage sale = sales[saleId];
        
        // Only seller can cancel a Listed sale
        // Only seller or notary can cancel a PendingApproval or Approved sale
        require(
            (sale.status == SaleStatus.Listed && msg.sender == sale.seller) ||
            ((sale.status == SaleStatus.PendingApproval || sale.status == SaleStatus.Approved) && 
             (msg.sender == sale.seller || msg.sender == sale.notary)),
            "RealEstateSale: unauthorized cancellation"
        );
        
        // Refund any escrowed funds to the buyer
        if (saleEscrow[saleId] > 0 && sale.buyer != address(0)) {
            uint256 escrowAmount = saleEscrow[saleId];
            saleEscrow[saleId] = 0;
            
            (bool success, ) = sale.buyer.call{value: escrowAmount}("");
            require(success, "RealEstateSale: escrow refund failed");
            
            emit EscrowDeposited(saleId, sale.buyer, 0); // Zero indicates refund
        }
        
        // Update sale status
        sale.status = SaleStatus.Cancelled;
        sale.updatedAt = block.timestamp;
        
        // Clear active sale marker
        propertyToActiveSale[sale.propertyId] = 0;
        
        emit SaleCancelled(saleId, reason);
    }
    
    // ======================
    // BUYER FUNCTIONS
    // ======================
    
    /**
     * @dev Allows a buyer to express interest in a property
     * @param saleId ID of the sale
     */
    function expressInterest(uint256 saleId) 
        external 
        inStatus(saleId, SaleStatus.Listed) 
    {
        require(msg.sender != sales[saleId].seller, "RealEstateSale: seller cannot be buyer");
        
        sales[saleId].buyer = msg.sender;
        sales[saleId].status = SaleStatus.PendingApproval;
        sales[saleId].updatedAt = block.timestamp;
        
        emit BuyerAssigned(saleId, msg.sender);
    }
    
    /**
     * @dev Allows a buyer to deposit funds into escrow
     * @param saleId ID of the sale
     */
    function depositEscrow(uint256 saleId) 
        external 
        payable 
        onlyBuyer(saleId) 
        inStatus(saleId, SaleStatus.Approved) 
        nonReentrant 
    {
        Sale storage sale = sales[saleId];
        
        // Verify deposit amount matches the sale price
        require(msg.value == sale.price, "RealEstateSale: incorrect payment amount");
        
        // Update escrow balance
        saleEscrow[saleId] = msg.value;
        
        emit EscrowDeposited(saleId, msg.sender, msg.value);
    }
    
    // ======================
    // NOTARY FUNCTIONS
    // ======================
    
    /**
     * @dev Assigns a notary to a sale
     * @param saleId ID of the sale
     */
    function assignNotary(uint256 saleId) 
        external 
        onlyNotary 
        inStatus(saleId, SaleStatus.PendingApproval) 
    {
        sales[saleId].notary = msg.sender;
        sales[saleId].updatedAt = block.timestamp;
        
        emit NotaryAssigned(saleId, msg.sender);
    }
    
    /**
     * @dev Approves a sale after verification
     * @param saleId ID of the sale
     */
    function approveSale(uint256 saleId) 
        external 
        onlySaleNotary(saleId) 
        inStatus(saleId, SaleStatus.PendingApproval) 
    {
        sales[saleId].status = SaleStatus.Approved;
        sales[saleId].updatedAt = block.timestamp;
        
        emit SaleApproved(saleId, msg.sender);
    }
    
    /**
     * @dev Completes a sale after verification and escrow deposit
     * @param saleId ID of the sale
     */
    function completeSale(uint256 saleId) 
        external 
        onlySaleNotary(saleId) 
        inStatus(saleId, SaleStatus.Approved) 
        nonReentrant 
    {
        Sale storage sale = sales[saleId];
        
        // Verify escrow has been deposited
        require(saleEscrow[saleId] == sale.price, "RealEstateSale: escrow not deposited");
        
        // Verify seller still owns the property
        require(
            propertyToken.ownerOf(sale.propertyId) == sale.seller,
            "RealEstateSale: seller no longer owns property"
        );
        
        // Calculate platform fee
        uint256 platformFee = (sale.price * platformFeePercentage) / 10000;
        uint256 sellerAmount = sale.price - platformFee;
        
        // Clear escrow
        uint256 escrowAmount = saleEscrow[saleId];
        saleEscrow[saleId] = 0;
        
        // Transfer property to buyer
        try propertyToken.safeTransferFrom(sale.seller, sale.buyer, sale.propertyId) {
            // Transfer rentable tokens if included
            if (sale.rentableTokensIncluded && sale.rentableTokenAmount > 0) {
                try rentableToken.transferFrom(sale.seller, sale.buyer, sale.rentableTokenAmount) {
                    // Success
                } catch {
                    // If token transfer fails, we still proceed with the sale
                    // but log that tokens were not transferred
                    sale.rentableTokensIncluded = false;
                    sale.rentableTokenAmount = 0;
                    emit RentableTokensConfigured(saleId, false, 0);
                }
            }
            
            // Transfer funds to seller
            (bool sellerTransferSuccess, ) = sale.seller.call{value: sellerAmount}("");
            require(sellerTransferSuccess, "RealEstateSale: seller payment failed");
            
            // Transfer platform fee
            if (platformFee > 0) {
                (bool feeTransferSuccess, ) = feeCollector.call{value: platformFee}("");
                require(feeTransferSuccess, "RealEstateSale: fee payment failed");
            }
            
            // Update sale status
            sale.status = SaleStatus.Completed;
            sale.completedAt = block.timestamp;
            sale.updatedAt = block.timestamp;
            
            // Clear active sale marker
            propertyToActiveSale[sale.propertyId] = 0;
            
            emit SaleCompleted(saleId, sale.propertyId, sale.seller, sale.buyer, sale.price);
        } catch {
            // If property transfer fails, refund escrow to buyer
            (bool refundSuccess, ) = sale.buyer.call{value: escrowAmount}("");
            require(refundSuccess, "RealEstateSale: escrow refund failed");
            
            emit SaleCancelled(saleId, "Property transfer failed");
        }
    }
    
    // ======================
    // QUERY FUNCTIONS
    // ======================
    
    /**
     * @dev Gets details of a sale
     * @param saleId ID of the sale
     * @return Sale struct with all details
     */
    function getSale(uint256 saleId) external view returns (Sale memory) {
        return sales[saleId];
    }
    
    /**
     * @dev Gets the active sale ID for a property
     * @param propertyId ID of the property
     * @return Sale ID if active, 0 if none
     */
    function getActiveSaleForProperty(uint256 propertyId) external view returns (uint256) {
        return propertyToActiveSale[propertyId];
    }
    
    /**
     * @dev Gets the escrow balance for a sale
     * @param saleId ID of the sale
     * @return Escrow amount in wei
     */
    function getEscrowBalance(uint256 saleId) external view returns (uint256) {
        return saleEscrow[saleId];
    }
    
    /**
     * @dev Checks if an address is an authorized notary
     * @param notary Address to check
     * @return Whether the address is an authorized notary
     */
    function isAuthorizedNotary(address notary) external view returns (bool) {
        return authorizedNotaries[notary];
    }
    
    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {
        // Only accept direct payments for escrow deposits
        revert("RealEstateSale: use depositEscrow function");
    }
}

