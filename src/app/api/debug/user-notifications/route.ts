import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * DEBUG - Check user notification status
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');

    if (fid) {
      // Check specific user
      const userFid = parseInt(fid);
      const userStats = await prisma.userStats.findUnique({
        where: { userFid },
        select: {
          userFid: true,
          notificationsEnabled: true,
          notificationToken: true,
          notificationUrl: true,
          firstGameAt: true,
          updatedAt: true
        }
      });

      return NextResponse.json({
        success: true,
        fid: userFid,
        user: userStats,
        found: !!userStats,
        notificationsEnabled: userStats?.notificationsEnabled || false
      });
    }

    // Get all users with notifications
    const allUsers = await prisma.userStats.findMany({
      select: {
        userFid: true,
        notificationsEnabled: true,
        notificationToken: true,
        notificationUrl: true,
        firstGameAt: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    const enabledUsers = allUsers.filter(user => user.notificationsEnabled);

    return NextResponse.json({
      success: true,
      totalUsers: allUsers.length,
      enabledUsers: enabledUsers.length,
      users: allUsers.map(user => ({
        fid: user.userFid,
        notificationsEnabled: user.notificationsEnabled,
        hasToken: !!user.notificationToken,
        hasUrl: !!user.notificationUrl,
        updatedAt: user.updatedAt
      }))
    });

  } catch (error) {
    console.error('❌ Debug error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check user notifications',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}