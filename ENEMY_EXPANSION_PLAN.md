# 🎮 Bizarre Underground - Enemy Expansion Plan

## Executive Summary
This document outlines a comprehensive plan to expand Bizarre Underground's enemy roster from 7 to 17 unique enemy types, along with implementation strategies and testing approaches.

## Current State Analysis

### Existing Enemy Types (7)
| Enemy | Color | Behavior | Difficulty | Point Value |
|-------|-------|----------|------------|-------------|
| **CATERPILLAR** | Yellow | Slow, erratic movement | 0.5 | 50 |
| **BEETLE** | Red | Rolls, stops to bite | 0.8 | 75 |
| **CHOMPER** | Blue | Patrol with bite animations | 1.0 | 100 |
| **SNAIL** | Red | Fast patrol | 1.5 | 150 |
| **JUMPER** | Green | Bouncing movement | 2.5 | 200 |
| **STALKER** | Red | Hidden mine + chase AI | 4.0 | 300 |
| **BASEBLU** | Blue | Immovable blocker | 2.0 | 1000 |

### System Architecture
- **Enemy Classes**: Separate files (Cat.ts, Beetle.ts, BaseBlu.ts)
- **Spawning System**: EnemySpawningSystem.ts with weighted distribution
- **Level Integration**: 6-tier difficulty progression (Tutorial → Beast Mode)
- **Animation System**: Frame-based animations with state machines
- **Platform Awareness**: Enemies respect platform boundaries

## Proposed New Enemies (10)

### Easy Tier (Levels 1-20)

#### 1. SLUG
- **Appearance**: Green, slimy sprite
- **Movement**: Ultra-slow horizontal patrol (0.3x base speed)
- **Special**: Leaves slippery trail that affects player movement
- **Vulnerability**: Standard jump attack
- **Points**: 25
- **Implementation Effort**: Low (2 hours)

#### 2. WORM
- **Appearance**: Pink segmented sprite
- **Movement**: Standard patrol with periodic burrowing
- **Special**: Invulnerable while underground (3-second cycles)
- **Vulnerability**: Only when above ground
- **Points**: 75
- **Implementation Effort**: Medium (3 hours)

#### 3. FIREFLY
- **Appearance**: Orange glowing sprite
- **Movement**: Sine-wave flight pattern, ignores platforms
- **Special**: Provides light in dark areas
- **Vulnerability**: Standard jump or projectile
- **Points**: 100
- **Implementation Effort**: Low (2 hours)

### Medium Tier (Levels 21-40)

#### 4. SPIDER
- **Appearance**: Purple eight-legged sprite
- **Movement**: Vertical yo-yo on web string
- **Special**: Drops from ceiling, retracts when player near
- **Vulnerability**: Jump when at lowest point
- **Points**: 150
- **Implementation Effort**: Medium (4 hours)

#### 5. HORNET
- **Appearance**: Yellow/black striped flying enemy
- **Movement**: Hover patrol with dive-bomb attacks
- **Special**: Fast diagonal dive when player aligned
- **Vulnerability**: During dive recovery
- **Points**: 175
- **Implementation Effort**: Medium (3 hours)

#### 6. CRAB
- **Appearance**: Orange armored sprite with claws
- **Movement**: Sideways scuttle
- **Special**: Front armor blocks attacks
- **Vulnerability**: Only from behind
- **Points**: 200
- **Implementation Effort**: Medium (4 hours)

### Hard Tier (Levels 41+)

#### 7. PHANTOM
- **Appearance**: Semi-transparent ghostly sprite
- **Movement**: Float through platforms
- **Special**: Phases in/out every 2 seconds
- **Vulnerability**: Only when visible
- **Points**: 250
- **Implementation Effort**: High (5 hours)

#### 8. MIMIC
- **Appearance**: Disguised as treasure chest
- **Movement**: Stationary until triggered, then fast chase
- **Special**: Perfect chest disguise
- **Vulnerability**: Standard after reveal
- **Points**: 500
- **Implementation Effort**: High (5 hours)

#### 9. GUARDIAN
- **Appearance**: Large armored enemy (2x normal size)
- **Movement**: Slow patrol, blocks entire platform
- **Special**: Requires 3 hits to defeat
- **Vulnerability**: Stun with jump, then hit weak spot
- **Points**: 400
- **Implementation Effort**: High (6 hours)

#### 10. SWARM
- **Appearance**: 5-8 tiny enemies moving as group
- **Movement**: Coordinated flock behavior
- **Special**: Reform if not all destroyed quickly
- **Vulnerability**: Area attacks or rapid targeting
- **Points**: 50 per unit
- **Implementation Effort**: Very High (8 hours)

## Implementation Plan

### Phase 1: Foundation (Week 1)
1. **Create base enemy templates**
   - Set up new enemy class files
   - Implement shared behavior interfaces
   - Add to spawning system enum

2. **Asset preparation**
   - Create placeholder sprites
   - Design animation frames
   - Set up texture loading

3. **Testing framework**
   - Implement debug test level
   - Add enemy spawn controls
   - Create parameter tweaking UI

### Phase 2: Core Implementation (Week 2-3)
1. **Easy tier enemies** (Days 1-2)
   - Implement SLUG with trail system
   - Add WORM burrow mechanics
   - Create FIREFLY flight patterns

2. **Medium tier enemies** (Days 3-5)
   - Build SPIDER vertical movement
   - Implement HORNET dive system
   - Add CRAB directional defense

3. **Hard tier enemies** (Days 6-8)
   - Create PHANTOM phasing
   - Build MIMIC disguise system
   - Implement GUARDIAN multi-hit
   - Design SWARM coordination

### Phase 3: Integration (Week 4)
1. **Balance testing**
   - Adjust difficulty scores
   - Tune spawn weights
   - Calibrate point values

2. **Performance optimization**
   - Implement object pooling
   - Optimize collision detection
   - Profile memory usage

3. **Polish**
   - Add death animations
   - Create sound effects
   - Implement particle effects

## Testing Strategy

### Recommended: Debug Test Level
```typescript
// Access with 'T' key in debug mode
class TestScene extends Phaser.Scene {
  - All enemy types on display
  - Individual spawn buttons
  - Speed/parameter controls
  - Invincibility toggle
  - Platform variety for testing
}
```

### Features:
- **Enemy Gallery**: All 17 types spawned on separate platforms
- **Control Panel**: 
  - Spawn specific enemy button
  - Clear all enemies
  - Toggle invincibility
  - Adjust game speed (0.5x, 1x, 2x, 4x)
  - Show hitboxes
- **Test Scenarios**:
  - Multi-enemy interactions
  - Power-up compatibility
  - Performance stress test
  - Edge case validation

### Alternative Testing Approaches:
1. **Level Skip System**: Number keys jump to specific levels
2. **Sandbox Mode**: Free-form enemy spawning and editing
3. **Automated Testing**: Scripted enemy behavior validation

## Technical Specifications

### File Structure
```
src/objects/
├── enemies/
│   ├── Slug.ts
│   ├── Worm.ts
│   ├── Firefly.ts
│   ├── Spider.ts
│   ├── Hornet.ts
│   ├── Crab.ts
│   ├── Phantom.ts
│   ├── Mimic.ts
│   ├── Guardian.ts
│   └── Swarm.ts
```

### Performance Targets
- **Max enemies on screen**: 20
- **Target FPS**: 60 on mid-range devices
- **Memory budget**: < 100MB for enemy assets
- **Collision checks**: O(n) with spatial partitioning

### Compatibility Requirements
- Works with all existing power-ups
- Respects platform boundaries
- Compatible with combo system
- Supports visibility culling

## Spawn Distribution

### Level 1-10 (Tutorial)
- 60% Easy enemies (Slug, Worm, Caterpillar)
- 30% Beetle
- 10% Firefly

### Level 11-20 (Introduction)
- 40% Easy enemies
- 40% Chomper
- 20% Medium enemies (Spider, Hornet)

### Level 21-30 (Challenge)
- 30% Medium enemies
- 40% Snail/Chomper
- 20% Crab
- 10% Jumper

### Level 31-40 (Advanced)
- 40% Hard enemies (Phantom, Guardian)
- 30% Jumper
- 20% Stalker
- 10% Mimic

### Level 41-50 (Expert)
- 35% Stalker
- 30% Hard enemies
- 20% Swarm
- 15% Mixed

### Level 51+ (Beast Mode)
- Equal distribution of all enemy types
- Increased spawn rates
- Multiple enemy combinations

## Risk Mitigation

### Performance Risks
- **Swarm enemies**: Implement object pooling
- **Trail effects**: Limit trail length, use efficient rendering
- **Multiple animations**: Texture atlas optimization

### Gameplay Risks
- **Difficulty spikes**: Extensive playtesting, gradual introduction
- **Enemy clustering**: Improved spacing algorithms
- **Unfair combinations**: Spawn rules to prevent impossible scenarios

### Technical Risks
- **Memory leaks**: Proper cleanup in destroy methods
- **Save compatibility**: Version migration system
- **Mobile performance**: Adaptive quality settings

## Game Systems Integration

### Kill Tracking System
The game tracks individual enemy defeats in `gameStats.enemyKills`:
```typescript
gameStats.enemyKills = {
  caterpillar: 0,
  rollz: 0,  // Beetle
  chomper: 0,
  snail: 0,
  bouncer: 0, // Jumper
  stalker: 0,
  blu: 0      // BaseBlu
  // NEW ENEMIES TO ADD:
  slug: 0,
  worm: 0,
  firefly: 0,
  spider: 0,
  hornet: 0,
  crab: 0,
  phantom: 0,
  mimic: 0,
  guardian: 0,
  swarm: 0
}
```

### Game Over Screen Integration
The game over screen displays detailed statistics that need updating:
1. **Enemy defeat counts** - Add new enemy types to display
2. **Total enemies defeated** - Include new types in total
3. **Point calculations** - Ensure proper scoring
4. **Display formatting** - May need UI adjustments for 17 enemy types

### Combo System
Current combo system triggers on rapid enemy defeats:
- **Implementation needed**: Ensure new enemies trigger combo counter
- **Special cases**: 
  - Swarm enemies might count as multiple hits
  - Guardian multi-hit might trigger special combo
  - Mimic reveal could reset combo timer

### Power-Up Interactions
Test compatibility with existing power-ups:
1. **Invincibility Pendant** - All new enemies must be killable when invincible
2. **Crystal Ball** - Projectiles should damage new enemies
3. **Cursed Orbs** - Speed/behavior modifications
4. **Flash Power-Up** (commented out) - Future visibility considerations

### Collision System
New collision handlers needed for:
```typescript
// Player vs New Enemy collisions
this.physics.add.overlap(this.player, this.slugs, handleSlugCollision)
this.physics.add.overlap(this.player, this.worms, handleWormCollision)
// ... etc for all new enemy types

// Enemy vs Enemy collisions (prevent overlap)
this.physics.add.collider(this.slugs, this.cats)
// ... etc
```

### Visual Feedback Systems
1. **Squish animations** - Standard defeat animation
2. **Special defeat effects** - Guardian break, Phantom fade, etc.
3. **Damage numbers** - Point values displayed on defeat
4. **Particle effects** - Death particles for visual polish

### Audio Integration
Sound effects needed:
- Enemy-specific movement sounds
- Unique defeat sounds per enemy type
- Special ability sounds (burrow, phase, dive, etc.)
- Warning sounds for dangerous enemies

### Level Generation Integration
Update `LevelManager` and floor generation:
- Platform width considerations for Guardian
- Ceiling spawn points for Spider
- Treasure chest positions for Mimic
- Enemy spacing rules to prevent impossible situations

## Success Metrics

### Quantitative
- Frame rate maintains 60 FPS with 20 enemies
- Memory usage under 100MB
- Load time < 3 seconds
- Zero game-breaking bugs
- All enemy kills properly tracked
- Game over stats display correctly

### Qualitative
- Each enemy feels unique and fun
- Clear visual/audio feedback
- Balanced difficulty progression
- Satisfying defeat mechanics
- Smooth integration with existing systems

## Timeline

| Week | Focus | Deliverables |
|------|-------|-------------|
| 1 | Foundation | Test framework, base classes |
| 2 | Easy/Medium enemies | 6 enemies implemented |
| 3 | Hard enemies | 4 enemies implemented |
| 4 | Integration | Balance, polish, optimization |
| 5 | Testing | Bug fixes, final adjustments |

## Next Steps

1. **Approval**: Review and approve enemy designs
2. **Priority**: Select 3-4 enemies for initial implementation
3. **Assets**: Create or commission sprite artwork
4. **Development**: Begin Phase 1 foundation work
5. **Testing**: Set up debug test level

## Appendix

### Enemy Behavior Patterns
```typescript
interface EnemyBehavior {
  movement: 'patrol' | 'flying' | 'stationary' | 'chase'
  attackPattern: 'contact' | 'projectile' | 'area' | 'none'
  specialAbility?: string
  vulnerabilityWindow?: 'always' | 'timed' | 'conditional'
}
```

### Difficulty Scoring Formula
```
difficultyScore = baseScore * speedMultiplier * healthMultiplier * specialAbilityModifier
```

### Memory Optimization Guidelines
- Max texture size: 512x512 per enemy type
- Animation frames: 4-8 per enemy
- Sound effects: < 50KB per enemy
- Particle effects: Shared particle pool

## 📋 COMPREHENSIVE NEW ENEMY IMPLEMENTATION CHECKLIST

When adding a new enemy to Bizarre Underground, use this checklist to ensure complete integration across all game systems. Check off each item as you complete it.

### Phase 1: Core Implementation
#### Enemy Class Setup
- [ ] Create new TypeScript class file in `src/objects/enemies/[EnemyName].ts`
- [ ] Extend appropriate base class (Phaser.Physics.Arcade.Sprite or existing enemy base)
- [ ] Implement constructor with scene, x, y, and platform bounds parameters
- [ ] Set up physics body with appropriate size and offset
- [ ] Configure collision properties (setCollideWorldBounds, setBounce, setGravityY)
- [ ] Set appropriate depth layer (typically 15 for enemies)
- [ ] Implement update() method with delta time handling
- [ ] Add destroy() method with proper cleanup

#### Visual Assets
- [ ] Create/commission sprite artwork (recommended: 32x32 or 48x48)
- [ ] Create animation frames if needed (idle, move, attack, death)
- [ ] Add sprite loading in PreloadScene.ts
- [ ] Verify sprites load correctly in all scenes
- [ ] Set up proper display size with setDisplaySize()
- [ ] Configure sprite flipping for direction changes if needed

#### Movement & Behavior
- [ ] Define base movement speed and patterns
- [ ] Implement platform edge detection and turning
- [ ] Add individual speed variation (0.9-1.1x multiplier)
- [ ] Apply level-based speed scaling from EnemySpawningSystem
- [ ] Implement special abilities/behaviors as defined
- [ ] Add state machine if complex behaviors needed
- [ ] Test movement across different platform configurations

### Phase 2: System Integration
#### Enemy Spawning System
- [ ] Add new enemy to `EnemyType` enum in EnemySpawningSystem.ts
- [ ] Create `EnemyDefinition` entry with:
  - [ ] type (matches enum)
  - [ ] color (for identification)
  - [ ] difficultyScore (0.5-4.0 range)
  - [ ] speed multiplier (0.25-1.5x)
  - [ ] pointValue (25-1000 points)
  - [ ] description (brief behavior summary)
- [ ] Add spawn weights to all tier configurations:
  - [ ] tutorial_early (levels 1-3)
  - [ ] tutorial_late (levels 4-10)
  - [ ] basic (levels 11-20)
  - [ ] speed (levels 21-30)
  - [ ] advanced (levels 31-40)
  - [ ] expert (levels 41-50)
  - [ ] beast (levels 51+)
- [ ] Add special spawn checking method if needed (like isStalkerType())
- [ ] Update selectEnemiesForFloor() logic if special rules apply
- [ ] Set max per floor limits if restricted (like BaseBlu)

#### GameScene Integration
- [ ] Create enemy group in GameScene: `this.[enemyName]s: Phaser.Physics.Arcade.Group`
- [ ] Initialize group in create() method
- [ ] Add enemy spawning logic in floor generation
- [ ] Configure spawn positioning (zones, edges, special placement)
- [ ] Add to resetLevel() cleanup
- [ ] Add to pauseAllEnemies() and resumeAllEnemies()
- [ ] Implement in update() loop for animation/behavior updates

#### Collision System
- [ ] Add platform collisions: `this.physics.add.collider(this.[enemyName]s, this.platforms)`
- [ ] Add spike collisions if enemy walks on spikes
- [ ] Add player overlap detection for damage
- [ ] Add player collision for jumping on enemy
- [ ] Handle invincibility interactions
- [ ] Add enemy-to-enemy collisions if needed
- [ ] Configure special collision behaviors (stunning, bouncing, etc.)
- [ ] Test collision boxes with debug mode

### Phase 3: Combat & Scoring
#### Player Interactions
- [ ] Implement damage to player on contact
- [ ] Add jump-kill detection and scoring
- [ ] Handle invincibility pendant interactions
- [ ] Support Crystal Ball projectile damage
- [ ] Implement combo system integration
- [ ] Add special defeat conditions if applicable
- [ ] Create death/squish animation
- [ ] Add particle effects on defeat

#### Kill Tracking
- [ ] Add enemy type to `gameStats.enemyKills` object
- [ ] Implement kill increment in defeat handler
- [ ] Add to game over statistics display
- [ ] Update stats formatting if needed for 17+ enemies
- [ ] Test kill counting accuracy
- [ ] Verify stats persist across deaths

#### Audio Integration
- [ ] Add movement sound effects
- [ ] Create unique defeat sound
- [ ] Add special ability sounds
- [ ] Implement warning sounds if dangerous
- [ ] Configure volume levels
- [ ] Test audio across all enemy states

### Phase 4: Testing & Debug
#### Test Scene Integration
- [ ] Add enemy to TestScene.ts if it exists
- [ ] Create spawn button in debug controls
- [ ] Add to "spawn all enemies" function
- [ ] Include in stress test scenarios
- [ ] Add parameter adjustment controls
- [ ] Verify hitbox display in debug mode
- [ ] Test with speed multipliers (0.5x, 1x, 2x, 4x)

#### Debug Features
- [ ] Add debug key for instant spawn (if applicable)
- [ ] Include in performance profiling
- [ ] Add to memory usage monitoring
- [ ] Create specific test scenarios
- [ ] Document any known issues
- [ ] Add console logging for development (remove for production)

### Phase 5: Documentation & Polish
#### Documentation Updates
- [ ] Update ENEMY_COMPREHENSIVE_GUIDE.md with:
  - [ ] Complete enemy stats
  - [ ] Movement patterns
  - [ ] Spawn distribution
  - [ ] Special mechanics
- [ ] Add to README.md enemy list
- [ ] Update GAMEPLAN.md if significant feature
- [ ] Document in relevant sprint files
- [ ] Add to visual assets checklist if new sprites

#### Instructions Scene
- [ ] Add enemy sprite to instructions display
- [ ] Write enemy description text
- [ ] Include point value
- [ ] Explain special mechanics
- [ ] Add to appropriate category section
- [ ] Test instructions scroll with new content

### Phase 6: Quality Assurance
#### Gameplay Testing
- [ ] Test spawn rates across all level tiers
- [ ] Verify difficulty progression feels balanced
- [ ] Check enemy doesn't break on edge cases:
  - [ ] Narrow platforms
  - [ ] Near ladders
  - [ ] Platform gaps
  - [ ] With treasure chests
  - [ ] Multiple enemies clustered
- [ ] Confirm proper behavior during:
  - [ ] Level transitions
  - [ ] Player death/respawn
  - [ ] Pause/resume
  - [ ] Power-up states
- [ ] Test on minimum floor width (tutorial levels)
- [ ] Test on maximum floor width (later levels)

#### Performance Testing
- [ ] Profile with 20+ enemies on screen
- [ ] Check memory usage with enemy pooling
- [ ] Verify 60 FPS maintained
- [ ] Test on mobile devices
- [ ] Monitor for memory leaks
- [ ] Optimize animation updates if needed

#### Compatibility Testing
- [ ] Works with all existing power-ups:
  - [ ] Invincibility Pendant
  - [ ] Crystal Ball
  - [ ] Cursed Orb (darkness)
  - [ ] Cursed Teal Orb (reversed controls)
- [ ] Compatible with combo system
- [ ] Respects pause state
- [ ] Saves/loads correctly (if applicable)
- [ ] Works in all game modes

### Phase 7: Final Verification
#### Pre-Release Checklist
- [ ] Remove all development console.log statements
- [ ] Verify no placeholder graphics remain
- [ ] Confirm all sounds implemented
- [ ] Test complete gameplay loop
- [ ] Check enemy appears in correct levels
- [ ] Validate point values are balanced
- [ ] Ensure no regression in existing enemies
- [ ] Update version documentation

#### Sign-off Requirements
- [ ] Code review completed
- [ ] Playtesting feedback incorporated
- [ ] Performance benchmarks met
- [ ] No critical bugs remaining
- [ ] Documentation complete
- [ ] Assets finalized
- [ ] Ready for production

### Special Considerations by Enemy Type

#### If Flying Enemy:
- [ ] Ignore platform collisions
- [ ] Implement flight path/pattern
- [ ] Add vertical bounds checking
- [ ] Consider ladder interactions

#### If Multi-Hit Enemy:
- [ ] Track health/hit points
- [ ] Show damage feedback
- [ ] Implement invulnerability frames
- [ ] Add health bar if needed

#### If Spawning/Summoning Enemy:
- [ ] Implement spawn limits
- [ ] Add cleanup for spawned entities
- [ ] Track parent-child relationships
- [ ] Handle cascade deaths

#### If Disguised Enemy (like Mimic):
- [ ] Create disguised state sprites
- [ ] Implement reveal trigger
- [ ] Add surprise factor delay
- [ ] Differentiate from real objects

#### If Boss/Mini-Boss:
- [ ] Add health bar UI
- [ ] Create phase transitions
- [ ] Implement special attacks
- [ ] Add victory celebration
- [ ] Consider checkpoint system

### Common Pitfalls to Avoid
1. **Don't forget to add to all spawn weight tiers** - Enemy won't appear if missing
2. **Always test with speed multipliers** - Ensures scaling works correctly
3. **Check memory cleanup in destroy()** - Prevents memory leaks
4. **Verify collision boxes match visuals** - Use debug mode to check
5. **Test edge detection on narrow platforms** - Common source of bugs
6. **Don't hardcode point values** - Use EnemySpawningSystem.getPointValue()
7. **Remember mobile touch controls** - Test enemy is beatable on mobile
8. **Update kill tracking immediately** - Don't batch or delay increments

---

*Document Version: 2.0*  
*Last Updated: August 2025*  
*Author: Bizarre Underground Development Team*
*Checklist Added: August 31, 2025*