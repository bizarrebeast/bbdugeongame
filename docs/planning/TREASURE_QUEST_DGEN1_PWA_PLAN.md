# Treasure Quest dGEN1 PWA Build Plan

## Project Overview
**Game Title:** Bizarre Beasts Treasure Quest - dGEN1 Edition  
**Platform:** dGEN1 Handheld Console  
**Build Type:** Progressive Web App (PWA)  
**Resolution:** 720x720 pixels (Square Format)  
**Blockchain:** Base Network  
**Wallet Integration:** Base Minikit SDK  

---

## dGEN1 Platform Requirements

### Hardware Specifications
- **Screen:** 720x720 pixel display
- **Format:** Square aspect ratio (1:1)
- **Input:** Touch screen + physical controls
- **Storage:** Local web storage
- **Network:** WiFi/Cellular for wallet connectivity
- **Browser:** Chromium-based

### Required Integrations
- **Base Minikit SDK** for wallet connectivity (MANDATORY)
- **Local storage** for game saves and progress
- **PWA manifest** for installation
- **Service worker** for offline play

---

## Technical Architecture

### Core Stack
```
Frontend:
├── Phaser 3 (Game Engine)
├── TypeScript (Language)
├── Base Minikit SDK (Wallet Integration)
├── Service Worker (Offline Support)
└── IndexedDB (Local Storage)

Features:
├── PWA Manifest
├── Local Leaderboard System
├── Progress Map System
├── Chapter/Level Tracking
└── Wallet-based Authentication
```

### Resolution Adaptation
```typescript
// Game Configuration for dGEN1
const config = {
    type: Phaser.AUTO,
    width: 720,
    height: 720,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'game-container'
    },
    // Additional config...
}
```

---

## Base Minikit SDK Integration

### Installation & Setup
```bash
npm install @base/minikit-js
```

### Required Features
1. **Wallet Connection**
   - User authentication via Base wallet
   - Address-based player identification
   - Session management

2. **On-chain Features (Optional)**
   - NFT-based achievements
   - Token rewards for completion
   - On-chain leaderboard verification

3. **Smart Wallet Support**
   - Gasless transactions
   - Account abstraction
   - Social recovery

### Implementation Flow
```typescript
// Minikit Integration Example
import { MiniKit } from '@base/minikit-js';

class WalletManager {
    async connectWallet() {
        const minikit = new MiniKit({
            appId: 'YOUR_APP_ID',
            chain: 'base'
        });
        
        const wallet = await minikit.connect();
        return wallet.address;
    }
    
    async saveProgressOnChain(level: number, score: number) {
        // Optional: Save achievements as NFTs
    }
}
```

---

## Progress Map System Design

### Data Structure
```typescript
interface PlayerProgress {
    walletAddress: string;
    lastPlayed: Date;
    totalScore: number;
    chapters: ChapterProgress[];
    achievements: Achievement[];
}

interface ChapterProgress {
    chapterId: number;
    chapterName: string;
    status: 'locked' | 'unlocked' | 'completed';
    levels: LevelProgress[];
    starsEarned: number;
    bestTime: number;
}

interface LevelProgress {
    levelId: number;
    status: 'locked' | 'unlocked' | 'completed';
    highScore: number;
    stars: 0 | 1 | 2 | 3;
    attempts: number;
    firstCompleted: Date;
    bestTime: number;
}
```

### Visual Progress Map
```
Chapter 1: Beach Paradise
├── Level 1-1 ⭐⭐⭐ [Completed]
├── Level 1-2 ⭐⭐☆ [Completed]
├── Level 1-3 ⭐☆☆ [Completed]
├── Level 1-4 [Unlocked]
└── Level 1-5 [Locked]

Chapter 2: Jungle Depths [Locked - Complete Chapter 1]
Chapter 3: Mountain Peak [Locked - Complete Chapter 2]
```

---

## Local Storage Implementation

### Storage Layers
1. **IndexedDB** - Primary storage for game data
2. **LocalStorage** - Quick access settings
3. **SessionStorage** - Temporary game state
4. **Cache API** - Asset caching via Service Worker

### Storage Schema
```typescript
// IndexedDB Structure
const DB_NAME = 'TreasureQuestDGEN1';
const DB_VERSION = 1;

const stores = {
    playerProgress: {
        keyPath: 'walletAddress',
        indexes: ['lastPlayed', 'totalScore']
    },
    leaderboard: {
        keyPath: 'id',
        indexes: ['score', 'walletAddress', 'timestamp']
    },
    achievements: {
        keyPath: 'achievementId',
        indexes: ['walletAddress', 'unlockedDate']
    }
};
```

---

## Leaderboard System

### Architecture
```typescript
interface LeaderboardEntry {
    id: string;
    walletAddress: string;
    playerName?: string; // ENS or custom
    score: number;
    level: number;
    chapter: number;
    timestamp: Date;
    verified: boolean; // For on-chain verification
}

class LocalLeaderboard {
    // Daily, Weekly, All-Time boards
    async addScore(entry: LeaderboardEntry);
    async getTopScores(limit: number, timeframe: string);
    async getPlayerRank(walletAddress: string);
    async syncWithChain(); // Optional Base integration
}
```

### Leaderboard Views
1. **Global** - All players
2. **Chapter** - Per chapter high scores  
3. **Daily/Weekly** - Time-based competitions
4. **Friends** - Connected wallets (via Base)

---

## PWA Configuration

### Manifest.json
```json
{
  "name": "Treasure Quest dGEN1",
  "short_name": "TreasureQuest",
  "description": "Bizarre Beasts Treasure Quest for dGEN1",
  "start_url": "/",
  "display": "fullscreen",
  "orientation": "portrait",
  "theme_color": "#4A90E2",
  "background_color": "#1a1a2e",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-720.png",
      "sizes": "720x720",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["games", "entertainment"],
  "prefer_related_applications": false
}
```

### Service Worker Strategy
```javascript
// sw.js
const CACHE_NAME = 'treasure-quest-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/game.js',
  '/assets/sprites/',
  '/assets/audio/',
  '/assets/maps/'
];

// Cache-first strategy for game assets
// Network-first for API calls
// Offline fallback for wallet features
```

---

## Development Roadmap

### Phase 1: Core Setup (Week 1)
- [ ] Configure 720x720 game viewport
- [ ] Remove Farcade SDK completely
- [ ] Set up PWA manifest and service worker
- [ ] Implement basic local storage system
- [ ] Create dGEN1-specific UI layouts

### Phase 2: Base Integration (Week 1-2)
- [ ] Install and configure Base Minikit SDK
- [ ] Implement wallet connection flow
- [ ] Create wallet-based user authentication
- [ ] Set up wallet address as player ID
- [ ] Test on dGEN1 hardware

### Phase 3: Progress System (Week 2)
- [ ] Design progress map UI for 720x720
- [ ] Implement chapter/level structure
- [ ] Create IndexedDB schema
- [ ] Build save/load functionality
- [ ] Add star rating system

### Phase 4: Leaderboard (Week 3)
- [ ] Design leaderboard UI
- [ ] Implement local leaderboard logic
- [ ] Add score submission system
- [ ] Create leaderboard views (daily/weekly/all-time)
- [ ] Optional: On-chain score verification

### Phase 5: Polish & Optimization (Week 3-4)
- [ ] Optimize for dGEN1 performance
- [ ] Implement offline mode fully
- [ ] Add achievement system
- [ ] Create tutorial for wallet connection
- [ ] Test complete user journey

### Phase 6: Deployment (Week 4)
- [ ] Deploy to IPFS/Vercel
- [ ] Submit to dGEN1 app store
- [ ] Create documentation
- [ ] Set up analytics
- [ ] Launch marketing

---

## UI/UX Adaptations for 720x720

### Layout Considerations
```
┌─────────────────────────┐
│      Header (80px)      │
│  Wallet | Score | Menu  │
├─────────────────────────┤
│                         │
│     Game Canvas         │
│      (560x560)         │
│                         │
├─────────────────────────┤
│    Controls (80px)      │
│  [Jump] [Action] [Menu] │
└─────────────────────────┘
```

### Square Format Optimizations
- Center-focused gameplay
- Radial UI elements
- Circular progress indicators
- Square grid-based levels
- Symmetrical layouts

---

## Technical Requirements

### Dependencies
```json
{
  "dependencies": {
    "phaser": "^3.70.0",
    "@base/minikit-js": "^1.0.0",
    "idb": "^7.1.0",
    "workbox-webpack-plugin": "^7.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "webpack": "^5.88.0",
    "webpack-pwa-manifest": "^4.3.0",
    "copy-webpack-plugin": "^11.0.0"
  }
}
```

### Build Configuration
```javascript
// webpack.config.js
module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'game.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new WebpackPWAManifest({
      // PWA configuration
    }),
    new WorkboxPlugin.GenerateSW({
      // Service worker configuration
    })
  ]
};
```

---

## Testing Strategy

### dGEN1 Specific Tests
1. **Resolution Testing**
   - Exact 720x720 rendering
   - No overflow or scaling issues
   - Touch targets appropriately sized

2. **Wallet Integration**
   - Connection flow
   - Session persistence
   - Disconnect handling
   - Network switching

3. **Storage Tests**
   - Progress saving/loading
   - Leaderboard updates
   - Offline data sync
   - Storage quota management

4. **Performance Benchmarks**
   - 60 FPS target
   - <3 second initial load
   - <500ms scene transitions
   - Memory usage <100MB

---

## Deployment Strategy

### Hosting Options
1. **IPFS** (Decentralized)
   - Permanent hosting
   - Content addressing
   - Censorship resistant

2. **Vercel/Netlify** (Centralized)
   - Easy deployment
   - Built-in analytics
   - Custom domains

3. **Base Network Hosting**
   - On-chain frontend
   - ENS integration
   - Fully decentralized

### dGEN1 App Store Requirements
- App metadata
- Screenshots (720x720)
- Icon (multiple sizes)
- Description
- Wallet integration proof
- Terms of service

---

## Monetization Options

### Web3 Native Models
1. **NFT Season Passes**
   - Unlock new chapters
   - Exclusive content
   - Tradeable passes

2. **Token Rewards**
   - Earn tokens for achievements
   - Spend on power-ups
   - Governance participation

3. **Premium Features**
   - Ad-free experience
   - Bonus levels
   - Cosmetic upgrades

---

## Security Considerations

### Wallet Security
- Never store private keys
- Use Base Minikit for all signing
- Implement session timeouts
- Clear sensitive data on logout

### Game Security
- Validate scores client-side
- Optional on-chain verification
- Rate limiting for submissions
- Anti-cheat mechanisms

---

## Success Metrics

### Launch Goals
- [ ] 1000+ wallet connections (Week 1)
- [ ] 95% crash-free sessions
- [ ] <3 second load time
- [ ] 4.5+ star rating

### KPIs to Track
- Wallet connection rate
- Daily Active Wallets (DAW)
- Level completion rates
- Average session duration
- Leaderboard participation
- Return rate (D1, D7, D30)

---

## Resources & Documentation

### Base/Minikit Resources
- [Base Minikit Documentation](https://docs.base.org/minikit)
- [Base Network Docs](https://docs.base.org)
- [Smart Wallet Integration](https://docs.base.org/smart-wallet)

### dGEN1 Resources
- [dGEN1 Developer Portal](https://dgen1.com/developers)
- [Hardware Specifications](https://dgen1.com/specs)
- [Submission Guidelines](https://dgen1.com/submit)

### PWA Resources
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Worker Cookbook](https://serviceworke.rs/)
- [IndexedDB Best Practices](https://web.dev/indexeddb/)

---

## Budget Estimate

### Development Costs
- Base Minikit Integration: Free
- Hosting (Vercel/Netlify): $0-20/month
- IPFS Pinning: $0-10/month
- Domain (optional): $12/year

### Blockchain Costs
- Base Network gas fees: Variable
- Smart contract deployment: ~$50-100
- NFT minting (if applicable): Variable

**Total Estimated Cost:** $100-200 initial + $30/month ongoing

---

## Next Steps

1. **Set up Base Minikit SDK** and test wallet connection
2. **Create 720x720 viewport** configuration
3. **Design progress map UI** mockups
4. **Implement IndexedDB** storage layer
5. **Deploy test version** to staging environment
6. **Get dGEN1 hardware** for testing

---

*Document Version: 1.0*  
*Last Updated: August 2025*  
*Target Platform: dGEN1*  
*Status: Planning Phase*