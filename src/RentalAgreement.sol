// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./RealEstateERC721.sol";

/**
 * @title RentalAgreement
 * @dev Contract for managing rental agreements for real estate properties
 */
contract RentalAgreement is ReentrancyGuard, AccessControl {
    bytes32 public constant RENTAL_MANAGER_ROLE = keccak256("RENTAL_MANAGER_ROLE");
    
    RealEstateERC721 public propertyToken;
    
    enum RentalStatus { None, Active, Terminated, Expired }
    
    struct Rental {
        uint256 propertyId;
        address landlord;
        address tenant;
        uint256 monthlyRent;
        uint256 securityDeposit;
        uint256 startDate;
        uint256 endDate;
        uint256 lastPaymentDate;
        RentalStatus status;
        string agreementURI;
    }
    
    // Mapping from rental ID to Rental
    mapping(uint256 => Rental) private _rentals;
    uint256 private _rentalIdCounter;
    
    // Security deposits held
    mapping(uint256 => uint256) private _securityDeposits;
    
    // Events
    event RentalCreated(uint256 indexed rentalId, uint256 indexed propertyId, address landlord, address tenant);
    event RentPaid(uint256 indexed rentalId, uint256 amount, uint256 paymentDate);
    event RentalTerminated(uint256 indexed rentalId, string reason);
    event RentalExpired(uint256 indexed rentalId);
    event SecurityDepositReturned(uint256 indexed rentalId, address tenant, uint256 amount);
    
    constructor(address propertyTokenAddress) {
        propertyToken = RealEstateERC721(propertyTokenAddress);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(RENTAL_MANAGER_ROLE, msg.sender);
    }
    
    /**
     * @dev Creates a new rental agreement
     * @param propertyId The ID of the property token
     * @param tenant The address of the tenant
     * @param monthlyRent The monthly rent amount in wei
     * @param securityDeposit The security deposit amount in wei
     * @param durationMonths The rental duration in months
     * @param agreementURI URI to the legal rental agreement document
     * @return The ID of the newly created rental
     */
    function createRental(
        uint256 propertyId,
        address tenant,
        uint256 monthlyRent,
        uint256 securityDeposit,
        uint256 durationMonths,
        string memory agreementURI
    ) public payable returns (uint256) {
        require(propertyToken.ownerOf(propertyId) == msg.sender, "Caller is not the property owner");
        require(tenant != address(0), "Invalid tenant address");
        require(monthlyRent > 0, "Monthly rent must be greater than zero");
        require(durationMonths > 0, "Duration must be greater than zero");
        
        // If security deposit is required, ensure it's provided
        if (securityDeposit > 0) {
            require(msg.value >= securityDeposit, "Insufficient security deposit");
        }
        
        uint256 rentalId = _rentalIdCounter++;
        uint256 startDate = block.timestamp;
        uint256 endDate = startDate + (durationMonths * 30 days);
        
        _rentals[rentalId] = Rental({
            propertyId: propertyId,
            landlord: msg.sender,
            tenant: tenant,
            monthlyRent: monthlyRent,
            securityDeposit: securityDeposit,
            startDate: startDate,
            endDate: endDate,
            lastPaymentDate: startDate,
            status: RentalStatus.Active,
            agreementURI: agreementURI
        });
        
        // Store security deposit
        if (securityDeposit > 0) {
            _securityDeposits[rentalId] = securityDeposit;
            
            // Refund excess payment if any
            if (msg.value > securityDeposit) {
                payable(msg.sender).transfer(msg.value - securityDeposit);
            }
        }
        
        emit RentalCreated(rentalId, propertyId, msg.sender, tenant);
        
        return rentalId;
    }
    
    /**
     * @dev Pays rent for a rental agreement
     * @param rentalId The ID of the rental
     */
    function payRent(uint256 rentalId) public payable nonReentrant {
        Rental storage rental = _rentals[rentalId];
        
        require(rental.status == RentalStatus.Active, "Rental is not active");
        require(msg.sender == rental.tenant, "Only tenant can pay rent");
        require(msg.value >= rental.monthlyRent, "Insufficient rent payment");
        
        // Transfer rent to landlord
        payable(rental.landlord).transfer(rental.monthlyRent);
        
        // Refund excess payment if any
        if (msg.value > rental.monthlyRent) {
            payable(msg.sender).transfer(msg.value - rental.monthlyRent);
        }
        
        rental.lastPaymentDate = block.timestamp;
        
        emit RentPaid(rentalId, rental.monthlyRent, block.timestamp);
    }
    
    /**
     * @dev Terminates a rental agreement
     * @param rentalId The ID of the rental
     * @param reason The reason for termination
     */
    function terminateRental(uint256 rentalId, string memory reason) public {
        Rental storage rental = _rentals[rentalId];
        
        require(rental.status == RentalStatus.Active, "Rental is not active");
        require(
            msg.sender == rental.landlord || 
            msg.sender == rental.tenant || 
            hasRole(RENTAL_MANAGER_ROLE, msg.sender), 
            "Unauthorized"
        );
        
        rental.status = RentalStatus.Terminated;
        
        emit RentalTerminated(rentalId, reason);
    }
    
    /**
     * @dev Marks a rental as expired
     * @param rentalId The ID of the rental
     */
    function expireRental(uint256 rentalId) public {
        Rental storage rental = _rentals[rentalId];
        
        require(rental.status == RentalStatus.Active, "Rental is not active");
        require(block.timestamp >= rental.endDate, "Rental is not past end date");
        
        rental.status = RentalStatus.Expired;
        
        emit RentalExpired(rentalId);
    }
    
    /**
     * @dev Returns security deposit to tenant
     * @param rentalId The ID of the rental
     * @param deductions Amount to deduct from security deposit
     */
    function returnSecurityDeposit(uint256 rentalId, uint256 deductions) public nonReentrant {
        Rental storage rental = _rentals[rentalId];
        
        require(
            rental.status == RentalStatus.Terminated || 
            rental.status == RentalStatus.Expired, 
            "Rental must be terminated or expired"
        );
        require(msg.sender == rental.landlord, "Only landlord can return security deposit");
        
        uint256 depositAmount = _securityDeposits[rentalId];
        require(depositAmount > 0, "No security deposit to return");
        require(deductions <= depositAmount, "Deductions exceed deposit");
        
        uint256 returnAmount = depositAmount - deductions;
        
        // Clear security deposit
        _securityDeposits[rentalId] = 0;
        
        // Transfer remaining deposit to tenant
        if (returnAmount > 0) {
            payable(rental.tenant).transfer(returnAmount);
        }
        
        // Transfer deductions to landlord
        if (deductions > 0) {
            payable(rental.landlord).transfer(deductions);
        }
        
        emit SecurityDepositReturned(rentalId, rental.tenant, returnAmount);
    }
    
    /**
     * @dev Gets rental details
     * @param rentalId The ID of the rental
     * @return Rental details
     */
    function getRental(uint256 rentalId) public view returns (Rental memory) {
        return _rentals[rentalId];
    }
    
    /**
     * @dev Gets the security deposit for a rental
     * @param rentalId The ID of the rental
     * @return The security deposit amount
     */
    function getSecurityDeposit(uint256 rentalId) public view returns (uint256) {
        return _securityDeposits[rentalId];
    }
    
    /**
     * @dev Checks if rent is overdue
     * @param rentalId The ID of the rental
     * @return Whether rent is overdue
     */
    function isRentOverdue(uint256 rentalId) public view returns (bool) {
        Rental storage rental = _rentals[rentalId];
        
        if (rental.status != RentalStatus.Active) {
            return false;
        }
        
        // Rent is considered overdue if more than 30 days have passed since last payment
        return block.timestamp > rental.lastPaymentDate + 30 days;
    }
    
    // Function to receive ETH
    receive() external payable {}
}

