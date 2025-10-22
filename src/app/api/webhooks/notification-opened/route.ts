/**
 * 📱 NOTIFICATION OPENED WEBHOOK
 *
 * Tracks when users open push notifications from Neynar
 * This data is used for analytics and improving notification engagement
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface NotificationOpenedEvent {
  event: 'notification_opened';
  userFid: number;
  notificationId?: string;
  notificationType?: string;
  timestamp?: string;
  metadata?: {
    title?: string;
    body?: string;
    data?: Record<string, any>;
  };
}

/**
 * POST /api/webhooks/notification-opened - Handle notification open events from Neynar
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📱 Received notification opened webhook');

    const body: NotificationOpenedEvent = await request.json();
    const { userFid, notificationId, notificationType, timestamp, metadata } = body;

    if (!userFid) {
      return NextResponse.json(
        { success: false, error: 'userFid is required' },
        { status: 400 }
      );
    }

    console.log(`📊 User ${userFid} opened notification:`, {
      notificationId,
      type: notificationType,
      timestamp: timestamp || new Date().toISOString()
    });

    // Update user stats to track last notification interaction
    const userStats = await prisma.userStats.findUnique({
      where: { userFid }
    });

    if (userStats) {
      await prisma.userStats.update({
        where: { userFid },
        data: {
          lastNotificationInteraction: new Date(timestamp || Date.now()),
          updatedAt: new Date()
        }
      });
    }

    // Track notification analytics (you can expand this to store in a separate analytics table)
    console.log('📈 Notification analytics:', {
      userFid,
      notificationType,
      opened: true,
      openedAt: timestamp || new Date().toISOString(),
      metadata
    });

    // Handle specific notification types
    if (notificationType === 'daily_word') {
      // User opened daily word notification - maybe track engagement
      console.log(`📚 User ${userFid} engaged with daily word notification`);

      // Could trigger an action like marking today's word as seen
      // or recording engagement metrics
    } else if (notificationType === 'streak_reminder') {
      // User opened streak reminder
      console.log(`🔥 User ${userFid} responded to streak reminder`);
    } else if (notificationType === 'achievement') {
      // User opened achievement notification
      console.log(`🏆 User ${userFid} viewed achievement notification`);
    }

    return NextResponse.json({
      success: true,
      message: `Tracked notification open for user ${userFid}`,
      notificationId,
      notificationType,
      timestamp: timestamp || new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error processing notification opened webhook:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process notification open event'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * GET /api/webhooks/notification-opened - Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Notification opened webhook endpoint is active',
    endpoint: '/api/webhooks/notification-opened',
    supportedEvents: ['notification_opened'],
    timestamp: new Date().toISOString()
  });
}