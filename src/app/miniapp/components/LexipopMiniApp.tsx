'use client';
// Updated with UI improvements

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, VocabularyWord } from '@/types/game';
import { getUniqueWords, shuffleArray } from '@/data/vocabulary';
import { sdk } from '@farcaster/miniapp-sdk'; // For miniapp functionality
import { useFarcasterUser } from '@/lib/hooks/useFarcasterUser'; // Uses Farcaster SDK for user context
import { generateImprovedRandomness } from '@/lib/pyth-entropy';
import { useSound } from '@/hooks/useSound';
import { useAccount, useConnect, useDisconnect, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useFarcasterAccount } from '@/lib/web3/hooks/useFarcasterAccount';
import { getVersionString } from '@/lib/version';

// Frame-optimized components
import FrameWordBubble from './FrameWordBubble';
import FrameAnswerOption from './FrameAnswerOption';
import ScoreShare from './ScoreShare';
import MiniAppButton from './MiniAppButton';
// import NotificationPrompt from './NotificationPrompt'; // Removed - miniapp handles notifications via SDK

export default function LexipopMiniApp() {
  // Using Farcaster SDK directly for miniapp functionality (Neynar disabled due to SSR issues)
  // No additional variables needed - will use sdk.actions.addMiniApp() directly

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

  // Sound effects
  const { playCorrectSound, playWrongSound, playRewardGeneratingSound, playRewardClaimSound } = useSound();
  const [gameId, setGameId] = useState<string>('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [completedWords, setCompletedWords] = useState<typeof gameState.gameQuestions>([]);
  // const [showNotificationPrompt, setShowNotificationPrompt] = useState(false); // Disabled for miniapp
  // const [hasSeenNotificationPrompt, setHasSeenNotificationPrompt] = useState(false); // Disabled for miniapp
  const [hasSharedCast, setHasSharedCast] = useState(false);
  const [isFirstTimeClaim, setIsFirstTimeClaim] = useState(true);

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

  // Contract writing hook
  const { writeContract, data: hash, error: writeError, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });



  // Trigger native Farcaster "Add to Farcaster" popup on app load
  useEffect(() => {
    const showNativeFarcasterPopup = async () => {
      try {
        // Wait for SDK to be ready (should already be ready from useFarcasterUser)
        await sdk.actions.ready();

        // Trigger native Farcaster popup with app info and notification consent
        await sdk.actions.addMiniApp();
        console.log('✅ Native Farcaster popup shown successfully');
      } catch (error) {
        console.log('ℹ️ Native popup dismissed or already added:', error);
        // This is expected behavior - user might dismiss or already have it added
      }
    };

    // Only show popup if user is authenticated
    if (currentUser?.fid && !currentUser.error) {
      showNativeFarcasterPopup();
    }
  }, [currentUser?.fid, currentUser?.error]);

  // Check if user has seen notification prompt and claimed tokens before
  useEffect(() => {
    if (currentUser?.fid) {
      // const hasSeenKey = `lexipop_notification_prompt_seen_${currentUser.fid}`;
      // const hasSeen = localStorage.getItem(hasSeenKey) === 'true';
      // setHasSeenNotificationPrompt(hasSeen); // Disabled for miniapp

      // Check if user has claimed tokens before OR been prompted to add miniapp
      const hasClaimedKey = `lexipop_has_claimed_${currentUser.fid}`;
      const hasClaimed = localStorage.getItem(hasClaimedKey) === 'true';
      const hasBeenPromptedKey = `lexipop_add_prompted_${currentUser.fid}`;
      const hasBeenPrompted = localStorage.getItem(hasBeenPromptedKey) === 'true';
      setIsFirstTimeClaim(!hasClaimed && !hasBeenPrompted);

      // Check if user has shared cast for first claim
      const hasSharedKey = `lexipop_has_shared_${currentUser.fid}`;
      const hasShared = localStorage.getItem(hasSharedKey) === 'true';
      setHasSharedCast(hasShared);
    }
  }, [currentUser?.fid]);

  const submitScore = async (score: number, streak: number, totalQuestions: number) => {
    if (!currentUser) return;

    console.log('🎯 Submitting score to weekly leaderboard:', {
      fid: currentUser.fid,
      username: currentUser.username,
      score
    });

    try {
      const response = await fetch('/api/leaderboard/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userFid: currentUser.fid,
          username: currentUser.username,
          score
        }),
      });

      const data = await response.json();
      console.log('📊 Leaderboard submission response:', data);
      if (data.success) {
        console.log(`✅ Score submitted successfully - Rank ${data.rank} ${data.isNewBest ? '(NEW BEST!)' : ''}`);
      } else {
        console.error('❌ Score submission failed:', data.error);
      }
    } catch (error) {
      console.error('❌ Failed to submit score:', error);
    }
  };

  const startNewGame = async () => {
    console.log('🎮 Starting new game');

    try {
      // Show loading state
      setGameState(prev => ({ ...prev, isGameActive: false }));

      const gameQuestions = await getUniqueWords(5); // 5 questions per game from database
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
        totalQuestions: 5, // Set to 5 questions per game
        isGameActive: true,
        selectedAnswer: null,
        showResult: false,
        isCorrect: null
      });

      console.log(`🎯 Game started with words: ${gameQuestions.map(w => w.word).join(', ')}`);
    } catch (error) {
      console.error('❌ Failed to start new game:', error);
      // Could show an error message to user here
    }
  };


  // Airport-style number generator effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isGeneratingTokens) {
      interval = setInterval(() => {
        setCurrentNumber(Math.floor(Math.random() * 10000) + 1);
      }, 100); // Change number every 100ms
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGeneratingTokens]);

  // Handle transaction state changes
  useEffect(() => {
    if (writeError) {
      console.error('❌ Contract write error:', writeError);
      setClaimError(writeError.message || 'Failed to initiate transaction');
      setIsClaimingTokens(false);
    }
  }, [writeError]);

  useEffect(() => {
    if (isConfirmed && hash) {
      console.log('🎉 $LEXIPOP withdrawal transaction confirmed:', hash);

      // Play success sound for successful claim
      playRewardClaimSound();

      // Track tokens for leaderboard
      if (generatedTokens && currentUser?.fid) {
        fetch('/api/tokens/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fid: currentUser.fid,
            tokensEarned: generatedTokens
          })
        }).then(response => {
          if (response.ok) {
            console.log(`💰 Tracked ${generatedTokens} $LEXIPOP for leaderboard`);
          } else {
            console.warn('Failed to track tokens for leaderboard');
          }
        }).catch(error => {
          console.warn('Error tracking tokens:', error);
        });
      }

      // Reset the token generation state after successful claim
      setGeneratedTokens(null);
      setCurrentNumber(0);
      setIsClaimingTokens(false);
      setClaimError(null);

      // Mark that user has claimed tokens
      if (currentUser?.fid) {
        const hasClaimedKey = `lexipop_has_claimed_${currentUser.fid}`;
        localStorage.setItem(hasClaimedKey, 'true');
        setIsFirstTimeClaim(false);
      }
    }
  }, [isConfirmed, hash, currentUser?.fid, playRewardClaimSound]);

  const generateTokens = () => {
    if (isGeneratingTokens) return;

    setIsGeneratingTokens(true);
    setGeneratedTokens(null);
    setClaimError(null);
    setCurrentNumber(0);

    // Generate final token amount using new score-based system
    const generateFinalAmount = () => {
      try {
        // Create game data for entropy generation
        const gameData = {
          gameId,
          score: gameState.score,
          streak: gameState.streak,
          userFid: currentUser?.fid
        };

        // Use the improved entropy generation function
        const { tokenAmount } = generateImprovedRandomness(gameData);

        console.log('🎲 LexipopMiniApp Score-based Generation:', {
          gameData,
          tokenAmount,
          source: 'New Score-based Multi-source Entropy'
        });

        return tokenAmount;
      } catch (error) {
        console.error('❌ Score-based entropy failed, using fallback:', error);
        // Fallback using the same score-based ranges
        const score = gameState.score;
        let minTokens, maxTokens;

        if (score >= 500) {
          minTokens = 5000; maxTokens = 25000;
        } else if (score >= 400) {
          minTokens = 2000; maxTokens = 15000;
        } else if (score >= 300) {
          minTokens = 1000; maxTokens = 10000;
        } else if (score >= 200) {
          minTokens = 300; maxTokens = 3000;
        } else if (score >= 100) {
          minTokens = 100; maxTokens = 1000;
        } else {
          minTokens = 50; maxTokens = 500;
        }

        return minTokens + Math.floor(Math.random() * (maxTokens - minTokens));
      }
    };

    const finalAmount = generateFinalAmount();

    // Run the number generator for 3 seconds, then show final result
    setTimeout(() => {
      setIsGeneratingTokens(false);
      setGeneratedTokens(finalAmount);
      setCurrentNumber(finalAmount);
      // Play reward claim sound when tokens are revealed
      playRewardClaimSound();
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

    // Check if this is first time claim and user hasn't shared cast yet
    if (isFirstTimeClaim && !hasSharedCast) {
      setClaimError('Please share your score on Farcaster first to claim your first $LEXIPOP tokens!');
      console.log('❌ First time claim requires sharing cast');
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
      const contractAddress = process.env.NEXT_PUBLIC_MONEYTREE_CONTRACT_ADDRESS || '0xE636BaaF2c390A591EdbffaF748898EB3f6FF9A1';

      console.log('🎉 Calling writeContract with wagmi...');
      writeContract({
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

      console.log('🎉 $LEXIPOP withdrawal transaction initiated');
      // Transaction state will be handled by wagmi hooks

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

      // Submit final score when game is complete
      if (isUserAuthenticated && currentUser) {
        console.log('🎮 Game complete! Submitting final score:', {
          score: gameState.score,
          streak: gameState.streak,
          totalQuestions: gameState.totalQuestions,
          user: currentUser.fid
        });
        submitScore(gameState.score, gameState.streak, gameState.totalQuestions);
      } else {
        console.log('⚠️ Not submitting score - user not authenticated or missing:', {
          isUserAuthenticated,
          currentUser: currentUser?.fid
        });
      }

      // Show notification prompt after first game completion (if not seen before) - Disabled for miniapp
      // if (currentUser?.fid && !hasSeenNotificationPrompt) {
      //   setTimeout(() => {
      //     setShowNotificationPrompt(true);
      //   }, 2000); // Wait 2 seconds after game completion
      // }

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

    // Play sound effect based on answer correctness
    if (isCorrect) {
      playCorrectSound();
    } else {
      playWrongSound();
    }

    setGameState(prev => ({
      ...prev,
      selectedAnswer: selectedDefinition,
      showResult: true,
      isCorrect,
      score: isCorrect ? prev.score + 100 : prev.score,
      streak: isCorrect ? prev.streak + 1 : 0
      // totalQuestions should stay constant at 5, not increment
    }));

    // Don't submit score here - wait until game is complete

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
        {/* Header - Same as quiz page */}
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
                className="bg-gradient-to-r from-green-400 to-blue-500 rounded-lg p-2 text-white shadow-lg mb-3"
              >
                <div className="text-center">
                  <div className="text-base font-bold mb-1">Game Complete!</div>

                  {/* Compact Score Display */}
                  <div className="bg-white/20 rounded-lg p-1.5 mb-1.5">
                    <div className="text-xl font-bold">
                      {gameState.score} pts
                    </div>
                  </div>

                  {/* Performance Message */}
                  <div className="text-sm font-medium">
                    {gameState.score === 500
                      ? "Perfect! 🌟"
                      : gameState.score >= 400
                      ? "Great job! 👏"
                      : gameState.score >= 300
                      ? "Well done! 👍"
                      : "Keep practicing! 📚"}
                  </div>
                </div>
              </motion.div>


              {/* Token Generation Section */}
              <div className="mb-4">
                {!generatedTokens ? (
                  // Token Generation Display
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">
                      Generating using secure onchain Pyth Entropy...
                    </div>
                    <div className="text-xs text-blue-600 font-medium mb-4">
                      💡 Higher scores unlock bigger rewards!
                    </div>

                    {/* Airport-style Number Generator */}
                    <motion.div
                      className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-4 mb-4 shadow-xl"
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
                        {currentNumber === 0 ? '🎁' : currentNumber}
                      </div>
                      <div className="text-white text-lg">
                        $LEXIPOP
                      </div>
                    </motion.div>

                    {/* Generate Button */}
                    <MiniAppButton
                      onClick={generateTokens}
                      variant="primary"
                      size="md"
                      icon="🎰"
                      disabled={isGeneratingTokens}
                      className="w-full mb-3"
                    >
                      {isGeneratingTokens ? 'Generating...' : 'Generate my reward'}
                    </MiniAppButton>


                    {/* Invite Friends Button */}
                    <div className="mb-3">
                      <MiniAppButton
                        onClick={async () => {
                          const castText = `I crushed it at Lexipop! 🧠✨ Just learned some amazing vocabulary words and earned $LEXIPOP tokens! 🪙\n\nJoin me to:\n📚 Learn new words\n🎯 Test your vocabulary\n💰 Earn crypto rewards\n🔥 Have fun while learning!\n\nPlay now and show me your score! 👇`;
                          const miniappUrl = window.location.origin + '/miniapp';

                          try {
                            // Use Farcaster miniapp SDK for native cast creation
                            await sdk.actions.composeCast({
                              text: castText,
                              embeds: [miniappUrl]
                            });
                            setHasSharedCast(true);
                            // Save that user has shared cast
                            if (currentUser?.fid) {
                              localStorage.setItem(`lexipop_has_shared_${currentUser.fid}`, 'true');
                            }
                          } catch (error) {
                            console.error('Failed to create cast:', error);
                            // Fallback to web share for non-Farcaster environments
                            try {
                              const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(castText)}&embeds[]=${encodeURIComponent(miniappUrl)}`;
                              window.open(shareUrl, '_blank');
                              setHasSharedCast(true);
                              if (currentUser?.fid) {
                                localStorage.setItem(`lexipop_has_shared_${currentUser.fid}`, 'true');
                              }
                            } catch (fallbackError) {
                              // Final fallback - copy to clipboard
                              const simpleCastText = `I crushed it at Lexipop! Check it out: ${window.location.origin}/miniapp`;
                              navigator.clipboard?.writeText(simpleCastText);
                              alert('Link copied to clipboard!');
                            }
                          }
                        }}
                        variant="secondary"
                        size="md"
                        icon="👥"
                        className="w-full whitespace-nowrap"
                      >
                        {hasSharedCast ? 'Invited friends ✓' : 'Invite friends (+50%)'}
                      </MiniAppButton>
                      <div className="text-xs text-gray-500 text-center mt-1">
                        {hasSharedCast ? 'Thanks for sharing!' : 'Increases chance for a higher reward by 50%'}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Token Claim Section
                  <div className="text-center">
                    {/* Result Display - Same style as generation box */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-4 mb-4 shadow-xl"
                    >
                      <div className="text-4xl font-bold text-white mb-2 text-center">
                        {generatedTokens}
                      </div>
                      <div className="text-white text-lg text-center">
                        You won {generatedTokens} $LEXIPOP
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
                          size="md"
                          icon="🎯"
                          className="w-full mb-3"
                        >
                          Connect Wallet
                        </MiniAppButton>
                      </div>
                    ) : (
                      <div>
                        {/* Show sharing requirement for first-time users */}
                        {isFirstTimeClaim && !hasSharedCast && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                            <div className="text-sm font-medium text-yellow-800 mb-1">
                              🎉 First Time Claim!
                            </div>
                            <div className="text-xs text-yellow-700">
                              Share your achievement on Farcaster above to unlock your first $LEXIPOP claim!
                            </div>
                          </div>
                        )}

                        {/* Show success message when sharing is completed for first-time users */}
                        {isFirstTimeClaim && hasSharedCast && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                            <div className="text-sm font-medium text-green-800 mb-1">
                              ✅ Thanks for sharing!
                            </div>
                            <div className="text-xs text-green-700">
                              You can now claim your first $LEXIPOP tokens below!
                            </div>
                          </div>
                        )}

                        <MiniAppButton
                          onClick={handleTokenClaim}
                          variant="primary"
                          size="md"
                          icon="💰"
                          disabled={isClaimingTokens || isWritePending || isConfirming || (isFirstTimeClaim && !hasSharedCast)}
                          className="w-full mb-3"
                        >
                          {isWritePending
                            ? 'Confirming...'
                            : isConfirming
                            ? 'Processing...'
                            : isClaimingTokens
                            ? 'Claiming...'
                            : (isFirstTimeClaim && !hasSharedCast)
                            ? 'Share First to Claim'
                            : `Claim ${generatedTokens} $LEXIPOP`}
                        </MiniAppButton>
                      </div>
                    )}

                    {/* Success Display */}
                    {isConfirmed && hash && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-green-100 rounded-xl p-3 border border-green-200 mb-3"
                      >
                        <div className="text-sm font-medium text-green-800">
                          ✅ Tokens claimed successfully!
                        </div>
                      </motion.div>
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
              <div className="space-y-2 mt-auto">
                <MiniAppButton
                  onClick={startNewGame}
                  variant="secondary"
                  size="md"
                  icon="🔄"
                  className="w-full"
                >
                  Play Again
                </MiniAppButton>

                <MiniAppButton
                  href="/leaderboard"
                  variant="secondary"
                  size="md"
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
                    style={{ letterSpacing: '-2px' }}
                  >
                    Learn vocabulary<br />
                    the fun way!
                  </motion.h2>
                </motion.div>
              </div>

              {/* Error message for unauthenticated users */}
              {currentUser.error && (
                <div className="mb-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-4 border border-purple-300 shadow-lg">
                  <p className="text-base font-semibold flex items-center gap-2">
                    <span className="text-lg">🚀</span>
                    Made for Farcaster. Open in Farcaster to play
                  </p>
                  <p className="text-sm text-purple-100 mt-2">
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
                    size="md"
                    icon="🎮"
                    className="w-full"
                  >
                    Start Playing
                  </MiniAppButton>
                </div>

                <MiniAppButton
                  href="/leaderboard"
                  variant="secondary"
                  size="md"
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
    <div className="flex flex-col p-4 text-gray-800 min-h-screen">
      {/* Header - Compact for Frame */}
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-lg font-bold">Lexipop</h1>
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
            {gameState.score} pts
          </div>
          {currentUser && (
            <div className="flex items-center gap-2">
              {currentUser.pfpUrl && (
                <img
                  src={currentUser.pfpUrl}
                  alt={currentUser.username}
                  className="w-7 h-7 rounded-full"
                />
              )}
              <span className="text-xs text-gray-600">@{currentUser.username}</span>
            </div>
          )}
        </div>
      </div>

      {/* Word Bubble - Smaller for Frame */}
      <div className="flex-shrink-0 mb-3 py-3">
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

      {/* Progress Indicator - More Compact */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1 bg-gray-200 rounded-full h-1.5 mr-3">
          <div
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((gameState.currentQuestionIndex + 1) / gameState.totalQuestions) * 100}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 font-medium">
          {gameState.currentQuestionIndex + 1}/{gameState.totalQuestions}
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center mb-2">
        <p className="text-sm text-gray-600">Choose the correct definition:</p>
      </div>

      {/* Answer Options - Ensures all 4 options are visible */}
      <div className="space-y-1.5 flex-1 pb-2">
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
        completedWords={completedWords}
      />

      {/* Notification Prompt - Disabled for miniapp (uses SDK notifications instead) */}
      {/* {showNotificationPrompt && (
        <NotificationPrompt
          onNotificationEnabled={(enabled) => {
            console.log(`🔔 Notification ${enabled ? 'enabled' : 'declined'} by user ${currentUser?.fid}`);
            setShowNotificationPrompt(false);

            // Mark as seen so we don't show again
            if (currentUser?.fid) {
              const hasSeenKey = `lexipop_notification_prompt_seen_${currentUser.fid}`;
              localStorage.setItem(hasSeenKey, 'true');
              setHasSeenNotificationPrompt(true);
            }

            // Send achievement notification if they enabled
            if (enabled && currentUser?.fid) {
              fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'perfect_game',
                  userFid: currentUser.fid
                })
              }).catch(err => console.error('Failed to send welcome notification:', err));
            }
          }}
          autoShow={true}
        />
      )} */}

      {/* Version Display */}
      <div className="mt-4 text-center">
        <div className="text-xs text-gray-400">
          {getVersionString()}
        </div>
      </div>

    </div>
  );
}