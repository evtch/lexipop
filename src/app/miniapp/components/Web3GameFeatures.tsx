'use client';

/**
 * 🔗 WEB3 GAME FEATURES
 *
 * Contains all Web3-dependent functionality for the game
 * Separated to prevent SSR issues with wagmi hooks
 */

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useFarcasterAccount } from '@/lib/web3/hooks/useFarcasterAccount';
import { useNFTGating } from '@/lib/nft/useNFTGating';
import { generateImprovedRandomness } from '@/lib/pyth-entropy';
import NFTMintSection from './NFTMintSection';
import MiniAppButton from './MiniAppButton';

interface Web3GameFeaturesProps {
  gameData: {
    gameQuestions: Array<{ word: string }>;
    score: number;
    streak: number;
    totalQuestions: number;
    gameId: string;
  };
  dailyStreak: number;
  generatedTokens: number | null;
  isGeneratingTokens: boolean;
  onGenerateTokens: () => void;
  onClaimTokens: (amount: number) => void;
  refreshNFTCheck: () => void;
}

export default function Web3GameFeatures({
  gameData,
  dailyStreak,
  generatedTokens,
  isGeneratingTokens,
  onGenerateTokens,
  onClaimTokens,
  refreshNFTCheck
}: Web3GameFeaturesProps) {
  const [isClaimingTokens, setIsClaimingTokens] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  // Wallet connection hooks
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const farcasterAccount = useFarcasterAccount();

  // NFT gating for token claims
  const {
    hasNFTForGame,
    isCheckingNFT,
    userNFTCount,
    error: nftError,
    isLoading: isLoadingNFT,
    canClaimTokens: canClaimWithNFT,
    requiresNFT,
    refresh: refreshNFTCheck: nftRefresh
  } = useNFTGating(address, gameData.gameQuestions.map(q => q.word));

  // Check if user has Farcaster wallet connected and verified
  const hasFarcasterWallet = isConnected && farcasterAccount.isConnected && farcasterAccount.fid;
  // For desktop users, allow any wallet connection if Farcaster account isn't available
  const hasAnyWallet = isConnected && address;
  const canClaimGeneratedTokens = (hasFarcasterWallet || hasAnyWallet) && generatedTokens && !isClaimingTokens;

  const handleFarcasterWalletConnect = () => {
    // Find the Farcaster Frame connector
    const farcasterConnector = connectors.find(connector =>
      connector.name.toLowerCase().includes('farcaster') ||
      connector.id.includes('farcaster')
    );

    if (farcasterConnector) {
      connect({ connector: farcasterConnector });
    } else {
      setClaimError('Farcaster wallet connector not found');
    }
  };

  const handleTokenClaim = async () => {
    if (!generatedTokens || !address) {
      const missingItems = [];
      if (!generatedTokens) missingItems.push('generated tokens');
      if (!address) missingItems.push('wallet address');

      setClaimError(`Missing: ${missingItems.join(', ')}`);
      return;
    }

    setIsClaimingTokens(true);
    setClaimError(null);

    try {
      // Call the parent component's claim handler
      await onClaimTokens(generatedTokens);
    } catch (error) {
      console.error('❌ Token claim failed:', error);
      setClaimError(error instanceof Error ? error.message : 'Failed to claim $LEXIPOP');
    } finally {
      setIsClaimingTokens(false);
    }
  };

  return (
    <>
      {/* NFT Minting Section */}
      <NFTMintSection
        words={gameData.gameQuestions.map(q => q.word)}
        score={gameData.score}
        streak={dailyStreak}
        visible={gameData.totalQuestions > 0}
        onMintSuccess={() => {
          refreshNFTCheck();
        }}
      />

      {/* Token Generation Section */}
      <div className="mb-4">
        {!generatedTokens ? (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-3 text-white shadow-lg">
            <div className="text-center">
              <div className="text-base font-bold mb-2">
                💰 $LEXIPOP Tokens
              </div>
              <div className="text-xs text-blue-100 mb-3">
                Use Pyth entropy to generate your reward
              </div>
              <MiniAppButton
                onClick={onGenerateTokens}
                variant="primary"
                size="md"
                disabled={isGeneratingTokens}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 border-0"
              >
                {isGeneratingTokens ? 'Generating...' : 'Generate my reward'}
              </MiniAppButton>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-3 text-white shadow-lg">
            <div className="text-center">
              <div className="text-base font-bold mb-2">
                🎉 You won {generatedTokens} $LEXIPOP!
              </div>

              {/* NFT Gating Logic */}
              {requiresNFT && !hasNFTForGame ? (
                <div className="space-y-2">
                  <div className="text-xs text-green-100">
                    Mint the NFT above to claim your tokens!
                  </div>
                  <div className="text-xs text-green-200">
                    NFTs: {userNFTCount || 0} | Required: 1
                  </div>
                </div>
              ) : !hasAnyWallet ? (
                <div className="space-y-2">
                  <div className="text-xs text-green-100 mb-2">
                    Connect your wallet to claim
                  </div>
                  <MiniAppButton
                    onClick={handleFarcasterWalletConnect}
                    variant="primary"
                    size="md"
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 border-0"
                  >
                    Connect Wallet
                  </MiniAppButton>
                </div>
              ) : (
                <div className="space-y-2">
                  <MiniAppButton
                    onClick={handleTokenClaim}
                    variant="primary"
                    size="md"
                    disabled={isClaimingTokens || (requiresNFT && !canClaimWithNFT)}
                    className="w-full bg-blue-600 text-white hover:bg-blue-700 border-0 font-semibold"
                  >
                    {isClaimingTokens ? 'Claiming...' : 'Claim'}
                  </MiniAppButton>
                  <div className="text-xs text-green-200">
                    Free to claim • Only pay gas (~$0.01)
                  </div>
                </div>
              )}

              {/* Error Display */}
              {claimError && (
                <div className="mt-2 text-xs text-red-200 bg-red-500/20 rounded p-2">
                  {claimError}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}