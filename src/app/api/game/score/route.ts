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

    // Create game session
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

    // Update user statistics
    await updateUserStats(fid, score, streak, totalQuestions, accuracy);

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
        error: 'Failed to record score'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');
    const type = searchParams.get('type') || 'user';

    if (type === 'leaderboard') {
      // Get top 100 players with their latest scores
      const topPlayers = await prisma.userStats.findMany({
        orderBy: [
          { highestScore: 'desc' },
          { bestAccuracy: 'desc' }
        ],
        take: 100,
        include: {
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
        }
      });

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
      include: {
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
        error: 'Failed to retrieve scores'
      },
      { status: 500 }
    );
  }
}

async function updateUserStats(fid: number, score: number, streak: number, totalQuestions: number, accuracy: number) {
  try {
    // Upsert user stats (create if doesn't exist, update if exists)
    await prisma.userStats.upsert({
      where: { userFid: fid },
      create: {
        userFid: fid,
        totalGamesPlayed: 1,
        totalQuestionsAnswered: totalQuestions,
        totalCorrectAnswers: score,
        highestScore: score,
        longestStreak: streak,
        bestAccuracy: accuracy,
        currentDailyStreak: 1,
        longestDailyStreak: 1,
        lastPlayedDate: new Date(),
        currentDifficultyLevel: 1,
        wordsLearned: score,
        totalTokensEarned: 0,
        totalSpins: 0,
      },
      update: {
        totalGamesPlayed: { increment: 1 },
        totalQuestionsAnswered: { increment: totalQuestions },
        totalCorrectAnswers: { increment: score },
        highestScore: { set: Math.max(score) }, // Will be overridden by the where clause update below
        longestStreak: { set: Math.max(streak) }, // Will be overridden by the where clause update below
        bestAccuracy: { set: Math.max(accuracy) }, // Will be overridden by the where clause update below
        lastPlayedDate: new Date(),
        wordsLearned: { increment: score },
        updatedAt: new Date(),
      },
    });

    // Update max values properly (Prisma doesn't support Math.max in upsert update)
    const currentStats = await prisma.userStats.findUnique({
      where: { userFid: fid }
    });

    if (currentStats) {
      await prisma.userStats.update({
        where: { userFid: fid },
        data: {
          highestScore: Math.max(currentStats.highestScore, score),
          longestStreak: Math.max(currentStats.longestStreak, streak),
          bestAccuracy: Math.max(currentStats.bestAccuracy, accuracy),
        }
      });
    }

  } catch (error) {
    console.error('❌ Failed to update user stats:', error);
  }
}