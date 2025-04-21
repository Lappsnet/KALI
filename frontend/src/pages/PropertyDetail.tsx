import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaHeart } from 'react-icons/fa';
import './PropertyDetail.css';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  type: 'sale' | 'rent';
  status: 'active' | 'pending' | 'sold' | 'rented';
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  features: string[];
  owner: {
    name: string;
    email: string;
    phone: string;
  };
}

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        // TODO: Replace with actual API call
        const mockProperty: Property = {
          id: id || '',
          title: 'Modern Apartment in Downtown',
          description: 'Beautiful modern apartment located in the heart of downtown. Features include floor-to-ceiling windows, modern appliances, and a spacious balcony with city views.',
          price: 450000,
          location: 'Downtown, New York',
          type: 'sale',
          status: 'active',
          bedrooms: 2,
          bathrooms: 2,
          area: 1200,
          images: [
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'
          ],
          features: [
            'Floor-to-ceiling windows',
            'Modern appliances',
            'Spacious balcony',
            'Parking included',
            '24/7 security'
          ],
          owner: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1 234 567 8900'
          }
        };
        
        setProperty(mockProperty);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch property details');
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!property) return <div className="error">Property not found</div>;

  return (
    <div className="property-detail-container">
      <div className="property-header">
        <h1>{property.title}</h1>
        <div className="property-meta">
          <span className="property-price">${property.price.toLocaleString()}</span>
          <span className={`property-status ${property.status}`}>{property.status}</span>
        </div>
      </div>

      <div className="property-gallery">
        <div className="main-image">
          <img src={property.images[currentImageIndex]} alt={property.title} />
        </div>
        <div className="thumbnail-container">
          {property.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${property.title} - ${index + 1}`}
              className={currentImageIndex === index ? 'active' : ''}
              onClick={() => setCurrentImageIndex(index)}
            />
          ))}
        </div>
      </div>

      <div className="property-info">
        <div className="property-details">
          <div className="detail-item">
            <FaMapMarkerAlt />
            <span>{property.location}</span>
          </div>
          <div className="detail-item">
            <FaBed />
            <span>{property.bedrooms} Bedrooms</span>
          </div>
          <div className="detail-item">
            <FaBath />
            <span>{property.bathrooms} Bathrooms</span>
          </div>
          <div className="detail-item">
            <FaRulerCombined />
            <span>{property.area} sq ft</span>
          </div>
        </div>

        <div className="property-description">
          <h2>Description</h2>
          <p>{property.description}</p>
        </div>

        <div className="property-features">
          <h2>Features</h2>
          <ul>
            {property.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>

        <div className="property-contact">
          <h2>Contact Information</h2>
          <div className="contact-details">
            <p><strong>Owner:</strong> {property.owner.name}</p>
            <p><strong>Email:</strong> {property.owner.email}</p>
            <p><strong>Phone:</strong> {property.owner.phone}</p>
          </div>
          <button className="contact-button">Contact Owner</button>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail; 