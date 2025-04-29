"use client"

import React, { useState, useEffect } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { useLendingProtocolContract } from '../hooks/useLendingProtocolContract';
import { 
  Shield, 
  Loader, 
  AlertTriangle, 
  CheckCircle,
  Save,
  Settings as SettingsIcon,
  ShieldCheck,
  Globe2,
  BellRing} from 'lucide-react';
import './Settings.css';

interface NotificationSettings {
    email: boolean;
    push: boolean;
    sms: boolean;
  marketing: boolean;
  updates: boolean;
}

interface SecuritySettings {
  twoFactor: boolean;
  biometric: boolean;
  autoLock: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
}

interface PrivacySettings {
  profileVisibility: any;
  showEmail: boolean;
  showPhone: boolean;
    showActivity: boolean;
    showHoldings: boolean;
}

interface LanguagePreference {
  language: string;
  timezone: string;
  dateFormat: string;
}

const mockSettings = {
    notifications: {
      email: true,
      push: true,
      sms: false,
    marketing: true,
    updates: true
  },
  security: {
    twoFactor: false,
    biometric: true,
    autoLock: true,
    sessionTimeout: 30,
    passwordExpiry: 90
    },
    privacy: {
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
      showActivity: true,
    showHoldings: false
  },
  language: {
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY'
  }
};

export const Settings: React.FC = () => {
  const { address, isConnected } = useAppKitAccount();
  const { contractAddress, isLoading: isLoadingContract } = useLendingProtocolContract();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'updating' | 'success' | 'error'>('idle');

  const [notifications, setNotifications] = useState<NotificationSettings>(mockSettings.notifications);
  const [security, setSecurity] = useState<SecuritySettings>(mockSettings.security);
  const [privacy, setPrivacy] = useState<PrivacySettings>(mockSettings.privacy);
  const [language, setLanguage] = useState<LanguagePreference>(mockSettings.language);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!isConnected || !address || !contractAddress) return;

      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
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
          <h1></h1>
          <p>Manage your account preferences and security settings</p>
        </div>

        <div className="settings-grid">
          <div className="setting-card">
            <div className="card-header">
              <div className="card-icon">
                <BellRing size={24} />
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
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">Marketing Updates</div>
                  <div className="setting-description">Receive promotional content</div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifications.marketing}
                    onChange={(e) => setNotifications({ ...notifications, marketing: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="setting-card">
            <div className="card-header">
              <div className="card-icon">
                <ShieldCheck size={24} />
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
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">Session Timeout</div>
                  <div className="setting-description">Minutes until auto-logout</div>
                </div>
                  <select
                  value={security.sessionTimeout}
                  onChange={(e) => setSecurity({ ...security, sessionTimeout: Number(e.target.value) })}
                  className="toggle-switch"
                  >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                  </select>
              </div>
            </div>
          </div>

          <div className="setting-card">
            <div className="card-header">
              <div className="card-icon">
                <Globe2 size={24} />
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
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">Show Activity</div>
                  <div className="setting-description">Display your recent activity</div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={privacy.showActivity}
                    onChange={(e) => setPrivacy({ ...privacy, showActivity: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="setting-card">
            <div className="card-header">
              <div className="card-icon">
                <SettingsIcon size={24} />
              </div>
              <div className="card-title">
                <h2>Preferences</h2>
                <p>Customize your experience</p>
              </div>
            </div>
            <div className="setting-group">
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">Language</div>
                  <div className="setting-description">Select your preferred language</div>
                </div>
                <select
                  value={language.language}
                  onChange={(e) => setLanguage({ ...language, language: e.target.value })}
                  className="toggle-switch"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">Timezone</div>
                  <div className="setting-description">Set your local timezone</div>
                </div>
                <select
                  value={language.timezone}
                  onChange={(e) => setLanguage({ ...language, timezone: e.target.value })}
                  className="toggle-switch"
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern Time</option>
                  <option value="PST">Pacific Time</option>
                  <option value="GMT">Greenwich Mean Time</option>
                </select>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">Date Format</div>
                  <div className="setting-description">Choose your date display format</div>
                </div>
                <select
                  value={language.dateFormat}
                  onChange={(e) => setLanguage({ ...language, dateFormat: e.target.value })}
                  className="toggle-switch"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
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
