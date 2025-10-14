import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * ONCHAIN LEADERBOARD API
 *
 * Returns leaderboard data based on actual onchain token claims
 * Data is synced periodically from blockchain events
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const address = searchParams.get('address');

    // Get specific user stats if address provided
    if (address) {
      const userClaims = await prisma.$queryRaw<Array<{total: number, count: number}>>`
        SELECT
          SUM("tokenAmountFormatted")::float as total,
          COUNT(*)::int as count
        FROM token_claims
        WHERE "walletAddress" = ${address.toLowerCase()}
          AND status = 'claimed'
      `;

      const userStats = await prisma.$queryRaw<Array<{userFid: number}>>`
        SELECT "userFid" FROM user_stats WHERE "walletAddress" = ${address.toLowerCase()}
      `;

      return NextResponse.json({
        success: true,
        address: address.toLowerCase(),
        totalClaimed: userClaims[0]?.total || 0,
        claimCount: userClaims[0]?.count || 0,
        fid: userStats[0]?.userFid || null,
        message: 'User stats from onchain data'
      });
    }

    // Get leaderboard from aggregated onchain claims
    const leaderboardData = await prisma.$queryRaw<Array<{
      walletAddress: string;
      userFid: number | null;
      totalClaimed: number;
      claimCount: number;
      lastClaim: Date | null;
    }>>`
      SELECT
        tc."walletAddress",
        us."userFid",
        SUM(tc."tokenAmountFormatted")::float as "totalClaimed",
        COUNT(tc.id)::int as "claimCount",
        MAX(tc."claimedAt") as "lastClaim"
      FROM token_claims tc
      LEFT JOIN user_stats us ON LOWER(us."walletAddress") = LOWER(tc."walletAddress")
      WHERE tc.status = 'claimed'
      GROUP BY tc."walletAddress", us."userFid"
      ORDER BY "totalClaimed" DESC
      LIMIT ${limit}
    `;

    // If no data found, attempt a quick bootstrap sync
    if (leaderboardData.length === 0) {
      console.log('🔄 No leaderboard data found, attempting quick bootstrap sync...');
      try {
        // Try to trigger sync internally for bootstrap
        const initResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://www.lexipop.xyz'}/api/leaderboard/init`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        if (initResponse.ok) {
          console.log('✅ Bootstrap sync triggered');
        } else {
          console.log('⚠️ Bootstrap sync failed, proceeding with empty data');
        }
      } catch (error) {
        console.log('⚠️ Could not trigger bootstrap sync:', error);
      }
    }

    // Fetch usernames for players with FIDs
    const hasNeynarKey = !!process.env.NEYNAR_API_KEY;
    const leaderboard = await Promise.all(
      leaderboardData.map(async (player, index) => {
        let username = null;

        if (hasNeynarKey && player.userFid) {
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3004'}/api/neynar/user?fid=${player.userFid}`
            );
            if (response.ok) {
              const userData = await response.json();
              username = userData.user?.username;
            }
          } catch (error) {
            console.log(`Could not fetch username for FID ${player.userFid}`);
          }
        }

        return {
          rank: index + 1,
          address: player.walletAddress,
          addressDisplay: `${player.walletAddress.slice(0, 6)}...${player.walletAddress.slice(-4)}`,
          fid: player.userFid,
          username: username,
          totalClaimed: player.totalClaimed,
          claimCount: player.claimCount,
          lastClaim: player.lastClaim,
          verified: true // All data is from onchain
        };
      })
    );

    // Get sync status
    const lastSync = await prisma.$queryRaw<Array<{blockNumber: number}>>`
      SELECT "blockNumber"
      FROM token_claims
      WHERE "blockNumber" IS NOT NULL AND status = 'claimed'
      ORDER BY "blockNumber" DESC
      LIMIT 1
    `;

    const totalClaimedAmount = await prisma.$queryRaw<Array<{total: number}>>`
      SELECT SUM("tokenAmountFormatted")::float as total
      FROM token_claims
      WHERE status = 'claimed'
    `;

    const uniquePlayers = await prisma.$queryRaw<Array<{count: number}>>`
      SELECT COUNT(DISTINCT "walletAddress")::int as count
      FROM token_claims
      WHERE status = 'claimed'
    `;

    return NextResponse.json({
      success: true,
      leaderboard,
      stats: {
        totalPlayers: uniquePlayers[0]?.count || 0,
        totalTokensClaimed: totalClaimedAmount[0]?.total || 0,
        lastSyncBlock: lastSync[0]?.blockNumber || 0,
        dataSource: 'onchain',
        contractAddress: '0xe636baaf2c390a591edbffaf748898eb3f6ff9a1'
      },
      message: 'Leaderboard data from verified onchain claims'
    });

  } catch (error) {
    console.error('❌ Leaderboard error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch leaderboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}