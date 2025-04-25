"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { useRealEstateContract } from '../hooks/useRealEstateContract'
import { useRealEstateSaleContract } from '../hooks/useRealEstateSaleContract'
import { getMockPropertyDetails } from '../../mocks/loanData'
import { formatEther } from 'viem'
import { ActionButton } from "../ActionButton"
import { DollarSign, Check, X, Loader, CreditCard } from "lucide-react"

interface PropertyDetails {
  tokenId: bigint
  owner: string | null
  metadata: {
    name: string
    description: string
    image: string
  }
  cadastralNumber: string
  location: string
  valuation: bigint
}

export const PropertyDetails = () => {
  const { propertyId } = useParams()
  const navigate = useNavigate()
  const { address, isConnected } = useAccount()
  const [property, setProperty] = useState<PropertyDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [salePrice, setSalePrice] = useState<bigint | null>(null)
  const [rentPrice, setRentPrice] = useState<bigint | null>(null)
  const [loanAmount, setLoanAmount] = useState<bigint | null>(null)
  const [isOwner, setIsOwner] = useState(false)

  const { getPropertyDetails, getOwnerOf } = useRealEstateContract()

  useEffect(() => {
    const loadPropertyDetails = async () => {
      if (!propertyId) {
        setError('Property ID is required')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const tokenId = BigInt(propertyId)
        let propertyDetails: PropertyDetails | null = null

        if (isConnected) {
          try {
            const details = await getPropertyDetails(tokenId)
            const owner = await getOwnerOf(tokenId)
            
            if (details) {
              propertyDetails = {
                tokenId,
                owner: owner || null,
                metadata: {
                  name: details.metadata?.name || 'Unknown Property',
                  description: details.metadata?.description || 'No description available',
                  image: details.metadata?.image || '/suburban-house-exterior.png'
                },
                cadastralNumber: details.cadastralNumber,
                location: details.location,
                valuation: details.valuation
              }
            }
          } catch (err) {
            console.error('Error loading property from contract:', err)
          }
        }

        // If no property loaded from contract, use mock data
        if (!propertyDetails) {
          const mockProperty = getMockPropertyDetails(tokenId)
          if (mockProperty) {
            propertyDetails = {
              tokenId,
              owner: null,
              metadata: {
                name: mockProperty.metadata.name,
                description: mockProperty.metadata.description,
                image: mockProperty.metadata.image
              },
              cadastralNumber: mockProperty.cadastralNumber,
              location: mockProperty.location,
              valuation: mockProperty.valuation
            }
          }
        }

        if (!propertyDetails) {
          setError('Property not found')
          return
        }

        setProperty(propertyDetails)
        setIsOwner(propertyDetails.owner === address)
      } catch (err) {
        setError('Failed to load property details')
        console.error('Error loading property:', err)
      } finally {
        setLoading(false)
      }
    }

    loadPropertyDetails()
  }, [propertyId, isConnected, address])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="animate-spin">Loading...</div>
        <p>Loading property details...</p>
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

  if (!property) {
    return (
      <div className="error">
        <p>Property not found</p>
      </div>
    )
  }

  return (
    <div className="property-details-container">
      <div className="property-header">
        <h1 className="property-title">{property.metadata.name}</h1>
        <p className="property-location">{property.location}</p>
      </div>

      <div className="property-content">
        <div className="property-image">
          <img src={property.metadata.image} alt={property.metadata.name} />
        </div>

        <div className="property-info">
          <div className="property-description">
            <h2>Description</h2>
            <p>{property.metadata.description}</p>
          </div>

          <div className="property-details">
            <h2>Details</h2>
            <ul>
              <li>
                <strong>Cadastral Number:</strong> {property.cadastralNumber}
              </li>
              <li>
                <strong>Valuation:</strong> {formatEther(property.valuation)} ETH
              </li>
              <li>
                <strong>Status:</strong> {property.owner ? 'Owned' : 'Available'}
              </li>
            </ul>
          </div>

          <div className="property-actions">
            {!property.owner && (
              <>
                <button 
                  className="button button-primary"
                  onClick={() => navigate(`/property/${propertyId}/purchase`)}
                >
                  Purchase Property
                </button>
                <button 
                  className="button button-secondary"
                  onClick={() => navigate(`/property/${propertyId}/rent`)}
                >
                  Rent Property
                </button>
                <button 
                  className="button button-accent"
                  onClick={() => navigate(`/property/${propertyId}/fractional`)}
                >
                  Invest Fractionally
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
