import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building, DollarSign, Filter, Search, Plus } from 'lucide-react';
import './PropertyMarketplace.css';

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  type: string;
  image: string;
  status: 'active' | 'pending' | 'sold' | 'rented';
}

export const PropertyMarketplace = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    searchQuery: '',
    propertyType: 'all',
    priceRange: [0, 1000000] as [number, number],
    status: 'active'
  });

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        const mockProperties: Property[] = [
          {
            id: '1',
            title: 'Modern Downtown Apartment',
            price: 450000,
            location: 'New York, NY',
            type: 'residential',
            image: '/property1.jpg',
            status: 'active'
          },
          {
            id: '2',
            title: 'Luxury Villa',
            price: 1200000,
            location: 'Miami, FL',
            type: 'residential',
            image: '/property2.jpg',
            status: 'pending'
          },
          {
            id: '3',
            title: 'Commercial Space',
            price: 750000,
            location: 'Los Angeles, CA',
            type: 'commercial',
            image: '/property3.jpg',
            status: 'active'
          }
        ];
        setProperties(mockProperties);
      } catch (err) {
        setError('Failed to load properties');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) return <div className="loading">Loading properties...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="marketplace-container">
      <div className="marketplace-header">
        <h1>RWA Marketplace</h1>
        <p>Browse and manage your RWA listings</p>
      </div>

      <div className="marketplace-actions">
        <div className="search-filter">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search properties..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            />
          </div>
          <div className="filter-group">
            <Filter size={20} />
            <select
              value={filters.propertyType}
              onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
            >
              <option value="all">All Types</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="industrial">Industrial</option>
            </select>
          </div>
        </div>
        <Link to="/properties/create" className="create-button">
          <Plus size={20} />
          Create Listing
        </Link>
      </div>

      <div className="properties-grid">
        {properties.map((property) => (
          <Link to={`/properties/${property.id}`} key={property.id} className="property-card">
            <div className="property-image">
              <img src={property.image} alt={property.title} />
              <div className={`property-status ${property.status}`}>
                {property.status}
              </div>
            </div>
            <div className="property-details">
              <h3>{property.title}</h3>
              <p className="property-location">
                <Building size={16} />
                {property.location}
              </p>
              <p className="property-price">
                <DollarSign size={16} />
                {property.price.toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}; 