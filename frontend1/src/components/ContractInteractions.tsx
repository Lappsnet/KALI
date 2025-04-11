import { useState } from 'react';
import { ethers, Contract, Signer } from 'ethers';

type Props = {
  getContract: (name: string) => Contract;
  signer: Signer;
};

export default function ContractInteractions({ getContract, signer }: Props) {
  const [form, setForm] = useState({
    cadastralNumber: '',
    location: '',
    valuation: '',
    metadataURI: '',
  });

  const [minting, setMinting] = useState(false);
  const [tokenId, setTokenId] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMint = async () => {
    try {
      setMinting(true);
      const userAddress = await signer.getAddress();
      const contract = getContract('RealEstateERC721');

      const tx = await contract.mintProperty(
        userAddress,
        form.cadastralNumber,
        form.location,
        ethers.utils.parseEther(form.valuation),
        form.metadataURI
      );

      setTxHash(tx.hash);
      const receipt = await tx.wait();

      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'PropertyMinted';
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = contract.interface.parseLog(event);
        setTokenId(parsed.args.tokenId.toString());
      } else {
        setTokenId('✅ Minted! (Check your wallet or contract)');
      }
    } catch (err: any) {
      console.error('Mint error:', err);
      alert('❌ ' + err.message);
    } finally {
      setMinting(false);
    }
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg max-w-xl w-full mx-auto space-y-4 shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold flex items-center gap-2">🏛️ Mint Property</h2>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Cadastral Number</label>
        <input
          name="cadastralNumber"
          placeholder="E.g. 001-A-001"
          className="w-full p-2 rounded text-black"
          onChange={handleChange}
          value={form.cadastralNumber}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Location</label>
        <input
          name="location"
          placeholder="City, Country"
          className="w-full p-2 rounded text-black"
          onChange={handleChange}
          value={form.location}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Valuation (in ETH)</label>
        <input
          name="valuation"
          placeholder="E.g. 1.5"
          type="number"
          className="w-full p-2 rounded text-black"
          onChange={handleChange}
          value={form.valuation}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Metadata URI</label>
        <input
          name="metadataURI"
          placeholder="https://example.com/metadata/001-A-001"
          className="w-full p-2 rounded text-black"
          onChange={handleChange}
          value={form.metadataURI}
        />
      </div>

      <button
        onClick={handleMint}
        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold transition disabled:opacity-50"
        disabled={minting}
      >
        {minting ? "Minting..." : "🧱 Mint Property"}
      </button>

      {txHash && (
        <p className="text-green-400 text-sm break-all">
          ✅ Minted! Tx: <span className="underline">{txHash}</span>
        </p>
      )}
    </div>
  );
}
