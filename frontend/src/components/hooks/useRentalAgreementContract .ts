"use client";

import { useCallback, useState } from "react";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { type UseReadContractReturnType } from 'wagmi';
import { CONTRACT_ADDRESSES } from "../../contracts/config.ts";
import RentalAgreementABI from "../../components/abis/RentalAgreement.abi.json";

interface Rental {
    propertyId: bigint;
    landlord: `0x${string}`;
    tenant: `0x${string}`;
    monthlyRent: bigint;
    securityDeposit: bigint;
    startDate: bigint;
    endDate: bigint;
    lastPaymentDate: bigint;
    status: number;
    agreementURI: string;
}

export enum RentalStatus {
    Active = 0,
    Expired = 1,
    Terminated = 2
}


export function useRentalAgreementContract() {
  const { address, isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contractAddress = chainId
    ? (CONTRACT_ADDRESSES as any)[chainId]?.rentalAgreement
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


    // Get DEFAULT_ADMIN_ROLE bytes32
    const getDefaultAdminRole = useCallback(async (): Promise<string | null> => {
        if (!contractAddress || !isConnected) return null;

        try {
          setIsLoading(true);
          setError(null);

          const result = await useReadContract({
            address: contractAddress,
            abi: RentalAgreementABI,
            functionName: "DEFAULT_ADMIN_ROLE",
            args: [],
          }) as UseReadContractReturnType<typeof RentalAgreementABI, "DEFAULT_ADMIN_ROLE">;

          if (!result || !result.data) throw new Error("Failed to get DEFAULT_ADMIN_ROLE");

          return result.data as string;

        } catch (err) {
          console.error("Error getting DEFAULT_ADMIN_ROLE:", err);
          setError("Failed to get DEFAULT_ADMIN_ROLE");
          return null;
        } finally {
          setIsLoading(false);
        }
    }, [contractAddress, isConnected]);

    // Get RENTAL_MANAGER_ROLE bytes32
    const getRentalManagerRole = useCallback(async (): Promise<string | null> => {
        if (!contractAddress || !isConnected) return null;

        try {
          setIsLoading(true);
          setError(null);

          const result = await useReadContract({
            address: contractAddress,
            abi: RentalAgreementABI,
            functionName: "RENTAL_MANAGER_ROLE",
            args: [],
          }) as UseReadContractReturnType<typeof RentalAgreementABI, "RENTAL_MANAGER_ROLE">;

          if (!result || !result.data) throw new Error("Failed to get RENTAL_MANAGER_ROLE");

          return result.data as string;

        } catch (err) {
          console.error("Error getting RENTAL_MANAGER_ROLE:", err);
          setError("Failed to get RENTAL_MANAGER_ROLE");
          return null;
        } finally {
          setIsLoading(false);
        }
    }, [contractAddress, isConnected]);

    // Get Rental details by ID
    const getRental = useCallback(async (rentalId: bigint): Promise<Rental | null> => {
        if (!contractAddress || !isConnected) return null;

        try {
          setIsLoading(true);
          setError(null);

          const result = await useReadContract({
            address: contractAddress,
            abi: RentalAgreementABI,
            functionName: "getRental",
            args: [rentalId],
          }) as UseReadContractReturnType<typeof RentalAgreementABI, "getRental">;

          if (!result || !result.data) throw new Error("Failed to get rental data");

          const rentalData = result.data as unknown as Rental;

          const formattedRental = {
            ...rentalData,
            startDate: new Date(Number(rentalData.startDate) * 1000),
            endDate: new Date(Number(rentalData.endDate) * 1000),
            lastPaymentDate: new Date(Number(rentalData.lastPaymentDate) * 1000),
          };

          return rentalData;

        } catch (err) {
          console.error("Error getting rental:", err);
          setError("Failed to get rental details");
          return null;
        } finally {
          setIsLoading(false);
        }
    }, [contractAddress, isConnected]);

    // Get Role Admin
    const getRoleAdmin = useCallback(async (role: string): Promise<string | null> => {
        if (!contractAddress || !isConnected) return null;

        try {
          setIsLoading(true);
          setError(null);

          const result = await useReadContract({
            address: contractAddress,
            abi: RentalAgreementABI,
            functionName: "getRoleAdmin",
            args: [role],
          }) as UseReadContractReturnType<typeof RentalAgreementABI, "getRoleAdmin">;

          if (!result || !result.data) throw new Error("Failed to get role admin");

          return result.data as string;

        } catch (err) {
          console.error("Error getting role admin:", err);
          setError("Failed to get role admin");
          return null;
        } finally {
          setIsLoading(false);
        }
    }, [contractAddress, isConnected]);

    // Get Security Deposit amount
    const getSecurityDeposit = useCallback(async (rentalId: bigint): Promise<bigint | null> => {
        if (!contractAddress || !isConnected) return null;

        try {
          setIsLoading(true);
          setError(null);

          const result = await useReadContract({
            address: contractAddress,
            abi: RentalAgreementABI,
            functionName: "getSecurityDeposit",
            args: [rentalId],
          }) as UseReadContractReturnType<typeof RentalAgreementABI, "getSecurityDeposit">;

          if (!result || !result.data) throw new Error("Failed to get security deposit");

          return result.data as bigint;

        } catch (err) {
          console.error("Error getting security deposit:", err);
          setError("Failed to get security deposit");
          return null;
        } finally {
          setIsLoading(false);
        }
    }, [contractAddress, isConnected]);

    // Check if address has a role
    const hasRole = useCallback(async (role: string, account: `0x${string}`): Promise<boolean | null> => {
        if (!contractAddress || !isConnected) return null;

        try {
          setIsLoading(true);
          setError(null);

          const result = await useReadContract({
            address: contractAddress,
            abi: RentalAgreementABI,
            functionName: "hasRole",
            args: [role, account],
          }) as UseReadContractReturnType<typeof RentalAgreementABI, "hasRole">;

          if (result === undefined || result.data === undefined) throw new Error("Failed to check role");

          return result.data as boolean;

        } catch (err) {
          console.error("Error checking role:", err);
          setError("Failed to check role");
          return null;
        } finally {
          setIsLoading(false);
        }
    }, [contractAddress, isConnected]);

    // Check if rent is overdue
    const isRentOverdue = useCallback(async (rentalId: bigint): Promise<boolean | null> => {
        if (!contractAddress || !isConnected) return null;

        try {
          setIsLoading(true);
          setError(null);

          const result = await useReadContract({
            address: contractAddress,
            abi: RentalAgreementABI,
            functionName: "isRentOverdue",
            args: [rentalId],
          }) as UseReadContractReturnType<typeof RentalAgreementABI, "isRentOverdue">;

          if (result === undefined || result.data === undefined) throw new Error("Failed to check if rent is overdue");

          return result.data as boolean;

        } catch (err) {
          console.error("Error checking if rent is overdue:", err);
          setError("Failed to check if rent is overdue");
          return null;
        } finally {
          setIsLoading(false);
        }
    }, [contractAddress, isConnected]);

    // Get Real Estate Token address
    const getPropertyTokenAddress = useCallback(async (): Promise<`0x${string}` | null> => {
        if (!contractAddress || !isConnected) return null;

        try {
          setIsLoading(true);
          setError(null);

          const result = await useReadContract({
            address: contractAddress,
            abi: RentalAgreementABI,
            functionName: "propertyToken",
            args: [],
          }) as UseReadContractReturnType<typeof RentalAgreementABI, "propertyToken">;

          if (!result || !result.data) throw new Error("Failed to get property token address");

          return result.data as `0x${string}`;

        } catch (err) {
          console.error("Error getting property token address:", err);
          setError("Failed to get property token address");
          return null;
        } finally {
          setIsLoading(false);
        }
    }, [contractAddress, isConnected]);

    // Check if interface is supported
    const checkSupportsInterface = useCallback(async (interfaceId: string): Promise<boolean | null> => {
        if (!contractAddress || !isConnected) return null;

        try {
          setIsLoading(true);
          setError(null);

          const result = await useReadContract({
            address: contractAddress,
            abi: RentalAgreementABI,
            functionName: "supportsInterface",
            args: [interfaceId as `0x${string}`],
          }) as UseReadContractReturnType<typeof RentalAgreementABI, "supportsInterface">;

          if (result === undefined || result.data === undefined) throw new Error("Failed to check supported interface");

          return result.data as boolean;

        } catch (err) {
          console.error("Error checking supported interface:", err);
          setError("Failed to check supported interface");
          return null;
        } finally {
          setIsLoading(false);
        }
    }, [contractAddress, isConnected]);


    // Create a new rental agreement
    const createRental = useCallback(async (
        propertyId: bigint,
        tenant: `0x${string}`,
        monthlyRent: bigint,
        securityDeposit: bigint,
        durationMonths: bigint,
        agreementURI: string,
        value: bigint
    ) => {
        if (!contractAddress || !isConnected) {
          setError("Wallet not connected");
          return false;
        }

        try {
          setIsLoading(true);
          setError(null);

          writeContract({
            address: contractAddress,
            abi: RentalAgreementABI,
            functionName: "createRental",
            args: [propertyId, tenant, monthlyRent, securityDeposit, durationMonths, agreementURI],
            value: value,
          });

          return true;

        } catch (err) {
          console.error("Error creating rental:", err);
          setError("Failed to create rental");
          return false;
        } finally {
          setIsLoading(false);
        }
    }, [contractAddress, isConnected, writeContract]);

    // Expire a rental agreement
    const expireRental = useCallback(async (rentalId: bigint) => {
        if (!contractAddress || !isConnected) {
          setError("Wallet not connected");
          return false;
        }

        try {
          setIsLoading(true);
          setError(null);

          writeContract({
            address: contractAddress,
            abi: RentalAgreementABI,
            functionName: "expireRental",
            args: [rentalId],
          });

          return true;

        } catch (err) {
          console.error("Error expiring rental:", err);
          setError("Failed to expire rental");
          return false;
        } finally {
          setIsLoading(false);
        }
    }, [contractAddress, isConnected, writeContract]);

    // Grant a role (e.g., RENTAL_MANAGER_ROLE)
    const grantRole = useCallback(async (role: string, account: `0x${string}`) => {
        if (!contractAddress || !isConnected) {
          setError("Wallet not connected");
          return false;
        }

        try {
          setIsLoading(true);
          setError(null);

          writeContract({
            address: contractAddress,
            abi: RentalAgreementABI,
            functionName: "grantRole",
            args: [role, account],
          });

          return true;

        } catch (err) {
          console.error("Error granting role:", err);
          setError("Failed to grant role");
          return false;
        } finally {
          setIsLoading(false);
        }
    }, [contractAddress, isConnected, writeContract]);

    // Pay rent for a rental agreement
    const payRent = useCallback(async (rentalId: bigint, value: bigint) => {
        if (!contractAddress || !isConnected) {
          setError("Wallet not connected");
          return false;
        }

        try {
          setIsLoading(true);
          setError(null);

          writeContract({
            address: contractAddress,
            abi: RentalAgreementABI,
            functionName: "payRent",
            args: [rentalId],
            value: value,
          });

          return true;

        } catch (err) {
          console.error("Error paying rent:", err);
          setError("Failed to pay rent");
          return false;
        } finally {
          setIsLoading(false);
        }
    }, [contractAddress, isConnected, writeContract]);

    // Renounce a role
    const renounceRole = useCallback(async (role: string, callerConfirmation: `0x${string}`) => {
        if (!contractAddress || !isConnected) {
          setError("Wallet not connected");
          return false;
        }

        try {
          setIsLoading(true);
          setError(null);

          writeContract({
            address: contractAddress,
            abi: RentalAgreementABI,
            functionName: "renounceRole",
            args: [role, callerConfirmation],
          });

          return true;

        } catch (err) {
          console.error("Error renouncing role:", err);
          setError("Failed to renounce role");
          return false;
        } finally {
          setIsLoading(false);
        }
    }, [contractAddress, isConnected, writeContract]);

    // Return security deposit
    const returnSecurityDeposit = useCallback(async (rentalId: bigint, deductions: bigint) => {
        if (!contractAddress || !isConnected) {
          setError("Wallet not connected");
          return false;
        }

        try {
          setIsLoading(true);
          setError(null);

          writeContract({
            address: contractAddress,
            abi: RentalAgreementABI,
            functionName: "returnSecurityDeposit",
            args: [rentalId, deductions],
          });

          return true;

        } catch (err) {
          console.error("Error returning security deposit:", err);
          setError("Failed to return security deposit");
          return false;
        } finally {
          setIsLoading(false);
        }
    }, [contractAddress, isConnected, writeContract]);

    // Revoke a role
    const revokeRole = useCallback(async (role: string, account: `0x${string}`) => {
        if (!contractAddress || !isConnected) {
          setError("Wallet not connected");
          return false;
        }

        try {
          setIsLoading(true);
          setError(null);

          writeContract({
            address: contractAddress,
            abi: RentalAgreementABI,
            functionName: "revokeRole",
            args: [role, account],
          });

          return true;

        } catch (err) {
          console.error("Error revoking role:", err);
          setError("Failed to revoke role");
          return false;
        } finally {
          setIsLoading(false);
        }
    }, [contractAddress, isConnected, writeContract]);

    // Terminate a rental agreement
    const terminateRental = useCallback(async (rentalId: bigint, reason: string) => {
        if (!contractAddress || !isConnected) {
          setError("Wallet not connected");
          return false;
        }

        try {
          setIsLoading(true);
          setError(null);

          writeContract({
            address: contractAddress,
            abi: RentalAgreementABI,
            functionName: "terminateRental",
            args: [rentalId, reason],
          });

          return true;

        } catch (err) {
          console.error("Error terminating rental:", err);
          setError("Failed to terminate rental");
          return false;
        } finally {
          setIsLoading(false);
        }
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
    getDefaultAdminRole,
    getRentalManagerRole,
    getRental,
    getRoleAdmin,
    getSecurityDeposit,
    hasRole,
    isRentOverdue,
    getPropertyTokenAddress,
    checkSupportsInterface,

    // Write Functions
    createRental,
    expireRental,
    grantRole,
    payRent,
    renounceRole,
    returnSecurityDeposit,
    revokeRole,
    terminateRental,
  };
}
