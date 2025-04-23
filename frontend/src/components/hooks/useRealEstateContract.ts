
"use client"

import { useCallback, useState, useEffect } from "react"
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react"
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useConfig } from "wagmi"
import { readContract } from "@wagmi/core"
import { formatEther, parseEther, decodeEventLog, Address, Hex } from "viem"
import RealEstateERC721ABI from "../abis/RealEstateERC721.abi.json"
import { CONTRACT_ADDRESSES, IPFS_GATEWAY } from "../../config/index.ts"

type PropertyDetailsTuple = readonly [string, string, bigint, boolean, bigint, string];

export interface PropertyDetails {
  cadastralNumber: string;
  location: string;
  valuation: bigint;
  active: boolean;
  lastUpdated: bigint;
  metadataURI: string;
}

export interface PropertyWithMetadata extends PropertyDetails {
  tokenId: bigint;
  valuationFormatted: string;
  lastUpdatedDate: Date;
  owner: Address;
  metadata: { name: string; description: string; image: string; attributes: Array<{ trait_type: string; value: string | number; }>; } | null;
}

interface PropertyMintedEventArgs { tokenId?: bigint; }
interface TransferEventArgs { from?: Address; to?: Address; tokenId?: bigint; }

type MintCallbacks = {
    onSuccess?: (tokenId: bigint, hash: `0x${string}`) => void;
    onError?: (errorMsg: string) => void;
}

export function useRealEstateContract() {
  const { address, isConnected } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()
  const config = useConfig()
  const [isReadLoading, setIsReadLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTxCallbacks, setCurrentTxCallbacks] = useState<MintCallbacks>({});

  const contractAddress = chainId
    ? CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.realEstateERC721
    : undefined

  const {
    writeContract,
    isPending: isWritePending,
    data: txHash,
    reset: resetWriteContract,
    error: writeError,
  } = useWriteContract()

  const {
    data: receipt,
    isLoading: isReceiptLoading,
    isSuccess: isTxSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash: txHash });

  const { data: allTokenIds, refetch: refetchAllTokenIds, isLoading: isTokenIdsLoading } = useReadContract({
    address: contractAddress,
    abi: RealEstateERC721ABI,
    functionName: "getAllTokenIds",
    query: { enabled: !!contractAddress && isConnected },
  })

  const getPropertyDetails = useCallback(
    async (tokenId: bigint): Promise<PropertyWithMetadata | null> => {
      if (!contractAddress || !isConnected || !config) return null;
      setIsReadLoading(true);
      setError(null);
      try {
        const [propertyDetailsResult, ownerResult] = await Promise.all([
          readContract(config, { address: contractAddress, abi: RealEstateERC721ABI, functionName: "getPropertyDetails", args: [tokenId] }),
          readContract(config, { address: contractAddress, abi: RealEstateERC721ABI, functionName: "ownerOf", args: [tokenId] }),
        ]);
        const detailsTuple = propertyDetailsResult as PropertyDetailsTuple;
        const owner = ownerResult as Address;
        const propertyData: PropertyDetails = { cadastralNumber: detailsTuple[0], location: detailsTuple[1], valuation: detailsTuple[2], active: detailsTuple[3], lastUpdated: detailsTuple[4], metadataURI: detailsTuple[5] };
        let metadata = null;
        if (propertyData.metadataURI && propertyData.metadataURI.startsWith('ipfs://')) { // Only fetch valid IPFS URIs
          try {
            const metadataUrl = propertyData.metadataURI.replace("ipfs://", IPFS_GATEWAY);
            const response = await fetch(metadataUrl);
            if (!response.ok) {
                 console.error(`Error fetch metadata: ${response.status} ${metadataUrl}`);
                 throw new Error(`HTTP error ${response.status}`);
            }
            metadata = await response.json();
          } catch (err) {
            console.error(`Failed fetch/parse metadata ${propertyData.metadataURI}:`, err);
          }
        } else if (propertyData.metadataURI) {
             console.warn(`Metadata URI is not an IPFS URI: ${propertyData.metadataURI}`);
        }
        return { ...propertyData, tokenId, valuationFormatted: formatEther(propertyData.valuation), lastUpdatedDate: new Date(Number(propertyData.lastUpdated) * 1000), owner, metadata };
      } catch (error: any) {
        console.error(`Error getPropertyDetails token ${tokenId}:`, error);
        setError(`Failed to get property details: ${error.message || ''}`);
        return null;
      } finally {
        setIsReadLoading(false);
      }
    },
    [contractAddress, isConnected, config] // Added IPFS_GATEWAY implicitly
  );

  const getAllProperties = useCallback(async (): Promise<PropertyWithMetadata[]> => {
    if (!contractAddress || !isConnected || !allTokenIds || !Array.isArray(allTokenIds) || allTokenIds.length === 0) return [];
    setIsReadLoading(true);
    setError(null);
    try {
      const properties = await Promise.all((allTokenIds as bigint[]).map(tokenId => getPropertyDetails(tokenId)));
      return properties.filter((p): p is PropertyWithMetadata => p !== null);
    } catch (err: any) {
      console.error("Error getAllProperties:", err);
      setError(`Failed to get all properties: ${err.message || ''}`);
      return [];
    } finally {
      setIsReadLoading(false);
    }
  }, [contractAddress, isConnected, allTokenIds, getPropertyDetails]);

  const getMyProperties = useCallback(async (): Promise<PropertyWithMetadata[]> => {
    if (!isConnected || !address) return [];
    setError(null);
    try {
      const allProps = await getAllProperties();
      return allProps.filter(prop => prop.owner.toLowerCase() === address.toLowerCase());
    } catch (err: any) {
      console.error("Error getMyProperties:", err);
      setError(`Failed to get your properties: ${err.message || ''}`);
      return [];
    }
  }, [address, isConnected, getAllProperties]);

  // --- Write Functions ---

  const mintProperty = useCallback(
    async (
      propertyArgs: { cadastralNumber: string; location: string; valuation: string; },
      metadataUri: string,
      onSuccess?: (tokenId: bigint, hash: `0x${string}`) => void,
      onError?: (errorMsg: string) => void
    ): Promise<boolean> => {
      const prerequisitesMet = contractAddress && isConnected && address && config && writeContract;
      if (!prerequisitesMet) {
        const msg = "Cannot mint: Wallet not connected or configuration missing.";
        setError(msg);
        if (onError) onError(msg);
        return false;
      }

      setError(null);
      resetWriteContract();
      setCurrentTxCallbacks({ onSuccess, onError }); // Store callbacks specifically for this mint tx

      try {
        writeContract({
          address: contractAddress,
          abi: RealEstateERC721ABI,
          functionName: "mintProperty",
          args: [
            address,
            propertyArgs.cadastralNumber,
            propertyArgs.location,
            parseEther(propertyArgs.valuation),
            metadataUri,
          ],
        });
        return true;
      } catch (err: any) {
        console.error("Error submitting mint tx:", err);
        const errorMsg = `Failed to submit mint transaction: ${err.message || err}`;
        setError(errorMsg);
        if (onError) onError(errorMsg);
        setCurrentTxCallbacks({});
        return false;
      }
    },
    [contractAddress, isConnected, address, config, writeContract, resetWriteContract, setCurrentTxCallbacks]
  );

  const updatePropertyStatus = useCallback(
    async (tokenId: bigint, active: boolean): Promise<boolean> => {
      const prerequisitesMet = contractAddress && isConnected && address && config && writeContract;
      if (!prerequisitesMet) {
        setError("Cannot update status: prerequisites missing.");
        return false;
      }
      setError(null);
      resetWriteContract();
      setCurrentTxCallbacks({}); // Clear any pending mint callbacks

      try {
        writeContract({
          address: contractAddress,
          abi: RealEstateERC721ABI,
          functionName: "setPropertyStatus",
          args: [tokenId, active],
        });
        return true;
      } catch (err: any) {
        console.error("Error submitting update status tx:", err);
        setError(`Failed to submit update status transaction: ${err.message || err}`);
        return false;
      }
    },
    [contractAddress, isConnected, address, config, writeContract, resetWriteContract, setCurrentTxCallbacks]
  );

  const updatePropertyValuation = useCallback(
    async (tokenId: bigint, newValuation: string): Promise<boolean> => {
       const prerequisitesMet = contractAddress && isConnected && address && config && writeContract;
       if (!prerequisitesMet) {
         setError("Cannot update valuation: prerequisites missing.");
         return false;
       }
      setError(null);
      resetWriteContract();
      setCurrentTxCallbacks({});

      try {
        writeContract({
          address: contractAddress,
          abi: RealEstateERC721ABI,
          functionName: "updatePropertyValuation",
          args: [tokenId, parseEther(newValuation)],
        });
        return true;
      } catch (err: any) {
        console.error("Error submitting update valuation tx:", err);
        setError(`Failed to submit update valuation transaction: ${err.message || err}`);
        return false;
      }
    },
    [contractAddress, isConnected, address, config, writeContract, resetWriteContract, setCurrentTxCallbacks]
  );

  const transferProperty = useCallback(
    async (tokenId: bigint, toAddress: Address): Promise<boolean> => {
      const prerequisitesMet = contractAddress && isConnected && address && config && writeContract;
      if (!prerequisitesMet) {
        setError("Cannot transfer: prerequisites missing.");
        return false;
      }
      if (address.toLowerCase() === toAddress.toLowerCase()) {
          setError("Cannot transfer property to yourself.");
          return false;
      }
      setError(null);
      resetWriteContract();
      setCurrentTxCallbacks({});

      try {
        writeContract({
          address: contractAddress,
          abi: RealEstateERC721ABI,
          functionName: "safeTransferFrom",
          args: [address, toAddress, tokenId],
        });
        return true;
      } catch (err: any) {
        console.error("Error submitting transfer tx:", err);
        setError(`Failed to submit transfer transaction: ${err.message || err}`);
        return false;
      }
    },
    [contractAddress, isConnected, address, config, writeContract, resetWriteContract, setCurrentTxCallbacks]
  );

   // Effect to handle transaction result (primarily for mintProperty callbacks)
   useEffect(() => {
      const { onSuccess, onError } = currentTxCallbacks; // Get callbacks stored for the current tx attempt

      // Check if the completed transaction matches the hash we are tracking
      // and if the callbacks are still relevant for this hash
      if (txHash && receipt && receipt.transactionHash === txHash) {
         if (isTxSuccess) {
            // Transaction succeeded, try to parse logs for minting
            let mintedTokenId: bigint | null = null;
            try {
               for (const log of receipt.logs) {
                  try {
                      const decodedEvent = decodeEventLog({ abi: RealEstateERC721ABI, data: log.data as Hex, topics: log.topics as [Hex, ...Hex[]] });
                      if (decodedEvent.eventName === 'PropertyMinted') {
                          mintedTokenId = (decodedEvent.args as PropertyMintedEventArgs).tokenId ?? null;
                          if (mintedTokenId !== null) break;
                      } else if (decodedEvent.eventName === 'Transfer') {
                          const args = decodedEvent.args as TransferEventArgs;
                          if (args.from === '0x0000000000000000000000000000000000000000') {
                              mintedTokenId = args.tokenId ?? null;
                              if (mintedTokenId !== null) break;
                          }
                      }
                  } catch { /* Ignore logs that don't match */ }
               }

               // Call onSuccess only if it exists and we found a token ID
               if (mintedTokenId !== null && onSuccess) {
                   onSuccess(mintedTokenId, receipt.transactionHash);
                   refetchAllTokenIds(); // Good place to refetch after mint
               } else if (mintedTokenId === null && onSuccess) {
                    // Tx succeeded but couldn't find ID - might be non-mint tx or log issue
                   console.warn("Transaction successful but couldn't parse mint Token ID from logs.");
                   // Decide if onSuccess should still be called, maybe without tokenId
                   // onSuccess(BigInt(-1), receipt.transactionHash); // Example: Indicate success but no ID found
               } else if (mintedTokenId === null && !onSuccess) {
                    // Tx succeeded, maybe not a mint, no specific callback needed
               }

            } catch(parseError: any) {
                console.error("Error parsing logs:", parseError);
                if(onError) onError(`Transaction successful, but failed to parse events: ${parseError.message}`);
            } finally {
                resetWriteContract();
                setCurrentTxCallbacks({}); // Clear callbacks after handling
            }

         } else { // Transaction failed (isTxSuccess is false but receipt exists)
            const errorMsg = `Transaction failed (receipt status: ${receipt.status})`;
            console.error(errorMsg, receipt);
            setError(errorMsg);
            if (onError) onError(errorMsg);
            resetWriteContract();
            setCurrentTxCallbacks({});
         }
      } else if (receiptError || writeError) {
          // Error occurred before getting receipt or during wait
          const errorMsg = `Transaction error: ${ (receiptError || writeError)?.message || 'Unknown error'}`;
          console.error(errorMsg, receiptError || writeError);
          setError(errorMsg);
          if (onError) onError(errorMsg);
          resetWriteContract();
          setCurrentTxCallbacks({});
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipt, isTxSuccess, receiptError, writeError, txHash]); // Dependencies focus on tx outcome


  return {
    contractAddress,
    isLoading: isReadLoading || isTokenIdsLoading || isWritePending || isReceiptLoading,
    isReading: isReadLoading || isTokenIdsLoading,
    isWriting: isWritePending || isReceiptLoading,
    isConfirming: isWritePending,
    isProcessing: isReceiptLoading,
    isSuccess: isTxSuccess,
    error: error || writeError?.message || receiptError?.message,
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
    clearError: () => setError(null),
    resetWriteState: resetWriteContract,
  };
}