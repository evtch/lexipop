'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VocabularyWord } from '@/types/game';
import MiniAppButton from './MiniAppButton';

interface NFTMintModalProps {
  isVisible: boolean;
  words: VocabularyWord[];
  score: number;
  streak: number;
  onMint: () => void;
  onSkip: () => void;
  onClose: () => void;
}

export default function NFTMintModal({
  isVisible,
  words,
  score,
  streak,
  onMint,
  onSkip,
  onClose
}: NFTMintModalProps) {
  const [isMinting, setIsMinting] = useState(false);

  const handleMint = async () => {
    setIsMinting(true);
    try {
      // TODO: Implement actual NFT minting logic
      console.log('🎨 Minting NFT with words:', words.map(w => w.word));
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate minting
      onMint();
    } catch (error) {
      console.error('❌ Failed to mint NFT:', error);
    } finally {
      setIsMinting(false);
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
            className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">🏆</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Game Complete!
              </h2>
              <p className="text-gray-600">
                Score: {score}/{words.length} • Best Streak: {streak}
              </p>
            </div>

            {/* Words Display */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Words You Learned:
              </h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {words.map((word, index) => (
                  <div
                    key={word.word}
                    className="bg-blue-50 rounded-lg p-3 border border-blue-200"
                  >
                    <div className="font-semibold text-blue-800">{word.word}</div>
                    <div className="text-sm text-blue-600 mt-1">
                      {word.correctDefinition}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* NFT Preview */}
            <div className="mb-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg p-4 border border-purple-200">
              <div className="text-center">
                <div className="text-2xl mb-2">🎨</div>
                <h4 className="font-semibold text-purple-800 mb-1">
                  Mint Your Streak NFT
                </h4>
                <p className="text-sm text-purple-600">
                  Immortalize your learning journey with a unique NFT containing these words
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <MiniAppButton
                onClick={handleMint}
                variant="primary"
                size="lg"
                icon="🎨"
                disabled={isMinting}
                className="w-full"
              >
                {isMinting ? 'Minting NFT...' : 'Mint Streak NFT'}
              </MiniAppButton>

              <MiniAppButton
                onClick={onSkip}
                variant="secondary"
                size="md"
                icon="⏭️"
                className="w-full"
              >
                Skip & Continue
              </MiniAppButton>

              <MiniAppButton
                onClick={onClose}
                variant="warning"
                size="sm"
                icon="❌"
                className="w-full"
              >
                Close
              </MiniAppButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}