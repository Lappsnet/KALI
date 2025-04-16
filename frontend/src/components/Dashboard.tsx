"use client"

import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react"
import { useBalance } from "wagmi"
import { Activity, Wallet, FileCode, Network } from "lucide-react"

export const Dashboard = () => {
  const { address, isConnected } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()

  const { data: balanceData } = useBalance({
    address: address ? address as `0x${string}` : undefined,
  })

  if (!isConnected) {
    return (
      <div className="dashboard-container">
        <div className="welcome-card">
          <h2>Welcome to Reown AppKit Dashboard</h2>
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
        <p>Welcome to your Web3 dashboard</p>
      </div>

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
              {chainId === 11155111 ? "Sepolia" : "Unknown"} (ID: {chainId || "N/A"})
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
            <div className="stat-value">{chainId === 11155111 ? "Available" : "Switch to Sepolia"}</div>
          </div>
        </div>
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
