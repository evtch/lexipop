/**
 * 🔒 SECURE ENVIRONMENT CONFIGURATION
 *
 * This file safely loads and validates environment variables
 * All sensitive data should be in .env.local (never committed to git)
 */

// Utility to safely get environment variables with validation
function getEnvVar(name: string, required: boolean = true): string | undefined {
  const value = process.env[name];

  if (required && !value) {
    console.error(`🔒 SECURITY WARNING: Required environment variable ${name} is missing!`);
    throw new Error(`Missing required environment variable: ${name}`);
  }

  if (value && isLikelySecret(value)) {
    // Never log actual secret values
    console.log(`✅ Loaded ${name}: [REDACTED]`);
  } else if (value) {
    console.log(`✅ Loaded ${name}: ${value}`);
  }

  return value;
}

// Check if a value looks like a secret that should never be logged
function isLikelySecret(value: string): boolean {
  const secretPatterns = [
    /^[A-Za-z0-9+/]{40,}={0,2}$/, // Base64-like
    /^0x[a-fA-F0-9]{40,}$/, // Ethereum address/key-like
    /api_key|secret|token|password|mnemonic/i, // Contains secret keywords
    /^[a-f0-9]{32,}$/i, // Hex string (likely a key)
    /^[A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12}$/i, // UUID format (Neynar keys)
    /^[a-f0-9-]{36}$/i // Another UUID format
  ];

  return secretPatterns.some(pattern => pattern.test(value));
}

// ⚠️ SERVER-SIDE ONLY - Never expose these to client
export const serverEnv = {
  // Neynar API credentials
  NEYNAR_API_KEY: getEnvVar('NEYNAR_API_KEY', false),
  NEYNAR_CLIENT_ID: getEnvVar('NEYNAR_CLIENT_ID', false),
  NEYNAR_SIGNER_UUID: getEnvVar('NEYNAR_SIGNER_UUID', false),

  // Farcaster developer credentials
  FARCASTER_DEVELOPER_FID: getEnvVar('FARCASTER_DEVELOPER_FID', false),
  FARCASTER_DEVELOPER_MNEMONIC: getEnvVar('FARCASTER_DEVELOPER_MNEMONIC', false),

  // Database
  DATABASE_URL: getEnvVar('DATABASE_URL', false),

  // Node environment
  NODE_ENV: getEnvVar('NODE_ENV', false) || 'development',

  // Cron job security
  CRON_SECRET: getEnvVar('CRON_SECRET', false)
};

// ✅ CLIENT-SAFE - These can be exposed to browser (prefixed with NEXT_PUBLIC_)
export const clientEnv = {
  APP_URL: getEnvVar('NEXT_PUBLIC_APP_URL', false) || 'http://localhost:3003',
  MINIAPP_URL: getEnvVar('NEXT_PUBLIC_MINIAPP_URL', false) || 'http://localhost:3003/miniapp',
  BASE_RPC_URL: getEnvVar('NEXT_PUBLIC_BASE_RPC_URL', false) || 'https://mainnet.base.org'
};

// Security validation on module load
validateEnvironment();

function validateEnvironment() {
  console.log('🔒 Validating environment security...');

  // Check if we're in development
  const isDev = serverEnv.NODE_ENV === 'development';

  // Warn about missing production credentials
  if (!isDev) {
    const requiredForProduction = [
      'NEYNAR_API_KEY',
      'FARCASTER_DEVELOPER_FID'
    ];

    const missing = requiredForProduction.filter(key => !serverEnv[key as keyof typeof serverEnv]);

    if (missing.length > 0) {
      console.error('🚨 PRODUCTION WARNING: Missing required environment variables:', missing);
    }
  }

  // Check for potential security issues
  if (process.env.NEYNAR_API_KEY === 'your_neynar_api_key_here') {
    console.warn('⚠️  SECURITY: You are using placeholder API keys. Update your .env.local file!');
  }

  console.log('✅ Environment validation complete');
}

// Helper to check if running on server vs client
export const isServer = typeof window === 'undefined';

// Export safe configuration
export const config = {
  ...clientEnv,
  // Only include server env if we're actually on server
  ...(isServer ? { server: serverEnv } : {})
};