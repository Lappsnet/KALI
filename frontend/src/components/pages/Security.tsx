"use client"

import { useState } from "react"
import { useAppKitAccount } from "@reown/appkit/react"
import { Shield, Key, Lock, Unlock, QrCode, Bell } from "lucide-react"

export const Security = () => {
  const { isConnected, address } = useAppKitAccount()
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [showQRCode, setShowQRCode] = useState(false)

  const handleToggle2FA = async () => {
    // TODO: Implement 2FA toggle logic
    console.log("Toggling 2FA:", !twoFactorEnabled)
    setTwoFactorEnabled(!twoFactorEnabled)
  }

  const handleToggleNotifications = async () => {
    // TODO: Implement notifications toggle logic
    console.log("Toggling notifications:", !notificationsEnabled)
    setNotificationsEnabled(!notificationsEnabled)
  }

  if (!isConnected) {
    return (
      <div className="page-container">
        <div className="connect-prompt">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to access security settings</p>
          <appkit-button />
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Security Settings</h1>
        <p>Manage your account security and preferences</p>
      </div>

      <div className="security-settings">
        <div className="setting-card">
          <div className="setting-header">
            <div className="setting-icon">
              <Shield size={24} />
            </div>
            <div className="setting-title">
              <h3>Two-Factor Authentication</h3>
              <p>Add an extra layer of security to your account</p>
            </div>
            <button
              className={`toggle-button ${twoFactorEnabled ? "enabled" : "disabled"}`}
              onClick={handleToggle2FA}
            >
              {twoFactorEnabled ? <Lock size={16} /> : <Unlock size={16} />}
              <span>{twoFactorEnabled ? "Enabled" : "Disabled"}</span>
            </button>
          </div>
          {twoFactorEnabled && (
            <div className="setting-content">
              <div className="qr-code-section">
                <QrCode size={64} />
                <p>Scan this QR code with your authenticator app</p>
                <button
                  className="show-qr-button"
                  onClick={() => setShowQRCode(!showQRCode)}
                >
                  {showQRCode ? "Hide QR Code" : "Show QR Code"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="setting-card">
          <div className="setting-header">
            <div className="setting-icon">
              <Bell size={24} />
            </div>
            <div className="setting-title">
              <h3>Security Notifications</h3>
              <p>Receive alerts about account activity</p>
            </div>
            <button
              className={`toggle-button ${notificationsEnabled ? "enabled" : "disabled"}`}
              onClick={handleToggleNotifications}
            >
              {notificationsEnabled ? <Bell size={16} /> : <Bell size={16} />}
              <span>{notificationsEnabled ? "Enabled" : "Disabled"}</span>
            </button>
          </div>
        </div>

        <div className="setting-card">
          <div className="setting-header">
            <div className="setting-icon">
              <Key size={24} />
            </div>
            <div className="setting-title">
              <h3>Recovery Phrase</h3>
              <p>Backup your account recovery phrase</p>
            </div>
            <button className="action-button">
              View Recovery Phrase
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 