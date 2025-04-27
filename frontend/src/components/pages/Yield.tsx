"use client"

import React, { useState, useEffect } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { useLendingProtocolContract } from '../hooks/useLendingProtocolContract';
import { formatEther } from 'viem';
import { ActionButton } from "../ActionButton";
import { DollarSign, TrendingUp, Clock, ArrowUpRight, Loader, AlertTriangle, CheckCircle, History, Calendar } from "lucide-react";
import "./Yield.css";

interface YieldMetrics {
  totalYield: string;
  dailyYield: string;
  monthlyYield: string;
  annualYield: string;
}

interface YieldHistory {
  date: string;
  amount: string;
  type: 'claim' | 'accrual';
  transactionHash?: string;
}

// Mock data for yield metrics
const mockYieldMetrics: YieldMetrics = {
  totalYield: "5000000000000000000", // 5 ETH in wei
  dailyYield: "100000000000000000", // 0.1 ETH in wei
  monthlyYield: "3000000000000000000", // 3 ETH in wei
  annualYield: "36000000000000000000" // 36 ETH in wei
};

// Mock data for yield history
const mockYieldHistory: YieldHistory[] = [
  {
    date: "2024-03-15",
    amount: "1000000000000000000", // 1 ETH
    type: "claim",
    transactionHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
  },
  {
    date: "2024-03-10",
    amount: "500000000000000000", // 0.5 ETH
    type: "accrual"
  },
  {
    date: "2024-03-05",
    amount: "300000000000000000", // 0.3 ETH
    type: "accrual"
  },
  {
    date: "2024-02-28",
    amount: "2000000000000000000", // 2 ETH
    type: "claim",
    transactionHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
  },
  {
    date: "2024-02-25",
    amount: "400000000000000000", // 0.4 ETH
    type: "accrual"
  }
];

export const Yield: React.FC = () => {
  const { address, isConnected } = useAppKitAccount();
  const { isLoading: isLoadingContract } = useLendingProtocolContract();

  const [metrics, setMetrics] = useState<YieldMetrics | null>(mockYieldMetrics);
  const [history, setHistory] = useState<YieldHistory[]>(mockYieldHistory);
  const [error, setError] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchYieldMetrics = async () => {
      if (!isConnected || !address) return;

      setIsLoading(true);
      try {
        // TODO: Replace with actual contract call
        // const yieldMetrics = await getYieldMetrics(address);
        // For now, use mock data
        setMetrics(mockYieldMetrics);
      } catch (err) {
        console.error('Error fetching yield metrics:', err);
        setError('Failed to fetch yield metrics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchYieldMetrics();
  }, [isConnected, address]);

  const handleClaimYield = async () => {
    if (!isConnected || !address) return;

    setError(null);
    setTransactionStatus('pending');

    try {
      // TODO: Replace with actual contract call
      // const result = await claimYield();
      // For now, simulate a successful transaction
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
      const mockHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      setTransactionStatus('success');
      setTransactionHash(mockHash);
      
      // Add to history
      const newHistory = [{
        date: new Date().toISOString().split('T')[0],
        amount: metrics?.totalYield || "0",
        type: "claim" as const,
        transactionHash: mockHash
      }, ...history];
      setHistory(newHistory);
      
      // Reset metrics after claiming
      setMetrics({
        ...mockYieldMetrics,
        totalYield: "0" // Reset total yield after claiming
      });
    } catch (err) {
      console.error('Error claiming yield:', err);
      setError('Failed to claim yield');
      setTransactionStatus('error');
    }
  };

  if (!isConnected) {
    return (
      <div className="page-container">
        <div className="connect-prompt">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to view your yield metrics</p>
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
          <p>Loading yield metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Yield Dashboard</h1>
        <p>Track and manage your investment yields</p>
      </div>

      <div className="yield-metrics-container">
        <div className="glass-card total-yield">
          <div className="metric-header">
            <h3>Total Yield</h3>
            <DollarSign className="metric-icon" />
          </div>
          <div className="metric-value">
            {metrics ? formatEther(BigInt(metrics.totalYield)) : '0'} ETH
          </div>
          <div className="metric-trend">
            <TrendingUp size={16} />
            <span>All time</span>
          </div>
        </div>

        <div className="glass-card yield-breakdown">
          <div className="metric-header">
            <h3>Yield Breakdown</h3>
            <Clock className="metric-icon" />
          </div>
          <div className="breakdown-grid">
            <div className="breakdown-item">
              <span className="breakdown-label">Daily</span>
              <span className="breakdown-value">
                {metrics ? formatEther(BigInt(metrics.dailyYield)) : '0'} ETH
              </span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Monthly</span>
              <span className="breakdown-value">
                {metrics ? formatEther(BigInt(metrics.monthlyYield)) : '0'} ETH
              </span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Annual</span>
              <span className="breakdown-value">
                {metrics ? formatEther(BigInt(metrics.annualYield)) : '0'} ETH
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="yield-actions">
        <div className="glass-card">
          <div className="action-header">
            <h3>Claim Your Yield</h3>
            <ArrowUpRight className="action-icon" />
          </div>
          <p className="action-description">
            Claim your accumulated yield and transfer it to your wallet
          </p>

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
                <p>Yield claimed successfully!</p>
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

          <div className="action-button">
            <ActionButton
              onClick={handleClaimYield}
              disabled={transactionStatus === 'pending' || !metrics || BigInt(metrics.totalYield) === BigInt(0)}
            >
              {transactionStatus === 'pending' ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Claiming...
                </>
              ) : (
                'Claim Yield'
              )}
            </ActionButton>
          </div>
        </div>
      </div>

      <div className="yield-history">
        <div className="glass-card">
          <div className="history-header">
            <div className="header-left">
              <History size={24} />
              <h3>Yield History</h3>
            </div>
            <Calendar size={20} />
          </div>
          <div className="history-list">
            {history.map((item, index) => (
              <div key={index} className="history-item">
                <div className="history-date">
                  {new Date(item.date).toLocaleDateString()}
                </div>
                <div className="history-details">
                  <div className="history-type">
                    {item.type === 'claim' ? 'Claimed' : 'Accrued'}
                  </div>
                  <div className="history-amount">
                    {formatEther(BigInt(item.amount))} ETH
                  </div>
                </div>
                {item.transactionHash && (
                  <a
                    href={`https://etherscan.io/tx/${item.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="history-link"
                  >
                    View transaction
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 