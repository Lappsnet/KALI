"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAppKitAccount } from "@reown/appkit/react"
import { PropertyCard } from "../PropertyCard"
import { ActionButton } from "../ActionButton"
import { Search, Filter, Loader } from "lucide-react"
import { useRealEstateContract, type PropertyWithMetadata } from "../hooks/useRealEstateContract"
import { useRealEstateSaleContract } from "../hooks/useRealEstateSaleContract"
import { formatEther } from "viem"
import { mockProperties } from "../../data/mockProperties"

export const Marketplace = () => {
  const navigate = useNavigate()
  const { isConnected } = useAppKitAccount()
  const { getAllProperties, isLoading: isLoadingProperties } = useRealEstateContract()
  const { getActiveSaleForProperty, isLoading: isLoadingSales } = useRealEstateSaleContract()

  const [searchTerm, setSearchTerm] = useState("")
  const [properties, setProperties] = useState<PropertyWithMetadata[]>([])
  const [filteredProperties, setFilteredProperties] = useState<PropertyWithMetadata[]>([])
  const [sortOrder, setSortOrder] = useState<"lowToHigh" | "highToLow" | "">("")
  const [isLoadingData, setIsLoadingData] = useState(false)

  useEffect(() => {
    if (isConnected) {
      loadProperties()
    }
  }, [isConnected])

  useEffect(() => {
    // Filter properties based on search term
    const filtered = properties.filter(
      (property) =>
        (property.metadata?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.cadastralNumber.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Sort properties if needed
    const sorted = [...filtered]
    if (sortOrder === "lowToHigh") {
      sorted.sort((a, b) => Number(a.valuationRaw - b.valuationRaw))
    } else if (sortOrder === "highToLow") {
      sorted.sort((a, b) => Number(b.valuationRaw - a.valuationRaw))
    }

    setFilteredProperties(sorted)
  }, [properties, searchTerm, sortOrder])

  const loadProperties = async () => {
    setIsLoadingData(true)
    try {
      const allProperties = await getAllProperties()

      // Check which properties have active sales
      const propertiesWithSaleStatus = await Promise.all(
        allProperties.map(async (property) => {
          const saleId = await getActiveSaleForProperty(property.tokenId)
          return {
            ...property,
            hasActiveSale: saleId !== null && saleId > 0n,
          }
        }),
      )

      // Filter only properties with active sales for the marketplace
      const activeProperties = propertiesWithSaleStatus.filter((p) => p.hasActiveSale)
      
      // If no properties from contract, use mock data
      if (activeProperties.length === 0) {
        setProperties(mockProperties)
        setFilteredProperties(mockProperties)
      } else {
        setProperties(activeProperties)
        setFilteredProperties(activeProperties)
      }
    } catch (error) {
      console.error("Error loading properties:", error)
      // Fallback to mock data on error
      setProperties(mockProperties)
      setFilteredProperties(mockProperties)
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleSort = (order: "lowToHigh" | "highToLow") => {
    setSortOrder(order)
  }

  const handlePropertyClick = (property: PropertyWithMetadata) => {
    navigate(`/property/${property.tokenId}`)
  }

  if (!isConnected) {
    return (
      <div className="page-container">
        <div className="connect-prompt">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to browse the marketplace</p>
          <appkit-button />
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Marketplace</h1>
        <p>Browse and purchase tokenized properties</p>
      </div>

      <div className="marketplace-filters">
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search properties..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <ActionButton variant="outline" size="small">
            <Filter size={16} />
            <span>Filter</span>
          </ActionButton>
          <ActionButton
            variant={sortOrder === "lowToHigh" ? "primary" : "outline"}
            size="small"
            onClick={() => handleSort("lowToHigh")}
          >
            Price: Low to High
          </ActionButton>
          <ActionButton
            variant={sortOrder === "highToLow" ? "primary" : "outline"}
            size="small"
            onClick={() => handleSort("highToLow")}
          >
            Price: High to Low
          </ActionButton>
        </div>
      </div>

      {isLoadingData ? (
        <div className="loading-container">
          <Loader className="animate-spin" size={32} />
          <p>Loading properties...</p>
        </div>
      ) : filteredProperties.length > 0 ? (
        <div className="properties-grid">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.tokenId.toString()}
              title={property.metadata?.name || property.cadastralNumber}
              address={property.location}
              price={`${property.valuation} ETH`}
              image={property.metadata?.image || "/suburban-house-exterior.png"}
              status="For Sale"
              onClick={() => handlePropertyClick(property)}
            />
          ))}
        </div>
      ) : (
        <div className="no-results">
          {searchTerm ? (
            <p>No properties found matching your search criteria.</p>
          ) : (
            <p>No properties are currently listed for sale.</p>
          )}
        </div>
      )}
    </div>
  )
}
