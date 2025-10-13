/**
 * 🔔 USER NOTIFICATION STATUS API
 *
 * Handles checking and updating user notification preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/user/notification-status - Check if user has notifications enabled
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fidParam = searchParams.get('fid');

    if (!fidParam) {
      return NextResponse.json(
        { success: false, error: 'FID parameter is required' },
        { status: 400 }
      );
    }

    const userFid = parseInt(fidParam);

    if (isNaN(userFid)) {
      return NextResponse.json(
        { success: false, error: 'Invalid FID format' },
        { status: 400 }
      );
    }

    // Find user's notification settings
    const userStats = await prisma.userStats.findUnique({
      where: { userFid },
      select: {
        notificationsEnabled: true,
        notificationToken: true,
        notificationUrl: true
      }
    });

    if (!userStats) {
      // User doesn't exist yet, notifications are disabled by default
      return NextResponse.json({
        success: true,
        enabled: false,
        userFid,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: true,
      enabled: userStats.notificationsEnabled,
      hasToken: !!userStats.notificationToken,
      userFid,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error checking notification status:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check notification status'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * POST /api/user/notification-status - Update user notification preferences
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userFid, enabled, notificationToken, notificationUrl } = body;

    if (!userFid || typeof userFid !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Valid userFid is required' },
        { status: 400 }
      );
    }

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'enabled must be a boolean' },
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
          notificationsEnabled: enabled,
          notificationToken: enabled ? notificationToken : null,
          notificationUrl: enabled ? notificationUrl : null,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new user stats record
      userStats = await prisma.userStats.create({
        data: {
          userFid,
          notificationsEnabled: enabled,
          notificationToken: enabled ? notificationToken : null,
          notificationUrl: enabled ? notificationUrl : null
        }
      });
    }

    console.log(`🔔 Updated notification settings for user ${userFid}: ${enabled ? 'enabled' : 'disabled'}`);

    return NextResponse.json({
      success: true,
      message: `Notifications ${enabled ? 'enabled' : 'disabled'} for user ${userFid}`,
      userFid,
      enabled,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error updating notification status:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update notification status'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}