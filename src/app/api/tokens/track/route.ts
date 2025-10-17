import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * 💰 TRACK TOKEN CLAIMS FOR LEADERBOARD
 *
 * POST /api/tokens/track - Record when a user claims tokens
 */

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed - use POST to track tokens' },
    { status: 405 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fid, tokensEarned } = body;

    // Validate input
    if (!fid || typeof fid !== 'number' || fid <= 0) {
      return NextResponse.json(
        { error: 'Valid FID is required' },
        { status: 400 }
      );
    }

    if (typeof tokensEarned !== 'number' || tokensEarned <= 0) {
      return NextResponse.json(
        { error: 'Valid token amount is required' },
        { status: 400 }
      );
    }

    // Update total tokens earned for this user
    await prisma.$executeRaw`
      INSERT INTO user_stats ("userFid", "totalTokensEarned", "updatedAt")
      VALUES (${fid}, ${tokensEarned}, NOW())
      ON CONFLICT ("userFid")
      DO UPDATE SET
        "totalTokensEarned" = user_stats."totalTokensEarned" + ${tokensEarned},
        "updatedAt" = NOW()
    `;

    console.log(`💰 Tokens tracked: FID ${fid} earned ${tokensEarned} $LEXIPOP`);

    return NextResponse.json({
      success: true,
      message: `Tracked ${tokensEarned} $LEXIPOP for FID ${fid}`
    });

  } catch (error) {
    console.error('❌ Token tracking error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to track tokens'
      },
      { status: 500 }
    );
  }
}