# Comprehensive Enemy Guide - Bizarre Underground

## Complete Enemy Roster with Movement, Scoring, and Distribution

### 1. **Caterpillar (Yellow Cat)**
- **Points**: 50
- **Speed**: 0.6x (48 units/sec)
- **Difficulty Score**: 0.5
- **Movement Pattern**: 
  - Slow random movement
  - Changes direction randomly
  - Unpredictable but slow
- **Visual**: Yellow cat sprite with expressions
- **Spawn Distribution**:
  - Tutorial (1-10): 30%
  - Skill (11-25): 20%
  - Challenge (26-40): 12%
  - Master (41-50): 5%

### 2. **Beetle**
- **Points**: 75
- **Speed**: 1.0x (80 units/sec)
- **Difficulty Score**: 0.8
- **Movement Pattern**:
  - Simple back-and-forth patrol
  - Reverses at platform edges (10px buffer)
  - Can reverse when hitting another beetle
  - Most predictable enemy
- **Visual**: Red rectangle placeholder (20x16) - needs sprite
- **Spawn Distribution**:
  - Tutorial (1-10): 15%
  - Skill (11-25): 12%
  - Challenge (26-40): 8%
  - Master (41-50): 5%

### 3. **Chomper (Blue Cat)**
- **Points**: 100
- **Speed**: 1.0x (80 units/sec)
- **Difficulty Score**: 1.0
- **Movement Pattern**:
  - Standard left-right patrol
  - Consistent speed
  - Bite animations while moving
- **Visual**: Blue cat sprite with bite animations
- **Spawn Distribution**:
  - Tutorial (1-10): 30%
  - Skill (11-25): 25%
  - Challenge (26-40): 20%
  - Master (41-50): 18%

### 4. **Snail (Red Cat)**
- **Points**: 150
- **Speed**: 1.2x (96 units/sec)
- **Difficulty Score**: 1.5
- **Movement Pattern**:
  - Faster patrol movement
  - Similar to Chomper but 20% faster
  - More dangerous due to speed
- **Visual**: Red cat sprite with animations
- **Spawn Distribution**:
  - Tutorial (1-10): 15%
  - Skill (11-25): 20%
  - Challenge (26-40): 20%
  - Master (41-50): 20%

### 5. **Jumper (Green Cat)**
- **Points**: 200
- **Speed**: 1.5x (120 units/sec)
- **Difficulty Score**: 2.5
- **Movement Pattern**:
  - Fast bouncing/jumping movement
  - Hardest to predict and hit
  - Covers ground quickly
- **Visual**: Green cat sprite with jump animations
- **Spawn Distribution**:
  - Tutorial (1-10): 5%
  - Skill (11-25): 10%
  - Challenge (26-40): 20%
  - Master (41-50): 25%

### 6. **Stalker (Red Cat Variant)**
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
- **Spawn Distribution**:
  - Tutorial (1-10): 0%
  - Skill (11-25): 5%
  - Challenge (26-40): 10%
  - Master (41-50): 15%

### 7. **BaseBlu (Blue Blocker)**
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
- **Spawn Distribution**:
  - Tutorial (1-10): 5%
  - Skill (11-25): 8%
  - Challenge (26-40): 10%
  - Master (41-50): 12%

## Difficulty Scoring System

**Difficulty Budget per Floor** (determines how many enemies spawn):
- **Tutorial (1-10)**: 1.5 → 3.0
- **Skill (11-25)**: 3.0 → 5.5
- **Challenge (26-40)**: 5.5 → 8.0
- **Master (41-50)**: 8.0 → 10.0

**Floor Bonus**: +0.3 difficulty every 4 floors within a level

## Enemy Combinations Examples

### Tutorial Level (Budget: 2.0)
- 4 Caterpillars (4 × 0.5 = 2.0)
- 2 Beetles + 1 Caterpillar (2 × 0.8 + 0.5 = 2.1)
- 2 Chompers (2 × 1.0 = 2.0)
- 1 BaseBlu alone (1 × 2.0 = 2.0)

### Mid-Game Level (Budget: 5.0)
- 1 Stalker + 1 Chomper (4.0 + 1.0 = 5.0)
- 2 Jumpers (2 × 2.5 = 5.0)
- 1 BaseBlu + 2 Snails (2.0 + 2 × 1.5 = 5.0)
- 3 Snails + 1 Caterpillar (3 × 1.5 + 0.5 = 5.0)

### Master Level (Budget: 9.0)
- 2 Stalkers + 1 Chomper (2 × 4.0 + 1.0 = 9.0)
- 3 Jumpers + 1 Snail (3 × 2.5 + 1.5 = 9.0)
- 1 Stalker + 1 BaseBlu + 1 Jumper + 1 Caterpillar (4.0 + 2.0 + 2.5 + 0.5 = 9.0)

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

---
*Created: 2024 - Complete enemy reference for spawning and balance decisions*