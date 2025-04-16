"use client"

import { useAppKitAccount, useAppKitTheme } from "@reown/appkit/react"
import { Sun, Moon } from "lucide-react"

export const Header = () => {
  const { themeMode, setThemeMode } = useAppKitTheme()
  const { isConnected } = useAppKitAccount()

  const toggleTheme = () => {
    setThemeMode(themeMode === "dark" ? "light" : "dark")
  }

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-container">
          <img src="/reown.svg" alt="Reown" className="logo" />
          <h1>Reown AppKit Dashboard</h1>
        </div>

        <div className="header-actions">
          <button onClick={toggleTheme} className="theme-toggle">
            {themeMode === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="wallet-connect">
            {isConnected ? <div className="connected-status">Connected</div> : null}
            <appkit-button />
          </div>
        </div>
      </div>
    </header>
  )
}
