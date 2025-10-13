/**
 * 🔔 LEXIPOP NOTIFICATION SYSTEM
 *
 * Handles all Neynar-based push notifications for the Lexipop vocabulary game
 * Based on successful implementation from bitworld
 */

import { serverEnv } from './env';

// Notification API Types
interface NotificationPayload {
  target_user_fids?: number[];  // Specific users (optional for broadcast)
  title: string;               // Max 32 characters
  body: string;                // Max 128 characters
}

interface NotificationResponse {
  success: boolean;
  message?: string;
  error?: string;
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
  if (payload.title.length > 32) {
    console.warn('⚠️ Notification title truncated to 32 characters');
    payload.title = payload.title.substring(0, 32);
  }

  if (payload.body.length > 128) {
    console.warn('⚠️ Notification body truncated to 128 characters');
    payload.body = payload.body.substring(0, 128);
  }

  try {
    console.log('📤 Sending notification:', {
      target: payload.target_user_fids ? `${payload.target_user_fids.length} users` : 'broadcast',
      title: payload.title,
      body: payload.body
    });

    const response = await fetch('https://api.neynar.com/v2/farcaster-frame/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NEYNAR_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Neynar API error:', response.status, errorText);
      return {
        success: false,
        error: `API error: ${response.status} - ${errorText}`
      };
    }

    const result = await response.json();
    console.log('✅ Notification sent successfully:', result);

    return { success: true, message: 'Notification sent successfully' };

  } catch (error) {
    console.error('❌ Network error sending notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown network error'
    };
  }
}

/**
 * Send notification to specific user by FID
 */
export async function notifyUser(
  userFid: number,
  templateKey: keyof typeof NOTIFICATION_TEMPLATES
): Promise<NotificationResponse> {
  const template = NOTIFICATION_TEMPLATES[templateKey];

  return sendNeynarNotification({
    target_user_fids: [userFid],
    title: template.title,
    body: template.body,
  });
}

/**
 * Send custom notification to specific user
 */
export async function notifyUserCustom(
  userFid: number,
  title: string,
  body: string
): Promise<NotificationResponse> {
  return sendNeynarNotification({
    target_user_fids: [userFid],
    title,
    body,
  });
}

/**
 * Broadcast notification to all users (no target_user_fids)
 */
export async function broadcastNotification(
  templateKey: keyof typeof NOTIFICATION_TEMPLATES
): Promise<NotificationResponse> {
  const template = NOTIFICATION_TEMPLATES[templateKey];

  return sendNeynarNotification({
    title: template.title,
    body: template.body,
  });
}

/**
 * Broadcast custom notification to all users
 */
export async function broadcastCustomNotification(
  title: string,
  body: string
): Promise<NotificationResponse> {
  return sendNeynarNotification({
    title,
    body,
  });
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
      target_user_fids: batch,
      title: template.title,
      body: template.body,
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