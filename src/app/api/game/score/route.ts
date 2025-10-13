import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * 🔒 SECURE GAME SCORE API WITH PRISMA
 *
 * POST /api/game/score - Submit a score
 * GET /api/game/score?fid=123 - Get user's scores
 * GET /api/game/score?type=leaderboard - Get top 100 leaderboard
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fid, score, streak, totalQuestions, gameId, frameMessage } = body;

    // Validate input
    if (!fid || typeof fid !== 'number' || fid <= 0) {
      return NextResponse.json(
        { error: 'Valid FID is required' },
        { status: 400 }
      );
    }

    if (typeof score !== 'number' || score < 0 || score > 100) {
      return NextResponse.json(
        { error: 'Invalid score range' },
        { status: 400 }
      );
    }

    if (typeof streak !== 'number' || streak < 0 || streak > 100) {
      return NextResponse.json(
        { error: 'Invalid streak range' },
        { status: 400 }
      );
    }

    if (typeof totalQuestions !== 'number' || totalQuestions <= 0 || totalQuestions > 100) {
      return NextResponse.json(
        { error: 'Invalid total questions' },
        { status: 400 }
      );
    }

    const gameIdFinal = gameId || `game_${Date.now()}_${fid}`;
    const accuracy = (score / totalQuestions) * 100;
    const now = new Date();

    // Simple: Just store/update the highest score for this user
    await prisma.$executeRaw`
      INSERT INTO user_stats ("userFid", "highestScore", "totalTokensEarned", "updatedAt")
      VALUES (${fid}, ${score}, 0, NOW())
      ON CONFLICT ("userFid")
      DO UPDATE SET
        "highestScore" = GREATEST(user_stats."highestScore", ${score}),
        "updatedAt" = NOW()
    `;

    console.log(`✅ Score recorded: FID ${fid}, Score ${score}, Streak ${streak}`);

    return NextResponse.json({
      success: true,
      scoreId: gameIdFinal,
      message: 'Score recorded successfully'
    });

  } catch (error) {
    console.error('❌ Score submission error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to record score',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  console.log('🎯 Game score API called');
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get('fid');
  const type = searchParams.get('type') || 'user';
  console.log('📝 Score API params:', { fid, type });

  try {
    if (type === 'leaderboard') {
      console.log('📊 Fetching simple leaderboard...');

      // Super simple: just get FID and total tokens earned
      const leaderboardData = await prisma.$queryRaw<Array<{
        userFid: number;
        totalTokensEarned: number;
        highestScore: number;
      }>>`
        SELECT "userFid", "totalTokensEarned", "highestScore"
        FROM user_stats
        WHERE "totalTokensEarned" > 0
        ORDER BY "totalTokensEarned" DESC, "highestScore" DESC
        LIMIT 100
      `;

      console.log(`📊 Found ${leaderboardData.length} players`);

      // Fetch usernames for all players in parallel (only if Neynar API key is available)
      const hasNeynarKey = !!process.env.NEYNAR_API_KEY;
      const leaderboardWithUsernames = await Promise.all(
        leaderboardData.map(async (player) => {
          let username = undefined;

          if (hasNeynarKey) {
            try {
              const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3004'}/api/neynar/user?fid=${player.userFid}`);
              if (response.ok) {
                const userData = await response.json();
                username = userData.user?.username;
              }
            } catch (error) {
              console.log(`Could not fetch username for FID ${player.userFid} (Neynar API unavailable)`);
            }
          }

          return {
            fid: player.userFid,
            username: username || `User ${player.userFid}`,
            totalTokensEarned: player.totalTokensEarned,
            highestScore: player.highestScore,
            bestStreak: 0, // Not tracking for now
            totalGames: 1, // Not tracking for now
          };
        })
      );

      return NextResponse.json({
        success: true,
        leaderboard: leaderboardWithUsernames
      });
    }

    if (!fid) {
      return NextResponse.json(
        { error: 'FID parameter is required for user scores' },
        { status: 400 }
      );
    }

    const fidNumber = parseInt(fid, 10);
    if (isNaN(fidNumber) || fidNumber <= 0) {
      return NextResponse.json(
        { error: 'Invalid FID format' },
        { status: 400 }
      );
    }

    // Get simple user stats
    const userStats = await prisma.$queryRaw<Array<{
      userFid: number;
      totalTokensEarned: number;
      highestScore: number;
    }>>`
      SELECT "userFid", "totalTokensEarned", "highestScore"
      FROM user_stats
      WHERE "userFid" = ${fidNumber}
    `;

    if (userStats.length === 0) {
      return NextResponse.json({
        success: true,
        stats: {
          latestScore: 0,
          totalQuestions: 5,
          accuracy: 0,
          totalGames: 0,
          highestScore: 0,
          bestStreak: 0,
          averageScore: 0,
          totalQuestionsAnswered: 0
        },
        recentGames: []
      });
    }

    const highestScore = userStats[0].highestScore;
    const totalTokensEarned = userStats[0].totalTokensEarned;

    return NextResponse.json({
      success: true,
      stats: {
        latestScore: highestScore, // Use highest as latest for now
        totalQuestions: 5,
        accuracy: (highestScore / 5) * 100,
        totalGames: 1, // Not tracking for now
        highestScore: highestScore,
        bestStreak: highestScore, // Use score as streak approximation
        averageScore: highestScore,
        totalQuestionsAnswered: 5,
        totalTokensEarned: totalTokensEarned
      },
      recentGames: []
    });

  } catch (error) {
    console.error('❌ Score retrieval error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve scores',
        details: error instanceof Error ? error.message : 'Unknown error',
        debug: {
          type: searchParams.get('type'),
          fid: searchParams.get('fid'),
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}

