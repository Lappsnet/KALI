import React from 'react';
import './PropertyActivity.css';
import { FaCheckCircle, FaTimesCircle, FaHourglass } from 'react-icons/fa';
import { useRealEstate } from '../hooks/useRealEstate';

interface Sale {
  id: string;
  propertyId: string;
  status: 'pending' | 'completed' | 'cancelled';
  price: string;
  buyer: string;
  timestamp: number;
}

export const PropertyActivity: React.FC = () => {
  const { getPropertySales } = useRealEstate();
  const sales = getPropertySales();

  const getStatusIcon = (status: Sale['status']) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="status-icon completed" />;
      case 'cancelled':
        return <FaTimesCircle className="status-icon cancelled" />;
      case 'pending':
        return <FaHourglass className="status-icon pending" />;
      default:
        return null;
    }
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="activity-container">
      <h3>Property Activity</h3>
      <div className="activity-list">
        {sales.map((sale) => (
          <div key={sale.saleId} className="activity-item">
            <div className="activity-icon">
              {getStatusIcon(sale.status as Sale['status'])}
            </div>
            <div className="activity-details">
              <div className="activity-header">
                <span className="activity-type">Sale {sale.status}</span>
                <span className="activity-date">{formatDate(sale.createdAt)}</span>
              </div>
              <div className="activity-info">
                <span className="activity-price">{sale.price} ETH</span>
                <span className="activity-buyer">Buyer: {sale.buyer || 'Pending'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 