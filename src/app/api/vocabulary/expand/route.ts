import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// First 50 words from the expanded vocabulary
const expandedWords = [
  {
    word: 'esoteric',
    correctDefinition: 'intended for or understood by a small group with specialized knowledge',
    incorrectDefinition1: 'easily understood by everyone',
    incorrectDefinition2: 'having a pleasant sound',
    incorrectDefinition3: 'showing exaggerated emotion',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'copacetic',
    correctDefinition: 'in excellent order; very satisfactory',
    incorrectDefinition1: 'lacking in energy or enthusiasm',
    incorrectDefinition2: 'showing aggressive or warlike behavior',
    incorrectDefinition3: 'having multiple contradictory meanings',
    difficulty: 4,
    category: 'general',
    partOfSpeech: 'adjective'
  },
  {
    word: 'pernicious',
    correctDefinition: 'causing great harm in a subtle or gradual way',
    incorrectDefinition1: 'having a strong pleasant aroma',
    incorrectDefinition2: 'playful or lighthearted',
    incorrectDefinition3: 'open to new experiences',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'obfuscate',
    correctDefinition: 'to confuse or make obscure',
    incorrectDefinition1: 'to make something clear or simple',
    incorrectDefinition2: 'to strengthen through repetition',
    incorrectDefinition3: 'to reduce in size or scope',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'verb'
  },
  {
    word: 'pulchritudinous',
    correctDefinition: 'possessing great physical beauty',
    incorrectDefinition1: 'ugly or unpleasant to look at',
    incorrectDefinition2: 'deceitful or two-faced',
    incorrectDefinition3: 'of small or delicate build',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'insouciant',
    correctDefinition: 'cheerfully unconcerned; carefree',
    incorrectDefinition1: 'deeply worried',
    incorrectDefinition2: 'rude or dismissive',
    incorrectDefinition3: 'extremely cautious',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'perspicacious',
    correctDefinition: 'having keen understanding and insight',
    incorrectDefinition1: 'lacking interest or excitement',
    incorrectDefinition2: 'easily deceived',
    incorrectDefinition3: 'difficult to persuade',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'sagacious',
    correctDefinition: 'wise or shrewd',
    incorrectDefinition1: 'foolish or short-sighted',
    incorrectDefinition2: 'easily influenced',
    incorrectDefinition3: 'reluctant or unwilling',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'recalcitrant',
    correctDefinition: 'resistant to authority or control',
    incorrectDefinition1: 'submissive and obedient',
    incorrectDefinition2: 'quick to forgive',
    incorrectDefinition3: 'easily satisfied',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'ineffable',
    correctDefinition: 'too sacred or extreme to be expressed in words',
    incorrectDefinition1: 'lacking purpose',
    incorrectDefinition2: 'capable of being measured',
    incorrectDefinition3: 'without moral standards',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'intransigent',
    correctDefinition: 'unwilling to compromise',
    incorrectDefinition1: 'flexible and cooperative',
    incorrectDefinition2: 'unreliable or inconsistent',
    incorrectDefinition3: 'capable of change',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'obsequious',
    correctDefinition: 'excessively obedient or attentive',
    incorrectDefinition1: 'harsh and critical',
    incorrectDefinition2: 'dull or unimaginative',
    incorrectDefinition3: 'bold and assertive',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'quixotic',
    correctDefinition: 'extremely idealistic or impractical',
    incorrectDefinition1: 'realistic and practical',
    incorrectDefinition2: 'deceptive or dishonest',
    incorrectDefinition3: 'hostile or angry',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'disparate',
    correctDefinition: 'essentially different in kind; not comparable',
    incorrectDefinition1: 'closely related or similar',
    incorrectDefinition2: 'extremely abundant',
    incorrectDefinition3: 'hidden or obscure',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'recondite',
    correctDefinition: 'little known or obscure',
    incorrectDefinition1: 'widely known',
    incorrectDefinition2: 'loud and showy',
    incorrectDefinition3: 'based on emotion',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'vicissitude',
    correctDefinition: 'a sudden change of circumstances or fortune',
    incorrectDefinition1: 'a moral principle',
    incorrectDefinition2: 'a planned sequence of events',
    incorrectDefinition3: 'an argument or disagreement',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'noun'
  },
  {
    word: 'loquacious',
    correctDefinition: 'tending to talk a great deal; talkative',
    incorrectDefinition1: 'silent and withdrawn',
    incorrectDefinition2: 'lacking confidence',
    incorrectDefinition3: 'easily distracted',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'misanthrope',
    correctDefinition: 'one who hates or distrusts humankind',
    incorrectDefinition1: 'one who loves humanity',
    incorrectDefinition2: 'one who seeks solitude for meditation',
    incorrectDefinition3: 'one who acts without thought',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'noun'
  },
  {
    word: 'inimical',
    correctDefinition: 'harmful or hostile',
    incorrectDefinition1: 'friendly or supportive',
    incorrectDefinition2: 'neutral or indifferent',
    incorrectDefinition3: 'insignificant',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'laconic',
    correctDefinition: 'using few words; concise',
    incorrectDefinition1: 'verbose and long-winded',
    incorrectDefinition2: 'unclear or vague',
    incorrectDefinition3: 'cheerful and loud',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'munificent',
    correctDefinition: 'generous or liberal in giving',
    incorrectDefinition1: 'miserly or stingy',
    incorrectDefinition2: 'selfish and proud',
    incorrectDefinition3: 'polite but distant',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'paragon',
    correctDefinition: 'a model of excellence or perfection',
    incorrectDefinition1: 'a false appearance',
    incorrectDefinition2: 'a random occurrence',
    incorrectDefinition3: 'a kind of gemstone',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'noun'
  },
  {
    word: 'cacophony',
    correctDefinition: 'a harsh, discordant mixture of sounds',
    incorrectDefinition1: 'a pleasant harmony',
    incorrectDefinition2: 'a rhythmic sequence',
    incorrectDefinition3: 'a whisper or murmur',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'noun'
  },
  {
    word: 'disconsolate',
    correctDefinition: 'unable to be comforted; deeply unhappy',
    incorrectDefinition1: 'full of joy',
    incorrectDefinition2: 'energetic and ambitious',
    incorrectDefinition3: 'indifferent',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'equanimity',
    correctDefinition: 'mental calmness and composure',
    incorrectDefinition1: 'a strong sense of pride',
    incorrectDefinition2: 'great confusion or turmoil',
    incorrectDefinition3: 'playful behavior',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'noun'
  }
];

export async function POST() {
  try {
    console.log('🌱 Expanding vocabulary database...');

    let importedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const wordData of expandedWords) {
      try {
        // Check if word already exists
        const existingWord = await prisma.word.findUnique({
          where: { word: wordData.word }
        });

        if (!existingWord) {
          await prisma.word.create({ data: wordData });
          importedCount++;
          console.log(`✅ Added: ${wordData.word}`);
        } else {
          skippedCount++;
          console.log(`⏭️ Skipped (exists): ${wordData.word}`);
        }
      } catch (error) {
        const errorMsg = `Failed to import "${wordData.word}": ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.warn(`⚠️ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    // Create import batch record
    await prisma.importBatch.create({
      data: {
        batchName: "API Expanded vocabulary set",
        description: `Added ${importedCount} new vocabulary words via API`,
        totalWords: expandedWords.length,
        successfulImports: importedCount,
        failedImports: errors.length,
        duplicatesSkipped: skippedCount,
        status: errors.length === 0 ? "completed" : "completed_with_errors",
        importedBy: "api",
        completedAt: new Date(),
      }
    });

    // Get final count
    const totalWords = await prisma.word.count();

    return NextResponse.json({
      success: true,
      message: `Successfully expanded vocabulary database`,
      stats: {
        attempted: expandedWords.length,
        imported: importedCount,
        skipped: skippedCount,
        failed: errors.length,
        totalWordsInDB: totalWords
      },
      errors
    });

  } catch (error) {
    console.error('❌ Vocabulary expansion error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to expand vocabulary database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const totalWords = await prisma.word.count();
    const wordsByCategory = await prisma.word.groupBy({
      by: ['category'],
      _count: true
    });

    return NextResponse.json({
      totalWords,
      categories: wordsByCategory.map(group => ({
        category: group.category || 'uncategorized',
        count: group._count
      })),
      expandWordsAvailable: expandedWords.length,
      message: 'Use POST /api/vocabulary/expand to add more words'
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to get vocabulary stats'
    }, { status: 500 });
  }
}