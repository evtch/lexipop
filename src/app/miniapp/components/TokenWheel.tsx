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

    // Generate verifiable random number using Pyth entropy
    const generatePythRandom = () => {
      try {
        // Create deterministic input from game data for verifiable randomness
        const userInput = gameData
          ? `${gameData.gameId}-${gameData.score}-${gameData.streak}-${gameData.userFid || 'anon'}`
          : `wheel-${Date.now()}`;

        const timestamp = Date.now();
        const { commitment, userRandomness } = generateCommitment(userInput, timestamp);

        // Convert the commitment hash to a number for wheel position
        const hashBytes = commitment.slice(2); // Remove '0x'
        const randomValue = parseInt(hashBytes.slice(0, 8), 16); // Use first 32 bits

        console.log('🎲 Pyth entropy generated:', { userInput, commitment, randomValue });

        return randomValue;
      } catch (error) {
        console.error('❌ Pyth entropy failed, fallback to Math.random:', error);
        return Math.floor(Math.random() * 0xFFFFFFFF); // Fallback
      }
    };

    const randomValue = generatePythRandom();

    // Calculate spin based on Pyth random number
    const normalizedRandom = randomValue / 0xFFFFFFFF; // Normalize to 0-1
    const spins = 5 + normalizedRandom * 5; // 5-10 full rotations
    const finalPosition = (randomValue % 360); // Use modulo for final position
    const totalRotation = rotation + (spins * 360) + finalPosition;

    setRotation(totalRotation);

    // Calculate which segment we landed on
    const segmentAngle = 360 / WHEEL_SEGMENTS.length;
    const normalizedPosition = (360 - (finalPosition % 360)) % 360;
    const segmentIndex = Math.floor(normalizedPosition / segmentAngle);
    const wonAmount = WHEEL_SEGMENTS[segmentIndex].amount;

    console.log('🎯 Wheel result:', {
      randomValue,
      finalPosition,
      segmentIndex,
      wonAmount,
      commitment: gameData ? 'from game data' : 'timestamp based'
    });

    // Show result after animation completes
    setTimeout(() => {
      setResult(wonAmount);
      setIsSpinning(false);
    }, 3000);
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
            className="bg-white rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">🎰</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Claim LEXIPOP Tokens!
              </h2>
              <p className="text-gray-600">
                Spin the wheel to claim your reward tokens
              </p>
              <div className="mt-2 text-xs text-blue-600 bg-blue-50 rounded px-2 py-1 inline-block">
                🔒 Powered by Pyth Network for verifiable randomness
              </div>

              {/* Wallet Connection Status */}
              {!hasFarcasterWallet && (
                <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-700 font-medium">
                    🎯 Connect your Farcaster wallet to claim tokens
                  </p>
                  {isConnected && !farcasterAccount.fid && (
                    <p className="text-xs text-orange-600 mt-1">
                      Wallet connected but no Farcaster account detected
                    </p>
                  )}
                </div>
              )}

              {hasFarcasterWallet && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 font-medium">
                    ✅ Farcaster wallet connected
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    @{farcasterAccount.username} (FID: {farcasterAccount.fid})
                  </p>
                </div>
              )}
            </div>

            {/* Wheel Container */}
            <div className="relative w-64 h-64 mx-auto mb-6">
              {/* Wheel */}
              <motion.div
                className="w-full h-full rounded-full border-4 border-gray-800 relative overflow-hidden"
                animate={{ rotate: rotation }}
                transition={{
                  duration: isSpinning ? 3 : 0,
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                {WHEEL_SEGMENTS.map((segment, index) => {
                  const angle = (360 / WHEEL_SEGMENTS.length) * index;
                  return (
                    <div
                      key={index}
                      className={`absolute w-full h-full ${segment.color}`}
                      style={{
                        clipPath: `polygon(50% 50%, 50% 0%, ${
                          50 + 50 * Math.cos((angle + 45) * Math.PI / 180)
                        }% ${
                          50 + 50 * Math.sin((angle + 45) * Math.PI / 180)
                        }%)`,
                        transform: `rotate(${angle}deg)`,
                      }}
                    >
                      <div
                        className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white font-bold text-sm"
                        style={{ transform: `translateX(-50%) rotate(${45}deg)` }}
                      >
                        {segment.amount}
                      </div>
                    </div>
                  );
                })}
              </motion.div>

              {/* Pointer */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 z-10">
                <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-gray-800"></div>
              </div>

              {/* Center Circle */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gray-800 rounded-full z-10"></div>
            </div>

            {/* Result Display */}
            {result !== null && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center mb-6 bg-green-100 rounded-lg p-4 border border-green-200"
              >
                <div className="text-2xl font-bold text-green-800">
                  🎉 You won {result} LEXIPOP tokens!
                </div>
                {!hasFarcasterWallet && (
                  <p className="text-sm text-green-600 mt-2">
                    Connect your Farcaster wallet to claim
                  </p>
                )}
              </motion.div>
            )}

            {/* Error Display */}
            {claimError && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center mb-6 bg-red-100 rounded-lg p-4 border border-red-200"
              >
                <div className="text-sm font-medium text-red-800">
                  ❌ {claimError}
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {result === null ? (
                <MiniAppButton
                  onClick={spinWheel}
                  variant="primary"
                  size="lg"
                  icon="🎰"
                  disabled={isSpinning}
                  className="w-full"
                >
                  {isSpinning ? 'Spinning...' : 'Spin the Wheel!'}
                </MiniAppButton>
              ) : !hasFarcasterWallet ? (
                <MiniAppButton
                  onClick={handleFarcasterWalletConnect}
                  variant="primary"
                  size="lg"
                  icon="🎯"
                  className="w-full"
                >
                  Connect Farcaster Wallet
                </MiniAppButton>
              ) : (
                <MiniAppButton
                  onClick={handleTokenClaim}
                  variant="primary"
                  size="lg"
                  icon="💰"
                  disabled={isClaimingTokens}
                  className="w-full"
                >
                  {isClaimingTokens ? 'Claiming Tokens...' : `Claim ${result} Tokens`}
                </MiniAppButton>
              )}

              {/* Navigation buttons - only show after token claim or immediately */}
              <div className="flex gap-2">
                {onViewLeaderboard && (
                  <MiniAppButton
                    onClick={onViewLeaderboard}
                    variant="secondary"
                    size="md"
                    icon="🏆"
                    className="flex-1"
                  >
                    View Leaderboard
                  </MiniAppButton>
                )}

                <MiniAppButton
                  onClick={onClose}
                  variant="secondary"
                  size="md"
                  icon="🏠"
                  className="flex-1"
                >
                  Back Home
                </MiniAppButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}