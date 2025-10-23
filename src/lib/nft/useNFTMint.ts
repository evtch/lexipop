/**
 * 🎨 NFT Minting Hook for Lexipop
 *
 * React hook for minting memory NFTs on Base network
 */

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { LEXIPOP_NFT_ABI, getContractAddress } from './contract';
import { generatePreviewURL, type NFTMetadata } from './generateSVG';

export interface MintNFTParams {
  words: string[];
  score: number;
  streak: number;
}

export function useNFTMint() {
  const { address, chainId } = useAccount();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const {
    writeContract,
    data: hash,
    error: writeError,
    isPending: isWritePending
  } = useWriteContract();

  // Premium minting fee (0.0001 ETH)
  const PREMIUM_MINT_FEE = BigInt('100000000000000'); // 0.0001 ETH in wei

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError
  } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Generate a preview of the NFT before minting
   */
  const generatePreview = async (params: MintNFTParams): Promise<string> => {
    setIsPreviewLoading(true);

    try {
      const metadata: NFTMetadata = {
        words: params.words,
        score: params.score,
        streak: params.streak,
        date: new Date().toISOString().split('T')[0]
      };

      const preview = generatePreviewURL(metadata);
      setPreviewUrl(preview);
      setIsPreviewLoading(false);

      return preview;
    } catch (error) {
      console.error('Failed to generate preview:', error);
      setIsPreviewLoading(false);
      throw error;
    }
  };

  /**
   * Mint the NFT on Base network
   */
  const mintNFT = async (params: MintNFTParams) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    if (!chainId) {
      throw new Error('Chain not detected');
    }

    try {
      const contractAddress = getContractAddress(chainId);

      // Convert words array to fixed-size array for contract
      const wordsArray: [string, string, string, string, string] = [
        params.words[0] || '',
        params.words[1] || '',
        params.words[2] || '',
        params.words[3] || '',
        params.words[4] || ''
      ];

      console.log('🎨 Minting NFT:', {
        contract: contractAddress,
        words: wordsArray,
        score: params.score,
        streak: params.streak,
        player: address,
        value: PREMIUM_MINT_FEE
      });

      // Send 0.0001 ETH payment with mint
      writeContract({
        address: contractAddress as `0x${string}`,
        abi: LEXIPOP_NFT_ABI,
        functionName: 'mintMemory',
        args: [wordsArray, BigInt(params.score), BigInt(params.streak)],
        value: PREMIUM_MINT_FEE
      });

    } catch (error) {
      console.error('Failed to mint NFT:', error);
      throw error;
    }
  };

  /**
   * Check if NFT minting is supported on current network
   */
  const isSupportedNetwork = (): boolean => {
    if (!chainId) return false;

    try {
      getContractAddress(chainId);
      return true;
    } catch {
      return false;
    }
  };

  return {
    // States
    previewUrl,
    isPreviewLoading,
    isMinting: isWritePending,
    isConfirming,
    isSuccess: isConfirmed,
    hash,

    // Errors
    error: writeError || receiptError,

    // Functions
    generatePreview,
    mintNFT,
    isSupportedNetwork,

    // Utils
    reset: () => {
      setPreviewUrl(null);
      setIsPreviewLoading(false);
    }
  };
}