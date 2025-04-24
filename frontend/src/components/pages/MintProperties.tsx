"use client";

import React, { useState, useEffect, useCallback } from "react";
// Using Appkit hooks as per your import
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { ActionButton } from "../ActionButton"; // Assuming ActionButton is styled
import { Building, Upload, Check, Loader2 } from "lucide-react";
import { useRealEstateContract } from "../hooks/useRealEstateContract"; // Adjust path if needed
import { useConfig } from "wagmi";
import { parseEther } from "viem";

interface MintPropertiesProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export const MintProperties = ({ onSuccess }: MintPropertiesProps) => {
  const { isConnected, address } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const wagmiConfig = useConfig();

  // Using the updated hook
  const {
    mintProperty,
    isLoading: isMintLoading, // Combined pending + confirming state from hook
    isConfirming,           // Specific state for waiting for receipt
    isConfirmed,            // Specific state for tx success (after receipt)
    error: hookError,       // Error object/string from the hook
    txHash,                 // The hash of the submitted transaction
    receipt,                // The receipt once confirmed
  } = useRealEstateContract();

  // Local component state
  const [isUploading, setIsUploading] = useState(false); // State for IPFS uploads
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [step, setStep] = useState(1); // 1: Form, 2: Review/Upload/Mint, 3: Success
  const [mintedTokenId, setMintedTokenId] = useState<bigint | null>(null);
  const [formData, setFormData] = useState({
    propertyName: "",
    propertyAddress: "",
    propertyValue: "", // Keep as string for input flexibility
    cadastralNumber: "",
    propertyDescription: "",
    propertyImage: null as File | null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Derive block explorer URL from config
  const blockExplorerUrl = wagmiConfig.chains.find(chain => chain.id === chainId)?.blockExplorers?.default?.url;

   // Effect to update parent component when transaction hash is available from the hook
   useEffect(() => {
    if (txHash && onSuccess) {
      // Convert txHash to bigint for proper type assignment
      setMintedTokenId(BigInt(txHash));
      onSuccess();
    }
  }, [txHash, onSuccess]);

  // Cleanup image preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);


  // Input handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormError(null); // Clear error on input change
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormError(null);
    const file = e.target.files?.[0];
    // Clean up previous preview
    if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
    }
    if (file) {
      setFormData(prev => ({ ...prev, propertyImage: file }));
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setFormData(prev => ({ ...prev, propertyImage: null }));
    }
  };

  // Step 1 -> Step 2 validation
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setFormError(null);

    // Basic validation
    if (!formData.propertyName || !formData.propertyAddress || !formData.propertyValue || !formData.cadastralNumber) {
      setFormError("Please fill in all required fields.");
      return;
    }

    // Valuation validation
    try {
      const parsedValue = parseEther(formData.propertyValue);
      if (parsedValue <= 0n) {
        setFormError("Property Value must be positive.");
        return;
      }
    } catch {
      setFormError("Please enter a valid number for Property Value (e.g., 1.5).");
      return;
    }

    setStep(2); // Move to review step
  };

  // Step 2 -> Step 3 confirmation (Upload + Mint)
  const handleConfirmAndMint = useCallback(async () => {
    if (!formData.propertyImage) {
      setFormError("Please upload a property image.");
      return;
    }
    if (!address) {
      setFormError("Wallet not connected.");
      return;
    }

    setUploadError(null);
    setFormError(null);
    setIsUploading(true);

    // --- Pinata JWT Check ---
    const pinataJwt = import.meta.env.VITE_PINATA_JWT;
    if (!pinataJwt) {
      console.error("VITE_PINATA_JWT not found in .env");
      setUploadError("Configuration error: Cannot upload files.");
      setIsUploading(false);
      return;
    }

    let metadataIpfsUri = "";
    let valuationWei: bigint;

    try {
      // --- 1. Parse Valuation ---
      try {
        // Ensure the value is a valid number string
        const cleanValue = formData.propertyValue.trim();
        if (!cleanValue || isNaN(Number(cleanValue))) {
          throw new Error("Invalid property value format");
        }
        valuationWei = parseEther(cleanValue);
        if (valuationWei <= 0n) throw new Error("Value must be positive");
      } catch (parseErr) {
        throw new Error("Invalid Property Value format. Please enter a valid number.");
      }

      // --- 2. Upload Image ---
      console.log("Uploading image to IPFS via Pinata...");
      const imageFormData = new FormData();
      imageFormData.append("file", formData.propertyImage);
      imageFormData.append("pinataMetadata", JSON.stringify({ name: `PropertyImage_${formData.cadastralNumber || Date.now()}` }));

      const imgRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: { Authorization: `Bearer ${pinataJwt}` },
        body: imageFormData,
      });
      if (!imgRes.ok) throw new Error(`Image upload failed: ${imgRes.statusText} - ${await imgRes.text()}`);
      const imgData = await imgRes.json();
      const imageIpfsUri = `ipfs://${imgData.IpfsHash}`;
      console.log("Image uploaded:", imageIpfsUri);

      // --- 3. Construct and Upload Metadata ---
      console.log("Uploading metadata to IPFS via Pinata...");
      const metadataJson = {
        name: formData.propertyName,
        description: formData.propertyDescription || "No description provided",
        image: imageIpfsUri,
        attributes: [
          { trait_type: "Cadastral Number", value: formData.cadastralNumber },
          { trait_type: "Location", value: formData.propertyAddress },
          { trait_type: "Valuation", value: formData.propertyValue + " ETH" }
        ],
      };

      const metadataFile = new File([JSON.stringify(metadataJson)], "metadata.json", { type: "application/json" });
      const metadataFormData = new FormData();
      metadataFormData.append("file", metadataFile);
      metadataFormData.append("pinataMetadata", JSON.stringify({ name: `PropertyMetadata_${formData.cadastralNumber || Date.now()}.json` }));

      const metaRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: { Authorization: `Bearer ${pinataJwt}` },
        body: metadataFormData,
      });
      if (!metaRes.ok) throw new Error(`Metadata upload failed: ${metaRes.statusText} - ${await metaRes.text()}`);
      const metaData = await metaRes.json();
      metadataIpfsUri = `ipfs://${metaData.IpfsHash}`;
      console.log("Metadata uploaded:", metadataIpfsUri);

      setIsUploading(false); // Finished IPFS uploads

      // --- 4. Call Mint Function from Hook ---
      console.log("Sending mint transaction...");
      const mintedId = await mintProperty(
        address as `0x${string}`,
        formData.cadastralNumber,
        formData.propertyAddress,
        valuationWei,
        metadataIpfsUri,
        {
          onSuccess: (hash) => {
            console.log("Mint transaction submitted:", hash);
          },
          onError: (error) => {
            console.error("Mint transaction failed:", error);
            setUploadError(error.message);
          }
        }
      );

      // --- 5. Handle Mint Result ---
      if (mintedId !== null) {
        setMintedTokenId(mintedId);
        setStep(3); // Move to success step
        onSuccess?.();
      } else {
        throw new Error("Minting failed. Please check your wallet and try again.");
      }
    } catch (error: any) {
      console.error("Error during upload or mint:", error);
      setUploadError(`Operation Error: ${error.message}`);
      setIsUploading(false);
      setStep(2); // Stay on review step
    }
  }, [formData, address, mintProperty, onSuccess]);

  // Combined loading state for the button
  const isBusy = isUploading || isMintLoading;

  // Render connection prompt if wallet not connected
  if (!isConnected || !address) {
    return (
      <div className="mint-container">
        <div className="mint-card">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to mint properties.</p>
          <button className="connect-button">Connect Wallet</button>
        </div>
      </div>
    );
  }

  // Main component render
  return (
    <div className="mint-container">
      <div className="page-header">
        <h1>Mint Property</h1>
        <p>Create a new real estate token (Admin Only).</p>
      </div>

      <div className="mint-card">
        {/* Step 1: Input Form */}
        {step === 1 && (
          <form onSubmit={handleReviewSubmit} className="mint-form">
            <div className="form-row">
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
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="propertyAddress">Property Address</label>
                <input
                  type="text"
                  id="propertyAddress"
                  name="propertyAddress"
                  value={formData.propertyAddress}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. 123 Main St, City, Country"
                />
              </div>
              <div className="form-group">
                <label htmlFor="propertyValue">Property Value (ETH)</label>
                <input
                  type="text"
                  id="propertyValue"
                  name="propertyValue"
                  value={formData.propertyValue}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. 1.5"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="propertyDescription">Property Description</label>
              <textarea
                id="propertyDescription"
                name="propertyDescription"
                value={formData.propertyDescription}
                onChange={handleInputChange}
                placeholder="Describe the property..."
                rows={3}
              />
            </div>
            <div className="form-group">
              <label htmlFor="propertyImage">Property Image</label>
              <div className="upload-container">
                <div className="image-preview">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="preview-image" />
                  ) : (
                    <div className="upload-placeholder" onClick={() => document.getElementById('propertyImage')?.click()}>
                      <Upload size={32} />
                      <p>Click to upload image</p>
                    </div>
                  )}
                </div>
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
            {formError && <p className="error-message">{formError}</p>}
            <div className="form-actions">
              <button type="submit" className="submit-button">Continue to Review</button>
            </div>
          </form>
        )}

        {/* Step 2: Review and Confirm */}
        {step === 2 && (
          <div className="review-section">
            <h3>Review Property Details</h3>
            <div className="review-content">
              <div className="review-image">
                {previewUrl ? (
                  <img src={previewUrl} alt="Property" className="preview-image" />
                ) : (
                  <div className="no-image"><Building size={48} /></div>
                )}
              </div>
              <div className="review-details">
                <div className="review-row">
                  <strong>Name:</strong>
                  <span>{formData.propertyName}</span>
                </div>
                <div className="review-row">
                  <strong>Cadastral:</strong>
                  <span>{formData.cadastralNumber}</span>
                </div>
                <div className="review-row">
                  <strong>Location:</strong>
                  <span>{formData.propertyAddress}</span>
                </div>
                <div className="review-row">
                  <strong>Value:</strong>
                  <span>{formData.propertyValue} ETH</span>
                </div>
                <div className="review-row">
                  <strong>Owner:</strong>
                  <span>{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                </div>
              </div>
            </div>

            {uploadError && <p className="error-message">{uploadError}</p>}
            {formError && <p className="error-message">{formError}</p>}
            {hookError && <p className="error-message">Blockchain Error: {hookError instanceof Error ? hookError.message : hookError}</p>}

            <div className="form-actions">
              <ActionButton variant="outline" onClick={() => setStep(1)} disabled={isBusy}>
                Back to Edit
              </ActionButton>
              <ActionButton onClick={handleConfirmAndMint} disabled={isBusy}>
                {isUploading ? (
                  <><Loader2 className="animate-spin mr-2" size={16} />Uploading...</>
                ) : isMintLoading && !isConfirming ? (
                  <><Loader2 className="animate-spin mr-2" size={16} />Check Wallet...</>
                ) : isConfirming ? (
                  <><Loader2 className="animate-spin mr-2" size={16} />Processing Tx...</>
                ) : (
                  "Confirm & Mint"
                )}
              </ActionButton>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && isConfirmed && receipt && (
          <div className="success-section">
            <div className="success-icon">
              <Check size={48} />
            </div>
            <h3>Property Successfully Minted!</h3>
            <p>Your property token is now live on the blockchain.</p>
            <div className="success-details">
              <p><strong>Property Name:</strong> {formData.propertyName}</p>
              <p><strong>Token ID:</strong> {mintedTokenId?.toString() ?? "N/A"}</p>
              <p>
                <strong>Transaction:</strong>
                {txHash && blockExplorerUrl ? (
                  <a
                    href={`${blockExplorerUrl}/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tx-link"
                  >
                    {txHash.slice(0, 10)}...{txHash.slice(-8)}
                  </a>
                ) : txHash ? (
                  <span>{txHash.slice(0, 10)}...{txHash.slice(-8)}</span>
                ) : (
                  "Confirmed"
                )}
              </p>
            </div>
            <div className="form-actions">
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
                  });
                  if (previewUrl) URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(null);
                  setStep(1);
                  setMintedTokenId(null);
                }}
              >
                Mint Another Property
              </ActionButton>
            </div>
          </div>
        )}
      </div>
      {address && (
        <p className="admin-note">
          (Ensure connected wallet has Admin role for minting)
        </p>
      )}
    </div>
  );
};