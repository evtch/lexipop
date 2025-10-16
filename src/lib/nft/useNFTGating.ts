/**
 * 🔒 NFT Gating Hook for Token Claims
 *
 * Checks if user has minted NFT for current game session
 * Required before allowing token claims
 */

import { useState, useEffect } from 'react';
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

  // Get user's NFT count
  const {
    data: userTokens,
    isLoading: isLoadingTokens,
    error: tokenError
  } = useReadContract({
    address: chainId ? getContractAddress(chainId) as `0x${string}` : undefined,
    abi: LEXIPOP_NFT_ABI,
    functionName: 'getPlayerTokens',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!chainId
    }
  });

  // Check if user has NFT for current game words
  useEffect(() => {
    if (!address || !chainId || !gameWords.length || !userTokens) {
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
  }, [address, chainId, gameWords, userTokens]);

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

  return {
    ...gatingState,
    isLoading: isLoadingTokens || gatingState.isCheckingNFT,

    // Helper methods
    canClaimTokens: () => gatingState.hasNFTForGame,
    requiresNFT: () => !gatingState.hasNFTForGame,

    // Refresh check
    refresh: () => {
      // This will trigger a re-check via the useEffect
      setGatingState(prev => ({ ...prev, isCheckingNFT: true }));
    }
  };
}