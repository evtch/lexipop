'use client';

/**
 * 🔗 WALLET CONNECTION COMPONENT
 *
 * Provides wallet connection UI and token claiming functionality
 */

import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWallet, useChainValidation } from '@/lib/web3/hooks/useWallet';
import { Wallet, AlertCircle, CheckCircle2, Coins } from 'lucide-react';

interface WalletConnectProps {
  tokensToClaimgame?: number;
  onTokensClaimed?: (txHash: string) => void;
  gameId?: string;
  className?: string;
}

export default function WalletConnect({
  tokensToClaimgame = 0,
  onTokensClaimed,
  gameId,
  className = ''
}: WalletConnectProps) {
  const { isConnected, address, formattedBalance, isLoadingBalance, error } = useWallet();
  const { isSupported } = useChainValidation();
  const [isClaimingTokens, setIsClaimingTokens] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);

  // Handle token claiming through API
  const handleClaimTokens = async () => {
    if (!isConnected || !address || tokensToClaimgame <= 0) return;

    setIsClaimingTokens(true);
    setClaimError(null);
    setClaimSuccess(null);

    try {
      // Call our token claim API
      const response = await fetch('/api/tokens/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId: gameId || `claim_${Date.now()}`,
          userAddress: address,
          tokensToClaimgame: tokensToClaimgame
        }),
      });

      const data = await response.json();

      if (data.success && data.transactionHash) {
        setClaimSuccess(data.transactionHash);
        onTokensClaimed?.(data.transactionHash);
        console.log(`🎉 Successfully claimed ${tokensToClaimgame} LEXI tokens!`);
        console.log(`Transaction: ${data.transactionHash}`);
      } else {
        throw new Error(data.error || 'Claim failed');
      }

    } catch (error) {
      console.error('❌ Token claim failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to claim tokens. Please try again.';
      setClaimError(errorMessage);
    } finally {
      setIsClaimingTokens(false);
    }
  };

  // Custom wallet connect button for mobile-optimized UI
  const CustomConnectButton = () => (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
                  >
                    <Wallet className="w-5 h-5" />
                    Connect Wallet to Claim Tokens
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                  >
                    <AlertCircle className="w-5 h-5" />
                    Wrong Network
                  </button>
                );
              }

              return (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <Wallet className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {account.displayName}
                        </div>
                        <div className="text-xs text-gray-600">
                          {formattedBalance ? `${parseFloat(formattedBalance).toFixed(4)} ETH` : 'Loading...'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={openAccountModal}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Manage
                    </button>
                  </div>

                  {tokensToClaimgame > 0 && (
                    <button
                      onClick={handleClaimTokens}
                      disabled={isClaimingTokens || !isSupported}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
                    >
                      {isClaimingTokens ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          Claiming...
                        </>
                      ) : (
                        <>
                          <Coins className="w-5 h-5" />
                          Claim {tokensToClaimgame} LEXI Tokens
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );

  return (
    <div className={`wallet-connect ${className}`}>
      <CustomConnectButton />

      {/* Error Display */}
      {(error || claimError) && (
        <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error || claimError}</p>
        </div>
      )}

      {/* Success Display */}
      {claimSuccess && (
        <div className="mt-3 p-3 bg-green-100 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
          <div className="text-sm text-green-700">
            <p className="font-medium">Tokens claimed successfully!</p>
            <p className="text-xs mt-1 opacity-75">TX: {claimSuccess.slice(0, 10)}...{claimSuccess.slice(-8)}</p>
          </div>
        </div>
      )}

      {/* Chain Support Warning */}
      {isConnected && !isSupported && (
        <div className="mt-3 p-3 bg-yellow-100 border border-yellow-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-700">
            Please switch to a supported network to claim tokens.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Compact wallet status component for minimal UI space
 */
export function WalletStatus({ className = '' }: { className?: string }) {
  const { isConnected, address } = useWallet();

  if (!isConnected) return null;

  return (
    <div className={`flex items-center gap-2 text-xs text-gray-600 ${className}`}>
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      {address?.slice(0, 6)}...{address?.slice(-4)}
    </div>
  );
}