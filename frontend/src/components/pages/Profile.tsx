"use client"

import React, { useState, useEffect } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { useLendingProtocolContract } from '../hooks/useLendingProtocolContract';
import { formatEther } from 'viem';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Loader, 
  AlertTriangle, 
  CheckCircle,
  Edit,
  Save,
  XCircle,
  Wallet,
  Building2,
  FileText,
  Clock
} from 'lucide-react';
import './Profile.css';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  walletAddress: string;
  propertiesOwned: number;
  documentsUploaded: number;
  lastActive: string;
}

interface Property {
  id: string;
  name: string;
  value: bigint;
  status: 'active' | 'pending' | 'sold';
  lastUpdated: string;
}

// Mock data for demonstration
const mockProfile: UserProfile = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 234-567-8901",
  location: "New York, USA",
  walletAddress: "0x1234...5678",
  propertiesOwned: 3,
  documentsUploaded: 12,
  lastActive: "2024-03-15T14:30:00Z"
};

const mockProperties: Property[] = [
  {
    id: '1',
    name: 'Luxury Apartment - Manhattan',
    value: BigInt(1000000000000000000), // 1 ETH
    status: 'active',
    lastUpdated: '2024-03-15T14:30:00Z'
  },
  {
    id: '2',
    name: 'Commercial Space - Brooklyn',
    value: BigInt(2500000000000000000), // 2.5 ETH
    status: 'pending',
    lastUpdated: '2024-03-14T10:15:00Z'
  },
  {
    id: '3',
    name: 'Residential House - Queens',
    value: BigInt(5000000000000000000), // 5 ETH
    status: 'sold',
    lastUpdated: '2024-03-13T16:45:00Z'
  }
];

export const Profile: React.FC = () => {
  const { address, isConnected } = useAppKitAccount();
  const { contractAddress, isLoading: isLoadingContract } = useLendingProtocolContract();

  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [properties, setProperties] = useState<Property[]>(mockProperties);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UserProfile>(mockProfile);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'updating' | 'success' | 'error'>('idle');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isConnected || !address || !contractAddress) return;

      setLoading(true);
      try {
        // TODO: Replace with actual contract calls
        // const userProfile = await contract.getUserProfile(address);
        // const userProperties = await contract.getUserProperties(address);
        setProfile(mockProfile);
        setProperties(mockProperties);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to fetch profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isConnected, address, contractAddress]);

  const handleEdit = () => {
    setEditForm(profile);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!contractAddress || !address) return;

    setUpdateStatus('updating');
    try {
      // TODO: Replace with actual contract call
      // await contract.updateUserProfile(editForm);
      setProfile(editForm);
      setIsEditing(false);
      setUpdateStatus('success');
      setTimeout(() => setUpdateStatus('idle'), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setUpdateStatus('error');
      setTimeout(() => setUpdateStatus('idle'), 3000);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setUpdateStatus('idle');
  };

  if (!isConnected) {
    return (
      <div className="page-container">
        <div className="main-content">
          <div className="connect-prompt">
            <Shield size={48} className="icon" />
            <h2>Connect Your Wallet</h2>
            <p>Please connect your wallet to access your profile</p>
            <appkit-button />
          </div>
        </div>
      </div>
    );
  }

  if (loading || isLoadingContract) {
    return (
      <div className="page-container">
        <div className="main-content">
          <div className="loading-container">
            <Loader className="animate-spin" size={32} />
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="main-content">
          <div className="error-container">
            <AlertTriangle size={32} />
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="main-content">
        <div className="page-header">
          <h1>Profile</h1>
          <p>Manage your account and properties</p>
        </div>

        <div className="profile-section">
          <div className="glass-card">
            <div className="profile-header">
              <div className="profile-avatar">
                <User size={48} />
              </div>
              <div className="profile-title">
                <h2>{profile.name}</h2>
                <p className="wallet-address">
                  <Wallet size={16} />
                  {profile.walletAddress}
                </p>
              </div>
              {!isEditing ? (
                <button className="edit-button" onClick={handleEdit}>
                  <Edit size={16} />
                  Edit Profile
                </button>
              ) : (
                <div className="edit-actions">
                  <button className="save-button" onClick={handleSave}>
                    <Save size={16} />
                    Save
                  </button>
                  <button className="cancel-button" onClick={handleCancel}>
                    <XCircle size={16} />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="profile-details">
              <div className="detail-group">
                <div className="detail-item">
                  <Mail size={20} className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Email</span>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="edit-input"
                      />
                    ) : (
                      <span className="detail-value">{profile.email}</span>
                    )}
                  </div>
                </div>
                <div className="detail-item">
                  <Phone size={20} className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Phone</span>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="edit-input"
                      />
                    ) : (
                      <span className="detail-value">{profile.phone}</span>
                    )}
                  </div>
                </div>
                <div className="detail-item">
                  <MapPin size={20} className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Location</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        className="edit-input"
                      />
                    ) : (
                      <span className="detail-value">{profile.location}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="stats-group">
                <div className="stat-card">
                  <Building2 size={24} className="stat-icon" />
                  <div className="stat-info">
                    <div className="stat-value">{profile.propertiesOwned}</div>
                    <div className="stat-label">Properties</div>
                  </div>
                </div>
                <div className="stat-card">
                  <FileText size={24} className="stat-icon" />
                  <div className="stat-info">
                    <div className="stat-value">{profile.documentsUploaded}</div>
                    <div className="stat-label">Documents</div>
                  </div>
                </div>
                <div className="stat-card">
                  <Clock size={24} className="stat-icon" />
                  <div className="stat-info">
                    <div className="stat-value">
                      {new Date(profile.lastActive).toLocaleDateString()}
                    </div>
                    <div className="stat-label">Last Active</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="properties-section">
          <div className="glass-card">
            <div className="section-header">
              <h2>Your Properties</h2>
              <Building2 className="section-icon" />
            </div>
            <div className="properties-list">
              {properties.map((property) => (
                <div key={property.id} className={`property-item ${property.status}`}>
                  <div className="property-info">
                    <div className="property-name">{property.name}</div>
                    <div className="property-meta">
                      <span className="property-value">
                        {formatEther(property.value)} ETH
                      </span>
                      <span className="property-date">
                        {new Date(property.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="property-status">
                    <span className={`status-badge ${property.status}`}>
                      {property.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {updateStatus === 'success' && (
          <div className="notification success">
            <CheckCircle size={20} />
            Profile updated successfully
          </div>
        )}
        {updateStatus === 'error' && (
          <div className="notification error">
            <AlertTriangle size={20} />
            Failed to update profile
          </div>
        )}
      </div>
    </div>
  );
}; 