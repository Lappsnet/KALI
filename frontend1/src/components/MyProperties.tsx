import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useAppKitAccount } from "@reown/appkit/react";
import RealEstateERC721ABI from "../abis/RealEstateERC721.sol/RealEstateERC721.abi.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 

type Property = {
  tokenId: number;
  cadastralNumber: string;
  location: string;
  valuation: string;
  metadataURI: string;
};

export default function MyProperties() {
  const { address, isConnected } = useAppKitAccount();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected) {
      fetchMyProperties();
    }
  }, [isConnected]);

  const fetchMyProperties = async () => {
    try {
      setLoading(true);
      if (!window.ethereum) {
        throw new Error("Ethereum provider is not available");
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum as ethers.providers.ExternalProvider);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, RealEstateERC721ABI, provider);

      const tokenIds: ethers.BigNumber[] = await contract.getAllTokenIds();
      const ownedProperties: Property[] = [];

      for (const tokenId of tokenIds) {
        const owner = await contract.ownerOf(tokenId);
        if (address && owner.toLowerCase() === address.toLowerCase()) {
          const details = await contract.getPropertyDetails(tokenId);
          ownedProperties.push({
            tokenId: tokenId.toNumber(),
            cadastralNumber: details.cadastralNumber,
            location: details.location,
            valuation: ethers.utils.formatEther(details.valuation),
            metadataURI: details.metadataURI,
          });
        }
      }

      setProperties(ownedProperties);
    } catch (err) {
      console.error("Error fetching properties:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>My Properties</h2>
      {loading ? (
        <p>Loading properties...</p>
      ) : properties.length === 0 ? (
        <p>You don't own any properties yet.</p>
      ) : (
        <ul>
          {properties.map((prop) => (
            <li key={prop.tokenId}>
              <p>Token ID: {prop.tokenId}</p>
              <p>Cadastral Number: {prop.cadastralNumber}</p>
              <p>Location: {prop.location}</p>
              <p>Valuation: {prop.valuation} ETH</p>
              <p>
                Metadata:{" "}
                <a href={prop.metadataURI} target="_blank" rel="noopener noreferrer">
                  View
                </a>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
