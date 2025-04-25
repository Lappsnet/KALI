"use client"

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronUp, DollarSign, Percent, Clock, Building, Users, Lock } from 'lucide-react'
import { formatEther } from 'viem'
import '../styles/PropertyCard.css'

interface PropertyCardProps {
  tokenId: bigint
  title: string
  address: string
  price: string
  image: string
  status: string
  investmentDetails?: {
    annualYield: string
    minInvestment: bigint
    totalShares: number
    availableShares: number
    monthlyRent: bigint
    usdtValue: string
    roi: string
    lockupPeriod: string
    propertyType: string
    amenities: string[]
    projectedIncome?: {
      monthly: string
      annual: string
      fiveYear: string
    }
    investmentOptions?: {
      purchase?: {
        price: string
        downPayment: string
        mortgageRate: string
        monthlyPayment: string
      }
      rent?: {
        monthly: string
        securityDeposit: string
        leaseTerm: string
        maintenanceFee: string
      }
      fractional?: {
        sharePrice: string
        minShares: number
        projectedAnnualReturn: string
        managementFee: string
      }
    }
  }
}

export const PropertyCard = ({ tokenId, title, address, price, image, status, investmentDetails }: PropertyCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const navigate = useNavigate()

  const handleCardClick = () => {
    navigate(`/property/${tokenId.toString()}`)
  }

  return (
    <div className="property-card" onClick={handleCardClick}>
      <div className="property-image">
        <img src={image} alt={title} />
        <div className="property-status">{status}</div>
      </div>
      
      <div className="property-details">
        <h3 className="property-title">{title}</h3>
        <p className="property-address">{address}</p>
        <div className="property-price">
          <DollarSign size={16} />
          <span>{price}</span>
        </div>

        {investmentDetails && (
          <>
            <div className="investment-summary">
              <div className="investment-metric">
                <Percent size={16} />
                <span>{investmentDetails.annualYield} Annual Yield</span>
              </div>
              <div className="investment-metric">
                <DollarSign size={16} />
                <span>{formatEther(investmentDetails.minInvestment)} ETH Min. Investment</span>
              </div>
              <div className="investment-metric">
                <Users size={16} />
                <span>{investmentDetails.availableShares} Shares Available</span>
              </div>
            </div>

            <button 
              className="expand-button"
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
            >
              {isExpanded ? (
                <>
                  <span>Show Less</span>
                  <ChevronUp size={16} />
                </>
              ) : (
                <>
                  <span>Show More</span>
                  <ChevronDown size={16} />
                </>
              )}
            </button>

            {isExpanded && (
              <div className="expanded-details" onClick={(e) => e.stopPropagation()}>
                <div className="detail-section">
                  <h4>Investment Details</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <DollarSign size={16} />
                      <div>
                        <span className="label">Monthly Rent</span>
                        <span className="value">{formatEther(investmentDetails.monthlyRent)} ETH</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <DollarSign size={16} />
                      <div>
                        <span className="label">USDT Value</span>
                        <span className="value">${investmentDetails.usdtValue}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <Percent size={16} />
                      <div>
                        <span className="label">ROI</span>
                        <span className="value">{investmentDetails.roi}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <Clock size={16} />
                      <div>
                        <span className="label">Lockup Period</span>
                        <span className="value">{investmentDetails.lockupPeriod}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {investmentDetails.projectedIncome && (
                  <div className="detail-section">
                    <h4>Projected Income</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <DollarSign size={16} />
                        <div>
                          <span className="label">Monthly</span>
                          <span className="value">{investmentDetails.projectedIncome.monthly}</span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <DollarSign size={16} />
                        <div>
                          <span className="label">Annual</span>
                          <span className="value">{investmentDetails.projectedIncome.annual}</span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <DollarSign size={16} />
                        <div>
                          <span className="label">5-Year</span>
                          <span className="value">{investmentDetails.projectedIncome.fiveYear}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="detail-section">
                  <h4>Property Details</h4>
                  <div className="detail-item">
                    <Building size={16} />
                    <div>
                      <span className="label">Type</span>
                      <span className="value">{investmentDetails.propertyType}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Amenities</h4>
                  <div className="amenities-grid">
                    {investmentDetails.amenities.map((amenity, index) => (
                      <div key={index} className="amenity-tag">
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="action-buttons">
                  <button className="button button-primary">Invest Now</button>
                  <button className="button button-outline">View Details</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
