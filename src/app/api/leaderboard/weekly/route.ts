import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * SIMPLE WEEKLY LEADERBOARD
 *
 * Get the current week's leaderboard
 * Simple and fast with minimal data
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    // Get current week's Monday at 00:00:00
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStarting = new Date(now);
    weekStarting.setDate(now.getDate() - daysToMonday);
    weekStarting.setHours(0, 0, 0, 0);

    console.log(`📊 Fetching weekly leaderboard for week starting ${weekStarting.toISOString()}`);

    // Get leaderboard data - simple query
    const leaderboardData = await prisma.leaderboardScore.findMany({
      where: {
        weekStarting
      },
      orderBy: [
        { score: 'desc' },
        { createdAt: 'asc' } // Earlier submission wins ties
      ],
      take: limit,
      select: {
        userFid: true,
        username: true,
        score: true,
        createdAt: true
      }
    });

    // Add ranks and format response
    const leaderboard = leaderboardData.map((entry, index) => ({
      rank: index + 1,
      userFid: entry.userFid,
      username: entry.username,
      score: entry.score,
      submittedAt: entry.createdAt
    }));

    // Get total stats
    const totalPlayers = await prisma.leaderboardScore.count({
      where: { weekStarting }
    });

    console.log(`✅ Fetched ${leaderboard.length} leaderboard entries (${totalPlayers} total players)`);

    return NextResponse.json({
      success: true,
      leaderboard,
      weekStarting: weekStarting.toISOString(),
      totalPlayers,
      maxScore: 500,
      message: `Weekly leaderboard for ${weekStarting.toDateString()}`
    });

  } catch (error) {
    console.error('❌ Leaderboard fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch leaderboard',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}