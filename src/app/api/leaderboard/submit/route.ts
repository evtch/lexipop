import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * SIMPLE LEADERBOARD SUBMISSION
 *
 * Submit a weekly score for the leaderboard
 * Only keeps the best score per user per week
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userFid, username, score } = body;

    // Validate input
    if (!userFid || typeof userFid !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Valid userFid is required' },
        { status: 400 }
      );
    }

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Username is required' },
        { status: 400 }
      );
    }

    if (typeof score !== 'number' || score < 0 || score > 500) {
      return NextResponse.json(
        { success: false, error: 'Score must be between 0 and 500' },
        { status: 400 }
      );
    }

    // Get current week's Monday at 00:00:00
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStarting = new Date(now);
    weekStarting.setDate(now.getDate() - daysToMonday);
    weekStarting.setHours(0, 0, 0, 0);

    console.log(`📊 Submitting score: FID ${userFid} (${username}) - ${score} pts for week ${weekStarting.toISOString()}`);

    // Upsert score - only update if new score is better
    const result = await prisma.leaderboardScore.upsert({
      where: {
        userFid_weekStarting: {
          userFid,
          weekStarting
        }
      },
      update: {
        // Only update if new score is better
        score: {
          max: score // This will take the maximum of current score and new score
        },
        username, // Update username in case it changed
        updatedAt: new Date()
      },
      create: {
        userFid,
        username,
        score,
        weekStarting
      }
    });

    // Check if this was a new best score
    const isNewBest = result.score === score;

    // Get user's current rank
    const betterScores = await prisma.leaderboardScore.count({
      where: {
        weekStarting,
        score: {
          gt: result.score
        }
      }
    });
    const rank = betterScores + 1;

    console.log(`✅ Score submitted: ${isNewBest ? 'NEW BEST' : 'kept existing'} - Rank ${rank}`);

    return NextResponse.json({
      success: true,
      score: result.score,
      rank,
      isNewBest,
      weekStarting: weekStarting.toISOString(),
      message: isNewBest ? 'New best score recorded!' : 'Score submitted (existing score was better)'
    });

  } catch (error) {
    console.error('❌ Score submission error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit score',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}