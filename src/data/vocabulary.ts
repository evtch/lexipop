import { VocabularyWord } from '@/types/game';

/**
 * 🎯 VOCABULARY API INTEGRATION
 *
 * Updated to fetch words from the database API instead of hardcoded array
 * This enables access to 200+ vocabulary words with proper randomization
 */

/**
 * Get a random word from the database API
 */
export async function getRandomWord(): Promise<VocabularyWord> {
  const words = await getUniqueWords(1);
  return words[0];
}

/**
 * Get multiple unique words from the database API
 * @param count Number of words to fetch (default: 5)
 * @param difficulty Optional difficulty filter ('easy', 'medium', 'hard')
 * @param category Optional category filter ('academic', 'general')
 */
export async function getUniqueWords(
  count: number = 5,
  difficulty?: string,
  category?: string
): Promise<VocabularyWord[]> {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    params.append('count', count.toString());

    if (difficulty) {
      // Convert difficulty string to numeric for API
      const difficultyMap = { 'easy': '1', 'medium': '3', 'hard': '5' };
      const numericDifficulty = difficultyMap[difficulty as keyof typeof difficultyMap];
      if (numericDifficulty) {
        params.append('difficulty', numericDifficulty);
      }
    }

    if (category) {
      params.append('category', category);
    }

    const response = await fetch(`/api/vocabulary/random?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch words from API');
    }

    console.log(`✅ Fetched ${data.words.length} words from database (${data.metadata.totalWordsInDB} total available)`);
    return data.words;

  } catch (error) {
    console.error('❌ Failed to fetch words from API, falling back to local words:', error);

    // Fallback to a small set of local words if API fails
    return getFallbackWords(count);
  }
}

/**
 * Fallback vocabulary for when API is unavailable
 * Uses the original small set as emergency backup
 */
function getFallbackWords(count: number = 5): VocabularyWord[] {
  const fallbackDatabase: VocabularyWord[] = [
    {
      word: "Esoteric",
      correctDefinition: "Intended for or understood by only a small number of people with specialized knowledge",
      incorrectDefinitions: [
        "Extremely beautiful or pleasing to look at",
        "Having a strong unpleasant smell",
        "Moving very quickly or suddenly"
      ],
      difficulty: "hard"
    },
    {
      word: "Copacetic",
      correctDefinition: "In excellent order; very satisfactory",
      incorrectDefinitions: [
        "Showing aggressive or warlike behavior",
        "Lacking in energy or enthusiasm",
        "Having multiple contradictory meanings"
      ],
      difficulty: "medium"
    },
    {
      word: "Pragmatic",
      correctDefinition: "Dealing with things sensibly and realistically",
      incorrectDefinitions: [
        "Showing excessive pride in appearance",
        "Unable to make decisions quickly",
        "Having a fear of open spaces"
      ],
      difficulty: "medium"
    },
    {
      word: "Ubiquitous",
      correctDefinition: "Present, appearing, or found everywhere",
      incorrectDefinitions: [
        "Extremely difficult to understand",
        "Having the ability to predict the future",
        "Relating to underwater exploration"
      ],
      difficulty: "hard"
    },
    {
      word: "Ephemeral",
      correctDefinition: "Lasting for a very short time",
      incorrectDefinitions: [
        "Extremely expensive or costly",
        "Having supernatural powers",
        "Related to mathematical calculations"
      ],
      difficulty: "hard"
    }
  ];

  const shuffled = shuffleArray(fallbackDatabase);
  return shuffled.slice(0, Math.min(count, fallbackDatabase.length));
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}