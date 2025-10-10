'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

// 🔒 SECURITY NOTE: This component only handles CLIENT-SIDE Neynar interactions
// Server-side API calls should use the serverEnv configuration

interface NeynarContextType {
  user: any | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
}

const NeynarContext = createContext<NeynarContextType | undefined>(undefined);

interface NeynarProviderProps {
  children: React.ReactNode;
}

export default function NeynarProvider({ children }: NeynarProviderProps) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // 🔒 SECURITY: Never expose API keys to client-side code
      // This would typically call our own API endpoint that uses server-side credentials

      // For now, simulate auth check
      setIsLoading(false);

      // TODO: Implement actual Neynar auth check via our secure API endpoint
      console.log('🔒 Checking Neynar auth status via secure API...');

    } catch (error) {
      console.error('Auth check failed:', error);
      setIsLoading(false);
    }
  };

  const signIn = async () => {
    try {
      setIsLoading(true);

      // 🔒 SECURITY: Client calls our secure API endpoint, not Neynar directly
      console.log('🔒 Initiating secure sign-in flow...');

      // TODO: Implement Farcaster auth flow via our secure endpoints
      // This will redirect to Farcaster auth, then back to our callback

      setIsLoading(false);
    } catch (error) {
      console.error('Sign-in failed:', error);
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    console.log('🔒 User signed out securely');
  };

  const value: NeynarContextType = {
    user,
    isLoading,
    signIn,
    signOut,
    isAuthenticated: !!user
  };

  return (
    <NeynarContext.Provider value={value}>
      {children}
    </NeynarContext.Provider>
  );
}

export function useNeynar() {
  const context = useContext(NeynarContext);
  if (!context) {
    throw new Error('useNeynar must be used within a NeynarProvider');
  }
  return context;
}

/**
 * 🔒 SECURITY REMINDER:
 *
 * - Never put API keys in client-side code
 * - Always use server-side API routes for sensitive operations
 * - Validate all user input on the server
 * - Never trust client-side data
 * - Use HTTPS in production
 * - Implement proper CORS policies
 */