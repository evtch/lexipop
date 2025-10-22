/**
 * 🧪 TEST NOTIFICATION ENDPOINT
 *
 * Manual endpoint to test our new "Do you know what X means?" notifications
 * This helps verify the notification system is working properly
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendDoYouKnowNotification } from '@/lib/notifications';

/**
 * GET /api/test-notification - Send a test "Do you know" notification
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Test notification endpoint called');

    // Get optional FID from query params for targeted test
    const url = new URL(request.url);
    const targetFid = url.searchParams.get('fid');
    const userFid = targetFid ? parseInt(targetFid) : undefined;

    console.log(`📤 Sending test notification${userFid ? ` to FID ${userFid}` : ' to all users'}`);

    // Send the notification
    const result = await sendDoYouKnowNotification(userFid);

    return NextResponse.json({
      success: true,
      message: `Test notification sent${userFid ? ` to FID ${userFid}` : ' to all users'}`,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Test notification failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Test notification failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/test-notification - Send test notification with custom word
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { word, fid } = body;

    if (!word) {
      return NextResponse.json(
        { success: false, error: 'Word parameter required' },
        { status: 400 }
      );
    }

    // Create a custom notification for testing
    const templates = [
      {
        title: `🎯 Do you know this word?`,
        body: `What does "${word}" mean? Test your knowledge in Lexipop!`
      },
      {
        title: `📚 Word Challenge`,
        body: `Can you define "${word}"? Play now to find out!`
      }
    ];

    const template = templates[Math.floor(Math.random() * templates.length)];

    console.log(`🧪 Sending custom test notification for word: ${word}`);

    // For custom tests, we'll send directly
    const { sendNeynarNotification } = await import('@/lib/notifications');

    const result = await sendNeynarNotification({
      title: template.title,
      body: template.body,
      target_url: 'https://www.lexipop.xyz/miniapp'
    }, fid ? [fid] : undefined);

    return NextResponse.json({
      success: true,
      message: `Custom test notification sent for word: ${word}`,
      word,
      result,
      template,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Custom test notification failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Custom test notification failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}