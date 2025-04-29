"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAppKitAccount } from "@reown/appkit/react"
import { Menu } from "lucide-react"

export const Navbar = () => {
  const location = useLocation()
  useAppKitAccount()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Marketplace", path: "/marketplace" },
    { name: "Pitch Deck", path: "https://kali-pitch-deck.netlify.app/" },
  ]

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <span className="logo-text">KALI</span>
          </Link>
        </div>

        <button className="mobile-menu-button" onClick={toggleMobileMenu}>
          <Menu size={24} />
        </button>

        <nav className={`navbar-links ${mobileMenuOpen ? "mobile-open" : ""}`}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? "active" : ""}`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="navbar-actions">
          <appkit-button />
        </div>
      </div>
    </header>
  )
}
