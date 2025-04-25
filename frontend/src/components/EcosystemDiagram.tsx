import React from 'react';

const EcosystemDiagram: React.FC = () => {
  return (
    <div className="page-container">
      <header className="text-center mb-10">
        <div className="flex items-center justify-center">
          <h1 className="text-2xl md:text-3xl font-bold text-white pb-1">KALI Real Estate</h1>
          <span className="kali-logo-header">KALI</span>
        </div>
        <p className="text-md text-gray-400 mt-1">Ecosystem Interaction Flow</p>
      </header>

      <div className="diagram-grid">
        <div className="flow-node node-role" id="flow-seller">
          <span className="emoji-icon">🧑‍💼</span>
          <span className="node-text">Seller/Owner</span>
        </div>
        <div className="flow-node node-role" id="flow-buyer">
          <span className="emoji-icon">🛒</span>
          <span className="node-text">Buyer/Investor</span>
        </div>
        <div className="flow-node node-role" id="flow-tenant">
          <span className="emoji-icon">🔑</span>
          <span className="node-text">Tenant</span>
        </div>
        <div className="flow-node node-role" id="flow-lender">
          <span className="emoji-icon">🏦</span>
          <span className="node-text">Lender/LP</span>
        </div>
        <div className="flow-node node-role" id="flow-borrower">
          <span className="emoji-icon">💸</span>
          <span className="node-text">Borrower</span>
        </div>
        <div className="flow-node node-role" id="flow-notary">
          <span className="emoji-icon">✍️</span>
          <span className="node-text">Notary</span>
        </div>
        <div className="flow-node node-role" id="flow-admin">
          <span className="emoji-icon">🛡️</span>
          <span className="node-text">Admin/Operator</span>
        </div>

        <div className="flow-node node-platform" id="flow-kali-platform">
          <div className="logo-placeholder">KALI</div>
          <span className="node-text">Kali Platform</span>
        </div>

        <div className="flow-node node-token" id="flow-nft">
          <span className="emoji-icon">💎</span>
          <span className="node-text">RealEstate NFT</span>
        </div>
        <div className="flow-node node-core" id="flow-sale">
          <span className="emoji-icon">🏷️</span>
          <span className="node-text">Sale Contract</span>
        </div>
        <div className="flow-node node-core" id="flow-rental">
          <span className="emoji-icon">📄</span>
          <span className="node-text">Rental Contract</span>
        </div>
        <div className="flow-node node-core" id="flow-lending">
          <span className="emoji-icon">⚖️</span>
          <span className="node-text">Lending Contract</span>
        </div>
        <div className="flow-node node-core" id="flow-fractional">
          <span className="emoji-icon">📊</span>
          <span className="node-text">Fractional Contract</span>
        </div>
        <div className="flow-node node-token" id="flow-rentable">
          <span className="emoji-icon">🪙</span>
          <span className="node-text">Rentable Token</span>
        </div>
        <div className="flow-node node-token" id="flow-fret">
          <span className="emoji-icon">🔗</span>
          <span className="node-text">FRET Shares</span>
        </div>
        <div className="flow-node node-core" id="flow-orchestrator">
          <span className="emoji-icon">⚙️</span>
          <span className="node-text">Orchestrator</span>
        </div>

        <div className="flow-node node-external" id="flow-fee-collector">
          <span className="emoji-icon">💰</span>
          <span className="node-text">Fee Collector</span>
        </div>
        <div className="flow-node node-external" id="flow-stablecoin">
          <span className="emoji-icon">💲</span>
          <span className="node-text">Stablecoin</span>
        </div>

        <div id="pharos-logo-container">
          <img src="https://cdn.prod.website-files.com/67dcd1631de3a405ce797864/6800cde47d0e252bd37e1b59_logo.svg" alt="Pharos Network Logo" />
        </div>
      </div>
    </div>
  );
};

export default EcosystemDiagram; 