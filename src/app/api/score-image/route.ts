/**
 * 🖼️ Score Image Generation API
 *
 * Generates PNG images from score data for social sharing
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateScoreShareSvg } from '@/lib/utils/svgToPng';

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed - use POST to generate image' },
    { status: 405 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { score, words, streakBonus, dailyStreak } = body;

    // Validate input
    if (typeof score !== 'number' || !Array.isArray(words)) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }

    // Generate SVG
    const svgContent = generateScoreShareSvg({
      score,
      words,
      streakBonus: streakBonus || 0,
      dailyStreak: dailyStreak || 0
    });

    // For now, return SVG content
    // In production, you might want to convert to PNG server-side
    return NextResponse.json({
      success: true,
      svgContent,
      // We'll convert to PNG on the client side for now
      message: 'SVG generated successfully'
    });

  } catch (error) {
    console.error('Error generating score image:', error);
    return NextResponse.json(
      { error: 'Failed to generate score image' },
      { status: 500 }
    );
  }
}