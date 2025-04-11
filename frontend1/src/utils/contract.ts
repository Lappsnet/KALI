// utils/contract.js

import { ethers } from "ethers";

// Import ABIs
import RealEstateERC721ABI from '../abis/RealEstateERC721.sol/RealEstateERC721.abi.json';
import RentableTokenABI from '../abis/RentableToken.sol/RentableToken.abi.json';
import FractionalOwnershipABI from '../abis/FractionalOwnership.sol/FractionalOwnership.abi.json';
import RealEstateSaleABI from '../abis/RealEstateSale.sol/RealEstateSale.abi.json';
import LendingProtocolABI from '../abis/LendingProtocol.sol/LendingProtocol.abi.json';
import RentalAgreementABI from '../abis/RentalAgreement.sol/RentalAgreement.abi.json';
import MarketplaceOrchestratorABI from '../abis/MarketplaceOrchestrator.sol/MarketplaceOrchestrator.abi.json';

// Anvil settings
const ANVIL_RPC_URL = "http://127.0.0.1:8545";
const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const provider = new ethers.providers.JsonRpcProvider(ANVIL_RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

// Contract metadata
export const CONTRACTS = {
  RealEstateERC721: {
    address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    abi: RealEstateERC721ABI,
  },
  RentableToken: {
    address: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    abi: RentableTokenABI,
  },
  FractionalOwnership: {
    address: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    abi: FractionalOwnershipABI,
  },
  RealEstateSale: {
    address: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    abi: RealEstateSaleABI,
  },
  LendingProtocol: {
    address: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
    abi: LendingProtocolABI,
  },
  RentalAgreement: {
    address: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
    abi: RentalAgreementABI,
  },
  MarketplaceOrchestrator: {
    address: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
    abi: MarketplaceOrchestratorABI,
  },
};

// 🔁 Helper: Get a contract instance by name
export function getContract(name: keyof typeof CONTRACTS): ethers.Contract {
  const contractData = CONTRACTS[name];
  if (!contractData) {
    throw new Error(`Contract ${name} is not defined in CONTRACTS`);
  }

  return new ethers.Contract(contractData.address, contractData.abi, signer);
}

// 🧪 Export signer & provider if needed
export { signer, provider };
