# Viewport Black Bar Fix Plan - Production Issue
## Date: 2025-08-31

### Problem Description
Black bars appear at the top and bottom of the game in production, but NOT in:
- Development environment
- Remix platform preview

This suggests a viewport units issue where mobile browsers' dynamic UI elements (address bar, navigation) affect the viewport height.

### Current Configuration Analysis

#### HTML/CSS Setup (index.html)
```css
body {
  min-height: 100dvh;  /* ✅ Already using dvh */
}

.game-frame {
  height: min(1800px, 100dvh);  /* ✅ Already using dvh */
}

#gameCanvas {
  max-height: 100dvh;  /* ✅ Already using dvh */
}
```

#### Phaser Configuration (main.ts)
```javascript
scale: {
  mode: Phaser.Scale.FIT,
  parent: "gameContainer",
  autoCenter: Phaser.Scale.CENTER_BOTH,
}
```

### The Issue

Despite using `dvh` units, black bars still appear. This could be because:

1. **Mixed viewport units**: Some places use `100vw` (line 26) and `100dvh` inconsistently
2. **Canvas object-fit**: Using `object-fit: contain` might create letterboxing
3. **Phaser scale mode**: `FIT` mode preserves aspect ratio but can create bars
4. **Height calculation**: `min(1800px, 100dvh)` might not be optimal

### Solution Options

## Option 1: Consistent Dynamic Viewport Units (RECOMMENDED) ✅
Change ALL viewport units to dynamic versions for consistency.

**Changes needed:**
```css
/* Line 26 - Change vw to dvw */
.game-frame {
  width: min(1000px, 100dvw);  /* Changed from 100vw */
  height: min(1800px, 100dvh);
}

/* Consider removing the min() constraint */
.game-frame {
  width: 100dvw;
  height: 100dvh;
  max-width: 1000px;
  max-height: 1800px;
}
```

## Option 2: Use HEIGHT_CONTROLS_WIDTH Scale Mode
Change Phaser scale mode to fill screen better.

**In main.ts:**
```javascript
scale: {
  mode: Phaser.Scale.HEIGHT_CONTROLS_WIDTH,  // Changed from FIT
  parent: "gameContainer",
  autoCenter: Phaser.Scale.CENTER_BOTH,
}
```

**Pros:** No black bars
**Cons:** Might crop sides on wide screens

## Option 3: Custom Resize Handler
Add dynamic resize handling to adjust canvas size.

**In main.ts:**
```javascript
scale: {
  mode: Phaser.Scale.RESIZE,  // Dynamic resize
  parent: "gameContainer",
  autoCenter: Phaser.Scale.CENTER_BOTH,
  width: '100%',
  height: '100%',
}
```

Then handle resize events in GameScene.

## Option 4: Remove Constraints and Use Full Viewport
Simplify the CSS to use full viewport.

**Updated CSS:**
```css
body {
  margin: 0;
  padding: 0;
  width: 100dvw;
  height: 100dvh;
  background: #000;
  overflow: hidden;
}

.game-frame {
  width: 100dvw;
  height: 100dvh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.game-container {
  width: 100%;
  height: 100%;
}

#gameCanvas {
  width: 100%;
  height: 100%;
  display: block;  /* Add this */
}
```

## Option 5: Fullscreen API Approach
Use true fullscreen for production.

```javascript
// Add fullscreen handler
if (document.fullscreenEnabled) {
  document.getElementById('gameContainer').requestFullscreen();
}
```

---

## Recommended Implementation

### Step 1: Fix Mixed Viewport Units
```html
<!-- index.html -->
<style>
  body {
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100dvw;      /* Add width */
    height: 100dvh;     /* Change from min-height */
    background: #000;
    font-family: "Press Start 2P", system-ui;
    overflow: hidden;
  }
  
  .game-frame {
    position: relative;
    width: min(1000px, 100dvw);   /* Change vw to dvw */
    height: min(1800px, 100dvh);
    aspect-ratio: 5/9;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .game-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  #gameCanvas {
    width: 100%;
    height: 100%;
    max-width: 1000px;
    max-height: 100dvh;
    object-fit: contain;
    display: block;        /* Add display block */
    touch-action: none;    /* Prevent touch scrolling */
  }
</style>
```

### Step 2: Test Different Scale Modes (if Step 1 doesn't work)
```typescript
// main.ts
scale: {
  mode: Phaser.Scale.ENVELOP,  // Try ENVELOP instead of FIT
  parent: "gameContainer",
  autoCenter: Phaser.Scale.CENTER_BOTH,
  resolution: window.devicePixelRatio || 1,
}
```

### Step 3: Add Resize Handler (if needed)
```typescript
// In GameScene.ts create()
this.scale.on('resize', (gameSize: any) => {
  const { width, height } = gameSize;
  this.cameras.main.setViewport(0, 0, width, height);
});
```

---

## Testing Different Viewport Units

### Understanding the Units:
- **vh/vw**: Initial viewport (can be wrong on mobile with dynamic UI)
- **dvh/dvw**: Dynamic viewport (adjusts for mobile browser UI)
- **lvh/lvw**: Large viewport (maximum possible)
- **svh/svw**: Small viewport (minimum with all UI visible)

For games, **dvh/dvw** is usually best as it adjusts dynamically.

---

## Debugging Steps

1. Add this debug code to see actual dimensions:
```javascript
console.log('Viewport:', {
  innerHeight: window.innerHeight,
  innerWidth: window.innerWidth,
  dvh: CSS.supports('height', '100dvh') ? '✅ Supported' : '❌ Not supported',
  clientHeight: document.documentElement.clientHeight,
  screenHeight: screen.height
});
```

2. Check if issue is aspect ratio:
- Game is 450x800 (9:16 ratio)
- If device aspect differs significantly, bars appear

---

## Quick Fix to Try First

Change these three lines in index.html:

1. Line 19: `height: 100dvh;` (remove 'min-')
2. Line 26: `width: min(1000px, 100dvw);` (change vw to dvw)
3. Line 47: Remove `object-fit: contain;` (might be causing letterboxing)

---

## Production-Specific Considerations

Since it works in dev but not production:
1. Check if production build process modifies CSS
2. Verify viewport meta tag is preserved
3. Test on actual devices vs. browser dev tools
4. Check if CDN/hosting adds wrapper elements

---

## Summary

The black bars are likely caused by:
1. **Mixed viewport units** (vw vs dvh)
2. **object-fit: contain** creating letterboxing
3. **min-height vs height** on body

**Immediate fix**: Change all viewport units to `dvw/dvh` consistently and remove `object-fit: contain`.