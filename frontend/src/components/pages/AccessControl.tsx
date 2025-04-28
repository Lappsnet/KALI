"use client"

import { useState, useEffect } from "react"
import { useAppKitAccount } from "@reown/appkit/react"
import { User, Shield, Key, Lock, Unlock } from "lucide-react"
import "../../styles/Admin.css"

interface UserRole {
  address: string
  role: "admin" | "notary" | "user"
  status: "active" | "inactive"
  lastActive: string
}

export const AccessControl = () => {
  const { isConnected, address } = useAppKitAccount()
  const [users, setUsers] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Mock data for now
        const mockUsers: UserRole[] = [
          {
            address: "0x123...abc",
            role: "admin",
            status: "active",
            lastActive: "2024-03-15"
          },
          {
            address: "0x456...def",
            role: "notary",
            status: "active",
            lastActive: "2024-03-14"
          },
          {
            address: "0x789...ghi",
            role: "user",
            status: "inactive",
            lastActive: "2024-03-10"
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

  const handleRoleChange = async (userAddress: string, newRole: UserRole["role"]) => {
    // TODO: Implement role change logic
    console.log("Changing role for", userAddress, "to", newRole)
  }

  const handleStatusChange = async (userAddress: string, newStatus: UserRole["status"]) => {
    // TODO: Implement status change logic
    console.log("Changing status for", userAddress, "to", newStatus)
  }

  if (!isConnected) {
    return (
      <div className="page-container">
        <div className="connect-prompt">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to access the control panel</p>
          <appkit-button />
        </div>
      </div>
    )
  }

  if (loading) return <div className="loading">Loading user roles...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="page-container">
      <div className="page-header">
        <h1></h1>
        <p>Manage user roles and permissions</p>
      </div>

      <div className="access-control-table">
        <table>
          <thead>
            <tr>
              <th>User Address</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.address}>
                <td>
                  <div className="user-info">
                    <User size={16} />
                    <span>{user.address}</span>
                  </div>
                </td>
                <td>
                  <div className={`role-badge ${user.role}`}>
                    {user.role === "admin" && <Shield size={16} />}
                    {user.role === "notary" && <Key size={16} />}
                    {user.role === "user" && <User size={16} />}
                    <span>{user.role}</span>
                  </div>
                </td>
                <td>
                  <div className={`status-badge ${user.status}`}>
                    {user.status === "active" ? <Unlock size={16} /> : <Lock size={16} />}
                    <span>{user.status}</span>
                  </div>
                </td>
                <td>{new Date(user.lastActive).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.address, e.target.value as UserRole["role"])}
                      className="action-button"
                    >
                      <option value="admin">Admin</option>
                      <option value="notary">Notary</option>
                      <option value="user">User</option>
                    </select>
                    <button
                      className={`action-button ${user.status === "active" ? "deactivate" : "activate"}`}
                      onClick={() => handleStatusChange(user.address, user.status === "active" ? "inactive" : "active")}
                    >
                      {user.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 