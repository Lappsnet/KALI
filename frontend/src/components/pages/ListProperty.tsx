import React, { useState, useRef } from 'react';
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
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      
      // Create preview URLs for selected images
      const previewUrls = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setPreviewImages(previewUrls);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
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
      <div className="main-content with-">
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
    <div className="main-content with-siebar">
      <div className="">
        <div className="glass-card p-8">
          <h3 className="text-3xl font-bold mb-6 text-gradient">To mint a property, you need to fill in the following details</h3>
          <br />
          <br />
          {error && (
            <div className="error-message mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 animate-fade-in">
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
                className="futuristic-input transition-all duration-300 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">Cadastral Details</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="futuristic-input min-h-[120px] transition-all duration-300 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                  className="futuristic-input transition-all duration-300 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                  className="futuristic-input transition-all duration-300 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                  className="futuristic-input transition-all duration-300 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                  className="futuristic-input transition-all duration-300 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                  className="futuristic-input transition-all duration-300 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                  className="futuristic-input transition-all duration-300 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
                  min="0"
                  required
                />
              </div>
            </div>
            <br />
            <br />
            <div className="form-group">
              <label className="form-label">Amenities</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {amenitiesList.map(amenity => (
                  <label key={amenity} className="flex items-center space-x-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="form-checkbox transition-all duration-300 group-hover:border-primary"
                    />
                    <span className="group-hover:text-primary transition-colors duration-300">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
            <br />
            <br />
            <div className="form-group">
              <label htmlFor="images" className="form-label">Property Images</label>
              <div className="relative">
                <div 
                  className="image-upload-container cursor-pointer transition-all duration-300 hover:border-primary"
                  onClick={handleImageClick}
                >
                  {previewImages.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                      {previewImages.map((url, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={url} 
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm">Click to change</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <svg className="w-12 h-12 text-primary mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-primary">Click to upload images</span>
                      <span className="text-sm text-secondary">or drag and drop</span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="images"
                  name="images"
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/*"
                  multiple
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button 
                type="button" 
                className="button button-secondary transition-all duration-300 hover:bg-secondary/20"
                onClick={() => navigate('/marketplace')}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="button button-primary transition-all duration-300 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center space-x-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Listing Property...</span>
                  </span>
                ) : 'List Property'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 