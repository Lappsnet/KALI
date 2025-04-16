"use client"

import type React from "react"

import { useState } from "react"
import { useAppKitAccount, useAppKitTheme } from "@reown/appkit/react"
import { ActionButton } from "../ActionButton"
import { Sun, Moon, User, Bell, Shield, LogOut } from "lucide-react"

export const Settings = () => {
  const { isConnected, address } = useAppKitAccount()
  const { themeMode, setThemeMode } = useAppKitTheme()

  const [notifications, setNotifications] = useState({
    transactions: true,
    listings: true,
    offers: true,
    news: false,
  })

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setNotifications({
      ...notifications,
      [name]: checked,
    })
  }

  if (!isConnected) {
    return (
      <div className="page-container">
        <div className="connect-prompt">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to access settings</p>
          <appkit-button />
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your account preferences</p>
      </div>

      <div className="settings-grid">
        <div className="glass-card settings-card">
          <div className="settings-header">
            <User size={20} />
            <h3>Account</h3>
          </div>

          <div className="settings-content">
            <div className="settings-item">
              <div className="settings-label">Wallet Address</div>
              <div className="settings-value address">{address}</div>
            </div>

            <div className="settings-item">
              <div className="settings-label">Connected Wallet</div>
              <div className="settings-value">MetaMask</div>
            </div>

            <div className="settings-actions">
              <ActionButton variant="outline" size="small">
                <LogOut size={16} />
                <span>Disconnect</span>
              </ActionButton>
            </div>
          </div>
        </div>

        <div className="glass-card settings-card">
          <div className="settings-header">
            {themeMode === "dark" ? <Moon size={20} /> : <Sun size={20} />}
            <h3>Appearance</h3>
          </div>

          <div className="settings-content">
            <div className="settings-item">
              <div className="settings-label">Theme</div>
              <div className="theme-toggle-container">
                <button
                  className={`theme-option ${themeMode === "light" ? "active" : ""}`}
                  onClick={() => setThemeMode("light")}
                >
                  <Sun size={16} />
                  <span>Light</span>
                </button>
                <button
                  className={`theme-option ${themeMode === "dark" ? "active" : ""}`}
                  onClick={() => setThemeMode("dark")}
                >
                  <Moon size={16} />
                  <span>Dark</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card settings-card">
          <div className="settings-header">
            <Bell size={20} />
            <h3>Notifications</h3>
          </div>

          <div className="settings-content">
            <div className="settings-item">
              <div className="settings-label">Email Notifications</div>
              <div className="settings-value">example@email.com</div>
            </div>

            <div className="notification-options">
              <div className="notification-option">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    name="transactions"
                    checked={notifications.transactions}
                    onChange={handleNotificationChange}
                  />
                  <span className="checkmark"></span>
                  <span>Transaction Updates</span>
                </label>
              </div>

              <div className="notification-option">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    name="listings"
                    checked={notifications.listings}
                    onChange={handleNotificationChange}
                  />
                  <span className="checkmark"></span>
                  <span>New Property Listings</span>
                </label>
              </div>

              <div className="notification-option">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    name="offers"
                    checked={notifications.offers}
                    onChange={handleNotificationChange}
                  />
                  <span className="checkmark"></span>
                  <span>Offers on Your Properties</span>
                </label>
              </div>

              <div className="notification-option">
                <label className="checkbox-container">
                  <input type="checkbox" name="news" checked={notifications.news} onChange={handleNotificationChange} />
                  <span className="checkmark"></span>
                  <span>Platform News & Updates</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card settings-card">
          <div className="settings-header">
            <Shield size={20} />
            <h3>Security</h3>
          </div>

          <div className="settings-content">
            <div className="settings-item">
              <div className="settings-label">Transaction Signing</div>
              <div className="settings-value">Enabled</div>
            </div>

            <div className="settings-item">
              <div className="settings-label">Login Notifications</div>
              <div className="settings-value">Enabled</div>
            </div>

            <div className="settings-actions">
              <ActionButton variant="outline" size="small">
                Manage Security Settings
              </ActionButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
