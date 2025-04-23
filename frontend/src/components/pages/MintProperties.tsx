
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { ActionButton } from "../ActionButton";
import { Building, Upload, Check, Loader2 } from "lucide-react";
import { useRealEstateContract } from "../hooks/useRealEstateContract";
import { useConfig } from "wagmi";

interface MintPropertiesProps {
  sendHash?: (hash: `0x${string}`) => void;
}

export const MintProperties = ({ sendHash }: MintPropertiesProps) => {
  const { isConnected, address } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const wagmiConfig = useConfig();
  const {
    mintProperty,
    isConfirming, // Using granular loading state from updated hook
    isProcessing, // Using granular loading state from updated hook
    error: mintError,
  } = useRealEstateContract();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    propertyName: "",
    propertyAddress: "",
    propertyValue: "",
    cadastralNumber: "",
    propertyDescription: "",
    propertyImage: null as File | null,
  });
  const [previewUrl, setPreviewUrl] = useState("");
  const [step, setStep] = useState(1);
  const [mintedTokenId, setMintedTokenId] = useState<bigint | null>(null);
  const [finalTxHash, setFinalTxHash] = useState<`0x${string}` | null>(null);

  const blockExplorerUrl = wagmiConfig.chains.find(chain => chain.id === chainId)?.blockExplorers?.default?.url;

  useEffect(() => {
    if (finalTxHash && sendHash) {
      sendHash(finalTxHash);
    }
  }, [finalTxHash, sendHash]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormError(null);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormError(null);
    const file = e.target.files?.[0];
    if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl("");
    }
    if (file) {
      setFormData({ ...formData, propertyImage: file });
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, propertyImage: null });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setFormError(null);
    if (!formData.propertyName || !formData.propertyAddress || !formData.propertyValue || !formData.cadastralNumber || !formData.propertyImage) {
      setFormError("Please fill in all required fields and upload an image.");
      return;
    }
    if (isNaN(parseFloat(formData.propertyValue)) || parseFloat(formData.propertyValue) <= 0) {
        setFormError("Please enter a valid positive number for Property Value.");
        return;
      }
    setStep(2);
  };

  const handleConfirm = async () => {
    if (!formData.propertyImage) {
      setUploadError("Error: Property image is missing.");
      return;
    }
    setUploadError(null);
    setFormError(null);
    setIsUploading(true);

    const pinataJwt = import.meta.env.VITE_PINATA_JWT;
    if (!pinataJwt) {
      console.error("VITE_PINATA_JWT not found.");
      setUploadError("Configuration error: Cannot upload files.");
      setIsUploading(false);
      return;
    }

    try {
      const imageFormData = new FormData();
      imageFormData.append("file", formData.propertyImage);
      imageFormData.append("pinataMetadata", JSON.stringify({ name: `PropertyImage_${formData.cadastralNumber || Date.now()}` }));

      const imgRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST", headers: { Authorization: `Bearer ${pinataJwt}` }, body: imageFormData,
      });
      if (!imgRes.ok) throw new Error(`Image upload failed: ${imgRes.statusText} - ${await imgRes.text()}`);
      const imgData = await imgRes.json();
      const imageIpfsUri = `ipfs://${imgData.IpfsHash}`;

      const metadataJson = {
        name: formData.propertyName,
        description: formData.propertyDescription,
        image: imageIpfsUri,
        attributes: [
          { trait_type: "Property Type", value: "Residential" },
          { trait_type: "Cadastral Number", value: formData.cadastralNumber },
          { trait_type: "Location", value: formData.propertyAddress },
        ],
      };

      const metadataFile = new File([JSON.stringify(metadataJson)], "metadata.json", { type: "application/json" });
      const metadataFormData = new FormData();
      metadataFormData.append("file", metadataFile);
      metadataFormData.append("pinataMetadata", JSON.stringify({ name: `PropertyMetadata_${formData.cadastralNumber || Date.now()}.json` }));

      const metaRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST", headers: { Authorization: `Bearer ${pinataJwt}` }, body: metadataFormData,
      });
      if (!metaRes.ok) throw new Error(`Metadata upload failed: ${metaRes.statusText} - ${await metaRes.text()}`);
      const metaData = await metaRes.json();
      const metadataIpfsUri = `ipfs://${metaData.IpfsHash}`;

      setIsUploading(false);

      await mintProperty(
        {
          cadastralNumber: formData.cadastralNumber,
          location: formData.propertyAddress,
          valuation: formData.propertyValue,
        },
        metadataIpfsUri,
        (tokenId, finalHash) => {
          setMintedTokenId(tokenId);
          setFinalTxHash(finalHash);
          setStep(3);
        },
        (errorMsg) => {
          setFormError(`Minting failed: ${errorMsg}`);
          setStep(2);
        }
      );

    } catch (error: any) {
      console.error("Error during upload/mint prep:", error);
      setUploadError(`Upload Error: ${error.message}`);
      setIsUploading(false);
      setStep(2);
    }
  };

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const isLoading = isUploading || isConfirming || isProcessing;

  if (!isConnected) {
    return (
      <div className="page-container">
        <div className="connect-prompt">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to mint properties</p>
          <appkit-button />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Mint Properties</h1>
        <p>Create new property tokens on the blockchain</p>
      </div>

      <div className="glass-card mint-card">
        {step === 1 && (
          <form onSubmit={handleSubmit} className="mint-form" noValidate>
             <div className="form-group"><label htmlFor="propertyName">Property Name</label><input type="text" id="propertyName" name="propertyName" value={formData.propertyName} onChange={handleInputChange} required placeholder="e.g. Modern Downtown Apartment"/></div>
             <div className="form-group"><label htmlFor="cadastralNumber">Cadastral Number</label><input type="text" id="cadastralNumber" name="cadastralNumber" value={formData.cadastralNumber} onChange={handleInputChange} required placeholder="e.g. 123-456-789"/></div>
             <div className="form-group"><label htmlFor="propertyAddress">Property Address</label><input type="text" id="propertyAddress" name="propertyAddress" value={formData.propertyAddress} onChange={handleInputChange} required placeholder="e.g. 123 Main St, New York, NY"/></div>
             <div className="form-group"><label htmlFor="propertyValue">Property Value (ETH)</label><input type="number" id="propertyValue" name="propertyValue" value={formData.propertyValue} onChange={handleInputChange} required placeholder="e.g. 1.5" step="any" min="0"/></div>
             <div className="form-group"><label htmlFor="propertyDescription">Property Description</label><textarea id="propertyDescription" name="propertyDescription" value={formData.propertyDescription} onChange={handleInputChange} placeholder="Describe the property..." rows={4}/></div>
             <div className="form-group">
                <label htmlFor="propertyImage">Property Image</label>
                <div className="image-upload-container">
                    {previewUrl ? <div className="image-preview"><img src={previewUrl} alt="Preview"/></div> : <div className="upload-placeholder"><Upload size={32}/><p>Click or drag</p></div>}
                    <input type="file" id="propertyImage" name="propertyImage" onChange={handleImageChange} accept="image/*" required className="file-input"/>
                </div>
             </div>
             {formError && <p className="error-message form-error">{formError}</p>}
            <div className="form-actions"><ActionButton type="submit">Continue to Review</ActionButton></div>
          </form>
        )}

        {step === 2 && (
          <div className="mint-review">
            <h3>Review Property Details</h3>
             <div className="review-details">
               <div className="review-image">{previewUrl ? <img src={previewUrl} alt="Property"/> : <div className="no-image"><Building size={48}/></div>}</div>
               <div className="review-info">
                 <div className="review-item"><span className="review-label">Name:</span><span className="review-value">{formData.propertyName}</span></div>
                 <div className="review-item"><span className="review-label">Cadastral Number:</span><span className="review-value">{formData.cadastralNumber}</span></div>
                 <div className="review-item"><span className="review-label">Address:</span><span className="review-value">{formData.propertyAddress}</span></div>
                 <div className="review-item"><span className="review-label">Value:</span><span className="review-value">{formData.propertyValue} ETH</span></div>
                 <div className="review-item"><span className="review-label">Description:</span><span className="review-value">{formData.propertyDescription || "N/A"}</span></div>
                 <div className="review-item"><span className="review-label">Owner:</span><span className="review-value">{address?.slice(0, 6)}...{address?.slice(-4)}</span></div>
               </div>
             </div>
            {uploadError && <p className="error-message">{uploadError}</p>}
            {formError && <p className="error-message">{formError}</p>}
            {mintError && <p className="error-message">Blockchain Error: {mintError}</p>}

            <div className="review-actions">
              <ActionButton variant="outline" onClick={() => setStep(1)} disabled={isLoading}>Back to Edit</ActionButton>
              <ActionButton onClick={handleConfirm} disabled={isLoading}>
                 {isUploading ? <><Loader2 className="animate-spin mr-2" size={16}/>Uploading Files...</> :
                  isConfirming ? <><Loader2 className="animate-spin mr-2" size={16}/>Check Wallet...</> :
                  isProcessing ? <><Loader2 className="animate-spin mr-2" size={16}/>Processing Tx...</> :
                  "Confirm & Mint"}
              </ActionButton>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mint-success">
            <div className="success-icon"><Check size={48} /></div>
            <h3>Property Successfully Minted!</h3>
            <p>Your property token is now live on the blockchain.</p>
            <div className="success-details">
               <div className="success-item"><span className="success-label">Property Name:</span><span className="success-value">{formData.propertyName}</span></div>
               <div className="success-item"><span className="success-label">Token ID:</span><span className="success-value">{mintedTokenId?.toString() ?? "N/A"}</span></div>
               <div className="success-item">
                 <span className="success-label">Transaction:</span>
                 <span className="success-value">
                   {finalTxHash && blockExplorerUrl ? (
                     <a href={`${blockExplorerUrl}/tx/${finalTxHash}`} target="_blank" rel="noopener noreferrer" className="tx-link">
                       {finalTxHash.slice(0, 10)}...{finalTxHash.slice(-8)}
                     </a>
                   ) : finalTxHash ? (
                      <span>{finalTxHash.slice(0, 10)}...{finalTxHash.slice(-8)}</span>
                   ) : "Confirmed" }
                 </span>
               </div>
            </div>
            <div className="success-actions">
              <ActionButton onClick={() => (window.location.href = "/dashboard")}>Return to Dashboard</ActionButton>
              <ActionButton variant="outline" onClick={() => {
                  setFormData({ propertyName: "", propertyAddress: "", propertyValue: "", cadastralNumber: "", propertyDescription: "", propertyImage: null });
                  if(previewUrl) URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(""); setStep(1); setMintedTokenId(null); setFinalTxHash(null); setUploadError(null); setFormError(null);
              }}>Mint Another Property</ActionButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}