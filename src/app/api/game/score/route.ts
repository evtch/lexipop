import { NextRequest, NextResponse } from 'next/server';

/**
 * 🔒 SECURE GAME SCORE API
 *
 * POST /api/game/score - Submit a score
 * GET /api/game/score?fid=123 - Get user's scores
 */

// In-memory storage for development (replace with database in production)
const userScores: Map<number, Array<{
  score: number;
  streak: number;
  totalQuestions: number;
  timestamp: number;
  gameId: string;
}>> = new Map();

const leaderboard: Array<{
  fid: number;
  username?: string;
  highestScore: number;
  bestStreak: number;
  totalGames: number;
  lastPlayed: number;
}> = [];

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

    // Store the score
    const scoreEntry = {
      score,
      streak,
      totalQuestions,
      timestamp: Date.now(),
      gameId: gameId || `game_${Date.now()}`
    };

    if (!userScores.has(fid)) {
      userScores.set(fid, []);
    }

    const userGameHistory = userScores.get(fid)!;
    userGameHistory.push(scoreEntry);

    // Keep only last 50 games per user
    if (userGameHistory.length > 50) {
      userGameHistory.splice(0, userGameHistory.length - 50);
    }

    // Update leaderboard
    await updateLeaderboard(fid, score, streak, totalQuestions);

    console.log(`✅ Score recorded: FID ${fid}, Score ${score}, Streak ${streak}`);

    return NextResponse.json({
      success: true,
      scoreId: scoreEntry.gameId,
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
      // Return top 10 players
      const topPlayers = leaderboard
        .sort((a, b) => b.highestScore - a.highestScore)
        .slice(0, 10)
        .map(player => ({
          fid: player.fid,
          username: player.username,
          highestScore: player.highestScore,
          bestStreak: player.bestStreak,
          totalGames: player.totalGames
        }));

      return NextResponse.json({
        success: true,
        leaderboard: topPlayers
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

    const userGameHistory = userScores.get(fidNumber) || [];
    const stats = calculateUserStats(userGameHistory);

    return NextResponse.json({
      success: true,
      stats,
      recentGames: userGameHistory.slice(-10) // Last 10 games
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

async function updateLeaderboard(fid: number, score: number, streak: number, totalQuestions: number) {
  let playerEntry = leaderboard.find(p => p.fid === fid);

  if (!playerEntry) {
    // Try to fetch username from Neynar API for new players
    let username = undefined;
    try {
      const neynarResponse = await fetch(`/api/neynar/user?fid=${fid}`);
      if (neynarResponse.ok) {
        const userData = await neynarResponse.json();
        username = userData.username;
      }
    } catch (error) {
      console.log(`Could not fetch username for FID ${fid}`);
    }

    playerEntry = {
      fid,
      username,
      highestScore: score,
      bestStreak: streak,
      totalGames: 1,
      lastPlayed: Date.now()
    };
    leaderboard.push(playerEntry);
  } else {
    playerEntry.highestScore = Math.max(playerEntry.highestScore, score);
    playerEntry.bestStreak = Math.max(playerEntry.bestStreak, streak);
    playerEntry.totalGames += 1;
    playerEntry.lastPlayed = Date.now();
  }
}

function calculateUserStats(games: Array<{score: number; streak: number; totalQuestions: number}>) {
  if (games.length === 0) {
    return {
      totalGames: 0,
      highestScore: 0,
      bestStreak: 0,
      averageScore: 0,
      totalQuestionsAnswered: 0
    };
  }

  const totalGames = games.length;
  const highestScore = Math.max(...games.map(g => g.score));
  const bestStreak = Math.max(...games.map(g => g.streak));
  const averageScore = games.reduce((sum, g) => sum + g.score, 0) / totalGames;
  const totalQuestionsAnswered = games.reduce((sum, g) => sum + g.totalQuestions, 0);

  return {
    totalGames,
    highestScore,
    bestStreak,
    averageScore: Math.round(averageScore * 100) / 100,
    totalQuestionsAnswered
  };
}