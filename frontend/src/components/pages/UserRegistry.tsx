"use client"

import { useState, useEffect } from "react"
import { useAppKitAccount } from "@reown/appkit/react"
import { User, Mail, Phone, MapPin, Calendar, Shield } from "lucide-react"

interface UserProfile {
  address: string
  name: string
  email: string
  phone: string
  location: string
  joinDate: string
  role: "admin" | "notary" | "user"
  verified: boolean
}

export const UserRegistry = () => {
  const { isConnected } = useAppKitAccount()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Mock data for now
        const mockUsers: UserProfile[] = [
          {
            address: "0x123...abc",
            name: "John Doe",
            email: "john@example.com",
            phone: "+1 234-567-8901",
            location: "New York, USA",
            joinDate: "2024-01-15",
            role: "admin",
            verified: true
          },
          {
            address: "0x456...def",
            name: "Jane Smith",
            email: "jane@example.com",
            phone: "+1 234-567-8902",
            location: "London, UK",
            joinDate: "2024-02-01",
            role: "notary",
            verified: true
          },
          {
            address: "0x789...ghi",
            name: "Bob Johnson",
            email: "bob@example.com",
            phone: "+1 234-567-8903",
            location: "Tokyo, Japan",
            joinDate: "2024-03-01",
            role: "user",
            verified: false
          }
        ]
        setUsers(mockUsers)
      } catch (err) {
        setError("Failed to fetch users")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleVerify = async (userAddress: string) => {
    // TODO: Implement verification logic
    console.log("Verifying user:", userAddress)
  }

  if (!isConnected) {
    return (
      <div className="page-container">
        <div className="connect-prompt">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to access the user registry</p>
          <appkit-button />
        </div>
      </div>
    )
  }

  if (loading) return <div className="loading">Loading user profiles...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="page-container">
      <div className="page-header">
        <h1></h1>
        <p>Manage user profiles and information</p>
      </div>

      <div className="user-profiles">
        {users.map((user) => (
          <div key={user.address} className="user-card">
            <div className="user-header">
              <div className="user-avatar">
                <User size={24} />
              </div>
              <div className="user-title">
                <h3>{user.name}</h3>
                <div className={`role-badge ${user.role}`}>
                  <Shield size={16} />
                  <span>{user.role}</span>
                </div>
              </div>
              {!user.verified && (
                <button
                  className="verify-button"
                  onClick={() => handleVerify(user.address)}
                >
                  Verify
                </button>
              )}
            </div>
            <div className="user-details">
              <div className="detail-item">
                <Mail size={16} />
                <span>{user.email}</span>
              </div>
              <div className="detail-item">
                <Phone size={16} />
                <span>{user.phone}</span>
              </div>
              <div className="detail-item">
                <MapPin size={16} />
                <span>{user.location}</span>
              </div>
              <div className="detail-item">
                <Calendar size={16} />
                <span>Joined: {new Date(user.joinDate).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="user-address">
              <span>Address: {user.address}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 