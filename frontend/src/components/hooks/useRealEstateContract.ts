"use client"

import { useCallback, useState } from "react"
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react"
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { readContract, writeContract, waitForTransactionReceipt } from "@wagmi/core"
import { formatEther, parseEther } from "viem"
import { RealEstateERC721ABI } from "../../contracts/RealEstateERC721"
import { CONTRACT_ADDRESSES, IPFS_GATEWAY, DEFAULT_METADATA_TEMPLATE } from "../../contracts/config"
import type { ReadContractParameters } from '@wagmi/core'
import { useConfig } from 'wagmi'

// Property details type from the contract
export interface PropertyDetails {
  cadastralNumber: string
  location: string
  valuation: bigint
  active: boolean
  lastUpdated: bigint
  metadataURI: string
}

// Extended property details with token ID and formatted values
export interface PropertyWithMetadata {
  tokenId: bigint
  cadastralNumber: string
  location: string
  valuation: string
  valuationRaw: bigint
  active: boolean
  lastUpdated: Date
  metadataURI: string
  owner: string
  metadata: {
    name: string
    description: string
    image: string
    attributes: Array<{
      trait_type: string
      value: string | number
    }>
  } | null
}

export function useRealEstateContract() {
  const { address, isConnected } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()
  const config = useConfig()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get contract address based on current chain
  const contractAddress = chainId
    ? CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.realEstateERC721
    : undefined

  // Write contract hook
  const { writeContract, isPending, isSuccess, data: txHash } = useWriteContract()

  // Wait for transaction receipt
  const { data: receipt, isLoading: isWaitingForReceipt } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  // Get all token IDs
  const { data: allTokenIds, refetch: refetchAllTokenIds } = useReadContract({
    address: contractAddress,
    abi: RealEstateERC721ABI,
    functionName: "getAllTokenIds",
    query: {
      enabled: !!contractAddress && isConnected,
    },
  })

  // Get property details by token ID
  const getPropertyDetails = useCallback(
    async (tokenId: bigint): Promise<PropertyWithMetadata | null> => {
      if (!contractAddress || !isConnected) return null

      try {
        setIsLoading(true)
        setError(null)

        // Get property details from contract
        const propertyDetails = await readContract(config, {
          address: contractAddress,
          abi: RealEstateERC721ABI,
          functionName: "getPropertyDetails",
          args: [tokenId],
        })

        // Get owner of the token
        const owner = await readContract(config, {
          address: contractAddress,
          abi: RealEstateERC721ABI,
          functionName: "ownerOf",
          args: [tokenId],
        }) as string

        // Fetch metadata if available
        let metadata = null
        if ((propertyDetails as any).metadataURI) {
          try {
            const metadataUrl = (propertyDetails as any).metadataURI.replace("ipfs://", IPFS_GATEWAY)
            const response = await fetch(metadataUrl)
            metadata = await response.json()
          } catch (err) {
            console.error("Error fetching metadata:", err)
          }
        }

        const details = propertyDetails as any
        return {
          tokenId,
          cadastralNumber: details.cadastralNumber,
          location: details.location,
          valuation: formatEther(details.valuation),
          valuationRaw: details.valuation,
          active: details.active,
          lastUpdated: new Date(Number(details.lastUpdated) * 1000),
          metadataURI: details.metadataURI,
          owner,
          metadata,
        }
      } catch (err) {
        console.error("Error getting property details:", err)
        setError("Failed to get property details")
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [contractAddress, isConnected, config],
  )

  // Get all properties
  const getAllProperties = useCallback(async (): Promise<PropertyWithMetadata[]> => {
    if (!contractAddress || !isConnected || !allTokenIds) return []

    try {
      setIsLoading(true)
      setError(null)

      const properties = await Promise.all(
        allTokenIds.map(async (tokenId) => {
          return await getPropertyDetails(tokenId)
        }),
      )

      return properties.filter((p): p is PropertyWithMetadata => p !== null)
    } catch (err) {
      console.error("Error getting all properties:", err)
      setError("Failed to get properties")
      return []
    } finally {
      setIsLoading(false)
    }
  }, [contractAddress, isConnected, allTokenIds, getPropertyDetails])

  // Get properties owned by current user
  const getMyProperties = useCallback(async (): Promise<PropertyWithMetadata[]> => {
    if (!contractAddress || !isConnected || !address || !allTokenIds) return []

    try {
      setIsLoading(true)
      setError(null)

      const properties = await Promise.all(
        (allTokenIds as bigint[]).map(async (tokenId) => {
          const owner = await readContract(config, {
            address: contractAddress,
            abi: RealEstateERC721ABI,
            functionName: "ownerOf",
            args: [tokenId],
          }) as string

          if (owner.toLowerCase() === address.toLowerCase()) {
            return await getPropertyDetails(tokenId)
          }
          return null
        }),
      )

      return properties.filter((p): p is PropertyWithMetadata => p !== null)
    } catch (err) {
      console.error("Error getting my properties:", err)
      setError("Failed to get your properties")
      return []
    } finally {
      setIsLoading(false)
    }
  }, [contractAddress, isConnected, address, allTokenIds, getPropertyDetails, config])

  // Mint a new property
  const mintProperty = useCallback(
    async (
      propertyData: {
        cadastralNumber: string
        location: string
        valuation: string
        name: string
        description: string
        image: string
        attributes?: Array<{
          trait_type: string
          value: string | number
        }>
      },
      onSuccess?: (tokenId: bigint) => void,
    ) => {
      if (!contractAddress || !isConnected || !address) {
        setError("Wallet not connected")
        return null
      }

      try {
        setIsLoading(true)
        setError(null)

        // Create metadata
        const metadata = {
          ...DEFAULT_METADATA_TEMPLATE,
          name: propertyData.name,
          description: propertyData.description,
          image: propertyData.image,
          attributes: propertyData.attributes || DEFAULT_METADATA_TEMPLATE.attributes,
        }

        const metadataURI = `ipfs://QmbAP3QH6n3G6YSw8LHNU1YNE2YajxshbNeNdMdh4J9qXt/${propertyData.cadastralNumber}`

        // Call the contract to mint the property
        const { hash } : any = writeContract({
          address: contractAddress,
          abi: RealEstateERC721ABI,
          functionName: "mintProperty",
          args: [
            address as `0x${string}`,
            propertyData.cadastralNumber,
            propertyData.location,
            parseEther(propertyData.valuation),
            metadataURI,
          ],
        })

        if (onSuccess) {
          // Wait for transaction confirmation
          const receipt = await waitForTransactionReceipt(config, { hash })
          // In a real app, you would get the token ID from the event logs
          onSuccess(BigInt(Date.now()))
        }

        return true
      } catch (err) {
        console.error("Error minting property:", err)
        setError("Failed to mint property")
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [contractAddress, isConnected, address],
  )

  // Update property status (active/inactive)
  const updatePropertyStatus = useCallback(
    async (tokenId: bigint, active: boolean) => {
      if (!contractAddress || !isConnected) {
        setError("Wallet not connected")
        return false
      }

      try {
        setIsLoading(true)
        setError(null)

        const { hash } : any = await writeContract({
          address: contractAddress,
          abi: RealEstateERC721ABI,
          functionName: "setPropertyStatus",
          args: [tokenId, active],
        })

        // Wait for transaction confirmation
        await waitForTransactionReceipt(config, { hash })
        return true
      } catch (err) {
        console.error("Error updating property status:", err)
        setError("Failed to update property status")
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [contractAddress, isConnected, config],
  )

  // Update property valuation
  const updatePropertyValuation = useCallback(
    async (tokenId: bigint, newValuation: string) => {
      if (!contractAddress || !isConnected) {
        setError("Wallet not connected")
        return false
      }

      try {
        setIsLoading(true)
        setError(null)

        const { hash } :any = await writeContract({
          address: contractAddress,
          abi: RealEstateERC721ABI,
          functionName: "updatePropertyValuation",
          args: [tokenId, parseEther(newValuation)],
        })

        // Wait for transaction confirmation
        await waitForTransactionReceipt(config, { hash })
        return true
      } catch (err) {
        console.error("Error updating property valuation:", err)
        setError("Failed to update property valuation")
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [contractAddress, isConnected, config],
  )

  // Transfer property to another address
  const transferProperty = useCallback(
    async (tokenId: bigint, toAddress: `0x${string}`) => {
      if (!contractAddress || !isConnected || !address) {
        setError("Wallet not connected")
        return false
      }

      try {
        setIsLoading(true)
        setError(null)

        const { hash } : any = writeContract({
          address: contractAddress,
          abi: RealEstateERC721ABI,
          functionName: "safeTransferFrom",
          args: [address as `0x${string}`, toAddress, tokenId],
        })

        // Wait for transaction confirmation
        await waitForTransactionReceipt(config, { hash })
        return true
      } catch (err) {
        console.error("Error transferring property:", err)
        setError("Failed to transfer property")
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [contractAddress, isConnected, address, config],
  )

  return {
    contractAddress,
    isLoading: isLoading || isPending || isWaitingForReceipt,
    isSuccess,
    error,
    txHash,
    receipt,
    getPropertyDetails,
    getAllProperties,
    getMyProperties,
    mintProperty,
    updatePropertyStatus,
    updatePropertyValuation,
    transferProperty,
    refetchAllTokenIds,
  }
}
