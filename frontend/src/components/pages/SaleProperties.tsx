"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAppKitAccount } from "@reown/appkit/react"
import { PropertyCard } from "../../components/PropertyCard"
import { ActionButton } from "../ActionButton"
import { DollarSign, Plus, Loader, FileText } from "lucide-react"
import { useRealEstateContract } from "../hooks/useRealEstateContract"
import { useRealEstateSaleContract } from "../hooks/useRealEstateSaleContract"
import { formatEther } from "viem"
import "../../styles/SaleProperties.css"

export const SaleProperties = () => {
  const { isConnected } = useAppKitAccount()
  const { getMyProperties } = useRealEstateContract()
  const { createSale, isLoading: isLoadingSale } = useRealEstateSaleContract()

  const [properties, setProperties] = useState<any[]>([])
  const [showListModal, setShowListModal] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null)
  const [listingPrice, setListingPrice] = useState("")
  const [saleDocument, setSaleDocument] = useState("")
  const [isLoadingData, setIsLoadingData] = useState(false)

  useEffect(() => {
    if (isConnected) {
      loadProperties()
    }
  }, [isConnected])

  const loadProperties = async () => {
    setIsLoadingData(true)
    try {
      const myProperties = await getMyProperties()
      setProperties(myProperties)
    } catch (error) {
      console.error("Error loading properties:", error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedProperty) return

    try {
      const saleDocumentURI = `ipfs:// ${selectedProperty.tokenId.toString()}`

      await createSale(selectedProperty.tokenId, listingPrice, saleDocumentURI, (saleId) => {
        console.log("Sale created with ID:", saleId.toString())
        loadProperties()
      })

      setShowListModal(false)
      setSelectedProperty(null)
    } catch (error) {
      console.error("Error creating sale:", error)
    }
  }

  if (!isConnected) {
    return (
      <div className="page-container">
        <div className="connect-prompt">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to view your properties</p>
          <appkit-button />
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1></h1>
        <p>Manage your property listings</p>
      </div>

      <div className="section-actions">
        <ActionButton onClick={() => (window.location.href = "/dashboard/list-properties")}>
          <Plus size={16} />
          <span>Mint New Property</span>
        </ActionButton>
      </div>

      {isLoadingData ? (
        <div className="loading-container">
          <Loader className="animate-spin" size={32} />
          <p>Loading your properties...</p>
        </div>
      ) : properties.length > 0 ? (
        <div className="properties-grid">
          {properties.map((property) => (
            <PropertyCard
              key={property.tokenId.toString()}
              title={property.metadata?.name || property.cadastralNumber}
              address={property.location}
              price={`${formatEther(property.valuationRaw)} ETH`}
              image={property.metadata?.image || "/suburban-house-exterior.png"}
              status={property.active ? "For Sale" : "Owned"}
              tokenId={property.tokenId}
            />
          ))}
        </div>
      ) : (
        <div className="no-properties">
          <div className="glass-card">
            <h3>No Properties Found</h3>
            <p>You don't have any properties yet. Mint a new property to get started.</p>
            <ActionButton onClick={() => (window.location.href = "/dashboard/mint-properties")}>
              <Plus size={16} />
              <span>Mint New Property</span>
            </ActionButton>
          </div>
        </div>
      )}

      {showListModal && selectedProperty && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <h3>Create Property Sale</h3>

            <div className="property-preview">
              <img
                src={selectedProperty.metadata?.image || "/placeholder.svg?height=100&width=100&query=property"}
                alt={selectedProperty.metadata?.name || selectedProperty.cadastralNumber}
              />
              <div className="property-preview-details">
                <h4>{selectedProperty.metadata?.name || selectedProperty.cadastralNumber}</h4>
                <p>{selectedProperty.location}</p>
              </div>
            </div>

            <form className="list-form" onSubmit={handleCreateSale}>
              <div className="form-group">
                <label htmlFor="listingPrice">Listing Price (ETH)</label>
                <input
                  type="number"
                  id="listingPrice"
                  name="listingPrice"
                  placeholder="e.g. 1.5"
                  step="0.01"
                  min="0"
                  value={listingPrice}
                  onChange={(e) => setListingPrice(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="saleDocument">Sale Document (Optional)</label>
                <textarea
                  id="saleDocument"
                  name="saleDocument"
                  placeholder="Enter any additional terms or conditions for the sale..."
                  rows={4}
                  value={saleDocument}
                  onChange={(e) => setSaleDocument(e.target.value)}
                />
                <p className="form-hint">
                  <FileText size={14} className="inline-icon" /> This document will be stored on IPFS and linked to the
                  sale.
                </p>
              </div>

              <div className="form-actions">
                <ActionButton variant="outline" onClick={() => setShowListModal(false)}>
                  Cancel
                </ActionButton>
                <ActionButton disabled={isLoadingSale}>
                  <DollarSign size={16} />
                  <span>{isLoadingSale ? "Processing..." : "Create Sale"}</span>
                </ActionButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
