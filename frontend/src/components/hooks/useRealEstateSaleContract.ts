"\"use client"

import { useCallback, useState } from "react"
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react"
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { formatEther, parseEther } from "viem"
import { RealEstateSaleABI, SaleStatus } from "../../contracts/abis"
import { CONTRACT_ADDRESSES, DEFAULT_SALE_DOCUMENT, IPFS_GATEWAY } from "/home/jhonny/kali/frontend/src/contracts/config.ts"

// Re-export SaleStatus
export { SaleStatus }

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

// Extended sale type with formatted values
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

  // Get contract address based on current chain
  const contractAddress = chainId
    ? CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.realEstateSale
    : undefined

  // Write contract hook
  const { writeContract, isPending, isSuccess, data: txHash } = useWriteContract()

  // Wait for transaction receipt
  const { data: receipt, isLoading: isWaitingForReceipt } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  // Helper function to get status text
  const getStatusText = (status: number): string => {
    switch (status) {
      case SaleStatus.Created:
        return "Created"
      case SaleStatus.Active:
        return "Active"
      case SaleStatus.PendingApproval:
        return "Pending Approval"
      case SaleStatus.Approved:
        return "Approved"
      case SaleStatus.Completed:
        return "Completed"
      case SaleStatus.Cancelled:
        return "Cancelled"
      default:
        return "Unknown"
    }
  }

  // Get sale by ID
  const getSale = useCallback(
    async (saleId: bigint): Promise<SaleWithDetails | null> => {
      if (!contractAddress || !isConnected) return null

      try {
        setIsLoading(true)
        setError(null)

        // Get sale details from contract
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

        // Get escrow balance
        const escrowBalance = await readContract({
          address: contractAddress,
          abi: RealEstateSaleABI,
          functionName: "getEscrowBalance",
          args: [saleId],
        })

        // Fetch sale document if available
        let saleDocument = null
        if (sale.saleDocumentURI) {
          try {
            const documentUrl = sale.saleDocumentURI.replace("ipfs://", IPFS_GATEWAY)
            const response = await fetch(documentUrl)
            saleDocument = await response.json()
          } catch (err) {
            console.error("Error fetching sale document:", err)
            // Use default document if fetch fails
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
          escrowBalance: formatEther(escrowBalance.data),
          escrowBalanceRaw: escrowBalance.data,
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

  // Get active sale for a property
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

        return saleId
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

  // Create a new sale
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

        writeContract({
          address: contractAddress,
          abi: RealEstateSaleABI,
          functionName: "createSale",
          args: [propertyId, parseEther(price), saleDocumentURI],
          onSettled(data, error) {
            if (error) {
              console.error("Error creating sale:", error)
              setError("Failed to create sale")
            } else {
              console.log("Sale created successfully:", data)
              if (onSuccess) onSuccess(BigInt(Date.now()))
            }
          },
        })

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

  // Express interest in a property
  const expressInterest = useCallback(
    async (saleId: bigint) => {
      if (!contractAddress || !isConnected) {
        setError("Wallet not connected")
        return false
      }

      try {
        setIsLoading(true)
        setError(null)

        writeContract({
          address: contractAddress,
          abi: RealEstateSaleABI,
          functionName: "expressInterest",
          args: [saleId],
          onSettled(data, error) {
            if (error) {
              console.error("Error expressing interest:", error)
              setError("Failed to express interest")
            } else {
              console.log("Interest expressed successfully:", data)
            }
          },
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

        writeContract({
          address: contractAddress,
          abi: RealEstateSaleABI,
          functionName: "depositEscrow",
          args: [saleId],
          value: parseEther(amount),
          onSettled(data, error) {
            if (error) {
              console.error("Error depositing escrow:", error)
              setError("Failed to deposit escrow")
            } else {
              console.log("Escrow deposited successfully:", data)
            }
          },
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

        writeContract({
          address: contractAddress,
          abi: RealEstateSaleABI,
          functionName: "assignNotary",
          args: [saleId],
          onSettled(data, error) {
            if (error) {
              console.error("Error assigning notary:", error)
              setError("Failed to assign notary")
            } else {
              console.log("Notary assigned successfully:", data)
            }
          },
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

        writeContract({
          address: contractAddress,
          abi: RealEstateSaleABI,
          functionName: "approveSale",
          args: [saleId],
          onSettled(data, error) {
            if (error) {
              console.error("Error approving sale:", error)
              setError("Failed to approve sale")
            } else {
              console.log("Sale approved successfully:", data)
            }
          },
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

        writeContract({
          address: contractAddress,
          abi: RealEstateSaleABI,
          functionName: "completeSale",
          args: [saleId],
          onSettled(data, error) {
            if (error) {
              console.error("Error completing sale:", error)
              setError("Failed to complete sale")
            } else {
              console.log("Sale completed successfully:", data)
            }
          },
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

        writeContract({
          address: contractAddress,
          abi: RealEstateSaleABI,
          functionName: "cancelSale",
          args: [saleId, reason],
          onSettled(data, error) {
            if (error) {
              console.error("Error cancelling sale:", error)
              setError("Failed to cancel sale")
            } else {
              console.log("Sale cancelled successfully:", data)
            }
          },
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

  // Update sale price
  const updateSalePrice = useCallback(
    async (saleId: bigint, newPrice: string) => {
      if (!contractAddress || !isConnected) {
        setError("Wallet not connected")
        return false
      }

      try {
        setIsLoading(true)
        setError(null)

        writeContract({
          address: contractAddress,
          abi: RealEstateSaleABI,
          functionName: "updateSalePrice",
          args: [saleId, parseEther(newPrice)],
          onSettled(data, error) {
            if (error) {
              console.error("Error updating sale price:", error)
              setError("Failed to update sale price")
            } else {
              console.log("Sale price updated successfully:", data)
            }
          },
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

  // Helper function for read contract calls
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
