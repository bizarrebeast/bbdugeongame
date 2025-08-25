# Cursed Power-ups Implementation Plan

## Overview
Adding two cursed power-ups with negative effects, glow particles, and HUD timers.

## Power-up Details

### 1. Cursed Orb
- **Collectible Sprite**: https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/cursed%20orb-rHogWhnYUk2xThrTWajfHqMSfxeyfd.png?0wr6
- **Timer Sprite**: https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/cursed%20orb%20timer-E1IF8Nn8NGfI6l1yrsmD2cPpOel6H9.png?z9aG
- **Effect**: Black overlay for 10 seconds (darkness effect)
- **Color**: #22112d (dark purple)
- **Spawns**: Level 11+
- **Duration**: 10 seconds

### 2. Cursed Teal Orb
- **Collectible Sprite**: https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/cursed%20orb-rHogWhnYUk2xThrTWajfHqMSfxeyfd.png?0wr6
- **Timer Sprite**: https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/cursed%20teal%20orb%20timer-FAoT2eYLkUGfQRCCfS5qwZOkMvFBTg.png?FMZ7
- **Effect**: Reversed controls for 10 seconds (up/down, left/right swapped)
- **Color**: #4ba3a6 (teal)
- **Spawns**: Level 21+
- **Duration**: 10 seconds

## HUD Timer Order
`[Pendant] [Crystal Ball] [Cursed Orb] [Cursed Teal Orb]`

## Implementation Phases

### Phase 1: Core Structure & Assets
1. **Load sprites** in GameScene preloader
2. **Create CursedOrb.ts** collectible class (reusable for both types)
3. **Add power-up state management** to Player.ts:
   - `cursedOrbActive: boolean`
   - `cursedOrbTimer: number`
   - `cursedTealOrbActive: boolean`
   - `cursedTealOrbTimer: number`
   - Both 10-second durations

### Phase 2: Collectible System
1. **Update spawning logic** in GameScene:
   - Cursed Orb: Level 11+ (20% spawn chance)
   - Cursed Teal Orb: Level 21+ (15% spawn chance)
2. **Add collection handling** in Player collision system
3. **Create particle effects** around collectibles with respective colors

### Phase 3: Power-up Effects Implementation
1. **Cursed Orb Effect**:
   - Create black overlay graphics object
   - Show overlay when power-up activates
   - Hide overlay after 10 seconds
   - Reuse existing visibility mask system if possible

2. **Cursed Teal Orb Effect**:
   - Add control reversal flag to Player
   - Modify input handling in Player update method:
     - Up key → Down movement
     - Down key → Up movement  
     - Left key → Right movement
     - Right key → Left movement
   - Reset controls after 10 seconds

### Phase 4: HUD Timer System
1. **Add timer images** to GameScene:
   - `cursedOrbTimerImage`
   - `cursedTealOrbTimerImage`
2. **Update timer positioning**:
   - Calculate spacing for 4 timers total
   - Center the group: `[Pendant] [Crystal Ball] [Cursed Orb] [Cursed Teal Orb]`
3. **Create update methods**:
   - `updateCursedOrbTimer(timeRemaining, maxTime)`
   - `updateCursedTealOrbTimer(timeRemaining, maxTime)`
4. **Add circular countdown overlays** (same as existing system)

### Phase 5: Player Particle Effects
1. **Add cursed particle systems** to Player:
   - Dark purple particles (#22112d) for Cursed Orb
   - Teal particles (#4ba3a6) for Cursed Teal Orb
2. **Create glow effects** around player when cursed power-ups are active
3. **Multiple particle systems** can run simultaneously

### Phase 6: Integration & Testing
1. **Power-up shutdown** when player dies
2. **Collision detection** updates
3. **Timer visibility** (stay visible when expired)
4. **Console debugging** throughout system
5. **Visual polish** and particle timing

## Technical Considerations

### Code Architecture
- **CursedOrb.ts**: Single class, constructor takes type parameter ('cursed' | 'cursedTeal')
- **Player.ts**: Separate state management for each cursed power-up
- **GameScene.ts**: Unified spawning logic with level-based conditions

### Collision System
```typescript
// In GameScene collision setup
this.physics.add.overlap(this.player, cursedOrbGroup, this.handleCursedOrbCollection, null, this)
```

### Control Reversal Implementation
```typescript
// In Player input handling
const reversalActive = this.cursedTealOrbActive
const leftPressed = reversalActive ? this.rightKey.isDown : this.leftKey.isDown
const rightPressed = reversalActive ? this.leftKey.isDown : this.rightKey.isDown
const upPressed = reversalActive ? this.downKey.isDown : this.upKey.isDown  
const downPressed = reversalActive ? this.upKey.isDown : this.downKey.isDown
```

### HUD Timer Layout
```typescript
// Center 4 timers with proper spacing
const timerSpacing = 50
const totalWidth = timerSpacing * 3 // 3 gaps between 4 timers
const startX = screenWidth / 2 - totalWidth / 2

// Position each timer
pendantTimer.x = startX
crystalBallTimer.x = startX + timerSpacing
cursedOrbTimer.x = startX + timerSpacing * 2  
cursedTealOrbTimer.x = startX + timerSpacing * 3
```

## Questions Addressed
- ✅ Both use same collectible sprite (different timer sprites)
- ✅ Both spawn at different levels (11 vs 21)
- ✅ Both have unique effects and colors
- ✅ HUD timer order specified
- ✅ 10-second duration for both
- ✅ Particle/glow effects with specific colors

Ready to implement! 🔮✨