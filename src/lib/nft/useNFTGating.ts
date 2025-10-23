/**
 * 🔒 NFT Gating Hook for Token Claims
 *
 * Checks if user has minted NFT for current game session
 * Required before allowing token claims
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { LEXIPOP_NFT_ABI, getContractAddress } from './contract';

export interface NFTGatingState {
  hasNFTForGame: boolean;
  isCheckingNFT: boolean;
  userNFTCount: number;
  error: Error | null;
}

export function useNFTGating(gameWords: string[]) {
  const { address, chainId } = useAccount();
  const [gatingState, setGatingState] = useState<NFTGatingState>({
    hasNFTForGame: false,
    isCheckingNFT: false,
    userNFTCount: 0,
    error: null
  });

  // Manual override for immediate updates after minting
  const [manualOverride, setManualOverride] = useState<boolean | null>(null);

  // Track if we've already processed events to prevent spam
  const lastProcessedMint = useRef<number>(0);

  // Stabilize gameWords to prevent unnecessary re-renders
  const stableGameWords = useMemo(() => {
    // Only update if the actual content changes, not just array reference
    return gameWords.length > 0 ? gameWords.join('|') : '';
  }, [gameWords.join('|')]);

  // Supported chain IDs where NFT contract is deployed
  const SUPPORTED_CHAINS = [8453, 84532]; // Base mainnet and Base Sepolia

  // Get contract address safely with error handling
  const getContractAddressSafe = (chainId: number): string | null => {
    if (!SUPPORTED_CHAINS.includes(chainId)) {
      // Don't log warning for unsupported chains to avoid spam
      return null;
    }
    try {
      return getContractAddress(chainId);
    } catch (error) {
      console.warn(`NFT contract not available on chain ${chainId}:`, error);
      return null;
    }
  };

  const contractAddress = chainId && SUPPORTED_CHAINS.includes(chainId) ? getContractAddressSafe(chainId) : null;

  // Get user's NFT count - but only when needed to avoid blocking UI
  const {
    data: userTokens,
    isLoading: isLoadingTokens,
    error: tokenError,
    refetch: refetchTokens
  } = useReadContract({
    address: contractAddress as `0x${string}` | undefined,
    abi: LEXIPOP_NFT_ABI,
    functionName: 'getPlayerTokens',
    args: address ? [address] : undefined,
    query: {
      enabled: false, // Don't auto-fetch - only fetch when explicitly needed
      staleTime: 30000 // Cache for 30 seconds to avoid re-fetching
    }
  });

  // Check if user has NFT for current game words
  useEffect(() => {
    if (!address || !chainId || !stableGameWords || !userTokens || !contractAddress) {
      setGatingState(prev => ({
        ...prev,
        hasNFTForGame: false,
        isCheckingNFT: false,
        userNFTCount: 0
      }));
      return;
    }

    const checkGameNFT = async () => {
      setGatingState(prev => ({ ...prev, isCheckingNFT: true, error: null }));

      try {
        const contractAddress = getContractAddress(chainId);
        const tokenIds = userTokens as bigint[];

        // If user has no NFTs, they definitely don't have one for this game
        if (!tokenIds || tokenIds.length === 0) {
          setGatingState(prev => ({
            ...prev,
            hasNFTForGame: false,
            isCheckingNFT: false,
            userNFTCount: 0
          }));
          return;
        }

        // For now, we'll check if user has ANY NFT (simple approach)
        // Later we could check specific game words if needed
        const hasAnyNFT = tokenIds.length > 0;

        setGatingState(prev => ({
          ...prev,
          hasNFTForGame: hasAnyNFT,
          isCheckingNFT: false,
          userNFTCount: tokenIds.length
        }));

      } catch (error) {
        console.error('Error checking NFT for game:', error);
        setGatingState(prev => ({
          ...prev,
          hasNFTForGame: false,
          isCheckingNFT: false,
          error: error as Error
        }));
      }
    };

    checkGameNFT();
  }, [address, chainId, stableGameWords, userTokens]);

  // Handle token loading error
  useEffect(() => {
    if (tokenError) {
      setGatingState(prev => ({
        ...prev,
        error: tokenError as Error,
        isCheckingNFT: false
      }));
    }
  }, [tokenError]);

  // Use manual override if available, otherwise use computed state
  const finalHasNFT = manualOverride !== null ? manualOverride : gatingState.hasNFTForGame;

  return {
    ...gatingState,
    hasNFTForGame: finalHasNFT,
    isLoading: isLoadingTokens || gatingState.isCheckingNFT,

    // Helper methods
    canClaimTokens: () => finalHasNFT,
    requiresNFT: () => !finalHasNFT,

    // Manually trigger NFT check (lazy loading)
    checkNFT: async () => {
      if (!address || !chainId || !contractAddress) {
        return false;
      }

      try {
        const result = await refetchTokens();
        // The useEffect will handle the rest
        return true;
      } catch (error) {
        console.error('Failed to check NFTs:', error);
        return false;
      }
    },

    // Refresh check
    refresh: () => {
      // Clear manual override and trigger a re-check
      setManualOverride(null);
      setGatingState(prev => ({ ...prev, isCheckingNFT: true }));
    },

    // Manual override for immediate updates after minting
    setHasMintedNFT: () => {
      const now = Date.now();
      // Prevent spam by only logging once per 5 seconds
      if (now - lastProcessedMint.current > 5000) {
        console.log('🎉 NFT minted successfully - enabling token claims immediately');
        lastProcessedMint.current = now;
      }
      setManualOverride(true);
      setGatingState(prev => ({ ...prev, userNFTCount: prev.userNFTCount + 1 }));
    }
  };
}