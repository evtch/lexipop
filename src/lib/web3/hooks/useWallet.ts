/**
 * 🔗 WALLET CONNECTION HOOKS
 *
 * Custom hooks for wallet connection, balance checking, and token claiming
 */

import { useAccount, useBalance, useConnect, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useState, useEffect } from 'react';
import { tokenContracts, defaultChain } from '../config';
import { Address } from 'viem';

export interface WalletState {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  address?: Address;
  chainId?: number;

  // Balance information
  balance?: bigint;
  formattedBalance?: string;
  isLoadingBalance: boolean;

  // Connection functions
  openConnectModal?: () => void;
  disconnect: () => void;

  // Error handling
  error?: string;
}

/**
 * Main wallet hook that provides all wallet functionality
 */
export function useWallet(): WalletState {
  const { address, isConnected, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const { isLoading: isConnecting } = useConnect();

  const [error, setError] = useState<string | undefined>();

  // Get native token balance
  const {
    data: balanceData,
    isLoading: isLoadingBalance,
    error: balanceError
  } = useBalance({
    address,
  });

  // Handle balance errors
  useEffect(() => {
    if (balanceError) {
      setError('Failed to fetch wallet balance');
    } else {
      setError(undefined);
    }
  }, [balanceError]);

  // Format balance for display
  const formattedBalance = balanceData?.formatted;

  return {
    isConnected,
    isConnecting,
    address,
    chainId,
    balance: balanceData?.value,
    formattedBalance,
    isLoadingBalance,
    openConnectModal,
    disconnect,
    error
  };
}

/**
 * Hook for token contract interactions
 */
export function useTokenContract(chainId?: number) {
  const currentChainId = chainId || defaultChain.id;
  const contracts = tokenContracts[currentChainId as keyof typeof tokenContracts];

  return {
    lexipopToken: contracts?.lexipopToken,
    isSupported: !!contracts
  };
}

/**
 * Hook for checking if wallet is on supported chain
 */
export function useChainValidation() {
  const { chainId } = useAccount();
  const supportedChainIds = Object.keys(tokenContracts).map(Number);
  const isSupported = chainId ? supportedChainIds.includes(chainId) : false;

  return {
    chainId,
    isSupported,
    supportedChainIds
  };
}

/**
 * Simple connection status hook
 */
export function useWalletConnection() {
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();

  return {
    isConnected,
    address,
    connect: openConnectModal
  };
}