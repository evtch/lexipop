export interface VocabularyWord {
  word: string;
  correctDefinition: string;
  incorrectDefinitions: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface GameState {
  currentWord: VocabularyWord | null;
  score: number;
  streak: number;
  totalQuestions: number;
  isGameActive: boolean;
  selectedAnswer: string | null;
  showResult: boolean;
  isCorrect: boolean | null;
}

export interface BubbleProps {
  text: string;
  isCorrect: boolean;
  onClick: () => void;
  isSelected: boolean;
  showResult: boolean;
  index: number;
}