"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAppKitAccount } from "@reown/appkit/react"
import { ActionButton } from "../ActionButton"
import { DollarSign, Check, X, Loader, CreditCard } from "lucide-react"
import { useRealEstateContract } from "../hooks/useRealEstateContract"
import { useRealEstateSaleContract, type SaleWithDetails, SaleStatus } from "../hooks/useRealEstateSaleContract"
import { useLendingProtocolContract } from "../hooks/useLendingProtocolContract"
import { Property } from "../../types/property"

export const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { address, isConnected } = useAppKitAccount()
  const { getPropertyDetails, isLoading: isLoadingProperty } = useRealEstateContract()
  const {
    getSale,
    getActiveSaleForProperty,
    expressInterest,
    depositEscrow,
    isLoading: isLoadingSale,
  } = useRealEstateSaleContract()
  const { getActiveLoanForProperty, isLoading: isLoadingLoan } = useLendingProtocolContract()

  const [property, setProperty] = useState<Property | null>(null)
  const [sale, setSale] = useState<SaleWithDetails | null>(null)
  const [hasActiveLoan, setHasActiveLoan] = useState<boolean>(false)
  const [isInterested, setIsInterested] = useState<boolean>(false)
  const [escrowAmount, setEscrowAmount] = useState<string>("")
  const [showEscrowModal, setShowEscrowModal] = useState(false)

  const isLoading = isLoadingProperty || isLoadingSale || isLoadingLoan

  useEffect(() => {
    if (isConnected && id) {
      loadPropertyDetails()
    }
  }, [isConnected, id])

  const loadPropertyDetails = async () => {
    if (!id) return

    try {
      // Load property details
      const propertyId = BigInt(id)
      const propertyDetails = await getPropertyDetails(propertyId)
      if (propertyDetails) {
        setProperty({
          id: propertyId,
          tokenId: propertyId,
          status: propertyDetails.status,
          owner: propertyDetails.owner,
          imageUrl: propertyDetails.imageUrl,
          ...propertyDetails
        })
      }

      // Check if there's an active sale for this property
      const activeSaleId = await getActiveSaleForProperty(propertyId)
      if (activeSaleId && activeSaleId > 0n) {
        const saleDetails = await getSale(activeSaleId)
        setSale(saleDetails)

        // Check if current user is the buyer
        if (saleDetails?.buyer && address && saleDetails.buyer.toLowerCase() === address.toLowerCase()) {
          setIsInterested(true)
        }
      }

      // Check if there's an active loan for this property
      const activeLoanId = await getActiveLoanForProperty(propertyId)
      setHasActiveLoan(activeLoanId !== null && activeLoanId > 0n)
    } catch (error) {
      console.error("Error loading property details:", error)
    }
  }

  const handleExpressInterest = async () => {
    if (!sale) return

    try {
      await expressInterest(sale.saleId)
      setIsInterested(true)
      // Reload sale details after expressing interest
      setTimeout(loadPropertyDetails, 2000)
    } catch (error) {
      console.error("Error expressing interest:", error)
    }
  }

  const handleDepositEscrow = async () => {
    if (!sale) return

    try {
      await depositEscrow(sale.saleId, escrowAmount)
      setShowEscrowModal(false)
      // Reload sale details after depositing escrow
      setTimeout(loadPropertyDetails, 2000)
    } catch (error) {
      console.error("Error depositing escrow:", error)
    }
  }

  const handleRequestLoan = () => {
    if (!property) return
    navigate(`/property/${property.tokenId}/loan`)
  }

  if (!isConnected) {
    return (
      <div className="page-container">
        <div className="connect-prompt">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to view property details</p>
          <appkit-button />
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <Loader className="animate-spin" size={32} />
          <p>Loading property details...</p>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="page-container">
        <div className="glass-card">
          <h2>Property Not Found</h2>
          <p>The property you are looking for does not exist or you do not have permission to view it.</p>
          <ActionButton onClick={() => navigate("/marketplace")}>Back to Marketplace</ActionButton>
        </div>
      </div>
    )
  }

  const isOwner = address && property.owner.toLowerCase() === address.toLowerCase()

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{property.cadastralNumber}</h1>
        <p>{property.location}</p>
      </div>

      <div className="glass-card">
        <div className="property-details-container">
          <div className="property-image-container">
            <img
              src={property.image || "/suburban-house-exterior.png"}
              alt={property.name || property.cadastralNumber}
            />
          </div>

          <div className="property-info">
            <div className="property-price-container">
              <DollarSign size={24} />
              <div className="property-price">{property.valuation} ETH</div>
            </div>

            {sale && (
              <div className="sale-status">
                <div className="status-badge">
                  {sale.statusText}
                  {sale.status === SaleStatus.Active && <span className="pulse-dot"></span>}
                </div>
                {sale.escrowBalanceRaw > 0n && (
                  <div className="escrow-info">
                    <span>Escrow Balance:</span> {sale.escrowBalance} ETH
                  </div>
                )}
              </div>
            )}

            <div className="property-description">
              {property.metadata?.description ||
                "A beautiful property in a prime location. This property has been tokenized on the blockchain and is available for purchase."}
            </div>

            <div className="property-attributes">
              {property.metadata?.attributes?.map((attr, index) => (
                <div key={index} className="property-attribute">
                  <div className="attribute-label">{attr.trait_type}</div>
                  <div className="attribute-value">{attr.value}</div>
                </div>
              ))}
            </div>

            <div className="property-actions">
              {isOwner ? (
                // Owner actions
                <div className="owner-actions">
                  {sale ? (
                    // If there's an active sale
                    <div className="sale-info">
                      <p>Your property is currently listed for sale.</p>
                      <ActionButton variant="outline" onClick={() => navigate("/dashboard/sale-properties")}>
                        Manage Listing
                      </ActionButton>
                    </div>
                  ) : hasActiveLoan ? (
                    // If there's an active loan
                    <div className="loan-info">
                      <p>This property is currently used as collateral for a loan.</p>
                      <ActionButton variant="outline" onClick={() => navigate("/loans")}>
                        View Loan Details
                      </ActionButton>
                    </div>
                  ) : (
                    // No sale or loan
                    <div className="owner-options">
                      <ActionButton onClick={() => navigate("/dashboard/sale-properties")}>List for Sale</ActionButton>
                      <ActionButton variant="outline" onClick={handleRequestLoan}>
                        <CreditCard size={16} />
                        <span>Request Loan</span>
                      </ActionButton>
                    </div>
                  )}
                </div>
              ) : (
                // Non-owner actions
                <>
                  {sale ? (
                    // If there's an active sale
                    <>
                      {sale.status === SaleStatus.Active && (
                        <>
                          {!isInterested ? (
                            <ActionButton onClick={handleExpressInterest}>Express Interest</ActionButton>
                          ) : (
                            <ActionButton onClick={() => setShowEscrowModal(true)}>Deposit Escrow</ActionButton>
                          )}
                        </>
                      )}
                      {sale.status === SaleStatus.PendingApproval && (
                        <ActionButton disabled>Pending Notary Approval</ActionButton>
                      )}
                      {sale.status === SaleStatus.Approved && (
                        <ActionButton disabled>Ready for Completion</ActionButton>
                      )}
                      {sale.status === SaleStatus.Completed && (
                        <div className="sale-completed">
                          <Check size={20} className="text-success" />
                          <span>Sale Completed</span>
                        </div>
                      )}
                      {sale.status === SaleStatus.Cancelled && (
                        <div className="sale-cancelled">
                          <X size={20} className="text-error" />
                          <span>Sale Cancelled</span>
                        </div>
                      )}
                    </>
                  ) : (
                    // If no active sale
                    <ActionButton onClick={() => navigate("/marketplace")}>Back to Marketplace</ActionButton>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="property-details-section">
        <div className="glass-card">
          <h3>Property Details</h3>
          <div className="property-details-grid">
            <div className="property-detail-item">
              <div className="detail-label">Cadastral Number</div>
              <div className="detail-value">{property.cadastralNumber}</div>
            </div>
            <div className="property-detail-item">
              <div className="detail-label">Token ID</div>
              <div className="detail-value">{property.tokenId.toString()}</div>
            </div>
            <div className="property-detail-item">
              <div className="detail-label">Owner</div>
              <div className="detail-value address">
                {property.owner.slice(0, 6)}...{property.owner.slice(-4)}
              </div>
            </div>
            <div className="property-detail-item">
              <div className="detail-label">Active</div>
              <div className="detail-value">{property.active ? "Yes" : "No"}</div>
            </div>
            <div className="property-detail-item">
              <div className="detail-label">Last Updated</div>
              <div className="detail-value">{property.lastUpdated.toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>

      {sale && (
        <div className="property-details-section">
          <div className="glass-card">
            <h3>Sale Information</h3>
            <div className="property-details-grid">
              <div className="property-detail-item">
                <div className="detail-label">Sale ID</div>
                <div className="detail-value">{sale.saleId.toString()}</div>
              </div>
              <div className="property-detail-item">
                <div className="detail-label">Seller</div>
                <div className="detail-value address">
                  {sale.seller.slice(0, 6)}...{sale.seller.slice(-4)}
                </div>
              </div>
              <div className="property-detail-item">
                <div className="detail-label">Buyer</div>
                <div className="detail-value address">
                  {sale.buyer && sale.buyer !== "0x0000000000000000000000000000000000000000"
                    ? `${sale.buyer.slice(0, 6)}...${sale.buyer.slice(-4)}`
                    : "No buyer yet"}
                </div>
              </div>
              <div className="property-detail-item">
                <div className="detail-label">Price</div>
                <div className="detail-value">{sale.formattedPrice} ETH</div>
              </div>
              <div className="property-detail-item">
                <div className="detail-label">Created</div>
                <div className="detail-value">{sale.createdAt.toLocaleDateString()}</div>
              </div>
              <div className="property-detail-item">
                <div className="detail-label">Status</div>
                <div className="detail-value">{sale.statusText}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Escrow Modal */}
      {showEscrowModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <h3>Deposit Escrow</h3>
            <p>
              Depositing escrow funds shows your commitment to purchase this property. The funds will be held in the
              smart contract until the sale is completed or cancelled.
            </p>

            <div className="form-group">
              <label htmlFor="escrowAmount">Escrow Amount (ETH)</label>
              <input
                type="number"
                id="escrowAmount"
                value={escrowAmount}
                onChange={(e) => setEscrowAmount(e.target.value)}
                placeholder="e.g. 0.5"
                step="0.01"
                min="0.01"
                required
              />
            </div>

            <div className="escrow-info">
              <p>
                <strong>Recommended:</strong> 10-20% of the property price (
                {(Number(sale?.formattedPrice || 0) * 0.1).toFixed(2)} -{" "}
                {(Number(sale?.formattedPrice || 0) * 0.2).toFixed(2)} ETH)
              </p>
              <p>
                <strong>Current Escrow Balance:</strong> {sale?.escrowBalance || "0"} ETH
              </p>
            </div>

            <div className="form-actions">
              <ActionButton variant="outline" onClick={() => setShowEscrowModal(false)}>
                Cancel
              </ActionButton>
              <ActionButton onClick={handleDepositEscrow} disabled={isLoading || !escrowAmount}>
                {isLoading ? "Processing..." : "Deposit Escrow"}
              </ActionButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
