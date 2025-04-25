"use client"

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppKitAccount } from '@reown/appkit/react';
import { useRealEstateContract } from '../hooks/useRealEstateContract';
import { useLendingProtocolContract } from '../hooks/useLendingProtocolContract';
import { mockProperties } from '../../mocks/loanData';
import { parseEther, formatEther } from 'viem';
import { ActionButton } from "../ActionButton"
import { Calculator, DollarSign, Loader, Clock, Percent } from "lucide-react"

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

const LoanRequest: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected } = useAppKitAccount();
  const { getPropertyDetails } = useRealEstateContract();
  const { requestLoan } = useLendingProtocolContract();

  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [durationMonths, setDurationMonths] = useState('');
  const [documentUri, setDocumentUri] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        // For now, just use the first mock property
        const mockProperty = mockProperties[0];
        if (mockProperty) {
          setProperty({
            tokenId: mockProperty.tokenId.toString(),
            metadata: mockProperty.metadata,
            cadastralNumber: mockProperty.cadastralNumber.toString(),
            location: mockProperty.location,
            valuation: mockProperty.valuation.toString()
          });
        } else {
          setError('No properties available');
        }
      } catch (err) {
        console.error('Error fetching property details:', err);
        setError('Failed to fetch property details');
      }
    };

    fetchPropertyDetails();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setTransactionStatus('pending');

    if (!property) {
      setError('No property selected');
      setTransactionStatus('error');
      return;
    }

    try {
      const result = await requestLoan(
        BigInt(property.tokenId),
        loanAmount,
        Math.floor(parseFloat(interestRate) * 100), // Convert to basis points
        parseInt(durationMonths) * 30 // Convert months to days
      );

      if (result) {
        setTransactionStatus('success');
        setTransactionHash(result.toString());
        // Reset form
        setLoanAmount('');
        setInterestRate('');
        setDurationMonths('');
        setDocumentUri('');
      }
    } catch (err) {
      console.error('Error requesting loan:', err);
      setError('Failed to request loan');
      setTransactionStatus('error');
    }
  };

  if (!property) {
    return <div className="card">Loading property details...</div>;
  }

  return (
    <div className="card">
      <div className="form-header">
        <h3>Request Loan</h3>
        <p>Use your property as collateral to secure a loan</p>
      </div>

      <div className="property-details">
        <h4>{property.metadata?.name || 'Unnamed Property'}</h4>
        <p>Location: {property.location}</p>
        <p>Valuation: {formatEther(BigInt(property.valuation))} ETH</p>
      </div>

      <form onSubmit={handleSubmit} className="loan-form">
        <div className="form-group">
          <label htmlFor="loanAmount">Loan Amount (ETH)</label>
          <input
            type="number"
            id="loanAmount"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            placeholder="Enter loan amount"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="interestRate">Interest Rate (%)</label>
          <input
            type="number"
            id="interestRate"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            placeholder="Enter interest rate"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="durationMonths">Duration (months)</label>
          <input
            type="number"
            id="durationMonths"
            value={durationMonths}
            onChange={(e) => setDurationMonths(e.target.value)}
            placeholder="Enter duration in months"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="documentUri">Document URI</label>
          <input
            type="text"
            id="documentUri"
            value={documentUri}
            onChange={(e) => setDocumentUri(e.target.value)}
            placeholder="Enter document URI"
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        {transactionStatus === 'success' && transactionHash && (
          <div className="success-message">
            <p>Loan request submitted successfully!</p>
            <a
              href={`https://etherscan.io/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View transaction
            </a>
          </div>
        )}

        <button
          type="submit"
          className="button button-primary"
          disabled={transactionStatus === 'pending'}
        >
          {transactionStatus === 'pending' ? 'Submitting...' : 'Request Loan'}
        </button>
      </form>
    </div>
  );
};

export default LoanRequest;
