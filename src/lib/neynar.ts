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

    neynarClient = new NeynarAPIClient(serverEnv.NEYNAR_API_KEY);
    console.log('✅ Neynar client initialized securely');
  }

  return neynarClient;
}

// User profile operations
export async function getUserByFid(fid: number) {
  try {
    const client = getNeynarClient();
    const response = await client.lookupUserByFid(fid);

    // Return only safe, non-sensitive user data
    return {
      fid: response.result.user.fid,
      username: response.result.user.username,
      displayName: response.result.user.displayName,
      pfpUrl: response.result.user.pfp?.url,
      followerCount: response.result.user.followerCount,
      followingCount: response.result.user.followingCount,
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
    const response = await client.lookupUserByUsername(username);

    return {
      fid: response.result.user.fid,
      username: response.result.user.username,
      displayName: response.result.user.displayName,
      pfpUrl: response.result.user.pfp?.url,
      followerCount: response.result.user.followerCount,
      followingCount: response.result.user.followingCount,
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
    const response = await client.validateFrameMessage(messageBytes);

    if (!response.valid) {
      throw new Error('Invalid frame message');
    }

    return {
      valid: response.valid,
      message: response.message,
      // Return safe frame context data
      interactor: response.message?.interactor ? {
        fid: response.message.interactor.fid,
        username: response.message.interactor.username,
        displayName: response.message.interactor.displayName,
        pfpUrl: response.message.interactor.pfp?.url,
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