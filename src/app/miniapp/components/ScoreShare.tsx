'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import MiniAppButton from './MiniAppButton';
import { FarcasterUser } from '@/lib/hooks/useFarcasterUser';

interface ScoreShareProps {
  score: number;
  streak: number;
  totalQuestions: number;
  isVisible: boolean;
  onClose: () => void;
  user?: FarcasterUser;
}

export default function ScoreShare({
  score,
  streak,
  totalQuestions,
  isVisible,
  onClose,
  user
}: ScoreShareProps) {
  const isAuthenticated = !!user?.fid;
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const accuracy = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

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

    message += '\n\nPlay Lexipop and test your vocabulary: https://lexipop.vercel.app/miniapp';

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

      // Create a Farcaster cast
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
        throw new Error('Failed to share');
      }
    } catch (error) {
      console.error('Share error:', error);
      alert('Failed to share. Please try again!');
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