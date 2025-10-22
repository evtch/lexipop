/**
 * 🔤 WORD-FOCUSED NOTIFICATIONS CRON JOB
 *
 * Sends educational word-based notifications to all Lexipop users
 * Focuses on vocabulary learning with real words from the database
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {
  sendWordOfTheDay,
  sendWordTeaser,
  sendContextClueChallenge,
  sendDifficultyChallenge,
  sendDoYouKnowNotification,
  createDynamicWordNotification,
  broadcastCustomNotification
} from '@/lib/notifications';

const prisma = new PrismaClient();

// Optional security for cron endpoints
const CRON_SECRET = process.env.CRON_SECRET;

/**
 * GET /api/cron/word-notifications - Word notifications cron job (GET for Vercel cron)
 */
export async function GET(request: NextRequest) {
  return handleWordNotifications(request);
}

/**
 * POST /api/cron/word-notifications - Word notifications cron job (POST for external cron)
 */
export async function POST(request: NextRequest) {
  return handleWordNotifications(request);
}

async function handleWordNotifications(request: NextRequest) {
  try {
    console.log('🔤 Word notifications cron job started');

    // Optional security check
    if (CRON_SECRET) {
      const cronSecret = request.headers.get('x-cron-secret') ||
                        new URL(request.url).searchParams.get('secret');

      if (!cronSecret || cronSecret !== CRON_SECRET) {
        console.error('❌ Invalid cron secret');
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const results = {
      wordNotification: null as any,
      notificationType: '',
      wordUsed: '',
      totalUsersNotified: 0,
      timestamp: new Date().toISOString()
    };

    // Determine which type of word notification to send based on day of week
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

    let notificationType: string;
    let notificationResult: any;

    switch (dayOfWeek) {
      case 0: // Sunday - "Do You Know" Challenge
        console.log('🎯 Sending "Do You Know" notification...');
        notificationType = 'do_you_know';
        notificationResult = await sendDoYouKnowNotification();
        break;

      case 1: // Monday - Word of the Day
        console.log('📖 Sending Word of the Day notification...');
        notificationType = 'word_of_day';
        notificationResult = await sendWordOfTheDay();
        break;

      case 2: // Tuesday - Another "Do You Know" Challenge
        console.log('🤔 Sending "Do You Know" notification...');
        notificationType = 'do_you_know';
        notificationResult = await sendDoYouKnowNotification();
        break;

      case 3: // Wednesday - Context Clue Challenge
        console.log('🔍 Sending Context Clue Challenge notification...');
        notificationType = 'context_clue';
        notificationResult = await sendContextClueChallenge();
        break;

      case 4: // Thursday - "Do You Know" Challenge
        console.log('💡 Sending "Do You Know" notification...');
        notificationType = 'do_you_know';
        notificationResult = await sendDoYouKnowNotification();
        break;

      case 5: // Friday - Difficulty Challenge
        console.log('🏆 Sending Difficulty Challenge notification...');
        notificationType = 'difficulty_challenge';
        // Randomly pick a difficulty level for variety
        const difficulties = ['beginner', 'intermediate', 'advanced'] as const;
        const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
        notificationResult = await sendDifficultyChallenge(randomDifficulty);
        break;

      case 6: // Saturday - "Do You Know" Weekend Challenge
        console.log('🎮 Sending Weekend "Do You Know" notification...');
        notificationType = 'do_you_know';
        notificationResult = await sendDoYouKnowNotification();
        break;

      default:
        notificationType = 'do_you_know';
        notificationResult = await sendDoYouKnowNotification();
        break;
    }

    results.notificationType = notificationType;
    results.wordNotification = notificationResult;

    // Try to extract word information from the notification
    if (notificationResult?.neynarResponse) {
      const notificationText = notificationResult.neynarResponse.notification?.body || '';
      const wordMatch = notificationText.match(/'([^']+)'/);
      if (wordMatch) {
        results.wordUsed = wordMatch[1];
      }
    }

    // Log completion
    console.log('✅ Word notifications cron job completed successfully');
    console.log('📊 Results:', results);

    return NextResponse.json({
      success: true,
      message: 'Word notifications processed successfully',
      data: results
    });

  } catch (error) {
    console.error('❌ Word notifications cron job failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Word notifications cron job failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Send custom word exploration notification with interesting facts
 */
async function sendCustomWordExploration() {
  try {
    // Get a random interesting word from the database
    const wordsCount = await prisma.word.count();
    if (wordsCount === 0) {
      return { success: false, error: 'No words found in database' };
    }

    const randomSkip = Math.floor(Math.random() * wordsCount);
    const randomWord = await prisma.word.findFirst({
      skip: randomSkip,
      select: {
        word: true,
        correctDefinition: true,
        partOfSpeech: true,
        difficulty: true
      }
    });

    if (!randomWord) {
      return { success: false, error: 'Failed to fetch random word' };
    }

    // Create an exploration-style notification
    const explorationTemplates = [
      {
        title: `💫 Explore: ${randomWord.word}`,
        body: `Did you know? This fascinating word means "${randomWord.correctDefinition.substring(0, 80)}..."`
      },
      {
        title: `🌟 Word Journey`,
        body: `Today's word adventure: '${randomWord.word}' - discover its meaning in Lexipop!`
      },
      {
        title: `📚 Word Discovery`,
        body: `Uncover the mystery of '${randomWord.word}' - what do you think it means?`
      }
    ];

    const template = explorationTemplates[Math.floor(Math.random() * explorationTemplates.length)];

    // Ensure body fits within 128 character limit
    if (template.body.length > 128) {
      template.body = template.body.substring(0, 125) + '...';
    }

    return await broadcastCustomNotification(template.title, template.body);

  } catch (error) {
    console.error('❌ Error sending custom word exploration:', error);
    return { success: false, error: 'Failed to send custom word exploration' };
  }
}

/**
 * Health check endpoint
 */
export async function HEAD() {
  return NextResponse.json({
    success: true,
    message: 'Word notifications cron endpoint is healthy',
    endpoint: '/api/cron/word-notifications',
    methods: ['GET', 'POST'],
    schedule: {
      sunday: 'Do You Know Challenge',
      monday: 'Word of the Day',
      tuesday: 'Do You Know Challenge',
      wednesday: 'Context Clue Challenge',
      thursday: 'Do You Know Challenge',
      friday: 'Difficulty Challenge (Random)',
      saturday: 'Weekend Do You Know Challenge'
    },
    timestamp: new Date().toISOString()
  });
}