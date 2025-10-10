import { NextRequest, NextResponse } from 'next/server';
import { validateFrameMessage } from '@/lib/neynar';

/**
 * 🔒 SECURE FRAME VALIDATION API
 *
 * POST /api/neynar/validate-frame
 * Body: { messageBytes: string }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageBytes } = body;

    // Validate input
    if (!messageBytes || typeof messageBytes !== 'string') {
      return NextResponse.json(
        { error: 'messageBytes is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate message format (basic check)
    if (messageBytes.length < 10 || messageBytes.length > 10000) {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }

    const validation = await validateFrameMessage(messageBytes);

    return NextResponse.json({
      success: true,
      validation
    });

  } catch (error) {
    console.error('❌ Frame validation API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to validate frame message'
      },
      { status: 500 }
    );
  }
}

/**
 * 🔒 SECURITY FEATURES:
 *
 * - Validates frame message format
 * - Prevents oversized messages (DoS protection)
 * - Server-side only validation with Neynar
 * - Safe error handling
 * - No sensitive data exposure
 */