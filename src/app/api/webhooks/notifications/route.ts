/**
 * 🔔 NEYNAR NOTIFICATION WEBHOOKS
 *
 * Handles webhook events from Neynar when users enable/disable notifications
 * Updates user notification preferences in the database
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Neynar webhook event types
interface NotificationWebhookEvent {
  type: 'notifications_enabled' | 'notifications_disabled';
  data: {
    user_fid: number;
    notification_token?: string;
    notification_url?: string;
  };
}

/**
 * POST /api/webhooks/notifications - Handle Neynar notification events
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📥 Received notification webhook');

    const body: NotificationWebhookEvent = await request.json();
    const { type, data } = body;

    console.log('📨 Webhook event:', { type, userFid: data.user_fid });

    if (!type || !data?.user_fid) {
      return NextResponse.json(
        { success: false, error: 'Invalid webhook payload' },
        { status: 400 }
      );
    }

    const userFid = data.user_fid;

    // Find or create user stats record
    let userStats = await prisma.userStats.findUnique({
      where: { userFid }
    });

    if (!userStats) {
      console.log(`👤 Creating new user stats record for FID: ${userFid}`);
      userStats = await prisma.userStats.create({
        data: {
          userFid,
          notificationsEnabled: false,
        }
      });
    }

    // Update notification settings based on event type
    switch (type) {
      case 'notifications_enabled':
        console.log(`✅ Enabling notifications for FID: ${userFid}`);

        await prisma.userStats.update({
          where: { userFid },
          data: {
            notificationsEnabled: true,
            notificationToken: data.notification_token || null,
            notificationUrl: data.notification_url || null,
            updatedAt: new Date()
          }
        });

        console.log(`🔔 Notifications enabled for user ${userFid}`);
        break;

      case 'notifications_disabled':
        console.log(`❌ Disabling notifications for FID: ${userFid}`);

        await prisma.userStats.update({
          where: { userFid },
          data: {
            notificationsEnabled: false,
            notificationToken: null,
            notificationUrl: null,
            updatedAt: new Date()
          }
        });

        console.log(`🔕 Notifications disabled for user ${userFid}`);
        break;

      default:
        console.warn(`⚠️ Unknown webhook event type: ${type}`);
        return NextResponse.json(
          { success: false, error: `Unknown event type: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${type} for user ${userFid}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error processing notification webhook:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Webhook processing failed'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * GET /api/webhooks/notifications - Health check for webhook endpoint
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Notification webhook endpoint is active',
    endpoint: '/api/webhooks/notifications',
    supportedEvents: ['notifications_enabled', 'notifications_disabled'],
    timestamp: new Date().toISOString()
  });
}

/**
 * Helper function to get notification statistics
 * Note: This is not exported since Next.js routes can only export HTTP methods
 */
async function getNotificationWebhookStats() {
  try {
    const stats = await prisma.userStats.aggregate({
      _count: {
        id: true,
      },
      where: {
        notificationsEnabled: true
      }
    });

    const totalUsers = await prisma.userStats.count();

    return {
      totalUsers,
      enabledNotifications: stats._count.id,
      disabledNotifications: totalUsers - stats._count.id,
      enabledPercentage: totalUsers > 0 ? ((stats._count.id / totalUsers) * 100).toFixed(2) : '0'
    };
  } catch (error) {
    console.error('❌ Error getting notification stats:', error);
    return null;
  }
}