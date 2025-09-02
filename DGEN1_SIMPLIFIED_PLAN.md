# dgen1 Simplified Implementation Plan
## 720x720 Web3 Game with Wallet Integration

---

## 🛡️ Repository Protection Strategy

### Recommended Approach: Feature Branch + Fork

**Option 1: Feature Branch (Recommended)**
```bash
# In main bizarre-underground repo
git checkout -b dgen1-version
git push -u origin dgen1-version

# Keep main branch pristine for Remix
# All dgen1 changes isolated in branch
```

**Option 2: Separate Repository**
```bash
# Clone and create new repo
git clone https://github.com/yourusername/bizarre-underground.git bizarre-underground-dgen1
cd bizarre-underground-dgen1
git remote set-url origin https://github.com/yourusername/bizarre-underground-dgen1.git
git push -u origin main
```

### File Structure Protection
```
bizarre-underground/
├── src/
│   ├── main.ts           (Remix version)
│   ├── main.dgen1.ts     (dgen1 entry point)
│   ├── config/
│   │   ├── GameSettings.ts
│   │   └── GameSettings.dgen1.ts
│   └── utils/
│       ├── RemixUtils.ts (original)
│       └── Web3Utils.ts   (new for dgen1)
├── index.html            (Remix version)
├── index-dgen1.html      (dgen1 version)
├── package.json          (both versions)
└── vite.config.ts        (multi-config)
```

---

## 📦 Remix SDK Removal Plan

### 1. Identify All Remix Dependencies

**Current Remix/Farcade Integration Points:**
```typescript
// Files using Remix SDK:
- src/utils/RemixUtils.ts
- src/main.ts (SDK initialization)
- index.html (SDK script tag)
- package.json (@farcade/game-sdk)
```

**SDK Functions to Replace:**
```javascript
// Current Remix SDK calls
window.Farcade.gameReady()      -> Custom implementation
window.Farcade.gameOver(score)  -> localStorage + wallet
window.Farcade.haptic()         -> navigator.vibrate()
window.Farcade.mute()          -> Internal audio manager
window.Farcade.unmute()        -> Internal audio manager
```

### 2. Create Replacement Functions

**Create `src/utils/GamePlatform.ts`:**
```typescript
export interface GamePlatform {
  ready(): void;
  gameOver(score: number): void;
  haptic(type: string): void;
  mute(): void;
  unmute(): void;
  saveScore(score: number): Promise<void>;
  getHighScore(): Promise<number>;
}

// Remix implementation
export class RemixPlatform implements GamePlatform {
  ready() { window.Farcade?.gameReady(); }
  gameOver(score: number) { window.Farcade?.gameOver(score); }
  haptic(type: string) { window.Farcade?.haptic(type); }
  mute() { window.Farcade?.mute(); }
  unmute() { window.Farcade?.unmute(); }
  async saveScore(score: number) { /* Remix API */ }
  async getHighScore() { /* Remix API */ }
}

// dgen1 implementation
export class Dgen1Platform implements GamePlatform {
  ready() { 
    console.log('Game ready');
    this.connectWallet();
  }
  
  gameOver(score: number) {
    this.saveToLocalStorage(score);
    this.saveToBlockchain(score);
  }
  
  haptic(type: string) {
    if ('vibrate' in navigator) {
      navigator.vibrate(type === 'heavy' ? 100 : 50);
    }
  }
  
  mute() {
    const game = window.game;
    game.sound.mute = true;
    localStorage.setItem('audioMuted', 'true');
  }
  
  unmute() {
    const game = window.game;
    game.sound.mute = false;
    localStorage.setItem('audioMuted', 'false');
  }
  
  async saveScore(score: number) {
    // Save to localStorage
    const scores = JSON.parse(localStorage.getItem('scores') || '[]');
    scores.push({ score, date: Date.now(), wallet: this.walletAddress });
    scores.sort((a, b) => b.score - a.score);
    scores.splice(10); // Keep top 10
    localStorage.setItem('scores', JSON.stringify(scores));
    
    // Optional: Save to blockchain
    if (this.walletConnected) {
      await this.saveToChain(score);
    }
  }
  
  async getHighScore() {
    const scores = JSON.parse(localStorage.getItem('scores') || '[]');
    return scores[0]?.score || 0;
  }
  
  private async connectWallet() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        this.walletAddress = accounts[0];
        this.walletConnected = true;
      } catch (error) {
        console.log('Wallet connection optional:', error);
      }
    }
  }
}
```

### 3. Platform Detection

**Update `src/main.ts`:**
```typescript
import { RemixPlatform, Dgen1Platform } from './utils/GamePlatform';

// Detect platform
const isDgen1 = window.location.hostname.includes('dgen1') || 
                window.location.search.includes('dgen1=true');

// Create appropriate platform handler
const platform = isDgen1 ? new Dgen1Platform() : new RemixPlatform();

// Store in game registry
game.registry.set('platform', platform);

// Use throughout game
const platform = this.registry.get('platform');
platform.gameOver(score);
```

---

## 💾 localStorage Implementation

### Data Structure
```javascript
// localStorage keys for dgen1
const STORAGE_KEYS = {
  HIGH_SCORE: 'bz_highScore',
  SCORES: 'bz_scores',           // Array of top scores
  PLAYER_STATS: 'bz_stats',      // Cumulative stats
  SETTINGS: 'bz_settings',       // Game settings
  ACHIEVEMENTS: 'bz_achievements', // Unlocked achievements
  WALLET: 'bz_wallet',           // Last connected wallet
  SAVE_STATE: 'bz_saveState'     // Game progress
};

// Example save state
const saveState = {
  currentLevel: 1,
  lives: 3,
  score: 0,
  totalGems: 0,
  enemiesDefeated: {},
  timestamp: Date.now()
};
```

### Save System Implementation
```typescript
class SaveManager {
  // Save game progress
  saveProgress(gameScene: GameScene) {
    const state = {
      currentLevel: gameScene.levelManager.getCurrentLevel(),
      lives: gameScene.lives,
      score: gameScene.score + gameScene.accumulatedScore,
      totalGems: gameScene.totalCoinsCollected,
      enemiesDefeated: gameScene.gameStats.enemyKills,
      timestamp: Date.now()
    };
    
    localStorage.setItem(STORAGE_KEYS.SAVE_STATE, JSON.stringify(state));
  }
  
  // Load game progress
  loadProgress(): SaveState | null {
    const saved = localStorage.getItem(STORAGE_KEYS.SAVE_STATE);
    if (!saved) return null;
    
    const state = JSON.parse(saved);
    
    // Check if save is less than 24 hours old
    if (Date.now() - state.timestamp > 24 * 60 * 60 * 1000) {
      return null; // Expired save
    }
    
    return state;
  }
  
  // Clear save
  clearProgress() {
    localStorage.removeItem(STORAGE_KEYS.SAVE_STATE);
  }
}
```

---

## 🎮 Core Implementation Steps

### Phase 1: Repository Setup (1 hour)
```bash
# Create feature branch
git checkout -b dgen1-version

# Create dgen1-specific files
touch index-dgen1.html
touch src/main.dgen1.ts
touch src/config/GameSettings.dgen1.ts
touch src/utils/Web3Utils.ts
touch src/utils/GamePlatform.ts
```

### Phase 2: Remove Remix Dependencies (2 hours)

**1. Create conditional imports:**
```typescript
// main.dgen1.ts - No Remix imports
import { GamePlatform, Dgen1Platform } from "./utils/GamePlatform"
// Remove: import { initializeFarcadeSDK } from "./utils/RemixUtils"

const platform = new Dgen1Platform();
```

**2. Update index-dgen1.html:**
```html
<!-- Remove Farcade SDK -->
<!-- <script src="https://cdn.jsdelivr.net/npm/@farcade/game-sdk@latest/dist/index.min.js"></script> -->

<!-- Add Web3 detection -->
<script>
  window.addEventListener('load', () => {
    if (typeof window.ethereum !== 'undefined') {
      console.log('Web3 wallet detected');
    }
  });
</script>
```

**3. Update package.json:**
```json
{
  "scripts": {
    "dev": "vite",                    // Remix version
    "dev:dgen1": "vite --config vite.config.dgen1.js",
    "build": "node scripts/build.js", // Remix build
    "build:dgen1": "vite build --config vite.config.dgen1.js"
  },
  "devDependencies": {
    "@farcade/game-sdk": "^0.0.13",  // Keep for Remix
    "ethers": "^6.0.0"               // Add for dgen1
  }
}
```

### Phase 3: Canvas & Responsive Design (3 hours)

**GameSettings.dgen1.ts:**
```typescript
export const GameSettings = {
  debug: false,  // Disable debug for production
  
  canvas: {
    width: 720,   // Square format
    height: 720,
  },
  
  game: {
    tileSize: 32,
    floorHeight: 10,  // Reduced for square
    floorWidth: 24,   // Same width
    gravity: 800,
    playerSpeed: 160,
    climbSpeed: 120,
    jumpVelocity: -350,
  },
  
  // HUD positions for square layout
  hud: {
    topBarHeight: 80,    // Standard HUD height
    bottomBarHeight: 80, // Touch controls area
    gameAreaHeight: 560, // Main game viewport (720 - 80 - 80)
  }
};
```

### Phase 4: Wallet Integration (2 hours)

**Web3Utils.ts:**
```typescript
export class Web3Manager {
  private provider: any;
  private signer: any;
  public address: string | null = null;
  
  async connect(): Promise<string | null> {
    if (!window.ethereum) {
      console.log('No Web3 wallet found');
      return null;
    }
    
    try {
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      this.address = accounts[0];
      
      // Set up ethers provider
      const { ethers } = await import('ethers');
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      // Save to localStorage
      localStorage.setItem('bz_wallet', this.address);
      
      return this.address;
    } catch (error) {
      console.error('Wallet connection failed:', error);
      return null;
    }
  }
  
  async disconnect() {
    this.address = null;
    this.provider = null;
    this.signer = null;
    localStorage.removeItem('bz_wallet');
  }
  
  // Optional: Save score on-chain
  async saveScoreOnChain(score: number) {
    if (!this.signer) return;
    
    // Implementation depends on smart contract
    // This is just a placeholder
    console.log('Would save score on-chain:', score);
  }
}
```

### Phase 5: localStorage Features (2 hours)

**Enhanced Save Features:**
```typescript
class Dgen1SaveSystem {
  // Save best runs
  saveBestRun(runData: RunData) {
    const runs = this.getBestRuns();
    runs.push(runData);
    runs.sort((a, b) => b.score - a.score);
    runs.splice(5); // Keep top 5
    localStorage.setItem('bz_bestRuns', JSON.stringify(runs));
  }
  
  // Achievement system
  unlockAchievement(id: string) {
    const achievements = this.getAchievements();
    if (!achievements.includes(id)) {
      achievements.push(id);
      localStorage.setItem('bz_achievements', JSON.stringify(achievements));
      this.showAchievementPopup(id);
    }
  }
  
  // Statistics tracking
  updateStats(stats: GameStats) {
    const saved = localStorage.getItem('bz_stats');
    const current = saved ? JSON.parse(saved) : {};
    
    // Merge stats
    current.totalScore = (current.totalScore || 0) + stats.score;
    current.totalEnemies = (current.totalEnemies || 0) + stats.enemiesKilled;
    current.totalGems = (current.totalGems || 0) + stats.gemsCollected;
    current.gamesPlayed = (current.gamesPlayed || 0) + 1;
    current.bestScore = Math.max(current.bestScore || 0, stats.score);
    
    localStorage.setItem('bz_stats', JSON.stringify(current));
  }
}
```

---

## 🚀 Build Configuration

### vite.config.dgen1.js
```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: '/',
  build: {
    outDir: 'dist-dgen1',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'index-dgen1.html'
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    minify: 'esbuild',
    target: 'esnext'
  },
  define: {
    'DGEN1_BUILD': JSON.stringify(true),
    'REMIX_BUILD': JSON.stringify(false)
  },
  server: {
    port: 3001,
    host: true
  }
});
```

---

## 📋 Implementation Checklist

### Week 1: Foundation (8-10 hours)
- [ ] Create dgen1 feature branch
- [ ] Set up dual build system
- [ ] Create GamePlatform abstraction
- [ ] Remove Remix SDK dependencies
- [ ] Implement localStorage save system
- [ ] Create 720x720 canvas configuration
- [ ] Adjust HUD for square layout
- [ ] Update touch controls positioning

### Week 2: Features (6-8 hours)
- [ ] Implement Web3 wallet connection
- [ ] Add wallet UI elements
- [ ] Create achievement system
- [ ] Build statistics tracking
- [ ] Add save/load game state
- [ ] Implement leaderboard
- [ ] Test on 720x720 viewport
- [ ] Performance optimization

### Testing Phase (2-3 hours)
- [ ] Test wallet connection
- [ ] Verify localStorage persistence
- [ ] Check 720x720 responsiveness
- [ ] Test touch controls
- [ ] Validate save/load system
- [ ] Performance profiling
- [ ] Cross-browser testing

---

## 🔀 Deployment Strategy

### Dual Deployment
```bash
# Build both versions
npm run build        # Remix version -> dist/
npm run build:dgen1  # dgen1 version -> dist-dgen1/

# Deploy to different URLs
# remix.bizarreunderground.com (existing)
# dgen1.bizarreunderground.com (new)
```

### Environment Detection
```javascript
// Auto-detect which version to load
if (window.location.hostname.includes('dgen1')) {
  // Load dgen1 version
  window.location.href = '/index-dgen1.html';
} else if (window.location.hostname.includes('remix')) {
  // Load Remix version
  window.location.href = '/index.html';
}
```

---

## 🎯 Summary

### Total Timeline: 16-21 hours

**Core Work:**
1. Repository setup & protection: 1 hour
2. Remix SDK removal: 2 hours
3. Canvas/responsive design: 3 hours
4. Wallet integration: 2 hours
5. localStorage implementation: 2 hours
6. Testing & debugging: 2-3 hours

**Additional Features:**
- Achievement system: 2 hours
- Statistics tracking: 1 hour
- Leaderboard: 2 hours
- Save/load system: 2 hours

### Key Benefits of This Approach:
1. **Protected main branch** - Remix version untouched
2. **Clean separation** - No SDK conflicts
3. **Enhanced features** - localStorage enables saves
4. **Web3 ready** - Wallet integration included
5. **Future-proof** - Easy to maintain both versions

### Recommended Next Steps:
1. Create `dgen1-version` branch
2. Copy core files with .dgen1 suffix
3. Remove Remix SDK from dgen1 files
4. Implement GamePlatform abstraction
5. Add wallet connection
6. Test at 720x720
7. Deploy to staging

---

*This plan ensures complete separation between Remix and dgen1 versions while adding enhanced features like save states, achievements, and Web3 integration.*