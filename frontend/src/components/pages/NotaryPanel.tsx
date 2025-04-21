"use client"

import { useState, useEffect } from "react"
import { useAppKitAccount } from "@reown/appkit/react"
import { FileText, CheckCircle2, XCircle, Clock } from "lucide-react"

interface NotaryRequest {
  id: string
  propertyId: string
  requester: string
  documentHash: string
  status: "pending" | "approved" | "rejected"
  requestDate: string
  documentType: string
}

export const NotaryPanel = () => {
  const { isConnected, address } = useAppKitAccount()
  const [requests, setRequests] = useState<NotaryRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        // Mock data for now
        const mockRequests: NotaryRequest[] = [
          {
            id: "1",
            propertyId: "123",
            requester: "0x123...abc",
            documentHash: "0x456...def",
            status: "pending",
            requestDate: "2024-03-15",
            documentType: "Title Deed"
          },
          {
            id: "2",
            propertyId: "124",
            requester: "0x789...ghi",
            documentHash: "0x012...jkl",
            status: "approved",
            requestDate: "2024-03-10",
            documentType: "Property Survey"
          },
          {
            id: "3",
            propertyId: "125",
            requester: "0x345...uvw",
            documentHash: "0x678...rst",
            status: "rejected",
            requestDate: "2024-03-05",
            documentType: "Building Permit"
          }
        ]
        setRequests(mockRequests)
      } catch (err) {
        setError("Failed to fetch notary requests")
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [])

  const handleApprove = async (requestId: string) => {
    // TODO: Implement approval logic
    console.log("Approving request:", requestId)
  }

  const handleReject = async (requestId: string) => {
    // TODO: Implement rejection logic
    console.log("Rejecting request:", requestId)
  }

  if (!isConnected) {
    return (
      <div className="page-container">
        <div className="connect-prompt">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to access the notary panel</p>
          <appkit-button />
        </div>
      </div>
    )
  }

  if (loading) return <div className="loading">Loading notary requests...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Notary Panel</h1>
        <p>Review and verify property documents</p>
      </div>

      <div className="notary-requests">
        <table>
          <thead>
            <tr>
              <th>Property ID</th>
              <th>Document Type</th>
              <th>Requester</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id}>
                <td>
                  <div className="property-info">
                    <FileText size={16} />
                    <span>{request.propertyId}</span>
                  </div>
                </td>
                <td>{request.documentType}</td>
                <td>
                  <div className="user-info">
                    <span>{request.requester.slice(0, 6)}...{request.requester.slice(-4)}</span>
                  </div>
                </td>
                <td>
                  <div className={`status-badge ${request.status}`}>
                    {request.status === "pending" && <Clock size={16} />}
                    {request.status === "approved" && <CheckCircle2 size={16} />}
                    {request.status === "rejected" && <XCircle size={16} />}
                    <span>{request.status}</span>
                  </div>
                </td>
                <td>{new Date(request.requestDate).toLocaleDateString()}</td>
                <td>
                  {request.status === "pending" && (
                    <div className="action-buttons">
                      <button 
                        className="action-button approve"
                        onClick={() => handleApprove(request.id)}
                      >
                        Approve
                      </button>
                      <button 
                        className="action-button reject"
                        onClick={() => handleReject(request.id)}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 