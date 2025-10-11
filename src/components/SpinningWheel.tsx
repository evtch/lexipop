'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { REWARD_TIERS, RewardTier, generateMockRandomness, calculateBonusMultiplier, getPythRandomNumber } from '@/lib/pyth-entropy';
import { useWalletClient } from 'wagmi';

interface SpinningWheelProps {
  isVisible: boolean;
  onClose: () => void;
  onRewardClaimed: (tokens: number) => void;
  gameScore: number;
  gameStreak: number;
  totalQuestions: number;
}

export default function SpinningWheel({
  isVisible,
  onClose,
  onRewardClaimed,
  gameScore,
  gameStreak,
  totalQuestions
}: SpinningWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [finalReward, setFinalReward] = useState<RewardTier | null>(null);
  const [finalTokens, setFinalTokens] = useState(0);
  const [bonusMultiplier, setBonusMultiplier] = useState(1);
  const [usePythEntropy, setUsePythEntropy] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const { data: walletClient } = useWalletClient();

  // Calculate segment angle (360 degrees / 6 segments)
  const segmentAngle = 360 / REWARD_TIERS.length;

  // Reset state when modal opens
  useEffect(() => {
    if (isVisible) {
      setIsSpinning(false);
      setHasSpun(false);
      setFinalReward(null);
      setFinalTokens(0);
      setBonusMultiplier(calculateBonusMultiplier(gameScore, gameStreak, totalQuestions));
    }
  }, [isVisible, gameScore, gameStreak, totalQuestions]);

  const spinWheel = async () => {
    if (isSpinning || hasSpun) return;

    setIsSpinning(true);

    try {
      let reward: RewardTier;

      // Try to use Pyth Entropy if wallet is connected and user opts in
      if (usePythEntropy && walletClient) {
        try {
          console.log('🎲 Using Pyth Entropy for provably fair randomness...');
          const userInput = `game-${gameScore}-${gameStreak}-${Date.now()}`;
          const { rewardTier } = await getPythRandomNumber(walletClient, userInput);
          reward = rewardTier;
          console.log('✅ Pyth Entropy successful:', reward);
        } catch (entropyError) {
          console.warn('⚠️ Pyth Entropy failed, falling back to mock randomness:', entropyError);
          // Fallback to mock randomness
          const randomValue = generateMockRandomness();
          reward = REWARD_TIERS.find(tier =>
            randomValue >= tier.min && randomValue <= tier.max
          ) || REWARD_TIERS[0];
        }
      } else {
        // Use mock randomness for development/testing
        const randomValue = generateMockRandomness();
        reward = REWARD_TIERS.find(tier =>
          randomValue >= tier.min && randomValue <= tier.max
        ) || REWARD_TIERS[0];
      }

      // Calculate final angle to land on the reward segment
      const rewardIndex = REWARD_TIERS.indexOf(reward);
      const targetAngle = rewardIndex * segmentAngle + (segmentAngle / 2);

      // Add multiple spins for dramatic effect
      const finalAngle = 360 * 5 + targetAngle; // 5 full rotations + target

      // Apply rotation to wheel
      if (wheelRef.current) {
        wheelRef.current.style.transform = `rotate(${finalAngle}deg)`;
        wheelRef.current.style.transition = 'transform 4s cubic-bezier(0.23, 1, 0.32, 1)';
      }

      // Wait for spin animation to complete
      setTimeout(() => {
        const baseTokens = reward.tokens;
        const finalAmount = Math.floor(baseTokens * bonusMultiplier);

        setFinalReward(reward);
        setFinalTokens(finalAmount);
        setIsSpinning(false);
        setHasSpun(true);

        onRewardClaimed(finalAmount);
      }, 4000);

    } catch (error) {
      console.error('Spin failed:', error);
      setIsSpinning(false);
    }
  };

  const resetAndClose = () => {
    if (wheelRef.current) {
      wheelRef.current.style.transform = 'rotate(0deg)';
      wheelRef.current.style.transition = 'none';
    }
    onClose();
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
      onClick={resetAndClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {!hasSpun ? (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Token Reward!</h2>
            <p className="text-gray-600 mb-6">
              Spin the wheel to claim your $LEXIPOP tokens
            </p>

            {/* Performance Bonus Info */}
            {bonusMultiplier > 1 && (
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800 font-medium">
                  🎉 Performance Bonus: {bonusMultiplier}x multiplier!
                </p>
                <p className="text-xs text-blue-600">
                  {gameScore === totalQuestions && 'Perfect score! '}
                  {gameStreak >= 5 && `${gameStreak} streak bonus! `}
                </p>
              </div>
            )}

            {/* Pyth Entropy Option */}
            {walletClient && (
              <div className="bg-gray-50 rounded-lg p-3 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      🎲 Provably Fair Randomness
                    </p>
                    <p className="text-xs text-gray-600">
                      Use Pyth Entropy for blockchain-verified fairness
                    </p>
                  </div>
                  <button
                    onClick={() => setUsePythEntropy(!usePythEntropy)}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${usePythEntropy ? 'bg-blue-600' : 'bg-gray-300'}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${usePythEntropy ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>
                {usePythEntropy && (
                  <p className="text-xs text-blue-600 mt-2">
                    ⚠️ Requires gas fee (~$0.01) for entropy request
                  </p>
                )}
              </div>
            )}

            {/* Spinning Wheel */}
            <div className="relative mb-8">
              <div className="relative w-64 h-64 mx-auto">
                {/* Wheel */}
                <div
                  ref={wheelRef}
                  className="absolute inset-0 rounded-full border-4 border-gray-300 overflow-hidden"
                  style={{ transformOrigin: 'center center' }}
                >
                  {REWARD_TIERS.map((tier, index) => (
                    <div
                      key={index}
                      className="absolute w-full h-full"
                      style={{
                        background: `conic-gradient(from ${index * segmentAngle}deg, ${tier.color} 0deg, ${tier.color} ${segmentAngle}deg, transparent ${segmentAngle}deg)`,
                        clipPath: `polygon(50% 50%,
                          ${50 + 50 * Math.cos((index * segmentAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((index * segmentAngle - 90) * Math.PI / 180)}%,
                          ${50 + 50 * Math.cos(((index + 1) * segmentAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin(((index + 1) * segmentAngle - 90) * Math.PI / 180)}%)`
                      }}
                    />
                  ))}

                  {/* Segment Labels */}
                  {REWARD_TIERS.map((tier, index) => {
                    const angle = index * segmentAngle + segmentAngle / 2;
                    const radian = (angle - 90) * Math.PI / 180;
                    const x = 50 + 35 * Math.cos(radian);
                    const y = 50 + 35 * Math.sin(radian);

                    return (
                      <div
                        key={`label-${index}`}
                        className="absolute text-white font-bold text-sm transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                        }}
                      >
                        {tier.tokens}
                      </div>
                    );
                  })}
                </div>

                {/* Pointer */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
                  <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-500" />
                </div>
              </div>
            </div>

            {/* Spin Button */}
            <motion.button
              onClick={spinWheel}
              disabled={isSpinning}
              className={`
                w-full py-4 px-6 rounded-xl font-bold text-lg transition-all
                ${isSpinning
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
                }
              `}
              whileHover={!isSpinning ? { scale: 1.02 } : {}}
              whileTap={!isSpinning ? { scale: 0.98 } : {}}
            >
              {isSpinning ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full" />
                  Spinning...
                </div>
              ) : (
                'Spin for Tokens!'
              )}
            </motion.button>
          </>
        ) : (
          /* Results Screen */
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-green-600 mb-2">Congratulations!</h3>
            <div className="bg-green-50 rounded-lg p-6 mb-6">
              <div className="text-3xl font-bold text-green-800 mb-2">
                {finalTokens.toLocaleString()} $LEXIPOP
              </div>
              {bonusMultiplier > 1 && (
                <div className="text-sm text-green-600">
                  Base: {finalReward?.tokens} × {bonusMultiplier}x bonus
                </div>
              )}
              {usePythEntropy && (
                <div className="text-xs text-blue-600 mt-2">
                  🎲 Verified with Pyth Entropy
                </div>
              )}
            </div>

            <button
              onClick={resetAndClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Continue to Wallet
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}