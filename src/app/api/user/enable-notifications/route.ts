/**
 * 🔔 ENABLE NOTIFICATIONS API
 *
 * Handles enabling notifications for users (fallback for direct API calls)
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/user/enable-notifications - Method not allowed
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed - use POST to enable notifications' },
    { status: 405 }
  );
}

/**
 * POST /api/user/enable-notifications - Enable notifications for a user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userFid } = body;

    // More detailed validation and error messages
    if (userFid === undefined || userFid === null) {
      console.error('❌ Missing userFid in request body');
      return NextResponse.json(
        { success: false, error: 'userFid is required in request body' },
        { status: 400 }
      );
    }

    if (typeof userFid !== 'number') {
      console.error(`❌ Invalid userFid type: ${typeof userFid}, value: ${userFid}`);
      return NextResponse.json(
        { success: false, error: `userFid must be a number, received ${typeof userFid}` },
        { status: 400 }
      );
    }

    if (userFid <= 0) {
      console.error(`❌ Invalid userFid value: ${userFid}`);
      return NextResponse.json(
        { success: false, error: 'userFid must be a positive number' },
        { status: 400 }
      );
    }

    // Find or create user stats record
    const existingUser = await prisma.userStats.findUnique({
      where: { userFid }
    });

    let userStats;

    if (existingUser) {
      // Update existing user
      userStats = await prisma.userStats.update({
        where: { userFid },
        data: {
          notificationsEnabled: true,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new user stats record
      userStats = await prisma.userStats.create({
        data: {
          userFid,
          notificationsEnabled: true
        }
      });
    }

    console.log(`🔔 Notifications enabled for user ${userFid}`);

    return NextResponse.json({
      success: true,
      message: `Notifications enabled for user ${userFid}`,
      userFid,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error enabling notifications:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to enable notifications'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}