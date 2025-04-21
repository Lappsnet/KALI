"use client"

import { useState } from "react"
import { useAppKitAccount } from "@reown/appkit/react"
import { User, Mail, Phone, MapPin, Edit2, Save, X } from "lucide-react"

interface ProfileData {
  name: string
  email: string
  phone: string
  location: string
  bio: string
}

export const Profile = () => {
  const { isConnected, address } = useAppKitAccount()
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<ProfileData>({
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 234-567-8901",
    location: "New York, USA",
    bio: "Real estate enthusiast and blockchain developer"
  })

  const handleSave = async () => {
    // TODO: Implement profile update logic
    console.log("Saving profile:", profile)
    setIsEditing(false)
  }

  const handleCancel = () => {
    // TODO: Reset to original values
    setIsEditing(false)
  }

  if (!isConnected) {
    return (
      <div className="page-container">
        <div className="connect-prompt">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to access your profile</p>
          <appkit-button />
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Profile Settings</h1>
        <p>Manage your personal information</p>
      </div>

      <div className="profile-section">
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={64} />
          </div>
          <div className="profile-actions">
            {!isEditing ? (
              <button
                className="edit-button"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 size={16} />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="edit-actions">
                <button
                  className="save-button"
                  onClick={handleSave}
                >
                  <Save size={16} />
                  <span>Save Changes</span>
                </button>
                <button
                  className="cancel-button"
                  onClick={handleCancel}
                >
                  <X size={16} />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-group">
            <label>Name</label>
            {isEditing ? (
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            ) : (
              <div className="detail-item">
                <User size={16} />
                <span>{profile.name}</span>
              </div>
            )}
          </div>

          <div className="detail-group">
            <label>Email</label>
            {isEditing ? (
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            ) : (
              <div className="detail-item">
                <Mail size={16} />
                <span>{profile.email}</span>
              </div>
            )}
          </div>

          <div className="detail-group">
            <label>Phone</label>
            {isEditing ? (
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            ) : (
              <div className="detail-item">
                <Phone size={16} />
                <span>{profile.phone}</span>
              </div>
            )}
          </div>

          <div className="detail-group">
            <label>Location</label>
            {isEditing ? (
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              />
            ) : (
              <div className="detail-item">
                <MapPin size={16} />
                <span>{profile.location}</span>
              </div>
            )}
          </div>

          <div className="detail-group">
            <label>Bio</label>
            {isEditing ? (
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              />
            ) : (
              <p className="bio-text">{profile.bio}</p>
            )}
          </div>
        </div>

        <div className="wallet-info">
          <h3>Connected Wallet</h3>
          <div className="wallet-address">
            <span>{address}</span>
          </div>
        </div>
      </div>
    </div>
  )
} 