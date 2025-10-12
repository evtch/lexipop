'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, VocabularyWord } from '@/types/game';
import { getUniqueWords, shuffleArray } from '@/data/vocabulary';
import { sdk } from '@farcaster/miniapp-sdk';
import { useFarcasterUser } from '@/lib/hooks/useFarcasterUser';

// Frame-optimized components
import FrameWordBubble from './FrameWordBubble';
import FrameAnswerOption from './FrameAnswerOption';
import ScoreShare from './ScoreShare';
import MiniAppButton from './MiniAppButton';
import TokenWheel from './TokenWheel';

export default function LexipopMiniApp() {
  // Use automatic Farcaster user detection from miniapp context
  const farcasterUser = useFarcasterUser();

  // User is automatically authenticated if FID is available
  const isUserAuthenticated = !!farcasterUser.fid;
  const currentUser = farcasterUser;
  const isLoading = farcasterUser.isLoading;

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
  const [showTokenWheel, setShowTokenWheel] = useState(false);
  const [completedWords, setCompletedWords] = useState<typeof gameState.gameQuestions>([]);

  // Initialize Farcaster miniapp SDK
  useEffect(() => {
    const initializeMiniApp = async () => {
      try {
        await sdk.actions.ready();
        console.log('🎯 Farcaster miniapp ready');
      } catch (error) {
        console.error('❌ Failed to initialize Farcaster miniapp:', error);
      }
    };

    initializeMiniApp();
  }, []);

  const submitScore = async (score: number, streak: number, totalQuestions: number) => {
    if (!currentUser) return;

    try {
      const response = await fetch('/api/game/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fid: currentUser.fid,
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
    const newGameId = `game_${Date.now()}_${currentUser?.fid || 'anon'}`;

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
      // Game complete - go directly to token wheel
      setCompletedWords(gameState.gameQuestions);
      setShowTokenWheel(true);
      setGameState(prev => ({
        ...prev,
        isGameActive: false,
        currentWord: null
      }));
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
    if (isUserAuthenticated && currentUser) {
      submitScore(gameState.score + (isCorrect ? 1 : 0), isCorrect ? gameState.streak + 1 : 0, gameState.totalQuestions + 1);
    }

    // Auto-advance to next question after 2 seconds
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };


  const handleTokenClaim = (amount: number) => {
    console.log(`💰 Claimed ${amount} LEXIPOP tokens!`);
    // TODO: Implement actual token claiming logic
    setShowTokenWheel(false);
  };

  const resetGameFlow = () => {
    setShowTokenWheel(false);
    setCompletedWords([]);
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
  };

  const handleViewLeaderboard = () => {
    // Navigate to leaderboard (this will be handled by the browser)
    window.location.href = '/miniapp/leaderboard';
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
      <div className="flex flex-col p-4 text-gray-800" style={{ height: '90vh', maxHeight: '90vh' }}>
        {/* Compact Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Lexipop</h1>
          {isUserAuthenticated && currentUser && (
            <div className="flex items-center gap-2">
              {currentUser.pfpUrl && (
                <img
                  src={currentUser.pfpUrl}
                  alt={currentUser.username}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-sm text-gray-600">@{currentUser.username}</span>
            </div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col"
        >
          {gameState.totalQuestions > 0 ? (
            // Game Complete Layout
            <>
              {/* Score Card */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-r from-green-400 to-blue-500 rounded-xl p-6 text-white shadow-lg mb-6"
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">🎉</div>
                  <div className="text-2xl font-bold mb-4">Game Complete!</div>

                  {/* Large Score Display */}
                  <div className="bg-white/20 rounded-lg p-4 mb-4">
                    <div className="text-4xl font-bold">
                      {gameState.score}/{gameState.totalQuestions}, {Math.round((gameState.score / gameState.totalQuestions) * 100)}% correct
                    </div>
                  </div>

                  {/* Performance Message */}
                  <div className="mt-4 text-lg font-semibold">
                    {gameState.score === gameState.totalQuestions
                      ? "Perfect! 🌟"
                      : gameState.score >= gameState.totalQuestions * 0.8
                      ? "Great job! 👏"
                      : gameState.score >= gameState.totalQuestions * 0.6
                      ? "Well done! 👍"
                      : "Keep practicing! 📚"}
                  </div>
                </div>
              </motion.div>

              {/* User Info Card */}
              {isUserAuthenticated && currentUser && (
                <div className="bg-white/60 rounded-lg p-4 mb-6 border border-blue-200">
                  <div className="flex items-center gap-4">
                    {currentUser.pfpUrl && (
                      <img
                        src={currentUser.pfpUrl}
                        alt={currentUser.username}
                        className="w-12 h-12 rounded-full border-2 border-blue-200"
                      />
                    )}
                    <div className="flex-1">
                      <div className="text-lg font-bold text-gray-800">{currentUser.displayName}</div>
                      <div className="text-sm text-gray-600">@{currentUser.username}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 mt-auto">
                <MiniAppButton
                  onClick={() => setShowTokenWheel(true)}
                  variant="primary"
                  size="lg"
                  icon="🎰"
                  className="w-full"
                >
                  Spin to Win!
                </MiniAppButton>

                <MiniAppButton
                  onClick={startNewGame}
                  variant="secondary"
                  size="lg"
                  icon="🔄"
                  className="w-full"
                >
                  Play Again
                </MiniAppButton>

                <MiniAppButton
                  href="/miniapp/leaderboard"
                  variant="secondary"
                  size="lg"
                  icon="🏆"
                  className="w-full"
                >
                  View Leaderboard
                </MiniAppButton>
              </div>
            </>
          ) : (
            // First Time Layout
            <>
              <div className="text-center mb-8">
                <p className="text-lg opacity-90">
                  Learn vocabulary the fun way!
                </p>
              </div>

              {/* User Status */}
              <div className="mb-6">
                {isUserAuthenticated && currentUser ? (
                  <div className="bg-white/60 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-4">
                      {currentUser.pfpUrl && (
                        <img
                          src={currentUser.pfpUrl}
                          alt={currentUser.username}
                          className="w-12 h-12 rounded-full border-2 border-blue-200"
                        />
                      )}
                      <div className="flex-1">
                        <div className="text-lg font-bold text-gray-800">{currentUser.displayName}</div>
                        <div className="text-sm text-gray-600">@{currentUser.username}</div>
                      </div>
                    </div>
                  </div>
                ) : currentUser.error ? (
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <p className="text-base text-red-700 font-semibold">
                      ⚠️ This app works best when opened in Farcaster
                    </p>
                    <p className="text-sm text-red-600 mt-2">
                      {currentUser.error}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="space-y-4 mt-auto">
                <MiniAppButton
                  onClick={startNewGame}
                  variant="primary"
                  size="lg"
                  icon="🎮"
                  className="w-full"
                >
                  Start Playing
                </MiniAppButton>

                <MiniAppButton
                  href="/miniapp/leaderboard"
                  variant="secondary"
                  size="lg"
                  icon="🏆"
                  className="w-full"
                >
                  View Leaderboard
                </MiniAppButton>
              </div>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 text-gray-800 overflow-hidden" style={{ height: '90vh', maxHeight: '90vh' }}>
      {/* Header - Compact for Frame */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">Lexipop</h1>
          {currentUser && (
            <div className="flex items-center gap-1">
              {currentUser.pfpUrl && (
                <img
                  src={currentUser.pfpUrl}
                  alt={currentUser.username}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <span className="text-sm text-gray-600">@{currentUser.username}</span>
            </div>
          )}
        </div>
        <div className="flex gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium">Score</div>
            <div className="text-lg font-bold">{gameState.score}</div>
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

      {/* Clean interface during quiz - no navigation buttons */}

      {/* Score Share Modal */}
      <ScoreShare
        score={gameState.score}
        streak={gameState.streak}
        totalQuestions={gameState.totalQuestions}
        isVisible={showShareModal}
        onClose={() => setShowShareModal(false)}
        user={currentUser}
      />


      {/* Token Claiming Wheel */}
      <TokenWheel
        isVisible={showTokenWheel}
        onClaim={handleTokenClaim}
        onClose={resetGameFlow}
        onViewLeaderboard={handleViewLeaderboard}
        gameData={{
          score: gameState.score,
          streak: gameState.streak,
          totalQuestions: gameState.totalQuestions,
          gameId: gameId,
          userFid: currentUser?.fid,
        }}
      />

    </div>
  );
}