// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
    // Ethereum Mainnet
    1: {
      realEstateERC721: "0x5FbDB2315678afecb367f032d93F642f64180aa3" as `0x${string}`, // Replace with actual address
    address: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
      lendingProtocol: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9" as `0x${string}`, // Replace with actual address
    },
    // Sepolia Testnet
    11155111: {
      realEstateERC721: "0x5FbDB2315678afecb367f032d93F642f64180aa3" as `0x${string}`, // Replace with actual address
      realEstateSale: "0x5FbDB2315678afecb367f032d93F642f64180aa3" as `0x${string}`, // Replace with actual address
      lendingProtocol: "0x5FbDB2315678afecb367f032d93F642f64180aa3" as `0x${string}`, // Replace with actual address
    },
     // Anvil
    31337: {
        realEstateERC721: "0x5FbDB2315678afecb367f032d93F642f64180aa3" as `0x${string}`, // Replace with actual address
        realEstateSale: "0x5FbDB2315678afecb367f032d93F642f64180aa3" as `0x${string}`, // Replace with actual address
        lendingProtocol: "0x5FbDB2315678afecb367f032d93F642f64180aa3" as `0x${string}`, // Replace with actual address
      },

      // DP Labs Devnet
      50002: {
        realEstateERC721: "0xd95d1ff6618aee41e431c6a2cfa3d5e8ff3d5f33" as `0x${string}`, // Replace with actual address
        realEstateSale: "0x5FbDB2315678afecb367f032d93F642f64180aa3" as `0x${string}`, // Replace with actual address
        lendingProtocol: "0x6B2C23cf212011beBF015FDF05E0E5414754701c" as `0x${string}`, // Replace with actual address
      },


  }
  
  // IPFS Gateway for metadata
  export const IPFS_GATEWAY = "https://ipfs.io/ipfs/"
  
  // Default metadata template for new properties
  export const DEFAULT_METADATA_TEMPLATE = {
    name: "",
    description: "",
    image: "",
    attributes: [
      {
        trait_type: "Property Type",
        value: "Residential",
      },
      {
        trait_type: "Bedrooms",
        value: 0,
      },
      {
        trait_type: "Bathrooms",
        value: 0,
      },
      {
        trait_type: "Square Feet",
        value: 0,
      },
      {
        trait_type: "Year Built",
        value: 2023,
      },
    ],
  }
  
  // Default sale document template
  export const DEFAULT_SALE_DOCUMENT = {
    title: "Property Sale Agreement",
    description: "Legal agreement for the sale of tokenized real estate property",
    terms: [
      "The seller agrees to transfer ownership of the property to the buyer upon completion of the sale.",
      "The buyer agrees to pay the full purchase price as specified in the sale.",
      "The sale is subject to approval by an authorized notary.",
      "The platform fee will be deducted from the sale price and paid to the fee collector.",
    ],
    legalDisclaimer: "This is a legally binding agreement. Please consult with a legal professional before proceeding.",
  }
  
  // Lending protocol parameters
  export const LENDING_PROTOCOL_PARAMS = {
    // Default loan terms in days
    loanTerms: [
      { label: "30 days", value: 30 },
      { label: "90 days", value: 90 },
      { label: "180 days", value: 180 },
      { label: "365 days", value: 365 },
    ],
    // Default interest rates (in basis points, 100 = 1%)
    interestRates: [
      { label: "5%", value: 500 },
      { label: "7.5%", value: 750 },
      { label: "10%", value: 1000 },
      { label: "12.5%", value: 1250 },
    ],
    // Default loan-to-value ratios
    loanToValueRatios: [
      { label: "50%", value: 5000 },
      { label: "60%", value: 6000 },
      { label: "70%", value: 7000 },
      { label: "75%", value: 7500 },
    ],
    // Default origination fee (in basis points, 100 = 1%)
    originationFee: 200,
    // Default auction duration in days
    defaultAuctionDuration: 7,
  }
  