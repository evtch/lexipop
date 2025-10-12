'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MiniAppButton from './MiniAppButton';

interface TokenWheelProps {
  isVisible: boolean;
  onClaim: (amount: number) => void;
  onClose: () => void;
  onViewLeaderboard?: () => void;
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

export default function TokenWheel({ isVisible, onClaim, onClose, onViewLeaderboard }: TokenWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<number | null>(null);

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setResult(null);

    // Calculate random spin (multiple full rotations + random position)
    const spins = 5 + Math.random() * 5; // 5-10 full rotations
    const finalPosition = Math.random() * 360;
    const totalRotation = rotation + (spins * 360) + finalPosition;

    setRotation(totalRotation);

    // Calculate which segment we landed on
    const segmentAngle = 360 / WHEEL_SEGMENTS.length;
    const normalizedPosition = (360 - (finalPosition % 360)) % 360;
    const segmentIndex = Math.floor(normalizedPosition / segmentAngle);
    const wonAmount = WHEEL_SEGMENTS[segmentIndex].amount;

    // Show result after animation completes
    setTimeout(() => {
      setResult(wonAmount);
      setIsSpinning(false);
    }, 3000);
  };

  const handleClaim = () => {
    if (result) {
      onClaim(result);
    }
  };

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
            </div>

            {/* Wheel Container */}
            <div className="relative w-64 h-64 mx-auto mb-6">
              {/* Wheel */}
              <motion.div
                className="w-full h-full rounded-full border-4 border-gray-800 relative overflow-hidden"
                style={{
                  rotate: rotation,
                  transition: isSpinning ? 'rotate 3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
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
              ) : (
                <MiniAppButton
                  onClick={handleClaim}
                  variant="primary"
                  size="lg"
                  icon="💰"
                  className="w-full"
                >
                  Claim {result} Tokens
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