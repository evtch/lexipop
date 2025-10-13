/**
 * 🌱 DATABASE SEEDING SCRIPT WITH PRISMA
 *
 * Seeds the database with initial vocabulary words
 * Run with: npm run db:seed
 */

import { prisma } from '../lib/prisma';

// Initial vocabulary words from the existing data
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
    incorrectDefinition1: 'a feeling of deep sadness',
    incorrectDefinition2: 'the ability to predict the future',
    incorrectDefinition3: 'a state of confusion',
    difficulty: 3,
    category: 'general',
    partOfSpeech: 'noun'
  },
  {
    word: 'mellifluous',
    correctDefinition: 'sweet or musical; pleasant to hear',
    incorrectDefinition1: 'extremely loud and harsh',
    incorrectDefinition2: 'relating to honey production',
    incorrectDefinition3: 'having a bitter taste',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'perspicacious',
    correctDefinition: 'having a ready insight into and understanding of things',
    incorrectDefinition1: 'being very talkative',
    incorrectDefinition2: 'showing great physical strength',
    incorrectDefinition3: 'prone to making mistakes',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'procrastinate',
    correctDefinition: 'delay or postpone action; put off doing something',
    incorrectDefinition1: 'to work very quickly and efficiently',
    incorrectDefinition2: 'to celebrate an achievement',
    incorrectDefinition3: 'to argue with someone strongly',
    difficulty: 2,
    category: 'general',
    partOfSpeech: 'verb'
  },
  {
    word: 'ostentatious',
    correctDefinition: 'characterized by vulgar or pretentious display',
    incorrectDefinition1: 'very humble and modest',
    incorrectDefinition2: 'relating to bones',
    incorrectDefinition3: 'happening very rarely',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'enigmatic',
    correctDefinition: 'difficult to interpret or understand; mysterious',
    incorrectDefinition1: 'very clear and obvious',
    incorrectDefinition2: 'relating to engines',
    incorrectDefinition3: 'extremely energetic',
    difficulty: 3,
    category: 'general',
    partOfSpeech: 'adjective'
  },
  {
    word: 'sycophant',
    correctDefinition: 'a person who acts obsequiously to gain advantage',
    incorrectDefinition1: 'a very honest and direct person',
    incorrectDefinition2: 'someone who studies plants',
    incorrectDefinition3: 'a type of musical instrument',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'noun'
  },
  {
    word: 'quintessential',
    correctDefinition: 'representing the most perfect example of a quality',
    incorrectDefinition1: 'being the fifth in a series',
    incorrectDefinition2: 'having no particular qualities',
    incorrectDefinition3: 'relating to questions',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'facetious',
    correctDefinition: 'treating serious issues with deliberately inappropriate humor',
    incorrectDefinition1: 'showing deep respect and seriousness',
    incorrectDefinition2: 'relating to facial expressions',
    incorrectDefinition3: 'being very factual and accurate',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'magnanimous',
    correctDefinition: 'generous or forgiving, especially toward a rival',
    incorrectDefinition1: 'being very selfish and petty',
    incorrectDefinition2: 'having magnetic properties',
    incorrectDefinition3: 'relating to large mammals',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'fastidious',
    correctDefinition: 'very attentive to accuracy and detail; hard to please',
    incorrectDefinition1: 'moving very quickly',
    incorrectDefinition2: 'being careless and sloppy',
    incorrectDefinition3: 'relating to fasting',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'gregarious',
    correctDefinition: 'fond of the company of others; sociable',
    incorrectDefinition1: 'preferring to be alone',
    incorrectDefinition2: 'relating to Greek culture',
    incorrectDefinition3: 'being very aggressive',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'laconic',
    correctDefinition: 'using few words; expressing much in few words',
    incorrectDefinition1: 'being very talkative',
    incorrectDefinition2: 'relating to lakes',
    incorrectDefinition3: 'showing lack of energy',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  }
];

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data
    await prisma.questionResponse.deleteMany();
    await prisma.gameSession.deleteMany();
    await prisma.userStats.deleteMany();
    await prisma.word.deleteMany();
    await prisma.category.deleteMany();
    await prisma.importBatch.deleteMany();

    console.log('🗑️ Cleared existing data');

    // Seed vocabulary words
    let importedCount = 0;
    for (const wordData of initialWords) {
      try {
        await prisma.word.create({ data: wordData });
        importedCount++;
      } catch (error) {
        console.warn(`⚠️ Failed to import word: ${wordData.word}`, error);
      }
    }

    console.log(`✅ Seeded ${importedCount} vocabulary words`);

    // Create categories
    await prisma.category.createMany({
      data: [
        {
          name: "academic",
          description: "Advanced academic vocabulary",
          difficultyRange: "3-5",
          wordCount: initialWords.filter(w => w.category === "academic").length,
        },
        {
          name: "general",
          description: "General vocabulary for everyday use",
          difficultyRange: "1-3",
          wordCount: initialWords.filter(w => w.category === "general").length,
        }
      ]
    });

    console.log('✅ Created word categories');

    // Create import batch record
    await prisma.importBatch.create({
      data: {
        batchName: "Initial vocabulary set",
        description: "First batch of vocabulary words for testing",
        totalWords: initialWords.length,
        successfulImports: importedCount,
        failedImports: initialWords.length - importedCount,
        duplicatesSkipped: 0,
        status: "completed",
        importedBy: "system",
        completedAt: new Date(),
      }
    });

    console.log('✅ Created import batch record');
    console.log('🎉 Database seeded successfully!');

  } catch (error) {
    console.error('\n💥 Seeding error:', error);
    process.exit(1);
  }
}

// Run the seeding
seedDatabase()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });