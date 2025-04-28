"use client"

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppKitAccount } from '@reown/appkit/react';
import { useLendingProtocolContract } from '../hooks/useLendingProtocolContract';
import { formatEther } from 'viem';
import { DollarSign, TrendingUp, Clock, ArrowUpRight, Loader, AlertTriangle, CheckCircle, History, Calendar, BarChart2, LineChart } from 'lucide-react';
import { ActionButton } from '../ActionButton';
import './SaleHistory.css';

interface Sale {
  id: string;
  propertyId: string;
  seller: string;
  buyer: string;
  price: string;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
  transactionHash: string;
}

interface PriceTrend {
  date: string;
  price: number;
}

const mockSales: Sale[] = [
  {
    id: '1',
    propertyId: 'prop5',
    seller: '0x1234...5678',
    buyer: '0x5678...1234',
    price: '2500000000000000000000',
    date: '2024-03-15',
    status: 'completed',
    transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  },
  {
    id: '2',
    propertyId: 'prop5',
    seller: '0x5678...1234',
    buyer: '0x1234...5678',
    price: '2000000000000000000000',
    date: '2024-02-10',
    status: 'completed',
    transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
  },
  {
    id: '3',
    propertyId: 'prop5',
    seller: '0x1234...5678',
    buyer: '0x5678...1234',
    price: '1800000000000000000000',
    date: '2024-01-05',
    status: 'completed',
    transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  },
  {
    id: '4',
    propertyId: 'prop5',
    seller: '0x5678...1234',
    buyer: '0x1234...5678',
    price: '2200000000000000000000',
    date: '2023-12-20',
    status: 'completed',
    transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
  },
  {
    id: '5',
    propertyId: 'prop5',
    seller: '0x1234...5678',
    buyer: '0x5678...1234',
    price: '1900000000000000000000',
    date: '2023-11-15',
    status: 'completed',
    transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  }
];

// Mock price trends data
const mockPriceTrends: PriceTrend[] = [
  { date: '2023-11-15', price: 1.9 },
  { date: '2023-12-20', price: 2.2 },
  { date: '2024-01-05', price: 1.8 },
  { date: '2024-02-10', price: 2.0 },
  { date: '2024-03-15', price: 2.5 }
];

export const SaleHistory: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const { address, isConnected } = useAppKitAccount();
  const { contractAddress, isLoading: isLoadingContract } = useLendingProtocolContract();

  const [sales, setSales] = useState<Sale[]>(mockSales);
  const [priceTrends, setPriceTrends] = useState<PriceTrend[]>(mockPriceTrends);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSales = async () => {
      if (!isConnected || !address || !contractAddress) return;

      setLoading(true);
      try {
        // TODO: Replace with actual contract call
        // const propertySales = await contract.getPropertySales(propertyId);
        // For now, use mock data
        setSales(mockSales);
        setPriceTrends(mockPriceTrends);
      } catch (err) {
        console.error('Error fetching sales:', err);
        setError('Failed to fetch sales history');
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [isConnected, address, contractAddress, propertyId]);

  if (!isConnected) {
    return (
      <div className="page-container">
        <div className="connect-prompt">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to view sale history</p>
          <appkit-button />
        </div>
      </div>
    );
  }

  if (loading || isLoadingContract) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <Loader className="animate-spin" size={32} />
          <p>Loading sale history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-container">
          <AlertTriangle size={32} />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const totalVolume = sales.reduce((sum, sale) => sum + BigInt(sale.price), BigInt(0));
  const averagePrice = totalVolume / BigInt(sales.length);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1></h1>
        <p>Track property sales and transactions</p>
      </div>

      <div className="sales-section">
        <div className="glass-card">
          <div className="section-header">
            <h2>Sales Overview</h2>
            <TrendingUp className="section-icon" />
          </div>

          <div className="sales-stats">
            <div className="stat-card">
              <div className="stat-label">Total Sales</div>
              <div className="stat-value">{sales.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Volume</div>
              <div className="stat-value">
                {formatEther(totalVolume)} ETH
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Average Price</div>
              <div className="stat-value">
                {formatEther(averagePrice)} ETH
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <div className="section-header">
            <h2>Price Trends</h2>
            <LineChart className="section-icon" />
          </div>
          <div className="price-chart">
            <div className="chart-container">
              {priceTrends.map((trend, index) => (
                <div key={index} className="chart-bar">
                  <div 
                    className="chart-bar-fill"
                    style={{ 
                      height: `${(trend.price / Math.max(...priceTrends.map(t => t.price))) * 100}%`,
                      backgroundColor: trend.price > priceTrends[index - 1]?.price ? 'var(--success-color)' : 'var(--error-color)'
                    }}
                  />
                  <div className="chart-label">
                    <span className="chart-date">{new Date(trend.date).toLocaleDateString()}</span>
                    <span className="chart-price">{trend.price} ETH</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card">
          <div className="section-header">
            <h2>Sales History</h2>
            <History className="section-icon" />
          </div>

          <div className="sales-list">
            {sales.map((sale) => (
              <div key={sale.id} className="sale-item">
                <div className="sale-date">
                  {new Date(sale.date).toLocaleDateString()}
                </div>
                <div className="sale-details">
                  <div className="sale-parties">
                    <div className="party">
                      <span className="label">Seller:</span>
                      <span className="address">{sale.seller}</span>
                    </div>
                    <ArrowUpRight size={16} />
                    <div className="party">
                      <span className="label">Buyer:</span>
                      <span className="address">{sale.buyer}</span>
                    </div>
                  </div>
                  <div className="sale-price">
                    {formatEther(BigInt(sale.price))} ETH
                  </div>
                </div>
                <div className="sale-actions">
                  <span className={`status-badge ${sale.status}`}>
                    {sale.status}
                  </span>
                  <a
                    href={`https://pharosscan.xyz/tx/${sale.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transaction-link"
                  >
                    View on Pharos Scan
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 