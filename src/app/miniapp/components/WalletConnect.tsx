'use client';

/**
 * 🔗 WALLET CONNECTION COMPONENT
 *
 * Simplified wallet connection following BitWorld's approach
 * Uses direct wagmi hooks for better Farcaster frame compatibility
 */

import React, { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Wallet, AlertCircle, CheckCircle2, Coins } from '@/components/icons';
import { useNeynar } from './NeynarProvider';
import Confetti from './Confetti';

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
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { user } = useNeynar(); // Get Neynar user for FID
  const [isClaimingTokens, setIsClaimingTokens] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

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
          tokensToClaimgame: tokensToClaimgame,
          fid: user?.fid || undefined // Include FID if user is authenticated with Neynar
        }),
      });

      const data = await response.json();

      if (data.success && data.signature) {
        setClaimSuccess(data.signature);
        setShowConfetti(true);
        onTokensClaimed?.(data.signature);
        console.log(`🎉 Successfully claimed ${tokensToClaimgame} LEXIPOP tokens!`);
        console.log(`Signature: ${data.signature}`);
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

  // Handle wallet connection (following BitWorld approach)
  const handleConnect = async () => {
    try {
      console.log('🔗 Connect button clicked');
      console.log('Available connectors:', connectors.map(c => ({ id: c.id, name: c.name })));

      // Check if we have any connectors
      if (connectors.length === 0) {
        console.error('❌ No connectors available! Wagmi config issue.');
        setClaimError('No wallet connectors available. Please check your setup.');
        return;
      }

      // For Farcaster frames, use the farcasterMiniApp connector
      const farcasterConnector = connectors.find(c => c.id === 'farcasterMiniApp' || c.name?.includes('Farcaster'));
      if (farcasterConnector) {
        console.log('🎭 Connecting with Farcaster:', farcasterConnector.id);
        await connect({ connector: farcasterConnector });
        return;
      }

      // Fallback to first available connector
      const firstConnector = connectors[0];
      if (firstConnector) {
        console.log('⚡ Using fallback connector:', firstConnector.name, firstConnector.id);
        await connect({ connector: firstConnector });
      }
    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
      setClaimError(error instanceof Error ? error.message : 'Failed to connect wallet');
    }
  };

  return (
    <div className={`wallet-connect ${className}`}>
      <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Connection/Claim Button */}
      {!isConnected ? (
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
        >
          {isConnecting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5" />
              Connect Wallet to Claim Tokens
            </>
          )}
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Connected
                </div>
                <div className="text-xs text-gray-600">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </div>
              </div>
            </div>
            <button
              onClick={() => disconnect()}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Disconnect
            </button>
          </div>

          {tokensToClaimgame > 0 && (
            <button
              onClick={handleClaimTokens}
              disabled={isClaimingTokens}
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
                  Claim {tokensToClaimgame} LEXIPOP Tokens
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Error Display */}
      {claimError && (
        <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{claimError}</p>
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

    </div>
  );
}

/**
 * Compact wallet status component for minimal UI space
 */
export function WalletStatus({ className = '' }: { className?: string }) {
  const { isConnected, address } = useAccount();

  if (!isConnected) return null;

  return (
    <div className={`flex items-center gap-2 text-xs text-gray-600 ${className}`}>
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      {address?.slice(0, 6)}...{address?.slice(-4)}
    </div>
  );
}