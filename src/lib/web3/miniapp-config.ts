/**
 * 🎯 FARCASTER MINIAPP WAGMI CONFIGURATION
 *
 * Special wagmi configuration for Farcaster miniapps with automatic FID detection
 * Uses the Farcaster wagmi connector to automatically connect wallets
 */

import { createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { farcasterFrame } from '@farcaster/miniapp-wagmi-connector';

export const miniappWagmiConfig = createConfig({
  chains: [
    base,
    ...(process.env.NODE_ENV === 'development' ? [baseSepolia] : [])
  ],
  connectors: [
    farcasterFrame(), // Only Farcaster connector for miniapp - no SSR issues
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