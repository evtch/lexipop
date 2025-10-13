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

    // Update user statistics FIRST (creates UserStats record if needed)
    await updateUserStats(fid, score, streak, totalQuestions, accuracy);

    // Create game session AFTER UserStats exists
    const gameSession = await prisma.gameSession.create({
      data: {
        gameId: gameIdFinal,
        userFid: fid,
        score,
        totalQuestions,
        streak,
        accuracy,
        gameStartTime: now,
        gameEndTime: now,
        totalDuration: 0,
        tokensEarned: 0,
        bonusMultiplier: 1,
      },
    });

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
      console.log('📊 Fetching leaderboard data...');

      // Get top 100 players with their latest scores
      console.log('🔍 Querying userStats table...');
      const topPlayers = await prisma.userStats.findMany({
        select: {
          userFid: true,
          totalGamesPlayed: true,
          highestScore: true,
          longestStreak: true,
          bestAccuracy: true,
          gameSessions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              score: true,
              totalQuestions: true,
              gameId: true,
              createdAt: true,
            }
          }
        },
        orderBy: [
          { highestScore: 'desc' },
          { bestAccuracy: 'desc' }
        ],
        take: 100
      });

      console.log(`📊 Found ${topPlayers.length} players in userStats table`);
      console.log('🔍 Sample player data:', topPlayers.slice(0, 3).map(p => ({
        fid: p.userFid,
        highestScore: p.highestScore,
        totalGames: p.totalGamesPlayed,
        latestGame: p.gameSessions[0]
      })));

      // Fetch usernames for all players in parallel (only if Neynar API key is available)
      const hasNeynarKey = !!process.env.NEYNAR_API_KEY;
      const leaderboardWithUsernames = await Promise.all(
        topPlayers.map(async (player) => {
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

          const latestGame = player.gameSessions[0];

          return {
            fid: player.userFid,
            username: username || `User ${player.userFid}`,
            latestScore: latestGame?.score || 0,
            totalQuestions: latestGame?.totalQuestions || 0,
            gameId: latestGame?.gameId || '',
            timestamp: latestGame?.createdAt || '',
            highestScore: player.highestScore,
            longestStreak: player.longestStreak,
            totalGames: player.totalGamesPlayed,
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

    // Get user stats
    const userStats = await prisma.userStats.findUnique({
      where: { userFid: fidNumber },
      select: {
        userFid: true,
        totalGamesPlayed: true,
        totalQuestionsAnswered: true,
        totalCorrectAnswers: true,
        highestScore: true,
        longestStreak: true,
        bestAccuracy: true,
        gameSessions: {
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
        }
      }
    });

    if (!userStats) {
      return NextResponse.json({
        success: true,
        stats: {
          latestScore: 0,
          totalQuestions: 0,
          accuracy: 0
        },
        recentGames: []
      });
    }

    const latestGame = userStats.gameSessions[0];

    return NextResponse.json({
      success: true,
      stats: {
        latestScore: latestGame?.score || 0,
        totalQuestions: latestGame?.totalQuestions || 0,
        accuracy: latestGame?.accuracy || 0,
        totalGames: userStats.totalGamesPlayed,
        highestScore: userStats.highestScore,
        bestStreak: userStats.longestStreak,
        averageScore: userStats.gameSessions.length > 0
          ? userStats.gameSessions.reduce((sum, game) => sum + game.score, 0) / userStats.gameSessions.length
          : 0,
        totalQuestionsAnswered: userStats.totalQuestionsAnswered
      },
      recentGames: userStats.gameSessions.map(game => ({
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

async function updateUserStats(fid: number, score: number, streak: number, totalQuestions: number, accuracy: number) {
  try {
    console.log('📊 Updating user stats:', { fid, score, streak, totalQuestions, accuracy });

    // Use raw SQL to avoid schema mismatch issues with notification fields
    await prisma.$executeRaw`
      INSERT INTO user_stats (
        userFid, totalGamesPlayed, totalQuestionsAnswered, totalCorrectAnswers,
        highestScore, longestStreak, bestAccuracy, currentDailyStreak,
        longestDailyStreak, lastPlayedDate, currentDifficultyLevel, wordsLearned,
        totalTokensEarned, totalSpins, firstGameAt, updatedAt
      ) VALUES (
        ${fid}, 1, ${totalQuestions}, ${score}, ${score}, ${streak}, ${accuracy},
        1, 1, NOW(), 1, ${score}, 0, 0, NOW(), NOW()
      )
      ON CONFLICT (userFid) DO UPDATE SET
        totalGamesPlayed = user_stats.totalGamesPlayed + 1,
        totalQuestionsAnswered = user_stats.totalQuestionsAnswered + ${totalQuestions},
        totalCorrectAnswers = user_stats.totalCorrectAnswers + ${score},
        lastPlayedDate = NOW(),
        wordsLearned = user_stats.wordsLearned + ${score},
        updatedAt = NOW()
    `;

    console.log('✅ User stats upserted successfully');

    // Update max values using raw SQL to avoid schema issues
    await prisma.$executeRaw`
      UPDATE user_stats SET
        highestScore = GREATEST(highestScore, ${score}),
        longestStreak = GREATEST(longestStreak, ${streak}),
        bestAccuracy = GREATEST(bestAccuracy, ${accuracy})
      WHERE userFid = ${fid}
    `;

    console.log('✅ User stats update completed successfully');

  } catch (error) {
    console.error('❌ Failed to update user stats:', error);
    throw error; // Re-throw to let the main handler catch it
  }
}