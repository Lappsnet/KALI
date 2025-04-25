import { useState, useEffect, useCallback } from 'react'
import { useRealEstateContract } from '../components/hooks/useRealEstateContract'
import { useRealEstateSaleContract } from '../components/hooks/useRealEstateSaleContract'
import { useLendingProtocolContract } from '../components/hooks/useLendingProtocolContract'
import { mockProperties } from '../mocks/loanData'
import { formatEther } from 'viem'

export interface MarketplaceProperty {
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
  salePrice?: bigint
  rentPrice?: bigint
  loanAmount?: bigint
}

export function useMarketplaceOrchestrator() {
  const [properties, setProperties] = useState<MarketplaceProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { getPropertyDetails, getOwnerOf } = useRealEstateContract()
  const { getActiveSale } = useRealEstateSaleContract()
  const { getActiveLoan } = useLendingProtocolContract()

  const loadProperties = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let loadedProperties: MarketplaceProperty[] = []

      try {
        // Load properties from contract
        for (const mockProp of mockProperties) {
          const tokenId = BigInt(mockProp.tokenId)
          const propertyDetails = await getPropertyDetails(tokenId)
          const owner = await getOwnerOf(tokenId)
          const sale = await getActiveSale(tokenId)
          const loan = await getActiveLoan(tokenId)
          
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
              metadataURI: propertyDetails.metadataURI,
              salePrice: sale?.price,
              rentPrice: sale?.price ? BigInt(Number(sale.price) / 100) : undefined, // 1% of sale price for rent
              loanAmount: loan?.amount
            })
          }
        }
      } catch (err) {
        console.error('Error loading properties from contract:', err)
      }

      // If no properties loaded from contract, use mock data
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
          metadataURI: '',
          salePrice: BigInt(mockProp.valuation),
          rentPrice: BigInt(Number(mockProp.valuation) / 100), // 1% of valuation for rent
          loanAmount: BigInt(Number(mockProp.valuation) / 2) // 50% of valuation for loan
        }))
      }

      setProperties(loadedProperties)
    } catch (err) {
      setError('Failed to load properties')
      console.error('Error loading properties:', err)
    } finally {
      setLoading(false)
    }
  }, [getPropertyDetails, getOwnerOf, getActiveSale, getActiveLoan])

  useEffect(() => {
    loadProperties()
  }, [loadProperties])

  const filterProperties = useCallback((searchQuery: string, selectedFilter: 'all' | 'sale' | 'rent' | 'fractional') => {
    return properties.filter(property => {
      const matchesSearch = 
        property.metadata.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.cadastralNumber.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesFilter = selectedFilter === 'all' || 
        (selectedFilter === 'sale' && property.salePrice) ||
        (selectedFilter === 'rent' && property.rentPrice) ||
        (selectedFilter === 'fractional' && property.loanAmount)

      return matchesSearch && matchesFilter
    })
  }, [properties])

  return {
    properties,
    loading,
    error,
    filterProperties,
    refresh: loadProperties
  }
} 