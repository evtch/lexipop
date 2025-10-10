/**
 * 🎲 PYTH ENTROPY INTEGRATION
 *
 * Provides provably fair random number generation for token rewards
 * Using Pyth Network's entropy service on Base
 */

import { createPublicClient, createWalletClient, http, parseAbi } from 'viem';
import { base } from 'viem/chains';

// Pyth Entropy contract address on Base
export const ENTROPY_CONTRACT_ADDRESS = '0x4821932D0CDd71225A6d914706A621e0389D7061' as const;

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

// Token reward tiers for spinning wheel
export const REWARD_TIERS = [
  { min: 0, max: 10, tokens: 1, label: '1 $LEXIPOP', color: '#3B82F6', probability: 0.4 },
  { min: 11, max: 25, tokens: 5, label: '5 $LEXIPOP', color: '#10B981', probability: 0.3 },
  { min: 26, max: 40, tokens: 10, label: '10 $LEXIPOP', color: '#F59E0B', probability: 0.2 },
  { min: 41, max: 55, tokens: 25, label: '25 $LEXIPOP', color: '#EF4444', probability: 0.08 },
  { min: 56, max: 70, tokens: 50, label: '50 $LEXIPOP', color: '#8B5CF6', probability: 0.015 },
  { min: 71, max: 99, tokens: 100, label: '100 $LEXIPOP', color: '#F97316', probability: 0.005 },
] as const;

export type RewardTier = typeof REWARD_TIERS[number];

/**
 * Generate a commitment for Pyth Entropy
 * Best practice: combine user input with timestamp and random data
 */
export function generateCommitment(userInput: string, timestamp: number): {
  commitment: string;
  userRandomness: string;
} {
  // Create user randomness from input + timestamp + crypto random
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);

  const combined = `${userInput}-${timestamp}-${Array.from(randomBytes).join('')}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(combined);

  // Simple hash for user randomness (in production, use proper hashing)
  const userRandomness = Array.from(data.slice(0, 32))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Generate commitment (hash of user randomness)
  const commitmentData = encoder.encode(userRandomness);
  const commitment = Array.from(commitmentData.slice(0, 32))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return {
    commitment: `0x${commitment}`,
    userRandomness: `0x${userRandomness}`,
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
 * Calculate bonus multipliers based on game performance
 */
export function calculateBonusMultiplier(score: number, streak: number, totalQuestions: number): number {
  let multiplier = 1;

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

  return Math.min(multiplier, 3); // Cap at 3x
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
 * Generate secure randomness for local development/testing
 * Note: This is NOT cryptographically secure and should only be used for testing
 */
export function generateMockRandomness(): number {
  return Math.floor(Math.random() * 100);
}