"use client"

import { useAppKitAccount } from "@reown/appkit/react"
import { ActionButton } from "../ActionButton"
import { Building, DollarSign, BarChart2 } from "lucide-react"

export const Launch = () => {
  const { isConnected } = useAppKitAccount()

  return (
    <div className="page-container">
      <div className="hero-section">
        <div className="new-badge">NEW</div>
        <h1 className="hero-title">KALI</h1>
        <p className="hero-subtitle">Real Estate Marketplace on the Pharos Network</p>

        <div className="hero-description">
          <p>Tokenize, trade, and manage real estate properties with blockchain technology</p>
        </div>

        <div className="hero-actions">
          {isConnected ? (
            <ActionButton onClick={() => (window.location.href = "/dashboard")}>Go to Dashboard</ActionButton>
          ) : (
            <>
              <appkit-button />
              <ActionButton variant="outline">View Demo</ActionButton>
            </>
          )}
        </div>
      </div>

      <div className="features-section">
        <h2 className="section-title">Key Features</h2>

        <div className="features-grid">
          <div className="glass-card feature-card">
            <Building size={32} className="feature-icon" />
            <h3>Property Tokenization</h3>
            <p>Convert real estate assets into blockchain tokens for fractional ownership</p>
          </div>

          <div className="glass-card feature-card">
            <DollarSign size={32} className="feature-icon" />
            <h3>Property Marketplace</h3>
            <p>Buy and sell tokenized properties with transparent pricing and history</p>
          </div>

          <div className="glass-card feature-card">
            <BarChart2 size={32} className="feature-icon" />
            <h3>Portfolio Management</h3>
            <p>Track and manage your real estate investments in one dashboard</p>
          </div>
        </div>
      </div>
    </div>
  )
}
