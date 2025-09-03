# DGEN1 720x720 Alignment & Testing Checklist

## 🎯 Current Issues to Fix
- [ ] Animation offset from game display area
- [ ] Desktop button controls not working
- [ ] Touch controls need testing
- [ ] Canvas/viewport alignment verification

## 📊 Debug Information to Track

### Canvas & Display Metrics
- [ ] Canvas actual size (should be 720x720)
- [ ] Canvas CSS size 
- [ ] Parent container size
- [ ] Window inner dimensions
- [ ] Device pixel ratio
- [ ] Phaser scale manager settings
- [ ] Game bounds vs display bounds

### Input Systems
- [ ] Touch input coordinates
- [ ] Mouse click coordinates
- [ ] Keyboard input status
- [ ] Button hitbox areas
- [ ] Input event propagation

### Animation Alignment
- [ ] Sprite positions vs expected
- [ ] Camera viewport bounds
- [ ] World bounds
- [ ] Physics body positions
- [ ] Render offset calculations

## 🔍 Console Logging Points

### 1. Main Game Initialization (main.dgen1.ts)
- Canvas element dimensions
- Phaser config settings
- Scale manager mode
- Platform detection

### 2. Scene Loading (GameScene.ts)
- Scene dimensions
- Camera bounds
- World bounds
- Player spawn position

### 3. Input Handling (InputManager.ts)
- Touch/click coordinates (raw vs scaled)
- Button states
- Control method detection

### 4. UI Elements (MenuOverlay.ts, GameUI.ts)
- Button positions
- Touch zones
- Click areas
- Overlay dimensions

### 5. Rendering Pipeline
- Camera position
- Viewport calculations
- Transform matrices
- CSS transforms applied

## ✅ Testing Checklist

### Desktop Testing
- [ ] Keyboard arrows work
- [ ] Spacebar/up arrow for jump
- [ ] Mouse clicks on buttons work
- [ ] Button hover states visible
- [ ] ESC key opens menu

### Mobile Testing  
- [ ] Touch controls responsive
- [ ] Virtual buttons work
- [ ] No double-tap zoom
- [ ] No scroll/bounce
- [ ] Proper touch zones

### Display Testing
- [ ] 720x720 canvas maintained
- [ ] No stretching or distortion
- [ ] Centered in viewport
- [ ] Animations align with hitboxes
- [ ] UI elements positioned correctly

### Cross-Browser Testing
- [ ] Chrome/Chromium
- [ ] Safari
- [ ] Firefox
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## 🛠️ Fix Priority Order

1. **Add comprehensive console logging** - Understand what's happening
2. **Fix desktop button controls** - Critical for testing
3. **Align animations with display** - Visual correctness
4. **Verify touch controls** - Mobile support
5. **Test wallet integration** - Web3 features

## 📝 Notes

### Known Issues
- Animation offset suggests coordinate system mismatch
- Desktop buttons might have event listener issues
- Possible scale factor problems between logical and display coordinates

### Potential Solutions
- Check if Phaser resolution setting is affecting coordinates
- Verify event listeners are attached after DOM ready
- Ensure pointer events aren't being blocked by overlays
- Check z-index stacking of UI elements