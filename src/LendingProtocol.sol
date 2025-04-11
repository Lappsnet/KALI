// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {RealEstateERC721} from "./RealEstateERC721.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

/**
 * @title LendingProtocol
 * @dev Manages loans secured by tokenized real estate properties,
 * with collateralization, repayment tracking, and liquidation processes.
 */
contract LendingProtocol is ReentrancyGuard, IERC721Receiver {
    // ==========
    // STATE VARIABLES
    // ==========
    
    // Contract references
    RealEstateERC721 public propertyToken;
    
    // Contract owner
    address public owner;
    
    // Loan officer registry
    mapping(address => bool) public loanOfficers;
    
    // Loan status enum
    enum LoanStatus {
        None,
        Active,
        Repaid,
        Defaulted,
        Liquidated
    }
    
    // Loan struct
    struct Loan {
        uint256 propertyId;
        address borrower;
        uint256 principal;
        uint256 interestRate;      // Annual interest rate in basis points (e.g., 500 = 5%)
        uint256 originationFee;    // One-time fee in basis points
        uint256 term;              // Loan duration in seconds
        uint256 startTime;
        uint256 maturityTime;
        uint256 lastInterestCalcTime;
        uint256 totalRepaid;
        uint256 remainingPrincipal;
        LoanStatus status;
        address loanOfficer;
        uint256 loanToValueRatio;  // In basis points (e.g., 7000 = 70%)
        uint256 liquidationThreshold; // In basis points (e.g., 8500 = 85%)
    }
    
    // Loan tracking
    mapping(uint256 => Loan) public loans;
    uint256 public loanCounter;
    mapping(uint256 => uint256) public propertyToActiveLoan;
    mapping(address => uint256[]) public borrowerLoans;
    
    // Payment tracking
    struct Payment {
        uint256 loanId;
        uint256 amount;
        uint256 timestamp;
        uint256 principalPortion;
        uint256 interestPortion;
        uint256 feePortion;
    }
    mapping(uint256 => Payment[]) public loanPayments;
    
    // Protocol parameters
    uint256 public minLoanAmount;
    uint256 public maxLoanToValueRatio;    // In basis points
    uint256 public liquidationThreshold;   // In basis points
    uint256 public liquidationPenalty;     // In basis points
    uint256 public protocolFeePercentage;  // In basis points
    address public feeCollector;
    
    // Liquidation auction
    struct Auction {
        uint256 loanId;
        uint256 propertyId;
        uint256 startingPrice;
        uint256 currentPrice;
        uint256 startTime;
        uint256 endTime;
        address highestBidder;
        uint256 highestBid;
        bool finalized;
    }
    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => uint256) public propertyToAuction;
    
    // ==========
    // EVENTS
    // ==========
    event LoanOfficerAdded(address indexed officer);
    event LoanOfficerRemoved(address indexed officer);
    event LoanRequested(uint256 indexed loanId, uint256 indexed propertyId, address borrower, uint256 amount);
    event LoanApproved(uint256 indexed loanId, address loanOfficer);
    event LoanFunded(uint256 indexed loanId, uint256 amount);
    event LoanRepayment(uint256 indexed loanId, uint256 amount, uint256 principalPortion, uint256 interestPortion);
    event LoanFullyRepaid(uint256 indexed loanId);
    event LoanDefaulted(uint256 indexed loanId);
    event CollateralLiquidated(uint256 indexed loanId, uint256 indexed propertyId);
    event AuctionStarted(uint256 indexed loanId, uint256 indexed propertyId, uint256 startingPrice);
    event AuctionBid(uint256 indexed auctionId, address bidder, uint256 amount);
    event AuctionFinalized(uint256 indexed auctionId, address winner, uint256 amount);
    event ProtocolParametersUpdated(string parameter, uint256 value);
    event FeeCollectorUpdated(address oldCollector, address newCollector);
    
    // ==========
    // MODIFIERS
    // ==========
    
    /**
     * @dev Ensures caller is the contract owner
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "LendingProtocol: caller is not the owner");
        _;
    }
    
    /**
     * @dev Ensures caller is a loan officer
     */
    modifier onlyLoanOfficer() {
        require(loanOfficers[msg.sender], "LendingProtocol: caller is not a loan officer");
        _;
    }
    
    /**
     * @dev Ensures caller is the borrower of the specified loan
     * @param loanId ID of the loan
     */
    modifier onlyBorrower(uint256 loanId) {
        require(loans[loanId].borrower == msg.sender, "LendingProtocol: caller is not the borrower");
        _;
    }
    
    /**
     * @dev Ensures the loan is in the specified status
     * @param loanId ID of the loan
     * @param status Expected status
     */
    modifier inLoanStatus(uint256 loanId, LoanStatus status) {
        require(loans[loanId].status == status, "LendingProtocol: invalid loan status");
        _;
    }
    
    // ===========
    // CONSTRUCTOR
    // ===========
    
    /**
     * @dev Initializes the contract with token references and protocol parameters
     * @param _propertyToken Address of the RealEstateERC721 contract
     * @param _minLoanAmount Minimum loan amount in wei
     * @param _maxLoanToValueRatio Maximum loan-to-value ratio in basis points
     * @param _liquidationThreshold Liquidation threshold in basis points
     * @param _liquidationPenalty Liquidation penalty in basis points
     * @param _protocolFeePercentage Protocol fee percentage in basis points
     * @param _feeCollector Address to collect protocol fees
     */
    constructor(
        address _propertyToken,
        uint256 _minLoanAmount,
        uint256 _maxLoanToValueRatio,
        uint256 _liquidationThreshold,
        uint256 _liquidationPenalty,
        uint256 _protocolFeePercentage,
        address _feeCollector
    ) {
        require(_propertyToken != address(0), "LendingProtocol: invalid property token address");
        require(_feeCollector != address(0), "LendingProtocol: invalid fee collector address");
        require(_maxLoanToValueRatio <= 8000, "LendingProtocol: LTV ratio too high"); // Max 80%
        require(_liquidationThreshold > _maxLoanToValueRatio, "LendingProtocol: invalid liquidation threshold");
        require(_liquidationThreshold <= 9500, "LendingProtocol: liquidation threshold too high"); // Max 95%
        require(_protocolFeePercentage <= 1000, "LendingProtocol: fee percentage too high"); // Max 10%
        
        propertyToken = RealEstateERC721(_propertyToken);
        
        owner = msg.sender;
        loanOfficers[msg.sender] = true; // Owner is a loan officer by default
        
        minLoanAmount = _minLoanAmount;
        maxLoanToValueRatio = _maxLoanToValueRatio;
        liquidationThreshold = _liquidationThreshold;
        liquidationPenalty = _liquidationPenalty;
        protocolFeePercentage = _protocolFeePercentage;
        feeCollector = _feeCollector;
        
        emit LoanOfficerAdded(msg.sender);
    }
    
    // ======================
    // IERC721Receiver IMPLEMENTATION
    // ======================
    
    /**
     * @dev Implementation of IERC721Receiver interface
     * This function is called by the ERC721 contract when a token is transferred to this contract
     */
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
    
    // ======================
    // ADMINISTRATIVE FUNCTIONS
    // ======================
    
    /**
     * @dev Transfers ownership of the contract
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "LendingProtocol: invalid address");
        owner = newOwner;
    }
    
    /**
     * @dev Adds a new loan officer
     * @param officer Address to be granted loan officer privileges
     */
    function addLoanOfficer(address officer) external onlyOwner {
        require(officer != address(0), "LendingProtocol: invalid address");
        require(!loanOfficers[officer], "LendingProtocol: already a loan officer");
        
        loanOfficers[officer] = true;
        emit LoanOfficerAdded(officer);
    }
    
    /**
     * @dev Removes a loan officer's authorization
     * @param officer Address to have loan officer privileges revoked
     */
    function removeLoanOfficer(address officer) external onlyOwner {
        require(loanOfficers[officer], "LendingProtocol: not a loan officer");
        require(officer != owner, "LendingProtocol: cannot remove owner");
        
        loanOfficers[officer] = false;
        emit LoanOfficerRemoved(officer);
    }
    
    /**
     * @dev Updates protocol parameters
     * @param _minLoanAmount New minimum loan amount
     * @param _maxLoanToValueRatio New maximum loan-to-value ratio
     * @param _liquidationThreshold New liquidation threshold
     * @param _liquidationPenalty New liquidation penalty
     * @param _protocolFeePercentage New protocol fee percentage
     */
    function updateProtocolParameters(
        uint256 _minLoanAmount,
        uint256 _maxLoanToValueRatio,
        uint256 _liquidationThreshold,
        uint256 _liquidationPenalty,
        uint256 _protocolFeePercentage
    ) external onlyOwner {
        require(_maxLoanToValueRatio <= 8000, "LendingProtocol: LTV ratio too high"); // Max 80%
        require(_liquidationThreshold > _maxLoanToValueRatio, "LendingProtocol: invalid liquidation threshold");
        require(_liquidationThreshold <= 9500, "LendingProtocol: liquidation threshold too high"); // Max 95%
        require(_protocolFeePercentage <= 1000, "LendingProtocol: fee percentage too high"); // Max 10%
        
        minLoanAmount = _minLoanAmount;
        maxLoanToValueRatio = _maxLoanToValueRatio;
        liquidationThreshold = _liquidationThreshold;
        liquidationPenalty = _liquidationPenalty;
        protocolFeePercentage = _protocolFeePercentage;
        
        emit ProtocolParametersUpdated("minLoanAmount", _minLoanAmount);
        emit ProtocolParametersUpdated("maxLoanToValueRatio", _maxLoanToValueRatio);
        emit ProtocolParametersUpdated("liquidationThreshold", _liquidationThreshold);
        emit ProtocolParametersUpdated("liquidationPenalty", _liquidationPenalty);
        emit ProtocolParametersUpdated("protocolFeePercentage", _protocolFeePercentage);
    }
    
    /**
     * @dev Updates the fee collector address
     * @param newFeeCollector New address to collect fees
     */
    function updateFeeCollector(address newFeeCollector) external onlyOwner {
        require(newFeeCollector != address(0), "LendingProtocol: invalid address");
        
        address oldCollector = feeCollector;
        feeCollector = newFeeCollector;
        
        emit FeeCollectorUpdated(oldCollector, newFeeCollector);
    }
    
    // ======================
    // LOAN REQUEST AND APPROVAL
    // ======================
    
    /**
     * @dev Requests a loan using a property as collateral
     * @param propertyId ID of the property token to use as collateral
     * @param loanAmount Amount of the loan in wei
     * @param interestRate Annual interest rate in basis points
     * @param term Loan duration in seconds
     * @return loanId ID of the created loan request
     */
    function requestLoan(
        uint256 propertyId,
        uint256 loanAmount,
        uint256 interestRate,
        uint256 term
    ) external nonReentrant returns (uint256) {
        // Verify caller owns the property
        require(propertyToken.ownerOf(propertyId) == msg.sender, "LendingProtocol: caller is not the property owner");
        
        // Verify property is not already collateral for an active loan
        require(propertyToActiveLoan[propertyId] == 0, "LendingProtocol: property already collateralized");
        
        // Verify loan parameters
        require(loanAmount >= minLoanAmount, "LendingProtocol: loan amount below minimum");
        require(interestRate > 0, "LendingProtocol: interest rate must be positive");
        require(term >= 7 days, "LendingProtocol: term too short");
        
        // Get property valuation from token contract
        RealEstateERC721.PropertyDetails memory details = propertyToken.getPropertyDetails(propertyId);
        require(details.active, "LendingProtocol: property not active");
        
        // Calculate loan-to-value ratio
        uint256 ltv = (loanAmount * 10000) / details.valuation;
        require(ltv <= maxLoanToValueRatio, "LendingProtocol: LTV ratio too high");
        
        // Create new loan request
        uint256 loanId = ++loanCounter;
        
        // Calculate origination fee (1% of loan amount)
        uint256 originationFee = (loanAmount * 100) / 10000;
        
        loans[loanId] = Loan({
            propertyId: propertyId,
            borrower: msg.sender,
            principal: loanAmount,
            interestRate: interestRate,
            originationFee: originationFee,
            term: term,
            startTime: 0, // Will be set when funded
            maturityTime: 0, // Will be set when funded
            lastInterestCalcTime: 0, // Will be set when funded
            totalRepaid: 0,
            remainingPrincipal: loanAmount,
            status: LoanStatus.None, // Pending approval
            loanOfficer: address(0),
            loanToValueRatio: ltv,
            liquidationThreshold: liquidationThreshold
        });
        
        // Add to borrower's loans
        borrowerLoans[msg.sender].push(loanId);
        
        emit LoanRequested(loanId, propertyId, msg.sender, loanAmount);
        
        return loanId;
    }
    
    /**
     * @dev Approves a loan request
     * @param loanId ID of the loan
     */
    function approveLoan(uint256 loanId) 
        external 
        onlyLoanOfficer 
    {
        Loan storage loan = loans[loanId];
        
        require(loan.status == LoanStatus.None, "LendingProtocol: loan not in pending status");
        require(loan.loanOfficer == address(0), "LendingProtocol: loan already has an officer");
        
        // Verify borrower still owns the property
        require(
            propertyToken.ownerOf(loan.propertyId) == loan.borrower,
            "LendingProtocol: borrower no longer owns property"
        );
        
        // Assign loan officer
        loan.loanOfficer = msg.sender;
        
        emit LoanApproved(loanId, msg.sender);
    }
    
    /**
     * @dev Funds an approved loan
     * @param loanId ID of the loan
     */
    function fundLoan(uint256 loanId) 
        external 
        payable 
        onlyLoanOfficer 
        nonReentrant 
    {
        Loan storage loan = loans[loanId];
        
        require(loan.status == LoanStatus.None, "LendingProtocol: loan not in pending status");
        require(loan.loanOfficer == msg.sender, "LendingProtocol: caller not assigned to this loan");
        require(msg.value == loan.principal, "LendingProtocol: incorrect funding amount");
        
        // Verify borrower still owns the property
        require(
            propertyToken.ownerOf(loan.propertyId) == loan.borrower,
            "LendingProtocol: borrower no longer owns property"
        );
        
        // Calculate fees and amounts
        uint256 protocolFee = (loan.principal * protocolFeePercentage) / 10000;
        uint256 originationFee = loan.originationFee;
        uint256 borrowerAmount = loan.principal - protocolFee - originationFee;
        
        // Update loan status first
        loan.status = LoanStatus.Active;
        loan.startTime = block.timestamp;
        loan.maturityTime = block.timestamp + loan.term;
        loan.lastInterestCalcTime = block.timestamp;
        
        // Mark property as collateralized
        propertyToActiveLoan[loan.propertyId] = loanId;
        
        // Transfer property to this contract as collateral
        propertyToken.safeTransferFrom(loan.borrower, address(this), loan.propertyId);
        
        // Transfer funds to borrower
        (bool success, ) = loan.borrower.call{value: borrowerAmount}("");
        require(success, "LendingProtocol: transfer to borrower failed");
        
        // Transfer protocol fee
        if (protocolFee > 0) {
            (bool feeSuccess, ) = feeCollector.call{value: protocolFee}("");
            require(feeSuccess, "LendingProtocol: fee transfer failed");
        }
        
        // Transfer origination fee to loan officer
        if (originationFee > 0) {
            (bool feeSuccess, ) = loan.loanOfficer.call{value: originationFee}("");
            require(feeSuccess, "LendingProtocol: origination fee transfer failed");
        }
        
        emit LoanFunded(loanId, loan.principal);
    }
    
    // ======================
    // LOAN REPAYMENT
    // ======================
    
    /**
     * @dev Makes a repayment on a loan
     * @param loanId ID of the loan
     */
    function makeRepayment(uint256 loanId) 
        external 
        payable 
        nonReentrant 
    {
        Loan storage loan = loans[loanId];
        
        require(loan.status == LoanStatus.Active, "LendingProtocol: loan not active");
        require(msg.value > 0, "LendingProtocol: payment amount must be positive");
        
        // Calculate accrued interest
        uint256 timeElapsed = block.timestamp - loan.lastInterestCalcTime;
        uint256 interestAccrued = calculateInterest(
            loan.remainingPrincipal,
            loan.interestRate,
            timeElapsed
        );
        
        // Update last interest calculation time
        loan.lastInterestCalcTime = block.timestamp;
        
        // Determine payment allocation
        uint256 interestPortion = interestAccrued > msg.value ? msg.value : interestAccrued;
        uint256 principalPortion = msg.value - interestPortion;
        
        // Update loan state
        loan.totalRepaid = loan.totalRepaid + msg.value;
        
        // Reduce principal if payment exceeds interest
        if (principalPortion > 0) {
            // Ensure we don't reduce principal below zero
            if (principalPortion >= loan.remainingPrincipal) {
                principalPortion = loan.remainingPrincipal;
                loan.remainingPrincipal = 0;
            } else {
                loan.remainingPrincipal = loan.remainingPrincipal - principalPortion;
            }
        }
        
        // Record payment
        loanPayments[loanId].push(Payment({
            loanId: loanId,
            amount: msg.value,
            timestamp: block.timestamp,
            principalPortion: principalPortion,
            interestPortion: interestPortion,
            feePortion: 0
        }));
        
        emit LoanRepayment(loanId, msg.value, principalPortion, interestPortion);
        
        // Check if loan is fully repaid
        if (loan.remainingPrincipal == 0) {
            // Update loan status before transferring property
            loan.status = LoanStatus.Repaid;
            
            // Clear active loan marker
            propertyToActiveLoan[loan.propertyId] = 0;
            
            // Return collateral to borrower
            propertyToken.safeTransferFrom(address(this), loan.borrower, loan.propertyId);
            
            emit LoanFullyRepaid(loanId);
        }
    }
    
    /**
     * @dev Calculates interest for a given principal, rate, and time period
     * @param principal Principal amount
     * @param interestRate Annual interest rate in basis points
     * @param timeElapsed Time elapsed in seconds
     * @return Interest amount
     */
    function calculateInterest(
        uint256 principal,
        uint256 interestRate,
        uint256 timeElapsed
    ) public pure returns (uint256) {
        // Convert annual rate to per-second rate
        // interestRate is in basis points (1/100 of a percent)
        // 10000 basis points = 100%
        // 365 days * 24 hours * 60 minutes * 60 seconds = 31536000 seconds in a year
        return (principal * interestRate * timeElapsed) / 10000 / 31536000;
    }
    
    // ======================
    // DEFAULT AND LIQUIDATION
    // ======================
    
    /**
     * @dev Marks a loan as defaulted
     * @param loanId ID of the loan
     */
    function markAsDefaulted(uint256 loanId) 
        external 
        onlyLoanOfficer 
        inLoanStatus(loanId, LoanStatus.Active) 
    {
        Loan storage loan = loans[loanId];
        
        // Verify loan is past due
        require(block.timestamp > loan.maturityTime, "LendingProtocol: loan not past due");
        
        // Mark as defaulted
        loan.status = LoanStatus.Defaulted;
        
        emit LoanDefaulted(loanId);
    }
    
    /**
     * @dev Starts liquidation auction for a defaulted loan
     * @param loanId ID of the loan
     * @param auctionDuration Duration of the auction in seconds
     */
    function startLiquidationAuction(uint256 loanId, uint256 auctionDuration) 
        external 
        onlyLoanOfficer 
        inLoanStatus(loanId, LoanStatus.Defaulted) 
    {
        require(auctionDuration >= 1 days, "LendingProtocol: auction duration too short");
        require(auctionDuration <= 14 days, "LendingProtocol: auction duration too long");
        
        Loan storage loan = loans[loanId];
        
        // Calculate starting price (remaining principal + penalty)
        uint256 penalty = (loan.remainingPrincipal * liquidationPenalty) / 10000;
        uint256 startingPrice = loan.remainingPrincipal + penalty;
        
        // Create auction
        auctions[loanId] = Auction({
            loanId: loanId,
            propertyId: loan.propertyId,
            startingPrice: startingPrice,
            currentPrice: startingPrice,
            startTime: block.timestamp,
            endTime: block.timestamp + auctionDuration,
            highestBidder: address(0),
            highestBid: 0,
            finalized: false
        });
        
        // Link property to auction
        propertyToAuction[loan.propertyId] = loanId;
        
        emit AuctionStarted(loanId, loan.propertyId, startingPrice);
    }
    
    /**
     * @dev Places a bid in a liquidation auction
     * @param loanId ID of the loan being auctioned
     */
    function placeBid(uint256 loanId) 
        external 
        payable 
        nonReentrant 
    {
        Auction storage auction = auctions[loanId];
        
        require(auction.startTime > 0, "LendingProtocol: auction does not exist");
        require(!auction.finalized, "LendingProtocol: auction already finalized");
        require(block.timestamp < auction.endTime, "LendingProtocol: auction ended");
        require(msg.value > auction.highestBid, "LendingProtocol: bid too low");
        
        // Refund previous highest bidder if exists
        if (auction.highestBidder != address(0)) {
            (bool success, ) = auction.highestBidder.call{value: auction.highestBid}("");
            require(success, "LendingProtocol: refund to previous bidder failed");
        }
        
        // Update auction with new highest bid
        auction.highestBidder = msg.sender;
        auction.highestBid = msg.value;
        
        emit AuctionBid(loanId, msg.sender, msg.value);
    }
    
    /**
     * @dev Finalizes a liquidation auction
     * @param loanId ID of the loan being auctioned
     */
    function finalizeAuction(uint256 loanId) 
        external 
        onlyLoanOfficer 
        nonReentrant 
    {
        Auction storage auction = auctions[loanId];
        Loan storage loan = loans[loanId];
        
        require(auction.startTime > 0, "LendingProtocol: auction does not exist");
        require(!auction.finalized, "LendingProtocol: auction already finalized");
        require(
            block.timestamp >= auction.endTime || 
            (auction.highestBid >= auction.startingPrice && block.timestamp >= auction.startTime + 1 days),
            "LendingProtocol: auction not ready to finalize"
        );
        
        // Mark auction as finalized
        auction.finalized = true;
        
        // If there's a winning bid
        if (auction.highestBidder != address(0)) {
            // Update loan status and clear active loan marker before transferring property
            loan.status = LoanStatus.Liquidated;
            loan.remainingPrincipal = 0;
            propertyToActiveLoan[loan.propertyId] = 0;
            
            // Transfer property to highest bidder
            propertyToken.safeTransferFrom(address(this), auction.highestBidder, loan.propertyId);
            
            // Calculate fund distribution
            uint256 remainingDebt = loan.remainingPrincipal;
            uint256 protocolFee = (auction.highestBid * protocolFeePercentage) / 10000;
            uint256 borrowerAmount = 0;
            
            // If bid exceeds debt, return excess to borrower
            if (auction.highestBid > remainingDebt + protocolFee) {
                borrowerAmount = auction.highestBid - remainingDebt - protocolFee;
            } else {
                // If bid doesn't cover debt + fee, adjust fee
                if (auction.highestBid > remainingDebt) {
                    protocolFee = auction.highestBid - remainingDebt;
                } else {
                    protocolFee = 0;
                    remainingDebt = auction.highestBid;
                }
            }
            
            // Transfer protocol fee
            if (protocolFee > 0) {
                (bool feeSuccess, ) = feeCollector.call{value: protocolFee}("");
                require(feeSuccess, "LendingProtocol: fee transfer failed");
            }
            
            // Transfer any excess to borrower
            if (borrowerAmount > 0) {
                (bool borrowerSuccess, ) = loan.borrower.call{value: borrowerAmount}("");
                require(borrowerSuccess, "LendingProtocol: borrower payment failed");
            }
            
            emit AuctionFinalized(loanId, auction.highestBidder, auction.highestBid);
            emit CollateralLiquidated(loanId, loan.propertyId);
        } else {
            // No bids, keep the property in the protocol for now
            // Could implement a reserve mechanism or retry auction later
        }
    }
    
    // ======================
    // QUERY FUNCTIONS
    // ======================
    
    /**
     * @dev Gets details of a loan
     * @param loanId ID of the loan
     * @return Loan struct with all details
     */
    function getLoan(uint256 loanId) external view returns (Loan memory) {
        return loans[loanId];
    }
    
    /**
     * @dev Gets all loans for a borrower
     * @param borrower Address of the borrower
     * @return Array of loan IDs
     */
    function getBorrowerLoans(address borrower) external view returns (uint256[] memory) {
        return borrowerLoans[borrower];
    }
    
    /**
     * @dev Gets all payments for a loan
     * @param loanId ID of the loan
     * @return Array of payments
     */
    function getLoanPayments(uint256 loanId) external view returns (Payment[] memory) {
        return loanPayments[loanId];
    }
    
    /**
     * @dev Gets the active loan ID for a property
     * @param propertyId ID of the property
     * @return Loan ID if active, 0 if none
     */
    function getActiveLoanForProperty(uint256 propertyId) external view returns (uint256) {
        return propertyToActiveLoan[propertyId];
    }
    
    /**
     * @dev Gets details of an auction
     * @param loanId ID of the loan being auctioned
     * @return Auction struct with all details
     */
    function getAuction(uint256 loanId) external view returns (Auction memory) {
        return auctions[loanId];
    }
    
    /**
     * @dev Checks if an address is a loan officer
     * @param officer Address to check
     * @return Whether the address is a loan officer
     */
    function isLoanOfficer(address officer) external view returns (bool) {
        return loanOfficers[officer];
    }
    
    /**
     * @dev Calculates the current payoff amount for a loan
     * @param loanId ID of the loan
     * @return Total amount needed to pay off the loan
     */
    function calculatePayoffAmount(uint256 loanId) external view returns (uint256) {
        Loan storage loan = loans[loanId];
        
        if (loan.status != LoanStatus.Active) {
            return 0;
        }
        
        // Calculate accrued interest
        uint256 timeElapsed = block.timestamp - loan.lastInterestCalcTime;
        uint256 interestAccrued = calculateInterest(
            loan.remainingPrincipal,
            loan.interestRate,
            timeElapsed
        );
        
        return loan.remainingPrincipal + interestAccrued;
    }
    
    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {
        // Only accept direct payments for specific functions
        revert("LendingProtocol: use specific functions to send ETH");
    }
}
