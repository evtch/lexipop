'use client';

/**
 * 🌐 WEB3 PROVIDER
 *
 * Provides Web3 wallet connection capabilities using Wagmi and RainbowKit
 * Handles wallet connection, token claims, and blockchain interactions
 */

import React, { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import wagmiConfig from '@/lib/web3/config';

// Import RainbowKit CSS
import '@rainbow-me/rainbowkit/styles.css';

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
}

// Custom RainbowKit theme to match Lexipop brand
const lexipopTheme = darkTheme({
  accentColor: '#2563eb', // Blue-600 to match our brand
  accentColorForeground: 'white',
  borderRadius: 'medium',
  fontStack: 'system',
});

export default function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={lexipopTheme}
          modalSize="compact"
          showRecentTransactions={true}
          coolMode={false} // Disable cool mode for better performance
        >
          {children}
        </RainbowKitProvider>
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