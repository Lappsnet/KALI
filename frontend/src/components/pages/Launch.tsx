"use client"

import React from 'react';
import { useAppKitAccount } from "@reown/appkit/react"
import { ActionButton } from "../ActionButton"
import { Building, DollarSign, BarChart2 } from "lucide-react"
import EcosystemDiagram from '../EcosystemDiagram';
import '../../styles/EcosystemDiagram.css';

export const Launch: React.FC = () => {
  const { isConnected } = useAppKitAccount()

  return (
    <div className="">
      <div className="content-wrapper">
        <div className="page-container text-center">
          <div className="new-badge mb-4">NEW</div>
          <h1 className="text-6xl font-bold mb-4 text-[#00A3FF]">KALI</h1>
          <h2 className="text-3xl text-gray-300 mb-4">
            Real Estate Marketplace on the Pharos Network
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Tokenize, trade, and manage real estate properties with blockchain technology
          </p>
          <button className="futuristic-button mb-12">
            GO TO DASHBOARD
          </button>

          <div className="ecosystem-section mt-16">
            <EcosystemDiagram />
          </div>
        </div>
      </div>
    </div>
  );
};
