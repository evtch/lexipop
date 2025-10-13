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
      setError('Failed to load leaderboard');
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
      </div>

      {/* User Stats Card */}
      {isAuthenticated && user && userStats && (
        <div className="bg-white/60 rounded-lg p-3 mb-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            {user.pfpUrl && (
              <img
                src={user.pfpUrl}
                alt={user.username}
                className="w-8 h-8 rounded-full"
              />
            )}
            <div className="flex-1">
              <div className="font-medium text-gray-800 text-sm">{user.displayName}</div>
              <div className="text-xs text-gray-600">@{user.username}</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600">
                {userStats.latestScore}/{userStats.totalQuestions}
              </div>
              <div className="text-xs text-gray-600">Latest Score</div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="space-y-1">
        {error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
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
              <div
                key={entry.fid}
                className={`
                  bg-white/60 rounded-lg p-2 border
                  ${isCurrentUser
                    ? 'border-blue-400 bg-blue-50/60'
                    : 'border-blue-200'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  {/* Rank - Fixed width for consistent spacing */}
                  <div className="w-6 flex justify-center text-sm font-bold">
                    {getRankDisplay(rank)}
                  </div>

                  {/* Avatar */}
                  <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                    👤
                  </div>

                  {/* Name and Score - Flexible width */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-800 truncate text-sm">
                        {entry.username || `User ${entry.fid}`}
                        {isCurrentUser && (
                          <span className="text-xs text-blue-600 ml-1">(You)</span>
                        )}
                      </div>
                      <div className="font-bold text-blue-600 text-sm ml-2">
                        {entry.latestScore}/{entry.totalQuestions}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Call to Action */}
      {!isAuthenticated && (
        <div className="bg-white/60 rounded-lg p-4 mt-4 border border-blue-200 text-center">
          <p className="text-gray-700 mb-3 text-sm">
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
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="mt-4">
        <MiniAppButton
          href="/miniapp"
          variant="primary"
          size="lg"
          icon="🏠"
          className="w-full"
        >
          Back to Game
        </MiniAppButton>
      </div>
    </div>
  );
}