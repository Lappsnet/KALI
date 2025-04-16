"use client"

import { Link, useLocation } from "react-router-dom"
import { Home, Building, Wallet, Settings, BarChart2, DollarSign, CreditCard } from "lucide-react"

export const Sidebar = () => {
  const location = useLocation()

  const sidebarItems = [
    { name: "Overview", path: "/dashboard", icon: <Home size={20} /> },
    { name: "Mint Properties", path: "/dashboard/mint-properties", icon: <Building size={20} /> },
    { name: "Sale Properties", path: "/dashboard/sale-properties", icon: <DollarSign size={20} /> },
    { name: "My Loans", path: "/loans", icon: <CreditCard size={20} /> },
    { name: "Wallet", path: "/wallet", icon: <Wallet size={20} /> },
    { name: "Analytics", path: "/analytics", icon: <BarChart2 size={20} /> },
    { name: "Settings", path: "/settings", icon: <Settings size={20} /> },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {sidebarItems.map((item) => (
              <li key={item.path} className="sidebar-menu-item">
                <Link to={item.path} className={`sidebar-link ${location.pathname === item.path ? "active" : ""}`}>
                  <span className="sidebar-icon">{item.icon}</span>
                  <span className="sidebar-text">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  )
}
