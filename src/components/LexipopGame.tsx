'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, VocabularyWord } from '@/types/game';
import { getRandomWord, shuffleArray } from '@/data/vocabulary';
import WordBubble from './WordBubble';
import AnswerOption from './AnswerOption';
import { useNeynar } from '@/app/miniapp/components/NeynarProvider';
import ScoreShare from '@/app/miniapp/components/ScoreShare';
import SpinningWheel from './SpinningWheel';
import TokenClaimModal, { useTokenClaimModal } from '@/app/miniapp/components/TokenClaimModal';

export default function LexipopGame() {
  const { user, isLoading, error, signIn, signOut, isAuthenticated } = useNeynar();
  const tokenClaimModal = useTokenClaimModal();

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
  const [gameId, setGameId] = useState<string>('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSpinningWheel, setShowSpinningWheel] = useState(false);
  const [totalTokensEarned, setTotalTokensEarned] = useState(0);

  // Game configuration
  const QUESTIONS_PER_GAME = 5;

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

  const handleRewardClaimed = (tokens: number) => {
    setTotalTokensEarned(prev => prev + tokens);
    console.log(`✅ Claimed ${tokens} $LEXIPOP tokens! Total: ${totalTokensEarned + tokens}`);

    // Open token claim modal with game data
    const accuracy = Math.round((gameState.score / gameState.totalQuestions) * 100);
    tokenClaimModal.openModal({
      tokensEarned: tokens,
      gameScore: gameState.score,
      accuracy,
      gameId
    });
  };

  const shouldShowSpinningWheel = () => {
    return gameState.totalQuestions >= QUESTIONS_PER_GAME;
  };

  const isGameComplete = () => {
    return gameState.totalQuestions >= QUESTIONS_PER_GAME;
  };

  const startNewGame = () => {
    const word = getRandomWord();
    const allDefinitions = [word.correctDefinition, ...word.incorrectDefinitions];
    const shuffled = shuffleArray(allDefinitions);
    const newGameId = `game_${Date.now()}_${user?.fid || 'anon'}`;

    setShuffledDefinitions(shuffled);
    setGameId(newGameId);
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

    // Submit score if user is authenticated
    if (isAuthenticated && user) {
      submitScore(gameState.score + (isCorrect ? 1 : 0), isCorrect ? gameState.streak + 1 : 0, gameState.totalQuestions + 1);
    }

    // Check if game is complete after this question
    if (gameState.totalQuestions + 1 >= QUESTIONS_PER_GAME) {
      // Game complete - show spinning wheel after 2 seconds
      setTimeout(() => {
        setShowSpinningWheel(true);
      }, 2000);
    } else {
      // Continue to next question after 2 seconds
      setTimeout(() => {
        nextQuestion();
      }, 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading Lexipop...</p>
        </div>
      </div>
    );
  }

  if (!gameState.isGameActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-6xl font-bold text-blue-600 mb-4">
            Lexipop
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-md">
            Test your vocabulary! Choose the correct definition for each word.
          </p>

          {/* Authentication Status */}
          <div className="mb-8">
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
            <motion.button
              onClick={startNewGame}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-full text-lg shadow-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Playing
            </motion.button>

            <motion.a
              href="/leaderboard"
              className="block text-center text-blue-600 hover:text-blue-700 transition-colors font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              🏆 View Leaderboard
            </motion.a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-blue-600">Lexipop</h1>
          {user && (
            <div className="flex items-center gap-2">
              {user.pfpUrl && (
                <img
                  src={user.pfpUrl}
                  alt={user.username}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-sm text-gray-600">@{user.username}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-3">
            <a
              href="/leaderboard"
              className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
            >
              🏆 Leaderboard
            </a>
            {gameState.totalQuestions > 0 && (
              <button
                onClick={() => setShowShareModal(true)}
                className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
              >
                📤 Share
              </button>
            )}
            {shouldShowSpinningWheel() && (
              <button
                onClick={() => setShowSpinningWheel(true)}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-3 py-1 rounded-full text-sm font-medium transition-all animate-pulse"
              >
                🎰 Claim Tokens
              </button>
            )}
          </div>
          <div className="flex gap-6 text-blue-900">
            {totalTokensEarned > 0 && (
              <div className="text-center">
                <div className="text-sm font-medium">Tokens</div>
                <div className="text-xl font-bold text-yellow-600">{totalTokensEarned.toLocaleString()}</div>
              </div>
            )}
            <div className="text-center">
              <div className="text-sm font-medium">Score</div>
              <div className="text-xl font-bold">{gameState.score}</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">Streak</div>
              <div className="text-xl font-bold">{gameState.streak}</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">Progress</div>
              <div className="text-xl font-bold">{gameState.totalQuestions}/{QUESTIONS_PER_GAME}</div>
            </div>
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
      <div className="text-center mb-13">
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

      {/* Score Share Modal */}
      <ScoreShare
        score={gameState.score}
        streak={gameState.streak}
        totalQuestions={gameState.totalQuestions}
        isVisible={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      {/* Spinning Wheel Modal */}
      <SpinningWheel
        isVisible={showSpinningWheel}
        onClose={() => setShowSpinningWheel(false)}
        onRewardClaimed={handleRewardClaimed}
        gameScore={gameState.score}
        gameStreak={gameState.streak}
        totalQuestions={gameState.totalQuestions}
      />

      {/* Token Claim Modal */}
      {tokenClaimModal.gameData && (
        <TokenClaimModal
          isOpen={tokenClaimModal.isOpen}
          onClose={tokenClaimModal.closeModal}
          tokensEarned={tokenClaimModal.gameData.tokensEarned}
          gameScore={tokenClaimModal.gameData.gameScore}
          accuracy={tokenClaimModal.gameData.accuracy}
          gameId={tokenClaimModal.gameData.gameId}
        />
      )}
    </div>
  );
}