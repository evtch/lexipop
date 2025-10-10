/**
 * 🌐 WEB3 CONFIGURATION
 *
 * Wagmi and RainbowKit configuration for wallet connections
 * Supports multiple chains and wallet providers
 */

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, base, baseSepolia, sepolia } from 'wagmi/chains';

// Get environment variables with fallbacks
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '7e3c82dfe33435c5ae224a90a29e25db';
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

// Real contract addresses
export const tokenContracts = {
  [mainnet.id]: {
    lexipopToken: '0xf732f31f73e7DC21299f3ab42BD22E8a7C6b4B07', // LEXIPOP token on mainnet
    moneyTree: '0xE636BaaF2c390A591EdbffaF748898EB3f6FF9A1', // MoneyTree distributor
  },
  [base.id]: {
    lexipopToken: '0xf732f31f73e7DC21299f3ab42BD22E8a7C6b4B07', // LEXIPOP token on Base
    moneyTree: '0xE636BaaF2c390A591EdbffaF748898EB3f6FF9A1', // MoneyTree distributor
  },
  [baseSepolia.id]: {
    lexipopToken: '0xf732f31f73e7DC21299f3ab42BD22E8a7C6b4B07', // LEXIPOP token on Base Sepolia
    moneyTree: '0xE636BaaF2c390A591EdbffaF748898EB3f6FF9A1', // MoneyTree distributor
  },
  [sepolia.id]: {
    lexipopToken: '0xf732f31f73e7DC21299f3ab42BD22E8a7C6b4B07', // LEXIPOP token on Sepolia
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

  // Supported wallet types
  supportedWallets: [
    'metamask',
    'walletconnect',
    'coinbase',
    'rainbow'
  ]
} as const;

export default wagmiConfig;