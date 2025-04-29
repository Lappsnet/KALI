"use client";

import { useCallback, useState } from "react";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { type UseReadContractReturnType } from 'wagmi';
import MarketplaceOrchestratorABI from "../../components/abis/MarketplaceOrchestrator.abi.json";
import { CONTRACT_ADDRESSES } from "../../config/index.ts";


// Define the PropertyListing struct type based on the ABI
interface PropertyListing {
    propertyId: bigint;
    owner: `0x${string}`;
    forSale: boolean;
    forRent: boolean;
    salePrice: bigint;
    monthlyRent: bigint;
    listedAt: bigint; // Timestamp
}

export function useMarketplaceOrchestratorContract() {
  const { isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contractAddress = chainId
    ? (CONTRACT_ADDRESSES as any)[chainId]?.marketplaceOrchestrator // Replace (CONTRACT_ADDRESSES as any)[chainId]?.marketplaceOrchestrator with your actual way to get the address
    : undefined;

  // Write contract hook
  const {
    writeContract,
    isPending: isWritePending,
    isSuccess: isWriteSuccess,
    data: writeTxHash,
  } = useWriteContract();

  // Wait for transaction receipt for write operations
  const {
    data: writeReceipt,
    isLoading: isWaitingForWriteReceipt,
  } = useWaitForTransactionReceipt({
    hash: writeTxHash,
  });

    // Get DEFAULT_ADMIN_ROLE bytes32
    const getDefaultAdminRole = useCallback(async (): Promise<string | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: MarketplaceOrchestratorABI, functionName: "DEFAULT_ADMIN_ROLE" }) as UseReadContractReturnType<typeof MarketplaceOrchestratorABI, "DEFAULT_ADMIN_ROLE">;
          if (!result || !result.data) throw new Error("Failed to get DEFAULT_ADMIN_ROLE");
          return result.data as string; // bytes32 is often returned as string in JS
        } catch (err) { console.error("Error getting DEFAULT_ADMIN_ROLE:", err); setError("Failed to get DEFAULT_ADMIN_ROLE"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get OPERATOR_ROLE bytes32
    const getOperatorRole = useCallback(async (): Promise<string | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: MarketplaceOrchestratorABI, functionName: "OPERATOR_ROLE" }) as UseReadContractReturnType<typeof MarketplaceOrchestratorABI, "OPERATOR_ROLE">;
          if (!result || !result.data) throw new Error("Failed to get OPERATOR_ROLE");
          return result.data as string; // bytes32 is often returned as string in JS
        } catch (err) { console.error("Error getting OPERATOR_ROLE:", err); setError("Failed to get OPERATOR_ROLE"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get all listed property IDs
    const getAllListedProperties = useCallback(async (): Promise<bigint[] | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: MarketplaceOrchestratorABI, functionName: "getAllListedProperties" }) as UseReadContractReturnType<typeof MarketplaceOrchestratorABI, "getAllListedProperties">;
          if (!result || !result.data) throw new Error("Failed to get all listed properties");
          return result.data as bigint[];
        } catch (err) { console.error("Error getting all listed properties:", err); setError("Failed to get all listed properties"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get a property listing by ID
    const getListing = useCallback(async (propertyId: bigint): Promise<PropertyListing | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: MarketplaceOrchestratorABI, functionName: "getListing", args: [propertyId] }) as UseReadContractReturnType<typeof MarketplaceOrchestratorABI, "getListing">;
          if (!result || !result.data) throw new Error("Failed to get listing");

          const listingData = result.data as unknown as PropertyListing;

          return listingData;

        } catch (err) { console.error("Error getting listing:", err); setError("Failed to get listing"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get properties listed for rent
    const getPropertiesForRent = useCallback(async (): Promise<bigint[] | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: MarketplaceOrchestratorABI, functionName: "getPropertiesForRent" }) as UseReadContractReturnType<typeof MarketplaceOrchestratorABI, "getPropertiesForRent">;
          if (!result || !result.data) throw new Error("Failed to get properties for rent");
          return result.data as bigint[];
        } catch (err) { console.error("Error getting properties for rent:", err); setError("Failed to get properties for rent"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get properties listed for sale
    const getPropertiesForSale = useCallback(async (): Promise<bigint[] | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: MarketplaceOrchestratorABI, functionName: "getPropertiesForSale" }) as UseReadContractReturnType<typeof MarketplaceOrchestratorABI, "getPropertiesForSale">;
          if (!result || !result.data) throw new Error("Failed to get properties for sale");
          return result.data as bigint[];
        } catch (err) { console.error("Error getting properties for sale:", err); setError("Failed to get properties for sale"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get Role Admin
    const getRoleAdmin = useCallback(async (role: string): Promise<string | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: MarketplaceOrchestratorABI, functionName: "getRoleAdmin", args: [role] }) as UseReadContractReturnType<typeof MarketplaceOrchestratorABI, "getRoleAdmin">;
          if (!result || !result.data) throw new Error("Failed to get role admin");
          return result.data as string; // bytes32 as string
        } catch (err) { console.error("Error getting role admin:", err); setError("Failed to get role admin"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Check if account has a role
    const hasRole = useCallback(async (role: string, account: `0x${string}`): Promise<boolean | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: MarketplaceOrchestratorABI, functionName: "hasRole", args: [role, account] }) as UseReadContractReturnType<typeof MarketplaceOrchestratorABI, "hasRole">;
          if (result === undefined || result.data === undefined) throw new Error("Failed to check role");
          return result.data as boolean;
        } catch (err) { console.error("Error checking role:", err); setError("Failed to check role"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get Lending Protocol address
    const getLendingProtocolAddress = useCallback(async (): Promise<`0x${string}` | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: MarketplaceOrchestratorABI, functionName: "lendingProtocol" }) as UseReadContractReturnType<typeof MarketplaceOrchestratorABI, "lendingProtocol">;
          if (!result || !result.data) throw new Error("Failed to get lending protocol address");
          return result.data as `0x${string}`;
        } catch (err) { console.error("Error getting lending protocol address:", err); setError("Failed to get lending protocol address"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get Property Token address
    const getPropertyTokenAddress = useCallback(async (): Promise<`0x${string}` | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: MarketplaceOrchestratorABI, functionName: "propertyToken" }) as UseReadContractReturnType<typeof MarketplaceOrchestratorABI, "propertyToken">;
          if (!result || !result.data) throw new Error("Failed to get property token address");
          return result.data as `0x${string}`;
        } catch (err) { console.error("Error getting property token address:", err); setError("Failed to get property token address"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get Rentable Token address
    const getRentableTokenAddress = useCallback(async (): Promise<`0x${string}` | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: MarketplaceOrchestratorABI, functionName: "rentableToken" }) as UseReadContractReturnType<typeof MarketplaceOrchestratorABI, "rentableToken">;
          if (!result || !result.data) throw new Error("Failed to get rentable token address");
          return result.data as `0x${string}`;
        } catch (err) { console.error("Error getting rentable token address:", err); setError("Failed to get rentable token address"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get Rental Agreement address
    const getRentalAgreementAddress = useCallback(async (): Promise<`0x${string}` | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: MarketplaceOrchestratorABI, functionName: "rentalAgreement" }) as UseReadContractReturnType<typeof MarketplaceOrchestratorABI, "rentalAgreement">;
          if (!result || !result.data) throw new Error("Failed to get rental agreement address");
          return result.data as `0x${string}`;
        } catch (err) { console.error("Error getting rental agreement address:", err); setError("Failed to get rental agreement address"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Get Sale Contract address
    const getSaleContractAddress = useCallback(async (): Promise<`0x${string}` | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: MarketplaceOrchestratorABI, functionName: "saleContract" }) as UseReadContractReturnType<typeof MarketplaceOrchestratorABI, "saleContract">;
          if (!result || !result.data) throw new Error("Failed to get sale contract address");
          return result.data as `0x${string}`;
        } catch (err) { console.error("Error getting sale contract address:", err); setError("Failed to get sale contract address"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Check if interface is supported
    const checkSupportsInterface = useCallback(async (interfaceId: string): Promise<boolean | null> => {
        if (!contractAddress || !isConnected) return null;
        try {
          setIsLoading(true); setError(null);
          const result = await useReadContract({ address: contractAddress, abi: MarketplaceOrchestratorABI, functionName: "supportsInterface", args: [interfaceId as `0x${string}`] }) as UseReadContractReturnType<typeof MarketplaceOrchestratorABI, "supportsInterface">;
          if (result === undefined || result.data === undefined) throw new Error("Failed to check supported interface");
          return result.data as boolean;
        } catch (err) { console.error("Error checking supported interface:", err); setError("Failed to check supported interface"); return null; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected]);

    // Grant a role
    const grantRole = useCallback(async (role: string, account: `0x${string}`) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({ address: contractAddress, abi: MarketplaceOrchestratorABI, functionName: "grantRole", args: [role, account] });
          return true;
        } catch (err) { console.error("Error granting role:", err); setError("Failed to grant role"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);

    // Initiate rental from listing (payable function)
    const initiateRentalFromListing = useCallback(async (
        propertyId: bigint,
        tenant: `0x${string}`,
        securityDeposit: bigint,
        durationMonths: bigint,
        agreementURI: string,
        value: bigint 
    ) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({
            address: contractAddress,
            abi: MarketplaceOrchestratorABI,
            functionName: "initiateRentalFromListing",
            args: [propertyId, tenant, securityDeposit, durationMonths, agreementURI],
            value: value,
          });
          return true;
        } catch (err) { console.error("Error initiating rental from listing:", err); setError("Failed to initiate rental from listing"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);

    // Initiate sale from listing
    const initiateSaleFromListing = useCallback(async (
        propertyId: bigint,
        saleDocumentURI: string
    ) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({
            address: contractAddress,
            abi: MarketplaceOrchestratorABI,
            functionName: "initiateSaleFromListing",
            args: [propertyId, saleDocumentURI],
          });
          return true;
        } catch (err) { console.error("Error initiating sale from listing:", err); setError("Failed to initiate sale from listing"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);

    // List a property
    const listProperty = useCallback(async (
        propertyId: bigint,
        forSale: boolean,
        forRent: boolean,
        salePrice: bigint,
        monthlyRent: bigint
    ) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({
            address: contractAddress,
            abi: MarketplaceOrchestratorABI,
            functionName: "listProperty",
            args: [propertyId, forSale, forRent, salePrice, monthlyRent],
          });
          return true;
        } catch (err) { console.error("Error listing property:", err); setError("Failed to list property"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);

    // Renounce a role
    const renounceRole = useCallback(async (role: string, callerConfirmation: `0x${string}`) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({ address: contractAddress, abi: MarketplaceOrchestratorABI, functionName: "renounceRole", args: [role, callerConfirmation] });
          return true;
        } catch (err) { console.error("Error renouncing role:", err); setError("Failed to renounce role"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);

    // Revoke a role
    const revokeRole = useCallback(async (role: string, account: `0x${string}`) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({ address: contractAddress, abi: MarketplaceOrchestratorABI, functionName: "revokeRole", args: [role, account] });
          return true;
        } catch (err) { console.error("Error revoking role:", err); setError("Failed to revoke role"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);

    // Unlist a property
    const unlistProperty = useCallback(async (propertyId: bigint) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({ address: contractAddress, abi: MarketplaceOrchestratorABI, functionName: "unlistProperty", args: [propertyId] });
          return true;
        } catch (err) { console.error("Error unlisting property:", err); setError("Failed to unlist property"); return false; } finally { setIsLoading(false); }
    }, [contractAddress, isConnected, writeContract]);

    // Update a listing
    const updateListing = useCallback(async (
        propertyId: bigint,
        forSale: boolean,
        forRent: boolean,
        salePrice: bigint,
        monthlyRent: bigint
    ) => {
        if (!contractAddress || !isConnected) { setError("Wallet not connected"); return false; }
        try {
          setIsLoading(true); setError(null);
          writeContract({
            address: contractAddress,
            abi: MarketplaceOrchestratorABI,
            functionName: "updateListing",
            args: [propertyId, forSale, forRent, salePrice, monthlyRent],
          });
          return true;
        } catch (err) { console.error("Error updating listing:", err); setError("Failed to update listing"); return false; } finally { setIsLoading(false); }
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

    getDefaultAdminRole,
    getOperatorRole,
    getAllListedProperties,
    getListing,
    getPropertiesForRent,
    getPropertiesForSale,
    getRoleAdmin,
    hasRole,
    getLendingProtocolAddress,
    getPropertyTokenAddress,
    getRentableTokenAddress,
    getRentalAgreementAddress,
    getSaleContractAddress,
    checkSupportsInterface,

    grantRole,
    initiateRentalFromListing,
    initiateSaleFromListing,
    listProperty,
    renounceRole,
    revokeRole,
    unlistProperty,
    updateListing,
  };
}
