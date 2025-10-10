/**
 * 🔒 SECURE NEYNAR SDK WRAPPER
 *
 * This file handles all server-side Neynar operations with proper security
 * Never expose API keys to client-side code!
 */

import { NeynarAPIClient } from '@neynar/nodejs-sdk';
import { serverEnv } from './env';

// 🔒 Server-side only Neynar client
let neynarClient: NeynarAPIClient | null = null;

export function getNeynarClient(): NeynarAPIClient {
  if (!neynarClient) {
    if (!serverEnv.NEYNAR_API_KEY) {
      throw new Error('🔒 SECURITY: NEYNAR_API_KEY is required but not configured');
    }

    neynarClient = new NeynarAPIClient({ apiKey: serverEnv.NEYNAR_API_KEY });
    console.log('✅ Neynar client initialized securely');
  }

  return neynarClient;
}

// User profile operations
export async function getUserByFid(fid: number) {
  try {
    const client = getNeynarClient();
    const response = await client.fetchBulkUsers({ fids: [fid] });

    // Return only safe, non-sensitive user data
    const user = response.users[0];
    return {
      fid: user.fid,
      username: user.username,
      displayName: user.display_name,
      pfpUrl: user.pfp_url,
      followerCount: user.follower_count,
      followingCount: user.following_count,
      // Never return private data like custody address
    };
  } catch (error) {
    console.error('❌ Failed to fetch user by FID:', error);
    throw new Error('Failed to fetch user profile');
  }
}

export async function getUserByUsername(username: string) {
  try {
    const client = getNeynarClient();
    const response = await client.lookupUserByUsername({ username });

    return {
      fid: response.user.fid,
      username: response.user.username,
      displayName: response.user.display_name,
      pfpUrl: response.user.pfp_url,
      followerCount: response.user.follower_count,
      followingCount: response.user.following_count,
    };
  } catch (error) {
    console.error('❌ Failed to fetch user by username:', error);
    throw new Error('Failed to fetch user profile');
  }
}

// Frame context operations
export async function validateFrameMessage(messageBytes: string) {
  try {
    const client = getNeynarClient();
    const response = await client.validateFrameAction({ messageBytesInHex: messageBytes });

    if (!response.valid) {
      throw new Error('Invalid frame message');
    }

    return {
      valid: response.valid,
      // Return safe frame context data
      interactor: response.action?.interactor ? {
        fid: response.action.interactor.fid,
        username: response.action.interactor.username,
        displayName: response.action.interactor.display_name,
        pfpUrl: response.action.interactor.pfp_url,
      } : null
    };
  } catch (error) {
    console.error('❌ Failed to validate frame message:', error);
    throw new Error('Failed to validate frame interaction');
  }
}

// Cast operations for sharing scores
export async function publishCast(text: string, embeds?: string[]) {
  try {
    const client = getNeynarClient();

    if (!serverEnv.FARCASTER_DEVELOPER_FID) {
      throw new Error('🔒 SECURITY: FARCASTER_DEVELOPER_FID is required');
    }

    // This would require developer mnemonic for signing
    // Implementation depends on your specific requirements
    console.log('📤 Publishing cast:', text);

    // TODO: Implement cast publishing with proper signing
    throw new Error('Cast publishing not yet implemented');

  } catch (error) {
    console.error('❌ Failed to publish cast:', error);
    throw new Error('Failed to share score');
  }
}

/**
 * 🔒 SECURITY NOTES:
 *
 * - This file should only run on the server
 * - API keys are never exposed to client
 * - All user data is sanitized before returning
 * - Frame messages are properly validated
 * - Error messages don't leak sensitive information
 */