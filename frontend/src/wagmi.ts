import { http, createConfig } from 'wagmi'
import { pharos } from './contracts/config'
import { mainnet, sepolia } from 'wagmi/chains'

export const config = createConfig({
  chains: [pharos, mainnet, sepolia],
  transports: {
    [pharos.id]: http('https://rpc.pharos.network'),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
}) 