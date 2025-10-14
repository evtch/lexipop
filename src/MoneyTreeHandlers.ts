import { MoneyTreeContract } from "generated";

/**
 * Handle MoneyTree Deposit Events
 * Tracks when tokens are deposited to the MoneyTree contract
 */
MoneyTreeContract.Deposit.handler(async ({ event, context }) => {
  const { signer, token, amount } = event.params;
  const { transactionHash, blockNumber } = event;

  console.log(`Deposit: ${signer} deposited ${amount} of token ${token}`);

  // We mainly care about withdrawals for claims, but deposits show funding
});

/**
 * Handle MoneyTree Withdraw Events
 * This is where users claim their $LEXIPOP tokens
 */
MoneyTreeContract.Withdraw.handler(async ({ event, context }) => {
  const { signer, recipient, token, amount } = event.params;
  const { transactionHash, blockNumber, logIndex } = event;

  // Create unique ID for this claim
  const claimId = `${transactionHash}-${logIndex}`;

  // Record the claim
  const claim = {
    id: claimId,
    user: recipient.toLowerCase(), // The recipient gets the tokens
    amount: amount,
    nonce: BigInt(0), // We don't have nonce in the event, but it's in the function call
    transactionHash,
    blockNumber: BigInt(blockNumber),
    timestamp: BigInt(event.block.timestamp),
  };

  context.Claim.set(claim);

  // Update user stats
  await updateUserClaims(recipient.toLowerCase(), amount, context);

  console.log(`Claim recorded: ${recipient} claimed ${amount} $LEXIPOP tokens`);
});

/**
 * Helper function to update user claim statistics
 */
async function updateUserClaims(
  address: string,
  amount: bigint,
  context: any
) {
  const userId = address;

  // Get existing user or create new one
  let user = await context.User.get(userId);

  const now = BigInt(Date.now());

  if (!user) {
    // Create new user
    user = {
      id: userId,
      address: address,
      fid: null, // Will be populated when we can link addresses to FIDs
      totalClaimed: BigInt(0),
      currentBalance: amount, // Start with the claimed amount
      claimCount: 0,
      firstClaimDate: null,
      lastClaimDate: null,
      createdAt: now,
      updatedAt: now,
    };
  }

  // Update claim statistics
  user.totalClaimed = user.totalClaimed + amount;
  user.claimCount = user.claimCount + 1;

  if (!user.firstClaimDate) {
    user.firstClaimDate = now;
  }
  user.lastClaimDate = now;
  user.updatedAt = now;

  context.User.set(user);
}