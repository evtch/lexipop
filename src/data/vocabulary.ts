import { VocabularyWord } from '@/types/game';

export const vocabularyDatabase: VocabularyWord[] = [
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
    word: "Trajectory",
    correctDefinition: "The path followed by a projectile flying through the air",
    incorrectDefinitions: [
      "A type of ancient Greek poetry",
      "The study of geological formations",
      "A method of artistic expression using colors"
    ],
    difficulty: "medium"
  },
  {
    word: "Compulsory",
    correctDefinition: "Required by law or a rule; obligatory",
    incorrectDefinitions: [
      "Done without thinking or planning",
      "Extremely generous with money",
      "Relating to the study of insects"
    ],
    difficulty: "easy"
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
    word: "Meticulous",
    correctDefinition: "Showing great attention to detail; very careful and precise",
    incorrectDefinitions: [
      "Extremely lazy or inactive",
      "Having a loud and unpleasant voice",
      "Prone to sudden changes in mood"
    ],
    difficulty: "easy"
  }
];

export function getRandomWord(): VocabularyWord {
  const randomIndex = Math.floor(Math.random() * vocabularyDatabase.length);
  return vocabularyDatabase[randomIndex];
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}