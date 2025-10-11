'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, VocabularyWord } from '@/types/game';
import { getUniqueWords, shuffleArray } from '@/data/vocabulary';
import { useNeynar } from './NeynarProvider';
import { useProfile } from '@farcaster/auth-kit';
// import { sdk } from '@farcaster/miniapp-sdk';
import SIWFAuth from './SIWFAuth';

// Frame-optimized components
import FrameWordBubble from './FrameWordBubble';
import FrameAnswerOption from './FrameAnswerOption';
import ScoreShare from './ScoreShare';
import MiniAppButton from './MiniAppButton';

export default function LexipopMiniApp() {
  const { user, isLoading, error, signIn, signOut, isAuthenticated } = useNeynar();
  const { isAuthenticated: isSIWFAuth, profile: siwfProfile } = useProfile();

  const [gameState, setGameState] = useState<GameState>({
    currentWord: null,
    gameQuestions: [],
    currentQuestionIndex: 0,
    score: 0,
    streak: 0,
    totalQuestions: 0,
    isGameActive: false,
    selectedAnswer: null,
    showResult: false,
    isCorrect: null
  });

  const [shuffledDefinitions, setShuffledDefinitions] = useState<string[]>([]);
  const [gameId, setGameId] = useState<string>('');
  const [showShareModal, setShowShareModal] = useState(false);

  // Initialize Farcaster miniapp SDK
  useEffect(() => {
    const initializeMiniApp = async () => {
      try {
        // await sdk.actions.ready();
        console.log('🎯 Farcaster miniapp ready (SDK commented out)');
      } catch (error) {
        console.error('❌ Failed to initialize Farcaster miniapp:', error);
      }
    };

    initializeMiniApp();
  }, []);

  const submitScore = async (score: number, streak: number, totalQuestions: number) => {
    if (!user) return;

    try {
      const response = await fetch('/api/game/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fid: user.fid,
          score,
          streak,
          totalQuestions,
          gameId
        }),
      });

      const data = await response.json();
      if (data.success) {
        console.log('✅ Score submitted successfully');
      }
    } catch (error) {
      console.error('❌ Failed to submit score:', error);
    }
  };

  const startNewGame = () => {
    const gameQuestions = getUniqueWords(5); // 5 questions per game
    const firstWord = gameQuestions[0];
    const allDefinitions = [firstWord.correctDefinition, ...firstWord.incorrectDefinitions];
    const shuffled = shuffleArray(allDefinitions);
    const newGameId = `game_${Date.now()}_${user?.fid || 'anon'}`;

    setShuffledDefinitions(shuffled);
    setGameId(newGameId);
    setGameState({
      currentWord: firstWord,
      gameQuestions,
      currentQuestionIndex: 0,
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
    const nextIndex = gameState.currentQuestionIndex + 1;
    if (nextIndex >= gameState.gameQuestions.length) {
      // Game should be complete, but just in case
      return;
    }

    const word = gameState.gameQuestions[nextIndex];
    const allDefinitions = [word.correctDefinition, ...word.incorrectDefinitions];
    const shuffled = shuffleArray(allDefinitions);

    setShuffledDefinitions(shuffled);
    setGameState(prev => ({
      ...prev,
      currentWord: word,
      currentQuestionIndex: nextIndex,
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

    // Submit score if user is authenticated
    if (isAuthenticated && user) {
      submitScore(gameState.score + (isCorrect ? 1 : 0), isCorrect ? gameState.streak + 1 : 0, gameState.totalQuestions + 1);
    }

    // Auto-advance to next question after 2 seconds
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-4 text-gray-800">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading Lexipop...</p>
        </div>
      </div>
    );
  }

  if (!gameState.isGameActive) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-4 text-gray-800">
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

          {/* Authentication Status */}
          <div className="mb-6">
            {isAuthenticated && user ? (
              <div className="bg-white/60 rounded-lg p-4 mb-4 border border-blue-200">
                <div className="flex items-center gap-3 justify-center">
                  {user.pfpUrl && (
                    <img
                      src={user.pfpUrl}
                      alt={user.username}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div>
                    <div className="font-semibold text-gray-800">{user.displayName}</div>
                    <div className="text-sm text-gray-600">@{user.username}</div>
                  </div>
                </div>
                <button
                  onClick={signOut}
                  className="mt-3 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="bg-white/60 rounded-lg p-4 mb-4 border border-blue-200">
                <p className="text-sm mb-3 text-gray-700">Sign in to track your scores!</p>
                <button
                  onClick={() => signIn()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors"
                >
                  Connect Farcaster
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <MiniAppButton
              onClick={startNewGame}
              variant="primary"
              size="lg"
              icon="🎮"
            >
              Start Playing
            </MiniAppButton>

            <MiniAppButton
              href="/miniapp/leaderboard"
              variant="secondary"
              size="lg"
              icon="🏆"
            >
              View Leaderboard
            </MiniAppButton>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col p-4 text-gray-800 overflow-hidden">
      {/* Header - Compact for Frame */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">Lexipop</h1>
          {user && (
            <div className="flex items-center gap-1">
              {user.pfpUrl && (
                <img
                  src={user.pfpUrl}
                  alt={user.username}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <span className="text-sm text-gray-600">@{user.username}</span>
            </div>
          )}
        </div>
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
      <div className="text-center mb-6">
        <p className="text-sm text-gray-600">Choose the correct definition:</p>
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

      {/* Bottom Navigation */}
      <div className="flex-shrink-0 mt-4 space-y-3">
        <MiniAppButton
          href="/miniapp/leaderboard"
          variant="secondary"
          size="md"
          icon="🏆"
        >
          View Leaderboard
        </MiniAppButton>

        {gameState.totalQuestions > 0 && (
          <MiniAppButton
            onClick={() => setShowShareModal(true)}
            variant="primary"
            size="md"
            icon="📤"
          >
            Share Score
          </MiniAppButton>
        )}

        <MiniAppButton
          onClick={() => {
            setGameState({
              currentWord: null,
              gameQuestions: [],
              currentQuestionIndex: 0,
              score: 0,
              streak: 0,
              totalQuestions: 0,
              isGameActive: false,
              selectedAnswer: null,
              showResult: false,
              isCorrect: null
            });
          }}
          variant="warning"
          size="md"
          icon="🏠"
        >
          Back to Home
        </MiniAppButton>
      </div>

      {/* Score Share Modal */}
      <ScoreShare
        score={gameState.score}
        streak={gameState.streak}
        totalQuestions={gameState.totalQuestions}
        isVisible={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

    </div>
  );
}