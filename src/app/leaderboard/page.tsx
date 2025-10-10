'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNeynar } from '../miniapp/components/NeynarProvider';
import NeynarProvider from '../miniapp/components/NeynarProvider';
import Link from 'next/link';

interface LeaderboardEntry {
  fid: number;
  username?: string;
  highestScore: number;
  bestStreak: number;
  totalGames: number;
}

interface UserStats {
  totalGames: number;
  highestScore: number;
  bestStreak: number;
  averageScore: number;
  totalQuestionsAnswered: number;
}

function LeaderboardPageContent() {
  const { user, isAuthenticated } = useNeynar();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
    if (isAuthenticated && user) {
      fetchUserStats();
    }
  }, [isAuthenticated, user]);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/game/score?type=leaderboard');
      const data = await response.json();

      if (data.success) {
        setLeaderboard(data.leaderboard);
      } else {
        setError('Failed to load leaderboard');
      }
    } catch (err) {
      setError('Failed to load leaderboard');
      console.error('Leaderboard fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserStats = async () => {
    if (!user?.fid) return;

    try {
      const response = await fetch(`/api/game/score?fid=${user.fid}`);
      const data = await response.json();

      if (data.success) {
        setUserStats(data.stats);
      }
    } catch (err) {
      console.error('User stats fetch error:', err);
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-600';
      case 2: return 'text-gray-500';
      case 3: return 'text-orange-600';
      default: return 'text-blue-600';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '👑';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
        >
          ← Back to Game
        </Link>
        <h1 className="text-4xl font-bold text-blue-600 text-center">Leaderboard</h1>
        <div className="w-32"></div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* User Stats Card */}
        {isAuthenticated && user && userStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/60 rounded-xl p-6 mb-8 border border-blue-200"
          >
            <div className="flex items-center gap-4 mb-4">
              {user.pfpUrl && (
                <img
                  src={user.pfpUrl}
                  alt={user.username}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <div className="font-bold text-xl text-gray-800">{user.displayName}</div>
                <div className="text-gray-600">@{user.username}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="font-bold text-2xl text-blue-600">{userStats.highestScore}</div>
                <div className="text-gray-600 text-sm">Best Score</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-2xl text-blue-600">{userStats.bestStreak}</div>
                <div className="text-gray-600 text-sm">Best Streak</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-2xl text-blue-600">{userStats.totalGames}</div>
                <div className="text-gray-600 text-sm">Games Played</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-2xl text-blue-600">{userStats.averageScore}</div>
                <div className="text-gray-600 text-sm">Avg Score</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Leaderboard */}
        <div className="space-y-4">
          {error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4 text-lg">{error}</p>
              <button
                onClick={fetchLeaderboard}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4 text-lg">No scores yet!</p>
              <Link
                href="/"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors inline-block"
              >
                Play First Game
              </Link>
            </div>
          ) : (
            leaderboard.map((entry, index) => {
              const rank = index + 1;
              const isCurrentUser = user?.fid === entry.fid;

              return (
                <motion.div
                  key={entry.fid}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    bg-white/60 rounded-xl p-6 border transition-all
                    ${isCurrentUser
                      ? 'border-blue-400 bg-blue-50/60 shadow-lg'
                      : 'border-blue-200 hover:border-blue-300 hover:shadow-md'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`text-2xl font-bold ${getRankColor(rank)}`}>
                        {getRankIcon(rank)}
                      </div>
                      <div>
                        <div className="font-bold text-lg">
                          {entry.username || `User ${entry.fid}`}
                          {isCurrentUser && (
                            <span className="text-sm text-blue-600 ml-2">(You)</span>
                          )}
                        </div>
                        <div className="text-gray-600">
                          {entry.totalGames} game{entry.totalGames !== 1 ? 's' : ''} played
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-2xl text-blue-600">
                        {entry.highestScore}
                      </div>
                      <div className="text-gray-600">
                        Best: {entry.bestStreak} streak
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Call to Action */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/60 rounded-xl p-8 mt-8 border border-blue-200 text-center"
          >
            <p className="text-gray-700 mb-4 text-lg">
              Sign in with Farcaster to track your scores and compete!
            </p>
            <Link
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-colors inline-block font-semibold"
            >
              Start Playing
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <NeynarProvider>
      <LeaderboardPageContent />
    </NeynarProvider>
  );
}