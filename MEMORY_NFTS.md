# 🎨 Lexipop Memory NFTs

Free-to-mint NFT collection featuring the words from your Lexipop game sessions.

## ✨ Features

- **Free Minting**: Only pay gas costs (~$0.01 on Base)
- **On-chain SVG**: Fully on-chain generated artwork
- **Dynamic Design**: Color themes based on your score
- **Game Memory**: Stores the 5 words you mastered
- **Streak Tracking**: Shows your daily streak achievement

## 🎨 NFT Design

Each NFT features:
- 🎈 Balloon emoji (top left)
- "Lexipop" branding (top right)
- Your 5 game words (center, vertically stacked)
- Score and streak info (bottom)
- Color-coded background based on performance

### Color Themes
- **Gold**: 500+ points (perfect games)
- **Purple**: 400-499 points
- **Teal**: 300-399 points
- **Green**: 200-299 points
- **Blue**: 100-199 points

## 🏗️ Technical Details

### Smart Contract
- **Name**: Lexipop Memories
- **Symbol**: LEXMEM
- **Network**: Base (Mainnet & Sepolia)
- **Standard**: ERC-721
- **Gas Optimized**: Efficient minting and storage

### Contract Functions
- `mintMemory(words, score, streak)`: Mint a new memory NFT
- `tokenURI(tokenId)`: Get metadata with on-chain SVG
- `getPlayerTokens(player)`: Get all NFTs for a player

### Metadata Attributes
- Score (0-1000+)
- Streak (days)
- Words Count (always 5)
- Perfect Game (Yes/No)
- Timestamp

## 🚀 Deployment

### Prerequisites
```bash
npm install @openzeppelin/contracts
```

### Deploy Script
```bash
npx hardhat run scripts/deploy-nft.js --network base-sepolia
```

### Contract Verification
Contracts are automatically verified on BaseScan after deployment.

## 💡 Usage in Game

1. Complete a Lexipop game
2. See "Mint Memory NFT" section after score display
3. Preview your NFT design
4. Connect wallet (if needed)
5. Click "Mint Free NFT"
6. Pay gas and receive your memory NFT!

## 🔐 Security

- No private keys stored client-side
- Gas-optimized contract functions
- Proper input validation
- Secure random generation for visual elements

## 📱 Integration

The NFT system is fully integrated with:
- Wallet connection (RainbowKit)
- Base network configuration
- Farcaster miniapp context
- Game completion flow
- Streak bonus system

---

*Your vocabulary journey, immortalized on-chain! 🎈*