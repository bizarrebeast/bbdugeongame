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
- **Spawn Distribution** (6-Tier System):
  - Tutorial (1-10): 70%
  - Basic (11-20): 30%
  - Speed+ (21-50): 0%
  - BEAST (51+): 10%

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
- **Spawn Distribution** (6-Tier System):
  - Tutorial (1-10): 30%
  - Basic (11-20): 20%
  - Speed+ (21-50): 0%
  - BEAST (51+): 5%

### 3. **Chomper (Blue Cat)**
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

### 4. **Snail (Red Cat)**
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

### 5. **Jumper (Green Cat)**
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
- **Spawn Distribution** (6-Tier System):
  - Tutorial (1-10): 0%
  - Basic (11-20): 0%
  - Speed (21-30): 0%
  - Advanced (31-40): 12.5%
  - Expert (41-50): 35%
  - BEAST (51+): 20%

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
- **Spawn Distribution** (6-Tier System):
  - Tutorial (1-10): 0%
  - Basic (11-20): 0%
  - Speed (21-30): 15%
  - Advanced (31-40): 12.5%
  - Expert (41-50): 25%
  - BEAST (51+): 15%

## 6-Tier Progressive System

**Enemy Count per Floor** (replaces difficulty budget system):
- **Tutorial (1-10)**: 2-3 enemies per floor
- **Basic (11-20)**: 3-4 enemies per floor
- **Speed (21-30)**: 4-5 enemies per floor
- **Advanced (31-40)**: 5-6 enemies per floor
- **Expert (41-50)**: 6-7 enemies per floor
- **BEAST (51+)**: 7-8 enemies per floor

**Speed Scaling**: Progressive speed multiplier from 1.0x (level 1) to 1.25x (level 50+)
**BaseBlu Limits**: Max 0/0/1/2/2/2 per floor for each tier respectively

## 6-Tier Enemy Combinations Examples

### Tutorial Floors (1-10)
- 2-3 enemies: 2 Caterpillars + 1 Beetle
- 70% Caterpillar, 30% Beetle spawns
- No advanced enemies

### Speed Tier Floors (21-30) 
- 4-5 enemies: 2 Snails + 2 Chompers + 1 BaseBlu
- 50% Snail, 35% Chomper, 15% BaseBlu (max 1 per floor)
- Speed multiplier: ~1.10x

### Expert Floors (41-50)
- 6-7 enemies: 2 Stalkers + 2 Jumpers + 2 BaseBlu + mix
- 35% Stalker, 30% Jumper, 25% BaseBlu (max 2 per floor)  
- Speed multiplier: 1.20x-1.25x

### BEAST Mode (51+)
- 7-8 enemies: Balanced chaos mix of all types
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

---
*Updated: August 2024 - Complete 6-tier enemy system with anti-clustering distribution*  
*Latest: Enhanced with intelligent spawn patterns and production-ready balance*