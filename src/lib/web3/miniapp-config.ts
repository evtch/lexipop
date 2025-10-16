/**
 * 🎯 FARCASTER MINIAPP WAGMI CONFIGURATION
 *
 * Special wagmi configuration for Farcaster miniapps with automatic FID detection
 * Uses the Farcaster wagmi connector to automatically connect wallets
 */

import { createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { farcasterFrame } from '@farcaster/miniapp-wagmi-connector';
import { walletConnect, metaMask, coinbaseWallet } from 'wagmi/connectors';

// Get environment variables with fallbacks
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '7e3c82dfe33435c5ae224a90a29e25db';

export const miniappWagmiConfig = createConfig({
  chains: [
    base,
    ...(process.env.NODE_ENV === 'development' ? [baseSepolia] : [])
  ],
  connectors: [
    farcasterFrame(),
    walletConnect({ projectId }),
    metaMask(),
    coinbaseWallet({ appName: 'Lexipop' }),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  ssr: true,
});

// Use Base mainnet as default since that's where our contracts are deployed
export const defaultChain = base;

export default miniappWagmiConfig;