# 🚀 Envio HyperIndex Setup for Lexipop

This document explains how to set up Envio HyperIndex to track $LEXIPOP token claims on-chain for a reliable leaderboard system.

## Overview

Instead of relying on database storage which can have consistency issues, we're using Envio to index blockchain events directly from Base mainnet. This tracks:

- **LEXIPOP Token Transfers** (`0xf732f31f73e7dc21299f3ab42bd22e8a7c6b4b07`)
- **MoneyTree Contract Claims** (`0xe636baaf2c390a591edbffaf748898eb3f6ff9a1`)

## Files Created

```
lexipop/
├── envio.config.yaml          # Envio configuration
├── schema.graphql             # GraphQL schema
├── abis/
│   ├── LexipopToken.json     # LEXIPOP ERC20 ABI
│   └── MoneyTree.json        # MoneyTree contract ABI
├── src/
│   ├── TokenHandlers.ts      # Handle Transfer/Approval events
│   ├── MoneyTreeHandlers.ts  # Handle Withdraw/Deposit events
│   └── app/api/leaderboard/envio/route.ts  # GraphQL API wrapper
└── generated/
    └── index.ts              # TypeScript types (manual)
```

## Setup Instructions

### 1. Install Envio CLI

```bash
# Fix npm permissions first if needed
sudo chown -R $(whoami) ~/.npm

# Install globally
npm install -g envio

# Or use locally
npm install envio --save-dev
```

### 2. Generate Types

```bash
# Generate TypeScript types from config
envio codegen
```

### 3. Start Development

```bash
# Start local indexer with hot reload
envio dev
```

This will:
- Start syncing from Base mainnet block 0 (or latest checkpoint)
- Index all Transfer and Withdraw events
- Provide GraphQL API at `http://localhost:8080/v1/graphql`
- Create PostgreSQL database with indexed data

### 4. Environment Variables

Add to your `.env.local`:

```bash
# Envio GraphQL endpoint
ENVIO_GRAPHQL_URL=http://localhost:8080/v1/graphql

# For production, use hosted Envio endpoint
# ENVIO_GRAPHQL_URL=https://indexer.envio.dev/v1/graphql
```

### 5. Query the Data

The leaderboard API is available at:
- `GET /api/leaderboard/envio` - Get top claimers
- `GET /api/leaderboard/envio?fid=12345` - Get specific user stats

Example GraphQL queries:

```graphql
# Get leaderboard
{
  User(order_by: {totalClaimed: desc}, limit: 50) {
    address
    fid
    totalClaimed
    claimCount
    claims {
      amount
      timestamp
      transactionHash
    }
  }
}
```

## Data Schema

### User Entity
- `address` - Wallet address
- `fid` - Farcaster ID (when available)
- `totalClaimed` - Total $LEXIPOP tokens claimed
- `currentBalance` - Current token balance
- `claimCount` - Number of claim transactions
- `firstClaimDate` / `lastClaimDate` - Timing data

### Claim Entity
- `user` - Reference to User
- `amount` - Tokens claimed in this transaction
- `transactionHash` - On-chain transaction
- `timestamp` - Block timestamp

### Transfer Entity
- `from` / `to` - Transfer participants
- `amount` - Transfer amount
- `transactionHash` - On-chain transaction

## Benefits

1. **Reliability** - Data comes directly from blockchain
2. **Real-time** - Events indexed as they happen
3. **Scalability** - Envio handles high-throughput indexing
4. **Accuracy** - No database sync issues or race conditions
5. **Transparency** - All data is verifiable on-chain

## Troubleshooting

### Permission Issues
```bash
sudo chown -R $(whoami) ~/.npm
npm cache clean --force
```

### Missing Contracts
Verify contract addresses are correct on Base mainnet:
- LEXIPOP: `0xf732f31f73e7dc21299f3ab42bd22e8a7c6b4b07`
- MoneyTree: `0xe636baaf2c390a591edbffaf748898eb3f6ff9a1`

### Sync Issues
Check Envio logs for RPC connection or event parsing errors.

## Production Deployment

For production, consider using Envio's hosted service or deploy your indexer to a server with:

1. Reliable Base mainnet RPC endpoint
2. PostgreSQL database
3. GraphQL API endpoint
4. Monitoring and alerting

The indexed data provides a much more reliable foundation for the leaderboard than database-stored scores.