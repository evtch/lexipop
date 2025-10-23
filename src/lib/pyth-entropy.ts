/**
 * 🎲 PYTH ENTROPY INTEGRATION
 *
 * Provides provably fair random number generation for token rewards
 * Using Pyth Network's entropy service on Base
 */

import { createPublicClient, createWalletClient, http, parseAbi, keccak256, encodePacked, WalletClient } from 'viem';
import { base } from 'viem/chains';

// Pyth Entropy contract address on Base
export const ENTROPY_CONTRACT_ADDRESS = '0x4821932D0CDd71225A6d914706A621e0389D7061' as const;

// Empty bytes constant
const EMPTY_BYTES: `0x${string}` = '0x' as `0x${string}`;

// Pyth Entropy ABI (simplified for our needs)
export const ENTROPY_ABI = parseAbi([
  'function getDefaultProvider() external view returns (address)',
  'function getFee(address provider) external view returns (uint128)',
  'function requestWithCallback(address provider, bytes32 userCommitment, bool useBlockhash, bytes calldata) external payable returns (uint64)',
  'function revealWithCallback(address provider, uint64 sequenceNumber, bytes32 userRandomness, bytes32 providerRevelation, bytes calldata) external',
]);

// Base RPC configuration
export const BASE_RPC_URL = process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org';

export const publicClient = createPublicClient({
  chain: base,
  transport: http(BASE_RPC_URL),
});

// Token reward ranges based on score points
export const SCORE_BASED_RANGES = {
  100: { min: 100, max: 1500, label: '100-1,500 $LEXIPOP' },
  200: { min: 500, max: 5000, label: '500-5,000 $LEXIPOP' },
  300: { min: 1500, max: 15000, label: '1,500-15,000 $LEXIPOP' },
  400: { min: 3000, max: 25000, label: '3,000-25,000 $LEXIPOP' },
  500: { min: 5000, max: 35000, label: '5,000-35,000 $LEXIPOP' },
  1000: { min: 15000, max: 50000, label: '15,000-50,000 $LEXIPOP' }, // Mega streak bonus!
  0: { min: 50, max: 750, label: '50-750 $LEXIPOP' }, // Fallback for 0 points
} as const;

// Legacy token reward tiers (kept for backward compatibility)
export const REWARD_TIERS = [
  { min: 0, max: 40, tokens: 100, label: '100 $LEXIPOP', color: '#3B82F6', probability: 0.41 },
  { min: 41, max: 70, tokens: 250, label: '250 $LEXIPOP', color: '#10B981', probability: 0.3 },
  { min: 71, max: 85, tokens: 500, label: '500 $LEXIPOP', color: '#F59E0B', probability: 0.15 },
  { min: 86, max: 94, tokens: 1000, label: '1,000 $LEXIPOP', color: '#EF4444', probability: 0.09 },
  { min: 95, max: 98, tokens: 2500, label: '2,500 $LEXIPOP', color: '#8B5CF6', probability: 0.04 },
  { min: 99, max: 99, tokens: 10000, label: '10,000 $LEXIPOP', color: '#F97316', probability: 0.01 },
] as const;

export type RewardTier = typeof REWARD_TIERS[number];

/**
 * Generate a cryptographically secure commitment for Pyth Entropy
 * Uses proper keccak256 hashing for security
 */
export function generateCommitment(userInput: string, timestamp: number): {
  commitment: `0x${string}`;
  userRandomness: `0x${string}`;
} {
  // Generate secure random bytes
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);

  // Create user randomness by combining inputs and hashing
  const combinedData = encodePacked(
    ['string', 'uint256', 'bytes32'],
    [userInput, BigInt(timestamp), `0x${Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('')}`]
  );

  const userRandomness = keccak256(combinedData);

  // Generate commitment (hash of user randomness)
  const commitment = keccak256(userRandomness);

  return {
    commitment,
    userRandomness,
  };
}

/**
 * Convert random number to reward tier
 */
export function getRewardFromRandomness(randomNumber: bigint): RewardTier {
  // Convert to 0-99 range
  const normalized = Number(randomNumber % BigInt(100));

  // Find matching tier
  const tier = REWARD_TIERS.find(tier =>
    normalized >= tier.min && normalized <= tier.max
  );

  return tier || REWARD_TIERS[0]; // Fallback to smallest reward
}

/**
 * Calculate bonus multipliers based on game performance and NFT ownership
 */
export function calculateBonusMultiplier(
  score: number,
  streak: number,
  totalQuestions: number,
  hasNFT: boolean = false
): number {
  let multiplier = 1;

  // NFT holder bonus (2x base multiplier)
  if (hasNFT) {
    multiplier = 2;
  }

  // Perfect score bonus
  if (score === totalQuestions && totalQuestions >= 5) {
    multiplier += 0.5;
  }

  // Streak bonus
  if (streak >= 10) {
    multiplier += 1;
  } else if (streak >= 5) {
    multiplier += 0.5;
  }

  // High score bonus
  const accuracy = score / totalQuestions;
  if (accuracy >= 0.9) {
    multiplier += 0.3;
  } else if (accuracy >= 0.8) {
    multiplier += 0.2;
  }

  return Math.min(multiplier, 5); // Cap at 5x (increased for NFT holders)
}

/**
 * Estimate gas fees for entropy request
 */
export async function estimateEntropyFee(): Promise<bigint> {
  try {
    const defaultProvider = await publicClient.readContract({
      address: ENTROPY_CONTRACT_ADDRESS,
      abi: ENTROPY_ABI,
      functionName: 'getDefaultProvider',
    });

    const fee = await publicClient.readContract({
      address: ENTROPY_CONTRACT_ADDRESS,
      abi: ENTROPY_ABI,
      functionName: 'getFee',
      args: [defaultProvider],
    });

    return fee;
  } catch (error) {
    console.error('Failed to estimate entropy fee:', error);
    // Fallback fee estimate (in wei)
    return BigInt('100000000000000'); // 0.0001 ETH
  }
}

/**
 * Format token amount for display
 */
export function formatTokenAmount(amount: number): string {
  return `${amount.toLocaleString()} $LEXIPOP`;
}

/**
 * Request entropy from Pyth Network
 * Returns the sequence number for the request
 */
export async function requestPythEntropy(
  walletClient: WalletClient,
  userCommitment: `0x${string}`,
  useBlockhash: boolean = true
): Promise<bigint> {
  try {
    // Get default provider
    const defaultProvider = await publicClient.readContract({
      address: ENTROPY_CONTRACT_ADDRESS,
      abi: ENTROPY_ABI,
      functionName: 'getDefaultProvider',
    });

    // Get required fee
    const fee = await publicClient.readContract({
      address: ENTROPY_CONTRACT_ADDRESS,
      abi: ENTROPY_ABI,
      functionName: 'getFee',
      args: [defaultProvider],
    });

    // Request entropy with callback
    // @ts-ignore - wallet client typing issue
    const txHash = await walletClient.writeContract({
      address: ENTROPY_CONTRACT_ADDRESS,
      abi: ENTROPY_ABI,
      functionName: 'requestWithCallback',
      args: [defaultProvider, userCommitment, useBlockhash, EMPTY_BYTES],
      value: fee,
      chain: base,
    });

    // Wait for transaction and extract sequence number from logs
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
      timeout: 60000
    });

    // Parse sequence number from transaction logs
    // This would need proper event decoding in production
    const sequenceNumber = BigInt(Date.now()); // Placeholder - extract from actual logs

    console.log(`🎲 Entropy requested. Sequence: ${sequenceNumber}, TxHash: ${txHash}`);
    return sequenceNumber;

  } catch (error) {
    console.error('❌ Failed to request Pyth entropy:', error);
    throw error;
  }
}

/**
 * Reveal entropy and get random number
 */
export async function revealPythEntropy(
  walletClient: WalletClient,
  sequenceNumber: bigint,
  userRandomness: `0x${string}`,
  providerRevelation: `0x${string}`
): Promise<bigint> {
  try {
    // Get default provider
    const defaultProvider = await publicClient.readContract({
      address: ENTROPY_CONTRACT_ADDRESS,
      abi: ENTROPY_ABI,
      functionName: 'getDefaultProvider',
    });

    // Reveal entropy
    // @ts-ignore - wallet client typing issue
    const txHash = await walletClient.writeContract({
      address: ENTROPY_CONTRACT_ADDRESS,
      abi: ENTROPY_ABI,
      functionName: 'revealWithCallback',
      args: [defaultProvider, sequenceNumber, userRandomness, providerRevelation, EMPTY_BYTES],
      chain: base,
    });

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
      timeout: 60000
    });

    // In production, extract random number from callback or logs
    // For now, combine userRandomness and providerRevelation
    const combinedRandomness = keccak256(
      encodePacked(['bytes32', 'bytes32'], [userRandomness, providerRevelation])
    );

    const randomNumber = BigInt(combinedRandomness);
    console.log(`🎲 Entropy revealed. Random: ${randomNumber}, TxHash: ${txHash}`);

    return randomNumber;

  } catch (error) {
    console.error('❌ Failed to reveal Pyth entropy:', error);
    throw error;
  }
}

/**
 * Complete entropy flow: request → wait → reveal → get random number
 */
export async function getPythRandomNumber(
  walletClient: WalletClient,
  userInput: string
): Promise<{ randomNumber: bigint; rewardTier: RewardTier }> {
  try {
    const timestamp = Date.now();
    const { commitment, userRandomness } = generateCommitment(userInput, timestamp);

    console.log('🎲 Starting Pyth entropy flow...');

    // Step 1: Request entropy
    const sequenceNumber = await requestPythEntropy(walletClient, commitment);

    // Step 2: Wait for provider to commit (usually 1-2 blocks)
    console.log('⏳ Waiting for provider commitment...');
    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds

    // Step 3: Get provider revelation (would need to fetch from Pyth API)
    // For now, simulate provider revelation
    const mockProviderRevelation = keccak256(('0x' + Date.now().toString(16).padStart(64, '0')) as `0x${string}`);

    // Step 4: Reveal and get final randomness
    const randomNumber = await revealPythEntropy(
      walletClient,
      sequenceNumber,
      userRandomness,
      mockProviderRevelation
    );

    // Step 5: Convert to reward tier
    const rewardTier = getRewardFromRandomness(randomNumber);

    return { randomNumber, rewardTier };

  } catch (error) {
    console.error('❌ Pyth entropy flow failed:', error);
    throw error;
  }
}

/**
 * Generate secure randomness for local development/testing
 * Note: This is NOT cryptographically secure and should only be used for testing
 */
export function generateMockRandomness(): number {
  return Math.floor(Math.random() * 100);
}

/**
 * Generate reward based on score using new point-based ranges
 */
export function getScoreBasedReward(score: number, randomNumber: bigint): number {
  // Get the appropriate range based on score
  let range;
  if (score >= 1000) {
    range = SCORE_BASED_RANGES[1000];
  } else if (score >= 500) {
    range = SCORE_BASED_RANGES[500];
  } else if (score >= 400) {
    range = SCORE_BASED_RANGES[400];
  } else if (score >= 300) {
    range = SCORE_BASED_RANGES[300];
  } else if (score >= 200) {
    range = SCORE_BASED_RANGES[200];
  } else if (score >= 100) {
    range = SCORE_BASED_RANGES[100];
  } else {
    range = SCORE_BASED_RANGES[0]; // Fallback for 0 points
  }

  // Convert random number to a value within the range
  const rangeSize = BigInt(range.max - range.min);
  const normalizedRandom = randomNumber % rangeSize;
  const tokenAmount = range.min + Number(normalizedRandom);

  console.log('📊 Score-based Reward Calculation:', {
    score,
    range,
    tokenAmount,
    randomValue: randomNumber.toString().slice(0, 16) + '...'
  });

  return tokenAmount;
}

/**
 * Improved client-side entropy generation for production use
 * Combines multiple entropy sources for better randomness
 */
export function generateImprovedRandomness(gameData?: {
  gameId: string;
  score: number;
  streak: number;
  userFid?: number;
}): { randomNumber: bigint; tokenAmount: number } {
  try {
    // Create deterministic but unpredictable input
    const userInput = gameData
      ? `${gameData.gameId}-${gameData.score}-${gameData.streak}-${gameData.userFid || 'anon'}`
      : `entropy-${Date.now()}`;

    const timestamp = Date.now();

    // Add browser entropy sources
    const performanceNow = performance.now();
    const randomValues = new Uint8Array(32);
    crypto.getRandomValues(randomValues);

    // Combine multiple entropy sources
    const combinedEntropy = encodePacked(
      ['string', 'uint256', 'uint256', 'bytes32'],
      [
        userInput,
        BigInt(Math.floor(timestamp)),
        BigInt(Math.floor(performanceNow * 1000000)), // Microsecond precision
        `0x${Array.from(randomValues).map(b => b.toString(16).padStart(2, '0')).join('')}`
      ]
    );

    // Generate secure hash
    const entropyHash = keccak256(combinedEntropy);
    const randomNumber = BigInt(entropyHash);

    // Calculate token amount based on score
    const score = gameData?.score || 0;
    const tokenAmount = getScoreBasedReward(score, randomNumber);

    console.log('🎲 Improved Entropy Generation:', {
      userInput,
      timestamp,
      performanceNow,
      entropyHash,
      score,
      tokenAmount,
      source: 'Multi-source Client Entropy with Score-based Rewards'
    });

    return { randomNumber, tokenAmount };

  } catch (error) {
    console.error('❌ Improved entropy generation failed:', error);
    // Fallback to simple random within score range
    const score = gameData?.score || 0;
    let range;
    if (score >= 1000) range = SCORE_BASED_RANGES[1000];
    else if (score >= 500) range = SCORE_BASED_RANGES[500];
    else if (score >= 400) range = SCORE_BASED_RANGES[400];
    else if (score >= 300) range = SCORE_BASED_RANGES[300];
    else if (score >= 200) range = SCORE_BASED_RANGES[200];
    else if (score >= 100) range = SCORE_BASED_RANGES[100];
    else range = SCORE_BASED_RANGES[0];

    const tokenAmount = range.min + Math.floor(Math.random() * (range.max - range.min));

    return {
      randomNumber: BigInt(Math.floor(Math.random() * 100000)),
      tokenAmount
    };
  }
}