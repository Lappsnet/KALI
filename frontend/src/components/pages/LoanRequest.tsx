"use client"

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppKitAccount } from '@reown/appkit/react';
import { useRealEstateContract } from '../hooks/useRealEstateContract';
import { useLendingProtocolContract } from '../hooks/useLendingProtocolContract';
import { parseEther, formatEther } from 'viem';
import { ActionButton } from "../ActionButton";
import { Calculator, DollarSign, Loader, Clock, Percent, AlertTriangle, CheckCircle, Home, Building, Info } from "lucide-react";
import "./LoanRequest.css";

interface PropertyDetails {
  tokenId: string;
  metadata?: {
    name?: string;
    image?: string;
  };
  cadastralNumber: string;
  location: string;
  valuation: string;
}

const mockProperty: PropertyDetails = {
  tokenId: "1",
  metadata: {
    name: "Modern Downtown Apartment",
    image: "/suburban-house-exterior.png"
  },
  cadastralNumber: "123456789",
  location: "123 Main St, New York, NY",
  valuation: "50000000000000000000" // 50 ETH in wei
};

const LoanRequest: React.FC = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAppKitAccount();
  const { getPropertyDetails } = useRealEstateContract();
  const { requestLoan, isLoading: isLoadingContract } = useLendingProtocolContract();

  const [property, setProperty] = useState<PropertyDetails | null>(mockProperty);
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [durationMonths, setDurationMonths] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate loan details
  const calculateLoanDetails = () => {
    if (!loanAmount || !interestRate || !durationMonths || !property) return null;

    const principal = parseFloat(loanAmount);
    const rate = parseFloat(interestRate) / 100;
    const months = parseInt(durationMonths);
    
    // Simple interest calculation
    const totalInterest = principal * rate * (months / 12);
    const totalPayment = principal + totalInterest;
    const monthlyPayment = totalPayment / months;
    
    // LTV calculation
    const propertyValue = Number(formatEther(BigInt(property.valuation)));
    const ltv = (principal / propertyValue) * 100;

    return {
      totalInterest,
      totalPayment,
      monthlyPayment,
      ltv
    };
  };

  const loanDetails = calculateLoanDetails();

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!isConnected || !address) return;

      setIsLoading(true);
      try {
        // TODO: Get property ID from route params or context
        const propertyId = "1"; // Placeholder
        const propertyDetails = await getPropertyDetails(BigInt(propertyId));
        if (propertyDetails) {
          setProperty({
            tokenId: propertyDetails.tokenId.toString(),
            metadata: propertyDetails.metadata,
            cadastralNumber: propertyDetails.cadastralNumber.toString(),
            location: propertyDetails.location,
            valuation: propertyDetails.valuation.toString()
          });
        }
      } catch (err) {
        console.error('Error fetching property details:', err);
        setError('Failed to fetch property details');
        // Keep the mock property data if the API call fails
        setProperty(mockProperty);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [isConnected, address, getPropertyDetails]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    setError(null);
    setTransactionStatus('pending');

    if (!property || !loanAmount || !interestRate || !durationMonths) {
      setError('Please fill in all fields');
      setTransactionStatus('error');
      return;
    }

    try {
      const result = await requestLoan(
        BigInt(property.tokenId),
        loanAmount,
        Math.floor(parseFloat(interestRate) * 100),
        parseInt(durationMonths) * 30
      );

      if (result) {
        setTransactionStatus('success');
        setTransactionHash(result.toString());
        // Reset form
        setLoanAmount('');
        setInterestRate('');
        setDurationMonths('');
      }
    } catch (err) {
      console.error('Error requesting loan:', err);
      setError('Failed to request loan');
      setTransactionStatus('error');
    }
  };

  if (!isConnected) {
    return (
      <div className="page-container">
        <div className="connect-prompt">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to request a loan</p>
          <appkit-button />
        </div>
      </div>
    );
  }

  if (isLoading || isLoadingContract) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <Loader className="animate-spin" size={32} />
          <p>Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="page-container">
        <div className="glass-card">
          <h2>Property Not Found</h2>
          <p>The property you are trying to use as collateral could not be found.</p>
          <ActionButton onClick={() => navigate("/dashboard")}>Back to Dashboard</ActionButton>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Request Loan</h1>
        <p>Use your property as collateral to secure a loan</p>
      </div>

      <div className="loan-request-container">
        <div className="glass-card property-details">
          <div className="section-header">
            <Building size={24} />
            <h3>Collateral Property</h3>
          </div>
          <div className="property-info">
            <img
              src={property.metadata?.image || "/suburban-house-exterior.png"}
              alt={property.metadata?.name || property.cadastralNumber}
              className="property-image"
            />
            <div className="property-details-content">
              <h4>{property.metadata?.name || 'Unnamed Property'}</h4>
              <p className="property-location">{property.location}</p>
              <div className="property-valuation">
                <DollarSign size={16} />
                <span>Valuation: {formatEther(BigInt(property.valuation))} ETH</span>
              </div>
              <div className="property-id">
                <Info size={16} />
                <span>Property ID: {property.tokenId}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card loan-form-container">
          <div className="section-header">
            <Calculator size={24} />
            <h3>Loan Details</h3>
          </div>
          <form onSubmit={handleSubmit} className="loan-form">
            <div className="form-group">
              <label htmlFor="loanAmount">
                <DollarSign size={16} />
                Loan Amount (ETH)
              </label>
              <input
                type="number"
                id="loanAmount"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                placeholder="Enter loan amount"
                min="0.001"
                step="0.001"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="interestRate">
                <Percent size={16} />
                Interest Rate (%)
              </label>
              <input
                type="number"
                id="interestRate"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="Enter interest rate"
                min="0.1"
                step="0.1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="durationMonths">
                <Clock size={16} />
                Duration (months)
              </label>
              <input
                type="number"
                id="durationMonths"
                value={durationMonths}
                onChange={(e) => setDurationMonths(e.target.value)}
                placeholder="Enter duration in months"
                min="1"
                max="60"
                required
              />
            </div>

            {loanDetails && (
              <div className="loan-preview">
                <h4>Loan Preview</h4>
                <div className="preview-details">
                  <div className="preview-item">
                    <span className="preview-label">Monthly Payment</span>
                    <span className="preview-value">{loanDetails.monthlyPayment.toFixed(4)} ETH</span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">Total Interest</span>
                    <span className="preview-value">{loanDetails.totalInterest.toFixed(4)} ETH</span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">Total Payment</span>
                    <span className="preview-value">{loanDetails.totalPayment.toFixed(4)} ETH</span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">Loan-to-Value Ratio</span>
                    <span className={`preview-value ${loanDetails.ltv > 80 ? 'warning' : ''}`}>
                      {loanDetails.ltv.toFixed(2)}%
                      {loanDetails.ltv > 80 && (
                        <span className="warning-tooltip">
                          High LTV ratio may affect loan approval
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="error-message">
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}

            {transactionStatus === 'success' && transactionHash && (
              <div className="success-message">
                <CheckCircle size={16} />
                <div>
                  <p>Loan request submitted successfully!</p>
                  <a
                    href={`https://etherscan.io/tx/${transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transaction-link"
                  >
                    View transaction
                  </a>
                </div>
              </div>
            )}

            <div className="form-actions">
              <ActionButton
                onClick={handleSubmit}
                disabled={transactionStatus === 'pending' || !loanDetails}
              >
                {transactionStatus === 'pending' ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Request Loan'
                )}
              </ActionButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoanRequest;
