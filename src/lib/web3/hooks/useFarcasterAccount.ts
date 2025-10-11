/**
 * 🎯 FARCASTER ACCOUNT HOOK
 *
 * Detects FID automatically from Farcaster wallet connection
 * Integrates with the miniapp SDK to get user's Farcaster identity
 */

import { useEffect, useState } from 'react';
import { useAccount, useConfig } from 'wagmi';
// import { sdk } from '@farcaster/miniapp-sdk';

export interface FarcasterAccountInfo {
  fid?: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  isConnected: boolean;
  isLoading: boolean;
  error?: string;
}

export function useFarcasterAccount(): FarcasterAccountInfo {
  const { address, isConnected } = useAccount();
  const [farcasterInfo, setFarcasterInfo] = useState<FarcasterAccountInfo>({
    isConnected: false,
    isLoading: true,
  });

  useEffect(() => {
    const detectFarcasterAccount = async () => {
      try {
        setFarcasterInfo(prev => ({ ...prev, isLoading: true, error: undefined }));

        if (!isConnected || !address) {
          setFarcasterInfo({
            isConnected: false,
            isLoading: false,
          });
          return;
        }

        // Try to get Farcaster context from the miniapp SDK
        // const context = await sdk.context;

        // if (context?.user) {
        //   const { fid, username, displayName, pfpUrl } = context.user;

        //   setFarcasterInfo({
        //     fid,
        //     username,
        //     displayName,
        //     pfpUrl,
        //     isConnected: true,
        //     isLoading: false,
        //   });

        //   console.log('🎯 Farcaster account detected:', { fid, username, displayName });
        // } else {
        //   // Fallback: Still connected to wallet but no Farcaster context (SDK commented out)
        //   setFarcasterInfo({
        //     isConnected: true,
        //     isLoading: false,
        //     error: 'Wallet connected but no Farcaster context available',
        //   });
        // }

        // Temporary fallback since SDK is commented out
        setFarcasterInfo({
          isConnected: true,
          isLoading: false,
          error: 'Farcaster miniapp SDK not available',
        });
      } catch (error) {
        console.error('❌ Failed to detect Farcaster account:', error);
        setFarcasterInfo({
          isConnected: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to detect Farcaster account',
        });
      }
    };

    detectFarcasterAccount();
  }, [address, isConnected]);

  return farcasterInfo;
}