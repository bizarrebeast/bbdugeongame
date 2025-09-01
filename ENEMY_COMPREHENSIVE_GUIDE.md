# Comprehensive Enemy Guide - Treasure Quest

## Complete Enemy Roster with Movement, Scoring, and Distribution

### 1. **Caterpillar (Yellow)**
- **Points**: 50
- **Speed**: 0.6x (48 units/sec)
- **Difficulty Score**: 0.5
- **Movement Pattern**: 
  - Slow random movement
  - Changes direction randomly
  - Unpredictable but slow
- **Visual**: Yellow caterpillar sprite with mouth/eye animations
- **Spawn Distribution** (6-Tier System):
  - Tutorial (1-10): 50-35%
  - Basic (11-20): 15%
  - Speed+ (21-50): 0%
  - BEAST (51+): 5%

### 2. **Blue Caterpillar (Variant)**
- **Points**: 50
- **Speed**: 0.7x (56 units/sec)
- **Difficulty Score**: 0.7
- **Movement Pattern**: 
  - More predictable than yellow caterpillar
  - Changes direction less frequently
  - Longer intervals between direction changes
- **Visual**: Blue caterpillar sprite with eye movement animations
- **Spawn Distribution** (6-Tier System):
  - Tutorial (1-10): 20-15%
  - Basic (11-20): 10%
  - Speed+ (21-50): 0%
  - BEAST (51+): 5%

### 3. **Beetle**
- **Points**: 75
- **Speed**: 1.0x (80 units/sec)
- **Difficulty Score**: 0.8
- **Movement Pattern**:
  - Simple back-and-forth patrol
  - Reverses at platform edges (10px buffer)
  - Can reverse when hitting another beetle
  - Most predictable enemy
- **Visual**: Red rectangle placeholder (20x16) - needs sprite
- **Spawn Distribution** (6-Tier System):
  - Tutorial (1-10): 30%
  - Basic (11-20): 20%
  - Speed+ (21-50): 0%
  - BEAST (51+): 5%

### 4. **Chomper (Blue Cat)**
- **Points**: 100
- **Speed**: 1.0x (80 units/sec)
- **Difficulty Score**: 1.0
- **Movement Pattern**:
  - Standard left-right patrol
  - Consistent speed
  - Bite animations while moving
- **Visual**: Blue cat sprite with bite animations
- **Spawn Distribution** (6-Tier System):
  - Tutorial (1-10): 0%
  - Basic (11-20): 50%
  - Speed (21-30): 35%
  - Advanced+ (31-50): 2.5%
  - BEAST (51+): 15%

### 5. **Snail (Red Cat)**
- **Points**: 150
- **Speed**: 1.2x (96 units/sec)
- **Difficulty Score**: 1.5
- **Movement Pattern**:
  - Faster patrol movement
  - Similar to Chomper but 20% faster
  - More dangerous due to speed
- **Visual**: Red cat sprite with animations
- **Spawn Distribution** (6-Tier System):
  - Tutorial (1-10): 0%
  - Basic (11-20): 0%
  - Speed (21-30): 50%
  - Advanced (31-40): 35%
  - Expert+ (41+): 2.5%
  - BEAST (51+): 15%

### 6. **Jumper (Green Cat)**
- **Points**: 200
- **Speed**: 1.5x (120 units/sec)
- **Difficulty Score**: 2.5
- **Movement Pattern**:
  - Fast bouncing/jumping movement
  - Hardest to predict and hit
  - Covers ground quickly
- **Visual**: Green cat sprite with jump animations
- **Spawn Distribution** (6-Tier System):
  - Tutorial (1-10): 0%
  - Basic (11-20): 0%
  - Speed (21-30): 0%
  - Advanced (31-40): 40%
  - Expert (41-50): 30%
  - BEAST (51+): 20%

### 7. **Stalker (Red Cat Variant)**
- **Points**: 300
- **Speed**: 1.5x+ (120+ units/sec, increases during chase)
- **Difficulty Score**: 4.0
- **Movement Pattern**:
  - Starts hidden (mine-like state)
  - Activates when player passes within 32px
  - 3-second activation delay
  - Chases player with increasing speed
  - 4-second persistent chase timer
  - Most dangerous regular enemy
- **Visual**: Red cat sprite with special eye animations
- **Spawn Distribution** (6-Tier System):
  - Tutorial (1-10): 0%
  - Basic (11-20): 0%
  - Speed (21-30): 0%
  - Advanced (31-40): 12.5%
  - Expert (41-50): 35%
  - BEAST (51+): 20%

### 8. **BaseBlu (Blue Blocker)**
- **Points**: 1000 (only when invincible)
- **Speed**: 0.25x (20 units/sec - very slow)
- **Difficulty Score**: 2.0
- **Movement Pattern**:
  - Extremely slow patrol
  - Acts as moving obstacle/wall
  - Cannot be killed by jumping (provides bounce)
  - Stuns on side collision (2 seconds)
  - Only killable when player is invincible
- **Visual**: Blue sprite with animated eyes (blinking, rolling)
- **Special Features**:
  - Immovable physics body (mass: 10000)
  - Complex eye animation system
  - 9 different eye positions + blinking
  - Eye rolling sequences
- **Spawn Distribution** (6-Tier System):
  - Tutorial (1-10): 0%
  - Basic (11-20): 0%
  - Speed (21-30): 15%
  - Advanced (31-40): 12.5%
  - Expert (41-50): 25%
  - BEAST (51+): 15%

## 6-Tier Progressive System

**Enemy Count per Floor** (capped at 5 for balanced difficulty):
- **Tutorial (1-10)**: 1-2 enemies per floor
- **Basic (11-20)**: 2-3 enemies per floor
- **Speed (21-30)**: 3-4 enemies per floor
- **Advanced (31-40)**: 4-5 enemies per floor (max cap)
- **Expert (41-50)**: 4-5 enemies per floor (max cap)
- **BEAST (51+)**: 4-5 enemies per floor (max cap)

**Speed Scaling**: Progressive speed multiplier from 1.0x (level 1) to 1.25x (level 50+)
**BaseBlu Limits**: Max 0/0/1/2/2/2 per floor for each tier respectively

## 6-Tier Enemy Combinations Examples

### Tutorial Floors (1-10)
- 1-2 enemies: 1-2 Caterpillars or 1 Beetle
- 70% Caterpillar, 30% Beetle spawns
- No advanced enemies

### Speed Tier Floors (21-30) 
- 3-4 enemies: 2 Snails + 1-2 Chompers + possibly 1 BaseBlu
- 50% Snail, 35% Chomper, 15% BaseBlu (max 1 per floor)
- Speed multiplier: ~1.10x

### Expert Floors (41-50)
- 4-5 enemies: Mix of Stalkers, Jumpers, and BaseBlu
- 35% Stalker, 30% Jumper, 25% BaseBlu (max 2 per floor)  
- Speed multiplier: 1.20x-1.25x

### BEAST Mode (51+)
- 4-5 enemies: Balanced chaos mix of all types
- Equal emphasis on variety and challenge
- Speed multiplier: 1.25x (capped)

## Special Spawning Notes

1. **BaseBlu** spawning:
   - Currently spawns separately from difficulty system (needs integration)
   - Should avoid spawning near ladders
   - Best on wider platforms

2. **Stalker** spawning:
   - Requires special initialization with player reference
   - Should have clear activation zones
   - Avoid spawning too close to platform edges

3. **Beetle** spawning:
   - Needs sprite asset creation
   - Good for tutorial levels due to predictability
   - Can create "beetle walls" with multiple beetles

## Recommended Improvements

1. **Vary spawn patterns by floor**:
   - Odd floors: More patrol enemies
   - Even floors: More jumpers/stalkers
   - Every 5th floor: Guaranteed BaseBlu

2. **Dynamic difficulty adjustments**:
   - Reduce difficulty after player death
   - Increase difficulty for skilled players

3. **Special enemy combinations**:
   - "Beetle brigade" - 4-5 beetles in formation
   - "Stalker ambush" - 2 stalkers on opposite sides
   - "BaseBlu gate" - BaseBlu blocking ladder access

## Complete Enemy Addition Checklist

### 1. **Pre-Development Planning**
- [ ] Review available sprite assets
- [ ] Define enemy name and type
- [ ] Determine point value (50-1000 range)
- [ ] Set difficulty score (0.5-4.0 scale)
- [ ] Design movement pattern and behavior
- [ ] Define speed multiplier (0.25x-2.0x of base 80)
- [ ] Plan special abilities/mechanics
- [ ] Determine hitbox dimensions
- [ ] Plan animation states and transitions

### 2. **Asset Preparation**
- [ ] Verify all sprite textures exist
- [ ] List all animation frames needed
- [ ] Define sprite dimensions
- [ ] Plan sprite offset positioning
- [ ] Check for color variations needed
- [ ] Document texture keys

### 3. **Enemy Class Implementation**
- [ ] Create new TypeScript class file in `/src/objects/`
- [ ] Extend `Phaser.Physics.Arcade.Sprite`
- [ ] Implement constructor with platform bounds
- [ ] Set up physics body (size, offset, gravity)
- [ ] Configure collision properties
- [ ] Implement movement pattern in `update()`
- [ ] Add animation system if needed
- [ ] Implement `squish()` method for death
- [ ] Add `reverseDirection()` for collisions
- [ ] Include special abilities/states
- [ ] Add getter methods for properties

### 4. **Integration with Game Systems**
- [ ] Add enemy type to spawn system enums
- [ ] Register in `EnemySpawningSystem.ts`
- [ ] Add to difficulty tier distributions
- [ ] Configure spawn probabilities per level
- [ ] Set max spawn limits per floor
- [ ] Add to anti-clustering logic
- [ ] Update collision groups

### 5. **Scene Integration**
- [ ] Import enemy class in `GameScene.ts`
- [ ] Add to enemy groups/pools
- [ ] Set up collision handlers with player
- [ ] Add collision handlers with other enemies
- [ ] Configure platform collision
- [ ] Add score/point handling
- [ ] Implement kill tracking

### 6. **Level Distribution Setup**
- [ ] Define spawn percentages for Tutorial (1-10)
- [ ] Define spawn percentages for Basic (11-20)
- [ ] Define spawn percentages for Speed (21-30)
- [ ] Define spawn percentages for Advanced (31-40)
- [ ] Define spawn percentages for Expert (41-50)
- [ ] Define spawn percentages for BEAST (51+)
- [ ] Set speed scaling per tier

### 7. **Testing Phase**
- [ ] Create test level with only new enemy
- [ ] Test basic movement patterns
- [ ] Verify collision detection works
- [ ] Test player jump kills
- [ ] Test invincibility interactions
- [ ] Check platform edge behavior
- [ ] Verify animation transitions
- [ ] Test with other enemies present
- [ ] Check spawn distribution

### 8. **Balance & Tuning**
- [ ] Adjust movement speed
- [ ] Fine-tune hitbox size
- [ ] Balance point values
- [ ] Adjust difficulty rating
- [ ] Tweak spawn rates
- [ ] Test at different level tiers
- [ ] Verify anti-clustering works
- [ ] Check performance impact

### 9. **Documentation**
- [ ] Update `ENEMY_COMPREHENSIVE_GUIDE.md`
- [ ] Add to enemy roster table
- [ ] Document movement patterns
- [ ] Update tier distribution tables
- [ ] Add special notes/mechanics
- [ ] Update recommended combinations

### 10. **Final Integration**
- [ ] Merge into main enemy system
- [ ] Test full game progression
- [ ] Verify BEAST mode balance
- [ ] Check mobile performance
- [ ] Test with all power-ups
- [ ] Verify score calculations
- [ ] Final difficulty assessment

## Color Variation Checklist (for existing enemies)

### 1. **Sprite Creation**
- [ ] Identify base enemy for variation
- [ ] Create new color sprite assets
- [ ] Maintain same dimensions as original
- [ ] Keep animation frame consistency

### 2. **Code Updates**
- [ ] Add new color to `CatColor` enum (if applicable)
- [ ] Update texture loading logic
- [ ] Modify spawn selection logic
- [ ] Keep same behavior patterns

### 3. **Differentiation**
- [ ] Adjust point values if needed
- [ ] Modify speed/difficulty slightly
- [ ] Consider unique behavior tweaks
- [ ] Update visual indicators

---
*Updated: August 2024 - Complete 6-tier enemy system with anti-clustering distribution*  
*Latest: Enhanced with intelligent spawn patterns and production-ready balance*
*Added: Complete enemy addition and color variation checklists*