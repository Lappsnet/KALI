// config.js
const networks = {
    local: {
      rpcUrl: 'http://localhost:8545',
      chainId: 31337,
      contracts: {
        RealEstateERC721: '0x...',
        RentableToken: '0x...',
        // ... other contract addresses
      }
    },
    sepolia: {
      rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
      chainId: 11155111,
      contracts: {
        // Sepolia contract addresses
      }
    },
    mainnet: {
      rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
      chainId: 1,
      contracts: {
        // Mainnet contract addresses
      }
    }
  };
  
  export default networks;