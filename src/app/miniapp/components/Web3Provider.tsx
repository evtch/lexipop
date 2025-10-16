'use client';

/**
 * 🌐 WEB3 PROVIDER
 *
 * Provides Web3 wallet connection capabilities using Wagmi and Farcaster connector
 * Handles wallet connection, token claims, and blockchain interactions
 */

import React, { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import wagmiConfig from '@/lib/web3/config';
import miniappWagmiConfig from '@/lib/web3/miniapp-config';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

interface Web3ProviderProps {
  children: ReactNode;
  useMiniappConfig?: boolean; // Flag to use Farcaster miniapp config
}

export default function Web3Provider({ children, useMiniappConfig = false }: Web3ProviderProps) {
  // Use miniapp config when in Farcaster context, otherwise use standard config
  const selectedConfig = useMiniappConfig ? miniappWagmiConfig : wagmiConfig;

  return (
    <WagmiProvider config={selectedConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

/**
 * 🔒 SECURITY NOTES:
 *
 * - Never store private keys client-side
 * - Always validate transactions server-side
 * - Use proper gas estimation
 * - Implement transaction replay protection
 * - Validate all user inputs
 * - Use secure RPC endpoints
 */