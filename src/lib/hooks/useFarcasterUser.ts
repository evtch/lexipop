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

  useEffect(() => {
    const getFarcasterUser = async () => {
      try {
        setUser(prev => ({ ...prev, isLoading: true, error: undefined }));

        // Wait for SDK to be ready
        await sdk.actions.ready();

        // Add mini app to Farcaster on every load (for basic registration)
        try {
          await sdk.actions.addMiniApp();
          console.log('✅ Mini app registered with Farcaster automatically');
        } catch (addError) {
          console.warn('⚠️ Auto mini app registration failed (may already be added):', addError);
          // Continue anyway - this is not critical for basic functionality
        }

        // Get user context from Farcaster miniapp
        const context = await sdk.context;

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
            error: 'No Farcaster user context available',
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