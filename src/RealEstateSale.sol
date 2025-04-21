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
    
    RealEstateERC721 public propertyToken;
    RentableToken public rentableToken;
    
    address public owner;
    
    mapping(address => bool) public authorizedNotaries;
    
    enum SaleStatus {
        None,
        Listed,
        PendingApproval,
        Approved,
        Completed,
        Cancelled
    }
    
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
    
    mapping(uint256 => Sale) public sales;
    uint256 public saleCounter;
    mapping(uint256 => uint256) public propertyToActiveSale;
    
    mapping(uint256 => uint256) public saleEscrow;
    
    uint256 public platformFeePercentage;
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
    
    modifier onlyOwner() {
        require(msg.sender == owner, "RealEstateSale: caller is not the owner");
        _;
    }
    
    modifier onlyNotary() {
        require(authorizedNotaries[msg.sender], "RealEstateSale: caller is not an authorized notary");
        _;
    }
    
    modifier onlySeller(uint256 saleId) {
        require(sales[saleId].seller == msg.sender, "RealEstateSale: caller is not the seller");
        _;
    }
    
    modifier onlyBuyer(uint256 saleId) {
        require(sales[saleId].buyer == msg.sender, "RealEstateSale: caller is not the buyer");
        _;
    }
    
    modifier onlySaleNotary(uint256 saleId) {
        require(sales[saleId].notary == msg.sender, "RealEstateSale: caller is not the assigned notary");
        _;
    }
    
    modifier inStatus(uint256 saleId, SaleStatus status) {
        require(sales[saleId].status == status, "RealEstateSale: invalid sale status");
        _;
    }
    
    // ===========
    // CONSTRUCTOR
    // ===========
    
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
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "RealEstateSale: invalid address");
        owner = newOwner;
    }
    
    function authorizeNotary(address notary) external onlyOwner {
        require(notary != address(0), "RealEstateSale: invalid address");
        require(!authorizedNotaries[notary], "RealEstateSale: already authorized");
        
        authorizedNotaries[notary] = true;
        emit NotaryAuthorized(notary);
    }
    
  
    function removeNotary(address notary) external onlyOwner {
        require(authorizedNotaries[notary], "RealEstateSale: not authorized");
        require(notary != owner, "RealEstateSale: cannot remove owner");
        
        authorizedNotaries[notary] = false;
        emit NotaryRemoved(notary);
    }
    
    function updatePlatformFee(uint256 newFeePercentage) external onlyOwner {
        require(newFeePercentage <= 1000, "RealEstateSale: fee percentage too high"); // Max 10%
        
        uint256 oldFee = platformFeePercentage;
        platformFeePercentage = newFeePercentage;
        
        emit PlatformFeeUpdated(oldFee, newFeePercentage);
    }
    
    function updateFeeCollector(address newFeeCollector) external onlyOwner {
        require(newFeeCollector != address(0), "RealEstateSale: invalid address");
        
        address oldCollector = feeCollector;
        feeCollector = newFeeCollector;
        
        emit FeeCollectorUpdated(oldCollector, newFeeCollector);
    }
    
    // ======================
    // SALE CREATION AND MANAGEMENT
    // ======================
    
    function createSale(
        uint256 propertyId,
        uint256 price,
        string memory saleDocumentURI
    ) external nonReentrant returns (uint256) {
        require(propertyToken.ownerOf(propertyId) == msg.sender, "RealEstateSale: caller is not the property owner");
        
        require(propertyToActiveSale[propertyId] == 0, "RealEstateSale: property already in active sale");
        
        require(price > 0, "RealEstateSale: invalid price");
        
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
        
        propertyToActiveSale[propertyId] = saleId;
        
        emit SaleCreated(saleId, propertyId, msg.sender, price);
        
        return saleId;
    }
    
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
    
    function cancelSale(uint256 saleId, string memory reason) 
        external 
        nonReentrant 
    {
        Sale storage sale = sales[saleId];
        require(
            (sale.status == SaleStatus.Listed && msg.sender == sale.seller) ||
            ((sale.status == SaleStatus.PendingApproval || sale.status == SaleStatus.Approved) && 
             (msg.sender == sale.seller || msg.sender == sale.notary)),
            "RealEstateSale: unauthorized cancellation"
        );
        
        if (saleEscrow[saleId] > 0 && sale.buyer != address(0)) {
            uint256 escrowAmount = saleEscrow[saleId];
            saleEscrow[saleId] = 0;
            
            (bool success, ) = sale.buyer.call{value: escrowAmount}("");
            require(success, "RealEstateSale: escrow refund failed");
            
            emit EscrowDeposited(saleId, sale.buyer, 0); // Zero indicates refund
        }
        
        sale.status = SaleStatus.Cancelled;
        sale.updatedAt = block.timestamp;
        
        propertyToActiveSale[sale.propertyId] = 0;
        
        emit SaleCancelled(saleId, reason);
    }
    
    // ======================
    // BUYER FUNCTIONS
    // ======================
    
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
    
    function depositEscrow(uint256 saleId) 
        external 
        payable 
        onlyBuyer(saleId) 
        inStatus(saleId, SaleStatus.Approved) 
        nonReentrant 
    {
        Sale storage sale = sales[saleId];
        
        require(msg.value == sale.price, "RealEstateSale: incorrect payment amount");
        
        saleEscrow[saleId] = msg.value;
        
        emit EscrowDeposited(saleId, msg.sender, msg.value);
    }
    
    // ======================
    // NOTARY FUNCTIONS
    // ======================
    
    function assignNotary(uint256 saleId) 
        external 
        onlyNotary 
        inStatus(saleId, SaleStatus.PendingApproval) 
    {
        sales[saleId].notary = msg.sender;
        sales[saleId].updatedAt = block.timestamp;
        
        emit NotaryAssigned(saleId, msg.sender);
    }
    

    function approveSale(uint256 saleId) 
        external 
        onlySaleNotary(saleId) 
        inStatus(saleId, SaleStatus.PendingApproval) 
    {
        sales[saleId].status = SaleStatus.Approved;
        sales[saleId].updatedAt = block.timestamp;
        
        emit SaleApproved(saleId, msg.sender);
    }
    
    function completeSale(uint256 saleId) 
        external 
        onlySaleNotary(saleId) 
        inStatus(saleId, SaleStatus.Approved) 
        nonReentrant 
    {
        Sale storage sale = sales[saleId];
        
        require(saleEscrow[saleId] == sale.price, "RealEstateSale: escrow not deposited");
        
        require(
            propertyToken.ownerOf(sale.propertyId) == sale.seller,
            "RealEstateSale: seller no longer owns property"
        );
        
        uint256 platformFee = (sale.price * platformFeePercentage) / 10000;
        uint256 sellerAmount = sale.price - platformFee;
        
        uint256 escrowAmount = saleEscrow[saleId];
        saleEscrow[saleId] = 0;
        
        try propertyToken.safeTransferFrom(sale.seller, sale.buyer, sale.propertyId) {
            if (sale.rentableTokensIncluded && sale.rentableTokenAmount > 0) {
                try rentableToken.transferFrom(sale.seller, sale.buyer, sale.rentableTokenAmount) {
                } catch {
                    sale.rentableTokensIncluded = false;
                    sale.rentableTokenAmount = 0;
                    emit RentableTokensConfigured(saleId, false, 0);
                }
            }
            
            (bool sellerTransferSuccess, ) = sale.seller.call{value: sellerAmount}("");
            require(sellerTransferSuccess, "RealEstateSale: seller payment failed");
            
            if (platformFee > 0) {
                (bool feeTransferSuccess, ) = feeCollector.call{value: platformFee}("");
                require(feeTransferSuccess, "RealEstateSale: fee payment failed");
            }
            
            sale.status = SaleStatus.Completed;
            sale.completedAt = block.timestamp;
            sale.updatedAt = block.timestamp;
            
            propertyToActiveSale[sale.propertyId] = 0;
            
            emit SaleCompleted(saleId, sale.propertyId, sale.seller, sale.buyer, sale.price);
        } catch {
            (bool refundSuccess, ) = sale.buyer.call{value: escrowAmount}("");
            require(refundSuccess, "RealEstateSale: escrow refund failed");
            
            emit SaleCancelled(saleId, "Property transfer failed");
        }
    }
    
    // ======================
    // QUERY FUNCTIONS
    // ======================
    
    function getSale(uint256 saleId) external view returns (Sale memory) {
        return sales[saleId];
    }
    
    function getActiveSaleForProperty(uint256 propertyId) external view returns (uint256) {
        return propertyToActiveSale[propertyId];
    }
    
    function getEscrowBalance(uint256 saleId) external view returns (uint256) {
        return saleEscrow[saleId];
    }
    
    function isAuthorizedNotary(address notary) external view returns (bool) {
        return authorizedNotaries[notary];
    }
    
    receive() external payable {
        // Only accept direct payments for escrow deposits
        revert("RealEstateSale: use depositEscrow function");
    }
}

