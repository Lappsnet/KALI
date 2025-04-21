import React from 'react';
import { useRealEstate } from '../hooks/useRealEstate';
import { Property } from '../types/property';

export const PropertyStats: React.FC = () => {
  const { getMyProperties, getAllProperties, getPropertySales } = useRealEstate();
  
  const myProperties = getMyProperties();
  const allProperties = getAllProperties();
  const propertySales = getPropertySales();

  const totalValue = allProperties.reduce((sum, property) => sum + Number(property.valuation), 0);
  const activeListings = propertySales.filter(sale => sale.status === 'active').length;
  const completedSales = propertySales.filter(sale => sale.status === 'completed').length;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <h3>My Properties</h3>
        <div className="stat-value">{myProperties.length}</div>
        <div className="stat-label">Total Properties Owned</div>
      </div>
      <div className="stat-card">
        <h3>Total Value</h3>
        <div className="stat-value">{totalValue.toLocaleString()} ETH</div>
        <div className="stat-label">Combined Property Value</div>
      </div>
      <div className="stat-card">
        <h3>Active Listings</h3>
        <div className="stat-value">{activeListings}</div>
        <div className="stat-label">Properties for Sale</div>
      </div>
      <div className="stat-card">
        <h3>Completed Sales</h3>
        <div className="stat-value">{completedSales}</div>
        <div className="stat-label">Total Sales Completed</div>
      </div>
    </div>
  );
}; 