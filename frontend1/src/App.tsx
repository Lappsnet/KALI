import { createAppKit } from "@reown/appkit/react";
import { Ethers5Adapter } from "@reown/appkit-adapter-ethers5";
import { mainnet, arbitrum } from "@reown/appkit/networks";
import ContractInteractions from "./components/ContractInteractions";
import { getContract, signer } from "./utils/contract"; // ✅ Updated import

// 1. WalletConnect project ID
const projectId = "3d25dd97f1859e3ffbb33fd64da3f03f";

// 2. Metadata for your DApp
const metadata = {
  name: "XFY Real Estate DApp",
  description: "Mint and manage real estate NFTs",
  url: "https://mywebsite.com",
  icons: ["https://avatars.mywebsite.com/"],
};

// 3. Initialize AppKit once (global side effect)
createAppKit({
  adapters: [new Ethers5Adapter()],
  metadata,
  networks: [mainnet, arbitrum],
  projectId,
  features: {
    analytics: true,
  },
});

// 4. Connect button component
export function ConnectButton() {
  return <appkit-button />;
}

// 5. Final App
export default function App() {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-8 space-y-8 font-sans">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">🏠 XFY Real Estate</h1>
        <ConnectButton />
      </div>

      {/* ✅ Passing contract helpers to your main UI component */}
      <ContractInteractions getContract={getContract} signer={signer} />
    </div>
  );
}
