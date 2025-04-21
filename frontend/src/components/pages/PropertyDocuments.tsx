"use client"

import { useState, useEffect } from "react"
import { useAppKitAccount } from "@reown/appkit/react"
import { FileText, Upload, Download, Trash2 } from "lucide-react"
import { useRealEstateContract } from "../hooks/useRealEstateContract"

interface Document {
  id: string
  propertyId: string
  title: string
  type: string
  uploadDate: string
  size: string
  hash: string
}

export const PropertyDocuments = () => {
  const { isConnected, address } = useAppKitAccount()
  const { getPropertyDocuments } = useRealEstateContract()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        if (!address) return
        const userDocuments = await getPropertyDocuments(address)
        setDocuments(userDocuments)
      } catch (err) {
        setError("Failed to fetch documents")
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [address, getPropertyDocuments])

  const handleUpload = async (file: File) => {
    // TODO: Implement document upload to IPFS and smart contract
    console.log("Uploading document:", file.name)
  }

  const handleDownload = async (document: Document) => {
    // TODO: Implement document download from IPFS
    console.log("Downloading document:", document.title)
  }

  const handleDelete = async (documentId: string) => {
    // TODO: Implement document deletion from smart contract
    console.log("Deleting document:", documentId)
  }

  if (!isConnected) {
    return (
      <div className="page-container">
        <div className="connect-prompt">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to manage property documents</p>
          <appkit-button />
        </div>
      </div>
    )
  }

  if (loading) return <div className="loading">Loading documents...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Property Documents</h1>
        <p>Manage your property-related documents</p>
      </div>

      <div className="documents-actions">
        <div className="upload-section">
          <input
            type="file"
            id="document-upload"
            className="file-input"
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
          />
          <label htmlFor="document-upload" className="upload-button">
            <Upload size={16} />
            <span>Upload Document</span>
          </label>
        </div>
      </div>

      <div className="documents-grid">
        {documents.map((doc) => (
          <div key={doc.id} className="document-card">
            <div className="document-icon">
              <FileText size={24} />
            </div>
            <div className="document-details">
              <h3>{doc.title}</h3>
              <div className="document-info">
                <span className="document-type">{doc.type}</span>
                <span className="document-date">{doc.uploadDate}</span>
                <span className="document-size">{doc.size}</span>
              </div>
            </div>
            <div className="document-actions">
              <button className="action-button" onClick={() => handleDownload(doc)}>
                <Download size={16} />
              </button>
              <button className="action-button delete" onClick={() => handleDelete(doc.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 