/**
 * 🪙 TOKEN CLAIM API ENDPOINT
 *
 * Handles token claiming requests and blockchain transactions
 * Validates claims and interacts with smart contracts
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createPublicClient, http, encodePacked, keccak256, hashMessage, type Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base, baseSepolia } from 'viem/chains';
import { prisma } from '@/lib/prisma';
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
  fid?: number; // Farcaster ID if authenticated
}

interface ClaimResponse {
  success: boolean;
  signature?: string;
  nonce?: string;
  tokenAddress?: string;
  amount?: string;
  error?: string;
}

// Rate limiting: Store recent claims to prevent spam
const recentClaims = new Map<string, number>();
const CLAIM_COOLDOWN = 5 * 60 * 1000; // 5 minutes

export async function POST(request: NextRequest) {
  try {
    const body: ClaimRequest = await request.json();
    const { gameId, userAddress, tokensToClaimgame, signature, fid } = body;

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
      const remainingTimeMs = CLAIM_COOLDOWN - (Date.now() - lastClaim);
      const remainingMinutes = Math.ceil(remainingTimeMs / (1000 * 60));

      return NextResponse.json(
        {
          success: false,
          error: `You already claimed tokens. Play again in ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`
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
    const signerPrivateKey = process.env.PRIVATE_KEY;
    const rpcUrl = process.env.RPC_URL || (defaultChain.id === base.id ?
      'https://mainnet.base.org' : 'https://sepolia.base.org');

    if (!signerPrivateKey || signerPrivateKey === 'your_private_key_here') {
      console.error('❌ PRIVATE_KEY environment variable not set or using placeholder value');
      return NextResponse.json(
        { success: false, error: 'Server configuration error - private key not configured' },
        { status: 500 }
      );
    }

    // Validate private key format
    if (!signerPrivateKey.startsWith('0x') || signerPrivateKey.length !== 66) {
      console.error('❌ PRIVATE_KEY must be a hex string starting with 0x and 66 characters long');
      return NextResponse.json(
        { success: false, error: 'Server configuration error - invalid private key format' },
        { status: 500 }
      );
    }

    try {
      // Create public client for checking contract state
      const publicClient = createPublicClient({
        chain: defaultChain,
        transport: http(rpcUrl)
      });

      // Convert token amount to wei (18 decimals)
      const tokenAmountWei = parseTokenAmount(tokensToClaimgame);

      console.log(`💰 Generating signature for ${tokensToClaimgame} LEXIPOP tokens (${tokenAmountWei} wei) to ${userAddress}`);
      console.log(`🔗 Using chain: ${defaultChain.name} (${defaultChain.id})`);
      console.log(`📋 Contract addresses:`, {
        moneyTree: contracts.moneyTree,
        lexipopToken: contracts.lexipopToken
      });

      // Check MoneyTree contract balance for the signer
      const account = privateKeyToAccount(signerPrivateKey as `0x${string}`);
      const signerAddress = account.address;

      console.log(`🔍 Checking MoneyTree balance for signer: ${signerAddress}`);
      const signerBalance = await publicClient.readContract({
        address: contracts.moneyTree,
        abi: moneyTreeABI,
        functionName: 'balanceOf',
        args: [signerAddress, contracts.lexipopToken]
      });

      console.log(`💰 Signer balance in MoneyTree: ${signerBalance} wei`);

      if (signerBalance < tokenAmountWei) {
        console.warn(`⚠️ Insufficient balance in MoneyTree. Available: ${signerBalance}, Requested: ${tokenAmountWei}`);
        return NextResponse.json(
          { success: false, error: 'Insufficient tokens available for distribution' },
          { status: 503 }
        );
      }

      // Generate unique nonce like thequiz2 does
      const now = new Date();
      const dailyStart = new Date(now);
      dailyStart.setHours(0, 0, 0, 0);
      const dailyEpoch = Math.floor(dailyStart.getTime() / (1000 * 60 * 60 * 24)); // Days since epoch

      // Create nonce: hash gameId to numeric + timestamp + daily epoch
      const gameIdNumeric = Math.abs(gameId.split('').reduce((hash, char) => {
        return ((hash << 5) - hash + char.charCodeAt(0)) & 0x7FFFFFFF; // Keep it positive 32-bit
      }, 0)).toString().padStart(8, "0").slice(-8); // Ensure 8 digits
      const timestampHash = Date.now().toString().slice(-8); // Last 8 chars of timestamp
      const epochStr = dailyEpoch.toString().padStart(5, "0");
      const nonce = BigInt(`${gameIdNumeric}${timestampHash}${epochStr}`);

      const chainId = defaultChain.id;
      const contractAddress = contracts.moneyTree;

      // Create message hash exactly as MoneyTree contract expects
      // From contract: keccak256(abi.encodePacked(token, amount, recipient, nonce, block.chainid, address(this)))
      const messagePreimage = keccak256(
        encodePacked(
          ["address", "uint256", "address", "uint256", "uint256", "address"],
          [
            contracts.lexipopToken,
            tokenAmountWei,
            userAddress as Hex,
            nonce,
            BigInt(chainId),
            contractAddress,
          ]
        )
      );

      // Apply Ethereum signed message hash format
      const messageHash = hashMessage({ raw: messagePreimage });

      // Check if this hash has already been used
      console.log(`🔍 Checking if message hash is already used...`);
      const isUsed = await publicClient.readContract({
        address: contractAddress,
        abi: moneyTreeABI,
        functionName: "usedHashes",
        args: [messageHash],
      });

      if (isUsed) {
        console.log('Hash already used in MoneyTree contract:', messageHash);
        return NextResponse.json({
          success: false,
          error: 'This prize has already been claimed!'
        }, { status: 400 });
      }

      // Sign the message
      console.log(`✍️ Signing withdrawal authorization...`);
      const signature = await account.signMessage({
        message: { raw: messagePreimage }
      });

      // Update rate limiting
      recentClaims.set(rateLimitKey, Date.now());

      // Record the claim in database
      try {
        // Create token claim record
        const tokenClaim = await prisma.tokenClaim.create({
          data: {
            gameSessionId: gameId,
            nonce: nonce.toString(),
            userFid: fid || null,
            walletAddress: userAddress.toLowerCase(),
            tokenAmount: tokenAmountWei,
            tokenAmountFormatted: tokensToClaimgame,
            status: 'signature_generated',
            signatureGenerated: new Date()
          }
        });

        // Update user stats if FID provided
        if (fid) {
          // Update or create user stats with wallet address
          await prisma.userStats.upsert({
            where: { userFid: fid },
            update: {
              walletAddress: userAddress.toLowerCase(),
              totalTokensEarned: {
                increment: tokensToClaimgame
              },
              updatedAt: new Date()
            },
            create: {
              userFid: fid,
              walletAddress: userAddress.toLowerCase(),
              totalTokensEarned: tokensToClaimgame
            }
          });
        }

        console.log(`📝 Claim recorded in database - ID: ${tokenClaim.id}`);
      } catch (dbError) {
        console.error('⚠️ Database recording failed (non-critical):', dbError);
        // Don't fail the claim if database recording fails
      }

      const response: ClaimResponse = {
        success: true,
        signature,
        nonce: nonce.toString(),
        tokenAddress: contracts.lexipopToken,
        amount: tokenAmountWei.toString()
      };

      console.log(`✅ Withdrawal signature generated successfully`);
      return NextResponse.json(response, { status: 200 });

    } catch (contractError: unknown) {
      console.error('❌ Signature generation failed:', contractError);

      // Handle specific error cases
      const errorMessage = contractError instanceof Error ? contractError.message : String(contractError);

      return NextResponse.json(
        { success: false, error: 'Failed to generate withdrawal signature - please try again' },
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