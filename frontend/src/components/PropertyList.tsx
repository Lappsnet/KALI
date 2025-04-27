"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { useRealEstateContract, type PropertyDetails } from "./hooks/useRealEstateContract";
import { PropertyCard } from "./PropertyCard";
import { Button } from "./common/Button";
import { LoadingSpinner } from "./common/LoadingSpinner";
import { ErrorMessage } from "./common/ErrorMessage";
import { MintProperties } from "./pages/MintProperties";
import { type Address } from "viem";

interface DisplayProperty {
  tokenId: bigint;
  owner: Address | null;
  details: PropertyDetails | null;
}

export const PropertyList = () => {
  const { address, isConnected } = useAppKitAccount();
  const {
    getAllTokenIds,
    getPropertyDetails,
    getOwnerOf,
    isReading,
    error: hookError
  } = useRealEstateContract();

  const [properties, setProperties] = useState<DisplayProperty[]>([]);
  const [viewMode, setViewMode] = useState<"all" | "my">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    if (!isConnected) {
        setProperties([]);
        return;
    }
    setLoadingMessage("Fetching token IDs...");
    setFetchError(null);
    setProperties([]);

    const allIds = await getAllTokenIds();
    if (!allIds) {
      setFetchError(hookError instanceof Error ? hookError.message : hookError || "Failed to fetch token IDs.");
      setLoadingMessage("");
      return;
    }
     if (allIds.length === 0) {
       setLoadingMessage("No properties found on the contract.");
       return;
     }

    setLoadingMessage(`Found ${allIds.length} tokens. Fetching details...`);

    const propertiesData: DisplayProperty[] = [];
    let fetchedCount = 0;

    for (const tokenId of allIds) {
      try {
        const owner = await getOwnerOf(tokenId);
        let shouldInclude = false;

        if (viewMode === "all") {
          shouldInclude = true;
        } else if (viewMode === "my" && owner === address) {
          shouldInclude = true;
        }

        if (shouldInclude) {
          const details = await getPropertyDetails(tokenId);
          propertiesData.push({ tokenId, owner, details });
          fetchedCount++;
           setLoadingMessage(`Loading details... (${fetchedCount}/${viewMode === 'all' ? allIds.length : 'owned'})`);
        }
      } catch (err) {
         console.error(`Failed to fetch data for token ${tokenId}:`, err);
         setFetchError(`Failed to load some property details. Please refresh. Error: ${err instanceof Error ? err.message : 'Unknown'}`);
      }
    }

    setProperties(propertiesData);
    setLoadingMessage("");
     if (propertiesData.length === 0 && allIds.length > 0) {
         setLoadingMessage(viewMode === 'my' ? "You don't own any properties." : "No properties match the filter.");
     }

  }, [viewMode, getAllTokenIds, getPropertyDetails, getOwnerOf, address, isConnected, hookError]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleMintSuccess = () => {
    setShowCreateModal(false);
    setLoadingMessage("Mint successful! Refreshing list...");
    setTimeout(() => fetchProperties(), 2000);
  };

  return (
    <div className="property-list" style={styles.container}>
      <div className="property-list-header" style={styles.header}>
        <h2 className="text-gradient" style={styles.title}>
          {viewMode === "all" ? "All Properties" : "My Properties"}
        </h2>
        <div className="property-list-actions" style={styles.actions}>
          <button
            className="futuristic-button"
            onClick={() => setViewMode(viewMode === "all" ? "my" : "all")}
            disabled={isReading || loadingMessage !== ""}
            style={styles.button}
          >
            {viewMode === "all" ? "View My Properties" : "View All Properties"}
          </button>
          {/* Update button to show MintProperties modal */}
          <Button onClick={() => setShowCreateModal(true)} disabled={!isConnected}>
            Create Property
          </Button>
        </div>
      </div>

       {/* Modal for Minting - Basic Example (replace with actual modal component) */}
       {showCreateModal && (
         <div style={styles.modalBackdrop}>
            <div style={styles.modalContent}>
                <MintProperties
                    // Pass necessary props if MintProperties needs them
                    // Example prop to close modal on success (needs implementation in MintProperties)
                    // onSuccessCallback={handleMintSuccess}
                />
                <Button onClick={() => setShowCreateModal(false)} variant="secondary" style={{marginTop: '15px'}}>Close</Button>
            </div>
         </div>
       )}

      {/* Loading and Error Display */}
      {(isReading || loadingMessage) && (
        <div style={styles.loadingContainer}>
          <div className="animate-pulse" style={styles.loadingSpinner} />
          <p style={styles.loadingText}>{loadingMessage}</p>
        </div>
      )}
      {fetchError && (
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>{fetchError}</p>
        </div>
      )}
      {/* Display hookError separately if needed, e.g., for transaction errors */}
      {/* {hookError && !fetchError && <ErrorMessage message={`Contract Hook Error: ${hookError instanceof Error ? hookError.message : hookError}`} />} */}


      {/* Property Grid */}
      {!loadingMessage && properties.length > 0 && (
        <div className="grid" style={styles.grid}>
          {properties.map((prop) => (
            <PropertyCard
              key={prop.tokenId.toString()}
              tokenId={prop.tokenId}
              owner={prop.owner}
              details={prop.details}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loadingMessage && properties.length === 0 && (
        <div className="empty-state" style={styles.emptyState}>
          <p style={styles.emptyStateText}>No properties found for the selected view.</p>
        </div>
      )}
    </div>
  );
};

// Basic Inline Styles (Replace with your styling solution)
const styles: { [key: string]: React.CSSProperties } = {
    container: {
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        minHeight: '100vh'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
    },
    title: {
        fontSize: '2rem',
        fontWeight: '600',
        margin: '0'
    },
    actions: {
        display: 'flex',
        gap: '1rem'
    },
    button: {
        padding: '0.75rem 1.5rem'
    },
    grid: {
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '2rem'
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
    },
    loadingSpinner: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: 'var(--primary-color)',
        marginBottom: '1rem'
    },
    loadingText: {
        color: 'var(--text-secondary)',
        textAlign: 'center'
    },
    errorContainer: {
        padding: '1rem',
        backgroundColor: 'var(--error-color)',
        borderRadius: '0.5rem',
        marginBottom: '1rem'
    },
    errorText: {
        color: 'white',
        textAlign: 'center'
    },
    emptyState: {
        textAlign: 'center',
        padding: '4rem',
        color: 'var(--text-secondary)'
    },
    emptyStateText: {
        fontSize: '1.25rem'
    },
    modalBackdrop: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000},
    modalContent: { background: 'white', padding: '20px', borderRadius: '8px', maxHeight: '90vh', overflowY: 'auto'}
};