'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFarcasterUser } from '@/lib/hooks/useFarcasterUser';
import Link from 'next/link';
import MiniAppButton from '../components/MiniAppButton';
import { getVersionString } from '@/lib/version';

interface LeaderboardEntry {
  rank: number;
  userFid: number;
  username: string;
  displayName?: string;
  pfpUrl?: string;
  score: number;
  submittedAt: string;
}

interface LeaderboardStats {
  totalPlayers: number;
  maxScore: number;
  weekStarting: string;
}

export default function LeaderboardPage() {
  const farcasterUser = useFarcasterUser();
  const user = farcasterUser;
  const isAuthenticated = !!farcasterUser.fid;
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardStats, setLeaderboardStats] = useState<LeaderboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      console.log('🔍 Fetching weekly leaderboard...');
      const response = await fetch('/api/leaderboard/weekly?limit=50');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Weekly leaderboard response:', data);

      if (data.success) {
        setLeaderboard(data.leaderboard || []);
        setLeaderboardStats({
          totalPlayers: data.totalPlayers || 0,
          maxScore: data.maxScore || 500,
          weekStarting: data.weekStarting || ''
        });
        console.log(`✅ Loaded ${data.leaderboard?.length || 0} weekly leaderboard entries`);
      } else {
        setError('Failed to load leaderboard');
      }
    } catch (err) {
      console.error('❌ Leaderboard fetch error:', err);
      setError('Failed to load leaderboard');
    } finally {
      setIsLoading(false);
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

      {/* Weekly Stats Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4 mb-4 text-center">
        {leaderboardStats ? (
          <>
            <div className="text-xl font-bold mb-1">
              Weekly Leaderboard
            </div>
            <div className="text-blue-100 text-sm">
              {leaderboardStats.totalPlayers} players competing
            </div>
            <div className="text-xs text-blue-200 mt-1">
              Week of {new Date(leaderboardStats.weekStarting).toLocaleDateString()}
            </div>
          </>
        ) : (
          <>
            <div className="text-lg font-bold mb-1">Loading...</div>
            <div className="text-blue-100 text-sm">Fetching weekly scores</div>
          </>
        )}
      </div>


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
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Be the First Champion!</h3>
            <p className="text-gray-600 mb-6 text-sm">
              Start playing to claim your spot on this week's leaderboard
            </p>
          </div>
        ) : (
          leaderboard.map((entry, index) => {
            const isCurrentUser = user?.fid === entry.userFid;

            return (
              <div
                key={entry.userFid}
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

                  {/* Farcaster Avatar */}
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-xs">
                    {entry.pfpUrl ? (
                      <img
                        src={entry.pfpUrl}
                        alt={entry.displayName || entry.username}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to emoji if image fails to load
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = '👤';
                        }}
                      />
                    ) : (
                      '👤'
                    )}
                  </div>

                  {/* Name and score - Simplified single line */}
                  <div className="flex-1 min-w-0 flex items-center justify-between">
                    <div className="flex flex-col min-w-0">
                      <div className="font-medium text-gray-800 truncate text-sm flex items-center gap-1">
                        {entry.displayName || entry.username}
                        {isCurrentUser && (
                          <span className="text-xs text-blue-600">(You)</span>
                        )}
                      </div>
                      {entry.displayName && entry.displayName !== entry.username && (
                        <div className="text-xs text-gray-500 truncate">
                          @{entry.username}
                        </div>
                      )}
                    </div>
                    <div className="font-bold text-blue-600 text-sm ml-2">
                      {entry.score} pts
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="mt-6 space-y-3">
        {!isAuthenticated ? (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4 text-center">
            <p className="font-medium mb-2">🎮 Ready to compete?</p>
            <p className="text-blue-100 text-sm mb-3">
              Sign in with Farcaster to track scores and earn tokens!
            </p>
            <MiniAppButton
              href="/"
              variant="secondary"
              size="md"
              icon="🚀"
              className="w-full bg-white text-blue-600 hover:bg-gray-50"
            >
              Start Your Journey
            </MiniAppButton>
          </div>
        ) : (
          <MiniAppButton
            href="/"
            variant="primary"
            size="md"
            icon="🎯"
            className="w-full"
          >
            Play Again
          </MiniAppButton>
        )}
      </div>

      {/* Version Display */}
      <div className="mt-4 text-center">
        <div className="text-xs text-gray-400">
          {getVersionString()}
        </div>
      </div>
    </div>
  );
}