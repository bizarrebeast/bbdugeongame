# 🚀 Reown AppKit Setup Instructions for Bizarre Underground dgen1

## Prerequisites

1. **Get your Reown Project ID**:
   - Go to [Reown Dashboard](https://cloud.reown.com)
   - Copy your Project ID

2. **Fix npm permissions** (if needed):
   ```bash
   sudo chown -R $(whoami) ~/.npm
   ```

## Installation Steps

### 1. Install Dependencies

```bash
# Install Reown AppKit and ethers
npm install @reown/appkit @reown/appkit-adapter-ethers ethers

# Install additional dependencies for Vite
npm install --save-dev buffer process
```

### 2. Add Your Project ID

Edit `/src/utils/GamePlatform.ts` and replace `YOUR_REOWN_PROJECT_ID`:

```typescript
// Line 83 - Add your actual project ID
const PROJECT_ID = 'YOUR_ACTUAL_PROJECT_ID_HERE';
```

### 3. Configure Reown Dashboard

In your [Reown Dashboard](https://cloud.reown.com):

1. **Domain Verification**:
   - Add your domain(s) under "Domain" section
   - For local testing, add: `localhost:3001`
   - For production, add: `dgen1.bizarreunderground.com`

2. **Enable Features**:
   - ✅ Analytics (to track wallet connections)
   - ✅ On-Ramp (allow users to buy crypto)
   - ❌ Email/Social (disabled for now)
   - ❌ Swap (not needed for game)

3. **Configure Networks** (optional):
   - Default: Ethereum, Polygon, Arbitrum, Base
   - Add others if needed for your game

## Running the dgen1 Version

### Development Mode

```bash
# Run dgen1 version on port 3001
npm run dev:dgen1

# Game will open at http://localhost:3001
```

### Build for Production

```bash
# Build dgen1 version
npm run build:dgen1

# Output will be in dist-dgen1/
```

### Preview Production Build

```bash
# Preview the built version
npm run preview:dgen1
```

## Testing Wallet Connection

1. **Open the game** at `http://localhost:3001`

2. **Click "Connect" button** in top-right corner
   - Reown modal will appear
   - Choose your wallet (MetaMask, WalletConnect, etc.)
   - Approve connection

3. **Verify connection**:
   - Button should show wallet address (0x1234...5678)
   - Click button again to see account details

4. **Test game features**:
   - Play game and reach game over
   - Score should be saved with wallet address
   - Check localStorage: `bz_walletScores`

## Wallet UI Integration Points

### 1. Main Menu / Splash Screen
```typescript
// In SplashScene.ts or MenuScene.ts
import { addWalletUI } from '../ui/WalletUI';

create() {
  // Add wallet UI to scene
  this.walletUI = addWalletUI(this);
}
```

### 2. Game Scene
```typescript
// In GameScene.ts
import { addWalletUI } from '../ui/WalletUI';

create() {
  // Add wallet UI (optional during gameplay)
  this.walletUI = addWalletUI(this);
  
  // Hide during active gameplay if desired
  this.walletUI.setVisible(false);
}

// Show in pause menu
pauseGame() {
  this.walletUI.setVisible(true);
}
```

### 3. Game Over Screen
```typescript
// When game ends, save score with wallet
async gameOver() {
  const platform = this.registry.get('platform');
  const web3Manager = platform.web3Manager;
  
  if (web3Manager && web3Manager.isConnected()) {
    const scoreData = {
      address: web3Manager.getAddress(),
      score: this.score,
      timestamp: Date.now(),
      level: this.currentLevel,
      enemies: this.enemiesKilled,
      gems: this.gemsCollected
    };
    
    // Save on-chain (when smart contract is ready)
    await web3Manager.saveScoreOnChain(scoreData);
  }
}
```

## Customization Options

### 1. Theme Customization

Edit `Web3Utils.ts` to match your game's style:

```typescript
themeVariables: {
  '--w3m-color-mix': '#2e2348',  // Your game's primary color
  '--w3m-color-mix-strength': 40,
  '--w3m-font-family': '"Press Start 2P", monospace',
  '--w3m-border-radius-master': '4px',
}
```

### 2. Network Configuration

Add/remove networks in `Web3Utils.ts`:

```typescript
import { mainnet, polygon, arbitrum, base, optimism } from '@reown/appkit/networks';

// In createAppKit()
networks: [mainnet, polygon, arbitrum, base, optimism],
```

### 3. Wallet Button Position

Adjust in `WalletUI.ts`:

```typescript
// Change button position (line 28-29)
const x = this.scene.cameras.main.width - 100;  // Right side
const y = 40;  // Top
```

## Troubleshooting

### Issue: "Module not found: @reown/appkit"
**Solution**: Install dependencies:
```bash
npm install @reown/appkit @reown/appkit-adapter-ethers ethers
```

### Issue: "Project ID required"
**Solution**: Add your Reown project ID in `GamePlatform.ts` line 83

### Issue: "Wallet won't connect"
**Solutions**:
1. Check browser has wallet extension (MetaMask, etc.)
2. Verify domain is whitelisted in Reown dashboard
3. Check browser console for errors
4. Try different wallet or browser

### Issue: "Build errors with ethers"
**Solution**: Install polyfills:
```bash
npm install --save-dev buffer process
```

## Smart Contract Integration (Future)

When you have a deployed smart contract:

1. **Add contract address and ABI** to `Web3Utils.ts`
2. **Implement `saveScoreOnChain()`** method
3. **Add leaderboard contract calls**

Example:
```typescript
// In Web3Utils.ts
const CONTRACT_ADDRESS = '0x...your-contract...';
const CONTRACT_ABI = [...]; // Your contract ABI

async saveScoreOnChain(scoreData: ScoreData) {
  const signer = await this.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  
  const tx = await contract.submitScore(
    scoreData.score,
    scoreData.level,
    scoreData.enemies,
    scoreData.gems
  );
  
  await tx.wait();
  return tx.hash;
}
```

## Deployment Checklist

- [ ] Replace `YOUR_REOWN_PROJECT_ID` with actual ID
- [ ] Add production domain to Reown dashboard
- [ ] Test wallet connection locally
- [ ] Build dgen1 version: `npm run build:dgen1`
- [ ] Deploy `dist-dgen1/` to your server
- [ ] Verify wallet connection on production
- [ ] Monitor analytics in Reown dashboard

## Support

- **Reown Docs**: https://docs.reown.com
- **Discord**: Join Reown Discord for support
- **GitHub Issues**: Report bugs in your repo

---

**Note**: The game works perfectly without wallet connection. Web3 features are optional enhancements that add:
- Persistent score tracking per wallet
- Future on-chain leaderboards
- NFT rewards (if implemented)
- Token rewards (if implemented)