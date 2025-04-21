import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, DollarSign, Calendar, User } from 'lucide-react';
import './MyTokens.css';

interface Token {
  id: string;
  propertyId: string;
  propertyTitle: string;
  price: number;
  rentPrice: number;
  duration: number;
  status: 'available' | 'rented' | 'expired';
  startDate?: string;
  endDate?: string;
}

const MyTokens: React.FC = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        // TODO: Replace with actual API call
        const mockTokens: Token[] = [
          {
            id: '1',
            propertyId: '1',
            propertyTitle: 'Modern Downtown Apartment',
            price: 1000,
            rentPrice: 100,
            duration: 30,
            status: 'available',
          },
          {
            id: '2',
            propertyId: '2',
            propertyTitle: 'Luxury Villa',
            price: 2000,
            rentPrice: 200,
            duration: 60,
            status: 'rented',
            startDate: '2024-04-01',
            endDate: '2024-05-31',
          },
        ];
        
        setTokens(mockTokens);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch tokens');
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

  if (loading) return <div className="loading">Loading your tokens...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="my-tokens-container">
      <div className="tokens-header">
        <h1>My Tokens</h1>
        <Link to="/tokens/create" className="create-button">
          Create New Token
        </Link>
      </div>

      <div className="tokens-grid">
        {tokens.map((token) => (
          <div key={token.id} className="token-card">
            <div className="token-header">
              <h2>Token #{token.id}</h2>
              <span className={`status-badge ${token.status}`}>{token.status}</span>
            </div>

            <div className="token-details">
              <div className="detail-item">
                <Home />
                <span>{token.propertyTitle}</span>
              </div>
              <div className="detail-item">
                <DollarSign />
                <span>Price: ${token.price}</span>
              </div>
              <div className="detail-item">
                <DollarSign />
                <span>Rent: ${token.rentPrice}/day</span>
              </div>
              <div className="detail-item">
                <Calendar />
                <span>Duration: {token.duration} days</span>
              </div>
            </div>

            {token.startDate && token.endDate && (
              <div className="rental-period">
                <div className="detail-item">
                  <Calendar />
                  <span>Start: {token.startDate}</span>
                </div>
                <div className="detail-item">
                  <Calendar />
                  <span>End: {token.endDate}</span>
                </div>
              </div>
            )}

            <div className="token-actions">
              <Link to={`/tokens/${token.id}`} className="view-button">
                View Details
              </Link>
              {token.status === 'available' && (
                <button className="edit-button">Edit</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyTokens; 