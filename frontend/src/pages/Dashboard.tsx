"use client"

import { useAppKitAccount } from "@reown/appkit/react"

export const Dashboard = () => {
  const { address, isConnected } = useAppKitAccount()

  return (
    <div className="page-container">
      {!isConnected ? (
        <div className="connect-prompt">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to view your dashboard</p>
          <appkit-button />
        </div>
      ) : (
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>Welcome back!</p>
        </div>
      )}
    </div>
  )
} 