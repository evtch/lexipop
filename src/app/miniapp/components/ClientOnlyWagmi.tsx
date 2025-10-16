'use client';

/**
 * 🔒 CLIENT-ONLY WAGMI WRAPPER
 *
 * Prevents SSR issues by only rendering wagmi-dependent components on client
 */

import { useState, useEffect, ReactNode } from 'react';

interface ClientOnlyWagmiProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function ClientOnlyWagmi({ children, fallback = null }: ClientOnlyWagmiProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}