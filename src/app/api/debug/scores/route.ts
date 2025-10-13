import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug: Checking database contents...');

    // Check game sessions
    const gameSessions = await prisma.gameSession.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        gameId: true,
        userFid: true,
        score: true,
        totalQuestions: true,
        streak: true,
        createdAt: true
      }
    });

    // Check user stats
    const userStats = await prisma.userStats.findMany({
      take: 10,
      select: {
        userFid: true,
        totalGamesPlayed: true,
        highestScore: true,
        longestStreak: true,
        bestAccuracy: true,
        updatedAt: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Get total counts
    const totalGameSessions = await prisma.gameSession.count();
    const totalUserStats = await prisma.userStats.count();

    return NextResponse.json({
      success: true,
      debug: {
        totalGameSessions,
        totalUserStats,
        recentGameSessions: gameSessions,
        recentUserStats: userStats,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}