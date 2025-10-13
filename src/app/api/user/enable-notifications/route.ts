/**
 * 🔔 ENABLE NOTIFICATIONS API
 *
 * Handles enabling notifications for users (fallback for direct API calls)
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/user/enable-notifications - Enable notifications for a user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userFid } = body;

    if (!userFid || typeof userFid !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Valid userFid is required' },
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