/**
 * 🔔 NOTIFICATION API ENDPOINTS
 *
 * Handles sending notifications through Neynar API
 * Supports various notification types and target audiences
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  notifyUser,
  notifyUserCustom,
  broadcastNotification,
  broadcastCustomNotification,
  notifyMultipleUsers,
  scheduleDailyReminders,
  getNotificationStats,
  notifyUserDirect,
  broadcastNotificationDirect,
  testNeynarEndpoints,
  NOTIFICATION_TEMPLATES
} from '@/lib/notifications';

// Supported notification types
type NotificationType =
  | 'perfect_game'
  | 'high_score'
  | 'streak_milestone'
  | 'comeback_reminder'
  | 'leaderboard_update'
  | 'new_words_added'
  | 'daily_reminder'
  | 'custom';

interface NotificationRequest {
  type: NotificationType;
  userFid?: number;
  userFids?: number[];
  title?: string;
  body?: string;
}

/**
 * GET /api/notifications - Get notification stats and available types
 */
export async function GET() {
  try {
    const stats = getNotificationStats();
    const availableTemplates = Object.keys(NOTIFICATION_TEMPLATES);

    return NextResponse.json({
      success: true,
      data: {
        stats,
        availableTemplates,
        supportedTypes: [
          'perfect_game',
          'high_score',
          'streak_milestone',
          'comeback_reminder',
          'leaderboard_update',
          'new_words_added',
          'daily_reminder',
          'custom'
        ]
      }
    });
  } catch (error) {
    console.error('❌ Error getting notification stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get notification stats' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications - Send notifications
 */
export async function POST(request: NextRequest) {
  try {
    const body: NotificationRequest = await request.json();
    const { type, userFid, userFids, title, body: customBody } = body;

    console.log('📨 Notification request:', { type, userFid, userFids: userFids?.length });

    // Validate request
    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Notification type is required' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'daily_reminder':
        // Broadcast daily reminder to all users
        result = await scheduleDailyReminders();
        break;

      case 'custom':
        // Custom notification
        if (!title || !customBody) {
          return NextResponse.json(
            { success: false, error: 'Title and body are required for custom notifications' },
            { status: 400 }
          );
        }

        if (userFid) {
          // Send to specific user
          result = await notifyUserCustom(userFid, title, customBody);
        } else if (userFids && userFids.length > 0) {
          // Send to multiple specific users - need to implement custom multi-user function
          // For now, send to each user individually
          let successCount = 0;
          let errorCount = 0;

          for (const fid of userFids) {
            const individualResult = await notifyUserCustom(fid, title, customBody);
            if (individualResult.success) {
              successCount++;
            } else {
              errorCount++;
            }
          }

          result = {
            success: errorCount === 0,
            message: `Custom notification sent to ${successCount} users, ${errorCount} errors`
          };
        } else {
          // Broadcast to all users
          result = await broadcastCustomNotification(title, customBody);
        }
        break;

      default:
        // Template-based notifications
        if (!Object.keys(NOTIFICATION_TEMPLATES).includes(type as keyof typeof NOTIFICATION_TEMPLATES)) {
          return NextResponse.json(
            { success: false, error: `Invalid notification type: ${type}` },
            { status: 400 }
          );
        }

        const templateKey = type as keyof typeof NOTIFICATION_TEMPLATES;

        if (userFid) {
          // Send to specific user
          result = await notifyUser(userFid, templateKey);
        } else if (userFids && userFids.length > 0) {
          // Send to multiple specific users
          result = await notifyMultipleUsers(userFids, templateKey);
        } else {
          // Broadcast to all users
          result = await broadcastNotification(templateKey);
        }
        break;
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message || 'Notification sent successfully',
        type,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to send notification',
          type
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Error in notification API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notifications - Test notification endpoint (development and testing)
 */
export async function PUT(request: NextRequest) {

  try {
    const { testType, fid } = await request.json();

    console.log(`🧪 Running notification test: ${testType}`, { fid });

    let result;

    switch (testType) {
      case 'broadcast':
        console.log('📢 Testing broadcast notification...');
        result = await broadcastNotification('daily_reminder_1');
        break;
      case 'individual':
        const testFid = fid || 12345;
        console.log(`👤 Testing individual notification to FID ${testFid}...`);
        result = await notifyUser(testFid, 'perfect_game');
        break;
      case 'custom':
        console.log('🎨 Testing custom notification...');
        result = await broadcastCustomNotification('🧪 Test from Lexipop', 'This is a test notification to verify Neynar integration is working!');
        break;
      case 'direct':
        const directFid = fid || 1482;
        console.log(`🚀 Testing direct notification to FID ${directFid} (bypassing user preferences)...`);
        result = await notifyUserDirect(directFid, {
          title: '🧪 Direct Test',
          body: 'Testing direct notification from Lexipop!',
          target_url: 'https://www.lexipop.xyz'
        });
        // Convert boolean result to full response format
        result = { success: result, message: result ? 'Direct notification sent successfully' : 'Direct notification failed' };
        break;
      case 'direct_broadcast':
        console.log('📢 Testing direct broadcast (bypassing user preferences)...');
        result = await broadcastNotificationDirect({
          title: '🧪 Direct Broadcast',
          body: 'Testing direct broadcast from Lexipop!',
          target_url: 'https://www.lexipop.xyz'
        });
        // Convert boolean result to full response format
        result = { success: result, message: result ? 'Direct broadcast sent successfully' : 'Direct broadcast failed' };
        break;
      case 'endpoints':
        const endpointFid = fid || 1482;
        console.log(`🔍 Testing all endpoint configurations for FID ${endpointFid}...`);
        result = await testNeynarEndpoints({
          title: '🧪 Endpoint Test',
          body: 'Testing all Neynar endpoint configurations!',
          target_url: 'https://www.lexipop.xyz'
        }, [endpointFid]);
        break;
      case 'environment':
        console.log('🔍 Testing environment configuration...');
        const { serverEnv } = await import('@/lib/env');
        result = {
          success: true,
          message: 'Environment check completed',
          data: {
            hasNeynarKey: !!serverEnv.NEYNAR_API_KEY,
            hasClientId: !!serverEnv.NEYNAR_CLIENT_ID,
            nodeEnv: serverEnv.NODE_ENV
          }
        };
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid test type. Use: broadcast, individual, custom, direct, direct_broadcast, endpoints, environment' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      testType,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in notification test:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Test failed'
      },
      { status: 500 }
    );
  }
}