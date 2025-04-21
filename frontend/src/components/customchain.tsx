import { defineChain } from '@reown/appkit/networks';

// Define the custom network
const customNetwork = defineChain({
  id: 50002,
  caipNetworkId: 'eip155:50002',
  chainNamespace: 'eip155',
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
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://pharosscan.xyz/' },
  },
  contracts: {
    realEstateERC721: { address: "0xd95d1ff6618aee41e431c6a2cfa3d5e8ff3d5f33" },
    realEstateSale: { address: "0x43B69480Cf9308F10781fB3eEab20770c14ee73D" },
    lendingProtocol: { address: "0x6B2C23cf212011beBF015FDF05E0E5414754701c" },
    fractionalOwnership: { address: "0xB9b3A7AE4c7bd499Dd5CB626362E6d866e129771" },
    marketplaceOrchestrator: { address: "0x43B69480Cf9308F10781fB3eEab20770c14ee73D" },
    rentableToken: { address: "0x407b230D1439A83Ed81577009e2118e7a4d50694" },
    rentalAgreement: { address: "0x60B5cC9C3A6bb42A293Cd445d67DE23CcdA442c3" },
  }
})
