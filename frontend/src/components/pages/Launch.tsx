"use client"

import React from 'react';
import { useAppKitAccount } from "@reown/appkit/react"
import { Building, Globe, TrendingUp, Shield, Zap, ChevronRight, Key } from "lucide-react"
import EcosystemDiagram from '../EcosystemDiagram';
import '../../styles/EcosystemDiagram.css';
import { useNavigate } from 'react-router-dom';
import ChatAgent from '../ChatAgent';

export const Launch: React.FC = () => {
  const { isConnected } = useAppKitAccount();
  const navigate = useNavigate();

  const features = [
    {
      icon: Building,
      title: "Tokenized Real Estate",
      description: "Access fractional ownership of premium properties through secure tokenization standards"
    },
    {
      icon: Globe,
      title: "Global Access",
      description: "Invest in real estate worldwide, breaking down geographical barriers"
    },
    {
      icon: Zap,
      title: "One-Click Investment",
      description: "Start your real estate journey with our streamlined, user-friendly platform"
    },
    {
      icon: TrendingUp,
      title: "Earn Passive Income",
      description: "Generate yields through property appreciation and rental income"
    },
    {
      icon: Shield,
      title: "Bank-Grade Security",
      description: "Your investments are protected by blockchain technology and smart contracts"
    },
    {
      icon: Key,
      title: "Full Compliance",
      description: "KYC/AML verified platform ensuring legal and regulatory compliance"
    }
  ];

  return (
    <div className="">
      <div className="">
        <div className="launch-container">
          {/* Hero Section */}
          <div className="launch-hero">
            <div className="launch-badge">
              <Zap size={16} className="launch-badge-icon" />
              <span>Revolutionary Real Estate Platform</span>
            </div>
            
            <h1 className="launch-title">
              <span>K</span>
              <span>A</span>
              <span>L</span>
              <span>I</span>
            </h1>
            
            <h2 className="launch-subtitle">
              Rent - Buy - Invest
              <br />
              <span className="highlight">In Real Estate Around the World</span>
              <br />
            </h2>
            
            <p className="launch-description">
              Experience the future of real estate investment. KALI transforms traditional property 
              ownership into a seamless digital experience, offering fractional ownership, instant 
              liquidity, and secure blockchain-backed transactions.
            </p>

            <div className="launch-cta">
              <button 
                onClick={() => navigate('/marketplace')}
                className="cta-button primary"
              >
                Explore Properties
                <ChevronRight className="button-icon" />
              </button>
              
              <button 
                onClick={() => window.open('https://github.com/Lappsnet/KALI.git', '_blank')}
                className="cta-button secondary"
              >
                GitHub Repo
                <ChevronRight className="button-icon" />
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <feature.icon />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Ecosystem Section */}
          <div className="ecosystem-section">
            <h2>Our Ecosystem</h2>
            <p className="ecosystem-description">
              Discover how KALI's integrated ecosystem makes real estate investment 
              more accessible, transparent, and efficient than ever before.
            </p>
            <div className="ecosystem-diagram">
              <EcosystemDiagram />
            </div>
          </div>
        </div>
      </div>
      <ChatAgent />
    </div>
  );
};

export default Launch;
