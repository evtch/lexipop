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
      const userClaims = await prisma.tokenClaim.aggregate({
        where: {
          walletAddress: address.toLowerCase(),
          status: 'claimed'
        },
        _sum: {
          tokenAmountFormatted: true
        },
        _count: true
      });

      const userStats = await prisma.userStats.findFirst({
        where: {
          walletAddress: address.toLowerCase()
        }
      });

      return NextResponse.json({
        success: true,
        address: address.toLowerCase(),
        totalClaimed: userClaims._sum.tokenAmountFormatted || 0,
        claimCount: userClaims._count,
        fid: userStats?.userFid || null,
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
    const lastSync = await prisma.tokenClaim.findFirst({
      where: {
        blockNumber: { not: null },
        status: 'claimed'
      },
      orderBy: {
        blockNumber: 'desc'
      }
    });

    const totalClaimedAmount = await prisma.tokenClaim.aggregate({
      where: { status: 'claimed' },
      _sum: { tokenAmountFormatted: true }
    });

    const uniquePlayers = await prisma.tokenClaim.groupBy({
      by: ['walletAddress'],
      where: { status: 'claimed' }
    });

    return NextResponse.json({
      success: true,
      leaderboard,
      stats: {
        totalPlayers: uniquePlayers.length,
        totalTokensClaimed: totalClaimedAmount._sum.tokenAmountFormatted || 0,
        lastSyncBlock: lastSync?.blockNumber || 0,
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