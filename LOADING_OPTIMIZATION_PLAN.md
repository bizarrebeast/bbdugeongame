# Loading Optimization Plan

## Overview
Create a branded LoadingScene with priority-based and lazy loading to eliminate the long black screen between instructions and gameplay.

## Phase 1: LoadingScene Implementation

### Design Requirements
- **Background**: Use game's black background (#000000)
- **Progress Bar**: Teal color (#40e0d0) matching game's ladder/button theme
- **Text**: White text showing "Loading..." and percentage
- **Logo/Title**: "Bizarre Underground" or game logo if available
- **Animation**: Pulsing gem or crystal icon while loading

### Scene Flow
```
InstructionsScene → LoadingScene → GameScene (with Chapter Splash)
```

### LoadingScene Structure
```typescript
class LoadingScene extends Phaser.Scene {
  - Progress bar (teal fill on dark gray background)
  - Percentage text (0% - 100%)
  - Loading message that changes ("Loading sprites...", "Loading sounds...", etc.)
  - Smooth transitions in/out
}
```

## Phase 2: Priority-Based Loading System

### Asset Categories by Priority

#### Priority 1: Critical (Load First - Required for gameplay)
- Player sprites (idle, walk, jump, climb)
- Basic tile textures (floor tiles 1-12)
- Core UI elements (HUD, hearts, gem counter)
- Touch controls (D-pad, buttons)
- Essential sounds (jump, coin collect, player death)

#### Priority 2: Important (Load Second - Common enemies/items)
- Common enemies (blue cat, red cat for early levels)
- Ladders and doors
- Basic collectibles (coins, gems, diamonds)
- Background music
- Common sound effects

#### Priority 3: Level-Specific (Load Third - Based on current level)
- Chapter splash screens (only current chapter)
- Level-specific backgrounds
- Level-specific enemies (green bouncer, BaseBlu, beetles)
- Power-ups for current level range

#### Priority 4: Nice-to-Have (Lazy Load - During gameplay)
- Future chapter splash screens
- Advanced enemy variants
- Rare power-ups
- Alternative backgrounds
- Victory/bonus sounds

## Phase 3: Lazy Loading Implementation

### Strategy
1. **During LoadingScene**: Load Priority 1-3 assets
2. **During Gameplay**: Background load Priority 4 assets
3. **Smart Prefetching**: Load next chapter's assets when player reaches level x8 or x9

### Implementation Details

```typescript
// Asset manifest with priorities
const assetManifest = {
  priority1: [
    { key: 'playerIdle', url: '...', type: 'image' },
    // ... critical assets
  ],
  priority2: [
    // ... important assets
  ],
  priority3: {
    level1to10: [...],
    level11to20: [...],
    // ... level-specific groups
  },
  priority4: [
    // ... lazy-load assets
  ]
}
```

### Loading Progress Calculation
```typescript
- Priority 1: 0-40% of progress bar
- Priority 2: 40-70% of progress bar  
- Priority 3: 70-100% of progress bar
- Priority 4: Hidden background loading
```

## Phase 4: Performance Optimizations

### Techniques
1. **Parallel Loading**: Use Phaser's parallel loading within each priority group
2. **Early Scene Creation**: Start creating GameScene objects while assets load
3. **Texture Atlases**: Consider combining small sprites into atlases (future)
4. **Memory Management**: Unload unused chapter assets when moving to new chapters

### Error Handling
- Implement fallback sprites for failed loads
- Retry mechanism for network failures
- Continue with gameplay even if non-critical assets fail

## Implementation Steps

### Step 1: Create LoadingScene.ts
- Design progress bar and UI
- Implement percentage tracking
- Add smooth fade transitions

### Step 2: Refactor Asset Loading
- Move all load calls from GameScene.preload() to LoadingScene
- Organize assets by priority
- Create asset manifest structure

### Step 3: Implement Priority Loading
- Load assets in priority order
- Update progress bar accurately
- Show contextual loading messages

### Step 4: Add Lazy Loading
- Create background loader for Priority 4 assets
- Implement prefetching logic
- Monitor and queue asset requests

### Step 5: Testing & Optimization
- Measure loading time improvements
- Test on slow connections
- Verify all assets load correctly
- Ensure smooth gameplay during lazy loading

## Success Metrics
- Loading screen appears within 100ms of clicking "Skip All"
- Priority 1-3 assets load in under 5 seconds on average connection
- No gameplay interruption from lazy loading
- Smooth 60fps maintained during background loading

## Future Enhancements
- Add loading screen mini-game or tips
- Implement asset caching in localStorage
- Create sprite atlases for better performance
- Add loading time analytics