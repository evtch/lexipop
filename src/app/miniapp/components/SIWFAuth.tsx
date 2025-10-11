'use client';

/**
 * 🔐 SIWF AUTHENTICATION COMPONENT
 *
 * Provides Sign In With Farcaster button and user profile display
 * Integrates with auth-kit for seamless authentication
 */

import React from 'react';
import { useProfile, SignInButton } from '@farcaster/auth-kit';

interface SIWFAuthProps {
  onAuthSuccess?: (profile: any) => void;
  onSignOut?: () => void;
}

export default function SIWFAuth({ onAuthSuccess, onSignOut }: SIWFAuthProps) {
  const { isAuthenticated, profile } = useProfile();

  // Notify parent component when authentication succeeds
  React.useEffect(() => {
    if (isAuthenticated && profile && onAuthSuccess) {
      onAuthSuccess(profile);
    }
  }, [isAuthenticated, profile, onAuthSuccess]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Sign In with Farcaster
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Connect your Farcaster account to play and claim tokens
          </p>
        </div>

        <div className="w-full max-w-sm">
          <SignInButton />
        </div>

        <p className="text-xs text-gray-500 text-center">
          🔐 Secure authentication via Farcaster protocol
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
          {profile.pfpUrl ? (
            <img
              src={profile.pfpUrl}
              alt={profile.displayName || profile.username}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <span className="text-xl">👤</span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-800">
          Welcome, {profile.displayName || profile.username}!
        </h3>

        <p className="text-sm text-gray-600">
          FID: {profile.fid}
        </p>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => {
            // Start playing the game
            console.log('🎮 Starting game for authenticated user:', profile);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Play Game
        </button>

        <button
          onClick={() => {
            if (onSignOut) onSignOut();
            // Note: auth-kit doesn't provide direct sign out
            // You might need to clear local storage or refresh
            window.location.reload();
          }}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

/**
 * 🎯 FEATURES:
 *
 * - Automatic Authentication: Uses SIWF for seamless sign-in
 * - Profile Display: Shows user avatar, name, and FID
 * - Event Callbacks: Notifies parent components of auth state
 * - Responsive Design: Works on mobile and desktop
 * - Game Integration: Ready to start playing after authentication
 */