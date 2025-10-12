'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, VocabularyWord } from '@/types/game';
import { getUniqueWords, shuffleArray } from '@/data/vocabulary';
import { sdk } from '@farcaster/miniapp-sdk';
import { useFarcasterUser } from '@/lib/hooks/useFarcasterUser';
import { generateCommitment } from '@/lib/pyth-entropy';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useFarcasterAccount } from '@/lib/web3/hooks/useFarcasterAccount';

// Frame-optimized components
import FrameWordBubble from './FrameWordBubble';
import FrameAnswerOption from './FrameAnswerOption';
import ScoreShare from './ScoreShare';
import MiniAppButton from './MiniAppButton';

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
  const [completedWords, setCompletedWords] = useState<typeof gameState.gameQuestions>([]);

  // Token generation state
  const [generatedTokens, setGeneratedTokens] = useState<number | null>(null);
  const [isGeneratingTokens, setIsGeneratingTokens] = useState(false);
  const [isClaimingTokens, setIsClaimingTokens] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [currentNumber, setCurrentNumber] = useState(0);

  // Wallet connection hooks
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const farcasterAccount = useFarcasterAccount();

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
    console.log('🎮 Starting new game');

    const gameQuestions = getUniqueWords(1); // 1 question per game for testing
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


  // Airport-style number generator effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isGeneratingTokens) {
      interval = setInterval(() => {
        setCurrentNumber(Math.floor(Math.random() * 100) + 1);
      }, 100); // Change number every 100ms
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGeneratingTokens]);

  const generateTokens = () => {
    if (isGeneratingTokens) return;

    setIsGeneratingTokens(true);
    setGeneratedTokens(null);
    setClaimError(null);
    setCurrentNumber(0);

    // Generate final token amount using Pyth entropy
    const generateFinalAmount = () => {
      try {
        // Create deterministic input from game data for verifiable randomness
        const userInput = `${gameId}-${gameState.score}-${gameState.streak}-${currentUser?.fid || 'anon'}`;
        const timestamp = Date.now();
        const { commitment, userRandomness } = generateCommitment(userInput, timestamp);

        // Convert the commitment hash to a number
        const hashBytes = commitment.slice(2); // Remove '0x'
        const randomValue = parseInt(hashBytes.slice(0, 8), 16); // Use first 32 bits

        // Generate token amount between 1-100 using Pyth entropy
        const tokenAmount = 1 + (randomValue % 100);

        console.log('🎲 Pyth Entropy Token Generation:', {
          userInput,
          commitment,
          randomValue,
          tokenAmount,
          source: 'Pyth Network Entropy'
        });

        return tokenAmount;
      } catch (error) {
        console.error('❌ Pyth entropy failed, fallback to Math.random:', error);
        // Fallback to regular random if Pyth fails
        return 1 + Math.floor(Math.random() * 100);
      }
    };

    const finalAmount = generateFinalAmount();

    // Run the number generator for 3 seconds, then show final result
    setTimeout(() => {
      setIsGeneratingTokens(false);
      setGeneratedTokens(finalAmount);
      setCurrentNumber(finalAmount);
    }, 3000);
  };

  const handleFarcasterWalletConnect = () => {
    // Find the Farcaster Frame connector
    const farcasterConnector = connectors.find(connector =>
      connector.name.toLowerCase().includes('farcaster') ||
      connector.id.includes('farcaster')
    );

    if (farcasterConnector) {
      connect({ connector: farcasterConnector });
    } else {
      setClaimError('Farcaster wallet connector not found');
    }
  };

  const handleTokenClaim = async () => {
    if (!generatedTokens || !address) {
      const missingItems = [];
      if (!generatedTokens) missingItems.push('prize amount');
      if (!address) missingItems.push('wallet address');

      setClaimError(`Missing: ${missingItems.join(', ')}`);
      console.log('❌ Cannot claim $LEXIPOP - missing:', missingItems.join(', '));
      return;
    }

    setIsClaimingTokens(true);
    setClaimError(null);

    try {
      // Step 1: Get withdrawal signature from server
      console.log('🎫 Getting withdrawal signature from server...');
      const response = await fetch('/api/tokens/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId: gameId,
          userAddress: address,
          tokensToClaimgame: generatedTokens,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get withdrawal signature');
      }

      const { signature, nonce, tokenAddress, amount } = data;
      console.log('✅ Withdrawal signature received, calling MoneyTree contract...');

      // Step 2: Use wagmi to call the withdraw function on MoneyTree contract
      const { createWalletClient, http } = await import('viem');
      const { base } = await import('viem/chains');

      const walletClient = createWalletClient({
        account: address as `0x${string}`,
        chain: base,
        transport: http()
      });

      const contractAddress = process.env.NEXT_PUBLIC_MONEYTREE_CONTRACT_ADDRESS || '0xE636BaaF2c390A591EdbffaF748898EB3f6FF9A1';

      const txHash = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi: [
          {
            type: "function",
            name: "withdraw",
            inputs: [
              { name: "token", type: "address" },
              { name: "amount", type: "uint256" },
              { name: "recipient", type: "address" },
              { name: "nonce", type: "uint256" },
              { name: "signature", type: "bytes" },
            ],
            outputs: [],
            stateMutability: "nonpayable",
          }
        ],
        functionName: 'withdraw',
        args: [
          tokenAddress as `0x${string}`,
          BigInt(amount),
          address as `0x${string}`,
          BigInt(nonce),
          signature as `0x${string}`
        ]
      });

      console.log('🎉 $LEXIPOP withdrawal transaction submitted:', txHash);
      // Reset the token generation state after successful claim
      setGeneratedTokens(null);
      setCurrentNumber(0);

    } catch (error) {
      console.error('❌ Token claim failed:', error);
      setClaimError(error instanceof Error ? error.message : 'Failed to claim $LEXIPOP');
    } finally {
      setIsClaimingTokens(false);
    }
  };

  // Check if user has Farcaster wallet connected and verified
  const hasFarcasterWallet = isConnected && farcasterAccount.isConnected && farcasterAccount.fid;
  const canClaimTokens = hasFarcasterWallet && generatedTokens && !isClaimingTokens;

  const nextQuestion = () => {
    const nextIndex = gameState.currentQuestionIndex + 1;
    if (nextIndex >= gameState.gameQuestions.length) {
      // Game complete - stay on score page with token generation
      setCompletedWords(gameState.gameQuestions);
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
        {/* Simple Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold">Lexipop</h1>
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
                      {gameState.score}/{gameState.totalQuestions}
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

              {/* Token Generation Section */}
              <div className="mb-6">
                {!generatedTokens ? (
                  // Token Generation Display
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-4">
                      Generate $LEXIPOP using Pyth Entropy...
                    </div>

                    {/* Airport-style Number Generator */}
                    <motion.div
                      className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 mb-4 shadow-xl"
                      animate={isGeneratingTokens ? {
                        scale: [1, 1.05, 1]
                      } : {}}
                      transition={{
                        duration: 0.5,
                        repeat: isGeneratingTokens ? Infinity : 0,
                        ease: "easeInOut"
                      }}
                    >
                      <div className="text-4xl font-bold text-white mb-2">
                        {currentNumber}
                      </div>
                      <div className="text-white text-lg">
                        $LEXIPOP
                      </div>
                    </motion.div>

                    {/* Generate Button */}
                    <MiniAppButton
                      onClick={generateTokens}
                      variant="primary"
                      size="lg"
                      icon="🎰"
                      disabled={isGeneratingTokens}
                      className="w-full mb-3"
                    >
                      {isGeneratingTokens ? 'Generating...' : 'Generate $LEXIPOP!'}
                    </MiniAppButton>
                  </div>
                ) : (
                  // Token Claim Section
                  <div className="text-center">
                    {/* Result Display */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-green-100 rounded-xl p-4 border border-green-200 mb-4"
                    >
                      <div className="text-xl font-bold text-green-800">
                        🎉 You won {generatedTokens} $LEXIPOP!
                      </div>
                    </motion.div>

                    {/* Wallet Status & Claim Button */}
                    {!hasFarcasterWallet ? (
                      <div>
                        <p className="text-orange-600 mb-2 text-sm">
                          Connect Farcaster wallet to claim $LEXIPOP
                        </p>
                        <MiniAppButton
                          onClick={handleFarcasterWalletConnect}
                          variant="primary"
                          size="lg"
                          icon="🎯"
                          className="w-full mb-3"
                        >
                          Connect Wallet
                        </MiniAppButton>
                      </div>
                    ) : (
                      <div>
                        <p className="text-green-600 mb-2 text-sm">
                          ✅ @{farcasterAccount.username}
                        </p>
                        <MiniAppButton
                          onClick={handleTokenClaim}
                          variant="primary"
                          size="lg"
                          icon="💰"
                          disabled={isClaimingTokens}
                          className="w-full mb-3"
                        >
                          {isClaimingTokens ? 'Claiming...' : `Claim ${generatedTokens} $LEXIPOP`}
                        </MiniAppButton>
                      </div>
                    )}

                    {/* Error Display */}
                    {claimError && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-red-100 rounded-xl p-3 border border-red-200 mb-3"
                      >
                        <div className="text-sm font-medium text-red-800">
                          ❌ {claimError}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mt-auto">
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
              {/* Main Title with Animation */}
              <div className="flex-1 flex items-center justify-center mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  {/* Floating Balloon Emoji */}
                  <motion.div
                    animate={{ y: [0, -12, 0] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="text-6xl mb-4"
                  >
                    🎈
                  </motion.div>

                  {/* Main Title Text */}
                  <motion.h2
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight"
                  >
                    Learn vocabulary<br />
                    the fun way!
                  </motion.h2>
                </motion.div>
              </div>

              {/* Error message for unauthenticated users */}
              {currentUser.error && (
                <div className="mb-6 bg-red-50 rounded-lg p-4 border border-red-200">
                  <p className="text-base text-red-700 font-semibold">
                    ⚠️ This app works best when opened in Farcaster
                  </p>
                  <p className="text-sm text-red-600 mt-2">
                    {currentUser.error}
                  </p>
                </div>
              )}

              <div className="space-y-4 mt-auto">
                {/* Start Playing Button with User Info */}
                <div className="space-y-3">
                  {/* User Info Above Button */}
                  {isUserAuthenticated && currentUser && (
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      {currentUser.pfpUrl && (
                        <img
                          src={currentUser.pfpUrl}
                          alt={currentUser.username}
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <span>Playing as @{currentUser.username}</span>
                    </div>
                  )}

                  <MiniAppButton
                    onClick={startNewGame}
                    variant="primary"
                    size="lg"
                    icon="🎮"
                    className="w-full"
                  >
                    Start Playing
                  </MiniAppButton>
                </div>

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
        <h1 className="text-xl font-bold">Lexipop</h1>
        <div className="flex items-center gap-4">
          <div className="text-center text-sm">
            <div className="font-medium">Score</div>
            <div className="text-lg font-bold">{gameState.score}</div>
          </div>
          {currentUser && (
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



    </div>
  );
}