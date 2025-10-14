import { NextResponse } from 'next/server';

/**
 * DEBUG ENDPOINT - Environment Check
 *
 * Checks if required environment variables are present for blockchain sync
 */

export async function GET() {
  try {
    const checks = {
      // Required for blockchain sync
      hasAlchemyKey: !!process.env.ALCHEMY_API_KEY,
      hasCronSecret: !!process.env.CRON_SECRET,
      hasNeynarKey: !!process.env.NEYNAR_API_KEY,

      // Database
      hasDatabaseUrl: !!process.env.DATABASE_URL,

      // App URL
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'Not set',

      // Contract addresses (hardcoded in sync)
      contracts: {
        moneyTree: '0xe636baaf2c390a591edbffaf748898eb3f6ff9a1',
        lexipopToken: '0xf732f31f73e7dc21299f3ab42bd22e8a7c6b4b07'
      }
    };

    return NextResponse.json({
      success: true,
      checks,
      message: 'Environment check completed'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to check environment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}