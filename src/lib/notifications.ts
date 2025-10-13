/**
 * 🔔 LEXIPOP NOTIFICATION SYSTEM
 *
 * Handles all Neynar-based push notifications for the Lexipop vocabulary game
 * Based on successful implementation from bitworld
 */

import { serverEnv } from './env';
import { prisma } from './prisma';

// Notification API Types
interface NotificationPayload {
  target_fids?: number[];      // Specific users (optional for broadcast, max 100)
  notification: {
    title: string;             // Max 32 characters
    body: string;              // Max 128 characters
    target_url: string;        // Valid URL where users will be directed
  };
}

interface NotificationResponse {
  success: boolean;
  message?: string;
  error?: string;
  neynarResponse?: any;
}

// Notification Templates for Lexipop
export const NOTIFICATION_TEMPLATES = {
  // Daily engagement
  daily_reminder_1: {
    title: "🧠 Ready to Learn?",
    body: "Test your vocabulary knowledge! New words are waiting for you in Lexipop."
  },
  daily_reminder_2: {
    title: "📚 Word Challenge",
    body: "Expand your vocabulary today! Play Lexipop and discover new words."
  },
  daily_reminder_3: {
    title: "🎯 Daily Quiz Time",
    body: "Keep your streak alive! Answer 5 vocabulary questions in Lexipop."
  },
  daily_reminder_4: {
    title: "💡 Learn & Earn",
    body: "Build your word power and earn tokens. Start your Lexipop quiz now!"
  },
  daily_reminder_5: {
    title: "🏆 Beat Your Score",
    body: "Challenge yourself with new vocabulary! Your personal best awaits."
  },

  // Welcome notification
  welcome_miniapp: {
    title: "🎉 Welcome to Lexipop!",
    body: "Thanks for adding Lexipop! Get ready to boost your vocabulary and earn rewards."
  },

  // Achievement notifications
  perfect_game: {
    title: "🎉 Perfect Game!",
    body: "Incredible! You answered all 5 questions correctly. You're a vocabulary master!"
  },
  high_score: {
    title: "🚀 New High Score!",
    body: "Amazing performance! You've set a new personal best in Lexipop."
  },
  streak_milestone: {
    title: "🔥 Streak Master!",
    body: "Impressive! You've maintained your daily learning streak. Keep it up!"
  },

  // Engagement and retention
  comeback_reminder: {
    title: "📖 We Miss You!",
    body: "Your vocabulary is waiting! Come back and continue your learning journey."
  },
  leaderboard_update: {
    title: "📊 Leaderboard Move!",
    body: "You've climbed the ranks! Check your new position on the leaderboard."
  },
  new_words_added: {
    title: "🆕 Fresh Content!",
    body: "New vocabulary words have been added! Discover them in Lexipop."
  }
} as const;

/**
 * Core function to send notifications via Neynar API
 */
async function sendNeynarNotification(payload: NotificationPayload): Promise<NotificationResponse> {
  const { NEYNAR_API_KEY } = serverEnv;

  if (!NEYNAR_API_KEY) {
    console.error('❌ NEYNAR_API_KEY not configured');
    return { success: false, error: 'API key not configured' };
  }

  // Validate payload constraints
  if (payload.notification.title.length > 32) {
    console.warn('⚠️ Notification title truncated to 32 characters');
    payload.notification.title = payload.notification.title.substring(0, 32);
  }

  if (payload.notification.body.length > 128) {
    console.warn('⚠️ Notification body truncated to 128 characters');
    payload.notification.body = payload.notification.body.substring(0, 128);
  }

  try {
    console.log('📤 Sending notification to Neynar API:');
    console.log('🎯 Target:', payload.target_fids ? `${payload.target_fids.length} users` : 'broadcast');
    console.log('📝 Title:', payload.notification.title);
    console.log('📝 Body:', payload.notification.body);
    console.log('🔑 API Key present:', !!NEYNAR_API_KEY);
    console.log('📦 Full payload:', JSON.stringify(payload, null, 2));

    // Use the correct Neynar v2 frame notifications endpoint
    const requestUrl = 'https://api.neynar.com/v2/farcaster/frame/notifications/';
    console.log('🌐 Request URL:', requestUrl);

    const requestHeaders = {
      'x-api-key': NEYNAR_API_KEY,
      'Content-Type': 'application/json',
    };
    console.log('📋 Request headers:', { ...requestHeaders, 'x-api-key': requestHeaders['x-api-key'] ? '[PRESENT]' : '[MISSING]' });

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(payload),
    });

    console.log('📡 Response status:', response.status, response.statusText);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Neynar API error details:');
      console.error('   Status:', response.status, response.statusText);
      console.error('   Response body:', errorText);
      console.error('   Request payload was:', JSON.stringify(payload, null, 2));

      return {
        success: false,
        error: `Neynar API error: ${response.status} ${response.statusText} - ${errorText}`
      };
    }

    const result = await response.json();
    console.log('✅ Notification sent successfully!');
    console.log('📊 Neynar response:', JSON.stringify(result, null, 2));

    return { success: true, message: 'Notification sent successfully', neynarResponse: result };

  } catch (error) {
    console.error('❌ Network error sending notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown network error'
    };
  }
}

/**
 * Check if user has notifications enabled
 */
async function canUserReceiveNotifications(userFid: number): Promise<boolean> {
  try {
    const userStats = await prisma.userStats.findUnique({
      where: { userFid },
      select: { notificationsEnabled: true }
    });

    return userStats?.notificationsEnabled === true;
  } catch (error) {
    console.error(`❌ Error checking notification status for user ${userFid}:`, error);
    return false;
  }
}

/**
 * Send notification to specific user by FID (only if they have notifications enabled)
 */
export async function notifyUser(
  userFid: number,
  templateKey: keyof typeof NOTIFICATION_TEMPLATES
): Promise<NotificationResponse> {
  const template = NOTIFICATION_TEMPLATES[templateKey];

  // Check if user can receive notifications
  const canReceive = await canUserReceiveNotifications(userFid);
  if (!canReceive) {
    console.log(`🔇 User ${userFid} does not have notifications enabled, skipping`);
    return {
      success: false,
      error: `User ${userFid} does not have notifications enabled`
    };
  }

  return sendNeynarNotification({
    target_fids: [userFid],
    notification: {
      title: template.title,
      body: template.body,
      target_url: 'https://www.lexipop.xyz/miniapp',
    },
  });
}

/**
 * Send custom notification to specific user (only if they have notifications enabled)
 */
export async function notifyUserCustom(
  userFid: number,
  title: string,
  body: string
): Promise<NotificationResponse> {
  // Check if user can receive notifications
  const canReceive = await canUserReceiveNotifications(userFid);
  if (!canReceive) {
    console.log(`🔇 User ${userFid} does not have notifications enabled, skipping custom notification`);
    return {
      success: false,
      error: `User ${userFid} does not have notifications enabled`
    };
  }

  return sendNeynarNotification({
    target_fids: [userFid],
    notification: {
      title,
      body,
      target_url: 'https://www.lexipop.xyz/miniapp',
    },
  });
}

/**
 * Broadcast notification to all users with notifications enabled
 */
export async function broadcastNotification(
  templateKey: keyof typeof NOTIFICATION_TEMPLATES
): Promise<NotificationResponse> {
  const template = NOTIFICATION_TEMPLATES[templateKey];

  try {
    // Get all user FIDs who have notifications enabled
    const users = await prisma.userStats.findMany({
      select: { userFid: true },
      where: { notificationsEnabled: true },
      take: 100, // Neynar limit is 100 per request
    });

    const userFids = users.map(user => user.userFid);

    if (userFids.length === 0) {
      console.log('📭 No users with notifications enabled found for broadcast');
      return { success: false, error: 'No users with notifications enabled found' };
    }

    console.log(`📢 Broadcasting to ${userFids.length} users with notifications enabled`);

    return sendNeynarNotification({
      target_fids: userFids,
      notification: {
        title: template.title,
        body: template.body,
        target_url: 'https://www.lexipop.xyz/miniapp',
      },
    });
  } catch (error) {
    console.error('❌ Error fetching users for broadcast:', error);
    return { success: false, error: 'Failed to fetch users for broadcast' };
  }
}

/**
 * Broadcast custom notification to all users with notifications enabled
 */
export async function broadcastCustomNotification(
  title: string,
  body: string
): Promise<NotificationResponse> {
  try {
    // Get all user FIDs who have notifications enabled
    const users = await prisma.userStats.findMany({
      select: { userFid: true },
      where: { notificationsEnabled: true },
      take: 100, // Neynar limit is 100 per request
    });

    const userFids = users.map(user => user.userFid);

    if (userFids.length === 0) {
      console.log('📭 No users with notifications enabled found for broadcast');
      return { success: false, error: 'No users with notifications enabled found' };
    }

    console.log(`📢 Broadcasting custom notification to ${userFids.length} users with notifications enabled`);

    return sendNeynarNotification({
      target_fids: userFids,
      notification: {
        title,
        body,
        target_url: 'https://www.lexipop.xyz/miniapp',
      },
    });
  } catch (error) {
    console.error('❌ Error fetching users for custom broadcast:', error);
    return { success: false, error: 'Failed to fetch users for broadcast' };
  }
}

/**
 * Send notifications to multiple specific users
 */
export async function notifyMultipleUsers(
  userFids: number[],
  templateKey: keyof typeof NOTIFICATION_TEMPLATES
): Promise<NotificationResponse> {
  const template = NOTIFICATION_TEMPLATES[templateKey];

  // Neynar might have limits on bulk notifications, so we batch them
  const batchSize = 100; // Adjust based on Neynar's limits
  const batches = [];

  for (let i = 0; i < userFids.length; i += batchSize) {
    batches.push(userFids.slice(i, i + batchSize));
  }

  console.log(`📤 Sending to ${userFids.length} users in ${batches.length} batches`);

  let successCount = 0;
  let errorCount = 0;

  for (const batch of batches) {
    const result = await sendNeynarNotification({
      target_fids: batch,
      notification: {
        title: template.title,
        body: template.body,
        target_url: 'https://www.lexipop.xyz/miniapp',
      },
    });

    if (result.success) {
      successCount += batch.length;
    } else {
      errorCount += batch.length;
    }

    // Small delay between batches to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`✅ Batch notification complete: ${successCount} success, ${errorCount} errors`);

  return {
    success: errorCount === 0,
    message: `Sent to ${successCount} users, ${errorCount} errors`,
  };
}

/**
 * Get a random daily reminder template
 */
export function getRandomDailyReminder(): keyof typeof NOTIFICATION_TEMPLATES {
  const dailyReminders = [
    'daily_reminder_1',
    'daily_reminder_2',
    'daily_reminder_3',
    'daily_reminder_4',
    'daily_reminder_5'
  ] as const;

  const randomIndex = Math.floor(Math.random() * dailyReminders.length);
  return dailyReminders[randomIndex];
}

/**
 * Schedule daily reminders (to be called by cron job)
 */
export async function scheduleDailyReminders(): Promise<NotificationResponse> {
  const randomTemplate = getRandomDailyReminder();
  console.log(`📅 Sending daily reminder: ${randomTemplate}`);

  return broadcastNotification(randomTemplate);
}

/**
 * Get notification statistics (for admin dashboard)
 */
export function getNotificationStats() {
  return {
    totalTemplates: Object.keys(NOTIFICATION_TEMPLATES).length,
    dailyReminderCount: 5,
    achievementCount: 3,
    engagementCount: 3,
    lastUpdated: new Date().toISOString(),
  };
}