"use client"

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppKitAccount } from '@reown/appkit/react';
import { useLendingProtocolContract } from '../hooks/useLendingProtocolContract';
import { FileText, Upload, Download, AlertTriangle, CheckCircle, History, Clock } from 'lucide-react';
import { formatEther } from 'viem';
import { ActionButton } from '../ActionButton';
import './PropertyDocuments.css';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  ipfsHash: string;
  status: 'verified' | 'pending' | 'rejected';
  transactionHash?: string;
  content?: string;
}

interface DocumentHistory {
  id: string;
  documentId: string;
  action: 'upload' | 'verify' | 'reject';
  date: string;
  by: string;
  transactionHash?: string;
}

// Mock data for documents
const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Property Agreement - Prop5 Perez',
    type: 'Markdown',
    size: '15 KB',
    uploadDate: '2024-03-15',
    ipfsHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    status: 'verified',
    transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    content: `**Rental ID (Once Created):** Pending On-Chain Creation
**Property Address:** 123 Main St, Anytown, USA
**Landlord:** John Perez
**Tenant:** Jane Smith
**Monthly Rent:** $2,500
**Security Deposit:** $5,000
**Lease Term:** 12 months
**Start Date:** April 1, 2024
**End Date:** March 31, 2025
**Special Terms:** 
- Pets allowed with $500 additional deposit
- Tenant responsible for utilities
- Landlord responsible for major repairs
**Signatures:**
- Landlord: [Pending]
- Tenant: [Pending]`
  },
  {
    id: '2',
    name: 'Property Title Deed',
    type: 'PDF',
    size: '2.5 MB',
    uploadDate: '2024-03-10',
    ipfsHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    status: 'verified',
    transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
  },
  {
    id: '3',
    name: 'Property Survey',
    type: 'PDF',
    size: '1.8 MB',
    uploadDate: '2024-03-05',
    ipfsHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    status: 'pending'
  }
];

// Mock data for document history
const mockDocumentHistory: DocumentHistory[] = [
  {
    id: '1',
    documentId: '1',
    action: 'upload',
    date: '2024-03-15',
    by: '0x1234...5678',
    transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  },
  {
    id: '2',
    documentId: '1',
    action: 'verify',
    date: '2024-03-16',
    by: '0x5678...1234',
    transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
  },
  {
    id: '3',
    documentId: '2',
    action: 'upload',
    date: '2024-03-10',
    by: '0x1234...5678'
  }
];

export const PropertyDocuments: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const { address, isConnected } = useAppKitAccount();
  const { contract, isLoading: isLoadingContract } = useLendingProtocolContract();

  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [history, setHistory] = useState<DocumentHistory[]>(mockDocumentHistory);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!isConnected || !address || !contract) return;

      try {
        // TODO: Replace with actual contract call
        // const propertyDocs = await contract.getPropertyDocuments(propertyId);
        // For now, use mock data
        setDocuments(mockDocuments);
        setHistory(mockDocumentHistory);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Failed to fetch documents');
      }
    };

    fetchDocuments();
  }, [isConnected, address, contract, propertyId]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !isConnected || !address || !contract) return;

    setUploadStatus('uploading');
    setError(null);

    try {
      // TODO: Implement IPFS upload
      // 1. Upload to IPFS
      // const ipfsHash = await uploadToIPFS(selectedFile);
      
      // 2. Call smart contract to register document
      // const tx = await contract.registerDocument(propertyId, ipfsHash, selectedFile.name);
      // await tx.wait();
      
      // For now, simulate successful upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      
      // Add new document to state
      const newDocument: Document = {
        id: Date.now().toString(),
        name: selectedFile.name,
        type: selectedFile.type,
        size: `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB`,
        uploadDate: new Date().toISOString().split('T')[0],
        ipfsHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
        status: 'pending',
        transactionHash: mockHash
      };

      setDocuments([newDocument, ...documents]);
      setUploadStatus('success');
      setTransactionHash(mockHash);
      setSelectedFile(null);

      // Add to history
      const newHistoryItem: DocumentHistory = {
        id: Date.now().toString(),
        documentId: newDocument.id,
        action: 'upload',
        date: new Date().toISOString().split('T')[0],
        by: address,
        transactionHash: mockHash
      };
      setHistory([newHistoryItem, ...history]);
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Failed to upload document');
      setUploadStatus('error');
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      if (document.name === 'Property Agreement - Prop5 Perez') {
        // Create a blob with the agreement content
        const blob = new Blob([document.content || ''], { type: 'text/markdown' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'agreement-prop5-perez.md';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // TODO: Implement IPFS download for other documents
        // const file = await downloadFromIPFS(document.ipfsHash);
        // const url = window.URL.createObjectURL(file);
        // const a = document.createElement('a');
        // a.href = url;
        // a.download = document.name;
        // document.body.appendChild(a);
        // a.click();
        // window.URL.revokeObjectURL(url);
        alert(`Downloading ${document.name} from IPFS...`);
      }
    } catch (err) {
      console.error('Error downloading document:', err);
      setError('Failed to download document');
    }
  };

  if (!isConnected) {
    return (
      <div className="page-container">
        <div className="connect-prompt">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to view property documents</p>
          <appkit-button />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Property Documents</h1>
        <p>Manage and verify property documentation</p>
      </div>

      <div className="documents-section">
        <div className="glass-card">
          <div className="section-header">
            <h2>Upload Document</h2>
            <FileText className="section-icon" />
          </div>

          <div className="upload-area">
            <input
              type="file"
              id="document-upload"
              onChange={handleFileSelect}
              className="file-input"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <label htmlFor="document-upload" className="upload-label">
              <Upload className="upload-icon" />
              <span>Choose a file</span>
            </label>
            {selectedFile && (
              <div className="selected-file">
                <span>{selectedFile.name}</span>
                <span className="file-size">
                  {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="error-message">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          {uploadStatus === 'success' && transactionHash && (
            <div className="success-message">
              <CheckCircle size={16} />
              <div>
                <p>Document uploaded successfully!</p>
                <a
                  href={`https://pharosscan.com/tx/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transaction-link"
                >
                  View transaction
                </a>
              </div>
            </div>
          )}

          <div className="action-button">
            <ActionButton
              onClick={handleUpload}
              disabled={!selectedFile || uploadStatus === 'uploading'}
            >
              {uploadStatus === 'uploading' ? (
                <>
                  <Clock className="animate-spin" size={16} />
                  Uploading...
                </>
              ) : (
                'Upload Document'
              )}
            </ActionButton>
          </div>
        </div>

        <div className="glass-card">
          <div className="section-header">
            <h2>Document List</h2>
            <FileText className="section-icon" />
          </div>

          <div className="documents-list">
            {documents.map((doc) => (
              <div key={doc.id} className="document-item">
                <div className="document-info">
                  <div className="document-name">{doc.name}</div>
                  <div className="document-meta">
                    <span>{doc.type}</span>
                    <span>{doc.size}</span>
                    <span className={`status-badge ${doc.status}`}>
                      {doc.status}
                    </span>
                  </div>
                  {doc.name === 'Property Agreement - Prop5 Perez' && (
                    <div className="agreement-preview">
                      <pre>{doc.content?.split('\n').slice(0, 5).join('\n')}...</pre>
                    </div>
                  )}
                </div>
                <div className="document-actions">
                  <button
                    onClick={() => handleDownload(doc)}
                    className="download-button"
                  >
                    <Download size={16} />
                    Download
                  </button>
                  {doc.transactionHash && (
                    <a
                      href={`https://pharosscan.com/tx/${doc.transactionHash}`}
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

        <div className="glass-card">
          <div className="section-header">
            <h2>Document History</h2>
            <History className="section-icon" />
          </div>

          <div className="history-list">
            {history.map((item) => (
              <div key={item.id} className="history-item">
                <div className="history-date">{item.date}</div>
                <div className="history-details">
                  <div className="history-action">
                    {item.action === 'upload' ? 'Uploaded' : 
                     item.action === 'verify' ? 'Verified' : 'Rejected'}
                  </div>
                  <div className="history-by">
                    by {item.by}
                  </div>
                </div>
                {item.transactionHash && (
                  <a
                    href={`https://pharosscan.com/tx/${item.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transaction-link"
                  >
                    View transaction
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 