"\"use client"

import { useCallback, useState } from "react"
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react"
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { formatEther, parseEther } from "viem"
import RealEstateSaleABI from "../abis/RealEstateSale.abi.json"
import { CONTRACT_ADDRESSES, DEFAULT_SALE_DOCUMENT, IPFS_GATEWAY } from "../../config/index.ts"

export enum SaleStatus {
  Created = 0,
  Active = 1,
  PendingApproval = 2,
  Approved = 3,
  Completed = 4,
  Cancelled = 5
}

// Sale type from the contract
export interface Sale {
  propertyId: bigint
  seller: `0x${string}`
  buyer: `0x${string}`
  price: bigint
  notary: `0x${string}`
  status: number
  createdAt: bigint
  updatedAt: bigint
  completedAt: bigint
  saleDocumentURI: string
  rentableTokensIncluded: boolean
  rentableTokenAmount: bigint
}

export interface SaleWithDetails extends Omit<Sale, "createdAt" | "updatedAt" | "completedAt"> {
  saleId: bigint
  formattedPrice: string
  createdAt: Date
  updatedAt: Date
  completedAt: Date | null
  statusText: string
  escrowBalance: string
  escrowBalanceRaw: bigint
  saleDocument: any | null
}

export function useRealEstateSaleContract() {
  const { address, isConnected } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const contractAddress = chainId
    ? CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.realEstateSale
    : undefined

  const { writeContract, isPending, isSuccess, data: txHash } = useWriteContract()

  const { data: receipt, isLoading: isWaitingForReceipt } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const getStatusText = (status: number): string => {
    switch (status) {
      case 0:
        return "Created"
      case 1:
        return "Active"
      case 2:
        return "Pending Approval"
      case 3:
        return "Approved"
      case 4:
        return "Completed"
      case SaleStatus.Cancelled:
        return "Cancelled"
      default:
        return "Unknown"
    }
  }

  const getSale = useCallback(
    async (saleId: bigint): Promise<SaleWithDetails | null> => {
      if (!contractAddress || !isConnected) return null

      try {
        setIsLoading(true)
        setError(null)

        const sale = (await readContract({
          address: contractAddress,
          abi: RealEstateSaleABI,
          functionName: "getSale",
          args: [saleId],
        })).data as {
          propertyId: bigint;
          seller: `0x${string}`;
          buyer: `0x${string}`;
          price: bigint;
          notary: `0x${string}`;
          status: number;
          createdAt: bigint;
          updatedAt: bigint;
          completedAt: bigint;
          saleDocumentURI: string;
          rentableTokensIncluded: boolean;
          rentableTokenAmount: bigint;
        }

        const escrowBalance = await readContract({
          address: contractAddress,
          abi: RealEstateSaleABI,
          functionName: "getEscrowBalance",
          args: [saleId],
        })

        let saleDocument = null
        if (sale.saleDocumentURI) {
          try {
            const documentUrl = sale.saleDocumentURI.replace("ipfs://", IPFS_GATEWAY)
            const response = await fetch(documentUrl)
            saleDocument = await response.json()
          } catch (err) {
            console.error("Error fetching sale document:", err)
            saleDocument = DEFAULT_SALE_DOCUMENT
          }
        }

        return {
          saleId,
          propertyId: sale.propertyId,
          seller: sale.seller,
          buyer: sale.buyer,
          price: sale.price,
          formattedPrice: formatEther(sale.price),
          notary: sale.notary,
          status: sale.status,
          statusText: getStatusText(sale.status),
          createdAt: new Date(Number(sale.createdAt) * 1000),
          updatedAt: new Date(Number(sale.updatedAt) * 1000),
          completedAt: sale.completedAt > 0n ? new Date(Number(sale.completedAt) * 1000) : null,
          saleDocumentURI: sale.saleDocumentURI,
          saleDocument,
          rentableTokensIncluded: sale.rentableTokensIncluded,
          rentableTokenAmount: sale.rentableTokenAmount,
          escrowBalance: formatEther(BigInt(escrowBalance?.toString() || '0')),
          escrowBalanceRaw: BigInt(escrowBalance?.toString() || '0'),
        }
      } catch (err) {
        console.error("Error getting sale details:", err)
        setError("Failed to get sale details")
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [contractAddress, isConnected],
  )

  const getActiveSaleForProperty = useCallback(
    async (propertyId: bigint): Promise<bigint | null> => {
      if (!contractAddress || !isConnected) return null

      try {
        setIsLoading(true)
        setError(null)

        const saleId = await readContract({
          address: contractAddress,
          abi: RealEstateSaleABI,
          functionName: "getActiveSaleForProperty",
          args: [propertyId],
        })

        return saleId ? BigInt(saleId.toString()) : null
      } catch (err) {
        console.error("Error getting active sale:", err)
        setError("Failed to get active sale")
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [contractAddress, isConnected],
  )

  const createSale = useCallback(
    async (
      propertyId: bigint,
      price: string,
      saleDocumentURI = `ipfs://QmExample/${Date.now()}`,
      onSuccess?: (saleId: bigint) => void,
    ) => {
      if (!contractAddress || !isConnected || !address) {
        setError("Wallet not connected")
        return null
      }

      try {
        setIsLoading(true)
        setError(null)

        const result = writeContract({
          address: contractAddress,
          abi: RealEstateSaleABI,
          functionName: "createSale",
          args: [propertyId, parseEther(price), saleDocumentURI],
        })

        if (onSuccess ) {
          console.log("Sale created successfully:", result)
          onSuccess(BigInt(Date.now()))
        }

        return true
      } catch (err) {
        console.error("Error creating sale:", err)
        setError("Failed to create sale")
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [contractAddress, isConnected, address, writeContract],
  )

  const expressInterest = useCallback(
    async (saleId: bigint) => {
      if (!contractAddress || !isConnected) {
        setError("Wallet not connected")
        return false
      }

      try {
        setIsLoading(true)
        setError(null)

        await writeContract({
          address: contractAddress,
          abi: RealEstateSaleABI,
          functionName: "expressInterest",
          args: [saleId],
        })

        return true
      } catch (err) {
        console.error("Error expressing interest:", err)
        setError("Failed to express interest")
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [contractAddress, isConnected, writeContract],
  )

  // Deposit escrow for a sale
  const depositEscrow = useCallback(
    async (saleId: bigint, amount: string) => {
      if (!contractAddress || !isConnected) {
        setError("Wallet not connected")
        return false
      }

      try {
        setIsLoading(true)
        setError(null)

        await writeContract({
          address: contractAddress,
          abi: RealEstateSaleABI,
          functionName: "depositEscrow",
          args: [saleId],
          value: parseEther(amount),
        })

        return true
      } catch (err) {
        console.error("Error depositing escrow:", err)
        setError("Failed to deposit escrow")
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [contractAddress, isConnected, writeContract],
  )

  // Assign notary to a sale
  const assignNotary = useCallback(
    async (saleId: bigint) => {
      if (!contractAddress || !isConnected) {
        setError("Wallet not connected")
        return false
      }

      try {
        setIsLoading(true)
        setError(null)

        await writeContract({
          address: contractAddress,
          abi: RealEstateSaleABI,
          functionName: "assignNotary",
          args: [saleId],
        })

        return true
      } catch (err) {
        console.error("Error assigning notary:", err)
        setError("Failed to assign notary")
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [contractAddress, isConnected, writeContract],
  )

  // Approve a sale (as notary)
  const approveSale = useCallback(
    async (saleId: bigint) => {
      if (!contractAddress || !isConnected) {
        setError("Wallet not connected")
        return false
      }

      try {
        setIsLoading(true)
        setError(null)

        await writeContract({
          address: contractAddress,
          abi: RealEstateSaleABI,
          functionName: "approveSale",
          args: [saleId],
        })

        return true
      } catch (err) {
        console.error("Error approving sale:", err)
        setError("Failed to approve sale")
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [contractAddress, isConnected, writeContract],
  )

  // Complete a sale
  const completeSale = useCallback(
    async (saleId: bigint) => {
      if (!contractAddress || !isConnected) {
        setError("Wallet not connected")
        return false
      }

      try {
        setIsLoading(true)
        setError(null)

        await writeContract({
          address: contractAddress,
          abi: RealEstateSaleABI,
          functionName: "completeSale",
          args: [saleId],
        })

        return true
      } catch (err) {
        console.error("Error completing sale:", err)
        setError("Failed to complete sale")
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [contractAddress, isConnected, writeContract],
  )

  // Cancel a sale
  const cancelSale = useCallback(
    async (saleId: bigint, reason: string) => {
      if (!contractAddress || !isConnected) {
        setError("Wallet not connected")
        return false
      }

      try {
        setIsLoading(true)
        setError(null)

        await writeContract({
          address: contractAddress,
          abi: RealEstateSaleABI,
          functionName: "cancelSale",
          args: [saleId, reason],
        })

        return true
      } catch (err) {
        console.error("Error cancelling sale:", err)
        setError("Failed to cancel sale")
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [contractAddress, isConnected, writeContract],
  )

  const updateSalePrice = useCallback(
    async (saleId: bigint, newPrice: string) => {
      if (!contractAddress || !isConnected) {
        setError("Wallet not connected")
        return false
      }

      try {
        setIsLoading(true)
        setError(null)

        await writeContract({
          address: contractAddress,
          abi: RealEstateSaleABI,
          functionName: "updateSalePrice",
          args: [saleId, parseEther(newPrice)],
        })

        return true
      } catch (err) {
        console.error("Error updating sale price:", err)
        setError("Failed to update sale price")
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [contractAddress, isConnected, writeContract],
  )

  const readContract = useReadContract

  return {
    contractAddress,
    isLoading: isLoading || isPending || isWaitingForReceipt,
    isSuccess,
    error,
    txHash,
    receipt,
    getSale,
    getActiveSaleForProperty,
    createSale,
    expressInterest,
    depositEscrow,
    assignNotary,
    approveSale,
    completeSale,
    cancelSale,
    updateSalePrice,
  }
}
