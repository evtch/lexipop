import { NextRequest, NextResponse } from 'next/server';

/**
 * LEADERBOARD INITIALIZATION ENDPOINT
 *
 * Simple endpoint to trigger initial sync without authentication
 * Only for production bootstrap purposes
 */

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Initializing leaderboard data...');

    // Call sync endpoint with manual flag
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.lexipop.xyz';
    const syncUrl = `${baseUrl}/api/leaderboard/sync?manual=true`;

    const response = await fetch(syncUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Lexipop-Init/1.0'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        success: true,
        message: 'Leaderboard initialization completed',
        data
      });
    } else {
      const errorText = await response.text();
      return NextResponse.json({
        success: false,
        error: 'Sync failed',
        details: errorText
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Init error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to initialize leaderboard',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Leaderboard initialization endpoint',
    usage: 'POST to trigger initialization'
  });
}