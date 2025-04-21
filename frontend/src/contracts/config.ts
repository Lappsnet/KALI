// Contract addresses for different networks
import { defineChain } from '@reown/appkit/networks';
import { type Chain } from 'wagmi/chains';

export const pharos = {
  id: 50002,
  name: 'Pharos Network',
  nativeCurrency: {
    decimals: 18,
    name: 'Pharos',
    symbol: 'PTT',
  },
  rpcUrls: {
    default: {
      http: [],
      webSocket: [],
    },
    public: {
      http: [],
      webSocket: [],
    }
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://pharosscan.xyz/' },
  },
  testnet: true,
  contracts: {
    realEstateERC721: { address: "0xd95d1ff6618aee41e431c6a2cfa3d5e8ff3d5f33" },
    realEstateSale: { address: "0x43B69480Cf9308F10781fB3eEab20770c14ee73D" },
    lendingProtocol: { address: "0x6B2C23cf212011beBF015FDF05E0E5414754701c" },
    fractionalOwnership: { address: "0xB9b3A7AE4c7bd499Dd5CB626362E6d866e129771" },
    marketplaceOrchestrator: { address: "0x43B69480Cf9308F10781fB3eEab20770c14ee73D" },
    rentableToken: { address: "0x407b230D1439A83Ed81577009e2118e7a4d50694" },
    rentalAgreement: { address: "0x60B5cC9C3A6bb42A293Cd445d67DE23CcdA442c3" },
  },
} as const satisfies Chain;

export const CONTRACT_ADDRESSES = { // DP Labs Devnet
      50002: {
          realEstateERC721: "0xd95d1ff6618aee41e431c6a2cfa3d5e8ff3d5f33" as `0x${string}`,
          realEstateSale: "0x43B69480Cf9308F10781fB3eEab20770c14ee73D" as `0x${string}`,
          lendingProtocol: "0x6B2C23cf212011beBF015FDF05E0E5414754701c" as `0x${string}`,
          fractionalOwnership: "0xB9b3A7AE4c7bd499Dd5CB626362E6d866e129771" as `0x${string}`,
          marketplaceOrchestrator: "0x43B69480Cf9308F10781fB3eEab20770c14ee73D" as `0x${string}`,
          rentableToken: "0x407b230D1439A83Ed81577009e2118e7a4d50694" as `0x${string}`,
          rentalAgreement: "0x60B5cC9C3A6bb42A293Cd445d67DE23CcdA442c3" as `0x${string}`,
        platformFeePercentage: 250,
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
  