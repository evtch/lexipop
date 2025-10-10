'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

// 🔒 SECURITY NOTE: This component only handles CLIENT-SIDE Neynar interactions
// Server-side API calls should use the serverEnv configuration

interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl?: string;
  followerCount: number;
  followingCount: number;
}

interface NeynarContextType {
  user: FarcasterUser | null;
  isLoading: boolean;
  error: string | null;
  signIn: (fid?: number) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const NeynarContext = createContext<NeynarContextType | undefined>(undefined);

interface NeynarProviderProps {
  children: React.ReactNode;
}

export default function NeynarProvider({ children }: NeynarProviderProps) {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // 🔒 SECURITY: Check if user has existing session
      const savedFid = localStorage.getItem('lexipop_fid');

      if (savedFid && !isNaN(parseInt(savedFid))) {
        await loadUserByFid(parseInt(savedFid));
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Auth check failed:', error);
      setError('Failed to check authentication status');
      setIsLoading(false);
    }
  };

  const loadUserByFid = async (fid: number) => {
    try {
      setError(null);
      const response = await fetch(`/api/neynar/user?fid=${fid}`);
      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('lexipop_fid', fid.toString());
        console.log('✅ User loaded:', data.user.username);
      } else {
        throw new Error(data.error || 'Failed to load user');
      }
    } catch (error) {
      console.error('❌ Failed to load user:', error);
      setError('Failed to load user profile');
      throw error;
    }
  };

  const signIn = async (fid?: number) => {
    try {
      setIsLoading(true);
      setError(null);

      if (fid) {
        // Direct FID login (for development/testing)
        await loadUserByFid(fid);
      } else {
        // 🔒 TODO: Implement full Farcaster auth flow
        // For now, use demo FID
        console.log('🔒 Using demo authentication...');
        await loadUserByFid(1482); // Demo FID
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Sign-in failed:', error);
      setError('Sign-in failed');
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem('lexipop_fid');
    console.log('🔒 User signed out securely');
  };

  const refreshUser = async () => {
    if (user) {
      await loadUserByFid(user.fid);
    }
  };

  const value: NeynarContextType = {
    user,
    isLoading,
    error,
    signIn,
    signOut,
    isAuthenticated: !!user,
    refreshUser
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