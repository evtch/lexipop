import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createPublicClient, http, parseAbiItem, type Log } from 'viem';
import { base } from 'viem/chains';

/**
 * ONCHAIN LEADERBOARD SYNC
 *
 * Fetches MoneyTree Withdraw events from the blockchain
 * and syncs them with the database for accurate leaderboard tracking
 */

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const LEXIPOP_TOKEN = '0xf732f31f73e7dc21299f3ab42bd22e8a7c6b4b07' as const;
const MONEY_TREE = '0xe636baaf2c390a591edbffaf748898eb3f6ff9a1' as const;

// MoneyTree Withdraw event ABI
const WITHDRAW_EVENT = parseAbiItem('event Withdraw(address indexed signer, address indexed recipient, address indexed token, uint256 amount)');

interface WithdrawEvent {
  signer: string;
  recipient: string;
  token: string;
  amount: bigint;
  transactionHash: string;
  blockNumber: bigint;
}

export async function GET(request: NextRequest) {
  // Optional auth check for cron job
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    console.log('🔄 Starting onchain leaderboard sync...');

    // Get the last synced block from database
    const lastSync = await prisma.tokenClaim.findFirst({
      where: {
        blockNumber: { not: null },
        status: 'claimed'
      },
      orderBy: {
        blockNumber: 'desc'
      }
    });

    const fromBlock = lastSync?.blockNumber
      ? BigInt(lastSync.blockNumber + 1)
      : BigInt(0); // Start from genesis if first sync

    // Create public client
    const publicClient = createPublicClient({
      chain: base,
      transport: http(
        ALCHEMY_API_KEY
          ? `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
          : 'https://mainnet.base.org'
      ),
    });

    // Get current block number
    const currentBlock = await publicClient.getBlockNumber();

    // Fetch withdraw events from MoneyTree contract
    const logs = await publicClient.getLogs({
      address: MONEY_TREE,
      event: WITHDRAW_EVENT,
      fromBlock,
      toBlock: currentBlock,
    }) as Log<typeof WITHDRAW_EVENT>[];

    console.log(`📊 Found ${logs.length} withdraw events from block ${fromBlock} to ${currentBlock}`);

    // Process each withdraw event
    let processedCount = 0;
    let errorCount = 0;

    for (const log of logs) {
      try {
        // Only process LEXIPOP token withdraws
        if (log.args.token?.toLowerCase() !== LEXIPOP_TOKEN.toLowerCase()) {
          continue;
        }

        const recipient = log.args.recipient?.toLowerCase();
        const amount = log.args.amount;
        const txHash = log.transactionHash;
        const blockNumber = Number(log.blockNumber);

        if (!recipient || !amount || !txHash) {
          console.warn('⚠️ Skipping event with missing data:', log);
          continue;
        }

        // Convert amount from wei to human readable
        const amountFormatted = Number(amount) / (10 ** 18);

        // Check if we already have this transaction
        const existingClaim = await prisma.tokenClaim.findUnique({
          where: { transactionHash: txHash }
        });

        if (existingClaim) {
          // Update existing claim if needed
          if (existingClaim.status !== 'claimed') {
            await prisma.tokenClaim.update({
              where: { id: existingClaim.id },
              data: {
                status: 'claimed',
                claimedAt: new Date(),
                blockNumber
              }
            });
            console.log(`✅ Updated claim status for tx: ${txHash.slice(0, 10)}...`);
          }
        } else {
          // Create new claim record
          await prisma.tokenClaim.create({
            data: {
              transactionHash: txHash,
              walletAddress: recipient,
              tokenAmount: amount,
              tokenAmountFormatted: amountFormatted,
              status: 'claimed',
              claimedAt: new Date(),
              blockNumber
            }
          });
          console.log(`✅ Recorded new claim for ${recipient.slice(0, 6)}... (${amountFormatted} LEXIPOP)`);
        }

        // Update user stats if wallet is linked
        const userStats = await prisma.userStats.findFirst({
          where: { walletAddress: recipient }
        });

        if (userStats) {
          // Recalculate total from all claimed transactions
          const totalClaimed = await prisma.tokenClaim.aggregate({
            where: {
              walletAddress: recipient,
              status: 'claimed'
            },
            _sum: {
              tokenAmountFormatted: true
            }
          });

          await prisma.userStats.update({
            where: { id: userStats.id },
            data: {
              totalTokensEarned: Math.round(totalClaimed._sum.tokenAmountFormatted || 0)
            }
          });
        }

        processedCount++;
      } catch (error) {
        console.error('❌ Error processing event:', error);
        errorCount++;
      }
    }

    // Clean up orphaned claims (signature generated but never claimed after 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const orphanedClaims = await prisma.tokenClaim.updateMany({
      where: {
        status: 'signature_generated',
        signatureGenerated: {
          lt: oneDayAgo
        }
      },
      data: {
        status: 'failed',
        errorMessage: 'Claim expired - not submitted within 24 hours'
      }
    });

    console.log(`🧹 Cleaned up ${orphanedClaims.count} expired claims`);

    // Generate leaderboard cache
    const leaderboard = await prisma.$queryRaw`
      SELECT
        COALESCE(us."userFid", 0) as fid,
        tc."walletAddress",
        SUM(tc."tokenAmountFormatted") as total_claimed,
        COUNT(tc.id) as claim_count,
        MAX(tc."claimedAt") as last_claim
      FROM token_claims tc
      LEFT JOIN user_stats us ON LOWER(us."walletAddress") = LOWER(tc."walletAddress")
      WHERE tc.status = 'claimed'
      GROUP BY tc."walletAddress", us."userFid"
      ORDER BY total_claimed DESC
      LIMIT 100
    `;

    return NextResponse.json({
      success: true,
      message: 'Sync completed successfully',
      stats: {
        currentBlock: currentBlock.toString(),
        fromBlock: fromBlock.toString(),
        eventsFound: logs.length,
        eventsProcessed: processedCount,
        errors: errorCount,
        orphanedClaims: orphanedClaims.count,
        topPlayers: (leaderboard as any[]).slice(0, 10).map((p, i) => ({
          rank: i + 1,
          address: `${p.walletAddress.slice(0, 6)}...${p.walletAddress.slice(-4)}`,
          totalClaimed: p.total_claimed,
          claims: p.claim_count
        }))
      }
    });

  } catch (error) {
    console.error('❌ Sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to sync onchain data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST endpoint to trigger manual sync
export async function POST(request: NextRequest) {
  return GET(request);
}