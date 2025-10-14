import { NextRequest, NextResponse } from 'next/server';

/**
 * ADMIN ENDPOINT - Manual Leaderboard Sync Trigger
 *
 * This endpoint allows manual triggering of the leaderboard sync
 * for testing and initial setup purposes
 */

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Manual sync trigger requested...');

    // Call the sync endpoint internally
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.lexipop.xyz';
    const syncUrl = `${baseUrl}/api/leaderboard/sync`;

    console.log('📡 Calling sync endpoint:', syncUrl);

    const response = await fetch(syncUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-call': 'true',
      },
    });

    const data = await response.json();

    console.log('📊 Sync response:', {
      status: response.status,
      success: data.success,
      stats: data.stats
    });

    if (response.ok && data.success) {
      return NextResponse.json({
        success: true,
        message: 'Leaderboard sync completed successfully',
        data: data.stats
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Sync failed',
        details: data.error || data.details || 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Manual sync error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to trigger sync',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Manual leaderboard sync endpoint',
    usage: 'POST to this endpoint to trigger a sync',
    status: 'ready'
  });
}