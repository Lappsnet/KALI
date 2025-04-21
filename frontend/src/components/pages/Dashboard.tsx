"use client"

import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react"
import { useBalance } from "wagmi"
import { Link } from "react-router-dom"
import { Building, DollarSign, BarChart2, Wallet, TrendingUp, ChartPie, Activity } from "lucide-react"

export const Dashboard = () => {
  const { address, isConnected } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()

  const { data: balanceData } = useBalance({
    address: address as `0x${string}`,
  })

  const portfolioMetrics = {
    totalValue: 124567.89,
    dailyChange: 2345.67,
    dailyChangePercent: 5.2,
    totalProfitLoss: 34567.89,
    plPercent: 28.4,
    bestPerformer: "TRUMP",
    bestPerformerPercent: 156.7,
  }

  const riskMetrics = {
    portfolioBeta: 1.2,
    sharpeRatio: 2.1,
    volatility: 32.5,
    maxDrawdown: -25.3,
  }

  const assetAllocation = [
    { name: "Layer 1", percentage: 25 },
    { name: "Meme Coins", percentage: 35 },
    { name: "DeFi", percentage: 20 },
    { name: "NFTs", percentage: 10 },
    { name: "Stablecoins", percentage: 10 },
  ]

  const activityStats = {
    activeBets: { count: 3, value: 2800 },
    wonBets: { count: 28, total: 42 },
    lostBets: { count: 11, rate: 33.3 },
    launchedTokens: { count: 12 },
    trendingTokens: { count: 3 },
  }

  if (!isConnected) {
    return (
      <div className="page-container">
        <div className="hero-section">
          <h1 className="hero-title">KALI</h1>
          <p className="hero-subtitle">Real Estate Marketplace on the Pharos Network</p>
          <div className="hero-actions">
            <appkit-button />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Portfolio Snapshot</h1>
        <p>Track your real estate investments</p>
      </div>

      <div className="metrics-grid">
        <div className="glass-card metric-card">
          <div className="metric-header">
            <h3>Total Value</h3>
            <Wallet className="metric-icon" />
          </div>
          <div className="metric-value">
            ${portfolioMetrics.totalValue.toLocaleString()}
            <span className="metric-change positive">+{portfolioMetrics.dailyChangePercent}%</span>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-header">
            <h3>24h Change</h3>
            <TrendingUp className="metric-icon" />
          </div>
          <div className="metric-value">
            ${portfolioMetrics.dailyChange.toLocaleString()}
            <span className="metric-change positive">+{portfolioMetrics.dailyChangePercent}%</span>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-header">
            <h3>Total P/L</h3>
            <DollarSign className="metric-icon" />
          </div>
          <div className="metric-value">
            ${portfolioMetrics.totalProfitLoss.toLocaleString()}
            <span className="metric-change positive">+{portfolioMetrics.plPercent}%</span>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-header">
            <h3>Best Performer</h3>
            <BarChart2 className="metric-icon" />
          </div>
          <div className="metric-value">
            {portfolioMetrics.bestPerformer}
            <span className="metric-change positive">+{portfolioMetrics.bestPerformerPercent}%</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="glass-card chart-card">
          <div className="card-header">
            <h3>Portfolio Performance</h3>
            <div className="chart-controls">
              <select className="time-selector">
                <option value="1M">1M</option>
                <option value="3M">3M</option>
                <option value="1Y">1Y</option>
                <option value="ALL">ALL</option>
              </select>
            </div>
          </div>
          <div className="chart-container">
            {/* Chart component will go here */}
            <div className="placeholder-chart" />
          </div>
        </div>

        <div className="dashboard-sidebar">
          <div className="glass-card">
            <div className="card-header">
              <h3>Asset Allocation</h3>
              <ChartPie size={20} />
            </div>
            <div className="allocation-list">
              {assetAllocation.map((asset) => (
                <div key={asset.name} className="allocation-item">
                  <div className="allocation-label">
                    <span className={`allocation-dot ${asset.name.toLowerCase().replace(' ', '-')}`} />
                    <span>{asset.name}</span>
                  </div>
                  <span className="allocation-value">{asset.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card">
            <div className="card-header">
              <h3>Risk Metrics</h3>
              <Activity size={20} />
            </div>
            <div className="risk-metrics">
              <div className="risk-metric">
                <span>Portfolio Beta</span>
                <span className="metric-value">{riskMetrics.portfolioBeta}</span>
              </div>
              <div className="risk-metric">
                <span>Sharpe Ratio</span>
                <span className="metric-value">{riskMetrics.sharpeRatio}</span>
              </div>
              <div className="risk-metric">
                <span>Volatility</span>
                <span className="metric-value">{riskMetrics.volatility}%</span>
              </div>
              <div className="risk-metric">
                <span>Max Drawdown</span>
                <span className="metric-value">{riskMetrics.maxDrawdown}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="glass-card stat-section">
          <h3>My Bets</h3>
          <div className="stats-container">
            <div className="stat-item">
              <div className="stat-label">Active</div>
              <div className="stat-value">{activityStats.activeBets.count}</div>
              <div className="stat-subtext">Value: ${activityStats.activeBets.value}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Won</div>
              <div className="stat-value">{activityStats.wonBets.count}</div>
              <div className="stat-subtext">of {activityStats.wonBets.total} total</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Lost</div>
              <div className="stat-value">{activityStats.lostBets.count}</div>
              <div className="stat-subtext">Rate: {activityStats.lostBets.rate}%</div>
            </div>
          </div>
        </div>

        <div className="glass-card stat-section">
          <h3>Launched Tokens</h3>
          <div className="stats-container">
            <div className="stat-item">
              <div className="stat-label">Total Launched</div>
              <div className="stat-value">{activityStats.launchedTokens.count}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Trending</div>
              <div className="stat-value">{activityStats.trendingTokens.count}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 