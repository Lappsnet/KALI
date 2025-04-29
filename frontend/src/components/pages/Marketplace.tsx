"use client"

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { useRealEstateContract } from '../hooks/useRealEstateContract'
import { PropertyCard } from '../../components/PropertyCard'
import { mockProperties } from '../../mocks/loanData'
import { formatEther } from 'viem'
import { Search } from 'lucide-react'

interface Property {
  tokenId: bigint
  owner: string | null
  metadata: {
    name: string
    image: string
  }
  cadastralNumber: string
  location: string
  valuation: bigint
  status: 'active' | 'inactive'
  active: boolean
  lastUpdated: bigint
  metadataURI: string
}

export const Marketplace = () => {
  const { isConnected } = useAccount()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'sale' | 'rent' | 'fractional'>('all')

  const { getPropertyDetails, getOwnerOf } = useRealEstateContract()

  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true)
        setError(null)

        let loadedProperties: Property[] = []

        if (isConnected) {
          try {

            for (const mockProp of mockProperties) {
              const tokenId = BigInt(mockProp.tokenId)
              const propertyDetails = await getPropertyDetails(tokenId)
              const owner = await getOwnerOf(tokenId)
              
              if (propertyDetails) {
                loadedProperties.push({
                  tokenId,
                  owner: owner || null,
                  metadata: {
                    name: mockProp.metadata.name,
                    image: mockProp.metadata.image
                  },
                  cadastralNumber: propertyDetails.cadastralNumber,
                  location: propertyDetails.location,
                  valuation: propertyDetails.valuation,
                  status: propertyDetails.status,
                  active: propertyDetails.active,
                  lastUpdated: propertyDetails.lastUpdated,
                  metadataURI: propertyDetails.metadataURI
                })
              }
            }
          } catch (err) {
            console.error('Error loading properties from contract:', err)
          }
        }

        if (loadedProperties.length === 0) {
          loadedProperties = mockProperties.map(mockProp => ({
            tokenId: BigInt(mockProp.tokenId),
            owner: null,
            metadata: {
              name: mockProp.metadata.name,
              image: mockProp.metadata.image
            },
            cadastralNumber: mockProp.cadastralNumber,
            location: mockProp.location,
            valuation: BigInt(mockProp.valuation),
            status: 'active',
            active: true,
            lastUpdated: BigInt(Date.now()),
            metadataURI: ''
          }))
        }

        setProperties(loadedProperties)
      } catch (err) {
        setError('Failed to load properties')
        console.error('Error loading properties:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProperties()
  }, [isConnected])

  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.metadata.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.cadastralNumber.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'sale' && !property.owner) ||
      (selectedFilter === 'rent' && property.owner) ||
      (selectedFilter === 'fractional' && property.owner)

    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="loading-container">
        <div className="animate-spin">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>RWA Marketplace</h1>
        <p>Browse and manage your RWA listings</p>
        <br /> <br />

        <div className="marketplace-actions"></div>
        <div className="search-filter">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-buttons">
            <button 
              className={`button ${selectedFilter === 'all' ? 'button-primary' : 'button-outline'}`}
              onClick={() => setSelectedFilter('all')}
            >
              All
            </button>
            <button 
              className={`button ${selectedFilter === 'sale' ? 'button-primary' : 'button-outline'}`}
              onClick={() => setSelectedFilter('sale')}
            >
              For Sale
            </button>
            <button 
              className={`button ${selectedFilter === 'rent' ? 'button-primary' : 'button-outline'}`}
              onClick={() => setSelectedFilter('rent')}
            >
              For Rent
            </button>
            <button 
              className={`button ${selectedFilter === 'fractional' ? 'button-primary' : 'button-outline'}`}
              onClick={() => setSelectedFilter('fractional')}
            >
              Fractional Ownership
            </button>
          </div>
        </div>
      </div>

      <div className="properties-grid">
        {filteredProperties.map((property) => {
          const mockProperty = mockProperties.find(p => p.tokenId === property.tokenId)
          return (
            <PropertyCard
              key={property.tokenId.toString()}
              tokenId={property.tokenId}
              title={property.metadata.name}
              address={property.location}
              price={`${formatEther(property.valuation)} ETH`}
              image={property.metadata.image}
              status={property.owner ? 'Owned' : 'For Sale'}
              investmentDetails={mockProperty?.investmentDetails}
            />
          )
        })}
      </div>
    </div>
  )
}
