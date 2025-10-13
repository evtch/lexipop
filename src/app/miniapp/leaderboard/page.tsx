'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFarcasterUser } from '@/lib/hooks/useFarcasterUser';
import Link from 'next/link';
import MiniAppButton from '../components/MiniAppButton';

interface LeaderboardEntry {
  fid: number;
  username?: string;
  latestScore: number;
  totalQuestions: number;
  gameId: string;
  timestamp: string;
  highestScore: number;
  longestStreak: number;
  totalGames: number;
  bestAccuracy: number;
}

interface UserStats {
  latestScore: number;
  totalQuestions: number;
  accuracy: number;
}

export default function LeaderboardPage() {
  const farcasterUser = useFarcasterUser();
  const user = farcasterUser;
  const isAuthenticated = !!farcasterUser.fid;
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
      console.log('🔍 Fetching leaderboard...');
      const response = await fetch('/api/game/score?type=leaderboard');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Leaderboard response:', data);

      if (data.success) {
        setLeaderboard(data.leaderboard || []);
        console.log(`✅ Loaded ${data.leaderboard?.length || 0} leaderboard entries`);
      } else {
        console.error('❌ API returned success: false', data);
        setError(data.error || 'Failed to load leaderboard');
      }
    } catch (err) {
      console.error('❌ Leaderboard fetch error:', err);

      // Create sample data for testing if API fails
      const sampleLeaderboard: LeaderboardEntry[] = [
        {
          fid: 12345,
          username: 'TestUser1',
          latestScore: 5,
          totalQuestions: 5,
          gameId: 'test_game_1',
          timestamp: new Date().toISOString(),
          highestScore: 5,
          longestStreak: 3,
          totalGames: 5,
          bestAccuracy: 100.0,
        },
        {
          fid: 67890,
          username: 'TestUser2',
          latestScore: 4,
          totalQuestions: 5,
          gameId: 'test_game_2',
          timestamp: new Date().toISOString(),
          highestScore: 4,
          longestStreak: 2,
          totalGames: 3,
          bestAccuracy: 80.0,
        },
      ];

      console.log('🧪 Using sample data for testing');
      setLeaderboard(sampleLeaderboard);

      // Still set error but show sample data
      setError('Using test data (API unavailable)');
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

  const getRankDisplay = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return rank.toString();
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 text-gray-800">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">🏆 Leaderboard</h1>
        {error && leaderboard.length > 0 && (
          <div className="mt-2 text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full inline-block">
            📊 Showing test data
          </div>
        )}
      </div>

      {/* User Stats Card */}
      {isAuthenticated && user && userStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/60 rounded-lg p-4 mb-6 border border-blue-200"
        >
          <div className="flex items-center gap-3 mb-3">
            {user.pfpUrl && (
              <img
                src={user.pfpUrl}
                alt={user.username}
                className="w-10 h-10 rounded-full"
              />
            )}
            <div>
              <div className="font-semibold text-gray-800">{user.displayName}</div>
              <div className="text-sm text-gray-600">@{user.username}</div>
            </div>
          </div>

          <div className="text-center bg-blue-50 rounded-lg p-4">
            <div className="text-3xl font-bold text-blue-600">
              {userStats.latestScore}/{userStats.totalQuestions}
            </div>
            <div className="text-lg text-blue-700 font-semibold">
              {userStats.latestScore === userStats.totalQuestions ? "Perfect!" : "Good try!"}
            </div>
            <div className="text-sm text-gray-600 mt-1">Latest Game Score</div>
          </div>
        </motion.div>
      )}

      {/* Leaderboard */}
      <div className="space-y-3">
        {error && leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-2">{error}</p>
            <p className="text-gray-600 mb-4 text-sm">
              The leaderboard API might be unavailable. Check console for details.
            </p>
            <MiniAppButton
              onClick={fetchLeaderboard}
              variant="primary"
              size="md"
              icon="🔄"
            >
              Try Again
            </MiniAppButton>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No scores yet!</p>
            <MiniAppButton
              href="/miniapp"
              variant="primary"
              size="md"
              icon="🎮"
            >
              Play First Game
            </MiniAppButton>
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
                  bg-white/60 rounded-lg p-3 border transition-all
                  ${isCurrentUser
                    ? 'border-blue-400 bg-blue-50/60'
                    : 'border-blue-200 hover:border-blue-300'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  {/* Rank - Fixed width for consistent spacing */}
                  <div className="w-8 flex justify-center text-lg font-bold">
                    {getRankDisplay(rank)}
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                    👤
                  </div>

                  {/* Name and Username - Flexible width */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 truncate">
                      {entry.username || `User ${entry.fid}`}
                      {isCurrentUser && (
                        <span className="text-xs text-blue-600 ml-1">(You)</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      @{entry.username || `user${entry.fid}`}
                    </div>
                  </div>

                  {/* Score - Fixed width */}
                  <div className="text-right min-w-[60px]">
                    <div className="font-bold text-lg text-blue-600">
                      {entry.latestScore}
                    </div>
                    <div className="text-xs text-gray-500">
                      /{entry.totalQuestions}
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
          className="bg-white/60 rounded-lg p-6 mt-6 border border-blue-200 text-center"
        >
          <p className="text-gray-700 mb-4">
            Sign in with Farcaster to track your scores and compete!
          </p>
          <MiniAppButton
            href="/miniapp"
            variant="primary"
            size="lg"
            icon="🎮"
          >
            Start Playing
          </MiniAppButton>
        </motion.div>
      )}

      {/* Bottom Navigation */}
      <div className="mt-8 space-y-3">
        <MiniAppButton
          href="/miniapp"
          variant="primary"
          size="lg"
          icon="🏠"
        >
          Back to Game
        </MiniAppButton>
      </div>
    </div>
  );
}