'use client';

/**
 * 🔐 SIGN IN WITH FARCASTER PROVIDER
 *
 * Wraps the Farcaster auth-kit to provide SIWF authentication
 * Integrates with the miniapp for seamless Farcaster sign-in
 */

import React from 'react';
import '@farcaster/auth-kit/styles.css';
import { AuthKitProvider } from '@farcaster/auth-kit';

interface SIWFProviderProps {
  children: React.ReactNode;
}

// SIWF configuration for Lexipop
const authConfig = {
  // Use Optimism mainnet for SIWF (required by auth-kit)
  rpcUrl: 'https://mainnet.optimism.io',

  // Your app's domain (update in production)
  domain: process.env.NODE_ENV === 'production'
    ? 'lexipop.vercel.app'
    : 'localhost:3004',

  // SIWE login endpoint
  siweUri: process.env.NODE_ENV === 'production'
    ? 'https://lexipop.vercel.app/api/auth/login'
    : 'http://localhost:3004/api/auth/login',

  // Optional: Customize relay URL
  // relay: 'https://relay.farcaster.xyz',
};

export default function SIWFProvider({ children }: SIWFProviderProps) {
  return (
    <AuthKitProvider config={authConfig}>
      {children}
    </AuthKitProvider>
  );
}

/**
 * 🔒 SECURITY NOTES:
 *
 * - Domain Validation: Ensure domain matches your actual deployment
 * - SIWE URI: Must be HTTPS in production for security
 * - RPC Endpoint: Uses Optimism mainnet as required by auth-kit
 * - Relay: Uses default Farcaster relay for message signing
 */