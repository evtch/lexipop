import { NextRequest, NextResponse } from 'next/server';

/**
 * 📊 THE GRAPH PROTOCOL LEADERBOARD
 *
 * Uses The Graph's decentralized indexing network
 * Fast queries with GraphQL
 */

// Example subgraph URL - you'd need to deploy your own subgraph
const SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/your-username/lexipop-tracker';

const LEADERBOARD_QUERY = `
  query GetLeaderboard($first: Int!) {
    users(first: $first, orderBy: totalClaimed, orderDirection: desc) {
      id
      address
      totalClaimed
      claimCount
      claims {
        amount
        timestamp
        transactionHash
      }
    }
  }
`;

const USER_QUERY = `
  query GetUser($address: String!) {
    user(id: $address) {
      id
      address
      totalClaimed
      currentBalance
      claimCount
      claims(first: 10, orderBy: timestamp, orderDirection: desc) {
        amount
        timestamp
        transactionHash
      }
    }
  }
`;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    const query = address ? USER_QUERY : LEADERBOARD_QUERY;
    const variables = address
      ? { address: address.toLowerCase() }
      : { first: 50 };

    const response = await fetch(SUBGRAPH_URL, {
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
      throw new Error(`Graph API error: ${response.status}`);
    }

    const data = await response.json();

    if (address) {
      const user = data.data?.user;
      if (!user) {
        return NextResponse.json({
          success: false,
          error: 'User not found'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: {
          address: user.address,
          totalClaimed: user.totalClaimed,
          currentBalance: user.currentBalance,
          claimCount: user.claimCount,
          claimedFormatted: parseFloat(user.totalClaimed) / 10**18,
        }
      });
    } else {
      const users = data.data?.users || [];
      const leaderboard = users.map((user: any, index: number) => ({
        rank: index + 1,
        address: user.address,
        totalClaimed: user.totalClaimed,
        claimedFormatted: parseFloat(user.totalClaimed) / 10**18,
        claimCount: user.claimCount,
      }));

      return NextResponse.json({
        success: true,
        leaderboard,
        provider: 'The Graph Protocol'
      });
    }

  } catch (error) {
    console.error('❌ The Graph API error:', error);
    return NextResponse.json({
      success: false,
      error: 'The Graph subgraph not deployed yet',
      message: 'Need to create and deploy a custom subgraph for LEXIPOP tracking',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}