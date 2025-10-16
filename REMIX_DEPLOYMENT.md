# 🚀 Remix IDE Deployment Guide for Lexipop Memory NFT

## 📋 Pre-Deployment Checklist

### 1. **Copy the Smart Contract**
- File: `contracts/LexipopMemoryNFT.sol`
- Size: Optimized for gas efficiency
- Features: On-chain SVG generation, Unicode emoji support

### 2. **Required Dependencies**
```solidity
// Add to Remix imports:
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
```

## 🔧 Remix IDE Setup Steps

### Step 1: Open Remix IDE
1. Go to [remix.ethereum.org](https://remix.ethereum.org)
2. Create new workspace or use default

### Step 2: Install Dependencies
1. In File Explorer, create `contracts/` folder
2. Copy `LexipopMemoryNFT.sol` to `contracts/` folder
3. Remix will auto-install OpenZeppelin contracts

### Step 3: Compile Contract
1. Go to "Solidity Compiler" tab
2. Select Solidity version: `^0.8.20`
3. Click "Compile LexipopMemoryNFT.sol"
4. ✅ Should compile without errors

### Step 4: Deploy to Base Network

#### 4a. Connect Wallet
1. Go to "Deploy & Run Transactions" tab
2. Environment: Select "Injected Provider - MetaMask"
3. Connect your MetaMask wallet
4. **Switch to Base Network**:
   - Network Name: Base
   - RPC URL: `https://mainnet.base.org`
   - Chain ID: `8453`
   - Currency: ETH
   - Block Explorer: `https://basescan.org`

#### 4b. Deploy Contract
1. Select contract: `LexipopMemoryNFT`
2. No constructor arguments needed
3. Click "Deploy"
4. Confirm transaction in MetaMask

## 📝 Post-Deployment Steps

### 1. **Verify Contract on BaseScan**
1. Copy deployed contract address
2. Go to [basescan.org](https://basescan.org)
3. Search for your contract
4. Click "Verify and Publish"
5. Use these settings:
   - Compiler: v0.8.20
   - License: MIT
   - Optimization: Enabled (200 runs)

### 2. **Update Frontend Configuration**
Add your deployed address to `src/lib/nft/contract.ts`:
```typescript
export const CONTRACT_ADDRESSES = {
  // Base Mainnet
  8453: 'YOUR_DEPLOYED_ADDRESS_HERE',
  // Base Sepolia Testnet
  84532: ''
} as const;
```

### 3. **Test NFT Minting**
1. Complete a Lexipop game
2. Click "Mint Memory NFT"
3. Confirm transaction
4. Check BaseScan for your minted NFT!

## 🧪 Testing on Base Sepolia (Recommended First)

For testing, deploy to Base Sepolia testnet first:
- Network Name: Base Sepolia
- RPC URL: `https://sepolia.base.org`
- Chain ID: `84532`
- Currency: ETH
- Faucet: [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)

## 🎯 Expected Gas Costs (Base Mainnet)

- **Contract Deployment**: ~2,500,000 gas (~$6-12 USD)
- **NFT Minting**: ~150,000 gas (~$0.04-0.08 USD)
- **SVG Storage**: ~84,000 gas (included in minting)

## ⚡ Quick Deployment Commands

If you prefer command line deployment:
```bash
# Install Hardhat (if not using Remix)
npm install --save-dev hardhat @openzeppelin/contracts

# Deploy script
npx hardhat run scripts/deploy-nft.js --network base-mainnet
```

## 🔍 Verification Commands

```bash
npx hardhat verify --network base-mainnet YOUR_CONTRACT_ADDRESS
```

## 🎉 Success Indicators

✅ Contract deploys without errors
✅ SVG generation works in `tokenURI()`
✅ Minting costs ~$0.04-0.08
✅ NFTs display correctly on OpenSea
✅ Unicode emoji renders properly

## 🆘 Troubleshooting

**Issue**: "Out of gas" during deployment
**Solution**: Increase gas limit to 3,000,000

**Issue**: SVG not rendering
**Solution**: Check Base64 encoding in `tokenURI()`

**Issue**: Emoji not showing
**Solution**: Ensure `&#x1F388;` Unicode format

---

🎈 **Ready to deploy your Lexipop Memory NFTs on Base!**