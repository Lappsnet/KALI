"use client"

import { type Address } from "viem"
import { type PropertyDetails } from "./hooks/useRealEstateContract"
import { formatEther } from "viem"

interface PropertyCardProps {
  tokenId: bigint
  owner: Address | null
  details: PropertyDetails | null
  onClick?: () => void
}

export const PropertyCard = ({ tokenId, owner, details, onClick }: PropertyCardProps) => {
  const status = owner ? "Owned" : "For Sale"
  const price = details ? `${formatEther(details.valuation)} ETH` : "N/A"
  const location = details?.location || "Unknown Location"
  const cadastralNumber = details?.cadastralNumber || "N/A"

  return (
    <div className="glass-card neon-border" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="property-image" style={{ position: 'relative', height: '200px', overflow: 'hidden', borderRadius: '1rem 1rem 0 0' }}>
        <img 
          src="/placeholder.svg" 
          alt={`Property ${tokenId.toString()}`} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div 
          className={`property-status ${status.toLowerCase().replace(" ", "-")}`}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            padding: '4px 8px',
            borderRadius: '4px',
            background: status === "Owned" ? 'var(--success-color)' : 'var(--primary-color)',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          {status}
        </div>
      </div>
      <div className="property-details" style={{ padding: '1rem' }}>
        <h3 className="property-title text-gradient" style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>
          Property #{tokenId.toString()}
        </h3>
        <p className="property-address" style={{ color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>
          {location}
        </p>
        <p className="property-cadastral" style={{ color: 'var(--text-muted)', margin: '0 0 0.5rem 0', fontSize: '0.875rem' }}>
          Cadastral: {cadastralNumber}
        </p>
        <div className="property-price" style={{ 
          color: 'var(--text-primary)', 
          fontWeight: '600',
          fontSize: '1.125rem'
        }}>
          {price}
        </div>
      </div>
    </div>
  )
}
