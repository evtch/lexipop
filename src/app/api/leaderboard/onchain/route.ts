import { NextRequest, NextResponse } from 'next/server';
import { getCachedLeaderboard, getCachedAddressData, invalidateCache, getCacheStats } from '@/lib/leaderboardCache';

/**
 * 🔗 CACHED ON-CHAIN LEADERBOARD API
 *
 * Queries blockchain data with intelligent caching
 * Fast responses with periodic background updates
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const refresh = searchParams.get('refresh') === 'true';
    const stats = searchParams.get('stats') === 'true';

    // Return cache statistics if requested
    if (stats) {
      return NextResponse.json({
        success: true,
        stats: getCacheStats(),
      });
    }

    // Force refresh if requested
    if (refresh) {
      invalidateCache(address ? `address:${address.toLowerCase()}` : 'leaderboard');
    }

    // Get data for specific address
    if (address) {
      const result = await getCachedAddressData(address);
      return NextResponse.json(result);
    }

    // Get leaderboard data
    const result = await getCachedLeaderboard();
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ On-chain query error:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to query blockchain',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}