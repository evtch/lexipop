import { LexipopTokenContract } from "generated";

/**
 * Handle LEXIPOP Token Transfer Events
 * Tracks when tokens are transferred (including claims from MoneyTree)
 */
LexipopTokenContract.Transfer.handler(async ({ event, context }) => {
  // Extract event data
  const { from, to, value } = event.params;
  const { transactionHash, blockNumber, logIndex } = event;

  // Create unique ID for this transfer
  const transferId = `${transactionHash}-${logIndex}`;

  // Record the transfer
  const transfer = {
    id: transferId,
    from: from.toLowerCase(),
    to: to.toLowerCase(),
    amount: value,
    transactionHash,
    blockNumber: BigInt(blockNumber),
    timestamp: BigInt(event.block.timestamp),
  };

  context.Transfer.set(transfer);

  // Update user balances
  // Skip zero address (minting/burning)
  if (to !== "0x0000000000000000000000000000000000000000") {
    await updateUserBalance(to.toLowerCase(), value, true, context);
  }

  if (from !== "0x0000000000000000000000000000000000000000") {
    await updateUserBalance(from.toLowerCase(), value, false, context);
  }
});

/**
 * Handle LEXIPOP Token Approval Events
 * Not critical for leaderboard but good for completeness
 */
LexipopTokenContract.Approval.handler(async ({ event, context }) => {
  // Just log approvals, not needed for leaderboard
  console.log(`Approval: ${event.params.owner} approved ${event.params.spender} for ${event.params.value} tokens`);
});

/**
 * Helper function to update user balance
 */
async function updateUserBalance(
  address: string,
  amount: bigint,
  isIncoming: boolean,
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
      currentBalance: BigInt(0),
      claimCount: 0,
      firstClaimDate: null,
      lastClaimDate: null,
      createdAt: now,
      updatedAt: now,
    };
  }

  // Update balance
  if (isIncoming) {
    user.currentBalance = user.currentBalance + amount;
    user.totalClaimed = user.totalClaimed + amount;
    user.claimCount = user.claimCount + 1;

    if (!user.firstClaimDate) {
      user.firstClaimDate = now;
    }
    user.lastClaimDate = now;
  } else {
    user.currentBalance = user.currentBalance - amount;
  }

  user.updatedAt = now;

  context.User.set(user);
}