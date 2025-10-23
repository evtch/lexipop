/**
 * 🌐 WEB3 CONFIGURATION
 *
 * Wagmi and RainbowKit configuration for wallet connections
 * Supports multiple chains and wallet providers
 */

import { createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { farcasterFrame } from '@farcaster/miniapp-wagmi-connector';
import { walletConnect, injected, coinbaseWallet } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [
    // Base only - where all contracts are deployed
    base,

    // Test chains (only in development)
    ...(process.env.NODE_ENV === 'development' ? [baseSepolia] : [])
  ],
  connectors: [
    farcasterFrame(), // Primary - Farcaster miniapp connector
    injected(), // Desktop browser wallets (MetaMask, etc.)
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'a5555da8f7e7a9c0c9b3b2e2c7e2c2c2',
      metadata: {
        name: 'Lexipop',
        description: 'Vocabulary Learning Game with NFTs',
        url: 'https://lexipop.xyz',
        icons: ['https://lexipop.xyz/favicon.ico']
      }
    }),
    coinbaseWallet({
      appName: 'Lexipop',
      appLogoUrl: 'https://lexipop.xyz/favicon.ico'
    })
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  ssr: true,
});

// Chain configurations for different environments
export const supportedChains = {
  production: [base],
  development: [base, baseSepolia]
};

// Default chain - always Base where contracts are deployed
export const defaultChain = base;

// Real contract addresses - Base only
export const tokenContracts = {
  [base.id]: {
    lexipopToken: '0xf732f31f73e7DC21299f3ab42BD22E8a7C6b4B07', // LEXIPOP token on Base
    moneyTree: '0xE636BaaF2c390A591EdbffaF748898EB3f6FF9A1', // MoneyTree distributor
  },
  [baseSepolia.id]: {
    lexipopToken: '0xf732f31f73e7DC21299f3ab42BD22E8a7C6b4B07', // LEXIPOP token on Base Sepolia
    moneyTree: '0xE636BaaF2c390A591EdbffaF748898EB3f6FF9A1', // MoneyTree distributor
  }
} as const;

// Gas configuration
export const gasConfig = {
  // Standard gas limits for different operations
  tokenClaim: BigInt(100000),
  tokenTransfer: BigInt(21000),

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

  // Supported wallet types - simplified to Farcaster only
  supportedWallets: [
    'farcaster'
  ]
} as const;

export default wagmiConfig;