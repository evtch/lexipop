/**
 * 🎯 DEPRECATED: MINIAPP CONFIG
 *
 * This file is deprecated. We now use a single universal config in config.ts
 * following BitWorld's approach for better compatibility.
 */

// Re-export the main config for backward compatibility
export { wagmiConfig as miniappWagmiConfig, defaultChain } from './config';
export { wagmiConfig as default } from './config';