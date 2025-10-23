/**
 * 🎨 NFT Minting Section for Game Completion
 *
 * Allows players to mint a memory NFT with their game words
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useConnect, useSwitchChain } from 'wagmi';
import { base } from 'wagmi/chains';
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
  const { connect, connectors } = useConnect();
  const { switchChain, isPending: isSwitchingChain, error: switchError } = useSwitchChain();
  const [showPreview, setShowPreview] = useState(false);
  const [networkSwitchError, setNetworkSwitchError] = useState<string | null>(null);

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

  // Clear network switch error when network is supported
  useEffect(() => {
    if (isSupportedNetwork()) {
      setNetworkSwitchError(null);
    }
  }, [isSupportedNetwork]);

  const handleMint = async () => {
    try {
      console.log('🎨 Starting NFT mint process...');
      await mintNFT({ words, score, streak });
    } catch (error: any) {
      console.error('❌ Failed to mint NFT:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        cause: error?.cause,
        stack: error?.stack
      });

      // Check for specific error types
      if (error?.message?.includes('fetch')) {
        console.error('🔍 Network/RPC error detected. This may be due to:');
        console.error('- RPC endpoint issues');
        console.error('- CORS restrictions on desktop');
        console.error('- Wallet provider not properly initialized');
      }
    }
  };

  const handlePreviewToggle = () => {
    setShowPreview(!showPreview);
  };

  const handleWalletConnect = async () => {
    // Filter for farcaster connector only
    const farcasterConnector = connectors.find(c =>
      c.id === 'farcasterMiniApp' || c.name?.toLowerCase().includes('farcaster')
    );

    console.log('🔗 Available connectors:', connectors.map(c => ({ name: c.name, id: c.id })));
    console.log('🎭 Farcaster connector found:', farcasterConnector ? { name: farcasterConnector.name, id: farcasterConnector.id } : 'none');

    // Try the farcaster connector if available
    if (farcasterConnector) {
      console.log('🎯 Using Farcaster connector:', farcasterConnector.name);
      try {
        const result = await connect({ connector: farcasterConnector });
        console.log('✅ Wallet connection successful:', result);
      } catch (error: any) {
        console.error('❌ Wallet connection failed:', {
          message: error?.message,
          code: error?.code,
          details: error?.details,
          connector: farcasterConnector.name
        });

        // Fallback to first available connector if farcaster fails
        if (connectors[0] && connectors[0].id !== farcasterConnector.id) {
          console.log('🔄 Trying fallback connector:', connectors[0].name);
          try {
            const result = await connect({ connector: connectors[0] });
            console.log('✅ Fallback connection successful:', result);
          } catch (fallbackError: any) {
            console.error('❌ Fallback connection also failed:', fallbackError?.message);
          }
        }
      }
    } else if (connectors[0]) {
      // No farcaster connector, use first available
      console.log('⚠️ No Farcaster connector found, using:', connectors[0].name);
      try {
        const result = await connect({ connector: connectors[0] });
        console.log('✅ Connection successful:', result);
      } catch (error: any) {
        console.error('❌ Connection failed:', error?.message);
      }
    } else {
      console.error('❌ No connectors available');
    }
  };

  const handleNetworkSwitch = async () => {
    try {
      setNetworkSwitchError(null);
      console.log('🔄 Switching to Base network...');
      await switchChain({ chainId: base.id });
    } catch (error) {
      console.error('❌ Failed to switch network:', error);
      setNetworkSwitchError('Failed to switch network. Please try manually switching to Base network in your wallet.');
    }
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
              <div className="space-y-2">
                <div className="text-sm text-purple-200 text-center mb-2">
                  Connect your wallet
                </div>
                <MiniAppButton
                  onClick={handleWalletConnect}
                  variant="primary"
                  size="md"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 border-0"
                >
                  Connect Wallet
                </MiniAppButton>
              </div>
            ) : !isSupportedNetwork() ? (
              <div className="space-y-2">
                <div className="text-sm text-purple-200 text-center mb-2">
                  Switch to Base network to mint NFTs
                </div>
                <MiniAppButton
                  onClick={handleNetworkSwitch}
                  variant="primary"
                  size="md"
                  disabled={isSwitchingChain}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 border-0"
                >
                  {isSwitchingChain ? 'Switching...' : 'Switch to Base Network'}
                </MiniAppButton>

                {/* Network Switch Error */}
                {(networkSwitchError || switchError) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 text-xs text-red-200 bg-red-500/20 rounded p-2"
                  >
                    {networkSwitchError || switchError?.message}
                  </motion.div>
                )}
              </div>
            ) : isSuccess ? (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <div className="text-lg font-bold mb-2">🎉 NFT Minted!</div>
                <div className="text-sm text-purple-100 mb-2">
                  Your Words NFT has been minted
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
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 border-0 font-semibold"
                >
                  {isPreviewLoading
                    ? 'Generating Preview...'
                    : isMinting
                    ? 'Minting...'
                    : isConfirming
                    ? 'Confirming...'
                    : 'Mint Your Words'}
                </MiniAppButton>

                <div className="text-xs text-purple-200">
                  Just 0.0001 ETH plus gas • Unlocks 2x rewards
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
              <div className="text-xs font-medium">
                {words.join(' • ')}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}