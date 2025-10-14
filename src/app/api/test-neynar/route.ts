import { NextRequest, NextResponse } from 'next/server';
import { serverEnv } from '@/lib/env';

/**
 * TEST NEYNAR API DIRECTLY
 *
 * Tests the raw Neynar API call without database dependencies
 */

export async function POST(request: NextRequest) {
  try {
    const { NEYNAR_API_KEY, NEYNAR_CLIENT_ID } = serverEnv;

    if (!NEYNAR_API_KEY || !NEYNAR_CLIENT_ID) {
      return NextResponse.json({
        success: false,
        error: 'Missing API credentials',
        details: {
          hasApiKey: !!NEYNAR_API_KEY,
          hasClientId: !!NEYNAR_CLIENT_ID
        }
      });
    }

    // Test payload - broadcast to all users
    const payload = {
      targetFids: [], // Empty array = broadcast to all
      notification: {
        title: "🧪 Test from Lexipop",
        body: "Testing Neynar notifications API directly",
        target_url: "https://www.lexipop.xyz"
      }
    };

    console.log('🧪 Testing Neynar API directly...');
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch('https://api.neynar.com/v2/farcaster/frame/notifications', {
      method: 'POST',
      headers: {
        'api_key': NEYNAR_API_KEY,
        'client_id': NEYNAR_CLIENT_ID,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('📡 Response status:', response.status, response.statusText);

    const responseText = await response.text();
    console.log('📄 Response body:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      response: responseData,
      payload,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}