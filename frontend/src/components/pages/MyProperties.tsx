"use client"

import { useState, useEffect } from "react"
import { useAppKitAccount } from "@reown/appkit/react"
import { Building, DollarSign, MapPin, Calendar } from "lucide-react"
import { useRealEstateContract } from "../hooks/useRealEstateContract"
import { formatEther } from "viem"

interface Property {
  tokenId: string
  title: string
  description: string
  price: string
  location: string
  status: "available" | "rented" | "sold"
  image: string
}

export const MyProperties = () => {
  const { isConnected, address } = useAppKitAccount()
  const { getPropertiesByOwner } = useRealEstateContract()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        if (!address) return
        const userProperties = await getPropertiesByOwner(address)
        setProperties(userProperties)
      } catch (err) {
        setError("Failed to fetch properties")
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [address, getPropertiesByOwner])

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

  if (loading) return <div className="loading">Loading your properties...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Properties</h1>
        <p>Manage your real estate assets</p>
      </div>

      <div className="properties-grid">
        {properties.map((property) => (
          <div key={property.tokenId} className="property-card">
            <div className="property-image">
              <img src={property.image} alt={property.title} />
              <span className={`status-badge ${property.status}`}>{property.status}</span>
            </div>
            <div className="property-details">
              <h3>{property.title}</h3>
              <p>{property.description}</p>
              <div className="property-info">
                <div className="info-item">
                  <DollarSign size={16} />
                  <span>{formatEther(BigInt(property.price))} ETH</span>
                </div>
                <div className="info-item">
                  <MapPin size={16} />
                  <span>{property.location}</span>
                </div>
                <div className="info-item">
                  <Calendar size={16} />
                  <span>Listed: {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="property-actions">
              <button className="action-button view">View Details</button>
              <button className="action-button edit">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 