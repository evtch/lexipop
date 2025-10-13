/**
 * 🔍 VOCABULARY DEBUG API
 *
 * Diagnostic endpoint to check database state and connection
 */

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/vocabulary/debug - Debug database state
 */
export async function GET() {
  try {
    console.log('🔍 Running vocabulary database diagnostics...');

    // Test basic connection
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Count total words
    console.log('2. Counting total words...');
    const totalWords = await prisma.word.count();
    console.log(`📊 Total words in database: ${totalWords}`);

    // Get a sample of words
    console.log('3. Fetching sample words...');
    const sampleWords = await prisma.word.findMany({
      take: 5,
      select: {
        id: true,
        word: true,
        difficulty: true,
        category: true,
        correctDefinition: true
      }
    });
    console.log(`📝 Sample words:`, sampleWords);

    // Check distinct difficulties
    console.log('4. Checking available difficulties...');
    const difficulties = await prisma.word.groupBy({
      by: ['difficulty'],
      _count: {
        difficulty: true
      }
    });
    console.log('📊 Difficulty breakdown:', difficulties);

    // Check distinct categories
    console.log('5. Checking available categories...');
    const categories = await prisma.word.groupBy({
      by: ['category'],
      _count: {
        category: true
      }
    });
    console.log('📊 Category breakdown:', categories);

    // Test the exact query used in random endpoint
    console.log('6. Testing random query with no filters...');
    const randomWordsTest = await prisma.$queryRaw<any[]>`
      SELECT * FROM words
      ORDER BY RANDOM()
      LIMIT 3
    `;
    console.log('🎲 Random query test result:', randomWordsTest.length, 'words found');

    return NextResponse.json({
      success: true,
      diagnostics: {
        connectionStatus: 'OK',
        totalWords,
        sampleWords: sampleWords.map(w => ({
          id: w.id,
          word: w.word,
          difficulty: w.difficulty,
          category: w.category,
          definitionPreview: w.correctDefinition.substring(0, 50) + '...'
        })),
        difficulties,
        categories,
        randomQueryTest: randomWordsTest.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Database diagnostic error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database diagnostic failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}