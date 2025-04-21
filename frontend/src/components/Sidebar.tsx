"use client"

import { Link, useLocation } from "react-router-dom"
import { 
  Home, 
  Building, 
  Wallet, 
  Settings, 
  BarChart2, 
  DollarSign, 
  CreditCard,
  FileText,
  Users,
  Key,
  Lock,
  Gavel,
  Tag,
  Banknote,
  Receipt,
  Shield,
  UserCog
} from "lucide-react"
import { useState } from "react"

export const Sidebar = () => {
  const location = useLocation()
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const sidebarSections = [
    {
      title: "Overview",
      items: [
        { name: "Dashboard", path: "/dashboard", icon: <Home size={20} /> },
        { name: "Marketplace", path: "/marketplace", icon: <Tag size={20} /> },
      ]
    },
    {
      title: "Real Estate NFTs",
      items: [
        { name: "My Properties", path: "/dashboard/properties", icon: <Building size={20} /> },
        { name: "Mint Property", path: "/dashboard/mint-properties", icon: <Key size={20} /> },
        { name: "Property Documents", path: "/dashboard/documents", icon: <FileText size={20} /> },
      ]
    },
    {
      title: "Property Sales",
      items: [
        { name: "List Property", path: "/dashboard/sale-properties", icon: <DollarSign size={20} /> },
        { name: "Active Listings", path: "/dashboard/listings", icon: <Tag size={20} /> },
        { name: "Sale History", path: "/dashboard/sales-history", icon: <BarChart2 size={20} /> },
      ]
    },
    {
      title: "Rentable Tokens",
      items: [
        { name: "My Tokens", path: "/my-tokens", icon: <CreditCard size={20} /> },
        { name: "Token Market", path: "/token-market", icon: <DollarSign size={20} /> },
        { name: "Yield History", path: "/yield", icon: <BarChart2 size={20} /> },
      ]
    },
    {
      title: "DeFi & Loans",
      items: [
        { name: "Request Loan", path: "/dashboard/request-loan", icon: <Banknote size={20} /> },
        { name: "My Loans", path: "/loans", icon: <Receipt size={20} /> },
        { name: "Loan Details", path: "/loan/:id", icon: <FileText size={20} /> },
      ]
    },
    {
      title: "Administration",
      items: [
        { name: "Notary Panel", path: "/dashboard/notary", icon: <Gavel size={20} /> },
        { name: "Access Control", path: "/dashboard/access", icon: <Lock size={20} /> },
        { name: "User Registry", path: "/dashboard/users", icon: <Users size={20} /> },
      ]
    },
    {
      title: "Account",
      items: [
        { name: "Wallet", path: "/wallet", icon: <Wallet size={20} /> },
        { name: "Settings", path: "/settings", icon: <Settings size={20} /> },
        { name: "Security", path: "/dashboard/security", icon: <Shield size={20} /> },
        { name: "Profile", path: "/dashboard/profile", icon: <UserCog size={20} /> },
      ]
    }
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <nav className="sidebar-nav">
          {sidebarSections.map((section) => (
            <div key={section.title} className="sidebar-section">
              <button 
                className="sidebar-section-header"
                onClick={() => toggleSection(section.title)}
              >
                <span>{section.title}</span>
                <span className={`expand-icon ${expandedSection === section.title ? 'expanded' : ''}`}>
                  ▼
                </span>
              </button>
              <ul className={`sidebar-menu ${expandedSection === section.title ? 'expanded' : ''}`}>
                {section.items.map((item) => (
                  <li key={item.path} className="sidebar-menu-item">
                    <Link 
                      to={item.path} 
                      className={`sidebar-link ${location.pathname === item.path ? "active" : ""}`}
                    >
                      <span className="sidebar-icon">{item.icon}</span>
                      <span className="sidebar-text">{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  )
}
