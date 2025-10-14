'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFarcasterUser } from '@/lib/hooks/useFarcasterUser';
import Link from 'next/link';
import MiniAppButton from '../components/MiniAppButton';

interface LeaderboardEntry {
  rank: number;
  address: string;
  addressDisplay: string;
  fid?: number;
  username?: string;
  totalClaimed: number;
  claimCount: number;
  verified: boolean;
}

interface UserStats {
  latestScore: number;
  totalQuestions: number;
  accuracy: number;
}

interface LeaderboardStats {
  totalPlayers: number;
  totalTokensClaimed: number;
}

export default function LeaderboardPage() {
  const farcasterUser = useFarcasterUser();
  const user = farcasterUser;
  const isAuthenticated = !!farcasterUser.fid;
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [leaderboardStats, setLeaderboardStats] = useState<LeaderboardStats | null>(null);
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
      console.log('🔍 Fetching onchain leaderboard...');
      // Try onchain API first
      const response = await fetch('/api/leaderboard/onchain?limit=20');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Onchain leaderboard response:', data);

      if (data.success) {
        setLeaderboard(data.leaderboard || []);

        // Set stats if available
        if (data.stats) {
          setLeaderboardStats({
            totalPlayers: data.stats.totalPlayers || 0,
            totalTokensClaimed: data.stats.totalTokensClaimed || 0
          });
        }

        console.log(`✅ Loaded ${data.leaderboard?.length || 0} onchain leaderboard entries`);
      } else {
        console.error('❌ Onchain API returned success: false, trying fallback', data);

        // Fallback to game score API if onchain fails
        const fallbackResponse = await fetch('/api/game/score?type=leaderboard');
        const fallbackData = await fallbackResponse.json();

        if (fallbackData.success) {
          // Transform game score data to leaderboard format
          const transformedData = fallbackData.leaderboard.map((entry: any, index: number) => ({
            rank: index + 1,
            address: `user_${entry.fid}`,
            addressDisplay: entry.username || `User ${entry.fid}`,
            fid: entry.fid,
            username: entry.username,
            totalClaimed: entry.totalTokensEarned || 0,
            claimCount: entry.totalGames || 0,
            verified: false
          }));
          setLeaderboard(transformedData);
        } else {
          setError('Failed to load leaderboard');
        }
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
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold">🏆 Leaderboard</h1>
      </div>

      {/* Total Stats Banner */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-4 mb-4 text-center">
        {leaderboardStats ? (
          <>
            <div className="text-xl font-bold mb-1">
              {leaderboardStats.totalTokensClaimed.toLocaleString('en-US', { maximumFractionDigits: 0 })} $LEXIPOP
            </div>
            <div className="text-green-100 text-sm">
              Claimed by {leaderboardStats.totalPlayers} players
            </div>
          </>
        ) : (
          <>
            <div className="text-lg font-bold mb-1">Loading...</div>
            <div className="text-green-100 text-sm">Fetching onchain data</div>
          </>
        )}
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
              href="/"
              variant="primary"
              size="md"
              icon="🎮"
            >
              Play First Game
            </MiniAppButton>
          </div>
        ) : (
          leaderboard.map((entry, index) => {
            const isCurrentUser = user?.fid === entry.fid;

            return (
              <div
                key={entry.address}
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
                    {getRankDisplay(entry.rank)}
                  </div>

                  {/* Avatar */}
                  <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                    👤
                  </div>

                  {/* Name and tokens - Flexible width */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="font-medium text-gray-800 truncate text-sm flex items-center gap-1">
                          {entry.username || entry.addressDisplay}
                          {entry.verified && (
                            <span className="text-xs bg-green-100 text-green-700 px-1 py-0.5 rounded">
                              ✓
                            </span>
                          )}
                          {isCurrentUser && (
                            <span className="text-xs text-blue-600">(You)</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600">
                          {entry.claimCount} claim{entry.claimCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600 text-sm">
                          {entry.totalClaimed.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600">$LEXIPOP</div>
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
            href="/"
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
          href="/"
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