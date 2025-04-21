"use client"

import { useState, useEffect } from "react"
import { useAppKitAccount } from "@reown/appkit/react"
import { BarChart2, DollarSign, TrendingUp, Clock } from "lucide-react"
import { mockRentableTokens } from "../../types/property"

export const Yield = () => {
  const { isConnected } = useAppKitAccount()
  const [tokens, setTokens] = useState(mockRentableTokens)
  const [selectedToken, setSelectedToken] = useState<number | null>(null)

  const yieldStats = {
    totalYield: "0.75 ETH",
    averageYieldRate: "5%",
    bestPerformingToken: "Token #2",
    bestYieldRate: "7.5%",
    totalTokens: tokens.length,
  }

  if (!isConnected) {
    return (
      <div className="page-container">
        <div className="connect-prompt">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to view yield history</p>
          <appkit-button />
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Yield History</h1>
        <p>Track your token yields and performance</p>
      </div>

      <div className="metrics-grid">
        <div className="glass-card metric-card">
          <div className="metric-header">
            <h3>Total Yield</h3>
            <DollarSign className="metric-icon" />
          </div>
          <div className="metric-value">{yieldStats.totalYield}</div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-header">
            <h3>Average Yield Rate</h3>
            <TrendingUp className="metric-icon" />
          </div>
          <div className="metric-value">{yieldStats.averageYieldRate}</div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-header">
            <h3>Best Performing</h3>
            <BarChart2 className="metric-icon" />
          </div>
          <div className="metric-value">
            {yieldStats.bestPerformingToken}
            <span className="metric-change positive">+{yieldStats.bestYieldRate}</span>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-header">
            <h3>Total Tokens</h3>
            <Clock className="metric-icon" />
          </div>
          <div className="metric-value">{yieldStats.totalTokens}</div>
        </div>
      </div>

      <div className="section-header">
        <h2>Your Tokens</h2>
      </div>

      <div className="tokens-grid">
        {tokens.map((token) => (
          <div
            key={token.id}
            className={`glass-card token-card ${selectedToken === token.id ? "selected" : ""}`}
            onClick={() => setSelectedToken(token.id)}
          >
            <div className="token-header">
              <h3>Token #{token.id}</h3>
              <div className="token-status">
                <span className="status-badge active">Active</span>
              </div>
            </div>

            <div className="token-details">
              <div className="token-info">
                <span className="info-label">Balance</span>
                <span className="info-value">{token.balance}</span>
              </div>
              <div className="token-info">
                <span className="info-label">Yield Rate</span>
                <span className="info-value">{token.yieldRate / 100}%</span>
              </div>
              <div className="token-info">
                <span className="info-label">Accumulated Yield</span>
                <span className="info-value">{token.accumulatedYield}</span>
              </div>
              <div className="token-info">
                <span className="info-label">Last Yield</span>
                <span className="info-value">
                  {new Date(token.lastYieldTime).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="token-actions">
              <button className="action-button">Claim Yield</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 