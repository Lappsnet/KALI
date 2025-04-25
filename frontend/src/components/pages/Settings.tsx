"use client"

import React, { useState } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { Sun, Moon, User, Bell, Shield, LogOut } from "lucide-react"
import { ActionButton } from "../ActionButton"

interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  preferences: {
    language: string;
    currency: string;
    theme: string;
  };
  privacy: {
    showProfile: boolean;
    showActivity: boolean;
    showHoldings: boolean;
  };
}

export const Settings: React.FC = () => {
  const { isConnected } = useAppKitAccount();
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    preferences: {
      language: 'en',
      currency: 'USD',
      theme: 'dark',
    },
    privacy: {
      showProfile: true,
      showActivity: true,
      showHoldings: false,
    },
  });

  const handleNotificationChange = (type: keyof UserSettings['notifications']) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type],
      },
    }));
  };

  const handlePreferenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [name]: value,
      },
    }));
  };

  const handlePrivacyChange = (type: keyof UserSettings['privacy']) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [type]: !prev.privacy[type],
      },
    }));
  };

  if (!isConnected) {
    return (
      <div className="main-content with-sidebar">
        <div className="content-wrapper">
          <div className="glass-card p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Connect Wallet</h2>
            <p className="text-secondary mb-4">
              Please connect your wallet to access settings.
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
          <h1 className="text-3xl font-bold mb-6 text-gradient">Settings</h1>

          <div className="space-y-8">
            {/* Notifications Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Notifications</h2>
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.notifications.email}
                    onChange={() => handleNotificationChange('email')}
                    className="form-checkbox"
                  />
                  <span>Email Notifications</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.notifications.push}
                    onChange={() => handleNotificationChange('push')}
                    className="form-checkbox"
                  />
                  <span>Push Notifications</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.notifications.sms}
                    onChange={() => handleNotificationChange('sms')}
                    className="form-checkbox"
                  />
                  <span>SMS Notifications</span>
                </label>
              </div>
            </section>

            {/* Preferences Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Preferences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="form-group">
                  <label htmlFor="language" className="form-label">Language</label>
                  <select
                    id="language"
                    name="language"
                    value={settings.preferences.language}
                    onChange={handlePreferenceChange}
                    className="futuristic-input"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="currency" className="form-label">Currency</label>
                  <select
                    id="currency"
                    name="currency"
                    value={settings.preferences.currency}
                    onChange={handlePreferenceChange}
                    className="futuristic-input"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="theme" className="form-label">Theme</label>
                  <select
                    id="theme"
                    name="theme"
                    value={settings.preferences.theme}
                    onChange={handlePreferenceChange}
                    className="futuristic-input"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="system">System</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Privacy Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Privacy</h2>
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.privacy.showProfile}
                    onChange={() => handlePrivacyChange('showProfile')}
                    className="form-checkbox"
                  />
                  <span>Show Public Profile</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.privacy.showActivity}
                    onChange={() => handlePrivacyChange('showActivity')}
                    className="form-checkbox"
                  />
                  <span>Show Activity History</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.privacy.showHoldings}
                    onChange={() => handlePrivacyChange('showHoldings')}
                    className="form-checkbox"
                  />
                  <span>Show Token Holdings</span>
                </label>
              </div>
            </section>

            <div className="flex justify-end space-x-4">
              <button type="button" className="button button-secondary">
                Cancel
              </button>
              <button type="submit" className="button button-primary">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
