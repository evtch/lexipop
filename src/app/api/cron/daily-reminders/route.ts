/**
 * 🕐 DAILY REMINDERS CRON JOB
 *
 * Automated daily notification system for Lexipop users
 * Sends rotating daily reminders and re-engagement notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {
  scheduleDailyReminders,
  notifyMultipleUsers,
  getRandomDailyReminder
} from '@/lib/notifications';

const prisma = new PrismaClient();

// Optional security for cron endpoints (set CRON_SECRET in environment)
const CRON_SECRET = process.env.CRON_SECRET;

/**
 * GET /api/cron/daily-reminders - Daily reminder cron job (GET for Vercel cron)
 */
export async function GET(request: NextRequest) {
  return handleDailyReminders(request);
}

/**
 * POST /api/cron/daily-reminders - Daily reminder cron job (POST for external cron)
 */
export async function POST(request: NextRequest) {
  return handleDailyReminders(request);
}

async function handleDailyReminders(request: NextRequest) {
  try {
    console.log('🕐 Daily reminders cron job started');

    // Optional security check
    if (CRON_SECRET) {
      const authHeader = request.headers.get('authorization');
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
      broadcastNotification: null as any,
      inactiveUserNotifications: null as any,
      totalUsersNotified: 0,
      timestamp: new Date().toISOString()
    };

    // 1. Send broadcast daily reminder to all users
    console.log('📢 Sending broadcast daily reminder...');
    try {
      results.broadcastNotification = await scheduleDailyReminders();
      console.log('✅ Broadcast notification result:', results.broadcastNotification);
    } catch (error) {
      console.error('❌ Failed to send broadcast notification:', error);
      results.broadcastNotification = { success: false, error: String(error) };
    }

    // 2. Send re-engagement notifications to inactive users (every 3 days)
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);

    if (dayOfYear % 3 === 0) { // Every 3 days
      console.log('📲 Sending re-engagement notifications to inactive users...');

      try {
        const inactiveUsers = await getInactiveUsers();

        if (inactiveUsers.length > 0) {
          results.inactiveUserNotifications = await notifyMultipleUsers(
            inactiveUsers.map(user => user.userFid),
            'comeback_reminder'
          );
          results.totalUsersNotified = inactiveUsers.length;

          console.log(`✅ Re-engagement notifications sent to ${inactiveUsers.length} inactive users`);
        } else {
          console.log('ℹ️ No inactive users to notify');
          results.inactiveUserNotifications = { success: true, message: 'No inactive users found' };
        }
      } catch (error) {
        console.error('❌ Failed to send re-engagement notifications:', error);
        results.inactiveUserNotifications = { success: false, error: String(error) };
      }
    } else {
      console.log('ℹ️ Skipping re-engagement notifications (not a 3-day interval)');
      results.inactiveUserNotifications = { success: true, message: 'Skipped (not 3-day interval)' };
    }

    // 3. Log completion
    console.log('✅ Daily reminders cron job completed successfully');
    console.log('📊 Results:', results);

    return NextResponse.json({
      success: true,
      message: 'Daily reminders processed successfully',
      data: results
    });

  } catch (error) {
    console.error('❌ Daily reminders cron job failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Cron job failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get users who haven't played in the last 3 days and have notifications enabled
 */
async function getInactiveUsers() {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  try {
    const inactiveUsers = await prisma.userStats.findMany({
      where: {
        AND: [
          {
            notificationsEnabled: true
          },
          {
            OR: [
              {
                lastPlayedDate: {
                  lt: threeDaysAgo
                }
              },
              {
                lastPlayedDate: null
              }
            ]
          },
          {
            totalGamesPlayed: {
              gt: 0 // Only notify users who have played at least once
            }
          }
        ]
      },
      select: {
        userFid: true,
        lastPlayedDate: true,
        totalGamesPlayed: true
      },
      take: 1000 // Limit to prevent too many notifications
    });

    console.log(`📊 Found ${inactiveUsers.length} inactive users to potentially notify`);
    return inactiveUsers;

  } catch (error) {
    console.error('❌ Failed to get inactive users:', error);
    return [];
  }
}

/**
 * Health check endpoint for the cron job
 */
export async function HEAD() {
  return NextResponse.json({
    success: true,
    message: 'Daily reminders cron endpoint is healthy',
    endpoint: '/api/cron/daily-reminders',
    methods: ['GET', 'POST'],
    timestamp: new Date().toISOString()
  });
}