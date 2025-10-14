import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * MINIAPP ADD TRACKING
 *
 * Tracks when users add the miniapp to their Farcaster
 * Helps with analytics and user onboarding flow
 */

export async function POST(request: NextRequest) {
  try {
    const { userFid, method, timestamp } = await request.json();

    if (!userFid) {
      return NextResponse.json(
        { success: false, error: 'userFid required' },
        { status: 400 }
      );
    }

    console.log(`📊 Tracking miniapp add: FID ${userFid}, method: ${method}`);

    // Update or create user stats to track miniapp add
    await prisma.userStats.upsert({
      where: { userFid },
      create: {
        userFid,
        // Initialize other required fields with defaults
        totalGamesPlayed: 0,
        totalQuestionsAnswered: 0,
        totalCorrectAnswers: 0,
      },
      update: {
        // Just update the timestamp to show activity
        updatedAt: new Date()
      }
    });

    // TODO: Could add a separate MiniAppInstalls table for detailed tracking
    // For now, just log the event
    console.log(`✅ Miniapp add tracked for FID ${userFid}`);

    return NextResponse.json({
      success: true,
      message: 'Miniapp add tracked successfully',
      userFid,
      method,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error tracking miniapp add:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to track miniapp add',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}