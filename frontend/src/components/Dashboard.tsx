"use client"

import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react"
import { useBalance } from "wagmi"
import { Activity, Wallet, FileCode, Network } from "lucide-react"
import { PropertyList } from "./PropertyList"
import { PropertyMetrics } from "./PropertyMetrics"
import { ErrorMessage } from "./common/ErrorMessage"

export const Dashboard = () => {
  const { address, isConnected } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()

  const { data: balanceData, error: balanceError } = useBalance({
    address: address ? address as `0x${string}` : undefined,
  })

  if (!isConnected) {
    return (
      <div className="dashboard-container">
        <div className="welcome-card">
          <h2>Welcome to Kali Marketplace</h2>
          <p>Connect your wallet to get started</p>
          <div className="connect-button-container">
            <appkit-button />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <p>Welcome to your dashboard</p>
      </div>

      {balanceError && (
        <ErrorMessage message="Failed to load wallet balance" />
      )}

      <div className="dashboard-section">
        <h3>Overview</h3>
        <div className="stats-grid">
          <div className="stat-card">
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

          <div className="stat-card">
            <div className="stat-icon">
              <Network size={24} />
            </div>
            <div className="stat-content">
              <h3>Network</h3>
              <div className="stat-value">
                {chainId === 50002 ? "Pharos Devnet" : "Unknown"} (ID: {chainId || "N/A"})
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Activity size={24} />
            </div>
            <div className="stat-content">
              <h3>Status</h3>
              <div className="stat-value">
                <span className="status-indicator active"></span> Active
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FileCode size={24} />
            </div>
            <div className="stat-content">
              <h3>Smart Contracts</h3>
              <div className="stat-value">{chainId === 50002 ? "Available" : "Switch to Pharos Devnet"}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <PropertyMetrics />
      </div>

      <div className="dashboard-section">
        <h3>Properties</h3>
        <PropertyList />
      </div>

      <div className="dashboard-cards">
        <div className="feature-card">
          <h3>Quick Actions</h3>
          <p>Perform common wallet operations</p>
          <button className="feature-button" onClick={() => (window.location.hash = "actions")}>
            Go to Actions
          </button>
        </div>

        <div className="feature-card">
          <h3>Smart Contracts</h3>
          <p>Interact with deployed contracts</p>
          <button className="feature-button" onClick={() => (window.location.hash = "contracts")}>
            View Contracts
          </button>
        </div>

        <div className="feature-card">
          <h3>Wallet Details</h3>
          <p>View detailed wallet information</p>
          <button className="feature-button" onClick={() => (window.location.hash = "info")}>
            View Details
          </button>
        </div>
      </div>
    </div>
  )
}
