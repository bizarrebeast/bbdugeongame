# dgen1 PWA Adaptation Plan - Bizarre Underground
## 720x720 Square Format Progressive Web App

---

## 🎯 Project Overview

Convert Bizarre Underground from its current 450x800 portrait format to a 720x720 square format optimized for the dgen1 device as a Progressive Web App (PWA).

### Current Configuration
- **Canvas:** 450x800 (9:16 portrait)
- **Platform:** Remix/Web
- **Controls:** Touch + Keyboard
- **Build:** Single HTML file (~334KB)

### Target Configuration
- **Canvas:** 720x720 (1:1 square)
- **Platform:** PWA for dgen1
- **Controls:** Touch-optimized for square screen
- **Features:** Offline play, installable app

---

## 📐 Layout Adaptation Strategy

### 1. Game Canvas Modification

```typescript
// Current GameSettings.ts
canvas: {
  width: 450,  // Portrait
  height: 800
}

// dgen1 Version
canvas: {
  width: 720,  // Square
  height: 720
}
```

### 2. Viewport Adjustments

**Key Changes Required:**
- **Visible Floors:** Reduce from 12 to ~10 tiles vertically
- **Width Expansion:** Increase from 14 to 22 visible tiles horizontally
- **Camera Bounds:** Adjust to show more horizontal space
- **HUD Repositioning:** Optimize for square layout

### 3. HUD Layout Redesign

**Current HUD (Top Bar):**
- Lives (left)
- Score/Timer (center)  
- Menu (right)

**dgen1 Square Layout:**
```
┌─────────────────────────┐
│ Lives │ Score │ Menu    │  <- Top HUD bar (80px)
├─────────────────────────┤
│                         │
│     GAME VIEWPORT       │  <- More horizontal space
│      (720x560)          │  <- 560px height
│                         │
├─────────────────────────┤
│  D-Pad  │    │  Jump    │  <- Bottom controls (80px)
└─────────────────────────┘
```

---

## 🎮 Control Optimization

### Touch Control Adjustments

**Current Layout (450x800):**
- D-pad: Bottom-left (110, 680)
- Jump: Bottom-right (340, 680)
- Uses 150px diameter controls

**dgen1 Layout (720x720):**
- D-pad: Bottom-left (100, 640)
- Jump: Bottom-right (620, 640)
- Action buttons: Centered if needed
- Slightly smaller controls (120px) for better fit

### Control Code Changes

```typescript
// TouchControls.ts modifications
constructor(scene: Phaser.Scene, isSquareMode: boolean = false) {
  this.scene = scene
  
  if (isSquareMode) {
    // dgen1 square layout
    this.touchpadCenter = { x: 100, y: 640 }
    this.jumpButtonPos = { x: 620, y: 640 }
    this.controlSize = 60 // Smaller radius
  } else {
    // Original portrait layout
    this.touchpadCenter = { x: 110, y: 680 }
    this.jumpButtonPos = { x: 340, y: 680 }
    this.controlSize = 75
  }
}
```

---

## 📱 PWA Implementation

### 1. Web App Manifest

Create `manifest.json`:
```json
{
  "name": "Bizarre Underground",
  "short_name": "BizUnder",
  "description": "Retro arcade climbing adventure",
  "start_url": "/",
  "display": "fullscreen",
  "orientation": "portrait",
  "background_color": "#2e2348",
  "theme_color": "#2e2348",
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
  ]
}
```

### 2. Service Worker

Create `service-worker.js`:
```javascript
const CACHE_NAME = 'bizarre-underground-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.ts',
  // Add all game assets
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

### 3. HTML Updates

```html
<!-- Add to index.html <head> -->
<link rel="manifest" href="/manifest.json">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<link rel="apple-touch-icon" href="/icons/icon-192.png">

<!-- Register service worker -->
<script>
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}
</script>
```

---

## 🎨 Visual Adjustments

### Background Scaling
- Current backgrounds: 450x800
- Need: 720x720 center-cropped or scaled versions
- Solution: Use Phaser's cover scale mode for backgrounds

### Enemy Distribution
- More horizontal space = adjust spawn patterns
- Current: 24 tiles wide level
- dgen1: Can show 22 tiles (better visibility)

### Platform Generation
```typescript
// Adjust floor generation for wider view
private generateFloor(y: number): void {
  const tileWidth = this.isSquareMode ? 22 : 14;
  // Generate platforms across wider area
}
```

---

## 🔧 Implementation Steps

### Phase 1: Core Adaptation (2-3 hours)
1. ✅ Create `GameSettings.dgen1.ts` with 720x720 config
2. ✅ Add mode detection in main.ts
3. ✅ Adjust camera and viewport settings
4. ✅ Update HUD positioning for square layout

### Phase 2: Control Optimization (1-2 hours)
1. ✅ Modify TouchControls for square layout
2. ✅ Adjust control sizes and positions
3. ✅ Test multi-touch on square viewport
4. ✅ Ensure no control overlap with game area

### Phase 3: PWA Features (2-3 hours)
1. ✅ Create manifest.json
2. ✅ Implement service worker
3. ✅ Generate app icons (192x192, 512x512, 720x720)
4. ✅ Add offline caching strategy
5. ✅ Test installation flow

### Phase 4: Visual Polish (1-2 hours)
1. ✅ Adjust background display for square
2. ✅ Optimize enemy spawn distribution
3. ✅ Fine-tune platform generation
4. ✅ Test all 70 backgrounds in square format

### Phase 5: Testing & Optimization (1 hour)
1. ✅ Test on dgen1 device/emulator
2. ✅ Performance profiling at 720x720
3. ✅ Touch response optimization
4. ✅ Battery usage testing

---

## 📊 Technical Specifications

### Build Configuration

```javascript
// vite.config.dgen1.js
export default {
  build: {
    outDir: 'dist-dgen1',
    rollupOptions: {
      output: {
        manualChunks: undefined,
        inlineDynamicImports: true
      }
    }
  },
  define: {
    'DGEN1_MODE': true
  }
}
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev:dgen1": "vite --config vite.config.dgen1.js",
    "build:dgen1": "vite build --config vite.config.dgen1.js",
    "preview:dgen1": "vite preview --config vite.config.dgen1.js"
  }
}
```

---

## 🎯 Expected Outcomes

### Performance Targets
- **Load Time:** < 0.5 seconds
- **FPS:** Stable 30+ FPS
- **Memory:** < 100MB
- **Battery:** 2+ hours gameplay

### User Experience
- **Installation:** One-tap from browser
- **Offline Play:** Full game available offline
- **Touch Controls:** Optimized for 720x720
- **Visual Quality:** No compromise on graphics

---

## 📝 Configuration Toggle

### Simple Mode Switch
```typescript
// main.ts
const isDgen1 = window.location.search.includes('dgen1=true') || 
                window.innerWidth === 720 && window.innerHeight === 720;

const config = {
  width: isDgen1 ? 720 : 450,
  height: isDgen1 ? 720 : 800,
  // ... rest of config
};
```

### URL-Based Testing
- Normal: `http://localhost:3000/`
- dgen1: `http://localhost:3000/?dgen1=true`

---

## 🚀 Deployment Strategy

### Hosting Options
1. **Separate Subdomain:** `dgen1.bizarreunderground.com`
2. **Path-based:** `bizarreunderground.com/dgen1/`
3. **Auto-detect:** Check screen size and serve appropriate version

### CDN Optimization
- Pre-cache all assets
- Gzip compression
- Image optimization for square format

---

## ⏱️ Timeline Estimate

**Total Development Time:** 8-12 hours

- Core Adaptation: 2-3 hours
- Control Optimization: 1-2 hours  
- PWA Implementation: 2-3 hours
- Visual Polish: 1-2 hours
- Testing: 1 hour
- Deployment: 1 hour

---

## 🎮 Testing Checklist

- [ ] Game loads at 720x720
- [ ] Touch controls responsive
- [ ] All enemies spawn correctly
- [ ] Backgrounds display properly
- [ ] HUD elements visible and functional
- [ ] PWA installs successfully
- [ ] Offline mode works
- [ ] Service worker caches assets
- [ ] Performance meets targets
- [ ] No viewport scrolling issues

---

## 📌 Notes

- The game's flexible architecture makes this adaptation straightforward
- Most systems (enemies, collectibles, physics) work unchanged
- Main focus is on viewport, controls, and PWA features
- Square format actually provides better horizontal visibility
- Can maintain all 9 enemy types and 70 backgrounds

---

*This plan ensures Bizarre Underground runs perfectly as a 720x720 PWA on the dgen1 device while maintaining all gameplay features and performance.*