# Crystal Ball Power-up Implementation Plan

## Overview
A new time-limited power-up that allows the player to shoot bouncing crystal ball projectiles to defeat enemies from a distance. The power-up lasts 10 seconds and features a green glow effect with floating particles.

## Visual Assets
- **Collectible Sprite**: `crystal ball collectible` - The pickup item
- **Projectile Sprite**: `crystal ball projectile` - The fired projectile
- **Timer Icon**: `crystal ball timer` - HUD timer display icon
- **Glow Color**: `#44d0a7` (soft green)
- **Particle Effect**: Green pixels floating around player when active

## Spawn System

### Distribution Rules
- **Availability**: Spawns starting from Level 6 onwards
- **Frequency**: One crystal ball per level maximum
- **Position**: Random safe position on any floor (not near enemies)
- **Persistence**: Remains until collected or level completed

### Collection Behavior
- Player walks into crystal ball to collect
- Activates 10-second timer immediately
- If already active, timer resets to full 10 seconds
- Collection triggers green particle effect around player
- Unique collection sound (to be added)

## Power-up Mechanics

### Duration & Timer
- **Duration**: 10 seconds from collection
- **Timer Display**: Circular countdown in HUD next to pendant timer
- **Timer Reset**: Collecting another crystal ball resets to 10 seconds
- **Visual Indicator**: Green glowing particles around player while active

### Controls
**Desktop:**
- Q key - Fire crystal ball
- E key - Fire crystal ball  
- Yellow action button (if implemented)

**Mobile:**
- Yellow action button (touch area) - Fire crystal ball
- Jump button remains for jumping only

### Firing Restrictions
- Cannot fire while climbing ladders
- Can fire while running, jumping, or standing
- No cooldown between shots (rapid fire allowed)

## Projectile Behavior

### Launch Properties
- **Direction**: Fires in player's facing direction (left/right)
- **Initial Velocity**: Faster than player run speed (ensure it travels ahead)
- **Launch Angle**: Slight upward arc (not perfectly horizontal)
- **Spawn Point**: Center of player sprite

### Bouncing Physics
- **Bounce Count**: Maximum 3 bounces before auto-burst
- **Bounce Height**: Consistent 32 pixels off the ground
- **Bounce Surface**: Only bounces off floors/platforms
- **Gravity**: Slight gravity affects trajectory between bounces
- **Elasticity**: Maintains horizontal momentum through bounces

### Collision & Burst
- **Enemy Hit**: Instantly defeats enemy and bursts on contact
- **Wall Hit**: Bursts immediately on wall contact
- **Max Distance**: Travels up to 5 floor tiles horizontally
- **Auto-Burst**: After 3 bounces or max distance reached
- **Collectibles**: Passes through other collectibles without interaction

### Scoring
- Enemy defeats via crystal ball: Same points as jump kills
- No combo multiplier interference
- Standard enemy point values apply

## HUD Integration

### Timer Positioning
1. Move pendant timer to the right
2. Position crystal ball timer to the left of pendant timer
3. Center both timers as a group under the score display
4. Both timers use circular countdown visualization

### Timer Display
- Green circular timer with crystal ball icon
- Smooth countdown animation over 10 seconds
- Flashes when 2 seconds remain
- Disappears when power-up expires

## Visual Effects

### Active State
- Green glowing particles orbit around player
- Particles use color `#44d0a7`
- Same particle style as pendant power-up
- Particles disappear when timer expires

### Projectile Trail
- Subtle green trail behind flying crystal ball
- Burst animation on impact/expiration
- Small particle explosion effect

## Implementation Steps

### Phase 1: Core Systems
1. Create `CrystalBall.ts` collectible class
2. Add spawn logic to `GameScene.ts` (level 6+)
3. Implement collection and timer system
4. Add power-up state to `Player.ts`

### Phase 2: Projectile System
1. Create `CrystalBallProjectile.ts` class
2. Implement bouncing physics
3. Add collision detection with enemies
4. Create burst animation system

### Phase 3: Controls & Input
1. Add Q/E key bindings for desktop
2. Implement yellow action button for mobile
3. Add firing restrictions (no ladder firing)
4. Test rapid fire capability

### Phase 4: HUD Updates
1. Reorganize timer positioning
2. Create crystal ball timer component
3. Implement countdown visualization
4. Add timer reset logic

### Phase 5: Visual Polish
1. Add green particle system to player
2. Create projectile trail effect
3. Implement burst animations
4. Add glow effects to collectible

### Phase 6: Audio Integration
1. Add collection sound hook
2. Add firing sound hook
3. Add burst sound hook
4. Add timer warning sound (2 seconds left)

## Code Architecture

### New Classes
```typescript
// CrystalBall.ts - Collectible item
class CrystalBall {
  sprite: Phaser.GameObjects.Sprite
  glowEffect: Phaser.GameObjects.Graphics
  particles: Phaser.GameObjects.Particles
}

// CrystalBallProjectile.ts - Fired projectile
class CrystalBallProjectile {
  sprite: Phaser.GameObjects.Sprite
  velocity: Phaser.Math.Vector2
  bounceCount: number
  maxBounces: number = 3
  distanceTraveled: number
}

// CrystalBallTimer.ts - HUD timer component
class CrystalBallTimer {
  container: Phaser.GameObjects.Container
  timerGraphic: Phaser.GameObjects.Graphics
  icon: Phaser.GameObjects.Image
  timeRemaining: number
}
```

### Player.ts Modifications
```typescript
// Add to Player class
private crystalBallActive: boolean = false
private crystalBallTimer: number = 0
private crystalBallParticles: Phaser.GameObjects.Particles

public activateCrystalBall(): void
public fireCrystalBall(): void
private updateCrystalBallTimer(delta: number): void
```

### GameScene.ts Modifications
```typescript
// Add to GameScene
private crystalBalls: CrystalBall[] = []
private projectiles: CrystalBallProjectile[] = []
private crystalBallTimer: CrystalBallTimer

private spawnCrystalBall(floor: number): void
private handleCrystalBallCollection(crystalBall: CrystalBall): void
private updateProjectiles(time: number, delta: number): void
```

## Testing Checklist

### Functionality
- [ ] Crystal ball spawns only on levels 6+
- [ ] One crystal ball maximum per level
- [ ] Collection activates 10-second timer
- [ ] Timer resets on subsequent collections
- [ ] Q/E keys fire projectiles on desktop
- [ ] Action button fires on mobile
- [ ] Cannot fire while on ladder
- [ ] Projectile bounces exactly 3 times
- [ ] Bounces maintain 32-pixel height
- [ ] Projectile bursts on wall contact
- [ ] Projectile defeats enemies on contact
- [ ] Projectile travels 5 tiles maximum

### Visuals
- [ ] Green particles appear around player
- [ ] Particles use correct color #44d0a7
- [ ] Timer displays in HUD correctly
- [ ] Both timers centered under score
- [ ] Projectile has trail effect
- [ ] Burst animation plays correctly

### Edge Cases
- [ ] Rapid fire works without crashes
- [ ] Multiple projectiles can exist simultaneously
- [ ] Timer handles level completion correctly
- [ ] Power-up state cleared on game over
- [ ] Projectiles cleaned up on level transition

## Future Enhancements
- Sound effects integration
- Different projectile types
- Power-up combinations
- Upgrade system for longer duration
- Achievement for crystal ball kills

---

**Status**: Ready for Implementation
**Estimated Time**: 8-10 hours
**Priority**: Medium (Enhancement Feature)