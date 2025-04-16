"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAppKitAccount } from "@reown/appkit/react"
import { ActionButton } from "../ActionButton"
import { DollarSign, Clock, AlertTriangle, CheckCircle, Loader, ArrowRight } from "lucide-react"
import { useLendingProtocolContract, type LoanWithDetails, LoanStatus } from "../hooks/useLendingProtocolContract"

export const MyLoans = () => {
  const navigate = useNavigate()
  const { address, isConnected } = useAppKitAccount()
  const { getBorrowerLoansWithDetails, makeRepayment, isLoading: isLoadingContract } = useLendingProtocolContract()

  const [loans, setLoans] = useState<LoanWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showRepayModal, setShowRepayModal] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState<LoanWithDetails | null>(null)
  const [repaymentAmount, setRepaymentAmount] = useState("")

  useEffect(() => {
    if (isConnected && address) {
      loadLoans()
    }
  }, [isConnected, address])

  const loadLoans = async () => {
    if (!address) return

    setIsLoading(true)
    try {
      const borrowerLoans = await getBorrowerLoansWithDetails(address as `0x${string}`)
      setLoans(borrowerLoans)
    } catch (error) {
      console.error("Error loading loans:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRepayClick = (loan: LoanWithDetails) => {
    setSelectedLoan(loan)
    setRepaymentAmount(loan.payoffAmount)
    setShowRepayModal(true)
  }

  const handleRepayment = async () => {
    if (!selectedLoan || !repaymentAmount) return

    try {
      await makeRepayment(selectedLoan.loanId, repaymentAmount)
      setShowRepayModal(false)
      // Reload loans after repayment
      setTimeout(loadLoans, 2000)
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
        return <Clock size={16} />
      case LoanStatus.Funded:
      case LoanStatus.Active:
        return <DollarSign size={16} />
      case LoanStatus.Repaid:
        return <CheckCircle size={16} />
      case LoanStatus.Defaulted:
      case LoanStatus.Liquidated:
        return <AlertTriangle size={16} />
      default:
        return null
    }
  }

  if (!isConnected) {
    return (
      <div className="page-container">
        <div className="connect-prompt">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to view your loans</p>
          <appkit-button />
        </div>
      </div>
    )
  }

  if (isLoading || isLoadingContract) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <Loader className="animate-spin" size={32} />
          <p>Loading your loans...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Loans</h1>
        <p>Manage your property-backed loans</p>
      </div>

      {loans.length > 0 ? (
        <div className="loans-container">
          {loans.map((loan) => (
            <div key={loan.loanId.toString()} className="glass-card loan-card">
              <div className="loan-header">
                <div className="loan-id">Loan #{loan.loanId.toString()}</div>
                <div className={`loan-status ${getLoanStatusClass(loan.status)}`}>
                  {getLoanStatusIcon(loan.status)}
                  <span>{loan.statusText}</span>
                </div>
              </div>

              <div className="loan-details">
                <div className="loan-amount">
                  <span className="loan-label">Principal</span>
                  <span className="loan-value">{loan.formattedPrincipal} ETH</span>
                </div>

                <div className="loan-info">
                  <div className="loan-info-item">
                    <span className="loan-info-label">Interest Rate</span>
                    <span className="loan-info-value">{loan.formattedInterestRate}</span>
                  </div>
                  <div className="loan-info-item">
                    <span className="loan-info-label">Term</span>
                    <span className="loan-info-value">{Math.floor(Number(loan.term) / (24 * 60 * 60))} days</span>
                  </div>
                  <div className="loan-info-item">
                    <span className="loan-info-label">Maturity Date</span>
                    <span className="loan-info-value">{loan.maturityTime.toLocaleDateString()}</span>
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
                    <ActionButton onClick={() => handleRepayClick(loan)}>Make Repayment</ActionButton>
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
                    <p>This loan has been fully repaid. Your collateral has been released.</p>
                  </div>
                )}

                {(loan.status === LoanStatus.Defaulted || loan.status === LoanStatus.Liquidated) && (
                  <div className="loan-defaulted">
                    <p>This loan is in default. Your collateral may be liquidated.</p>
                  </div>
                )}

                <div className="loan-actions">
                  <ActionButton variant="outline" size="small" onClick={() => navigate(`/loan/${loan.loanId}`)}>
                    View Details <ArrowRight size={16} />
                  </ActionButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-loans">
          <div className="glass-card">
            <h3>No Loans Found</h3>
            <p>You don't have any active loans. Use your properties as collateral to get a loan.</p>
            <ActionButton onClick={() => navigate("/dashboard")}>Browse My Properties</ActionButton>
          </div>
        </div>
      )}

      {/* Repayment Modal */}
      {showRepayModal && selectedLoan && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <h3>Make Loan Repayment</h3>

            <div className="repayment-details">
              <div className="repayment-item">
                <span className="repayment-label">Loan ID</span>
                <span className="repayment-value">#{selectedLoan.loanId.toString()}</span>
              </div>
              <div className="repayment-item">
                <span className="repayment-label">Principal</span>
                <span className="repayment-value">{selectedLoan.formattedPrincipal} ETH</span>
              </div>
              <div className="repayment-item">
                <span className="repayment-label">Remaining Principal</span>
                <span className="repayment-value">{selectedLoan.formattedRemainingPrincipal} ETH</span>
              </div>
              <div className="repayment-item">
                <span className="repayment-label">Payoff Amount</span>
                <span className="repayment-value">{selectedLoan.payoffAmount} ETH</span>
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
              <ActionButton onClick={handleRepayment} disabled={isLoadingContract}>
                {isLoadingContract ? "Processing..." : "Make Repayment"}
              </ActionButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
