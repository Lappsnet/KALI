import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Home, DollarSign, Calendar, User } from 'lucide-react';
import './RentableToken.css';

interface Token {
  id: string;
  propertyId: string;
  propertyTitle: string;
  price: number;
  rentPrice: number;
  duration: number;
  owner: string;
  status: 'available' | 'rented' | 'expired';
  startDate?: string;
  endDate?: string;
  tenant?: string;
}

const RentableToken: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [token, setToken] = useState<Token | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        // TODO: Replace with actual API call
        const mockToken: Token = {
          id: id || '',
          propertyId: '1',
          propertyTitle: 'Modern Downtown Apartment',
          price: 1000,
          rentPrice: 100,
          duration: 30,
          owner: '0x123...abc',
          status: 'available',
        };
        
        setToken(mockToken);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch token details');
        setLoading(false);
      }
    };

    fetchToken();
  }, [id]);

  if (loading) return <div className="loading">Loading token details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!token) return <div className="error">Token not found</div>;

  return (
    <div className="rentable-token-container">
      <div className="token-header">
        <h1>Rentable Token #{token.id}</h1>
        <div className="token-status">
          <span className={`status-badge ${token.status}`}>{token.status}</span>
        </div>
      </div>

      <div className="token-details">
        <div className="detail-card">
          <h2>Property Information</h2>
          <div className="detail-item">
            <Home />
            <span>{token.propertyTitle}</span>
          </div>
          <div className="detail-item">
            <DollarSign />
            <span>Purchase Price: ${token.price}</span>
          </div>
          <div className="detail-item">
            <DollarSign />
            <span>Rent Price: ${token.rentPrice}/day</span>
          </div>
          <div className="detail-item">
            <Calendar />
            <span>Duration: {token.duration} days</span>
          </div>
        </div>

        <div className="detail-card">
          <h2>Ownership</h2>
          <div className="detail-item">
            <User />
            <span>Owner: {token.owner}</span>
          </div>
          {token.tenant && (
            <div className="detail-item">
              <User />
              <span>Tenant: {token.tenant}</span>
            </div>
          )}
        </div>

        {token.startDate && token.endDate && (
          <div className="detail-card">
            <h2>Rental Period</h2>
            <div className="detail-item">
              <Calendar />
              <span>Start Date: {token.startDate}</span>
            </div>
            <div className="detail-item">
              <Calendar />
              <span>End Date: {token.endDate}</span>
            </div>
          </div>
        )}
      </div>

      <div className="token-actions">
        {token.status === 'available' && (
          <button className="rent-button">Rent Token</button>
        )}
        {token.status === 'rented' && (
          <button className="return-button">Return Token</button>
        )}
      </div>
    </div>
  );
};

export default RentableToken; 