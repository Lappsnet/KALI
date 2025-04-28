"use client"

import React, { useState, useEffect } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { useLendingProtocolContract } from '../hooks/useLendingProtocolContract';
import { formatEther } from 'viem';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader, 
  BarChart2, 
  TrendingUp, 
  Clock,
  Shield,
  FileCheck,
  FileX
} from 'lucide-react';
import './NotaryPanel.css';

interface Document {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadDate: string;
  owner: string;
  transactionHash: string;
}

interface VerificationStats {
  total: number;
  verified: number;
  pending: number;
  rejected: number;
}

// Mock data for demonstration
const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Property Title Deed',
    type: 'PDF',
    status: 'verified',
    uploadDate: '2024-03-15',
    owner: '0x1234...5678',
    transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  },
  {
    id: '2',
    name: 'Property Survey',
    type: 'PDF',
    status: 'pending',
    uploadDate: '2024-03-14',
    owner: '0x5678...1234',
    transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
  },
  {
    id: '3',
    name: 'Tax Records',
    type: 'PDF',
    status: 'rejected',
    uploadDate: '2024-03-13',
    owner: '0x1234...5678',
    transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  }
];

export const NotaryPanel: React.FC = () => {
  const { address, isConnected } = useAppKitAccount();
  const { contractAddress, isLoading: isLoadingContract, verifyDocument, rejectDocument } = useLendingProtocolContract();

  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'rejecting'>('idle');

  const stats: VerificationStats = {
    total: documents.length,
    verified: documents.filter(doc => doc.status === 'verified').length,
    pending: documents.filter(doc => doc.status === 'pending').length,
    rejected: documents.filter(doc => doc.status === 'rejected').length
  };

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!isConnected || !address || !contractAddress) return;

      setLoading(true);
      try {
        // TODO: Replace with actual contract call
        // const pendingDocs = await contract.getPendingDocuments();
        // For now, use mock data
        setDocuments(mockDocuments);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Failed to fetch documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [isConnected, address, contractAddress]);

  const handleVerify = async (documentId: string) => {
    if (!contractAddress || !address) return;

    setVerificationStatus('verifying');
    try {
      const tx = await verifyDocument(documentId);
      if (tx) {
        setDocuments(docs => 
          docs.map(doc => 
            doc.id === documentId 
              ? { ...doc, status: 'verified', transactionHash: tx.hash } 
              : doc
          )
        );
      }
    } catch (err) {
      console.error('Error verifying document:', err);
      setError('Failed to verify document');
    } finally {
      setVerificationStatus('idle');
    }
  };

  const handleReject = async (documentId: string) => {
    if (!contractAddress || !address) return;

    setVerificationStatus('rejecting');
    try {
      const tx = await rejectDocument(documentId);
      if (tx) {
        setDocuments(docs => 
          docs.map(doc => 
            doc.id === documentId 
              ? { ...doc, status: 'rejected', transactionHash: tx.hash } 
              : doc
          )
        );
      }
    } catch (err) {
      console.error('Error rejecting document:', err);
      setError('Failed to reject document');
    } finally {
      setVerificationStatus('idle');
    }
  };

  if (!isConnected) {
    return (
      <div className="page-container">
        <div className="connect-prompt">
          <Shield size={48} className="icon" />
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to access the Notary Panel</p>
          <appkit-button />
        </div>
      </div>
    );
  }

  if (loading || isLoadingContract) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <Loader className="animate-spin" size={32} />
          <p>Loading documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-container">
          <AlertTriangle size={32} />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1></h1>
        <p>Verify and manage property documents</p>
      </div>

      <div className="stats-section">
        <div className="glass-card">
          <div className="section-header">
            <h2>Overview</h2>
            <BarChart2 className="section-icon" />
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon total">
                <FileText size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-label">Total Documents</div>
                <div className="stat-value">{stats.total}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon verified">
                <CheckCircle size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-label">Verified</div>
                <div className="stat-value">{stats.verified}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon pending">
                <Clock size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-label">Pending</div>
                <div className="stat-value">{stats.pending}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon rejected">
                <XCircle size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-label">Rejected</div>
                <div className="stat-value">{stats.rejected}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="documents-section">
        <div className="glass-card">
          <div className="section-header">
            <h2>Pending Documents</h2>
            <FileText className="section-icon" />
          </div>
          <div className="documents-list">
            {documents.map((doc) => (
              <div 
                key={doc.id} 
                className={`document-item ${doc.status}`}
                onClick={() => setSelectedDocument(doc)}
              >
                <div className="document-info">
                  <div className="document-name">{doc.name}</div>
                  <div className="document-meta">
                    <span className="document-type">{doc.type}</span>
                    <span className="document-date">{new Date(doc.uploadDate).toLocaleDateString()}</span>
                    <span className="document-owner">{doc.owner}</span>
                  </div>
                </div>
                <div className="document-actions">
                  {doc.status === 'pending' && (
                    <>
                      <button 
                        className="action-button verify"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVerify(doc.id);
                        }}
                        disabled={verificationStatus !== 'idle'}
                      >
                        <FileCheck size={16} />
                        Verify
                      </button>
                      <button 
                        className="action-button reject"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReject(doc.id);
                        }}
                        disabled={verificationStatus !== 'idle'}
                      >
                        <FileX size={16} />
                        Reject
                      </button>
                    </>
                  )}
                  {doc.status !== 'pending' && (
                    <span className={`status-badge ${doc.status}`}>
                      {doc.status}
                    </span>
                  )}
                  {doc.transactionHash && (
                    <a
                      href={`https://pharosscan.xyz/tx/${doc.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transaction-link"
                    >
                      View on Pharos Scan
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedDocument && (
        <div className="document-details-modal">
          <div className="modal-content">
            <h3>{selectedDocument.name}</h3>
            <div className="modal-details">
              <div className="detail-item">
                <span className="detail-label">Type:</span>
                <span className="detail-value">{selectedDocument.type}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Upload Date:</span>
                <span className="detail-value">{new Date(selectedDocument.uploadDate).toLocaleDateString()}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Owner:</span>
                <span className="detail-value">{selectedDocument.owner}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span className={`status-badge ${selectedDocument.status}`}>
                  {selectedDocument.status}
                </span>
              </div>
            </div>
            <button 
              className="close-button"
              onClick={() => setSelectedDocument(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 