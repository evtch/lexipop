'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, VocabularyWord } from '@/types/game';
import { getRandomWord, shuffleArray } from '@/data/vocabulary';
import WordBubble from './WordBubble';
import AnswerOption from './AnswerOption';

export default function LexipopGame() {
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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-6xl font-bold text-blue-600 mb-4">
            Lexipop
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-md">
            Test your vocabulary knowledge! Tap the bubble with the correct definition.
          </p>
          <motion.button
            onClick={startNewGame}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-full text-lg shadow-lg transition-colors"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600">Lexipop</h1>
        <div className="flex gap-6 text-blue-900">
          <div className="text-center">
            <div className="text-sm font-medium">Score</div>
            <div className="text-xl font-bold">{gameState.score}</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium">Streak</div>
            <div className="text-xl font-bold">{gameState.streak}</div>
          </div>
        </div>
      </div>

      {/* Floating Word Bubble */}
      <AnimatePresence mode="wait">
        {gameState.currentWord && (
          <WordBubble
            key={gameState.currentWord.word}
            word={gameState.currentWord.word}
            isVisible={!!gameState.currentWord}
            isCorrect={gameState.isCorrect}
            showResult={gameState.showResult}
          />
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="text-center mb-8">
        <p className="text-xl text-gray-600 font-medium">
          Choose the correct definition:
        </p>
      </div>

      {/* Answer Options */}
      <div className="max-w-4xl mx-auto space-y-4">
        {shuffledDefinitions.map((definition, index) => {
          const letters = ['A', 'B', 'C', 'D'] as const;
          return (
            <AnswerOption
              key={`${gameState.currentWord?.word}-${definition}`}
              letter={letters[index]}
              text={definition}
              isCorrect={definition === gameState.currentWord?.correctDefinition}
              isSelected={definition === gameState.selectedAnswer}
              showResult={gameState.showResult}
              onClick={() => handleAnswerSelect(definition)}
              index={index}
            />
          );
        })}
      </div>

      {/* Result Feedback */}
      <AnimatePresence>
        {gameState.showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center mt-8"
          >
            <div className={`text-2xl font-bold ${gameState.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {gameState.isCorrect ? '🎉 Correct!' : '❌ Incorrect'}
            </div>
            {!gameState.isCorrect && (
              <div className="text-gray-600 mt-2">
                The correct answer was: <span className="font-semibold">{gameState.currentWord?.correctDefinition}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}