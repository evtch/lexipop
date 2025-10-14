'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MiniAppButton from './MiniAppButton';
import { generateCommitment, getRewardFromRandomness, calculateBonusMultiplier, REWARD_TIERS, generateImprovedRandomness } from '@/lib/pyth-entropy';
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

export default function TokenWheel({ isVisible, onClaim, onClose, onViewLeaderboard, gameData }: TokenWheelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentNumber, setCurrentNumber] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [isClaimingTokens, setIsClaimingTokens] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  // Wallet connection hooks
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const farcasterAccount = useFarcasterAccount();

  // Airport-style number generator effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isGenerating) {
      interval = setInterval(() => {
        setCurrentNumber(Math.floor(Math.random() * 100) + 1);
      }, 100); // Change number every 100ms
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating]);

  const generateTokens = () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setResult(null);
    setClaimError(null);
    setCurrentNumber(0);

    // Generate final token amount using improved entropy generation
    const generateFinalAmount = () => {
      try {
        // Use the improved entropy generation function
        const { rewardTier, bonusMultiplier } = generateImprovedRandomness(gameData);

        // Apply bonus multiplier to base reward
        const finalTokenAmount = Math.floor(rewardTier.tokens * bonusMultiplier);

        console.log('🎲 TokenWheel Entropy Generation:', {
          gameData,
          baseRewardTier: rewardTier,
          bonusMultiplier,
          finalTokenAmount,
          source: 'Improved Multi-source Entropy'
        });

        return finalTokenAmount;
      } catch (error) {
        console.error('❌ Improved entropy failed, using fallback:', error);
        // Fallback to simple tier-based random
        const randomTierIndex = Math.floor(Math.random() * REWARD_TIERS.length);
        const fallbackTier = REWARD_TIERS[randomTierIndex];

        let bonusMultiplier = 1;
        if (gameData) {
          const correctAnswers = gameData.score / 100;
          bonusMultiplier = calculateBonusMultiplier(correctAnswers, gameData.streak, gameData.totalQuestions);
        }

        return Math.floor(fallbackTier.tokens * bonusMultiplier);
      }
    };

    const finalAmount = generateFinalAmount();

    // Run the number generator for 3 seconds, then show final result
    setTimeout(() => {
      setIsGenerating(false);
      setResult(finalAmount);
      setCurrentNumber(finalAmount);
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
      console.log('❌ Cannot claim $LEXIPOP - missing:', missingItems.join(', '));
      return;
    }

    setIsClaimingTokens(true);
    setClaimError(null);

    try {
      // Step 1: Get withdrawal signature from server
      console.log('🎫 Getting withdrawal signature from server...');
      const response = await fetch('/api/tokens/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId: gameData.gameId,
          userAddress: address,
          tokensToClaimgame: result,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get withdrawal signature');
      }

      const { signature, nonce, tokenAddress, amount } = data;
      console.log('✅ Withdrawal signature received, calling MoneyTree contract...');

      // Step 2: Use wagmi to call the withdraw function on MoneyTree contract
      // Import required wagmi hooks at component level in a real implementation
      // For now, we'll use viem directly (this would normally be done client-side with wagmi)

      // Import viem for direct contract interaction
      const { createWalletClient, http } = await import('viem');
      const { base } = await import('viem/chains');

      // This should be done with wagmi useWalletClient hook in real implementation
      const walletClient = createWalletClient({
        account: address as `0x${string}`,
        chain: base,
        transport: http()
      });

      // Call withdraw function on MoneyTree contract
      const contractAddress = process.env.NEXT_PUBLIC_MONEYTREE_CONTRACT_ADDRESS || '0xE636BaaF2c390A591EdbffaF748898EB3f6FF9A1';

      const txHash = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi: [
          {
            type: "function",
            name: "withdraw",
            inputs: [
              { name: "token", type: "address" },
              { name: "amount", type: "uint256" },
              { name: "recipient", type: "address" },
              { name: "nonce", type: "uint256" },
              { name: "signature", type: "bytes" },
            ],
            outputs: [],
            stateMutability: "nonpayable",
          }
        ],
        functionName: 'withdraw',
        args: [
          tokenAddress as `0x${string}`,
          BigInt(amount),
          address as `0x${string}`,
          BigInt(nonce),
          signature as `0x${string}`
        ]
      });

      console.log('🎉 $LEXIPOP withdrawal transaction submitted:', txHash);
      onClaim(result); // Call the original onClaim callback

    } catch (error) {
      console.error('❌ Token claim failed:', error);
      setClaimError(error instanceof Error ? error.message : 'Failed to claim $LEXIPOP');
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

  if (!isVisible) return null;

  return (
    <div className="flex flex-col p-4 text-gray-800" style={{ height: '90vh', maxHeight: '90vh' }}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">🎰 Spin to Win!</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col items-center justify-center"
      >
        {/* Wallet Status */}
        {!hasFarcasterWallet && (
          <div className="text-center mb-6">
            <p className="text-orange-600 mb-2">
              Connect Farcaster wallet to claim $LEXIPOP
            </p>
          </div>
        )}

        {hasFarcasterWallet && (
          <div className="text-center mb-6">
            <p className="text-green-600 mb-2">
              ✅ @{farcasterAccount.username}
            </p>
          </div>
        )}

        {/* Airport-style Number Generator */}
        <div className="flex-1 flex items-center justify-center mb-8">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-4">
              Generating $LEXIPOP using Pyth Entropy...
            </div>

            {/* Large Number Display */}
            <motion.div
              className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 mb-6 shadow-xl"
              animate={isGenerating ? {
                scale: [1, 1.05, 1]
              } : {}}
              transition={{
                duration: 0.5,
                repeat: isGenerating ? Infinity : 0,
                ease: "easeInOut"
              }}
            >
              <div className="text-6xl font-bold text-white mb-2">
                {currentNumber}
              </div>
              <div className="text-white text-lg">
                $LEXIPOP
              </div>
            </motion.div>

            {/* Status Text */}
            <div className="text-lg font-semibold text-gray-700">
              {isGenerating ? 'Generating...' : result ? 'Ready to claim!' : 'Ready to generate!'}
            </div>
          </div>
        </div>

        {/* Result Display */}
        {result !== null && !isGenerating && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center mb-6 bg-green-100 rounded-xl p-4 border border-green-200"
          >
            <div className="text-xl font-bold text-green-800">
              🎉 You won {result} $LEXIPOP!
            </div>
          </motion.div>
        )}

        {/* Error Display */}
        {claimError && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center mb-6 bg-red-100 rounded-xl p-4 border border-red-200"
          >
            <div className="text-sm font-medium text-red-800">
              ❌ {claimError}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Action Buttons */}
      <div className="space-y-4 mt-auto">
        {result === null ? (
          <MiniAppButton
            onClick={generateTokens}
            variant="primary"
            size="lg"
            icon="🎰"
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? 'Generating...' : 'Generate $LEXIPOP!'}
          </MiniAppButton>
        ) : !hasFarcasterWallet ? (
          <MiniAppButton
            onClick={handleFarcasterWalletConnect}
            variant="primary"
            size="lg"
            icon="🎯"
            className="w-full"
          >
            Connect Wallet
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
            {isClaimingTokens ? 'Claiming...' : `Claim ${result} $LEXIPOP`}
          </MiniAppButton>
        )}

        {/* Navigation buttons - Full width, stacked */}
        {onViewLeaderboard && (
          <MiniAppButton
            onClick={onViewLeaderboard}
            variant="secondary"
            size="lg"
            icon="🏆"
            className="w-full"
          >
            Leaderboard
          </MiniAppButton>
        )}

        <MiniAppButton
          onClick={onClose}
          variant="secondary"
          size="lg"
          icon="🏠"
          className="w-full"
        >
          Close
        </MiniAppButton>
      </div>
    </div>
  );
}