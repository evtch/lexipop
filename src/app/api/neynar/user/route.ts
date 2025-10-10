import { NextRequest, NextResponse } from 'next/server';
import { getUserByFid, getUserByUsername } from '@/lib/neynar';

/**
 * 🔒 SECURE USER LOOKUP API
 *
 * GET /api/neynar/user?fid=123 - Lookup by FID
 * GET /api/neynar/user?username=alice - Lookup by username
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');
    const username = searchParams.get('username');

    // Validate input
    if (!fid && !username) {
      return NextResponse.json(
        { error: 'Either fid or username parameter is required' },
        { status: 400 }
      );
    }

    let userData;

    if (fid) {
      const fidNumber = parseInt(fid, 10);
      if (isNaN(fidNumber) || fidNumber <= 0) {
        return NextResponse.json(
          { error: 'Invalid FID format' },
          { status: 400 }
        );
      }
      userData = await getUserByFid(fidNumber);
    } else if (username) {
      // Validate username format
      if (!/^[a-zA-Z0-9_-]+$/.test(username) || username.length > 50) {
        return NextResponse.json(
          { error: 'Invalid username format' },
          { status: 400 }
        );
      }
      userData = await getUserByUsername(username);
    }

    return NextResponse.json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('❌ User lookup API error:', error);

    // Don't expose internal error details
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user profile'
      },
      { status: 500 }
    );
  }
}

/**
 * 🔒 SECURITY FEATURES:
 *
 * - Input validation prevents injection attacks
 * - API keys handled server-side only
 * - Error messages don't leak sensitive info
 * - Rate limiting could be added here
 * - CORS headers could be configured as needed
 */