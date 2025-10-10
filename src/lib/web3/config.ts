/**
 * 🌐 WEB3 CONFIGURATION
 *
 * Wagmi and RainbowKit configuration for wallet connections
 * Supports multiple chains and wallet providers
 */

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, base, baseSepolia, sepolia } from 'wagmi/chains';

// Get environment variables with fallbacks
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id';
const appName = 'Lexipop';
const appDescription = 'Learn vocabulary the fun way!';

export const wagmiConfig = getDefaultConfig({
  appName,
  projectId,
  chains: [
    // Production chains
    mainnet,
    base,

    // Test chains (only in development)
    ...(process.env.NODE_ENV === 'development' ? [baseSepolia, sepolia] : [])
  ],
  ssr: true, // Enable SSR support for Next.js
});

// Chain configurations for different environments
export const supportedChains = {
  production: [mainnet, base],
  development: [mainnet, base, baseSepolia, sepolia]
};

// Default chain based on environment
export const defaultChain = process.env.NODE_ENV === 'production' ? base : baseSepolia;

// Token contract addresses (placeholder - replace with actual deployed addresses)
export const tokenContracts = {
  [mainnet.id]: {
    lexipopToken: '0x0000000000000000000000000000000000000000', // Replace with actual address
  },
  [base.id]: {
    lexipopToken: '0x0000000000000000000000000000000000000000', // Replace with actual address
  },
  [baseSepolia.id]: {
    lexipopToken: '0x0000000000000000000000000000000000000000', // Replace with actual address
  },
  [sepolia.id]: {
    lexipopToken: '0x0000000000000000000000000000000000000000', // Replace with actual address
  }
} as const;

// Gas configuration
export const gasConfig = {
  // Standard gas limits for different operations
  tokenClaim: 100000n,
  tokenTransfer: 21000n,

  // Gas price multipliers
  standardMultiplier: 1.1,
  fastMultiplier: 1.5,
} as const;

// Wallet connection settings
export const walletConfig = {
  // Auto-connect settings
  autoConnect: true,

  // Connection timeout
  connectTimeout: 10000, // 10 seconds

  // Supported wallet types
  supportedWallets: [
    'metamask',
    'walletconnect',
    'coinbase',
    'rainbow'
  ]
} as const;

export default wagmiConfig;