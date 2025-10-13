/**
 * 🌱 VOCABULARY SEEDING API
 *
 * Seeds the database with initial vocabulary words via HTTP endpoint
 * This allows seeding the production database without shell access
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initial vocabulary words
const initialWords = [
  {
    word: 'ephemeral',
    correctDefinition: 'lasting for a very short time',
    incorrectDefinition1: 'eternal and everlasting',
    incorrectDefinition2: 'extremely heavy or dense',
    incorrectDefinition3: 'relating to the sky',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'ubiquitous',
    correctDefinition: 'present, appearing, or found everywhere',
    incorrectDefinition1: 'very rare or uncommon',
    incorrectDefinition2: 'relating to ancient times',
    incorrectDefinition3: 'having multiple meanings',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'serendipity',
    correctDefinition: 'the occurrence of events by chance in a happy way',
    incorrectDefinition1: 'a feeling of deep regret',
    incorrectDefinition2: 'the ability to see the future',
    incorrectDefinition3: 'extreme anger or fury',
    difficulty: 3,
    category: 'general',
    partOfSpeech: 'noun'
  },
  {
    word: 'perspicacious',
    correctDefinition: 'having keen insight or understanding',
    incorrectDefinition1: 'sweating profusely',
    incorrectDefinition2: 'speaking very quietly',
    incorrectDefinition3: 'moving very slowly',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'sycophant',
    correctDefinition: 'a person who acts obsequiously to gain advantage',
    incorrectDefinition1: 'a type of musical instrument',
    incorrectDefinition2: 'someone who studies plants',
    incorrectDefinition3: 'a person who collects coins',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'noun'
  },
  {
    word: 'mellifluous',
    correctDefinition: 'sweet or musical; pleasant to hear',
    incorrectDefinition1: 'extremely bitter in taste',
    incorrectDefinition2: 'having a strong unpleasant smell',
    incorrectDefinition3: 'rough or harsh to touch',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'pragmatic',
    correctDefinition: 'dealing with things sensibly and realistically',
    incorrectDefinition1: 'highly emotional and dramatic',
    incorrectDefinition2: 'believing in supernatural forces',
    incorrectDefinition3: 'avoiding all practical concerns',
    difficulty: 2,
    category: 'general',
    partOfSpeech: 'adjective'
  },
  {
    word: 'ineffable',
    correctDefinition: 'too great to be expressed in words',
    incorrectDefinition1: 'completely false or untrue',
    incorrectDefinition2: 'easily understood by everyone',
    incorrectDefinition3: 'having no practical use',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'querulous',
    correctDefinition: 'complaining in a petulant way',
    incorrectDefinition1: 'extremely curious about everything',
    incorrectDefinition2: 'making quick decisive actions',
    incorrectDefinition3: 'speaking in questions only',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'vicarious',
    correctDefinition: 'experienced in the imagination through another person',
    incorrectDefinition1: 'extremely dangerous or harmful',
    incorrectDefinition2: 'relating to ancient Roman culture',
    incorrectDefinition3: 'happening very frequently',
    difficulty: 3,
    category: 'general',
    partOfSpeech: 'adjective'
  },
  {
    word: 'ebullient',
    correctDefinition: 'cheerful and full of energy',
    incorrectDefinition1: 'extremely sad and depressed',
    incorrectDefinition2: 'boiling at a high temperature',
    incorrectDefinition3: 'speaking in a very quiet voice',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'capricious',
    correctDefinition: 'given to sudden changes of mood or behavior',
    incorrectDefinition1: 'extremely predictable and steady',
    incorrectDefinition2: 'relating to capturing images',
    incorrectDefinition3: 'having a very large appetite',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'taciturn',
    correctDefinition: 'reserved or uncommunicative in speech',
    incorrectDefinition1: 'extremely talkative and social',
    incorrectDefinition2: 'relating to the sense of touch',
    incorrectDefinition3: 'moving with great speed',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'nefarious',
    correctDefinition: 'extremely wicked or villainous',
    incorrectDefinition1: 'relating to nephews and nieces',
    incorrectDefinition2: 'extremely generous and kind',
    incorrectDefinition3: 'having a pleasant fragrance',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'pellucid',
    correctDefinition: 'transparently clear in thought or expression',
    incorrectDefinition1: 'extremely muddy and unclear',
    incorrectDefinition2: 'relating to birds and flight',
    incorrectDefinition3: 'having a rough texture',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'adjective'
  }
];

/**
 * POST /api/vocabulary/seed - Seed database with initial vocabulary words
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Starting vocabulary database seeding...');

    // Check if words already exist
    const existingWords = await prisma.word.count();

    if (existingWords > 0) {
      return NextResponse.json({
        success: false,
        message: `Database already has ${existingWords} words. Use force=true to reset and reseed.`,
        existingWords
      });
    }

    // Insert words
    const results = [];
    for (const wordData of initialWords) {
      try {
        const created = await prisma.word.create({
          data: wordData
        });
        results.push(created);
        console.log(`✅ Created word: ${wordData.word}`);
      } catch (error) {
        console.warn(`⚠️ Failed to create word ${wordData.word}:`, error);
      }
    }

    console.log(`🎉 Seeding completed! Created ${results.length} words.`);

    return NextResponse.json({
      success: true,
      message: `Successfully seeded database with ${results.length} vocabulary words`,
      createdWords: results.length,
      words: results.map(w => ({ id: w.id, word: w.word, difficulty: w.difficulty }))
    });

  } catch (error) {
    console.error('❌ Error seeding vocabulary database:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to seed vocabulary database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * GET /api/vocabulary/seed - Check seeding status
 */
export async function GET() {
  try {
    const wordCount = await prisma.word.count();

    return NextResponse.json({
      success: true,
      message: wordCount > 0 ? 'Database has vocabulary words' : 'Database is empty - needs seeding',
      wordCount,
      needsSeeding: wordCount === 0
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to check seeding status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * DELETE /api/vocabulary/seed?force=true - Reset and reseed database
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    if (!force) {
      return NextResponse.json({
        success: false,
        error: 'Must include ?force=true to reset database'
      }, { status: 400 });
    }

    console.log('🗑️ Clearing existing vocabulary words...');
    const deleted = await prisma.word.deleteMany({});
    console.log(`🗑️ Deleted ${deleted.count} existing words`);

    // Now reseed
    const results = [];
    for (const wordData of initialWords) {
      try {
        const created = await prisma.word.create({
          data: wordData
        });
        results.push(created);
        console.log(`✅ Created word: ${wordData.word}`);
      } catch (error) {
        console.warn(`⚠️ Failed to create word ${wordData.word}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Reset complete! Deleted ${deleted.count} old words, created ${results.length} new words`,
      deletedWords: deleted.count,
      createdWords: results.length
    });

  } catch (error) {
    console.error('❌ Error resetting vocabulary database:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to reset vocabulary database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}