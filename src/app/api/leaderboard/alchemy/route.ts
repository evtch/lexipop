import { NextRequest, NextResponse } from 'next/server';

/**
 * 🚀 ALCHEMY-POWERED LEADERBOARD
 *
 * Uses Alchemy's indexed data for instant responses
 * Much faster than direct RPC calls
 */

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const LEXIPOP_TOKEN = '0xf732f31f73e7dc21299f3ab42bd22e8a7c6b4b07';
const MONEY_TREE = '0xe636baaf2c390a591edbffaf748898eb3f6ff9a1';

export async function GET(request: NextRequest) {
  if (!ALCHEMY_API_KEY) {
    return NextResponse.json({
      success: false,
      error: 'Alchemy API key not configured',
      message: 'Add ALCHEMY_API_KEY to environment variables'
    }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (address) {
      // Get token balance for specific address using Alchemy
      const balanceResponse = await fetch(
        `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'alchemy_getTokenBalances',
            params: [address, [LEXIPOP_TOKEN]],
            id: 1
          })
        }
      );

      const balanceData = await balanceResponse.json();

      return NextResponse.json({
        success: true,
        address,
        balance: balanceData.result?.tokenBalances?.[0]?.tokenBalance || '0',
        message: 'Using Alchemy API for fast token balance lookup'
      });
    }

    // Get token transfers for leaderboard
    const transfersResponse = await fetch(
      `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'alchemy_getAssetTransfers',
          params: [{
            fromBlock: '0x0',
            toBlock: 'latest',
            contractAddresses: [LEXIPOP_TOKEN],
            category: ['erc20'],
            maxCount: '0x64', // 100 transfers
            order: 'desc'
          }],
          id: 1
        })
      }
    );

    const transfersData = await transfersResponse.json();

    // Process transfers to create leaderboard
    const transfers = transfersData.result?.transfers || [];
    const addressTotals: Record<string, { total: number; count: number }> = {};

    for (const transfer of transfers) {
      const to = transfer.to?.toLowerCase();
      const value = parseFloat(transfer.value || '0');

      if (to && value > 0) {
        if (!addressTotals[to]) {
          addressTotals[to] = { total: 0, count: 0 };
        }
        addressTotals[to].total += value;
        addressTotals[to].count += 1;
      }
    }

    // Create leaderboard with proper token formatting
    const leaderboard = Object.entries(addressTotals)
      .map(([address, data]) => ({
        address,
        totalClaimed: data.total.toString(),
        claimedFormatted: data.total, // Keep full precision for sorting
        claimedDisplay: data.total.toLocaleString('en-US', { maximumFractionDigits: 0 }), // Formatted display
        claimCount: data.count,
        rank: 0
      }))
      .sort((a, b) => b.claimedFormatted - a.claimedFormatted)
      .map((entry, index) => ({ ...entry, rank: index + 1 }))
      .slice(0, 50);

    return NextResponse.json({
      success: true,
      leaderboard,
      totalTransfers: transfers.length,
      message: 'Powered by Alchemy API - instant blockchain data',
      provider: 'Alchemy'
    });

  } catch (error) {
    console.error('❌ Alchemy API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch data from Alchemy',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}