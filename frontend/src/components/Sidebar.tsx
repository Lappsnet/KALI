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
  BookOpen
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
    { path: '/my-properties', label: 'My Properties', icon: <Building size={20} /> },
  ];

  const financeItems = [
    { path: '/my-tokens', label: 'My Tokens', icon: <Coins size={20} /> },
    { path: '/my-loans', label: 'My Loans', icon: <Wallet size={20} /> },
  ];

  const notaryItems = [
    { path: '/notary/dashboard', label: 'Notary Dashboard', icon: <FileText size={20} /> },
    { path: '/notary/requests', label: 'Verification Requests', icon: <List size={20} /> },
    { path: '/notary/documents', label: 'Documents', icon: <BookOpen size={20} /> },
  ];

  const adminItems = [
    { path: '/admin/dashboard', label: 'Admin Panel', icon: <Shield size={20} /> },
    { path: '/admin/users', label: 'User Management', icon: <Users size={20} /> },
    { path: '/admin/properties', label: 'Property Management', icon: <Building size={20} /> },
  ];

  const settingsItems = [
    { path: '/wallet', label: 'Wallet', icon: <Wallet size={20} /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
    { path: '/security', label: 'Security', icon: <Shield size={20} /> },
    { path: '/profile', label: 'Profile', icon: <User size={20} /> },
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
        {renderNavSection(notaryItems, 'Notary Services')}
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
