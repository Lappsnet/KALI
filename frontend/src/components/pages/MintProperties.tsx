"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAppKitAccount } from "@reown/appkit/react"
import { ActionButton } from "../ActionButton"
import { Building, Upload, Check } from "lucide-react"
import { useRealEstateContract } from "../hooks/useRealEstateContract"

interface MintPropertiesProps {
  sendHash?: (hash: `0x${string}`) => void
}

export const MintProperties = ({ sendHash }: MintPropertiesProps) => {
  const { isConnected, address } = useAppKitAccount()
  const { mintProperty, isLoading, isSuccess, txHash } = useRealEstateContract()

  const [formData, setFormData] = useState({
    propertyName: "",
    propertyAddress: "",
    propertyValue: "",
    cadastralNumber: "",
    propertyDescription: "",
    propertyImage: null as File | null,
  })

  const [previewUrl, setPreviewUrl] = useState("")
  const [step, setStep] = useState(1)
  const [mintedTokenId, setMintedTokenId] = useState<bigint | null>(null)

  useEffect(() => {
    if (txHash && isSuccess && sendHash) {
      sendHash(txHash)
    }
  }, [txHash, isSuccess, sendHash])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFormData({
        ...formData,
        propertyImage: file,
      })

      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formData.propertyName || !formData.propertyAddress || !formData.propertyValue || !formData.cadastralNumber) {
      alert("Please fill in all required fields")
      return
    }

    // Move to confirmation step
    setStep(2)
  }

  const handleConfirm = async () => {
    // In a real app, you would upload the image to IPFS first
    // For this example, we'll use the preview URL
    const imageUrl = previewUrl || "/suburban-house-exterior.png"

    // Call the mintProperty function from our hook
    await mintProperty(
      {
        cadastralNumber: formData.cadastralNumber,
        location: formData.propertyAddress,
        valuation: formData.propertyValue,
        name: formData.propertyName,
        description: formData.propertyDescription,
        image: imageUrl,
        attributes: [
          {
            trait_type: "Property Type",
            value: "Residential",
          },
          {
            trait_type: "Cadastral Number",
            value: formData.cadastralNumber,
          },
        ],
      },
      (tokenId) => {
        setMintedTokenId(tokenId)
        setStep(3)
      },
    )
  }

  if (!isConnected) {
    return (
      <div className="page-container">
        <div className="connect-prompt">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to mint properties</p>
          <appkit-button />
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Mint Properties</h1>
        <p>Create new property tokens on the blockchain</p>
      </div>

      <div className="glass-card mint-card">
        {step === 1 && (
          <form onSubmit={handleSubmit} className="mint-form">
            <div className="form-group">
              <label htmlFor="propertyName">Property Name</label>
              <input
                type="text"
                id="propertyName"
                name="propertyName"
                value={formData.propertyName}
                onChange={handleInputChange}
                required
                placeholder="e.g. Modern Downtown Apartment"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cadastralNumber">Cadastral Number</label>
              <input
                type="text"
                id="cadastralNumber"
                name="cadastralNumber"
                value={formData.cadastralNumber}
                onChange={handleInputChange}
                required
                placeholder="e.g. 123-456-789"
              />
            </div>

            <div className="form-group">
              <label htmlFor="propertyAddress">Property Address</label>
              <input
                type="text"
                id="propertyAddress"
                name="propertyAddress"
                value={formData.propertyAddress}
                onChange={handleInputChange}
                required
                placeholder="e.g. 123 Main St, New York, NY"
              />
            </div>

            <div className="form-group">
              <label htmlFor="propertyValue">Property Value (ETH)</label>
              <input
                type="number"
                id="propertyValue"
                name="propertyValue"
                value={formData.propertyValue}
                onChange={handleInputChange}
                required
                placeholder="e.g. 1.5"
                step="0.01"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="propertyDescription">Property Description</label>
              <textarea
                id="propertyDescription"
                name="propertyDescription"
                value={formData.propertyDescription}
                onChange={handleInputChange}
                required
                placeholder="Describe the property..."
                rows={4}
              />
            </div>

            <div className="form-group">
              <label htmlFor="propertyImage">Property Image</label>
              <div className="image-upload-container">
                {previewUrl ? (
                  <div className="image-preview">
                    <img src={previewUrl || "/placeholder.svg"} alt="Property preview" />
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <Upload size={32} />
                    <p>Click or drag to upload</p>
                  </div>
                )}
                <input
                  type="file"
                  id="propertyImage"
                  name="propertyImage"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="file-input"
                />
              </div>
            </div>

            <div className="form-actions">
              <ActionButton>Continue to Review</ActionButton>
            </div>
          </form>
        )}

        {step === 2 && (
          <div className="mint-review">
            <h3>Review Property Details</h3>

            <div className="review-details">
              <div className="review-image">
                {previewUrl ? (
                  <img src={previewUrl || "/placeholder.svg"} alt="Property" />
                ) : (
                  <div className="no-image">
                    <Building size={48} />
                  </div>
                )}
              </div>

              <div className="review-info">
                <div className="review-item">
                  <span className="review-label">Name:</span>
                  <span className="review-value">{formData.propertyName}</span>
                </div>

                <div className="review-item">
                  <span className="review-label">Cadastral Number:</span>
                  <span className="review-value">{formData.cadastralNumber}</span>
                </div>

                <div className="review-item">
                  <span className="review-label">Address:</span>
                  <span className="review-value">{formData.propertyAddress}</span>
                </div>

                <div className="review-item">
                  <span className="review-label">Value:</span>
                  <span className="review-value">{formData.propertyValue} ETH</span>
                </div>

                <div className="review-item">
                  <span className="review-label">Description:</span>
                  <span className="review-value">{formData.propertyDescription}</span>
                </div>

                <div className="review-item">
                  <span className="review-label">Owner:</span>
                  <span className="review-value">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </div>
              </div>
            </div>

            <div className="review-actions">
              <ActionButton variant="outline" onClick={() => setStep(1)}>
                Back to Edit
              </ActionButton>
              <ActionButton onClick={handleConfirm} disabled={isLoading}>
                {isLoading ? "Processing..." : "Confirm & Mint"}
              </ActionButton>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mint-success">
            <div className="success-icon">
              <Check size={48} />
            </div>
            <h3>Property Successfully Minted!</h3>
            <p>Your property has been tokenized and added to the blockchain.</p>

            <div className="success-details">
              <div className="success-item">
                <span className="success-label">Property Name:</span>
                <span className="success-value">{formData.propertyName}</span>
              </div>

              <div className="success-item">
                <span className="success-label">Token ID:</span>
                <span className="success-value">{mintedTokenId?.toString() || "Processing..."}</span>
              </div>

              <div className="success-item">
                <span className="success-label">Transaction:</span>
                <span className="success-value">
                  {txHash ? (
                    <a
                      href={`https://sepolia.etherscan.io/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tx-link"
                    >
                      {txHash.slice(0, 10)}...{txHash.slice(-8)}
                    </a>
                  ) : (
                    "Processing..."
                  )}
                </span>
              </div>
            </div>

            <div className="success-actions">
              <ActionButton onClick={() => (window.location.href = "/dashboard")}>Return to Dashboard</ActionButton>
              <ActionButton
                variant="outline"
                onClick={() => {
                  setFormData({
                    propertyName: "",
                    propertyAddress: "",
                    propertyValue: "",
                    cadastralNumber: "",
                    propertyDescription: "",
                    propertyImage: null,
                  })
                  setPreviewUrl("")
                  setStep(1)
                }}
              >
                Mint Another Property
              </ActionButton>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
