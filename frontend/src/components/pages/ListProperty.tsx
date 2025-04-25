import React, { useState } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { useNavigate } from 'react-router-dom';
import { useRealEstateContract } from '../hooks/useRealEstateContract';
import { BigNumber } from '@ethersproject/bignumber';

interface PropertyFormData {
  title: string;
  description: string;
  location: string;
  price: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  amenities: string[];
  images: FileList | null;
}

export const ListProperty: React.FC = () => {
  const { isConnected, address } = useAppKitAccount();
  const navigate = useNavigate();
  const { mintProperty } = useRealEstateContract();
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    location: '',
    price: '',
    propertyType: 'residential',
    bedrooms: '',
    bathrooms: '',
    area: '',
    amenities: [],
    images: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const propertyTypes = [
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'land', label: 'Land' },
  ];

  const amenitiesList = [
    'Parking',
    'Pool',
    'Garden',
    'Security',
    'Elevator',
    'Gym',
    'Air Conditioning',
    'Furnished',
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({ ...prev, images: e.target.files }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!isConnected) {
        throw new Error('Please connect your wallet first');
      }

      // Check for Pinata JWT
      const pinataJwt = import.meta.env.VITE_PINATA_JWT;
      if (!pinataJwt) {
        throw new Error('Pinata JWT not found in environment variables');
      }

      // Upload images to IPFS first
      const imageUploadPromises = Array.from(formData.images || []).map(async (file) => {
        const imageFormData = new FormData();
        imageFormData.append('file', file);
        imageFormData.append('pinataMetadata', JSON.stringify({ 
          name: `PropertyImage_${formData.title}_${Date.now()}` 
        }));

        const imgRes = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
          method: 'POST',
          headers: { Authorization: `Bearer ${pinataJwt}` },
          body: imageFormData,
        });

        if (!imgRes.ok) throw new Error(`Image upload failed: ${imgRes.statusText}`);
        const imgData = await imgRes.json();
        return `ipfs://${imgData.IpfsHash}`;
      });

      const imageIpfsUris = await Promise.all(imageUploadPromises);

      // Create metadata object
      const metadata = {
        name: formData.title,
        description: formData.description,
        location: formData.location,
        propertyType: formData.propertyType,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        area: parseInt(formData.area) || 0,
        amenities: formData.amenities,
        price: formData.price,
        images: imageIpfsUris,
      };

      // Upload metadata to IPFS
      const metadataFile = new File([JSON.stringify(metadata)], 'metadata.json', { type: 'application/json' });
      const metadataFormData = new FormData();
      metadataFormData.append('file', metadataFile);
      metadataFormData.append('pinataMetadata', JSON.stringify({ 
        name: `PropertyMetadata_${formData.title}_${Date.now()}.json` 
      }));

      const metaRes = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: { Authorization: `Bearer ${pinataJwt}` },
        body: metadataFormData,
      });

      if (!metaRes.ok) throw new Error(`Metadata upload failed: ${metaRes.statusText}`);
      const metaData = await metaRes.json();
      const metadataIpfsUri = `ipfs://${metaData.IpfsHash}`;

      // Call the contract to mint the property
      const hash = await mintProperty(
        address as `0x${string}`,
        formData.title,
        formData.location,
        BigInt(formData.price),
        metadataIpfsUri
      );

      if (hash) {
        // Redirect to the marketplace after successful listing
        navigate('/marketplace');
      }
    } catch (err) {
      console.error('Error listing property:', err);
      setError(err instanceof Error ? err.message : 'Failed to list property');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="main-content with-sidebar">
        <div className="content-wrapper">
          <div className="glass-card p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Connect Wallet</h2>
            <p className="text-secondary mb-4">
              Please connect your wallet to list a property.
            </p>
            <appkit-button />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content with-sidebar">
      <div className="content-wrapper">
        <div className="glass-card p-8">
          <h1 className="text-3xl font-bold mb-6 text-gradient">List Your Property</h1>
          
          {error && (
            <div className="error-message mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-md text-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label htmlFor="title" className="form-label">Property Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="futuristic-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="futuristic-input min-h-[120px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label htmlFor="location" className="form-label">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="futuristic-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="price" className="form-label">Price (USDT)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="futuristic-input"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="form-group">
                <label htmlFor="propertyType" className="form-label">Property Type</label>
                <select
                  id="propertyType"
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleInputChange}
                  className="futuristic-input"
                  required
                >
                  {propertyTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="bedrooms" className="form-label">Bedrooms</label>
                <input
                  type="number"
                  id="bedrooms"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  className="futuristic-input"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bathrooms" className="form-label">Bathrooms</label>
                <input
                  type="number"
                  id="bathrooms"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  className="futuristic-input"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="area" className="form-label">Area (sq ft)</label>
                <input
                  type="number"
                  id="area"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  className="futuristic-input"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Amenities</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {amenitiesList.map(amenity => (
                  <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="form-checkbox"
                    />
                    <span>{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="images" className="form-label">Property Images</label>
              <input
                type="file"
                id="images"
                name="images"
                onChange={handleImageChange}
                className="futuristic-input"
                accept="image/*"
                multiple
                required
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button 
                type="button" 
                className="button button-secondary"
                onClick={() => navigate('/marketplace')}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="button button-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Listing Property...' : 'List Property'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 