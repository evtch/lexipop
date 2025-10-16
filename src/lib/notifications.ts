/**
 * 🔔 LEXIPOP NOTIFICATION SYSTEM
 *
 * Handles all Neynar-based push notifications for the Lexipop vocabulary game
 * Based on successful implementation from bitworld
 */

import { serverEnv } from './env';
import { prisma } from './prisma';

// Notification API Types - Using bitworld's proven format
interface NotificationPayload {
  client_id: string;
  notification: {
    title: string;             // Max 32 characters
    body: string;              // Max 128 characters
    target_url?: string;       // Valid URL where users will be directed
  };
  target_fids?: number[];      // Specific users (optional for broadcast, max 100)
  filters?: {
    has_added_app?: boolean;
    min_score?: number;
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
  },

  // Educational notifications - Word Teasers
  word_teaser_1: {
    title: "🤔 Word Challenge",
    body: "Can you define 'perspicacious'? Test yourself in Lexipop!"
  },
  word_teaser_2: {
    title: "💭 Vocabulary Quiz",
    body: "What does 'serendipity' mean? Find out in today's quiz!"
  },
  word_teaser_3: {
    title: "🎯 Word of the Moment",
    body: "Challenge: Use 'mellifluous' in a sentence today!"
  },
  word_teaser_4: {
    title: "🧩 Quick Question",
    body: "Do you know what 'ephemeral' means? Discover now!"
  },
  word_teaser_5: {
    title: "💡 Vocabulary Boost",
    body: "Can you guess the meaning of 'ubiquitous'? Play to learn!"
  },

  // Educational notifications - Word of the Day with definitions
  word_of_day_1: {
    title: "📖 Word: Ephemeral",
    body: "Lasting for a very short time. Learn more words like this!"
  },
  word_of_day_2: {
    title: "✨ Word: Quixotic",
    body: "Extremely idealistic and unrealistic. Expand your vocabulary!"
  },
  word_of_day_3: {
    title: "🌟 Word: Mellifluous",
    body: "Sweet or musical sounding. Discover more beautiful words!"
  },
  word_of_day_4: {
    title: "📚 Word: Sagacious",
    body: "Having good judgment and wisdom. Build your word power!"
  },
  word_of_day_5: {
    title: "💫 Word: Serendipity",
    body: "Happy accident or pleasant surprise. Learn daily!"
  },

  // Educational notifications - Context Clues
  context_clue_1: {
    title: "🔍 Context Challenge",
    body: "The ephemeral fame lasted weeks. What does ephemeral mean?"
  },
  context_clue_2: {
    title: "🎯 Guess the Word",
    body: "Her sagacious advice saved us. Can you define sagacious?"
  },
  context_clue_3: {
    title: "💭 Word Detective",
    body: "The ubiquitous smartphones are everywhere. What's ubiquitous?"
  },
  context_clue_4: {
    title: "🧩 Vocabulary Puzzle",
    body: "His mellifluous voice charmed all. Define mellifluous!"
  },
  context_clue_5: {
    title: "📝 Context Clues",
    body: "The quixotic plan was too idealistic. What's quixotic?"
  },

  // Educational notifications - Difficulty-based challenges
  beginner_challenge: {
    title: "🌱 Easy Word Quiz",
    body: "Ready for a simple word? Define 'benevolent' in Lexipop!"
  },
  intermediate_challenge: {
    title: "🚀 Level Up!",
    body: "Medium challenge: What does 'ubiquitous' mean? Test yourself!"
  },
  advanced_challenge: {
    title: "🏆 Master Challenge",
    body: "Expert level: Can you define 'sesquipedalian'? Prove it!"
  },
  genius_challenge: {
    title: "🧠 Genius Mode",
    body: "Ultimate test: Define 'perspicacious'! Are you ready?"
  },
  weekly_challenge: {
    title: "📅 Weekly Challenge",
    body: "This week's word: 'evanescent'. Can you master it?"
  }
} as const;

/**
 * Core function to send notifications via Neynar API - Using bitworld's proven implementation
 */
async function sendNeynarNotification(
  notification: { title: string; body: string; target_url?: string },
  targetFids?: number[]
): Promise<NotificationResponse> {
  const { NEYNAR_API_KEY } = serverEnv;

  if (!NEYNAR_API_KEY) {
    console.error('❌ Missing Neynar API key');
    return { success: false, error: 'Missing Neynar API key' };
  }

  try {
    console.log('📬 Sending notification via Neynar:', notification);

    // Validate notification constraints
    if (notification.title.length > 32) {
      console.warn('⚠️ Title truncated to 32 characters');
      notification.title = notification.title.substring(0, 32);
    }
    if (notification.body.length > 128) {
      console.warn('⚠️ Body truncated to 128 characters');
      notification.body = notification.body.substring(0, 128);
    }

    const payload = {
      notification: {
        title: notification.title,
        body: notification.body,
        target_url: notification.target_url || 'https://www.lexipop.xyz'
      },
      target_fids: targetFids && targetFids.length > 0 ? targetFids : []
    };

    console.log('📡 Neynar payload:', JSON.stringify(payload, null, 2));

    const response = await fetch('https://api.neynar.com/v2/farcaster/frame/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': NEYNAR_API_KEY
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('❌ Neynar notification failed:', response.status, responseData);
      return { success: false, error: responseData.message || 'Failed to send notification' };
    }

    console.log('✅ Notification sent successfully via Neynar:', responseData);
    return { success: true, message: 'Notification sent successfully', neynarResponse: responseData };
  } catch (error) {
    console.error('❌ Error sending Neynar notification:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
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
    title: template.title,
    body: template.body,
    target_url: 'https://www.lexipop.xyz'
  }, [userFid]);
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
    title,
    body,
    target_url: 'https://www.lexipop.xyz'
  }, [userFid]);
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
      title: template.title,
      body: template.body,
      target_url: 'https://www.lexipop.xyz'
    }, userFids);
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
      title,
      body,
      target_url: 'https://www.lexipop.xyz'
    }, userFids);
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
      title: template.title,
      body: template.body,
      target_url: 'https://www.lexipop.xyz'
    }, batch);

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
 * Get a random word teaser template
 */
export function getRandomWordTeaser(): keyof typeof NOTIFICATION_TEMPLATES {
  const wordTeasers = [
    'word_teaser_1',
    'word_teaser_2',
    'word_teaser_3',
    'word_teaser_4',
    'word_teaser_5'
  ] as const;

  const randomIndex = Math.floor(Math.random() * wordTeasers.length);
  return wordTeasers[randomIndex];
}

/**
 * Get a random word of the day template
 */
export function getRandomWordOfDay(): keyof typeof NOTIFICATION_TEMPLATES {
  const wordOfDayTemplates = [
    'word_of_day_1',
    'word_of_day_2',
    'word_of_day_3',
    'word_of_day_4',
    'word_of_day_5'
  ] as const;

  const randomIndex = Math.floor(Math.random() * wordOfDayTemplates.length);
  return wordOfDayTemplates[randomIndex];
}

/**
 * Get a random context clue template
 */
export function getRandomContextClue(): keyof typeof NOTIFICATION_TEMPLATES {
  const contextClues = [
    'context_clue_1',
    'context_clue_2',
    'context_clue_3',
    'context_clue_4',
    'context_clue_5'
  ] as const;

  const randomIndex = Math.floor(Math.random() * contextClues.length);
  return contextClues[randomIndex];
}

/**
 * Get difficulty-based challenge template
 */
export function getDifficultyChallenge(userLevel: 'beginner' | 'intermediate' | 'advanced' | 'genius' = 'intermediate'): keyof typeof NOTIFICATION_TEMPLATES {
  const challengeMap = {
    beginner: 'beginner_challenge',
    intermediate: 'intermediate_challenge',
    advanced: 'advanced_challenge',
    genius: 'genius_challenge'
  } as const;

  return challengeMap[userLevel];
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
 * Send educational word teaser notifications
 */
export async function sendWordTeaser(userFid?: number): Promise<NotificationResponse> {
  try {
    // Try to create a dynamic notification first
    const dynamicNotification = await createDynamicWordNotification('teaser');

    if (dynamicNotification) {
      console.log('📚 Sending dynamic word teaser notification');
      if (userFid) {
        return await sendNeynarNotification(dynamicNotification, [userFid]);
      } else {
        return await sendNeynarNotification(dynamicNotification);
      }
    } else {
      // Fallback to template-based notification
      const template = getRandomWordTeaser();
      console.log(`📚 Sending template word teaser: ${template}`);

      if (userFid) {
        return notifyUser(userFid, template);
      } else {
        return broadcastNotification(template);
      }
    }
  } catch (error) {
    console.error('❌ Error sending word teaser:', error);
    return { success: false, error: 'Failed to send word teaser notification' };
  }
}

/**
 * Send word of the day notifications with real definitions
 */
export async function sendWordOfTheDay(userFid?: number): Promise<NotificationResponse> {
  try {
    // Try to create a dynamic notification first
    const dynamicNotification = await createDynamicWordNotification('word_of_day');

    if (dynamicNotification) {
      console.log('📖 Sending dynamic word of the day notification');
      if (userFid) {
        return await sendNeynarNotification(dynamicNotification, [userFid]);
      } else {
        return await sendNeynarNotification(dynamicNotification);
      }
    } else {
      // Fallback to template-based notification
      const template = getRandomWordOfDay();
      console.log(`📖 Sending template word of the day: ${template}`);

      if (userFid) {
        return notifyUser(userFid, template);
      } else {
        return broadcastNotification(template);
      }
    }
  } catch (error) {
    console.error('❌ Error sending word of the day:', error);
    return { success: false, error: 'Failed to send word of the day notification' };
  }
}

/**
 * Send context clue challenge notifications
 */
export async function sendContextClueChallenge(userFid?: number): Promise<NotificationResponse> {
  try {
    // Try to create a dynamic notification first
    const dynamicNotification = await createDynamicWordNotification('context_clue');

    if (dynamicNotification) {
      console.log('🔍 Sending dynamic context clue notification');
      if (userFid) {
        return await sendNeynarNotification(dynamicNotification, [userFid]);
      } else {
        return await sendNeynarNotification(dynamicNotification);
      }
    } else {
      // Fallback to template-based notification
      const template = getRandomContextClue();
      console.log(`🔍 Sending template context clue: ${template}`);

      if (userFid) {
        return notifyUser(userFid, template);
      } else {
        return broadcastNotification(template);
      }
    }
  } catch (error) {
    console.error('❌ Error sending context clue challenge:', error);
    return { success: false, error: 'Failed to send context clue challenge' };
  }
}

/**
 * Send difficulty-based challenge based on user's skill level
 */
export async function sendDifficultyChallenge(
  userLevel: 'beginner' | 'intermediate' | 'advanced' | 'genius' = 'intermediate',
  userFid?: number
): Promise<NotificationResponse> {
  try {
    // Map user level to word difficulty
    const difficultyMap = {
      beginner: 'easy' as const,
      intermediate: 'medium' as const,
      advanced: 'hard' as const,
      genius: 'hard' as const
    };

    // Try to create a dynamic notification first
    const dynamicNotification = await createDynamicWordNotification(
      'difficulty_challenge',
      difficultyMap[userLevel],
      userLevel
    );

    if (dynamicNotification) {
      console.log(`🎯 Sending dynamic ${userLevel} challenge notification`);
      if (userFid) {
        return await sendNeynarNotification(dynamicNotification, [userFid]);
      } else {
        return await sendNeynarNotification(dynamicNotification);
      }
    } else {
      // Fallback to template-based notification
      const template = getDifficultyChallenge(userLevel);
      console.log(`🎯 Sending template ${userLevel} challenge: ${template}`);

      if (userFid) {
        return notifyUser(userFid, template);
      } else {
        return broadcastNotification(template);
      }
    }
  } catch (error) {
    console.error('❌ Error sending difficulty challenge:', error);
    return { success: false, error: 'Failed to send difficulty challenge' };
  }
}

/**
 * Helper function to send notification to specific user (bitworld style)
 */
export async function notifyUserDirect(fid: number, notification: { title: string; body: string; target_url?: string }): Promise<boolean> {
  const result = await sendNeynarNotification(notification, [fid]);
  return result.success;
}

/**
 * Helper function to broadcast notification to all users (bitworld style)
 */
export async function broadcastNotificationDirect(notification: { title: string; body: string; target_url?: string }): Promise<boolean> {
  const result = await sendNeynarNotification(notification);
  return result.success;
}

/**
 * Create dynamic word-based notifications using actual database words
 */
export async function createDynamicWordNotification(
  type: 'teaser' | 'word_of_day' | 'context_clue' | 'difficulty_challenge',
  difficulty?: 'easy' | 'medium' | 'hard',
  userLevel?: 'beginner' | 'intermediate' | 'advanced' | 'genius'
): Promise<{ title: string; body: string; target_url?: string } | null> {
  try {
    // Fetch a random word from the database based on difficulty
    const { prisma } = await import('./prisma');

    // Build difficulty filter
    let difficultyFilter: any = {};
    if (difficulty) {
      const difficultyMap = { 'easy': [1, 2], 'medium': [3], 'hard': [4, 5] };
      difficultyFilter = { difficulty: { in: difficultyMap[difficulty] } };
    }

    // Get a random word
    const wordsCount = await prisma.word.count({ where: difficultyFilter });
    if (wordsCount === 0) return null;

    const randomSkip = Math.floor(Math.random() * wordsCount);
    const randomWord = await prisma.word.findFirst({
      where: difficultyFilter,
      skip: randomSkip,
      select: {
        word: true,
        correctDefinition: true,
        difficulty: true,
        partOfSpeech: true
      }
    });

    if (!randomWord) return null;

    const word = randomWord.word;
    const definition = randomWord.correctDefinition;
    const partOfSpeech = randomWord.partOfSpeech || '';

    // Create different notification types based on type parameter
    switch (type) {
      case 'teaser':
        const teaserTemplates = [
          { title: `🤔 Word Challenge`, body: `Can you define '${word}'? Test yourself in Lexipop!` },
          { title: `💭 Vocabulary Quiz`, body: `What does '${word}' mean? Find out now!` },
          { title: `🎯 Word Mystery`, body: `Challenge: Do you know what '${word}' means?` },
          { title: `🧩 Quick Question`, body: `Can you guess the meaning of '${word}'? Discover now!` },
          { title: `💡 Brain Teaser`, body: `Test yourself: Define '${word}' in Lexipop!` }
        ];
        const randomTeaser = teaserTemplates[Math.floor(Math.random() * teaserTemplates.length)];
        return { ...randomTeaser, target_url: 'https://www.lexipop.xyz' };

      case 'word_of_day':
        const cleanDefinition = definition.length > 80 ? definition.substring(0, 77) + '...' : definition;
        return {
          title: `📖 Word: ${word}`,
          body: `${cleanDefinition} Learn more words like this!`,
          target_url: 'https://www.lexipop.xyz'
        };

      case 'context_clue':
        // Create a simple sentence with the word
        const contextTemplates = [
          `The ${word} ${word.toLowerCase() === 'ubiquitous' ? 'smartphones are everywhere' : 'concept was clear'}. What does ${word} mean?`,
          `Her ${word} ${word.toLowerCase() === 'sagacious' ? 'advice saved us' : 'approach worked'}. Can you define ${word}?`,
          `The ${word} ${word.toLowerCase() === 'ephemeral' ? 'fame lasted weeks' : 'situation was obvious'}. Define ${word}!`,
          `His ${word} ${word.toLowerCase() === 'mellifluous' ? 'voice charmed all' : 'method succeeded'}. What's ${word}?`
        ];
        const randomContext = contextTemplates[Math.floor(Math.random() * contextTemplates.length)];
        const contextBody = randomContext.length > 120 ? randomContext.substring(0, 117) + '...' : randomContext;
        return {
          title: `🔍 Context Challenge`,
          body: contextBody,
          target_url: 'https://www.lexipop.xyz'
        };

      case 'difficulty_challenge':
        const level = userLevel || 'intermediate';
        const levelEmojis = { beginner: '🌱', intermediate: '🚀', advanced: '🏆', genius: '🧠' };
        const levelTitles = {
          beginner: 'Easy Word Quiz',
          intermediate: 'Level Up!',
          advanced: 'Master Challenge',
          genius: 'Genius Mode'
        };
        return {
          title: `${levelEmojis[level]} ${levelTitles[level]}`,
          body: `${level.charAt(0).toUpperCase() + level.slice(1)} challenge: Define '${word}'! Test yourself.`,
          target_url: 'https://www.lexipop.xyz'
        };

      default:
        return null;
    }
  } catch (error) {
    console.error('❌ Error creating dynamic word notification:', error);
    return null;
  }
}

/**
 * Test function to try different Neynar API configurations
 */
export async function testNeynarEndpoints(
  notification: { title: string; body: string; target_url?: string },
  targetFids?: number[]
): Promise<NotificationResponse> {
  const { NEYNAR_API_KEY, NEYNAR_CLIENT_ID } = serverEnv;

  if (!NEYNAR_API_KEY || !NEYNAR_CLIENT_ID) {
    return { success: false, error: 'Missing Neynar API credentials' };
  }

  const endpoints: Array<{
    name: string;
    url: string;
    headers: Record<string, string>;
    payload: any;
  }> = [
    {
      name: 'correct-2025-format',
      url: 'https://api.neynar.com/v2/farcaster/frame/notifications',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': NEYNAR_API_KEY
      },
      payload: {
        notification: {
          title: notification.title,
          body: notification.body,
          target_url: notification.target_url || 'https://www.lexipop.xyz'
        },
        ...(targetFids && { target_fids: targetFids })
      }
    },
    {
      name: 'bitworld-legacy-style',
      url: 'https://api.neynar.com/v2/farcaster-frame/notifications',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NEYNAR_API_KEY}`
      },
      payload: {
        client_id: NEYNAR_CLIENT_ID,
        notification: {
          title: notification.title,
          body: notification.body,
          target_url: notification.target_url || 'https://www.lexipop.xyz'
        },
        ...(targetFids && { target_fids: targetFids })
      }
    }
  ];

  for (const config of endpoints) {
    try {
      console.log(`🧪 Testing ${config.name}:`);
      console.log(`   URL: ${config.url}`);
      console.log(`   Headers: ${JSON.stringify(Object.keys(config.headers))}`);
      console.log(`   Payload: ${JSON.stringify(config.payload, null, 2)}`);

      const response = await fetch(config.url, {
        method: 'POST',
        headers: config.headers,
        body: JSON.stringify(config.payload)
      });

      const responseData = await response.json();

      console.log(`📡 ${config.name} response:`, response.status, responseData);

      if (response.ok) {
        console.log(`✅ SUCCESS with ${config.name}!`);
        return { success: true, message: `Success with ${config.name}`, neynarResponse: responseData };
      } else {
        console.log(`❌ ${config.name} failed:`, response.status, responseData);
      }
    } catch (error) {
      console.error(`❌ ${config.name} error:`, error);
    }
  }

  return { success: false, error: 'All endpoint configurations failed' };
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