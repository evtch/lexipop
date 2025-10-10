'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNeynar } from './NeynarProvider';

interface ScoreShareProps {
  score: number;
  streak: number;
  totalQuestions: number;
  isVisible: boolean;
  onClose: () => void;
}

export default function ScoreShare({
  score,
  streak,
  totalQuestions,
  isVisible,
  onClose
}: ScoreShareProps) {
  const { user, isAuthenticated } = useNeynar();
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

    message += '\n\nPlay Lexipop and test your vocabulary: https://lexipop.app/miniapp';

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
                <button
                  onClick={handleShare}
                  disabled={isSharing}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isSharing ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Sharing...
                    </>
                  ) : (
                    <>
                      🐸 Share on Farcaster
                    </>
                  )}
                </button>
              ) : (
                <div className="text-center text-sm text-gray-600 mb-3">
                  Sign in to share directly to Farcaster
                </div>
              )}

              <button
                onClick={handleCopyLink}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                📋 Copy Share Text
              </button>

              <button
                onClick={onClose}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}