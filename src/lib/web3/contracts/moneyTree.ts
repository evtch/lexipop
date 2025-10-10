/**
 * 🌳 MONEYTREE CONTRACT INTEGRATION
 *
 * MoneyTree contract ABI and interaction functions
 * Used for distributing LEXIPOP tokens to game players
 */

import { Address } from 'viem';

// MoneyTree contract ABI - minimal interface for token distribution
export const moneyTreeABI = [
  {
    "inputs": [
      {"name": "token", "type": "address"},
      {"name": "recipient", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "name": "distributeTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "token", "type": "address"}
    ],
    "name": "getAvailableBalance",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "token", "type": "address"},
      {"name": "recipient", "type": "address"}
    ],
    "name": "getClaimableAmount",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// LEXIPOP token ABI - basic ERC20 interface
export const lexipopTokenABI = [
  {
    "inputs": [
      {"name": "account", "type": "address"}
    ],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Contract interaction types
export interface TokenDistribution {
  token: Address;
  recipient: Address;
  amount: bigint;
}

export interface ContractAddresses {
  lexipopToken: Address;
  moneyTree: Address;
}

// Helper functions for token amounts
export const LEXIPOP_DECIMALS = 18;

export function parseTokenAmount(amount: number): bigint {
  return BigInt(Math.floor(amount * (10 ** LEXIPOP_DECIMALS)));
}

export function formatTokenAmount(amount: bigint): string {
  const formatted = Number(amount) / (10 ** LEXIPOP_DECIMALS);
  return formatted.toLocaleString();
}

// Validation functions
export function isValidAddress(address: string): address is Address {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function validateTokenAmount(amount: number): boolean {
  return amount > 0 && amount <= 10000 && Number.isFinite(amount);
}

/**
 * 🔒 SECURITY NOTES:
 *
 * 1. Contract Verification: Always verify contract addresses on block explorer
 * 2. Amount Validation: Validate token amounts before sending transactions
 * 3. Gas Estimation: Estimate gas before submitting transactions
 * 4. Error Handling: Handle contract interaction errors gracefully
 * 5. Rate Limiting: Implement server-side rate limiting for claims
 * 6. Balance Checks: Verify contract has sufficient tokens before distribution
 */