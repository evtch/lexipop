/**
 * 🖼️ Temporary Image Upload API
 *
 * Creates temporary image URLs for Farcaster sharing
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed - use POST to upload image' },
    { status: 405 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageData, score, words } = body;

    if (!imageData || !imageData.startsWith('data:image/png;base64,')) {
      return NextResponse.json(
        { error: 'Invalid image data' },
        { status: 400 }
      );
    }

    // Extract base64 data
    const base64Data = imageData.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Create unique filename
    const filename = `score-${randomUUID()}.png`;
    const publicDir = path.join(process.cwd(), 'public', 'temp-images');

    // Ensure directory exists
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const filePath = path.join(publicDir, filename);

    // Write image file
    fs.writeFileSync(filePath, imageBuffer);

    // Generate public URL
    const imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://lexipop.xyz'}/temp-images/${filename}`;

    // Schedule cleanup after 1 hour
    setTimeout(() => {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`🗑️ Cleaned up temporary image: ${filename}`);
        }
      } catch (error) {
        console.error('Failed to cleanup temporary image:', error);
      }
    }, 60 * 60 * 1000); // 1 hour

    return NextResponse.json({
      success: true,
      imageUrl,
      filename,
      score,
      words
    });

  } catch (error) {
    console.error('Error creating temporary image:', error);
    return NextResponse.json(
      { error: 'Failed to create temporary image' },
      { status: 500 }
    );
  }
}