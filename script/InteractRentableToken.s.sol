// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
// Adjust import path if needed
import {RentableToken} from "../src/RentableToken.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // For token recovery

/**
 * @title InteractRentableToken Script
 * @notice Interacts with a deployed RentableToken contract.
 * @dev Required Env Vars: MY_PK, MY_ADDRESS, RPC_URL.
 * @dev Other env vars depend on action: AMOUNT_WEI, STAKE_AMOUNT, STAKE_PERIOD, STAKE_INDEX, TARGET_ADDRESS, TOKEN_ADDRESS.
 * @dev Run ONE action per execution with the correct PK/Role/Prerequisites.
 */
contract InteractRentableToken is Script {

    // <<< --- Configuration: Set Deployed Contract Address --- >>>
    address constant RENTABLE_TOKEN_ADDRESS = 0x407b230D1439A83Ed81577009e2118e7a4d50694; // <--- Verify/Replace if needed

    // --- *** CORRECTED INSTANCE CREATION *** ---
    // Get contract instance - Cast address to payable because contract has receive() external payable
    RentableToken public rentableToken = RentableToken(payable(RENTABLE_TOKEN_ADDRESS));
    // --- *** END CORRECTION *** ---

    // --- Main Execution Function ---
    function run() external {
        // Load required environment variables
        address callerAddress = vm.envAddress("MY_ADDRESS");
        require(callerAddress != address(0), "MY_ADDRESS env var not set.");
        string memory pk = vm.envString("MY_PK");
        require(bytes(pk).length > 0, "MY_PK env var not set.");
        string memory rpcUrl = vm.envString("RPC_URL");
        require(bytes(rpcUrl).length > 0, "RPC_URL env var not set.");

        // Optional environment variables for specific actions
        uint256 amountWei = vm.envUint("AMOUNT_WEI"); // For purchaseTokens (msg.value)
        uint256 stakeAmount = vm.envUint("STAKE_AMOUNT"); // For stakeTokens (token amount)
        uint256 stakePeriod = vm.envUint("STAKE_PERIOD"); // For stakeTokens (seconds)
        uint256 stakeIndex = vm.envUint("STAKE_INDEX");   // For unstakeTokens
        address targetAddress = vm.envAddress("TARGET_ADDRESS"); // For role grants, exemptions, recovery
        address tokenAddress = vm.envAddress("TOKEN_ADDRESS"); // For ERC20 recovery
        uint256 burnAmount = vm.envUint("BURN_AMOUNT"); // For burn

        console.log("--- Script Start: Interact RentableToken ---");
        console.log("Target Contract:"); console.logAddress(RENTABLE_TOKEN_ADDRESS);
        console.log("Executing as Address:"); console.logAddress(callerAddress);

        // --- Choose ONE Action ---
        // Uncomment the desired read or write action.

        // == Read Operations Examples (No Broadcast Needed) ==
        getContractInfo();
        getHolderInfo(callerAddress);
        checkRole(callerAddress, rentableToken.ADMIN_ROLE());


        // == Write Operations Examples (Uncomment ONE action inside broadcast block) ==
        // ** Uncomment this block ONLY if performing a write transaction **
        
        vm.startBroadcast(); // Use PK matching the required role for the action below

        // --- CHOOSE ONE ACTION TO UNCOMMENT ---

        // --- Admin Role Actions ---
        //exampleSetTokenPrice(0.001 ether); // Set price to 0.01 ETH
        //exampleSetYieldRate(600); // Set yield rate to 6.00%
        //exampleSetYieldPeriod(7 days); // Set yield period to 7 days
        //exampleSetTransferLimits(1000, 500); // Set limits to 10% transfer, 5% burn
        //exampleSetPropertyRef(0xD95d1FF6618AEE41e431C6A2cfa3D5e8ff3d5f33, 1); // Link to property NFT 1
        //if (targetAddress != address(0)) { exampleSetExempt(targetAddress, true); } // Exempt target address
        //if (targetAddress != address(0)) { exampleGrantRole(rentableToken.YIELD_MANAGER_ROLE(), targetAddress); } // Grant Yield Manager role
        //if (targetAddress != address(0)) { exampleRevokeRole(rentableToken.YIELD_MANAGER_ROLE(), targetAddress); } // Revoke Yield Manager role

        // --- Yield Manager Role Actions ---
        // exampleDistributeYield();

        // --- Emergency Role Actions ---
        //exampleSetPaused(true); // Pause contract transfers/actions
        //if (targetAddress != address(0)) { exampleEmergencyWithdraw(payable(targetAddress)); } // Withdraw all ETH
        //if (tokenAddress != address(0) && targetAddress != address(0) && amountWei > 0) { exampleRecoverERC20(tokenAddress, targetAddress, amountWei); } // Recover other tokens

        // --- Public User Actions ---
        //(amountWei > 0) { examplePurchaseTokens(amountWei); } // Purchase tokens with ETH (msg.value)
        exampleClaimYield(); // Claim available yield
        //if (stakeAmount > 0 && stakePeriod > 0) { exampleStakeTokens(stakeAmount, stakePeriod); } // Stake tokens
        //if (stakeIndex < type(uint256).max) { exampleUnstakeTokens(stakeIndex); } // Unstake by index
        // if (burnAmount > 0) { exampleBurnTokens(burnAmount); } // Burn own tokens

        vm.stopBroadcast();
    

        console.log("--- Script Finished ---");
    }

    // --- Helper Functions ---

    // == Reads ==
    function getContractInfo() public view {
        console.log("--- Rentable Token Info ---");
        console.log("Name:"); console.log(rentableToken.name());
        console.log("Symbol:"); console.log(rentableToken.symbol());
        console.log("Decimals:"); console.logUint(rentableToken.decimals());
        console.log("Total Supply:"); console.logUint(rentableToken.totalSupply());
        console.log("Token Price (Wei):"); console.logUint(rentableToken.tokenPrice());
        console.log("Annual Yield Rate (bps):"); console.logUint(rentableToken.annualYieldRate());
        console.log("Yield Distribution Period (s):"); console.logUint(rentableToken.yieldDistributionPeriod());
        console.log("Last Yield Distribution:"); console.logUint(rentableToken.lastYieldDistribution());
        console.log("Max Transfer % (bps):"); console.logUint(rentableToken.maxTransferPercentage());
        console.log("Max Burn % (bps):"); console.logUint(rentableToken.maxBurnPercentage());
        console.log("Paused:"); console.log(rentableToken.paused());
        console.log("Property Token Ref:"); console.logAddress(rentableToken.propertyToken());
        console.log("Property ID Ref:"); console.logUint(rentableToken.propertyId());
    }

    function getHolderInfo(address account) public view {
        console.log("--- Holder Info for:"); console.logAddress(account); console.log("---"); // Log address separately
        console.log("Balance:"); console.logUint(rentableToken.balanceOf(account));

        try rentableToken.calculateClaimableYield(account) returns (uint256 yieldAmount) {
            console.log("Claimable Yield:"); console.logUint(yieldAmount);
        } catch {
            console.log(" Error calculating yield.");
        }

        try rentableToken.getStakingPositions(account) returns (RentableToken.StakingPosition[] memory positions) {
            console.log("Staking Positions Count:", positions.length);
            for(uint i = 0; i < positions.length && i < 3; ++i) {
                console.log("  Position", i, ":");
                console.log("    Amount:", positions[i].amount);
                console.log("    Start Time:", positions[i].startTime);
                console.log("    Lock Period:", positions[i].lockPeriod);
                console.log("    Bonus Rate:", positions[i].bonusRate);
            }
            if (positions.length > 3) { console.log("  (More positions exist...)"); }
        } catch {
            console.log(" Error getting staking positions.");
        }

        console.log("Is Exempt from Transfer Limits:"); console.log(rentableToken.transferLimitExempt(account));
    }

    function checkRole(address account, bytes32 role) public view {
         string memory roleName = "UNKNOWN_ROLE";
         if(role == rentableToken.DEFAULT_ADMIN_ROLE()) roleName = "DEFAULT_ADMIN_ROLE";
         else if (role == rentableToken.ADMIN_ROLE()) roleName = "ADMIN_ROLE";
         else if (role == rentableToken.YIELD_MANAGER_ROLE()) roleName = "YIELD_MANAGER_ROLE";
         else if (role == rentableToken.EMERGENCY_ROLE()) roleName = "EMERGENCY_ROLE";

         bool hasIt = rentableToken.hasRole(role, account);
         console.log("Role check for account:"); console.logAddress(account);
         console.log("  Role Name Checked:", roleName);
         console.log("  Has Role:", hasIt);
    }

    // == Writes ==

    // = Admin Role =
    function exampleSetTokenPrice(uint256 newPriceWei) internal {
        console.log("--> Sending setTokenPrice tx. New Price (Wei):"); console.logUint(newPriceWei);
        rentableToken.setTokenPrice(newPriceWei);
        console.log("    setTokenPrice transaction sent.");
    }
    function exampleSetYieldRate(uint256 newRateBps) internal {
        console.log("--> Sending setAnnualYieldRate tx. New Rate (bps):"); console.logUint(newRateBps);
        rentableToken.setAnnualYieldRate(newRateBps);
        console.log("    setAnnualYieldRate transaction sent.");
    }
    function exampleSetYieldPeriod(uint256 newPeriodSeconds) internal {
        console.log("--> Sending setYieldDistributionPeriod tx. New Period (s):"); console.logUint(newPeriodSeconds);
        rentableToken.setYieldDistributionPeriod(newPeriodSeconds);
        console.log("    setYieldDistributionPeriod transaction sent.");
    }
    function exampleSetTransferLimits(uint256 newMaxTransferBps, uint256 newMaxBurnBps) internal {
        console.log("--> Sending setTransferLimits tx.");
        console.log("    Transfer% (bps):", newMaxTransferBps);
        console.log("    Burn% (bps):", newMaxBurnBps);
        rentableToken.setTransferLimits(newMaxTransferBps, newMaxBurnBps);
        console.log("    setTransferLimits transaction sent.");
    }
     function exampleSetPropertyRef(address propTokenAddr, uint256 propId) internal {
        console.log("--> Sending setPropertyReference tx. Token Addr:"); console.logAddress(propTokenAddr);
        console.log("    Property ID:"); console.logUint(propId);
        rentableToken.setPropertyReference(propTokenAddr, propId);
        console.log("    setPropertyReference transaction sent.");
    }
     function exampleSetExempt(address account, bool exempt) internal {
        console.log("--> Sending setTransferLimitExempt tx for:"); console.logAddress(account);
        console.log("    Exempt Status:", exempt);
        rentableToken.setTransferLimitExempt(account, exempt);
        console.log("    setTransferLimitExempt transaction sent.");
    }
    function exampleGrantRole(bytes32 role, address account) internal {
        console.log("--> Sending grantRole tx.");
        console.log("    Role:", vm.toString(role));
        console.log("    Account:"); console.logAddress(account);
        rentableToken.grantRole(role, account);
        console.log("    grantRole transaction sent.");
    }
     function exampleRevokeRole(bytes32 role, address account) internal {
        console.log("--> Sending revokeRole tx.");
        console.log("    Role:", vm.toString(role));
        console.log("    Account:"); console.logAddress(account);
        rentableToken.revokeRole(role, account);
        console.log("    revokeRole transaction sent.");
    }

    // = Yield Manager Role =
    function exampleDistributeYield() internal {
        console.log("--> Sending distributeYield tx...");
        rentableToken.distributeYield();
        console.log("    distributeYield transaction sent.");
    }

    // = Emergency Role =
    function exampleSetPaused(bool shouldPause) internal {
        console.log("--> Sending setPaused tx. Pause Status:", shouldPause);
        rentableToken.setPaused(shouldPause);
        console.log("    setPaused transaction sent.");
    }
    function exampleEmergencyWithdraw(address payable recipient) internal {
        console.log("--> Sending emergencyWithdraw tx to:"); console.logAddress(recipient);
        rentableToken.emergencyWithdraw(recipient);
        console.log("    emergencyWithdraw transaction sent.");
    }
    function exampleRecoverERC20(address tokenAddr, address recipient, uint256 amount) internal {
        console.log("--> Sending recoverERC20 tx. Token:"); console.logAddress(tokenAddr);
        console.log("    Recipient:"); console.logAddress(recipient);
        console.log("    Amount:"); console.logUint(amount);
        rentableToken.recoverERC20(tokenAddr, recipient, amount);
        console.log("    recoverERC20 transaction sent.");
    }

    // = Public User =
    function examplePurchaseTokens(uint256 valueWei) internal {
        require(valueWei > 0, "Purchase amount (AMOUNT_WEI) must be positive.");
        console.log("--> Sending purchaseTokens tx. Value (Wei):"); console.logUint(valueWei);
        rentableToken.purchaseTokens{value: valueWei}();
        console.log("    purchaseTokens transaction sent.");
    }
    function exampleClaimYield() internal {
        console.log("--> Sending claimYield tx...");
        rentableToken.claimYield();
        console.log("    claimYield transaction sent.");
    }
    function exampleStakeTokens(uint256 amountTokens, uint256 lockPeriodSeconds) internal {
        require(amountTokens > 0, "Stake amount (STAKE_AMOUNT) must be positive.");
        require(lockPeriodSeconds > 0, "Stake period (STAKE_PERIOD) must be positive.");
        console.log("--> Sending stakeTokens tx. Amount:"); console.logUint(amountTokens);
        console.log("    Lock Period (s):"); console.logUint(lockPeriodSeconds);
        rentableToken.stakeTokens(amountTokens, lockPeriodSeconds);
        console.log("    stakeTokens transaction sent.");
    }
    function exampleUnstakeTokens(uint256 positionIndex) internal {
        console.log("--> Sending unstakeTokens tx for position index:"); console.logUint(positionIndex);
        rentableToken.unstakeTokens(positionIndex);
        console.log("    unstakeTokens transaction sent.");
    }
    function exampleBurnTokens(uint256 amountToBurn) internal {
        require(amountToBurn > 0, "Burn amount (BURN_AMOUNT) must be positive.");
        console.log("--> Sending burn tx. Amount:"); console.logUint(amountToBurn);
        rentableToken.burn(amountToBurn);
        console.log("    burn transaction sent.");
    }

}