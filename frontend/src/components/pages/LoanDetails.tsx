"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAppKitAccount } from "@reown/appkit/react"
import { ActionButton } from "../ActionButton"
import { DollarSign, Clock, AlertTriangle, CheckCircle, Loader, ArrowRight, Calendar } from "lucide-react"
import { useLendingProtocolContract, type LoanWithDetails, LoanStatus } from "../hooks/useLendingProtocolContract"
import { useRealEstateContract } from "../hooks/useRealEstateContract"

export const LoanDetails = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { address, isConnected } = useAppKitAccount()
  const { getLoan, makeRepayment, isLoading: isLoadingLoan } = useLendingProtocolContract()
  const { getPropertyDetails, isLoading: isLoadingProperty } = useRealEstateContract()

  const [loan, setLoan] = useState<LoanWithDetails | null>(null)
  const [property, setProperty] = useState<any | null>(null)
  const [showRepayModal, setShowRepayModal] = useState(false)
  const [repaymentAmount, setRepaymentAmount] = useState("")

  const isLoading = isLoadingLoan || isLoadingProperty

  useEffect(() => {
    if (isConnected && id) {
      loadLoanDetails()
    }
  }, [isConnected, id])

  const loadLoanDetails = async () => {
    if (!id) return

    try {
      const loanId = BigInt(id)
      const loanDetails = await getLoan(loanId)
      setLoan(loanDetails)

      if (loanDetails) {
        const propertyDetails = await getPropertyDetails(loanDetails.propertyId)
        setProperty(propertyDetails)
      }
    } catch (error) {
      console.error("Error loading loan details:", error)
    }
  }

  const handleRepayClick = () => {
    if (!loan) return
    setRepaymentAmount(loan.payoffAmount)
    setShowRepayModal(true)
  }

  const handleRepayment = async () => {
    if (!loan || !repaymentAmount) return

    try {
      await makeRepayment(loan.loanId, repaymentAmount)
      setShowRepayModal(false)
      // Reload loan details after repayment
      setTimeout(loadLoanDetails, 2000)
    } catch (error) {
      console.error("Error making repayment:", error)
    }
  }

  const getLoanStatusClass = (status: number) => {
    switch (status) {
      case LoanStatus.Requested:
        return "status-pending"
      case LoanStatus.Approved:
        return "status-approved"
      case LoanStatus.Funded:
      case LoanStatus.Active:
        return "status-active"
      case LoanStatus.Repaid:
        return "status-repaid"
      case LoanStatus.Defaulted:
      case LoanStatus.Liquidated:
        return "status-defaulted"
      default:
        return ""
    }
  }

  const getLoanStatusIcon = (status: number) => {
    switch (status) {
      case LoanStatus.Requested:
      case LoanStatus.Approved:
        return <Clock size={20} />
      case LoanStatus.Funded:
      case LoanStatus.Active:
        return <DollarSign size={20} />
      case LoanStatus.Repaid:
        return <CheckCircle size={20} />
      case LoanStatus.Defaulted:
      case LoanStatus.Liquidated:
        return <AlertTriangle size={20} />
      default:
        return null
    }
  }

  if (!isConnected) {
    return (
      <div className="page-container">
        <div className="connect-prompt">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to view loan details</p>
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
          <p>Loading loan details...</p>
        </div>
      </div>
    )
  }

  if (!loan) {
    return (
      <div className="page-container">
        <div className="glass-card">
          <h2>Loan Not Found</h2>
          <p>The loan you are looking for does not exist or you do not have permission to view it.</p>
          <ActionButton onClick={() => navigate("/loans")}>Back to My Loans</ActionButton>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Loan Details</h1>
        <p>Loan #{loan.loanId.toString()}</p>
      </div>

      <div className="loan-details-container">
        <div className="glass-card loan-overview">
          <div className="loan-header">
            <div className={`loan-status ${getLoanStatusClass(loan.status)}`}>
              {getLoanStatusIcon(loan.status)}
              <span>{loan.statusText}</span>
            </div>
          </div>
          <div className="loan-summary">
            <div className="loan-summary-item">
              <span className="summary-label">Principal</span>
              <span className="summary-value">{loan.formattedPrincipal} ETH</span>
            </div>
            <div className="loan-summary-item">
              <span className="summary-label">Interest Rate</span>
              <span className="summary-value">{loan.formattedInterestRate}</span>
            </div>
            <div className="loan-summary-item">
              <span className="summary-label">Term</span>
              <span className="summary-value">{Math.floor(Number(loan.term) / (24 * 60 * 60))} days</span>
            </div>
            <div className="loan-summary-item">
              <span className="summary-label">Remaining Principal</span>
              <span className="summary-value">{loan.formattedRemainingPrincipal} ETH</span>
            </div>
          </div>

          {(loan.status === LoanStatus.Active || loan.status === LoanStatus.Funded) && (
            <div className="loan-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${loan.progressPercentage}%` }}></div>
              </div>
              <div className="progress-info">
                <span>{loan.daysRemaining} days remaining</span>
                <span>{loan.progressPercentage.toFixed(0)}% complete</span>
              </div>
            </div>
          )}

          {loan.status === LoanStatus.Active && (
            <div className="loan-repayment">
              <div className="repayment-info">
                <span className="repayment-label">Payoff Amount</span>
                <span className="repayment-value">{loan.payoffAmount} ETH</span>
              </div>
              <ActionButton onClick={handleRepayClick}>Make Repayment</ActionButton>
            </div>
          )}

          {loan.isOverdue && (
            <div className="loan-alert">
              <AlertTriangle size={20} />
              <span>This loan is overdue. Please make a repayment as soon as possible to avoid liquidation.</span>
            </div>
          )}

          {loan.status === LoanStatus.Requested && (
            <div className="loan-pending">
              <p>Your loan request is pending approval by a loan officer.</p>
            </div>
          )}

          {loan.status === LoanStatus.Approved && (
            <div className="loan-approved">
              <p>Your loan has been approved and is waiting to be funded.</p>
            </div>
          )}

          {loan.status === LoanStatus.Repaid && (
            <div className="loan-repaid">
              <CheckCircle size={20} className="text-success" />
              <p>This loan has been fully repaid. Your collateral has been released.</p>
            </div>
          )}

          {(loan.status === LoanStatus.Defaulted || loan.status === LoanStatus.Liquidated) && (
            <div className="loan-defaulted">
              <AlertTriangle size={20} className="text-error" />
              <p>This loan is in default. Your collateral may be liquidated.</p>
            </div>
          )}
        </div>

        <div className="glass-card loan-collateral">
          <h3>Collateral Property</h3>
          {property ? (
            <div className="property-details">
              <img
                src={property.metadata?.image || "/suburban-house-exterior.png"}
                alt={property.metadata?.name || property.cadastralNumber}
                className="property-image"
              />
              <div className="property-info">
                <h4>{property.metadata?.name || property.cadastralNumber}</h4>
                <p>{property.location}</p>
                <div className="property-valuation">
                  <DollarSign size={16} />
                  <span>Valuation: {property.valuation} ETH</span>
                </div>
                <div className="loan-to-value">
                  <span>Loan-to-Value Ratio: </span>
                  <span>{loan.formattedLoanToValueRatio}</span>
                </div>
                <ActionButton variant="outline" size="small" onClick={() => navigate(`/property/${property.tokenId}`)}>
                  View Property <ArrowRight size={16} />
                </ActionButton>
              </div>
            </div>
          ) : (
            <p>Loading property details...</p>
          )}
        </div>

        <div className="glass-card loan-schedule">
          <h3>Loan Schedule</h3>
          
          <div className="schedule-details">
            <div className="schedule-item">
              <div className="schedule-icon">
                <Calendar size={20} />
              </div>
              <div className="schedule-content">
                <span className="schedule-label">Start Date</span>
                <span className="schedule-value">
{
  loan.startTime.toLocaleDateString()
}
</span>
</div>
            </div>
            
            <div className="schedule-item">
              <div className="schedule-icon">
                <Calendar size={20} />
              </div>
              <div className="schedule-content">
                <span className="schedule-label">Maturity Date</span>
                <span className="schedule-value">
{
  loan.maturityTime.toLocaleDateString()
}
</span>
</div>
            </div>
            
            <div className="schedule-item">
              <div className="schedule-icon">
                <DollarSign size={20} />
              </div>
              <div className="schedule-content">
                <span className="schedule-label">Origination Fee</span>
                <span className="schedule-value">
{
  loan.formattedOriginationFee
}
</span>
</div>
            </div>
          </div>
        </div>

        <div className="glass-card loan-payments">
          <h3>Payment History</h3>

{
  loan.payments.length > 0 ? (
    <div className="payments-table">
      <div className="payments-header">
        <div className="payment-cell">Date</div>
        <div className="payment-cell">Amount</div>
        <div className="payment-cell">Principal</div>
        <div className="payment-cell">Interest</div>
        <div className="payment-cell">Fees</div>
      </div>

      {loan.payments.map((payment, index) => (
        <div key={index} className="payment-row">
          <div className="payment-cell">{payment.timestamp.toLocaleDateString()}</div>
          <div className="payment-cell">{payment.formattedAmount} ETH</div>
          <div className="payment-cell">{payment.formattedPrincipalPortion} ETH</div>
          <div className="payment-cell">{payment.formattedInterestPortion} ETH</div>
          <div className="payment-cell">{payment.formattedFeePortion} ETH</div>
        </div>
      ))}

      <div className="payment-totals">
        <div className="payment-cell">Total</div>
        <div className="payment-cell">{loan.formattedTotalRepaid} ETH</div>
        <div className="payment-cell"></div>
        <div className="payment-cell"></div>
        <div className="payment-cell"></div>
      </div>
    </div>
  ) : (
    <p>No payments have been made on this loan yet.</p>
  )
}
</div>
      </div>

{
  /* Repayment Modal */
}
{
  showRepayModal && (
    <div className="modal-overlay">
      <div className="glass-card modal-content">
        <h3>Make Loan Repayment</h3>

        <div className="repayment-details">
          <div className="repayment-item">
            <span className="repayment-label">Loan ID</span>
            <span className="repayment-value">#{loan.loanId.toString()}</span>
          </div>
          <div className="repayment-item">
            <span className="repayment-label">Principal</span>
            <span className="repayment-value">{loan.formattedPrincipal} ETH</span>
          </div>
          <div className="repayment-item">
            <span className="repayment-label">Remaining Principal</span>
            <span className="repayment-value">{loan.formattedRemainingPrincipal} ETH</span>
          </div>
          <div className="repayment-item">
            <span className="repayment-label">Payoff Amount</span>
            <span className="repayment-value">{loan.payoffAmount} ETH</span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="repaymentAmount">Repayment Amount (ETH)</label>
          <input
            type="number"
            id="repaymentAmount"
            value={repaymentAmount}
            onChange={(e) => setRepaymentAmount(e.target.value)}
            min="0.001"
            step="0.001"
            required
          />
          <p className="form-hint">
            Enter the amount you wish to repay. To fully repay the loan, use the payoff amount.
          </p>
        </div>

        <div className="form-actions">
          <ActionButton variant="outline" onClick={() => setShowRepayModal(false)}>
            Cancel
          </ActionButton>
          <ActionButton onClick={handleRepayment} disabled={isLoadingLoan}>
            {isLoadingLoan ? "Processing..." : "Make Repayment"}
          </ActionButton>
        </div>
      </div>
    </div>
  )
}
    </div>
  )
}