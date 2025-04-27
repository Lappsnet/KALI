"use client"

import React, { useState, useEffect } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { useLendingProtocolContract } from '../hooks/useLendingProtocolContract';
import { 
  Shield, 
  Loader, 
  AlertTriangle, 
  CheckCircle,
  Bell,
  Mail,
  Lock,
  Globe,
  Eye,
  EyeOff,
  Save,
  XCircle
} from 'lucide-react';
import './Settings.css';

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
}

interface SecuritySettings {
  twoFactor: boolean;
  biometric: boolean;
  autoLock: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private';
  showEmail: boolean;
  showPhone: boolean;
}

export const Settings: React.FC = () => {
  const { address, isConnected } = useAppKitAccount();
  const { contractAddress, isLoading: isLoadingContract } = useLendingProtocolContract();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'updating' | 'success' | 'error'>('idle');

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    push: true,
    sms: false
  });

  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactor: false,
    biometric: true,
    autoLock: true
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false
  });

  useEffect(() => {
    const fetchSettings = async () => {
      if (!isConnected || !address || !contractAddress) return;

      setLoading(true);
      try {
        // TODO: Replace with actual contract calls
        // const settings = await contract.getUserSettings(address);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to fetch settings');
        setLoading(false);
      }
    };

    fetchSettings();
  }, [isConnected, address, contractAddress]);

  const handleSave = async () => {
    if (!contractAddress || !address) return;

    setUpdateStatus('updating');
    try {
      // TODO: Replace with actual contract call
      // await contract.updateUserSettings(address, { notifications, security, privacy });
      setUpdateStatus('success');
      setTimeout(() => setUpdateStatus('idle'), 3000);
    } catch (err) {
      console.error('Error updating settings:', err);
      setUpdateStatus('error');
      setTimeout(() => setUpdateStatus('idle'), 3000);
    }
  };

  if (!isConnected) {
    return (
      <div className="page-container">
        <div className="main-content">
          <div className="connect-prompt">
            <Shield size={48} className="icon" />
            <h2>Connect Your Wallet</h2>
            <p>Please connect your wallet to access settings</p>
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
            <p>Loading settings...</p>
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
          <h1>Settings</h1>
          <p>Manage your account preferences and security settings</p>
        </div>

        <div className="settings-grid">
          <div className="setting-card">
            <div className="card-header">
              <div className="card-icon">
                <Bell size={24} />
              </div>
              <div className="card-title">
                <h2>Notifications</h2>
                <p>Manage how you receive updates and alerts</p>
              </div>
            </div>
            <div className="setting-group">
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">Email Notifications</div>
                  <div className="setting-description">Receive updates via email</div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifications.email}
                    onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">Push Notifications</div>
                  <div className="setting-description">Receive browser notifications</div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifications.push}
                    onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">SMS Notifications</div>
                  <div className="setting-description">Receive text message alerts</div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifications.sms}
                    onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="setting-card">
            <div className="card-header">
              <div className="card-icon">
                <Lock size={24} />
              </div>
              <div className="card-title">
                <h2>Security</h2>
                <p>Manage your account security settings</p>
              </div>
            </div>
            <div className="setting-group">
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">Two-Factor Authentication</div>
                  <div className="setting-description">Add an extra layer of security</div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={security.twoFactor}
                    onChange={(e) => setSecurity({ ...security, twoFactor: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">Biometric Authentication</div>
                  <div className="setting-description">Use fingerprint or face ID</div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={security.biometric}
                    onChange={(e) => setSecurity({ ...security, biometric: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">Auto-Lock</div>
                  <div className="setting-description">Lock after inactivity</div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={security.autoLock}
                    onChange={(e) => setSecurity({ ...security, autoLock: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="setting-card">
            <div className="card-header">
              <div className="card-icon">
                <Globe size={24} />
              </div>
              <div className="card-title">
                <h2>Privacy</h2>
                <p>Control your profile visibility</p>
              </div>
            </div>
            <div className="setting-group">
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">Profile Visibility</div>
                  <div className="setting-description">Make your profile public or private</div>
                </div>
                <select
                  value={privacy.profileVisibility}
                  onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value as 'public' | 'private' })}
                  className="toggle-switch"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">Show Email</div>
                  <div className="setting-description">Display your email on profile</div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={privacy.showEmail}
                    onChange={(e) => setPrivacy({ ...privacy, showEmail: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">Show Phone</div>
                  <div className="setting-description">Display your phone on profile</div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={privacy.showPhone}
                    onChange={(e) => setPrivacy({ ...privacy, showPhone: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="setting-card">
          <div className="card-header">
            <div className="card-icon">
              <Save size={24} />
            </div>
            <div className="card-title">
              <h2>Save Changes</h2>
              <p>Apply your settings changes</p>
            </div>
          </div>
          <div className="setting-group">
            <button
              className="setting-item"
              onClick={handleSave}
              disabled={updateStatus === 'updating'}
            >
              <div className="setting-info">
                <div className="setting-label">Save All Settings</div>
                <div className="setting-description">Apply all changes to your account</div>
              </div>
              <Save size={20} />
            </button>
          </div>
        </div>

        {updateStatus === 'success' && (
          <div className="notification success">
            <CheckCircle size={20} />
            Settings updated successfully
          </div>
        )}
        {updateStatus === 'error' && (
          <div className="notification error">
            <AlertTriangle size={20} />
            Failed to update settings
          </div>
        )}
      </div>
    </div>
  );
};
