import { NextRequest, NextResponse } from 'next/server';

/**
 * 📊 ENVIO-POWERED LEADERBOARD API
 *
 * Queries on-chain data from Envio HyperIndex to build leaderboard
 * Based on actual $LEXIPOP token claims tracked on Base mainnet
 */

const ENVIO_GRAPHQL_URL = process.env.ENVIO_GRAPHQL_URL || 'http://localhost:8080/v1/graphql';

interface EnvioUser {
  id: string;
  address: string;
  fid: string | null;
  totalClaimed: string;
  currentBalance: string;
  claimCount: number;
  firstClaimDate: string | null;
  lastClaimDate: string | null;
}

interface GraphQLResponse {
  data: {
    User: EnvioUser[];
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const fid = searchParams.get('fid');

    let query: string;
    let variables: any = {};

    if (fid) {
      // Get specific user stats
      query = `
        query GetUserStats($fid: BigInt!) {
          User(where: { fid: { _eq: $fid } }) {
            id
            address
            fid
            totalClaimed
            currentBalance
            claimCount
            firstClaimDate
            lastClaimDate
            claims(order_by: { timestamp: desc }, limit: 10) {
              id
              amount
              transactionHash
              timestamp
            }
          }
        }
      `;
      variables = { fid };
    } else {
      // Get leaderboard
      query = `
        query GetLeaderboard($limit: Int!) {
          User(
            order_by: { totalClaimed: desc }
            limit: $limit
            where: { totalClaimed: { _gt: "0" } }
          ) {
            id
            address
            fid
            totalClaimed
            currentBalance
            claimCount
            firstClaimDate
            lastClaimDate
          }
        }
      `;
      variables = { limit };
    }

    // Query Envio GraphQL API
    const response = await fetch(ENVIO_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`Envio API error: ${response.status} ${response.statusText}`);
    }

    const data: GraphQLResponse = await response.json();

    if (fid) {
      // Return user stats
      const user = data.data.User[0];
      if (!user) {
        return NextResponse.json({
          success: false,
          error: 'User not found',
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        user: {
          fid: user.fid,
          address: user.address,
          totalTokensEarned: parseInt(user.totalClaimed),
          currentBalance: parseInt(user.currentBalance),
          claimCount: user.claimCount,
          firstClaimDate: user.firstClaimDate,
          lastClaimDate: user.lastClaimDate,
        },
      });
    } else {
      // Return leaderboard
      const leaderboard = data.data.User.map((user, index) => ({
        rank: index + 1,
        fid: user.fid ? parseInt(user.fid) : null,
        address: user.address,
        totalTokensEarned: parseInt(user.totalClaimed),
        currentBalance: parseInt(user.currentBalance),
        claimCount: user.claimCount,
        firstClaimDate: user.firstClaimDate,
        lastClaimDate: user.lastClaimDate,
      }));

      return NextResponse.json({
        success: true,
        leaderboard,
        total: leaderboard.length,
      });
    }

  } catch (error) {
    console.error('❌ Envio leaderboard API error:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch leaderboard data',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * 🔧 SETUP INSTRUCTIONS:
 *
 * 1. Install Envio CLI: npm install -g envio
 * 2. Generate types: envio codegen
 * 3. Start indexer: envio dev
 * 4. Set ENVIO_GRAPHQL_URL environment variable
 * 5. The indexer will sync all $LEXIPOP claims from Base mainnet
 * 6. Query this API for real-time on-chain leaderboard data
 */