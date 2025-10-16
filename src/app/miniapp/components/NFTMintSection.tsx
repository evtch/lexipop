/**
 * 🎨 NFT Minting Section for Game Completion
 *
 * Allows players to mint a memory NFT with their game words
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useNFTMint } from '@/lib/nft/useNFTMint';
import MiniAppButton from './MiniAppButton';

interface NFTMintSectionProps {
  words: string[];
  score: number;
  streak: number;
  visible: boolean;
  onMintSuccess?: () => void;
}

export default function NFTMintSection({
  words,
  score,
  streak,
  visible,
  onMintSuccess
}: NFTMintSectionProps) {
  const { address, isConnected } = useAccount();
  const [showPreview, setShowPreview] = useState(false);

  const {
    previewUrl,
    isPreviewLoading,
    isMinting,
    isConfirming,
    isSuccess,
    hash,
    error,
    generatePreview,
    mintNFT,
    isSupportedNetwork,
    reset
  } = useNFTMint();

  // Generate preview when component becomes visible
  useEffect(() => {
    if (visible && words.length === 5) {
      generatePreview({ words, score, streak });
    }
  }, [visible, words, score, streak]);

  // Call onMintSuccess when NFT is successfully minted
  useEffect(() => {
    if (isSuccess && onMintSuccess) {
      onMintSuccess();
    }
  }, [isSuccess, onMintSuccess]);

  const handleMint = async () => {
    try {
      await mintNFT({ words, score, streak });
    } catch (error) {
      console.error('Failed to mint NFT:', error);
    }
  };

  const handlePreviewToggle = () => {
    setShowPreview(!showPreview);
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-4"
      >
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-3 text-white shadow-lg">
          <div className="text-center">


            {/* Minting States */}
            {!isConnected ? (
              <div className="text-sm text-purple-200">
                Connect your wallet to mint your memory NFT
              </div>
            ) : !isSupportedNetwork() ? (
              <div className="text-sm text-purple-200">
                Switch to Base network to mint NFTs
              </div>
            ) : isSuccess ? (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <div className="text-lg font-bold mb-2">🎉 NFT Minted!</div>
                <div className="text-sm text-purple-100 mb-2">
                  Your memory NFT has been created successfully
                </div>
                {hash && (
                  <a
                    href={`https://basescan.org/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-200 underline"
                  >
                    View on BaseScan
                  </a>
                )}
              </motion.div>
            ) : (
              <div className="space-y-2">
                <MiniAppButton
                  onClick={handleMint}
                  variant="primary"
                  size="md"
                  disabled={isMinting || isConfirming || isPreviewLoading}
                  className="w-full bg-white text-purple-600 hover:bg-purple-50"
                >
                  {isPreviewLoading
                    ? 'Generating Preview...'
                    : isMinting
                    ? 'Minting...'
                    : isConfirming
                    ? 'Confirming...'
                    : 'Mint Free NFT 🎨'}
                </MiniAppButton>

                <div className="text-xs text-purple-200">
                  Free to mint • Only pay gas (~$0.01)
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 text-xs text-red-200 bg-red-500/20 rounded p-2"
              >
                Failed to mint: {error.message}
              </motion.div>
            )}

            {/* Words Preview */}
            <div className="mt-3 pt-3 border-t border-purple-400">
              <div className="text-xs text-purple-200 mb-1">
                Your words:
              </div>
              <div className="text-sm font-medium">
                {words.join(' • ')}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}