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
  const [error, setError] = useState<string | undefined>();
  const [isContextAvailable, setIsContextAvailable] = useState(true);

  // Call all hooks unconditionally - this is critical for React rules
  const account = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const { isPending: isConnecting } = useConnect();
  const {
    data: balanceData,
    isLoading: isLoadingBalance,
    error: balanceError
  } = useBalance({
    address: account.address,
  });

  // Check if we're in a valid context by examining the account object
  useEffect(() => {
    // If account is undefined/null but we expected it to work, context might be missing
    if (account === undefined) {
      setIsContextAvailable(false);
    } else {
      setIsContextAvailable(true);
    }
  }, [account]);

  // Handle balance errors
  useEffect(() => {
    if (balanceError) {
      setError('Failed to fetch wallet balance');
    } else {
      setError(undefined);
    }
  }, [balanceError]);

  // If context is not available, return safe defaults
  if (!isContextAvailable) {
    return {
      isConnected: false,
      isConnecting: false,
      address: undefined,
      chainId: undefined,
      balance: undefined,
      formattedBalance: undefined,
      isLoadingBalance: false,
      openConnectModal: undefined,
      disconnect: () => {},
      error: 'Wallet provider not available'
    };
  }

  return {
    isConnected: account.isConnected,
    isConnecting,
    address: account.address,
    chainId: account.chainId,
    balance: balanceData?.value,
    formattedBalance: balanceData?.formatted,
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
    moneyTree: contracts?.moneyTree,
    isSupported: !!contracts
  };
}

/**
 * Hook for checking if wallet is on supported chain
 */
export function useChainValidation() {
  const account = useAccount();
  const supportedChainIds = Object.keys(tokenContracts).map(Number);
  const isSupported = account.chainId ? supportedChainIds.includes(account.chainId) : false;

  return {
    chainId: account.chainId,
    isSupported,
    supportedChainIds
  };
}

/**
 * Simple connection status hook
 */
export function useWalletConnection() {
  const account = useAccount();
  const { openConnectModal } = useConnectModal();

  return {
    isConnected: account.isConnected,
    address: account.address,
    connect: openConnectModal
  };
}