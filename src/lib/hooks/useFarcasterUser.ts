/**
 * 🎯 FARCASTER USER HOOK
 *
 * Automatically gets user info from Farcaster miniapp context
 * No manual login required - works automatically in Farcaster clients
 */

import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

export interface FarcasterUser {
  fid?: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  isLoading: boolean;
  error?: string;
}

export function useFarcasterUser(): FarcasterUser {
  const [user, setUser] = useState<FarcasterUser>({
    isLoading: true,
  });

  // Set loading to false after short delay to prevent infinite loading UI
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      setUser(prev => {
        if (prev.isLoading && !prev.fid) {
          console.log('⚡ Fast fallback: proceeding without full SDK init');
          return { ...prev, isLoading: false, error: 'Quick fallback mode' };
        }
        return prev;
      });
    }, 2000); // Show app after 2 seconds max

    return () => clearTimeout(fallbackTimer);
  }, []);

  useEffect(() => {
    const getFarcasterUser = async () => {
      try {
        setUser(prev => ({ ...prev, isLoading: true, error: undefined }));

        // Initialize SDK in background, set timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('SDK initialization timeout')), 8000);
        });

        // Try to get user context with timeout
        const sdkPromise = (async () => {
          await sdk.actions.ready();
          return sdk.context;
        })();

        const context = await Promise.race([sdkPromise, timeoutPromise]) as any;

        if (context?.user) {
          const { fid, username, displayName, pfpUrl } = context.user;

          setUser({
            fid,
            username,
            displayName,
            pfpUrl,
            isLoading: false,
          });

          console.log('🎯 Farcaster user detected:', { fid, username, displayName });
        } else {
          setUser({
            isLoading: false,
            error: '',
          });
        }
      } catch (error) {
        console.error('❌ Failed to get Farcaster user:', error);
        setUser({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to get Farcaster user',
        });
      }
    };

    getFarcasterUser();
  }, []);

  return user;
}