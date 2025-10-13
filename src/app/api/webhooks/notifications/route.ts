/**
 * 🔔 NEYNAR NOTIFICATION WEBHOOKS
 *
 * Handles webhook events from Neynar when users enable/disable notifications
 * Updates user notification preferences in the database
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Farcaster miniapp webhook event types
interface NotificationWebhookEvent {
  event: 'miniapp_added' | 'notifications_enabled' | 'notifications_disabled';
  notificationDetails?: {
    url: string;
    token: string;
  };
  data?: {
    user_fid: number;
    notification_token?: string;
    notification_url?: string;
  };
  userFid?: number; // For miniapp_added events
}

/**
 * POST /api/webhooks/notifications - Handle Farcaster miniapp and notification events
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📥 Received notification webhook');

    const body: NotificationWebhookEvent = await request.json();
    const { event, notificationDetails, data, userFid } = body;

    console.log('📨 Webhook event:', { event, userFid: userFid || data?.user_fid });

    // Handle miniapp_added event
    if (event === 'miniapp_added') {
      if (!userFid) {
        return NextResponse.json(
          { success: false, error: 'userFid required for miniapp_added event' },
          { status: 400 }
        );
      }

      console.log(`🎉 User ${userFid} added miniapp to Farcaster!`);

      // Create or update user stats record with notification settings
      let userStats = await prisma.userStats.findUnique({
        where: { userFid }
      });

      if (!userStats) {
        console.log(`👤 Creating new user stats record for FID: ${userFid}`);
        userStats = await prisma.userStats.create({
          data: {
            userFid,
            notificationsEnabled: !!notificationDetails,
            notificationToken: notificationDetails?.token || null,
            notificationUrl: notificationDetails?.url || null,
          }
        });
      } else {
        // Update existing user with notification details if provided
        if (notificationDetails) {
          await prisma.userStats.update({
            where: { userFid },
            data: {
              notificationsEnabled: true,
              notificationToken: notificationDetails.token,
              notificationUrl: notificationDetails.url,
              updatedAt: new Date()
            }
          });
          console.log(`🔔 Notifications enabled for user ${userFid} via miniapp_added`);
        }
      }

      // Send welcome notification if notifications are enabled
      if (notificationDetails) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3004'}/api/notifications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'welcome_miniapp', // Welcome notification
              userFid: userFid
            })
          });

          if (response.ok) {
            console.log(`✅ Welcome notification sent to user ${userFid}`);
          }
        } catch (error) {
          console.error(`❌ Failed to send welcome notification to user ${userFid}:`, error);
        }
      }

      return NextResponse.json({
        success: true,
        message: `Processed miniapp_added for user ${userFid}`,
        notificationsEnabled: !!notificationDetails,
        timestamp: new Date().toISOString()
      });
    }

    // Handle legacy notification events
    const type = event || (body as any).type; // Support both new and old format
    const userData = data || { user_fid: userFid };

    if (!type || !userData?.user_fid) {
      return NextResponse.json(
        { success: false, error: 'Invalid webhook payload' },
        { status: 400 }
      );
    }

    const targetUserFid = userData.user_fid;

    // Find or create user stats record
    let userStats = await prisma.userStats.findUnique({
      where: { userFid: targetUserFid }
    });

    if (!userStats) {
      console.log(`👤 Creating new user stats record for FID: ${targetUserFid}`);
      userStats = await prisma.userStats.create({
        data: {
          userFid: targetUserFid,
          notificationsEnabled: false,
        }
      });
    }

    // Update notification settings based on event type
    switch (type) {
      case 'notifications_enabled':
        console.log(`✅ Enabling notifications for FID: ${targetUserFid}`);

        await prisma.userStats.update({
          where: { userFid: targetUserFid },
          data: {
            notificationsEnabled: true,
            notificationToken: userData.notification_token || null,
            notificationUrl: userData.notification_url || null,
            updatedAt: new Date()
          }
        });

        console.log(`🔔 Notifications enabled for user ${targetUserFid}`);
        break;

      case 'notifications_disabled':
        console.log(`❌ Disabling notifications for FID: ${targetUserFid}`);

        await prisma.userStats.update({
          where: { userFid: targetUserFid },
          data: {
            notificationsEnabled: false,
            notificationToken: null,
            notificationUrl: null,
            updatedAt: new Date()
          }
        });

        console.log(`🔕 Notifications disabled for user ${targetUserFid}`);
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
      message: `Processed ${type} for user ${targetUserFid}`,
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