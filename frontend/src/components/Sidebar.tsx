"use client"

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Building, 
  List, 
  Wallet, 
  Settings, 
  Shield, 
  User, 
  PlusSquare,
  Coins,
  Key,
  BarChart,
  FileText,
  Users,
  BookOpen,
  DollarSign,
  Percent,
  History
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const mainNavItems = [
    { path: '/launch', label: 'Launch', icon: <Home size={20} /> },
    { path: '/dashboard', label: 'Dashboard', icon: <BarChart size={20} /> },
    { path: '/marketplace', label: 'Marketplace', icon: <Building size={20} /> },
  ];

  const propertyItems = [
    { path: '/list-property', label: 'List Property', icon: <PlusSquare size={20} /> },
    { path: '/dashboard/properties', label: 'My Properties', icon: <Building size={20} /> },
    { path: '/dashboard/sale-properties', label: 'Sale Properties', icon: <DollarSign size={20} /> },
  ];

  const financeItems = [
    { path: '/my-tokens', label: 'My Tokens', icon: <Coins size={20} /> },
    { path: '/loans', label: 'My Loans', icon: <Wallet size={20} /> },
    { path: '/dashboard/request-loan', label: 'Request Loan', icon: <Wallet size={20} /> },
    { path: '/token-market', label: 'Loans Market', icon: <BarChart size={20} /> },
    { path: '/yield', label: 'Yield', icon: <Percent size={20} /> },
  ];

  const documentsItems = [
    { path: '/dashboard/documents', label: 'Property Documents', icon: <FileText size={20} /> },
    { path: '/dashboard/listings', label: 'Active Listings', icon: <List size={20} /> },
    { path: '/dashboard/sales-history', label: 'Sale History', icon: <History size={20} /> },
  ];

  const adminItems = [
    { path: '/dashboard/notary', label: 'Notary Panel', icon: <Shield size={20} /> },
    { path: '/dashboard/access', label: 'Access Control', icon: <Key size={20} /> },
    { path: '/dashboard/users', label: 'User Registry', icon: <Users size={20} /> },
  ];

  const settingsItems = [
    { path: '/dashboard/profile', label: 'Profile', icon: <User size={20} /> },
    { path: '/dashboard/security', label: 'Security', icon: <Shield size={20} /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const renderNavSection = (items: any[], title?: string) => (
    <div className="nav-section">
      {title && <h3 className="nav-section-title">{title}</h3>}
      {items.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
        >
          {item.icon}
          <span>{item.label}</span>
        </Link>
      ))}
    </div>
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">KALI</h1>
        <p className="sidebar-subtitle">Decentralized Real Estate Platform</p>
      </div>

      <nav className="sidebar-nav">
        {renderNavSection(mainNavItems)}
        {renderNavSection(propertyItems, 'Property Management')}
        {renderNavSection(financeItems, 'Finance')}
        {renderNavSection(documentsItems, 'Documents')}
        {renderNavSection(adminItems, 'Administration')}
        {renderNavSection(settingsItems, 'Account')}
      </nav>

      <div className="sidebar-footer">
        <div className="legal-links">
          <Link to="/terms" className="legal-link">Terms of Service</Link>
          <Link to="/privacy" className="legal-link">Privacy Policy</Link>
        </div>
        <div className="copyright">
          © {new Date().getFullYear()} KALI
        </div>
      </div>
    </aside>
  );
};
