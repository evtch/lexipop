/**
 * 🌐 WEB3 CONFIGURATION
 *
 * Simplified Wagmi configuration for Farcaster wallet connections
 * Following BitWorld's approach for better Farcaster frame compatibility
 */

import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';

// Pure Farcaster native experience - only Farcaster wallet
export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    farcasterMiniApp(), // Native Farcaster wallet only
  ],
  transports: {
    [base.id]: http()
  },
  ssr: true, // Enable SSR to prevent reconnection issues
});

// Chain configurations for different environments
export const supportedChains = {
  production: [base],
  development: [base]
};

// Default chain - always Base where contracts are deployed
export const defaultChain = base;

// Real contract addresses - Base only
export const tokenContracts = {
  [base.id]: {
    lexipopToken: '0xf732f31f73e7DC21299f3ab42BD22E8a7C6b4B07', // LEXIPOP token on Base
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