"use client";

import { useCallback, useState } from "react";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { type UseReadContractReturnType } from 'wagmi';
import FractionalOwnershipABI from "../../components/abis/FractionalOwnership.abi.json";
import { CONTRACT_ADDRESSES } from "../../contracts/config.ts";

interface FractionalizedProperty {
    propertyId: bigint;
    totalShares: bigint;
    sharePrice: bigint;
    active: boolean;
}

export function useFractionalOwnershipContract() {
  const { address, isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get contract address based on current chain
  const contractAddress = chainId
    ? (CONTRACT_ADDRESSES as any)[chainId]?.fractionalOwnership
    : undefined;

  // Write contract hook
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

    // Get ADMIN_ROLE bytes32
    const getAdminRole = useCallback(async (): Promise<string | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: FractionalOwnershipABI, functionName: "ADMIN_ROLE" }) as UseReadContractReturnType<typeof FractionalOwnershipABI, "ADMIN_ROLE">;
          if (!result || !result.data) throw new Error("Failed to get ADMIN_ROLE");
          return result.data as string; // bytes32 is often returned as string in JS
        } catch (err) { console.error("Error getting ADMIN_ROLE:", err); setError("Failed to get ADMIN_ROLE"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get DEFAULT_ADMIN_ROLE bytes32
    const getDefaultAdminRole = useCallback(async (): Promise<string | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: FractionalOwnershipABI, functionName: "DEFAULT_ADMIN_ROLE" }) as UseReadContractReturnType<typeof FractionalOwnershipABI, "DEFAULT_ADMIN_ROLE">;
          if (!result || !result.data) throw new Error("Failed to get DEFAULT_ADMIN_ROLE");
          return result.data as string; // bytes32 is often returned as string in JS
        } catch (err) { console.error("Error getting DEFAULT_ADMIN_ROLE:", err); setError("Failed to get DEFAULT_ADMIN_ROLE"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get allowance for spender
    const getAllowance = useCallback(async (owner: `0x${string}`, spender: `0x${string}`): Promise<bigint | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: FractionalOwnershipABI, functionName: "allowance", args: [owner, spender] }) as UseReadContractReturnType<typeof FractionalOwnershipABI, "allowance">;
          if (!result || result.data === undefined) throw new Error("Failed to get allowance");
          return result.data as bigint;
        } catch (err) { console.error("Error getting allowance:", err); setError("Failed to get allowance"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get balance of an account
    const getBalanceOf = useCallback(async (account: `0x${string}`): Promise<bigint | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: FractionalOwnershipABI, functionName: "balanceOf", args: [account] }) as UseReadContractReturnType<typeof FractionalOwnershipABI, "balanceOf">;
          if (!result || result.data === undefined) throw new Error("Failed to get balance");
          return result.data as bigint;
        } catch (err) { console.error("Error getting balance:", err); setError("Failed to get balance"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get decimals
    const getDecimals = useCallback(async (): Promise<number | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: FractionalOwnershipABI, functionName: "decimals" }) as UseReadContractReturnType<typeof FractionalOwnershipABI, "decimals">;
          if (!result || result.data === undefined) throw new Error("Failed to get decimals");
          return result.data as number; // uint8 is often returned as number
        } catch (err) { console.error("Error getting decimals:", err); setError("Failed to get decimals"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get fractionalized property details by ID
    const getFractionalizedProperty = useCallback(async (propertyId: bigint): Promise<FractionalizedProperty | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: FractionalOwnershipABI, functionName: "getFractionalizedProperty", args: [propertyId] }) as UseReadContractReturnType<typeof FractionalOwnershipABI, "getFractionalizedProperty">;
          if (!result || !result.data) throw new Error("Failed to get fractionalized property");

          const propertyData = result.data as unknown as FractionalizedProperty;
          return propertyData;

        } catch (err) { console.error("Error getting fractionalized property:", err); setError("Failed to get fractionalized property"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get Role Admin
    const getRoleAdmin = useCallback(async (role: string): Promise<string | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: FractionalOwnershipABI, functionName: "getRoleAdmin", args: [role] }) as UseReadContractReturnType<typeof FractionalOwnershipABI, "getRoleAdmin">;
          if (!result || !result.data) throw new Error("Failed to get role admin");
          return result.data as string; // bytes32 as string
        } catch (err) { console.error("Error getting role admin:", err); setError("Failed to get role admin"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get Role Member by index
    const getRoleMember = useCallback(async (role: string, index: bigint): Promise<`0x${string}` | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: FractionalOwnershipABI, functionName: "getRoleMember", args: [role, index] }) as UseReadContractReturnType<typeof FractionalOwnershipABI, "getRoleMember">;
          if (!result || !result.data) throw new Error("Failed to get role member");
          return result.data as `0x${string}`;
        } catch (err) { console.error("Error getting role member:", err); setError("Failed to get role member"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get Role Member Count
    const getRoleMemberCount = useCallback(async (role: string): Promise<bigint | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: FractionalOwnershipABI, functionName: "getRoleMemberCount", args: [role] }) as UseReadContractReturnType<typeof FractionalOwnershipABI, "getRoleMemberCount">;
          if (!result || result.data === undefined) throw new Error("Failed to get role member count");
          return result.data as bigint;
        } catch (err) { console.error("Error getting role member count:", err); setError("Failed to get role member count"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);


    // Check if account has a role
    const hasRole = useCallback(async (role: string, account: `0x${string}`): Promise<boolean | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: FractionalOwnershipABI, functionName: "hasRole", args: [role, account] }) as UseReadContractReturnType<typeof FractionalOwnershipABI, "hasRole">;
          if (result === undefined || result.data === undefined) throw new Error("Failed to check role");
          return result.data as boolean;
        } catch (err) { console.error("Error checking role:", err); setError("Failed to check role"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Check if property is fractionalized
    const isPropertyFractionalized = useCallback(async (propertyId: bigint): Promise<boolean | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: FractionalOwnershipABI, functionName: "isPropertyFractionalized", args: [propertyId] }) as UseReadContractReturnType<typeof FractionalOwnershipABI, "isPropertyFractionalized">;
          if (result === undefined || result.data === undefined) throw new Error("Failed to check if property is fractionalized");
          return result.data as boolean;
        } catch (err) { console.error("Error checking if property is fractionalized:", err); setError("Failed to check if property is fractionalized"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get token name
    const getName = useCallback(async (): Promise<string | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: FractionalOwnershipABI, functionName: "name" }) as UseReadContractReturnType<typeof FractionalOwnershipABI, "name">;
          if (!result || result.data === undefined) throw new Error("Failed to get name");
          return result.data as string;
        } catch (err) { console.error("Error getting name:", err); setError("Failed to get name"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get property token address
    const getPropertyTokenAddress = useCallback(async (): Promise<`0x${string}` | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: FractionalOwnershipABI, functionName: "propertyToken" }) as UseReadContractReturnType<typeof FractionalOwnershipABI, "propertyToken">;
          if (!result || !result.data) throw new Error("Failed to get property token address");
          return result.data as `0x${string}`;
        } catch (err) { console.error("Error getting property token address:", err); setError("Failed to get property token address"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Check if interface is supported
    const checkSupportsInterface = useCallback(async (interfaceId: string): Promise<boolean | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: FractionalOwnershipABI, functionName: "supportsInterface", args: [interfaceId as `0x${string}`] }) as UseReadContractReturnType<typeof FractionalOwnershipABI, "supportsInterface">;
          if (result === undefined || result.data === undefined) throw new Error("Failed to check supported interface");
          return result.data as boolean;
        } catch (err) { console.error("Error checking supported interface:", err); setError("Failed to check supported interface"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get token symbol
    const getSymbol = useCallback(async (): Promise<string | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: FractionalOwnershipABI, functionName: "symbol" }) as UseReadContractReturnType<typeof FractionalOwnershipABI, "symbol">;
          if (!result || result.data === undefined) throw new Error("Failed to get symbol");
          return result.data as string;
        } catch (err) { console.error("Error getting symbol:", err); setError("Failed to get symbol"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get total supply
    const getTotalSupply = useCallback(async (): Promise<bigint | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: FractionalOwnershipABI, functionName: "totalSupply" }) as UseReadContractReturnType<typeof FractionalOwnershipABI, "totalSupply">;
          if (!result || result.data === undefined) throw new Error("Failed to get total supply");
          return result.data as bigint;
        } catch (err) { console.error("Error getting total supply:", err); setError("Failed to get total supply"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);


    // Approve spender to transfer tokens
    const approve = useCallback(async (spender: `0x${string}`, value: bigint) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({ address: contractAddress, abi: FractionalOwnershipABI, functionName: "approve", args: [spender, value] });
          return true;
        } catch (err) { console.error("Error approving tokens:", err); setError("Failed to approve tokens"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);

    // Burn tokens
    const burn = useCallback(async (value: bigint) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({ address: contractAddress, abi: FractionalOwnershipABI, functionName: "burn", args: [value] });
          return true;
        } catch (err) { console.error("Error burning tokens:", err); setError("Failed to burn tokens"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);

    // Burn tokens from another account (requires allowance)
    const burnFrom = useCallback(async (account: `0x${string}`, value: bigint) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({ address: contractAddress, abi: FractionalOwnershipABI, functionName: "burnFrom", args: [account, value] });
          return true;
        } catch (err) { console.error("Error burning tokens from:", err); setError("Failed to burn tokens from"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);

    // Defractionalize a property (requires owning all shares)
    const defractionalizeProperty = useCallback(async (propertyId: bigint) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({ address: contractAddress, abi: FractionalOwnershipABI, functionName: "defractionalizeProperty", args: [propertyId] });
          return true;
        } catch (err) { console.error("Error defractionalizing property:", err); setError("Failed to defractionalize property"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);

    // Fractionalize a property (requires owning the ERC721)
    const fractionalizeProperty = useCallback(async (propertyId: bigint, totalShares: bigint, sharePrice: bigint) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({ address: contractAddress, abi: FractionalOwnershipABI, functionName: "fractionalizeProperty", args: [propertyId, totalShares, sharePrice] });
          return true;
        } catch (err) { console.error("Error fractionalizing property:", err); setError("Failed to fractionalize property"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);

    // Grant a role
    const grantRole = useCallback(async (role: string, account: `0x${string}`) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({ address: contractAddress, abi: FractionalOwnershipABI, functionName: "grantRole", args: [role, account] });
          return true;
        } catch (err) { console.error("Error granting role:", err); setError("Failed to grant role"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);

    // Handle received ERC721 (internal function, unlikely to call directly from frontend)
    // const onERC721Received = useCallback(async ( /* args */ ) => { /* ... */ }, []);

    // Purchase shares (payable function)
    const purchaseShares = useCallback(async (propertyId: bigint, shares: bigint, value: bigint) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({ address: contractAddress, abi: FractionalOwnershipABI, functionName: "purchaseShares", args: [propertyId, shares], value: value });
          return true;
        } catch (err) { console.error("Error purchasing shares:", err); setError("Failed to purchase shares"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);

    // Renounce a role
    const renounceRole = useCallback(async (role: string, callerConfirmation: `0x${string}`) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({ address: contractAddress, abi: FractionalOwnershipABI, functionName: "renounceRole", args: [role, callerConfirmation] });
          return true;
        } catch (err) { console.error("Error renouncing role:", err); setError("Failed to renounce role"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);

    // Revoke a role
    const revokeRole = useCallback(async (role: string, account: `0x${string}`) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({ address: contractAddress, abi: FractionalOwnershipABI, functionName: "revokeRole", args: [role, account] });
          return true;
        } catch (err) { console.error("Error revoking role:", err); setError("Failed to revoke role"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);

    // Transfer tokens
    const transfer = useCallback(async (to: `0x${string}`, value: bigint) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({ address: contractAddress, abi: FractionalOwnershipABI, functionName: "transfer", args: [to, value] });
          return true;
        } catch (err) { console.error("Error transferring tokens:", err); setError("Failed to transfer tokens"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);

    // Transfer tokens from another account (requires allowance)
    const transferFrom = useCallback(async (from: `0x${string}`, to: `0x${string}`, value: bigint) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({ address: contractAddress, abi: FractionalOwnershipABI, functionName: "transferFrom", args: [from, to, value] });
          return true;
        } catch (err) { console.error("Error transferring tokens from:", err); setError("Failed to transfer tokens from"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);


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
    getAllowance,
    getBalanceOf,
    getDecimals,
    getFractionalizedProperty,
    getRoleAdmin,
    getRoleMember,
    getRoleMemberCount,
    hasRole,
    isPropertyFractionalized,
    getName,
    getPropertyTokenAddress,
    checkSupportsInterface,
    getSymbol,
    getTotalSupply,

    // Write Functions
    approve,
    burn,
    burnFrom,
    defractionalizeProperty,
    fractionalizeProperty,
    grantRole,
    purchaseShares,
    renounceRole,
    revokeRole,
    transfer,
    transferFrom,
  };
}
