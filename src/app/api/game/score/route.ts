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

    // Store game session with raw SQL to avoid all schema issues
    await prisma.$executeRaw`
      INSERT INTO game_sessions (
        id, gameId, userFid, score, totalQuestions, streak, accuracy,
        gameStartTime, gameEndTime, totalDuration, tokensEarned, bonusMultiplier, createdAt
      ) VALUES (
        gen_random_uuid(), ${gameIdFinal}, ${fid}, ${score}, ${totalQuestions}, ${streak}, ${accuracy},
        NOW(), NOW(), 0, 0, 1, NOW()
      )
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
      console.log('📊 Fetching leaderboard data from game sessions...');

      // Calculate stats from game sessions directly using SQL
      const leaderboardData = await prisma.$queryRaw<Array<{
        userFid: number;
        totalGames: bigint;
        highestScore: number;
        longestStreak: number;
        bestAccuracy: number;
        latestScore: number;
        latestTotalQuestions: number;
        latestGameId: string;
        latestTimestamp: Date;
      }>>`
        SELECT
          userFid,
          COUNT(*) as totalGames,
          MAX(score) as highestScore,
          MAX(streak) as longestStreak,
          MAX(accuracy) as bestAccuracy,
          (SELECT score FROM game_sessions gs2 WHERE gs2.userFid = game_sessions.userFid ORDER BY createdAt DESC LIMIT 1) as latestScore,
          (SELECT totalQuestions FROM game_sessions gs3 WHERE gs3.userFid = game_sessions.userFid ORDER BY createdAt DESC LIMIT 1) as latestTotalQuestions,
          (SELECT gameId FROM game_sessions gs4 WHERE gs4.userFid = game_sessions.userFid ORDER BY createdAt DESC LIMIT 1) as latestGameId,
          (SELECT createdAt FROM game_sessions gs5 WHERE gs5.userFid = game_sessions.userFid ORDER BY createdAt DESC LIMIT 1) as latestTimestamp
        FROM game_sessions
        GROUP BY userFid
        ORDER BY highestScore DESC, bestAccuracy DESC
        LIMIT 100
      `;

      console.log(`📊 Found ${leaderboardData.length} players from game sessions`);

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
            latestScore: player.latestScore || 0,
            totalQuestions: player.latestTotalQuestions || 0,
            gameId: player.latestGameId || '',
            timestamp: player.latestTimestamp || '',
            highestScore: player.highestScore,
            longestStreak: player.longestStreak,
            totalGames: Number(player.totalGames),
            bestAccuracy: player.bestAccuracy,
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

    // Get user stats calculated from game sessions
    const userGames = await prisma.gameSession.findMany({
      where: { userFid: fidNumber },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        score: true,
        streak: true,
        totalQuestions: true,
        createdAt: true,
        gameId: true,
        accuracy: true,
      }
    });

    if (userGames.length === 0) {
      return NextResponse.json({
        success: true,
        stats: {
          latestScore: 0,
          totalQuestions: 0,
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

    const latestGame = userGames[0];
    const totalGames = userGames.length;
    const highestScore = Math.max(...userGames.map(g => g.score));
    const bestStreak = Math.max(...userGames.map(g => g.streak));
    const averageScore = userGames.reduce((sum, game) => sum + game.score, 0) / totalGames;
    const totalQuestionsAnswered = userGames.reduce((sum, game) => sum + game.totalQuestions, 0);

    return NextResponse.json({
      success: true,
      stats: {
        latestScore: latestGame.score,
        totalQuestions: latestGame.totalQuestions,
        accuracy: latestGame.accuracy,
        totalGames,
        highestScore,
        bestStreak,
        averageScore: Math.round(averageScore * 10) / 10, // Round to 1 decimal
        totalQuestionsAnswered
      },
      recentGames: userGames.map(game => ({
        score: game.score,
        streak: game.streak,
        totalQuestions: game.totalQuestions,
        timestamp: Number(game.createdAt),
        gameId: game.gameId
      }))
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

