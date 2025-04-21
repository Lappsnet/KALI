import { http } from 'viem'
import { pharos } from '../contracts/config'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

// Your project ID from WalletConnect Cloud
export const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID

// Metadata for your app
export const metadata = {
  name: 'KALI Real Estate',
  description: 'Decentralized Real Estate Platform',
  url: 'https://kali.com',
  icons: ['https://kali.com/icon.png'],
}

// Network configuration
export const networks = [pharos]

// Create wagmi adapter
export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  transports: {
    [pharos.id]: http(pharos.rpcUrls.default.http[0])
  }
}) 