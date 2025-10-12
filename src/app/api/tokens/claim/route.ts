/**
 * 🪙 TOKEN CLAIM API ENDPOINT
 *
 * Handles token claiming requests and blockchain transactions
 * Validates claims and interacts with smart contracts
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base, baseSepolia } from 'viem/chains';
// Server-side token contract addresses (configurable via environment variables)
const getContractAddresses = () => {
  const lexipopToken = (process.env.LEXIPOP_TOKEN_ADDRESS || '0xf732f31f73e7DC21299f3ab42BD22E8a7C6b4B07') as `0x${string}`;
  const moneyTree = (process.env.MONEYTREE_CONTRACT_ADDRESS || '0xE636BaaF2c390A591EdbffaF748898EB3f6FF9A1') as `0x${string}`;

  console.log('🏗️ Contract address configuration:', {
    lexipopToken: {
      env: process.env.LEXIPOP_TOKEN_ADDRESS,
      used: lexipopToken
    },
    moneyTree: {
      env: process.env.MONEYTREE_CONTRACT_ADDRESS,
      used: moneyTree
    }
  });

  return {
    lexipopToken,
    moneyTree,
  };
};

// Contract addresses by chain - MoneyTree is deployed on Base mainnet
const tokenContracts = {
  [base.id]: getContractAddresses(),
  [baseSepolia.id]: {
    // For testing, we could use different addresses or disable token claiming
    lexipopToken: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    moneyTree: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  }
} as const;

// Use Base mainnet for token claims (where contract is deployed)
// NOTE: Changed to always use Base mainnet since that's where the contract exists
const defaultChain = base;
import {
  moneyTreeABI,
  lexipopTokenABI,
  parseTokenAmount,
  isValidAddress,
  validateTokenAmount
} from '@/lib/web3/contracts/moneyTree';

interface ClaimRequest {
  gameId: string;
  userAddress: string;
  tokensToClaimgame: number;
  signature?: string; // For claim validation
}

interface ClaimResponse {
  success: boolean;
  transactionHash?: string;
  error?: string;
  estimatedGas?: string;
}

// Rate limiting: Store recent claims to prevent spam
const recentClaims = new Map<string, number>();
const CLAIM_COOLDOWN = 5 * 60 * 1000; // 5 minutes

export async function POST(request: NextRequest) {
  try {
    const body: ClaimRequest = await request.json();
    const { gameId, userAddress, tokensToClaimgame, signature } = body;

    // Validate required fields
    if (!gameId || !userAddress || !tokensToClaimgame) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate token amount
    if (tokensToClaimgame <= 0 || tokensToClaimgame > 10000) {
      return NextResponse.json(
        { success: false, error: 'Invalid token amount' },
        { status: 400 }
      );
    }

    // Validate Ethereum address format
    if (!isValidAddress(userAddress)) {
      return NextResponse.json(
        { success: false, error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // Validate token amount
    if (!validateTokenAmount(tokensToClaimgame)) {
      return NextResponse.json(
        { success: false, error: 'Invalid token amount - must be between 1 and 10,000 tokens' },
        { status: 400 }
      );
    }

    // Rate limiting check
    const headersList = await headers();
    const clientIP = headersList.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `${userAddress}-${clientIP}`;
    const lastClaim = recentClaims.get(rateLimitKey);

    if (lastClaim && Date.now() - lastClaim < CLAIM_COOLDOWN) {
      const remainingTime = Math.ceil((CLAIM_COOLDOWN - (Date.now() - lastClaim)) / 1000);
      return NextResponse.json(
        {
          success: false,
          error: `Rate limit exceeded. Try again in ${remainingTime} seconds.`
        },
        { status: 429 }
      );
    }

    // TODO: Validate the game session and score against database
    // This should check:
    // 1. The game was actually played
    // 2. The score matches the claimed tokens
    // 3. The game hasn't been claimed before

    console.log(`🎯 Processing token claim:`, {
      gameId,
      userAddress: `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`,
      tokensToClaimgame
    });

    // Get contract addresses for current chain
    const chainId = defaultChain.id;
    const contracts = tokenContracts[chainId as keyof typeof tokenContracts];

    if (!contracts) {
      return NextResponse.json(
        { success: false, error: 'Chain not supported' },
        { status: 400 }
      );
    }

    // Check for required environment variables
    const privateKey = process.env.PRIVATE_KEY;
    const rpcUrl = process.env.RPC_URL || (defaultChain.id === base.id ?
      'https://mainnet.base.org' : 'https://sepolia.base.org');

    if (!privateKey) {
      console.error('❌ PRIVATE_KEY environment variable not set');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    try {
      // Create clients
      const publicClient = createPublicClient({
        chain: defaultChain,
        transport: http(rpcUrl)
      });

      const account = privateKeyToAccount(privateKey as `0x${string}`);
      const walletClient = createWalletClient({
        account,
        chain: defaultChain,
        transport: http(rpcUrl)
      });

      // Convert token amount to wei (18 decimals)
      const tokenAmountWei = parseTokenAmount(tokensToClaimgame);

      console.log(`💰 Distributing ${tokensToClaimgame} LEXIPOP tokens (${tokenAmountWei} wei) to ${userAddress}`);
    console.log(`🔗 Using chain: ${defaultChain.name} (${defaultChain.id})`);
    console.log(`📋 Contract addresses:`, {
      moneyTree: contracts.moneyTree,
      lexipopToken: contracts.lexipopToken
    });

      // First, let's verify the contract exists by checking its bytecode
      console.log(`🔍 Checking if contract exists at ${contracts.moneyTree}...`);
      const bytecode = await publicClient.getBytecode({
        address: contracts.moneyTree
      });

      if (!bytecode || bytecode === '0x') {
        console.error(`❌ No contract found at address ${contracts.moneyTree} on ${defaultChain.name}`);
        return NextResponse.json(
          { success: false, error: `Contract not found at ${contracts.moneyTree} on ${defaultChain.name}. Please verify the contract address.` },
          { status: 503 }
        );
      }

      console.log(`✅ Contract found at ${contracts.moneyTree}, bytecode length: ${bytecode.length}`);

      // Check if MoneyTree contract has the required functions
      try {
        // First, try to get the owner to see if the contract is working
        console.log(`🔍 Testing contract with owner() function...`);
        const owner = await publicClient.readContract({
          address: contracts.moneyTree,
          abi: moneyTreeABI,
          functionName: 'owner'
        });
        console.log(`👤 Contract owner: ${owner}`);

        // Now try getAvailableBalance
        console.log(`🔍 Calling getAvailableBalance function...`);
        const availableBalance = await publicClient.readContract({
          address: contracts.moneyTree,
          abi: moneyTreeABI,
          functionName: 'getAvailableBalance',
          args: [contracts.lexipopToken]
        });

        console.log(`💰 Available balance: ${availableBalance} wei`);

        if (availableBalance < tokenAmountWei) {
          console.warn(`⚠️ Insufficient balance in MoneyTree. Available: ${availableBalance}, Requested: ${tokenAmountWei}`);
          return NextResponse.json(
            { success: false, error: 'Insufficient tokens available for distribution' },
            { status: 503 }
          );
        }
      } catch (contractError) {
        console.error('❌ MoneyTree contract function call failed:', {
          address: contracts.moneyTree,
          chain: defaultChain.name,
          tokenAddress: contracts.lexipopToken,
          error: contractError instanceof Error ? contractError.message : String(contractError)
        });

        // For now, let's skip the balance check and proceed with a warning
        console.warn(`⚠️ Skipping balance check and proceeding with token distribution...`);

        // Comment out the return for debugging - let's see if the distribute function works
        // return NextResponse.json(
        //   { success: false, error: 'Token distribution service temporarily unavailable - contract function error' },
        //   { status: 503 }
        // );
      }

      // Simulate the contract call first
      console.log(`🎭 Simulating distributeTokens call...`);
      console.log(`📋 Parameters:`, {
        tokenAddress: contracts.lexipopToken,
        recipientAddress: userAddress,
        amount: tokenAmountWei.toString()
      });

      const { request } = await publicClient.simulateContract({
        account,
        address: contracts.moneyTree,
        abi: moneyTreeABI,
        functionName: 'distributeTokens',
        args: [contracts.lexipopToken, userAddress, tokenAmountWei]
      });

      console.log(`✅ Simulation successful, proceeding with transaction...`);

      // Execute the transaction
      const txHash = await walletClient.writeContract(request);

      console.log(`✅ Transaction submitted: ${txHash}`);

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
        timeout: 60000 // 60 seconds
      });

      if (receipt.status === 'success') {
        // Update rate limiting
        recentClaims.set(rateLimitKey, Date.now());

        const response: ClaimResponse = {
          success: true,
          transactionHash: txHash,
          estimatedGas: receipt.gasUsed.toString()
        };

        console.log(`🎉 Token distribution successful:`, response);
        return NextResponse.json(response, { status: 200 });

      } else {
        throw new Error('Transaction failed');
      }

    } catch (contractError: unknown) {
      console.error('❌ Contract interaction failed:', contractError);

      // Handle specific error cases
      const errorMessage = contractError instanceof Error ? contractError.message : String(contractError);
      if (errorMessage?.includes('insufficient funds')) {
        return NextResponse.json(
          { success: false, error: 'Insufficient gas funds for transaction' },
          { status: 503 }
        );
      }

      if (errorMessage?.includes('execution reverted')) {
        return NextResponse.json(
          { success: false, error: 'Contract execution failed - please try again later' },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { success: false, error: 'Token distribution failed - please try again' },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('❌ Token claim error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const chainId = defaultChain.id;
  const contracts = tokenContracts[chainId as keyof typeof tokenContracts];

  return NextResponse.json(
    {
      message: 'LEXIPOP Token Claim Endpoint',
      methods: ['POST'],
      chain: defaultChain.name,
      contracts: {
        lexipopToken: contracts?.lexipopToken,
        moneyTree: contracts?.moneyTree
      },
      example: {
        gameId: 'game_123456789',
        userAddress: '0x1234567890123456789012345678901234567890',
        tokensToClaimgame: 100
      },
      limits: {
        minTokens: 1,
        maxTokens: 10000,
        rateLimitMinutes: 5
      }
    },
    { status: 200 }
  );
}

/**
 * 🔒 SECURITY NOTES:
 *
 * 1. Game Validation: Always verify the game was actually played
 * 2. Score Verification: Check that claimed tokens match actual performance
 * 3. Double-spend Prevention: Ensure each game can only be claimed once
 * 4. Rate Limiting: Prevent spam claims from same address/IP
 * 5. Signature Verification: Validate user owns the wallet address
 * 6. Gas Management: Monitor and limit gas usage for claims
 * 7. Error Handling: Never expose sensitive error details
 */