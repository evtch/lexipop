'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNeynar } from '../miniapp/components/NeynarProvider';
import NeynarProvider from '../miniapp/components/NeynarProvider';
import Link from 'next/link';

interface LeaderboardEntry {
  address: string;
  totalClaimed: string;
  claimedFormatted: number;
  claimedDisplay?: string;
  claimCount: number;
  rank?: number;
  username?: string;
  fid?: number;
}

interface UserStats {
  address: string;
  currentBalance: string;
  totalClaimed: string;
  claimCount: number;
  balanceFormatted: number;
  claimedFormatted: number;
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
      // Try Alchemy API for real blockchain data
      const response = await fetch('/api/leaderboard/alchemy');
      const data = await response.json();

      if (data.success) {
        setLeaderboard(data.leaderboard);
      } else {
        // Fallback to mock data if Alchemy fails
        console.warn('Alchemy failed, using mock data:', data.error);
        const mockResponse = await fetch('/api/leaderboard/mock');
        const mockData = await mockResponse.json();
        if (mockData.success) {
          setLeaderboard(mockData.leaderboard);
        } else {
          setError('Failed to load leaderboard');
        }
      }
    } catch (err) {
      setError('Failed to load leaderboard');
      console.error('Leaderboard fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserStats = async () => {
    // For now, we'll skip user stats since we need wallet address
    // Could be enhanced to map FID to wallet address
    return;
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
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-600">$LEXIPOP Leaderboard</h1>
          <p className="text-green-600 mt-2 font-medium">🎮 Players ranked by total game rewards claimed</p>
        </div>
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

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="font-bold text-2xl text-green-600">{userStats.claimedFormatted?.toFixed(2) || 0}</div>
                <div className="text-gray-600 text-sm">$LEXIPOP Claimed</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-2xl text-blue-600">{userStats.balanceFormatted?.toFixed(2) || 0}</div>
                <div className="text-gray-600 text-sm">Current Balance</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-2xl text-blue-600">{userStats.claimCount || 0}</div>
                <div className="text-gray-600 text-sm">Total Claims</div>
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
              const rank = entry.rank || index + 1;
              const isCurrentUser = false; // We'd need wallet address mapping

              return (
                <motion.div
                  key={entry.address}
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
                          {`${entry.address.slice(0, 6)}...${entry.address.slice(-4)}`}
                        </div>
                        <div className="text-gray-600">
                          {entry.claimCount} game reward{entry.claimCount !== 1 ? 's' : ''} claimed
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-2xl text-green-600">
                        {entry.claimedDisplay || entry.claimedFormatted.toLocaleString()} $LEXIPOP
                      </div>
                      <div className="text-gray-600 text-sm">
                        Total game rewards earned
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