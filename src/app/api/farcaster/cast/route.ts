import { NextRequest, NextResponse } from 'next/server';
import { serverEnv } from '@/lib/env';

/**
 * 🔒 SECURE FARCASTER CAST API
 *
 * POST /api/farcaster/cast - Create a cast (post) on Farcaster
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, fid } = body;

    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Cast text is required' },
        { status: 400 }
      );
    }

    if (!fid || typeof fid !== 'number' || fid <= 0) {
      return NextResponse.json(
        { error: 'Valid FID is required' },
        { status: 400 }
      );
    }

    if (text.length > 320) {
      return NextResponse.json(
        { error: 'Cast text too long (max 320 characters)' },
        { status: 400 }
      );
    }

    // Create cast using Neynar API
    const neynarResponse = await fetch('https://api.neynar.com/v2/farcaster/cast', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serverEnv.NEYNAR_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        signer_uuid: serverEnv.NEYNAR_SIGNER_UUID,
        text: text.trim()
      }),
    });

    if (!neynarResponse.ok) {
      const errorData = await neynarResponse.text();
      console.error('❌ Neynar cast error:', errorData);

      return NextResponse.json(
        { error: 'Failed to create cast' },
        { status: 500 }
      );
    }

    const castData = await neynarResponse.json();

    console.log(`✅ Cast created successfully: ${castData.cast?.hash || 'unknown'}`);

    return NextResponse.json({
      success: true,
      cast: {
        hash: castData.cast?.hash,
        url: castData.cast?.hash ? `https://warpcast.com/${fid}/cast/${castData.cast.hash}` : undefined
      }
    });

  } catch (error) {
    console.error('❌ Cast creation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create cast'
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'farcaster-cast-api'
  });
}