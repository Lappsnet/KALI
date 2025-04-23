"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAppKitAccount } from "@reown/appkit/react"
import { ActionButton } from "../ActionButton"
import { Calculator, DollarSign, Loader, Clock, Percent } from "lucide-react"
import { useRealEstateContract, type PropertyWithMetadata } from "../hooks/useRealEstateContract"
import { useLendingProtocolContract } from "../hooks/useLendingProtocolContract"
import { LENDING_PROTOCOL_PARAMS } from "../../config/index.ts"

export const LoanRequest = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { address, isConnected } = useAppKitAccount()
  const { getPropertyDetails, isLoading: isLoadingProperty } = useRealEstateContract()
  const { requestLoan, isLoading: isLoadingLoan } = useLendingProtocolContract()

  const [property, setProperty] = useState<PropertyWithMetadata | null>(null)
  const [loanAmount, setLoanAmount] = useState("")
  const [interestRate, setInterestRate] = useState(LENDING_PROTOCOL_PARAMS.interestRates[0].value)
  const [term, setTerm] = useState(LENDING_PROTOCOL_PARAMS.loanTerms[0].value)
  const [loanToValueRatio, setLoanToValueRatio] = useState(0)
  const [monthlyPayment, setMonthlyPayment] = useState("")
  const [totalInterest, setTotalInterest] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [loanRequestSuccess, setLoanRequestSuccess] = useState(false)
  const [loanId, setLoanId] = useState<bigint | null>(null)

  const isLoading = isLoadingProperty || isLoadingLoan

  useEffect(() => {
    if (isConnected && id) {
      loadPropertyDetails()
    }
  }, [isConnected, id])

  useEffect(() => {
    // Calculate loan-to-value ratio whenever loan amount or property changes
    if (property && loanAmount) {
      const propertyValue = Number(property.valuation)
      const loan = Number(loanAmount)
      const ltv = (loan / propertyValue) * 100
      setLoanToValueRatio(ltv)

      // Calculate monthly payment and total interest
      calculateLoanDetails(loan, interestRate, term)
    }
  }, [loanAmount, property, interestRate, term])

  const loadPropertyDetails = async () => {
    if (!id) return

    try {
      // Load property details
      const propertyId = BigInt(id)
      const propertyDetails = await getPropertyDetails(propertyId)
      setProperty(propertyDetails)

      // Set default loan amount to 50% of property value
      if (propertyDetails) {
        const defaultLoanAmount = Number(propertyDetails.valuation) * 0.5
        setLoanAmount(defaultLoanAmount.toString())
      }
    } catch (error) {
      console.error("Error loading property details:", error)
    }
  }

  const calculateLoanDetails = (principal: number, interestRateBps: number, termDays: number) => {
    // Convert interest rate from basis points to decimal (e.g., 500 -> 0.05)
    const interestRateDecimal = interestRateBps / 10000

    // Convert term from days to months
    const termMonths = termDays / 30

    // Calculate monthly interest rate
    const monthlyRate = interestRateDecimal / 12

    // Calculate monthly payment using the formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
    const monthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1)

    // Calculate total interest
    const totalInterest = monthlyPayment * termMonths - principal

    setMonthlyPayment(monthlyPayment.toFixed(4))
    setTotalInterest(totalInterest.toFixed(4))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowConfirmation(true)
  }

  const handleConfirmLoanRequest = async () => {
    if (!property || !loanAmount) return

    try {
      await requestLoan(property.tokenId, loanAmount, interestRate, term, (newLoanId) => {
        setLoanId(newLoanId)
        setLoanRequestSuccess(true)
      })
    } catch (error) {
      console.error("Error requesting loan:", error)
    }
  }

  if (!isConnected) {
    return (
      <div className="page-container">
        <div className="connect-prompt">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to request a loan</p>
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
          <ActionButton onClick={() => navigate("/dashboard")}>Back to Dashboard</ActionButton>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Request a Loan</h1>
        <p>Use your property as collateral to get a loan</p>
      </div>

      {!loanRequestSuccess ? (
        <div className="glass-card">
          {!showConfirmation ? (
            <div className="loan-request-container">
              <div className="property-preview">
                <img
                  src={property.metadata?.image || "/suburban-house-exterior.png"}
                  alt={property.metadata?.name || property.cadastralNumber}
                  className="property-image"
                />
                <div className="property-info">
                  <h3>{property.metadata?.name || property.cadastralNumber}</h3>
                  <p className="property-location">{property.location}</p>
                  <div className="property-valuation">
                    <DollarSign size={16} />
                    <span>Valuation: {property.valuation} ETH</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="loan-form">
                <div className="form-group">
                  <label htmlFor="loanAmount">Loan Amount (ETH)</label>
                  <input
                    type="number"
                    id="loanAmount"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    step="0.01"
                    min="0.1"
                    max={property.valuation}
                    required
                  />
                  <div className="loan-to-value">
                    <span>Loan-to-Value Ratio: </span>
                    <span
                      className={
                        loanToValueRatio > 75 ? "text-error" : loanToValueRatio > 60 ? "text-warning" : "text-success"
                      }
                    >
                      {loanToValueRatio.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="interestRate">Interest Rate</label>
                  <select
                    id="interestRate"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    required
                  >
                    {LENDING_PROTOCOL_PARAMS.interestRates.map((rate) => (
                      <option key={rate.value} value={rate.value}>
                        {rate.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="term">Loan Term</label>
                  <select id="term" value={term} onChange={(e) => setTerm(Number(e.target.value))} required>
                    {LENDING_PROTOCOL_PARAMS.loanTerms.map((term) => (
                      <option key={term.value} value={term.value}>
                        {term.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="loan-calculator">
                  <h4>
                    <Calculator size={16} /> Loan Calculator
                  </h4>
                  <div className="calculator-results">
                    <div className="calculator-item">
                      <span>Monthly Payment:</span>
                      <span>{monthlyPayment} ETH</span>
                    </div>
                    <div className="calculator-item">
                      <span>Total Interest:</span>
                      <span>{totalInterest} ETH</span>
                    </div>
                    <div className="calculator-item">
                      <span>Total Repayment:</span>
                      <span>{(Number(loanAmount) + Number(totalInterest)).toFixed(4)} ETH</span>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <ActionButton variant="outline" onClick={() => navigate(`/property/${property.tokenId}`)}>
                    Cancel
                  </ActionButton>
                  <ActionButton type="submit">Continue to Review</ActionButton>
                </div>
              </form>
            </div>
          ) : (
            <div className="loan-confirmation">
              <h3>Review Loan Request</h3>

              <div className="confirmation-details">
                <div className="confirmation-property">
                  <img
                    src={property.metadata?.image || "/suburban-house-exterior.png"}
                    alt={property.metadata?.name || property.cadastralNumber}
                    className="property-image-small"
                  />
                  <div>
                    <h4>{property.metadata?.name || property.cadastralNumber}</h4>
                    <p>{property.location}</p>
                  </div>
                </div>

                <div className="confirmation-items">
                  <div className="confirmation-item">
                    <div className="confirmation-icon">
                      <DollarSign size={20} />
                    </div>
                    <div className="confirmation-content">
                      <span className="confirmation-label">Loan Amount</span>
                      <span className="confirmation-value">{loanAmount} ETH</span>
                    </div>
                  </div>

                  <div className="confirmation-item">
                    <div className="confirmation-icon">
                      <Percent size={20} />
                    </div>
                    <div className="confirmation-content">
                      <span className="confirmation-label">Interest Rate</span>
                      <span className="confirmation-value">{(interestRate / 100).toFixed(2)}%</span>
                    </div>
                  </div>

                  <div className="confirmation-item">
                    <div className="confirmation-icon">
                      <Clock size={20} />
                    </div>
                    <div className="confirmation-content">
                      <span className="confirmation-label">Loan Term</span>
                      <span className="confirmation-value">{term} days</span>
                    </div>
                  </div>

                  <div className="confirmation-item">
                    <div className="confirmation-icon">
                      <Calculator size={20} />
                    </div>
                    <div className="confirmation-content">
                      <span className="confirmation-label">Monthly Payment</span>
                      <span className="confirmation-value">{monthlyPayment} ETH</span>
                    </div>
                  </div>
                </div>

                <div className="confirmation-terms">
                  <h4>Loan Terms</h4>
                  <ul>
                    <li>Your property will be used as collateral for this loan.</li>
                    <li>Loan-to-Value Ratio: {loanToValueRatio.toFixed(2)}%</li>
                    <li>Origination Fee: {(LENDING_PROTOCOL_PARAMS.originationFee / 100).toFixed(2)}%</li>
                    <li>Loan must be repaid within {term} days.</li>
                    <li>Failure to repay may result in liquidation of your property.</li>
                  </ul>
                </div>
              </div>

              <div className="confirmation-actions">
                <ActionButton variant="outline" onClick={() => setShowConfirmation(false)}>
                  Back to Edit
                </ActionButton>
                <ActionButton onClick={handleConfirmLoanRequest} disabled={isLoading}>
                  {isLoading ? "Processing..." : "Confirm & Request Loan"}
                </ActionButton>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card">
          <div className="loan-success">
            <div className="success-icon">
              <DollarSign size={48} className="text-success" />
            </div>
            <h3>Loan Request Submitted!</h3>
            <p>Your loan request has been submitted successfully and is pending approval.</p>

            <div className="success-details">
              <div className="success-item">
                <span className="success-label">Loan ID:</span>
                <span className="success-value">{loanId?.toString() || "Processing..."}</span>
              </div>
              <div className="success-item">
                <span className="success-label">Property:</span>
                <span className="success-value">{property.metadata?.name || property.cadastralNumber}</span>
              </div>
              <div className="success-item">
                <span className="success-label">Amount:</span>
                <span className="success-value">{loanAmount} ETH</span>
              </div>
              <div className="success-item">
                <span className="success-label">Status:</span>
                <span className="success-value">Pending Approval</span>
              </div>
            </div>

            <div className="success-actions">
              <ActionButton onClick={() => navigate("/loans")}>View My Loans</ActionButton>
              <ActionButton variant="outline" onClick={() => navigate("/dashboard")}>
                Return to Dashboard
              </ActionButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
