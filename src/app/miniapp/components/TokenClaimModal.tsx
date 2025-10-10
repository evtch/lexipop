'use client';

/**
 * 🪙 TOKEN CLAIM MODAL
 *
 * Modal component for claiming LEXI tokens after game completion
 * Integrates with spinning wheel rewards and wallet connection
 */

import React, { useState, useEffect } from 'react';
import { X, Coins, Gift, Sparkles, ExternalLink } from 'lucide-react';
import WalletConnect from './WalletConnect';
import { useWallet } from '@/lib/web3/hooks/useWallet';

interface TokenClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokensEarned: number;
  gameScore: number;
  accuracy: number;
  gameId: string;
}

export default function TokenClaimModal({
  isOpen,
  onClose,
  tokensEarned,
  gameScore,
  accuracy,
  gameId
}: TokenClaimModalProps) {
  const { isConnected } = useWallet();
  const [claimed, setClaimed] = useState(false);
  const [claimTxHash, setClaimTxHash] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setClaimed(false);
      setClaimTxHash(null);
    }
  }, [isOpen]);

  const handleTokensClaimed = (txHash: string) => {
    setClaimed(true);
    setClaimTxHash(txHash);
  };

  const handleViewTransaction = () => {
    if (claimTxHash) {
      // Open block explorer - adjust URL based on your chain
      const explorerUrl = `https://basescan.org/tx/${claimTxHash}`;
      window.open(explorerUrl, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              {claimed ? (
                <Sparkles className="w-8 h-8 text-white" />
              ) : (
                <Coins className="w-8 h-8 text-white" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {claimed ? 'Tokens Claimed!' : 'Claim Your Rewards'}
            </h2>
            <p className="text-gray-600">
              {claimed
                ? 'Your LEXI tokens have been sent to your wallet'
                : `You earned ${tokensEarned} LEXI tokens!`
              }
            </p>
          </div>
        </div>

        {/* Game Stats */}
        <div className="px-6 pb-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Gift className="w-4 h-4 text-blue-600" />
              Game Performance
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{gameScore}</div>
                <div className="text-xs text-gray-600">Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
                <div className="text-xs text-gray-600">Accuracy</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{tokensEarned}</div>
                <div className="text-xs text-gray-600">LEXI Tokens</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Connection / Claim Section */}
        <div className="px-6 pb-6">
          {!claimed ? (
            <>
              <h3 className="font-semibold text-gray-900 mb-3">Connect Wallet to Claim</h3>
              <WalletConnect
                tokensToClaimgame={tokensEarned}
                onTokensClaimed={handleTokensClaimed}
                gameId={gameId}
              />

              {!isConnected && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>New to crypto?</strong> Don&apos;t worry! You can create a wallet in seconds and start earning LEXI tokens right away.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-green-800 font-medium mb-2">
                  🎉 Success! Your {tokensEarned} LEXI tokens are on their way!
                </p>
                <p className="text-sm text-green-700">
                  Tokens should appear in your wallet within a few minutes.
                </p>
              </div>

              {claimTxHash && (
                <button
                  onClick={handleViewTransaction}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Transaction
                </button>
              )}

              <button
                onClick={onClose}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-xl transition-all duration-200"
              >
                Continue Playing
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {!claimed && (
          <div className="px-6 pb-6 text-center">
            <p className="text-xs text-gray-500">
              LEXIPOP Token • Distributed via MoneyTree • Powered by Base
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Hook to manage token claim modal state
 */
export function useTokenClaimModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [gameData, setGameData] = useState<{
    tokensEarned: number;
    gameScore: number;
    accuracy: number;
    gameId: string;
  } | null>(null);

  const openModal = (data: {
    tokensEarned: number;
    gameScore: number;
    accuracy: number;
    gameId: string;
  }) => {
    setGameData(data);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setGameData(null);
  };

  return {
    isOpen,
    gameData,
    openModal,
    closeModal
  };
}