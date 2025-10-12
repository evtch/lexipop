'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MiniAppButton from './MiniAppButton';
import { generateCommitment } from '@/lib/pyth-entropy';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useFarcasterAccount } from '@/lib/web3/hooks/useFarcasterAccount';

interface TokenWheelProps {
  isVisible: boolean;
  onClaim: (amount: number) => void;
  onClose: () => void;
  onViewLeaderboard?: () => void;
  gameData?: {
    score: number;
    streak: number;
    totalQuestions: number;
    gameId: string;
    userFid?: number;
  };
}

const WHEEL_SEGMENTS = [
  { amount: 10, color: 'bg-red-400' },
  { amount: 50, color: 'bg-orange-400' },
  { amount: 25, color: 'bg-yellow-400' },
  { amount: 100, color: 'bg-green-400' },
  { amount: 15, color: 'bg-blue-400' },
  { amount: 75, color: 'bg-purple-400' },
  { amount: 20, color: 'bg-pink-400' },
  { amount: 5, color: 'bg-gray-400' },
];

export default function TokenWheel({ isVisible, onClaim, onClose, onViewLeaderboard, gameData }: TokenWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [isClaimingTokens, setIsClaimingTokens] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  // Wallet connection hooks
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const farcasterAccount = useFarcasterAccount();

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setResult(null);
    setClaimError(null);

    // Generate token amount directly using Pyth entropy - no visual spinning
    const generateRandomTokenAmount = () => {
      try {
        // Create deterministic input from game data for verifiable randomness
        const userInput = gameData
          ? `${gameData.gameId}-${gameData.score}-${gameData.streak}-${gameData.userFid || 'anon'}`
          : `wheel-${Date.now()}`;

        const timestamp = Date.now();
        const { commitment, userRandomness } = generateCommitment(userInput, timestamp);

        // Convert the commitment hash to a number
        const hashBytes = commitment.slice(2); // Remove '0x'
        const randomValue = parseInt(hashBytes.slice(0, 8), 16); // Use first 32 bits

        // Generate token amount between 1-100 using Pyth entropy
        const tokenAmount = 1 + (randomValue % 100);

        console.log('🎲 Pyth Entropy Token Generation:', {
          userInput,
          commitment,
          randomValue,
          tokenAmount,
          source: 'Pyth Network Entropy'
        });

        return tokenAmount;
      } catch (error) {
        console.error('❌ Pyth entropy failed, fallback to Math.random:', error);
        // Fallback to regular random if Pyth fails
        return 1 + Math.floor(Math.random() * 100);
      }
    };

    const wonAmount = generateRandomTokenAmount();

    // Show result after short delay (no spinning animation needed)
    setTimeout(() => {
      setResult(wonAmount);
      setIsSpinning(false);
    }, 1500); // Shorter delay since no spinning
  };

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
    if (!result || !address || !gameData) {
      const missingItems = [];
      if (!result) missingItems.push('prize amount');
      if (!address) missingItems.push('wallet address');
      if (!gameData) missingItems.push('game data');

      setClaimError(`Missing: ${missingItems.join(', ')}`);
      console.log('❌ Cannot claim tokens - missing:', missingItems.join(', '));
      return;
    }

    setIsClaimingTokens(true);
    setClaimError(null);

    try {
      const response = await fetch('/api/tokens/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId: gameData.gameId,
          userAddress: address,
          tokensToClaimgame: result,
          signature: '', // Could add signature verification later
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('🎉 Tokens claimed successfully:', data.transactionHash);
        onClaim(result); // Call the original onClaim callback
      } else {
        throw new Error(data.error || 'Failed to claim tokens');
      }
    } catch (error) {
      console.error('❌ Token claim failed:', error);
      setClaimError(error instanceof Error ? error.message : 'Failed to claim tokens');
    } finally {
      setIsClaimingTokens(false);
    }
  };

  // Check if user has Farcaster wallet connected and verified
  const hasFarcasterWallet = isConnected && farcasterAccount.isConnected && farcasterAccount.fid;
  const canClaimTokens = hasFarcasterWallet && result && !isClaimingTokens;

  // Debug logging for development
  if (process.env.NODE_ENV === 'development') {
    console.log('🎯 TokenWheel state:', {
      isVisible,
      result,
      isConnected,
      address: !!address,
      farcasterAccountConnected: farcasterAccount.isConnected,
      farcasterFid: farcasterAccount.fid,
      hasFarcasterWallet,
      canClaimTokens,
      hasGameData: !!gameData
    });
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-xl p-4 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-1">
                🎰 Spin to Win!
              </h2>

              {/* Compact Wallet Status */}
              {!hasFarcasterWallet && (
                <p className="text-sm text-orange-600 mb-2">
                  Connect Farcaster wallet to claim
                </p>
              )}

              {hasFarcasterWallet && (
                <p className="text-sm text-green-600 mb-2">
                  ✅ @{farcasterAccount.username}
                </p>
              )}
            </div>

            {/* Random Number Generator Display */}
            <div className="relative w-48 h-48 mx-auto mb-4 flex items-center justify-center">
              <motion.div
                className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full w-40 h-40 flex items-center justify-center shadow-lg"
                animate={isSpinning ? {
                  scale: [1, 1.1, 1],
                  rotate: [0, 360]
                } : {}}
                transition={{
                  duration: 1.5,
                  repeat: isSpinning ? Infinity : 0,
                  ease: "easeInOut"
                }}
              >
                <div className="text-center text-white">
                  <div className="text-3xl font-bold mb-2">🎲</div>
                  <div className="text-lg font-semibold">
                    {isSpinning ? 'Generating...' : 'Ready!'}
                  </div>
                  <div className="text-xs mt-1 opacity-75">
                    Pyth Entropy
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Result Display */}
            {result !== null && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center mb-3 bg-green-100 rounded-lg p-3 border border-green-200"
              >
                <div className="text-lg font-bold text-green-800">
                  🎉 Won {result} tokens!
                </div>
              </motion.div>
            )}

            {/* Error Display */}
            {claimError && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center mb-3 bg-red-100 rounded-lg p-3 border border-red-200"
              >
                <div className="text-sm font-medium text-red-800">
                  ❌ {claimError}
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              {result === null ? (
                <MiniAppButton
                  onClick={spinWheel}
                  variant="primary"
                  size="md"
                  icon="🎰"
                  disabled={isSpinning}
                  className="w-full"
                >
                  {isSpinning ? 'Generating...' : 'Generate Tokens!'}
                </MiniAppButton>
              ) : !hasFarcasterWallet ? (
                <MiniAppButton
                  onClick={handleFarcasterWalletConnect}
                  variant="primary"
                  size="md"
                  icon="🎯"
                  className="w-full"
                >
                  Connect Wallet
                </MiniAppButton>
              ) : (
                <MiniAppButton
                  onClick={handleTokenClaim}
                  variant="primary"
                  size="md"
                  icon="💰"
                  disabled={isClaimingTokens}
                  className="w-full"
                >
                  {isClaimingTokens ? 'Claiming...' : `Claim ${result}`}
                </MiniAppButton>
              )}

              {/* Navigation buttons */}
              <div className="flex gap-2">
                {onViewLeaderboard && (
                  <MiniAppButton
                    onClick={onViewLeaderboard}
                    variant="secondary"
                    size="sm"
                    icon="🏆"
                    className="flex-1"
                  >
                    Leaderboard
                  </MiniAppButton>
                )}

                <MiniAppButton
                  onClick={onClose}
                  variant="secondary"
                  size="sm"
                  icon="🏠"
                  className="flex-1"
                >
                  Close
                </MiniAppButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}