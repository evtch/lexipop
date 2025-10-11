/**
 * 🎯 FARCASTER MINIAPP WAGMI CONFIGURATION
 *
 * Special wagmi configuration for Farcaster miniapps with automatic FID detection
 * Uses the Farcaster wagmi connector to automatically connect wallets
 */

import { createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { farcasterFrame } from '@farcaster/miniapp-wagmi-connector';

// Get environment variables with fallbacks
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '7e3c82dfe33435c5ae224a90a29e25db';

export const miniappWagmiConfig = createConfig({
  chains: [
    base,
    ...(process.env.NODE_ENV === 'development' ? [baseSepolia] : [])
  ],
  connectors: [
    farcasterFrame(),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  ssr: true,
});

// Default chain based on environment
export const defaultChain = process.env.NODE_ENV === 'production' ? base : baseSepolia;

export default miniappWagmiConfig;