/**
 * 🎯 RANDOM VOCABULARY API
 *
 * Provides random word selection from the database for game sessions
 * Ensures proper randomization and variety in word selection
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { VocabularyWord } from '@/types/game';

const prisma = new PrismaClient();

/**
 * Convert database difficulty (number) to game difficulty (string)
 */
function getDifficultyLevel(difficulty: number): 'easy' | 'medium' | 'hard' {
  switch (difficulty) {
    case 1: return 'easy';
    case 2: return 'easy';
    case 3: return 'medium';
    case 4: return 'hard';
    case 5: return 'hard';
    default: return 'medium';
  }
}

/**
 * GET /api/vocabulary/random - Get random vocabulary words for a game
 * Query params:
 * - count: number of words to return (default: 5)
 * - difficulty: filter by difficulty level (1-5)
 * - category: filter by category (academic, general, etc.)
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🎯 Random vocabulary API called');
    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get('count') || '5');
    const difficulty = searchParams.get('difficulty');
    const category = searchParams.get('category');
    console.log('📝 Request params:', { count, difficulty, category });

    // Validate count parameter
    if (count < 1 || count > 20) {
      return NextResponse.json({
        success: false,
        error: 'Count must be between 1 and 20'
      }, { status: 400 });
    }

    // Build where clause for filtering
    const where: any = {};
    if (difficulty) {
      const difficultyNum = parseInt(difficulty);
      if (difficultyNum >= 1 && difficultyNum <= 5) {
        where.difficulty = difficultyNum;
      }
    }
    if (category) {
      where.category = category;
    }

    // Get total count of words matching criteria
    console.log('🔍 Checking word count with filters:', { where, difficulty, category });
    const totalWords = await prisma.word.count({ where });
    console.log('📊 Total words found:', totalWords);

    // Also check total count without filters for debugging
    const totalWordsUnfiltered = await prisma.word.count();
    console.log('📊 Total words in database (no filters):', totalWordsUnfiltered);

    if (totalWords === 0) {
      console.warn('⚠️ No words found with current filters! Database has', totalWordsUnfiltered, 'total words');
      return NextResponse.json({
        success: false,
        error: totalWordsUnfiltered === 0
          ? 'No vocabulary words found in database. Database needs to be seeded.'
          : `No words found matching filters. Database has ${totalWordsUnfiltered} total words.`,
        hint: totalWordsUnfiltered === 0
          ? 'Run: npm run db:seed to populate the database with vocabulary words'
          : 'Try removing difficulty or category filters',
        debug: {
          totalWordsInDB: totalWordsUnfiltered,
          appliedFilters: { difficulty, category },
          whereClause: where
        }
      }, { status: 404 });
    }

    if (totalWords < count) {
      return NextResponse.json({
        success: false,
        error: `Only ${totalWords} words available, cannot provide ${count} unique words`
      }, { status: 400 });
    }

    // Use Prisma-based random selection (safer and more compatible)
    console.log('🎲 Fetching random words with Prisma...');

    // Get all matching words first
    const allWords = await prisma.word.findMany({
      where,
      select: {
        id: true,
        word: true,
        correctDefinition: true,
        incorrectDefinition1: true,
        incorrectDefinition2: true,
        incorrectDefinition3: true,
        difficulty: true,
        category: true
      }
    });

    console.log(`📊 Found ${allWords.length} words matching filters, selecting ${count} randomly`);

    // Shuffle and select random words
    const shuffled = allWords.sort(() => Math.random() - 0.5);
    const randomWords = shuffled.slice(0, count);

    // Convert database format to game format
    const gameWords: VocabularyWord[] = randomWords.map(word => ({
      word: word.word,
      correctDefinition: word.correctDefinition,
      incorrectDefinitions: [
        word.incorrectDefinition1,
        word.incorrectDefinition2,
        word.incorrectDefinition3
      ],
      difficulty: getDifficultyLevel(word.difficulty)
    }));

    // Update analytics for selected words
    try {
      const wordIds = randomWords.map(w => w.id);
      await prisma.word.updateMany({
        where: { id: { in: wordIds } },
        data: {
          timesShown: { increment: 1 },
          lastShown: new Date()
        }
      });
    } catch (error) {
      console.warn('Failed to update word analytics:', error);
      // Don't fail the request for analytics issues
    }

    return NextResponse.json({
      success: true,
      words: gameWords,
      metadata: {
        totalWordsInDB: totalWords,
        requestedCount: count,
        returnedCount: gameWords.length,
        filters: {
          difficulty: difficulty || 'any',
          category: category || 'any'
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching random words:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch random vocabulary words',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * POST /api/vocabulary/random - Alternative endpoint for fetching words with more complex criteria
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      count = 5,
      difficulty,
      category,
      excludeRecentlyShown = false,
      userFid
    } = body;

    // Validate input
    if (count < 1 || count > 20) {
      return NextResponse.json({
        success: false,
        error: 'Count must be between 1 and 20'
      }, { status: 400 });
    }

    // Build complex where clause
    const where: any = {};

    if (difficulty) {
      if (Array.isArray(difficulty)) {
        where.difficulty = { in: difficulty };
      } else {
        where.difficulty = difficulty;
      }
    }

    if (category) {
      if (Array.isArray(category)) {
        where.category = { in: category };
      } else {
        where.category = category;
      }
    }

    // Exclude recently shown words (within last hour)
    if (excludeRecentlyShown) {
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      where.OR = [
        { lastShown: null },
        { lastShown: { lt: oneHourAgo } }
      ];
    }

    // Get words using more complex query
    const randomWords = await prisma.word.findMany({
      where,
      take: count * 3, // Get more than needed for better randomization
      orderBy: {
        timesShown: 'asc' // Prefer words that haven't been shown as much
      }
    });

    if (randomWords.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No words found matching the specified criteria'
      }, { status: 404 });
    }

    // Shuffle and take the required count
    const shuffled = randomWords.sort(() => Math.random() - 0.5);
    const selectedWords = shuffled.slice(0, count);

    // Convert to game format
    const gameWords: VocabularyWord[] = selectedWords.map(word => ({
      word: word.word,
      correctDefinition: word.correctDefinition,
      incorrectDefinitions: [
        word.incorrectDefinition1,
        word.incorrectDefinition2,
        word.incorrectDefinition3
      ],
      difficulty: getDifficultyLevel(word.difficulty)
    }));

    // Update analytics
    try {
      const wordIds = selectedWords.map(w => w.id);
      await prisma.word.updateMany({
        where: { id: { in: wordIds } },
        data: {
          timesShown: { increment: 1 },
          lastShown: new Date()
        }
      });
    } catch (error) {
      console.warn('Failed to update word analytics:', error);
    }

    return NextResponse.json({
      success: true,
      words: gameWords,
      metadata: {
        availableWords: randomWords.length,
        requestedCount: count,
        returnedCount: gameWords.length,
        criteria: body
      }
    });

  } catch (error) {
    console.error('❌ Error in POST random words:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch random vocabulary words',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * GET /api/vocabulary/random/stats - Get statistics about vocabulary selection
 */
export async function HEAD() {
  try {
    const stats = await prisma.word.aggregate({
      _count: { id: true },
      _avg: { timesShown: true, difficulty: true },
      _max: { timesShown: true },
      _min: { timesShown: true }
    });

    const categoryCounts = await prisma.word.groupBy({
      by: ['category'],
      _count: { id: true }
    });

    const difficultyCounts = await prisma.word.groupBy({
      by: ['difficulty'],
      _count: { id: true }
    });

    return NextResponse.json({
      totalWords: stats._count.id,
      averageTimesShown: stats._avg.timesShown,
      averageDifficulty: stats._avg.difficulty,
      mostShownCount: stats._max.timesShown,
      leastShownCount: stats._min.timesShown,
      byCategory: categoryCounts.map(c => ({
        category: c.category || 'uncategorized',
        count: c._count.id
      })),
      byDifficulty: difficultyCounts.map(d => ({
        difficulty: d.difficulty,
        count: d._count.id
      }))
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to get vocabulary statistics'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}