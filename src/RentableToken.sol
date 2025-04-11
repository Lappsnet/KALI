// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RentableToken
 * @dev ERC20 token with purchase, yield distribution, staking, and transfer limits
 * for real estate tokenization and rental yield distribution.
 */
contract RentableToken is ERC20, AccessControl, ReentrancyGuard {
    // ==========
    // ROLES
    // ==========
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant YIELD_MANAGER_ROLE = keccak256("YIELD_MANAGER_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    
    // ==========
    // STATE VARIABLES
    // ==========
    
    // Token economics
    uint256 public tokenPrice;
    uint256 public annualYieldRate;
    uint256 public yieldDistributionPeriod;
    uint256 public lastYieldDistribution;
    
    // Purchase tracking
    mapping(address => uint256[]) private _purchaseTimestamps;
    mapping(address => uint256[]) private _purchaseAmounts;
    
    // Transfer limits
    uint256 public maxTransferPercentage;
    uint256 public maxBurnPercentage;
    mapping(address => bool) public transferLimitExempt;
    
    // Staking
    struct StakingPosition {
        uint256 amount;
        uint256 startTime;
        uint256 lockPeriod;
        uint256 bonusRate;
    }
    mapping(address => StakingPosition[]) private _stakingPositions;
    
    // Emergency controls
    bool public paused;
    
    // Property reference (optional)
    address public propertyToken;
    uint256 public propertyId;
    
    // ==========
    // EVENTS
    // ==========
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost);
    event YieldDistributed(uint256 totalAmount);
    event YieldClaimed(address indexed claimer, uint256 amount);
    event TokensStaked(address indexed staker, uint256 amount, uint256 lockPeriod, uint256 bonusRate);
    event TokensUnstaked(address indexed staker, uint256 amount, uint256 yieldEarned);
    event TransferLimitExemptionSet(address indexed account, bool exempt);
    event TokenPriceUpdated(uint256 oldPrice, uint256 newPrice);
    event YieldRateUpdated(uint256 oldRate, uint256 newRate);
    event YieldDistributionPeriodUpdated(uint256 oldPeriod, uint256 newPeriod);
    event TransferLimitsUpdated(uint256 maxTransfer, uint256 maxBurn);
    event EmergencyPause(bool paused);
    event PropertyReferenceSet(address propertyToken, uint256 propertyId);
    
    // ==========
    // MODIFIERS
    // ==========
    
    /**
     * @dev Ensures function can only be called when not paused
     */
    modifier whenNotPaused() {
        require(!paused, "RentableToken: paused");
        _;
    }
    
    // ==========
    // CONSTRUCTOR
    // ==========
    
    /**
     * @dev Initializes the contract with token parameters
     * @param name Token name
     * @param symbol Token symbol
     * @param initialTokenPrice Initial price per token in wei
     * @param initialYieldRate Initial annual yield rate in basis points
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialTokenPrice,
        uint256 initialYieldRate
    ) ERC20(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(YIELD_MANAGER_ROLE, msg.sender);
        _grantRole(EMERGENCY_ROLE, msg.sender);
        
        tokenPrice = initialTokenPrice;
        annualYieldRate = initialYieldRate;
        yieldDistributionPeriod = 30 days;
        lastYieldDistribution = block.timestamp;
        
        // Set initial limits
        maxTransferPercentage = 2000; // 20%
        maxBurnPercentage = 1000;     // 10%
        
        // Exempt contract deployer from transfer limits
        transferLimitExempt[msg.sender] = true;
        
        // Not paused initially
        paused = false;
    }
    
    // ======================
    // PURCHASING FUNCTIONS
    // ======================
    
    /**
     * @dev Allows users to purchase tokens with ETH
     * @return Amount of tokens purchased
     */
    function purchaseTokens() 
        public 
        payable 
        nonReentrant 
        whenNotPaused
        returns (uint256) 
    {
        require(msg.value > 0, "RentableToken: payment required");
        
        // Calculate token amount
        uint256 tokenAmount = (msg.value * (10 ** decimals())) / tokenPrice;
        require(tokenAmount > 0, "RentableToken: amount too small");
        
        // Mint tokens to buyer
        _mint(msg.sender, tokenAmount);
        
        // Record purchase details for yield calculation
        _purchaseTimestamps[msg.sender].push(block.timestamp);
        _purchaseAmounts[msg.sender].push(tokenAmount);
        
        emit TokensPurchased(msg.sender, tokenAmount, msg.value);
        return tokenAmount;
    }
    
    // ======================
    // YIELD FUNCTIONS
    // ======================
    
    /**
     * @dev Distributes yield to token holders
     * Can only be called by yield manager role
     */
    function distributeYield() 
        public 
        onlyRole(YIELD_MANAGER_ROLE) 
        nonReentrant 
        whenNotPaused
    {
        require(
            block.timestamp >= lastYieldDistribution + yieldDistributionPeriod,
            "RentableToken: distribution period not elapsed"
        );
        
        uint256 currentTotalSupply = totalSupply();
        require(currentTotalSupply > 0, "RentableToken: no tokens in circulation");
        
        // Calculate yield for the period
        uint256 periodYield = (
            currentTotalSupply *
            annualYieldRate *
            (block.timestamp - lastYieldDistribution)
        ) / (365 days) / 10000;
        
        // Update last distribution timestamp
        lastYieldDistribution = block.timestamp;
        
        if (periodYield > 0) {
            // Mint new tokens to the contract for yield distribution
            _mint(address(this), periodYield);
            emit YieldDistributed(periodYield);
        }
    }
    
    /**
     * @dev Allows users to claim their yield
     * @return Amount of yield claimed
     */
    function claimYield() 
        public 
        nonReentrant 
        whenNotPaused
        returns (uint256) 
    {
        uint256 yieldAmount = calculateClaimableYield(msg.sender);
        require(yieldAmount > 0, "RentableToken: no yield to claim");
        
        // Transfer yield tokens to the caller
        _transfer(address(this), msg.sender, yieldAmount);
        
        emit YieldClaimed(msg.sender, yieldAmount);
        return yieldAmount;
    }
    
    /**
     * @dev Calculates claimable yield for an account
     * @param account Address to calculate yield for
     * @return Total claimable yield
     */
    function calculateClaimableYield(address account) 
        public 
        view 
        returns (uint256) 
    {
        uint256 totalYield = 0;
        
        // Calculate yield from regular holdings
        for (uint256 i = 0; i < _purchaseTimestamps[account].length; i++) {
            uint256 purchaseTime = _purchaseTimestamps[account][i];
            uint256 amount = _purchaseAmounts[account][i];
            
            // Simplified check: user must still hold at least "amount"
            if (balanceOf(account) >= amount) {
                uint256 holdingPeriod = block.timestamp - purchaseTime;
                uint256 yieldValue = (amount * annualYieldRate * holdingPeriod)
                    / (365 days)
                    / 10000;
                totalYield += yieldValue;
            }
        }
        
        // Calculate yield from staking positions
        for (uint256 i = 0; i < _stakingPositions[account].length; i++) {
            StakingPosition storage position = _stakingPositions[account][i];
            uint256 stakingPeriod = block.timestamp - position.startTime;
            uint256 effectiveRate = annualYieldRate + position.bonusRate;
            
            uint256 stakingYield = (position.amount * effectiveRate * stakingPeriod)
                / (365 days)
                / 10000;
            
            totalYield += stakingYield;
        }
        
        return totalYield;
    }
    
    // ======================
    // STAKING FUNCTIONS
    // ======================
    
    /**
     * @dev Allows users to stake tokens for bonus yield
     * @param amount Amount of tokens to stake
     * @param lockPeriod Period to lock tokens in seconds
     * @return Index of the staking position
     */
    function stakeTokens(uint256 amount, uint256 lockPeriod) 
        public 
        nonReentrant 
        whenNotPaused
        returns (uint256) 
    {
        require(amount > 0, "RentableToken: amount must be greater than zero");
        require(balanceOf(msg.sender) >= amount, "RentableToken: insufficient balance");
        
        // Determine bonus rate based on lock period
        uint256 bonusRate;
        if (lockPeriod >= 365 days) {
            bonusRate = 500;  // +5%
        } else if (lockPeriod >= 180 days) {
            bonusRate = 300;  // +3%
        } else if (lockPeriod >= 90 days) {
            bonusRate = 150;  // +1.5%
        } else if (lockPeriod >= 30 days) {
            bonusRate = 50;   // +0.5%
        } else {
            revert("RentableToken: lock period too short");
        }
        
        // Transfer tokens from user to contract
        _transfer(msg.sender, address(this), amount);
        
        // Record the staking position
        _stakingPositions[msg.sender].push(StakingPosition({
            amount: amount,
            startTime: block.timestamp,
            lockPeriod: lockPeriod,
            bonusRate: bonusRate
        }));
        
        emit TokensStaked(msg.sender, amount, lockPeriod, bonusRate);
        return _stakingPositions[msg.sender].length - 1; // Return index
    }
    
    /**
     * @dev Allows users to unstake tokens after lock period
     * @param positionIndex Index of the staking position
     * @return Amount of tokens unstaked and yield earned
     */
    function unstakeTokens(uint256 positionIndex) 
        public 
        nonReentrant 
        whenNotPaused
        returns (uint256, uint256) 
    {
        require(positionIndex < _stakingPositions[msg.sender].length, "RentableToken: invalid position index");
        
        StakingPosition storage position = _stakingPositions[msg.sender][positionIndex];
        require(block.timestamp >= position.startTime + position.lockPeriod, "RentableToken: still in lock period");
        
        uint256 amount = position.amount;
        uint256 stakingPeriod = block.timestamp - position.startTime;
        uint256 effectiveRate = annualYieldRate + position.bonusRate;
        
        // Calculate yield earned from staking
        uint256 yieldEarned = (amount * effectiveRate * stakingPeriod)
            / (365 days)
            / 10000;
        
        // Mint yield tokens if any yield was earned
        if (yieldEarned > 0) {
            _mint(msg.sender, yieldEarned);
        }
        
        // Return the staked tokens
        _transfer(address(this), msg.sender, amount);
        
        // Remove staking position by swapping with the last, then popping
        uint256 lastIndex = _stakingPositions[msg.sender].length - 1;
        if (positionIndex != lastIndex) {
            _stakingPositions[msg.sender][positionIndex] = _stakingPositions[msg.sender][lastIndex];
        }
        _stakingPositions[msg.sender].pop();
        
        emit TokensUnstaked(msg.sender, amount, yieldEarned);
        return (amount, yieldEarned);
    }
    
    /**
     * @dev Gets all staking positions for an account
     * @param account Address to query
     * @return Array of staking positions
     */
    function getStakingPositions(address account) 
        public 
        view 
        returns (StakingPosition[] memory) 
    {
        return _stakingPositions[account];
    }
    
    // ======================
    // TRANSFER LIMIT FUNCTIONS
    // ======================
    
    /**
     * @dev Sets transfer limit exemption for an account
     * @param account Address to set exemption for
     * @param exempt Whether the account is exempt from transfer limits
     */
    function setTransferLimitExempt(address account, bool exempt) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        transferLimitExempt[account] = exempt;
        emit TransferLimitExemptionSet(account, exempt);
    }
    
    /**
     * @dev Override the transfer function to enforce transfer limits
     */
    function transfer(address recipient, uint256 amount) 
        public 
        virtual 
        override 
        returns (bool) 
    {
        // Check transfer limits
        if (!transferLimitExempt[msg.sender]) {
            uint256 maxTransfer = (balanceOf(msg.sender) * maxTransferPercentage) / 10000;
            require(amount <= maxTransfer, "RentableToken: transfer exceeds limit");
        }
        
        // Check if contract is paused (except for admin transfers)
        if (paused && !hasRole(ADMIN_ROLE, msg.sender) && !hasRole(ADMIN_ROLE, recipient)) {
            revert("RentableToken: transfers paused");
        }
        
        return super.transfer(recipient, amount);
    }
    
    /**
     * @dev Override the transferFrom function to enforce transfer limits
     */
    function transferFrom(address sender, address recipient, uint256 amount) 
        public 
        virtual 
        override 
        returns (bool) 
    {
        // Check transfer limits
        if (!transferLimitExempt[sender]) {
            uint256 maxTransfer = (balanceOf(sender) * maxTransferPercentage) / 10000;
            require(amount <= maxTransfer, "RentableToken: transfer exceeds limit");
        }
        
        // Check if contract is paused (except for admin transfers)
        if (paused && !hasRole(ADMIN_ROLE, sender) && !hasRole(ADMIN_ROLE, recipient)) {
            revert("RentableToken: transfers paused");
        }
        
        return super.transferFrom(sender, recipient, amount);
    }
    
    /**
     * @dev Burns tokens with limit enforcement
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) 
        public 
        whenNotPaused 
    {
        if (!transferLimitExempt[msg.sender]) {
            uint256 maxBurn = (balanceOf(msg.sender) * maxBurnPercentage) / 10000;
            require(amount <= maxBurn, "RentableToken: burn exceeds limit");
        }
        _burn(msg.sender, amount);
    }
    
    // ======================
    // ADMIN FUNCTIONS
    // ======================
    
    /**
     * @dev Sets the token price
     * @param newPrice New price per token in wei
     */
    function setTokenPrice(uint256 newPrice) 
        public 
        onlyRole(ADMIN_ROLE) 
    {
        require(newPrice > 0, "RentableToken: price must be greater than zero");
        uint256 oldPrice = tokenPrice;
        tokenPrice = newPrice;
        emit TokenPriceUpdated(oldPrice, newPrice);
    }
    
    /**
     * @dev Sets the annual yield rate
     * @param newRate New annual yield rate in basis points
     */
    function setAnnualYieldRate(uint256 newRate) 
        public 
        onlyRole(ADMIN_ROLE) 
    {
        uint256 oldRate = annualYieldRate;
        annualYieldRate = newRate;
        emit YieldRateUpdated(oldRate, newRate);
    }
    
    /**
     * @dev Sets the yield distribution period
     * @param newPeriod New distribution period in seconds
     */
    function setYieldDistributionPeriod(uint256 newPeriod) 
        public 
        onlyRole(ADMIN_ROLE) 
    {
        require(newPeriod > 0, "RentableToken: period must be greater than zero");
        uint256 oldPeriod = yieldDistributionPeriod;
        yieldDistributionPeriod = newPeriod;
        emit YieldDistributionPeriodUpdated(oldPeriod, newPeriod);
    }
    
    /**
     * @dev Sets transfer and burn limits
     * @param newMaxTransfer New maximum transfer percentage in basis points
     * @param newMaxBurn New maximum burn percentage in basis points
     */
    function setTransferLimits(uint256 newMaxTransfer, uint256 newMaxBurn) 
        public 
        onlyRole(ADMIN_ROLE) 
    {
        require(newMaxTransfer <= 10000, "RentableToken: transfer limit cannot exceed 100%");
        require(newMaxBurn <= 10000, "RentableToken: burn limit cannot exceed 100%");
        
        maxTransferPercentage = newMaxTransfer;
        maxBurnPercentage = newMaxBurn;
        
        emit TransferLimitsUpdated(newMaxTransfer, newMaxBurn);
    }
    
    /**
     * @dev Sets the property reference for this token
     * @param _propertyToken Address of the property token contract
     * @param _propertyId ID of the property token
     */
    function setPropertyReference(address _propertyToken, uint256 _propertyId) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        propertyToken = _propertyToken;
        propertyId = _propertyId;
        
        emit PropertyReferenceSet(_propertyToken, _propertyId);
    }
    
    // ======================
    // EMERGENCY FUNCTIONS
    // ======================
    
    /**
     * @dev Pauses or unpauses all token transfers
     * @param _paused New paused state
     */
    function setPaused(bool _paused) 
        external 
        onlyRole(EMERGENCY_ROLE) 
    {
        paused = _paused;
        emit EmergencyPause(_paused);
    }
    
    /**
     * @dev Emergency withdrawal of ETH from contract
     * @param recipient Address to receive the ETH
     */
    function emergencyWithdraw(address payable recipient) 
        external 
        onlyRole(EMERGENCY_ROLE) 
    {
        require(recipient != address(0), "RentableToken: invalid recipient");
        uint256 balance = address(this).balance;
        require(balance > 0, "RentableToken: no balance to withdraw");
        
        (bool success, ) = recipient.call{value: balance}("");
        require(success, "RentableToken: withdrawal failed");
    }
    
    /**
     * @dev Emergency recovery of ERC20 tokens sent to contract
     * @param tokenAddress Address of the token to recover
     * @param recipient Address to receive the tokens
     * @param amount Amount of tokens to recover
     */
    function recoverERC20(address tokenAddress, address recipient, uint256 amount) 
        external 
        onlyRole(EMERGENCY_ROLE) 
    {
        require(tokenAddress != address(this), "RentableToken: cannot recover self");
        require(recipient != address(0), "RentableToken: invalid recipient");
        
        IERC20 token = IERC20(tokenAddress);
        require(token.transfer(recipient, amount), "RentableToken: recovery failed");
    }
    
    // ======================
    // INTERFACE SUPPORT
    // ======================
    
    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {
        // Auto-convert ETH to tokens if sent directly to contract
        if (msg.sender != address(this) && !paused) {
            uint256 tokenAmount = (msg.value * (10 ** decimals())) / tokenPrice;
            if (tokenAmount > 0) {
                _mint(msg.sender, tokenAmount);
                
                _purchaseTimestamps[msg.sender].push(block.timestamp);
                _purchaseAmounts[msg.sender].push(tokenAmount);
                
                emit TokensPurchased(msg.sender, tokenAmount, msg.value);
            }
        }
    }
}