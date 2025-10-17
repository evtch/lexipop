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

  // Manual override for immediate updates after minting
  const [manualOverride, setManualOverride] = useState<boolean | null>(null);

  // Get contract address safely with error handling
  const getContractAddressSafe = (chainId: number): string | null => {
    try {
      return getContractAddress(chainId);
    } catch (error) {
      console.warn(`NFT contract not available on chain ${chainId}:`, error);
      return null;
    }
  };

  const contractAddress = chainId ? getContractAddressSafe(chainId) : null;

  // Get user's NFT count
  const {
    data: userTokens,
    isLoading: isLoadingTokens,
    error: tokenError
  } = useReadContract({
    address: contractAddress as `0x${string}` | undefined,
    abi: LEXIPOP_NFT_ABI,
    functionName: 'getPlayerTokens',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!chainId && !!contractAddress
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

  // Use manual override if available, otherwise use computed state
  const finalHasNFT = manualOverride !== null ? manualOverride : gatingState.hasNFTForGame;

  return {
    ...gatingState,
    hasNFTForGame: finalHasNFT,
    isLoading: isLoadingTokens || gatingState.isCheckingNFT,

    // Helper methods
    canClaimTokens: () => finalHasNFT,
    requiresNFT: () => !finalHasNFT,

    // Refresh check
    refresh: () => {
      // Clear manual override and trigger a re-check
      setManualOverride(null);
      setGatingState(prev => ({ ...prev, isCheckingNFT: true }));
    },

    // Manual override for immediate updates after minting
    setHasMintedNFT: () => {
      console.log('🎉 NFT minted successfully - enabling token claims immediately');
      setManualOverride(true);
      setGatingState(prev => ({ ...prev, userNFTCount: prev.userNFTCount + 1 }));
    }
  };
}