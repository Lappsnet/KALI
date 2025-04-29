"use client"

import { useAppKitAccount } from "@reown/appkit/react"
import { useBalance } from "wagmi"
import { Link } from "react-router-dom"
import { Building, DollarSign, BarChart2, Wallet } from "lucide-react"

export const Dashboard = () => {
  const { address, isConnected } = useAppKitAccount()
  const { data: balanceData } = useBalance({
    address: address as `0x${string}`,
  })

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
        <h1>Dashboard</h1>
        <p>Welcome to your property dashboard</p>
      </div>

      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-icon">
            <Building size={24} />
          </div>
          <div className="stat-content">
            <h3>My Properties</h3>
            <div className="stat-value">3</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Value</h3>
            <div className="stat-value">$1,250,000</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon">
            <Wallet size={24} />
          </div>
          <div className="stat-content">
            <h3>Wallet Balance</h3>
            <div className="stat-value">
              {balanceData ? `${balanceData.formatted} ${balanceData.symbol}` : "Loading..."}
            </div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon">
            <BarChart2 size={24} />
          </div>
          <div className="stat-content">
            <h3>Network</h3>
            <div className="stat-value">{"Not connected"}</div>
          </div>
        </div>
      </div>

      <div className="section-header">
        <h2>Quick Actions</h2>
      </div>

      <div className="actions-grid">
        <Link to="/dashboard/mint-properties" className="glass-card action-card">
          <h3>Mint Properties</h3>
          <p>Create new property tokens</p>
          <Building className="action-icon" size={32} />
        </Link>

        <Link to="/dashboard/sale-properties" className="glass-card action-card">
          <h3>Sale Properties</h3>
          <p>Manage your property listings</p>
          <DollarSign className="action-icon" size={32} />
        </Link>

        <Link to="/marketplace" className="glass-card action-card">
          <h3>Marketplace</h3>
          <p>Browse available properties</p>
          <BarChart2 className="action-icon" size={32} />
        </Link>
      </div>

      <div className="section-header">
        <h2>Recent Activity</h2>
      </div>

      <div className="glass-card activity-card">
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">
              <Building size={16} />
            </div>
            <div className="activity-content">
              <p className="activity-text">
                Property minted: <strong>123 Main St</strong>
              </p>
              <p className="activity-time">2 hours ago</p>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">
              <DollarSign size={16} />
            </div>
            <div className="activity-content">
              <p className="activity-text">
                Property listed: <strong>456 Oak Ave</strong>
              </p>
              <p className="activity-time">1 day ago</p>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">
              <Wallet size={16} />
            </div>
            <div className="activity-content">
              <p className="activity-text">Wallet connected</p>
              <p className="activity-time">2 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
