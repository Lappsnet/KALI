"use client";

import { useCallback, useState } from "react";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { type UseReadContractReturnType } from 'wagmi';
import { CONTRACT_ADDRESSES } from "../../contracts/config.ts";
import RentableTokenABI from "../../components/abis/RentableToken.abi.json";

// Define the StakingPosition struct type based on the ABI
interface StakingPosition {
    amount: bigint;
    startTime: bigint;
    lockPeriod: bigint;
    bonusRate: bigint;
}


export function useRentableTokenContract() {
  const { address, isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contractAddress = chainId
    ? (CONTRACT_ADDRESSES as any)[chainId]?.rentableToken
    : undefined;
  const {
    writeContract,
    isPending: isWritePending,
    isSuccess: isWriteSuccess,
    data: writeTxHash,
  } = useWriteContract();

  const {
    data: writeReceipt,
    isLoading: isWaitingForWriteReceipt,
  } = useWaitForTransactionReceipt({
    hash: writeTxHash,
  });

  // --- View Functions (Read Operations) ---

    // Get ADMIN_ROLE bytes32
    const getAdminRole = useCallback(async (): Promise<string | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: RentableTokenABI, functionName: "ADMIN_ROLE" }) as UseReadContractReturnType<typeof RentableTokenABI, "ADMIN_ROLE">;
          if (!result || !result.data) throw new Error("Failed to get ADMIN_ROLE");
          return result.data as string;
        } catch (err) { console.error("Error getting ADMIN_ROLE:", err); setError("Failed to get ADMIN_ROLE"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get DEFAULT_ADMIN_ROLE bytes32
    const getDefaultAdminRole = useCallback(async (): Promise<string | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: RentableTokenABI, functionName: "DEFAULT_ADMIN_ROLE" }) as UseReadContractReturnType<typeof RentableTokenABI, "DEFAULT_ADMIN_ROLE">;
          if (!result || !result.data) throw new Error("Failed to get DEFAULT_ADMIN_ROLE");
          return result.data as string;
        } catch (err) { console.error("Error getting DEFAULT_ADMIN_ROLE:", err); setError("Failed to get DEFAULT_ADMIN_ROLE"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get EMERGENCY_ROLE bytes32
    const getEmergencyRole = useCallback(async (): Promise<string | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: RentableTokenABI, functionName: "EMERGENCY_ROLE" }) as UseReadContractReturnType<typeof RentableTokenABI, "EMERGENCY_ROLE">;
          if (!result || !result.data) throw new Error("Failed to get EMERGENCY_ROLE");
          return result.data as string;
        } catch (err) { console.error("Error getting EMERGENCY_ROLE:", err); setError("Failed to get EMERGENCY_ROLE"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get YIELD_MANAGER_ROLE bytes32
    const getYieldManagerRole = useCallback(async (): Promise<string | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: RentableTokenABI, functionName: "YIELD_MANAGER_ROLE" }) as UseReadContractReturnType<typeof RentableTokenABI, "YIELD_MANAGER_ROLE">;
          if (!result || !result.data) throw new Error("Failed to get YIELD_MANAGER_ROLE");
          return result.data as string;
        } catch (err) { console.error("Error getting YIELD_MANAGER_ROLE:", err); setError("Failed to get YIELD_MANAGER_ROLE"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get allowance for spender
    const getAllowance = useCallback(async (owner: `0x${string}`, spender: `0x${string}`): Promise<bigint | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: RentableTokenABI, functionName: "allowance", args: [owner, spender] }) as UseReadContractReturnType<typeof RentableTokenABI, "allowance">;
          if (!result || result.data === undefined) throw new Error("Failed to get allowance");
          return result.data as bigint;
        } catch (err) { console.error("Error getting allowance:", err); setError("Failed to get allowance"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get annual yield rate
    const getAnnualYieldRate = useCallback(async (): Promise<bigint | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: RentableTokenABI, functionName: "annualYieldRate" }) as UseReadContractReturnType<typeof RentableTokenABI, "annualYieldRate">;
          if (!result || result.data === undefined) throw new Error("Failed to get annual yield rate");
          return result.data as bigint;
        } catch (err) { console.error("Error getting annual yield rate:", err); setError("Failed to get annual yield rate"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get balance of an account
    const getBalanceOf = useCallback(async (account: `0x${string}`): Promise<bigint | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: RentableTokenABI, functionName: "balanceOf", args: [account] }) as UseReadContractReturnType<typeof RentableTokenABI, "balanceOf">;
          if (!result || result.data === undefined) throw new Error("Failed to get balance");
          return result.data as bigint;
        } catch (err) { console.error("Error getting balance:", err); setError("Failed to get balance"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Calculate claimable yield for an account
    const calculateClaimableYield = useCallback(async (account: `0x${string}`): Promise<bigint | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: RentableTokenABI, functionName: "calculateClaimableYield", args: [account] }) as UseReadContractReturnType<typeof RentableTokenABI, "calculateClaimableYield">;
          if (!result || result.data === undefined) throw new Error("Failed to calculate claimable yield");
          return result.data as bigint;
        } catch (err) { console.error("Error calculating claimable yield:", err); setError("Failed to calculate claimable yield"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get decimals
    const getDecimals = useCallback(async (): Promise<number | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: RentableTokenABI, functionName: "decimals" }) as UseReadContractReturnType<typeof RentableTokenABI, "decimals">;
          if (!result || result.data === undefined) throw new Error("Failed to get decimals");
          return result.data as number; // uint8 is often returned as number
        } catch (err) { console.error("Error getting decimals:", err); setError("Failed to get decimals"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get role admin
    const getRoleAdmin = useCallback(async (role: string): Promise<string | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: RentableTokenABI, functionName: "getRoleAdmin", args: [role] }) as UseReadContractReturnType<typeof RentableTokenABI, "getRoleAdmin">;
          if (!result || result.data === undefined) throw new Error("Failed to get role admin");
          return result.data as string; // bytes32 as string
        } catch (err) { console.error("Error getting role admin:", err); setError("Failed to get role admin"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get staking positions for an account
    const getStakingPositions = useCallback(async (account: `0x${string}`): Promise<StakingPosition[] | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: RentableTokenABI, functionName: "getStakingPositions", args: [account] }) as UseReadContractReturnType<typeof RentableTokenABI, "getStakingPositions">;
          if (!result || result.data === undefined) throw new Error("Failed to get staking positions");
          return result.data as unknown as StakingPosition[];
        } catch (err) { console.error("Error getting staking positions:", err); setError("Failed to get staking positions"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Check if account has a role
    const hasRole = useCallback(async (role: string, account: `0x${string}`): Promise<boolean | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: RentableTokenABI, functionName: "hasRole", args: [role, account] }) as UseReadContractReturnType<typeof RentableTokenABI, "hasRole">;
          if (result === undefined || result.data === undefined) throw new Error("Failed to check role");
          return result.data as boolean;
        } catch (err) { console.error("Error checking role:", err); setError("Failed to check role"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get last yield distribution timestamp
    const getLastYieldDistribution = useCallback(async (): Promise<bigint | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: RentableTokenABI, functionName: "lastYieldDistribution" }) as UseReadContractReturnType<typeof RentableTokenABI, "lastYieldDistribution">;
          if (!result || result.data === undefined) throw new Error("Failed to get last yield distribution");
          return result.data as bigint;
        } catch (err) { console.error("Error getting last yield distribution:", err); setError("Failed to get last yield distribution"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get max burn percentage
    const getMaxBurnPercentage = useCallback(async (): Promise<bigint | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: RentableTokenABI, functionName: "maxBurnPercentage" }) as UseReadContractReturnType<typeof RentableTokenABI, "maxBurnPercentage">;
          if (!result || result.data === undefined) throw new Error("Failed to get max burn percentage");
          return result.data as bigint;
        } catch (err) { console.error("Error getting max burn percentage:", err); setError("Failed to get max burn percentage"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get max transfer percentage
    const getMaxTransferPercentage = useCallback(async (): Promise<bigint | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: RentableTokenABI, functionName: "maxTransferPercentage" }) as UseReadContractReturnType<typeof RentableTokenABI, "maxTransferPercentage">;
          if (!result || result.data === undefined) throw new Error("Failed to get max transfer percentage");
          return result.data as bigint;
        } catch (err) { console.error("Error getting max transfer percentage:", err); setError("Failed to get max transfer percentage"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get token name
    const getName = useCallback(async (): Promise<string | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: RentableTokenABI, functionName: "name" }) as UseReadContractReturnType<typeof RentableTokenABI, "name">;
          if (!result || result.data === undefined) throw new Error("Failed to get name");
          return result.data as string;
        } catch (err) { console.error("Error getting name:", err); setError("Failed to get name"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Check if contract is paused
    const isPaused = useCallback(async (): Promise<boolean | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: RentableTokenABI, functionName: "paused" }) as UseReadContractReturnType<typeof RentableTokenABI, "paused">;
          if (result === undefined || result.data === undefined) throw new Error("Failed to check paused status");
          return result.data as boolean;
        } catch (err) { console.error("Error checking paused status:", err); setError("Failed to check paused status"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get property ID reference (assuming this is a state variable)
    const getPropertyIdReference = useCallback(async (): Promise<bigint | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: RentableTokenABI, functionName: "propertyId" }) as UseReadContractReturnType<typeof RentableTokenABI, "propertyId">;
          if (!result || result.data === undefined) throw new Error("Failed to get property ID reference");
          return result.data as bigint;
        } catch (err) { console.error("Error getting property ID reference:", err); setError("Failed to get property ID reference"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get property token address reference
    const getPropertyTokenAddressReference = useCallback(async (): Promise<`0x${string}` | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: RentableTokenABI, functionName: "propertyToken" }) as UseReadContractReturnType<typeof RentableTokenABI, "propertyToken">;
          if (!result || result.data === undefined) throw new Error("Failed to get property token address reference");
          return result.data as `0x${string}`;
        } catch (err) { console.error("Error getting property token address reference:", err); setError("Failed to get property token address reference"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get token symbol
    const getSymbol = useCallback(async (): Promise<string | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: RentableTokenABI, functionName: "symbol" }) as UseReadContractReturnType<typeof RentableTokenABI, "symbol">;
          if (!result || result.data === undefined) throw new Error("Failed to get symbol");
          return result.data as string;
        } catch (err) { console.error("Error getting symbol:", err); setError("Failed to get symbol"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get token price
    const getTokenPrice = useCallback(async (): Promise<bigint | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: RentableTokenABI, functionName: "tokenPrice" }) as UseReadContractReturnType<typeof RentableTokenABI, "tokenPrice">;
          if (!result || result.data === undefined) throw new Error("Failed to get token price");
          return result.data as bigint;
        } catch (err) { console.error("Error getting token price:", err); setError("Failed to get token price"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get total supply
    const getTotalSupply = useCallback(async (): Promise<bigint | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: RentableTokenABI, functionName: "totalSupply" }) as UseReadContractReturnType<typeof RentableTokenABI, "totalSupply">;
          if (!result || result.data === undefined) throw new Error("Failed to get total supply");
          return result.data as bigint;
        } catch (err) { console.error("Error getting total supply:", err); setError("Failed to get total supply"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get transfer limit exempt status for an account
    const isTransferLimitExempt = useCallback(async (account: `0x${string}`): Promise<boolean | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: RentableTokenABI, functionName: "transferLimitExempt", args: [account] }) as UseReadContractReturnType<typeof RentableTokenABI, "transferLimitExempt">;
          if (result === undefined || result.data === undefined) throw new Error("Failed to check transfer limit exempt status");
          return result.data as boolean;
        } catch (err) { console.error("Error checking transfer limit exempt status:", err); setError("Failed to check transfer limit exempt status"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get yield distribution period
    const getYieldDistributionPeriod = useCallback(async (): Promise<bigint | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: RentableTokenABI, functionName: "yieldDistributionPeriod" }) as UseReadContractReturnType<typeof RentableTokenABI, "yieldDistributionPeriod">;
          if (!result || result.data === undefined) throw new Error("Failed to get yield distribution period");
          return result.data as bigint;
        } catch (err) { console.error("Error getting yield distribution period:", err); setError("Failed to get yield distribution period"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);


    // Approve spender to transfer tokens
    const approve = useCallback(async (spender: `0x${string}`, value: bigint) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({ address: contractAddress, abi: RentableTokenABI, functionName: "approve", args: [spender, value] });
          return true;
        } catch (err) { console.error("Error approving tokens:", err); setError("Failed to approve tokens"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);

    // Burn tokens
    const burn = useCallback(async (amount: bigint) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({ address: contractAddress, abi: RentableTokenABI, functionName: "burn", args: [amount] });
          return true;
        } catch (err) { console.error("Error burning tokens:", err); setError("Failed to burn tokens"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);

    // Claim yield
    const claimYield = useCallback(async () => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({ address: contractAddress, abi: RentableTokenABI, functionName: "claimYield" });
          return true;
        } catch (err) { console.error("Error claiming yield:", err); setError("Failed to claim yield"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);

    // Distribute yield
    const distributeYield = useCallback(async () => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({ address: contractAddress, abi: RentableTokenABI, functionName: "distributeYield" });
          return true;
        } catch (err) { console.error("Error distributing yield:", err); setError("Failed to distribute yield"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);

    // Emergency withdraw
    const emergencyWithdraw = useCallback(async (recipient: `0x${string}`) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({ address: contractAddress, abi: RentableTokenABI, functionName: "emergencyWithdraw", args: [recipient] });
          return true;
        } catch (err) { console.error("Error during emergency withdraw:", err); setError("Failed during emergency withdraw"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);

    const grantRole = useCallback(async (role: string, account: `0x${string}`) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({ address: contractAddress, abi: RentableTokenABI, functionName: "grantRole", args: [role, account] });
          return true;
        } catch (err) { console.error("Error granting role:", err); setError("Failed to grant role"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);

    const purchaseTokens = useCallback(async (value: bigint) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({ address: contractAddress, abi: RentableTokenABI, functionName: "purchaseTokens", value: value });
          return true;
        } catch (err) { console.error("Error purchasing tokens:", err); setError("Failed to purchase tokens"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);

    const recoverERC20 = useCallback(async (tokenAddress: `0x${string}`, recipient: `0x${string}`, amount: bigint) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({ address: contractAddress, abi: RentableTokenABI, functionName: "recoverERC20", args: [tokenAddress, recipient, amount] });
          return true;
        } catch (err) { console.error("Error recovering ERC20:", err); setError("Failed to recover ERC20"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);

    const renounceRole = useCallback(async (role: string, callerConfirmation: `0x${string}`) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({ address: contractAddress, abi: RentableTokenABI, functionName: "renounceRole", args: [role, callerConfirmation] });
          return true;
        } catch (err) { console.error("Error renouncing role:", err); setError("Failed to renounce role"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);

    const revokeRole = useCallback(async (role: string, account: `0x${string}`) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({ address: contractAddress, abi: RentableTokenABI, functionName: "revokeRole", args: [role, account] });
          return true;
        } catch (err) { console.error("Error revoking role:", err); setError("Failed to revoke role"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);

    const setAnnualYieldRate = useCallback(async (newRate: bigint) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({ address: contractAddress, abi: RentableTokenABI, functionName: "setAnnualYieldRate", args: [newRate] });
          return true;
        } catch (err) { console.error("Error setting annual yield rate:", err); setError("Failed to set annual yield rate"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);

    const setPaused = useCallback(async (_paused: boolean) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({ address: contractAddress, abi: RentableTokenABI, functionName: "setPaused", args: [_paused] });
          return true;
        } catch (err) { console.error("Error setting paused status:", err); setError("Failed to set paused status"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);

    const setPropertyReference = useCallback(async (_propertyToken: `0x${string}`, _propertyId: bigint) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({ address: contractAddress, abi: RentableTokenABI, functionName: "setPropertyReference", args: [_propertyToken, _propertyId] });
          return true;
        } catch (err) { console.error("Error setting property reference:", err); setError("Failed to set property reference"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);

    const setTokenPrice = useCallback(async (newPrice: bigint) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({ address: contractAddress, abi: RentableTokenABI, functionName: "setTokenPrice", args: [newPrice] });
          return true;
        } catch (err) { console.error("Error setting token price:", err); setError("Failed to set token price"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);

    const setTransferLimitExempt = useCallback(async (account: `0x${string}`, exempt: boolean) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({ address: contractAddress, abi: RentableTokenABI, functionName: "setTransferLimitExempt", args: [account, exempt] });
          return true;
        } catch (err) { console.error("Error setting transfer limit exempt status:", err); setError("Failed to set transfer limit exempt status"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);

    const setTransferLimits = useCallback(async (newMaxTransfer: bigint, newMaxBurn: bigint) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({ address: contractAddress, abi: RentableTokenABI, functionName: "setTransferLimits", args: [newMaxTransfer, newMaxBurn] });
          return true;
        } catch (err) { console.error("Error setting transfer limits:", err); setError("Failed to set transfer limits"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);

    const setYieldDistributionPeriod = useCallback(async (newPeriod: bigint) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({ address: contractAddress, abi: RentableTokenABI, functionName: "setYieldDistributionPeriod", args: [newPeriod] });
          return true;
        } catch (err) { console.error("Error setting yield distribution period:", err); setError("Failed to set yield distribution period"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);

    // Stake tokens
    const stakeTokens = useCallback(async (amount: bigint, lockPeriod: bigint) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({ address: contractAddress, abi: RentableTokenABI, functionName: "stakeTokens", args: [amount, lockPeriod] });
          return true;
        } catch (err) { console.error("Error staking tokens:", err); setError("Failed to stake tokens"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);

    // Transfer tokens
    const transfer = useCallback(async (recipient: `0x${string}`, amount: bigint) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({ address: contractAddress, abi: RentableTokenABI, functionName: "transfer", args: [recipient, amount] });
          return true;
        } catch (err) { console.error("Error transferring tokens:", err); setError("Failed to transfer tokens"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);

    // Transfer tokens from another account (requires allowance)
    const transferFrom = useCallback(async (sender: `0x${string}`, recipient: `0x${string}`, amount: bigint) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({ address: contractAddress, abi: RentableTokenABI, functionName: "transferFrom", args: [sender, recipient, amount] });
          return true;
        } catch (err) { console.error("Error transferring tokens from:", err); setError("Failed to transfer tokens from"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);

    // Unstake tokens
    const unstakeTokens = useCallback(async (positionIndex: bigint) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({ address: contractAddress, abi: RentableTokenABI, functionName: "unstakeTokens", args: [positionIndex] });
          return true;
        } catch (err) { console.error("Error unstaking tokens:", err); setError("Failed to unstake tokens"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);


  // --- Combined Loading/Status ---
  const overallLoading = isLoading || isWritePending || isWaitingForWriteReceipt;
  const overallSuccess = isWriteSuccess;
  const overallError = error;


  return {
    contractAddress,
    isLoading: overallLoading,
    isSuccess: overallSuccess,
    error: overallError,
    writeTxHash,
    writeReceipt,

    // View Functions
    getAdminRole,
    getDefaultAdminRole,
    getEmergencyRole,
    getYieldManagerRole,
    getAllowance,
    getAnnualYieldRate,
    getBalanceOf,
    calculateClaimableYield,
    getDecimals,
    getRoleAdmin,
    getStakingPositions,
    hasRole,
    getLastYieldDistribution,
    getMaxBurnPercentage,
    getMaxTransferPercentage,
    getName,
    isPaused,
    getPropertyIdReference,
    getPropertyTokenAddressReference,
    getSymbol,
    getTokenPrice,
    getTotalSupply,
    isTransferLimitExempt,
    getYieldDistributionPeriod,


    // Write Functions
    approve,
    burn,
    claimYield,
    distributeYield,
    emergencyWithdraw,
    grantRole,
    purchaseTokens,
    recoverERC20,
    renounceRole,
    revokeRole,
    setAnnualYieldRate,
    setPaused,
    setPropertyReference,
    setTokenPrice,
    setTransferLimitExempt,
    setTransferLimits,
    setYieldDistributionPeriod,
    stakeTokens,
    transfer,
    transferFrom,
    unstakeTokens,
  };
}
