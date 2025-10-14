import { NextRequest, NextResponse } from 'next/server';

/**
 * 🎭 MOCK LEADERBOARD DATA
 *
 * For testing UI while we set up real blockchain data
 * Shows what the leaderboard will look like with actual claims
 */

const MOCK_LEADERBOARD = [
  {
    rank: 1,
    address: '0x742d35Cc631C0532925a3b8D34f8e7e7C8d6b8e1',
    totalClaimed: '15000000000000000000000', // 15,000 LEXIPOP
    claimedFormatted: 15000,
    claimCount: 45,
  },
  {
    rank: 2,
    address: '0x8ba1f109551bD432803012645Hac136c22C57B2',
    totalClaimed: '12500000000000000000000', // 12,500 LEXIPOP
    claimedFormatted: 12500,
    claimCount: 38,
  },
  {
    rank: 3,
    address: '0x1234567890AbCdEf1234567890AbCdEf12345678',
    totalClaimed: '10000000000000000000000', // 10,000 LEXIPOP
    claimedFormatted: 10000,
    claimCount: 32,
  },
  {
    rank: 4,
    address: '0x9876543210FeDcBa9876543210FeDcBa98765432',
    totalClaimed: '8500000000000000000000', // 8,500 LEXIPOP
    claimedFormatted: 8500,
    claimCount: 28,
  },
  {
    rank: 5,
    address: '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12',
    totalClaimed: '7000000000000000000000', // 7,000 LEXIPOP
    claimedFormatted: 7000,
    claimCount: 24,
  },
  {
    rank: 6,
    address: '0x1111222233334444555566667777888899990000',
    totalClaimed: '5500000000000000000000', // 5,500 LEXIPOP
    claimedFormatted: 5500,
    claimCount: 20,
  },
  {
    rank: 7,
    address: '0x0000999988887777666655554444333322221111',
    totalClaimed: '4200000000000000000000', // 4,200 LEXIPOP
    claimedFormatted: 4200,
    claimCount: 16,
  },
  {
    rank: 8,
    address: '0xFFFFeeeeEEEEddddDDDDccccCCCCbbbbBBBBaaaa',
    totalClaimed: '3100000000000000000000', // 3,100 LEXIPOP
    claimedFormatted: 3100,
    claimCount: 14,
  },
  {
    rank: 9,
    address: '0xAAAAbbbbBBBBccccCCCCddddDDDDeeeeEEEEffff',
    totalClaimed: '2500000000000000000000', // 2,500 LEXIPOP
    claimedFormatted: 2500,
    claimCount: 12,
  },
  {
    rank: 10,
    address: '0x1a2b3c4d5e6f7890abcdef1234567890ABCDEF12',
    totalClaimed: '1800000000000000000000', // 1,800 LEXIPOP
    claimedFormatted: 1800,
    claimCount: 8,
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 500));

    if (address) {
      // Find specific address in mock data
      const user = MOCK_LEADERBOARD.find(
        entry => entry.address.toLowerCase() === address.toLowerCase()
      );

      if (!user) {
        return NextResponse.json({
          success: true,
          data: {
            address,
            currentBalance: '0',
            totalClaimed: '0',
            claimCount: 0,
            balanceFormatted: 0,
            claimedFormatted: 0,
          }
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          address: user.address,
          currentBalance: user.totalClaimed,
          totalClaimed: user.totalClaimed,
          claimCount: user.claimCount,
          balanceFormatted: user.claimedFormatted,
          claimedFormatted: user.claimedFormatted,
        }
      });
    }

    // Return mock leaderboard
    return NextResponse.json({
      success: true,
      leaderboard: MOCK_LEADERBOARD,
      totalAddresses: MOCK_LEADERBOARD.length,
      message: '🎭 Mock data - showing what real leaderboard will look like',
      provider: 'Mock Data',
      cachedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Mock API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate mock data',
    }, { status: 500 });
  }
}