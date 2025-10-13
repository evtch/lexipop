'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import MiniAppButton from './MiniAppButton';
import { FarcasterUser } from '@/lib/hooks/useFarcasterUser';
import { sdk } from '@farcaster/miniapp-sdk';

interface ScoreShareProps {
  score: number;
  streak: number;
  totalQuestions: number;
  isVisible: boolean;
  onClose: () => void;
  user?: FarcasterUser;
  completedWords?: Array<{word: string, correctDefinition: string}>;
}

export default function ScoreShare({
  score,
  streak,
  totalQuestions,
  isVisible,
  onClose,
  user,
  completedWords = []
}: ScoreShareProps) {
  const isAuthenticated = !!user?.fid;
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const accuracy = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  const generateScoreSVG = () => {
    const words = completedWords.slice(0, 5).map(w => w.word);
    const width = 600;
    const height = 400;

    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>

        <!-- Background -->
        <rect width="100%" height="100%" fill="url(#bgGrad)"/>

        <!-- Title -->
        <text x="300" y="60" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle">
          Lexipop Score: ${score}/${totalQuestions}
        </text>

        <!-- Accuracy -->
        <text x="300" y="100" font-family="Arial, sans-serif" font-size="18" fill="white" text-anchor="middle">
          ${accuracy}% Accuracy ${streak > 1 ? `• ${streak} Streak` : ''}
        </text>

        <!-- Words learned -->
        <text x="300" y="140" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="white" text-anchor="middle">
          Words I learned:
        </text>

        ${words.map((word, index) => `
          <rect x="50" y="${170 + index * 35}" width="500" height="30" fill="rgba(255,255,255,0.2)" rx="15"/>
          <text x="300" y="${190 + index * 35}" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle">
            ${word.toUpperCase()}
          </text>
        `).join('')}

        <!-- Footer -->
        <text x="300" y="370" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle">
          Play at www.lexipop.xyz 🎈
        </text>
      </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  const generateShareText = () => {
    const emojis = ['🔥', '🎯', '🧠', '⭐', '💯'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];

    let message = `${emoji} Just scored ${score}/${totalQuestions} on Lexipop!`;

    if (streak > 1) {
      message += ` ${streak} correct answers in a row! 🔥`;
    }

    if (accuracy === 100) {
      message += ' Perfect score! 💯';
    } else if (accuracy >= 80) {
      message += ' Almost perfect! ⭐';
    }

    message += '\n\nPlay Lexipop and test your vocabulary: https://www.lexipop.xyz/miniapp';

    return message;
  };

  const handleShare = async () => {
    if (!isAuthenticated || !user) {
      alert('Please sign in to share your score!');
      return;
    }

    setIsSharing(true);

    try {
      const shareText = generateShareText();
      const miniappUrl = window.location.origin + '/miniapp';

      // Generate SVG embed if we have words
      // Farcaster SDK only allows 0-2 embeds, so we need to be explicit about the types
      let embeds: [] | [string] | [string, string];
      if (completedWords.length > 0) {
        // Create a data URL for the SVG and add it as an embed
        const svgDataUrl = generateScoreSVG();
        embeds = [svgDataUrl, miniappUrl];
      } else {
        embeds = [miniappUrl];
      }

      // Use Farcaster miniapp SDK for native cast creation
      const result = await sdk.actions.composeCast({
        text: shareText,
        embeds: embeds
      });

      if (result?.cast) {
        setShareSuccess(true);
        setTimeout(() => {
          setShareSuccess(false);
          onClose();
        }, 2000);
      } else {
        throw new Error('Cast creation was cancelled');
      }
    } catch (error) {
      console.error('Share error:', error);
      // Fallback to server-side cast creation
      try {
        const shareText = generateShareText();
        const response = await fetch('/api/farcaster/cast', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: shareText,
            fid: user.fid
          }),
        });

        if (response.ok) {
          setShareSuccess(true);
          setTimeout(() => {
            setShareSuccess(false);
            onClose();
          }, 2000);
        } else {
          throw new Error('Failed to share via fallback');
        }
      } catch (fallbackError) {
        console.error('Fallback share error:', fallbackError);
        alert('Failed to share. Please try again!');
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = () => {
    const shareText = generateShareText();
    navigator.clipboard.writeText(shareText).then(() => {
      alert('Share text copied to clipboard!');
    });
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl p-6 max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {shareSuccess ? (
          <div className="text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-green-600 mb-2">Shared!</h3>
            <p className="text-gray-600">Your score has been shared to Farcaster</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Share Your Score!</h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {score}/{totalQuestions}
                </div>
                <div className="text-sm text-gray-600">
                  {accuracy}% accuracy
                  {streak > 1 && ` • ${streak} streak`}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {isAuthenticated ? (
                <MiniAppButton
                  onClick={handleShare}
                  disabled={isSharing}
                  variant="success"
                  size="md"
                  icon={isSharing ? "⏳" : "🐸"}
                >
                  {isSharing ? "Sharing..." : "Share on Farcaster"}
                </MiniAppButton>
              ) : (
                <div className="text-center text-sm text-gray-600 mb-3">
                  Sign in to share directly to Farcaster
                </div>
              )}

              <MiniAppButton
                onClick={handleCopyLink}
                variant="primary"
                size="md"
                icon="📋"
              >
                Copy Share Text
              </MiniAppButton>

              <MiniAppButton
                onClick={onClose}
                variant="secondary"
                size="md"
                icon="✕"
              >
                Close
              </MiniAppButton>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}