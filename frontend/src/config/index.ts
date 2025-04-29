import { http } from 'viem';
import { defineChain } from '@reown/appkit/networks';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

// Define the Pharos network
export const pharos = defineChain({
  id: 50002,
  caipNetworkId: 'eip155:50002',
  chainNamespace: 'eip155',
  name: 'Pharos Network',
  nativeCurrency: { decimals: 18, name: 'Pharos', symbol: 'ETH' }, // Verify symbol if not ETH
  rpcUrls: { default: { http: ['https://devnet.dplabs-internal.com'] } },
  blockExplorers: { default: { name: 'PharosScan', url: 'https://pharosscan.xyz/' } },
  testnet: true,
  // Optional: Keep contracts tied to chain def if useful elsewhere, otherwise remove
  contracts: {
    realEstateERC721: { address: "0xd95d1ff6618aee41e431c6a2cfa3d5e8ff3d5f33" },
    realEstateSale: { address: "0x43B69480Cf9308F10781fB3eEab20770c14ee73D" },
    lendingProtocol: { address: "0x6B2C23cf212011beBF015FDF05E0E5414754701c" },
    fractionalOwnership: { address: "0xB9b3A7AE4c7bd499Dd5CB626362E6d866e129771" },
    marketplaceOrchestrator: { address: "0xD2DD7e9d3aDF3D1AdFed1eA5A2771ECf507885e5" }, // Verify duplication
    rentableToken: { address: "0x407b230D1439A83Ed81577009e2118e7a4d50694" },
    rentalAgreement: { address: "0x60B5cC9C3A6bb42A293Cd445d67DE23CcdA442c3" },
  },
});

export const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("VITE_WALLET_CONNECT_PROJECT_ID must be set in your .env file");
}

// Metadata for WalletConnect modal
export const metadata = {
  name: 'KALI Real Estate',
  description: 'Decentralized Real Estate Platform',
  url: 'https://kali.com', // Replace with your actual URL
  icons: ['https://kali.com/icon.png'], // Replace with your actual icon URL
};

// Define the list of chains for Wagmi/Appkit - Now only includes pharos
export const chains = [pharos];

// Configure the WagmiAdapter
export const wagmiAdapter = new WagmiAdapter({
  networks: chains, // Use the updated chains array
  projectId,
  transports: {
    // Only include transport for pharos
    [pharos.id]: http(pharos.rpcUrls.default.http[0]),
  }
});

// Define Contract Addresses - Now only for pharos
export const CONTRACT_ADDRESSES = {
  [pharos.id]: {
    realEstateERC721: "0xd95d1ff6618aee41e431c6a2cfa3d5e8ff3d5f33" as `0x${string}`,
    realEstateSale: "0x43B69480Cf9308F10781fB3eEab20770c14ee73D" as `0x${string}`,
    lendingProtocol: "0x6B2C23cf212011beBF015FDF05E0E5414754701c" as `0x${string}`,
    fractionalOwnership: "0xB9b3A7AE4c7bd499Dd5CB626362E6d866e129771" as `0x${string}`,
    marketplaceOrchestrator: "0x43B69480Cf9308F10781fB3eEab20770c14ee73D" as `0x${string}`,
    rentableToken: "0x407b230D1439A83Ed81577009e2118e7a4d50694" as `0x${string}`,
    rentalAgreement: "0x60B5cC9C3A6bb42A293Cd445d67DE23CcdA442c3" as `0x${string}`,
    platformFeePercentage: 250, // Keep relevant params
  },
  // Removed mainnet and sepolia entries
};

// IPFS Gateway remains useful
export const IPFS_GATEWAY = "https://ipfs.io/ipfs/"; // Or your preferred gateway

// Default templates remain useful
export const DEFAULT_METADATA_TEMPLATE = {
  name: "",
  description: "",
  image: "",
  attributes: [
    { trait_type: "Property Type", value: "Residential" },
    { trait_type: "Bedrooms", value: 0 },
    { trait_type: "Bathrooms", value: 0 },
    { trait_type: "Square Feet", value: 0 },
    { trait_type: "Year Built", value: 2024 },
  ],
};

export const DEFAULT_SALE_DOCUMENT = {
  title: "Property Sale Agreement",
  description: "Legal agreement for the sale of tokenized real estate property",
  terms: [
    "Seller agrees to transfer ownership upon sale completion.",
    "Buyer agrees to pay the full purchase price.",
    "Sale subject to notary approval.",
    "Platform fee deducted from sale price.",
  ],
  legalDisclaimer: "Consult a legal professional before proceeding.",
};

export const LENDING_PROTOCOL_PARAMS = {
  loanTerms: [
    { label: "30 days", value: 30 }, { label: "90 days", value: 90 }, { label: "180 days", value: 180 }, { label: "365 days", value: 365 },
  ],
  interestRates: [
    { label: "5%", value: 500 }, { label: "7.5%", value: 750 }, { label: "10%", value: 1000 }, { label: "12.5%", value: 1250 },
  ],
  loanToValueRatios: [
    { label: "50%", value: 5000 }, { label: "60%", value: 6000 }, { label: "70%", value: 7000 }, { label: "75%", value: 7500 },
  ],
  originationFee: 200,
  defaultAuctionDuration: 7,
};