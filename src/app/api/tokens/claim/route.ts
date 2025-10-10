/**
 * 🪙 TOKEN CLAIM API ENDPOINT
 *
 * Handles token claiming requests and blockchain transactions
 * Validates claims and interacts with smart contracts
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

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
    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return NextResponse.json(
        { success: false, error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // Rate limiting check
    const clientIP = headers().get('x-forwarded-for') || 'unknown';
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

    // TODO: Validate the game session and score
    // This should check against the database to ensure:
    // 1. The game was actually played
    // 2. The score matches the claimed tokens
    // 3. The game hasn't been claimed before

    // TODO: Implement smart contract interaction
    // For now, we'll simulate the transaction

    console.log(`🎯 Processing token claim:`, {
      gameId,
      userAddress: `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`,
      tokensToClaimgame
    });

    // Simulate blockchain transaction delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock transaction hash
    const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;

    // Update rate limiting
    recentClaims.set(rateLimitKey, Date.now());

    // TODO: Actual smart contract call would go here
    // Example using viem/wagmi:
    /*
    const client = createPublicClient({
      chain: base,
      transport: http(process.env.RPC_URL)
    });

    const walletClient = createWalletClient({
      chain: base,
      transport: http(process.env.RPC_URL),
      account: privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`)
    });

    const { request } = await client.simulateContract({
      address: TOKEN_CONTRACT_ADDRESS,
      abi: tokenABI,
      functionName: 'claimTokens',
      args: [userAddress, tokensToClaimgame],
      account: walletClient.account
    });

    const txHash = await walletClient.writeContract(request);
    */

    const response: ClaimResponse = {
      success: true,
      transactionHash: mockTxHash,
      estimatedGas: '0.001' // ETH
    };

    console.log(`✅ Token claim successful:`, response);

    return NextResponse.json(response, { status: 200 });

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
  return NextResponse.json(
    {
      message: 'Token claim endpoint',
      methods: ['POST'],
      example: {
        gameId: 'game_123456789',
        userAddress: '0x1234567890123456789012345678901234567890',
        tokensToClaimgame: 100
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