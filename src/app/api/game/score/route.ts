import { NextRequest, NextResponse } from 'next/server';
import { db, gameSessions, userStats } from '@/db';
import { eq, desc, count, max, avg, and, sql } from 'drizzle-orm';

/**
 * 🔒 SECURE GAME SCORE API
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

    // TODO: Validate frameMessage with Neynar in production
    // const validation = await validateFrameMessage(frameMessage);
    // if (!validation.valid) {
    //   return NextResponse.json({ error: 'Invalid frame interaction' }, { status: 401 });
    // }

    const gameIdFinal = gameId || `game_${Date.now()}_${fid}`;
    const accuracy = (score / totalQuestions) * 100;
    const now = new Date();

    // Insert game session into database
    const [gameSession] = await db.insert(gameSessions).values({
      gameId: gameIdFinal,
      userFid: fid,
      score,
      totalQuestions,
      streak,
      accuracy,
      gameStartTime: now,
      gameEndTime: now,
      totalDuration: 0, // Could be calculated if we track start/end times
      tokensEarned: 0, // Will be updated when tokens are claimed
      bonusMultiplier: 1,
    }).returning();

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
    const type = searchParams.get('type') || 'user'; // 'user' or 'leaderboard'

    if (type === 'leaderboard') {
      // Get top 100 players with their latest scores and fetch usernames
      const topPlayers = await db
        .select({
          fid: userStats.userFid,
          highestScore: userStats.highestScore,
          longestStreak: userStats.longestStreak,
          totalGamesPlayed: userStats.totalGamesPlayed,
          totalTokensEarned: userStats.totalTokensEarned,
          bestAccuracy: userStats.bestAccuracy,
          lastPlayedDate: userStats.lastPlayedDate,
        })
        .from(userStats)
        .orderBy(desc(userStats.highestScore), desc(userStats.bestAccuracy))
        .limit(100);

      // Fetch usernames for all players in parallel (only if Neynar API key is available)
      const hasNeynarKey = !!process.env.NEYNAR_API_KEY;
      const leaderboardWithUsernames = await Promise.all(
        topPlayers.map(async (player) => {
          let username = undefined;

          if (hasNeynarKey) {
            try {
              const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3004'}/api/neynar/user?fid=${player.fid}`);
              if (response.ok) {
                const userData = await response.json();
                username = userData.user?.username;
              }
            } catch (error) {
              console.log(`Could not fetch username for FID ${player.fid} (Neynar API unavailable)`);
            }
          } else {
            console.log(`Skipping username fetch for FID ${player.fid} - No Neynar API key configured`);
          }

          // Get the latest game score for this user
          const latestGame = await db
            .select({
              latestScore: gameSessions.score,
              totalQuestions: gameSessions.totalQuestions,
              gameId: gameSessions.gameId,
              timestamp: gameSessions.createdAt,
            })
            .from(gameSessions)
            .where(eq(gameSessions.userFid, player.fid))
            .orderBy(desc(gameSessions.createdAt))
            .limit(1);

          return {
            fid: player.fid,
            username: username || `User ${player.fid}`,
            latestScore: latestGame[0]?.latestScore || 0,
            totalQuestions: latestGame[0]?.totalQuestions || 0,
            gameId: latestGame[0]?.gameId || '',
            timestamp: latestGame[0]?.timestamp || '',
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
    const userStatsResult = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userFid, fidNumber))
      .limit(1);

    if (userStatsResult.length === 0) {
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

    const stats = userStatsResult[0];

    // Get latest game for accurate latest score display
    const latestGame = await db
      .select({
        score: gameSessions.score,
        totalQuestions: gameSessions.totalQuestions,
        accuracy: gameSessions.accuracy,
      })
      .from(gameSessions)
      .where(eq(gameSessions.userFid, fidNumber))
      .orderBy(desc(gameSessions.createdAt))
      .limit(1);

    // Get recent games
    const recentGames = await db
      .select({
        score: gameSessions.score,
        streak: gameSessions.streak,
        totalQuestions: gameSessions.totalQuestions,
        timestamp: gameSessions.createdAt,
        gameId: gameSessions.gameId,
      })
      .from(gameSessions)
      .where(eq(gameSessions.userFid, fidNumber))
      .orderBy(desc(gameSessions.createdAt))
      .limit(10);

    return NextResponse.json({
      success: true,
      stats: {
        latestScore: latestGame[0]?.score || 0,
        totalQuestions: latestGame[0]?.totalQuestions || 0,
        accuracy: latestGame[0]?.accuracy || 0,
        totalGames: stats.totalGamesPlayed,
        highestScore: stats.highestScore,
        bestStreak: stats.longestStreak,
        averageScore: recentGames.length > 0
          ? recentGames.reduce((sum, game) => sum + game.score, 0) / recentGames.length
          : 0,
        totalQuestionsAnswered: stats.totalQuestionsAnswered
      },
      recentGames: recentGames.map(game => ({
        score: game.score,
        streak: game.streak,
        totalQuestions: game.totalQuestions,
        timestamp: Number(game.timestamp),
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
    // Check if user stats exist
    const existingStats = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userFid, fid))
      .limit(1);

    if (existingStats.length === 0) {
      // Create new user stats
      await db.insert(userStats).values({
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
        wordsLearned: score, // Approximate based on correct answers
        totalTokensEarned: 0,
        totalSpins: 0,
      });
    } else {
      // Update existing stats
      const stats = existingStats[0];
      await db
        .update(userStats)
        .set({
          totalGamesPlayed: stats.totalGamesPlayed + 1,
          totalQuestionsAnswered: stats.totalQuestionsAnswered + totalQuestions,
          totalCorrectAnswers: stats.totalCorrectAnswers + score,
          highestScore: Math.max(stats.highestScore, score),
          longestStreak: Math.max(stats.longestStreak, streak),
          bestAccuracy: Math.max(stats.bestAccuracy, accuracy),
          lastPlayedDate: new Date(),
          wordsLearned: stats.wordsLearned + score, // Approximate
          updatedAt: new Date(),
        })
        .where(eq(userStats.userFid, fid));
    }
  } catch (error) {
    console.error('❌ Failed to update user stats:', error);
  }
}