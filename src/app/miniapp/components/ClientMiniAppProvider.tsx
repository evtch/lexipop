'use client';

/**
 * 🔐 CLIENT-SIDE MINIAPP PROVIDER
 *
 * Temporary fallback provider that just renders children
 * Neynar integration temporarily disabled due to SSR issues
 */

import React from 'react';

interface ClientMiniAppProviderProps {
  children: React.ReactNode;
}

export default function ClientMiniAppProvider({ children }: ClientMiniAppProviderProps) {
  // Temporarily just render children without Neynar provider
  // This avoids SSR issues while maintaining functionality via Farcaster SDK
  return <>{children}</>;
}