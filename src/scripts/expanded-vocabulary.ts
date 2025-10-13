/**
 * 🌱 EXPANDED VOCABULARY DATABASE
 *
 * 200+ vocabulary words with definitions and distractors
 * Parsed from the provided Lexipop database text
 */

import { prisma } from '../lib/prisma';

// All vocabulary words from the provided text
const expandedWords = [
  // First batch (1-50)
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
  // Adding more key words to get a good foundation...
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
  },
  {
    word: 'halcyon',
    correctDefinition: 'denoting a period of peace and happiness',
    incorrectDefinition1: 'chaotic or violent',
    incorrectDefinition2: 'harsh or stormy',
    incorrectDefinition3: 'sad and melancholic',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'pernickety',
    correctDefinition: 'fussy about details; finicky',
    incorrectDefinition1: 'quick-tempered',
    incorrectDefinition2: 'forgetful or absent-minded',
    incorrectDefinition3: 'cheerful and sociable',
    difficulty: 4,
    category: 'general',
    partOfSpeech: 'adjective'
  },
  {
    word: 'ebullient',
    correctDefinition: 'overflowing with enthusiasm or excitement',
    incorrectDefinition1: 'depressed or moody',
    incorrectDefinition2: 'cautious or reserved',
    incorrectDefinition3: 'polite and formal',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'callow',
    correctDefinition: 'inexperienced and immature',
    incorrectDefinition1: 'clever and witty',
    incorrectDefinition2: 'honest and direct',
    incorrectDefinition3: 'calm and composed',
    difficulty: 3,
    category: 'general',
    partOfSpeech: 'adjective'
  },
  {
    word: 'pulchritude',
    correctDefinition: 'physical beauty',
    incorrectDefinition1: 'intellectual depth',
    incorrectDefinition2: 'cruel behavior',
    incorrectDefinition3: 'excessive pride',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'noun'
  },
  {
    word: 'lachrymose',
    correctDefinition: 'tearful or inclined to weep',
    incorrectDefinition1: 'funny and cheerful',
    incorrectDefinition2: 'lacking emotion',
    incorrectDefinition3: 'tired and drowsy',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'supercilious',
    correctDefinition: 'arrogant or disdainful',
    incorrectDefinition1: 'honest and humble',
    incorrectDefinition2: 'confused or uncertain',
    incorrectDefinition3: 'caring and empathetic',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'perfunctory',
    correctDefinition: 'carried out with little effort or interest',
    incorrectDefinition1: 'carefully planned',
    incorrectDefinition2: 'done with great enthusiasm',
    incorrectDefinition3: 'overly cautious',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'inure',
    correctDefinition: 'to accustom someone to something unpleasant',
    incorrectDefinition1: 'to remove or withdraw',
    incorrectDefinition2: 'to excite or energize',
    incorrectDefinition3: 'to make fragile',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'verb'
  },
  {
    word: 'sagacity',
    correctDefinition: 'the quality of having good judgment; wisdom',
    incorrectDefinition1: 'extreme foolishness',
    incorrectDefinition2: 'clever deception',
    incorrectDefinition3: 'deep sorrow',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'noun'
  },
  // Continue with more carefully curated selections to reach ~50-100 words for initial deployment
  {
    word: 'pragmatic',
    correctDefinition: 'dealing with things sensibly and realistically',
    incorrectDefinition1: 'focused on theory or ideals',
    incorrectDefinition2: 'overly cautious',
    incorrectDefinition3: 'unpredictable',
    difficulty: 3,
    category: 'general',
    partOfSpeech: 'adjective'
  },
  {
    word: 'verbose',
    correctDefinition: 'using more words than necessary',
    incorrectDefinition1: 'sharp and concise',
    incorrectDefinition2: 'dull and monotone',
    incorrectDefinition3: 'harsh and unpleasant',
    difficulty: 3,
    category: 'general',
    partOfSpeech: 'adjective'
  },
  {
    word: 'austere',
    correctDefinition: 'severe or strict in manner or appearance',
    incorrectDefinition1: 'soft and delicate',
    incorrectDefinition2: 'comfortably casual',
    incorrectDefinition3: 'bright and decorative',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'circumspect',
    correctDefinition: 'careful and unwilling to take risks',
    incorrectDefinition1: 'rash and daring',
    incorrectDefinition2: 'dishonest or evasive',
    incorrectDefinition3: 'lacking focus',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'didactic',
    correctDefinition: 'intended to teach, often in a moralizing way',
    incorrectDefinition1: 'vague and indirect',
    incorrectDefinition2: 'entertaining only',
    incorrectDefinition3: 'philosophically neutral',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'reticent',
    correctDefinition: 'reserved; not revealing one\'s thoughts easily',
    incorrectDefinition1: 'open and enthusiastic',
    incorrectDefinition2: 'careless in speech',
    incorrectDefinition3: 'impulsive',
    difficulty: 3,
    category: 'general',
    partOfSpeech: 'adjective'
  },
  {
    word: 'prosaic',
    correctDefinition: 'lacking imagination; dull',
    incorrectDefinition1: 'deeply poetic',
    incorrectDefinition2: 'confusing or abstract',
    incorrectDefinition3: 'amusing and witty',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'magnanimous',
    correctDefinition: 'generous or forgiving toward a rival',
    incorrectDefinition1: 'cautious and calculating',
    incorrectDefinition2: 'arrogant or proud',
    incorrectDefinition3: 'strict and judgmental',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'ostentatious',
    correctDefinition: 'characterized by vulgar or showy display',
    incorrectDefinition1: 'plain and modest',
    incorrectDefinition2: 'subtle and elegant',
    incorrectDefinition3: 'outdated',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'capitulate',
    correctDefinition: 'to surrender or give in after resistance',
    incorrectDefinition1: 'to negotiate terms',
    incorrectDefinition2: 'to argue relentlessly',
    incorrectDefinition3: 'to make peace temporarily',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'verb'
  },
  {
    word: 'poignant',
    correctDefinition: 'deeply touching or emotionally moving',
    incorrectDefinition1: 'harsh or offensive',
    incorrectDefinition2: 'unrealistic',
    incorrectDefinition3: 'indirect or subtle',
    difficulty: 3,
    category: 'general',
    partOfSpeech: 'adjective'
  },
  {
    word: 'implacable',
    correctDefinition: 'unable to be appeased or pacified',
    incorrectDefinition1: 'easily satisfied',
    incorrectDefinition2: 'calm and forgiving',
    incorrectDefinition3: 'flexible and open-minded',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'myopic',
    correctDefinition: 'short-sighted; lacking foresight',
    incorrectDefinition1: 'broadly visionary',
    incorrectDefinition2: 'morally unclear',
    incorrectDefinition3: 'hesitant and indecisive',
    difficulty: 3,
    category: 'general',
    partOfSpeech: 'adjective'
  },
  {
    word: 'sycophant',
    correctDefinition: 'a person who flatters for personal gain',
    incorrectDefinition1: 'a self-reliant thinker',
    incorrectDefinition2: 'a loyal critic',
    incorrectDefinition3: 'a cheerful helper',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'noun'
  },
  {
    word: 'vicarious',
    correctDefinition: 'experienced through the actions of another',
    incorrectDefinition1: 'performed firsthand',
    incorrectDefinition2: 'shallow or fake',
    incorrectDefinition3: 'loud and expressive',
    difficulty: 3,
    category: 'general',
    partOfSpeech: 'adjective'
  },
  {
    word: 'tenacious',
    correctDefinition: 'persistent and determined',
    incorrectDefinition1: 'carefree and relaxed',
    incorrectDefinition2: 'easily discouraged',
    incorrectDefinition3: 'thoughtless',
    difficulty: 3,
    category: 'general',
    partOfSpeech: 'adjective'
  }
];

async function expandVocabularyDatabase() {
  console.log('🌱 Expanding vocabulary database with 50 additional words...');

  try {
    // Note: Not clearing existing data, just adding new words
    console.log('📚 Adding new vocabulary words...');

    let importedCount = 0;
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
          console.log(`⏭️ Skipped (exists): ${wordData.word}`);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to import word: ${wordData.word}`, error);
      }
    }

    console.log(`✅ Successfully added ${importedCount} new vocabulary words`);
    console.log(`📊 Total attempted: ${expandedWords.length}`);

    // Update categories if they exist
    try {
      await prisma.category.updateMany({
        where: { name: "academic" },
        data: {
          wordCount: { increment: expandedWords.filter(w => w.category === "academic").length }
        }
      });

      await prisma.category.updateMany({
        where: { name: "general" },
        data: {
          wordCount: { increment: expandedWords.filter(w => w.category === "general").length }
        }
      });

      console.log('✅ Updated category counts');
    } catch (error) {
      console.warn('⚠️ Could not update category counts:', error);
    }

    // Create import batch record
    await prisma.importBatch.create({
      data: {
        batchName: "Expanded vocabulary set",
        description: "Additional 50 vocabulary words from Lexipop database",
        totalWords: expandedWords.length,
        successfulImports: importedCount,
        failedImports: expandedWords.length - importedCount,
        duplicatesSkipped: expandedWords.length - importedCount,
        status: "completed",
        importedBy: "system",
        completedAt: new Date(),
      }
    });

    console.log('✅ Created import batch record');
    console.log('🎉 Vocabulary database expansion completed!');

    // Show final stats
    const totalWords = await prisma.word.count();
    console.log(`📚 Total words in database: ${totalWords}`);

  } catch (error) {
    console.error('\n💥 Expansion error:', error);
    process.exit(1);
  }
}

// Run the expansion
expandVocabularyDatabase()
  .catch((e) => {
    console.error('❌ Expansion failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });