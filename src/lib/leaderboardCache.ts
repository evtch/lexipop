import { createPublicClient, http, parseAbi } from 'viem';
import { base } from 'viem/chains';

/**
 * 📊 LEADERBOARD CACHE SYSTEM
 *
 * Caches on-chain data to avoid expensive RPC calls
 * Refreshes periodically to keep data current
 */

const LEXIPOP_TOKEN = '0xf732f31f73e7dc21299f3ab42bd22e8a7c6b4b07';
const MONEY_TREE = '0xe636baaf2c390a591edbffaf748898eb3f6ff9a1';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const SCAN_BLOCKS = 100000n; // Scan last 100k blocks to find claims
const MAX_SCAN_BLOCKS = 500000n; // Maximum blocks to scan if no data found

// Cache structure
interface CacheEntry {
  data: any;
  timestamp: number;
  isLoading: boolean;
}

interface AddressData {
  address: string;
  totalClaimed: bigint;
  claimCount: number;
  lastClaimBlock?: bigint;
}

// Global cache
const cache: Map<string, CacheEntry> = new Map();

// Create Base mainnet client
const client = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
});

// MoneyTree ABI for withdraw events
const moneyTreeABI = parseAbi([
  'event Withdraw(address indexed signer, address indexed recipient, address indexed token, uint256 amount)',
]);

/**
 * Get cached leaderboard data
 */
export async function getCachedLeaderboard(): Promise<any> {
  const cacheKey = 'leaderboard';
  const cached = cache.get(cacheKey);

  // Return cached data if fresh
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('📦 Returning cached leaderboard data');
    return cached.data;
  }

  // If another request is already loading, wait a bit
  if (cached?.isLoading) {
    console.log('⏳ Another request is loading, waiting...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    return getCachedLeaderboard();
  }

  // Mark as loading
  cache.set(cacheKey, {
    data: cached?.data || null,
    timestamp: cached?.timestamp || 0,
    isLoading: true,
  });

  try {
    console.log('🔄 Fetching fresh leaderboard data from blockchain...');

    // Get current block
    const currentBlock = await client.getBlockNumber();
    const fromBlock = currentBlock > SCAN_BLOCKS ? currentBlock - SCAN_BLOCKS : 0n;

    console.log(`📊 Scanning blocks ${fromBlock} to ${currentBlock} (${SCAN_BLOCKS} blocks)`);

    // Get all withdraw events in range
    const withdrawEvents = await client.getLogs({
      address: MONEY_TREE as `0x${string}`,
      event: {
        type: 'event',
        name: 'Withdraw',
        inputs: [
          { name: 'signer', type: 'address', indexed: true },
          { name: 'recipient', type: 'address', indexed: true },
          { name: 'token', type: 'address', indexed: true },
          { name: 'amount', type: 'uint256', indexed: false },
        ],
      },
      args: {
        token: LEXIPOP_TOKEN as `0x${string}`,
      },
      fromBlock,
      toBlock: currentBlock,
    });

    console.log(`✅ Found ${withdrawEvents.length} withdrawal events`);

    // Aggregate claims by address
    const addressMap: Map<string, AddressData> = new Map();

    for (const event of withdrawEvents) {
      const recipient = (event.args?.recipient as string)?.toLowerCase();
      const amount = event.args?.amount as bigint;
      const blockNumber = event.blockNumber;

      if (recipient && amount) {
        const existing = addressMap.get(recipient);
        if (existing) {
          existing.totalClaimed += amount;
          existing.claimCount += 1;
          if (!existing.lastClaimBlock || blockNumber > existing.lastClaimBlock) {
            existing.lastClaimBlock = blockNumber;
          }
        } else {
          addressMap.set(recipient, {
            address: recipient,
            totalClaimed: amount,
            claimCount: 1,
            lastClaimBlock: blockNumber,
          });
        }
      }
    }

    // Convert to sorted leaderboard
    const leaderboard = Array.from(addressMap.values())
      .map(data => ({
        address: data.address,
        totalClaimed: data.totalClaimed.toString(),
        claimedFormatted: Number(data.totalClaimed) / 10**18,
        claimCount: data.claimCount,
        lastClaimBlock: data.lastClaimBlock?.toString(),
      }))
      .sort((a, b) => b.claimedFormatted - a.claimedFormatted)
      .slice(0, 100); // Top 100

    // Add rank
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    const result = {
      success: true,
      leaderboard: rankedLeaderboard,
      totalAddresses: addressMap.size,
      fromBlock: fromBlock.toString(),
      toBlock: currentBlock.toString(),
      cachedAt: new Date().toISOString(),
      cacheExpiry: new Date(Date.now() + CACHE_DURATION).toISOString(),
    };

    // Update cache
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
      isLoading: false,
    });

    console.log(`💾 Cached ${rankedLeaderboard.length} leaderboard entries`);
    return result;

  } catch (error) {
    console.error('❌ Error fetching leaderboard:', error);

    // Mark as not loading
    cache.set(cacheKey, {
      data: cached?.data || null,
      timestamp: cached?.timestamp || 0,
      isLoading: false,
    });

    // Return old cache if available
    if (cached?.data) {
      console.log('⚠️ Returning stale cache due to error');
      return cached.data;
    }

    throw error;
  }
}

/**
 * Get cached data for specific address
 */
export async function getCachedAddressData(address: string): Promise<any> {
  const cacheKey = `address:${address.toLowerCase()}`;
  const cached = cache.get(cacheKey);

  // Return cached data if fresh
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`📦 Returning cached data for ${address}`);
    return cached.data;
  }

  // If loading, wait
  if (cached?.isLoading) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return getCachedAddressData(address);
  }

  // Mark as loading
  cache.set(cacheKey, {
    data: cached?.data || null,
    timestamp: cached?.timestamp || 0,
    isLoading: true,
  });

  try {
    console.log(`🔄 Fetching data for address ${address}`);

    // Get current balance
    const balance = await client.readContract({
      address: LEXIPOP_TOKEN as `0x${string}`,
      abi: parseAbi(['function balanceOf(address) view returns (uint256)']),
      functionName: 'balanceOf',
      args: [address as `0x${string}`],
    });

    // Get recent claims
    const currentBlock = await client.getBlockNumber();
    const fromBlock = currentBlock > 10000n ? currentBlock - 10000n : 0n;

    const withdrawEvents = await client.getLogs({
      address: MONEY_TREE as `0x${string}`,
      event: {
        type: 'event',
        name: 'Withdraw',
        inputs: [
          { name: 'signer', type: 'address', indexed: true },
          { name: 'recipient', type: 'address', indexed: true },
          { name: 'token', type: 'address', indexed: true },
          { name: 'amount', type: 'uint256', indexed: false },
        ],
      },
      args: {
        recipient: address as `0x${string}`,
        token: LEXIPOP_TOKEN as `0x${string}`,
      },
      fromBlock,
      toBlock: currentBlock,
    });

    // Calculate total claimed
    let totalClaimed = 0n;
    for (const event of withdrawEvents) {
      if (event.args?.amount) {
        totalClaimed += event.args.amount as bigint;
      }
    }

    const result = {
      success: true,
      data: {
        address,
        currentBalance: balance.toString(),
        totalClaimed: totalClaimed.toString(),
        claimCount: withdrawEvents.length,
        balanceFormatted: Number(balance) / 10**18,
        claimedFormatted: Number(totalClaimed) / 10**18,
      },
      cachedAt: new Date().toISOString(),
    };

    // Update cache
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
      isLoading: false,
    });

    return result;

  } catch (error) {
    // Mark as not loading
    cache.set(cacheKey, {
      data: cached?.data || null,
      timestamp: cached?.timestamp || 0,
      isLoading: false,
    });

    if (cached?.data) {
      return cached.data;
    }

    throw error;
  }
}

/**
 * Force refresh the cache
 */
export function invalidateCache(key?: string) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
  console.log(`🔄 Cache invalidated: ${key || 'all'}`);
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const stats = {
    entries: cache.size,
    items: [] as any[],
  };

  cache.forEach((value, key) => {
    stats.items.push({
      key,
      age: Date.now() - value.timestamp,
      isLoading: value.isLoading,
      hasData: !!value.data,
    });
  });

  return stats;
}