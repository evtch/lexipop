'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, VocabularyWord } from '@/types/game';
import { getRandomWord, shuffleArray } from '@/data/vocabulary';

// Frame-optimized components
import FrameWordBubble from './FrameWordBubble';
import FrameAnswerOption from './FrameAnswerOption';

export default function LexipopMiniApp() {
  const [gameState, setGameState] = useState<GameState>({
    currentWord: null,
    score: 0,
    streak: 0,
    totalQuestions: 0,
    isGameActive: false,
    selectedAnswer: null,
    showResult: false,
    isCorrect: null
  });

  const [shuffledDefinitions, setShuffledDefinitions] = useState<string[]>([]);

  const startNewGame = () => {
    const word = getRandomWord();
    const allDefinitions = [word.correctDefinition, ...word.incorrectDefinitions];
    const shuffled = shuffleArray(allDefinitions);

    setShuffledDefinitions(shuffled);
    setGameState({
      currentWord: word,
      score: 0,
      streak: 0,
      totalQuestions: 0,
      isGameActive: true,
      selectedAnswer: null,
      showResult: false,
      isCorrect: null
    });
  };

  const nextQuestion = () => {
    const word = getRandomWord();
    const allDefinitions = [word.correctDefinition, ...word.incorrectDefinitions];
    const shuffled = shuffleArray(allDefinitions);

    setShuffledDefinitions(shuffled);
    setGameState(prev => ({
      ...prev,
      currentWord: word,
      selectedAnswer: null,
      showResult: false,
      isCorrect: null
    }));
  };

  const handleAnswerSelect = (selectedDefinition: string) => {
    if (!gameState.currentWord || gameState.showResult) return;

    const isCorrect = selectedDefinition === gameState.currentWord.correctDefinition;

    setGameState(prev => ({
      ...prev,
      selectedAnswer: selectedDefinition,
      showResult: true,
      isCorrect,
      score: isCorrect ? prev.score + 1 : prev.score,
      streak: isCorrect ? prev.streak + 1 : 0,
      totalQuestions: prev.totalQuestions + 1
    }));

    // Auto-advance to next question after 2 seconds
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  if (!gameState.isGameActive) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-4 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2">Lexipop</h1>
            <p className="text-lg opacity-90">
              Learn vocabulary the fun way!
            </p>
          </div>

          <motion.button
            onClick={startNewGame}
            className="game-button bg-white text-blue-600 font-semibold py-3 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Playing
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col p-4 text-white overflow-hidden">
      {/* Header - Compact for Frame */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Lexipop</h1>
        <div className="flex gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium">Score</div>
            <div className="text-lg font-bold">{gameState.score}</div>
          </div>
          <div className="text-center">
            <div className="font-medium">Streak</div>
            <div className="text-lg font-bold">{gameState.streak}</div>
          </div>
        </div>
      </div>

      {/* Word Bubble - Smaller for Frame */}
      <div className="flex-shrink-0 mb-4">
        <AnimatePresence mode="wait">
          {gameState.currentWord && (
            <FrameWordBubble
              key={gameState.currentWord.word}
              word={gameState.currentWord.word}
              isVisible={!!gameState.currentWord}
              isCorrect={gameState.isCorrect}
              showResult={gameState.showResult}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Instructions */}
      <div className="text-center mb-4">
        <p className="text-sm opacity-90">Choose the correct definition:</p>
      </div>

      {/* Answer Options - Compact for Frame */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {shuffledDefinitions.map((definition, index) => {
          const letters = ['A', 'B', 'C', 'D'] as const;
          return (
            <motion.div
              key={`${gameState.currentWord?.word}-${definition}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <FrameAnswerOption
                letter={letters[index]}
                text={definition}
                isCorrect={definition === gameState.currentWord?.correctDefinition}
                isSelected={definition === gameState.selectedAnswer}
                showResult={gameState.showResult}
                onClick={() => handleAnswerSelect(definition)}
                index={index}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Result Feedback */}
      <AnimatePresence>
        {gameState.showResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center mt-4"
          >
            <div className={`text-lg font-bold ${gameState.isCorrect ? 'text-green-300' : 'text-red-300'}`}>
              {gameState.isCorrect ? '🎉 Correct!' : '❌ Incorrect'}
            </div>
            {!gameState.isCorrect && (
              <div className="text-sm opacity-80 mt-1">
                Correct: <span className="font-semibold">{gameState.currentWord?.correctDefinition}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}