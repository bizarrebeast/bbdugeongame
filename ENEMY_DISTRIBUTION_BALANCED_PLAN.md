# Balanced Enemy Distribution Plan
*Focus on variety and preventing bouncing enemy conflicts*

## Core Rules

### 1. **One Bouncing Enemy Rule** 🏀
- **Never spawn both Jumper (Green) and Rex on the same floor**
- Each floor gets EITHER Jumper OR Rex, never both
- This prevents visual confusion and maintains gameplay clarity

### 2. **One BaseBlu Per Floor Rule** 🚧
- **Maximum 1 BaseBlu per floor across all levels**
- Prevents players from getting trapped by multiple obstacles
- Maintains strategic gameplay without frustration

### 3. **Balanced Distribution Philosophy** ⚖️
- No single enemy type should dominate (max 25-30% in any tier)
- Every enemy should have a purpose and place
- Variety is key to fun gameplay
- Blue Caterpillar stays at 50 points as requested

## Revised Point Values
```
Caterpillar: 50 points ✅
Blue Caterpillar: 50 points ✅ (kept as requested)
Beetle: 75 points ✅
Chomper: 100 points ✅
Snail: 150 points ✅
Jumper: 250 points (slight buff for difficulty)
Stalker: 350 points (moderate buff)
Rex: 500 points ✅
BaseBlu: 1000 points ✅
```

## New Balanced Distribution Tables

### Tutorial Early (Levels 1-3) - "Learn the Basics"
```javascript
'tutorial_early': {
  [EnemyType.CATERPILLAR]: 0.40,      // 40% - Main learning enemy
  [EnemyType.BEETLE]: 0.35,           // 35% - Predictable patterns
  [EnemyType.BLUE_CATERPILLAR]: 0.25, // 25% - Slight variation
  // No other enemies - keep it simple
}
```

### Tutorial Late (Levels 4-10) - "Expanding Horizons"
```javascript
'tutorial_late': {
  [EnemyType.CATERPILLAR]: 0.20,      // 20%
  [EnemyType.BLUE_CATERPILLAR]: 0.15, // 15%
  [EnemyType.BEETLE]: 0.20,           // 20%
  [EnemyType.CHOMPER]: 0.20,          // 20% - Introduce chomper
  [EnemyType.SNAIL]: 0.15,            // 15% - Introduce speed
  [EnemyType.REX]: 0.10,              // 10% - Rare exciting moment
  // Balanced variety, Rex is special/rare
}
```

### Basic (Levels 11-20) - "Standard Challenge"
```javascript
'basic': {
  [EnemyType.CHOMPER]: 0.25,          // 25% - Main enemy
  [EnemyType.SNAIL]: 0.20,            // 20% - Speed element
  [EnemyType.BEETLE]: 0.15,           // 15% - Familiar
  [EnemyType.REX]: 0.15,              // 15% - Bouncing variety
  [EnemyType.CATERPILLAR]: 0.15,      // 15% - Easy targets
  [EnemyType.BLUE_CATERPILLAR]: 0.10, // 10% - Variety
  // Well-rounded mix, no enemy dominates
}
```

### Speed (Levels 21-30) - "Faster Pace"
```javascript
'speed': {
  [EnemyType.SNAIL]: 0.30,        // 30% - Speed focus
  [EnemyType.CHOMPER]: 0.25,      // 25% - Standard enemy
  [EnemyType.REX]: 0.10,          // 10% - Bouncing element (no Jumper yet)
  [EnemyType.BASEBLU]: 0.10,      // 10% - Introduce obstacle
  [EnemyType.BEETLE]: 0.10,       // 10% - Some easier enemies
  [EnemyType.CATERPILLAR]: 0.10,  // 10% - Variety
  [EnemyType.BLUE_CATERPILLAR]: 0.05, // 5% - Rare
}
```

### Advanced (Levels 31-40) - "Complex Patterns"
```javascript
'advanced': {
  [EnemyType.JUMPER]: 0.20,       // 20% - Primary bouncing enemy
  [EnemyType.SNAIL]: 0.20,        // 20% - Fast enemy
  [EnemyType.STALKER]: 0.15,      // 15% - Introduce stalker
  [EnemyType.CHOMPER]: 0.15,      // 15% - Familiar enemy
  [EnemyType.BASEBLU]: 0.15,      // 15% - Obstacles
  [EnemyType.BEETLE]: 0.10,       // 10% - Easier targets
  [EnemyType.CATERPILLAR]: 0.05,  // 5% - Rare easy
  // NOTE: No REX when JUMPER is present (bouncing rule)
}
```

### Expert (Levels 41-50) - "Master Challenge"
```javascript
'expert': {
  [EnemyType.STALKER]: 0.25,      // 25% - Main challenge
  [EnemyType.JUMPER]: 0.15,       // 15% - Bouncing challenge
  [EnemyType.REX]: 0.10,          // 10% - Alternative bouncer
  [EnemyType.BASEBLU]: 0.20,      // 20% - Many obstacles
  [EnemyType.SNAIL]: 0.15,        // 15% - Speed
  [EnemyType.CHOMPER]: 0.10,      // 10% - Standard
  [EnemyType.BEETLE]: 0.05,       // 5% - Breathing room
  // Balanced difficulty with variety
}
```

### BEAST Mode (Levels 51+) - "Ultimate Variety"
```javascript
'beast': {
  [EnemyType.STALKER]: 0.15,      // 15% - Even distribution
  [EnemyType.JUMPER]: 0.12,       // 12% - Bouncing type 1
  [EnemyType.REX]: 0.13,          // 13% - Bouncing type 2
  [EnemyType.BASEBLU]: 0.15,      // 15% - Obstacles
  [EnemyType.SNAIL]: 0.15,        // 15% - Speed
  [EnemyType.CHOMPER]: 0.10,      // 10% - Standard
  [EnemyType.CATERPILLAR]: 0.08,  // 8% - Variety
  [EnemyType.BLUE_CATERPILLAR]: 0.07, // 7% - Variety
  [EnemyType.BEETLE]: 0.05,       // 5% - Easy targets
  // Maximum variety, no dominance
}
```

## Special Spawning Logic

### Floor-Specific Enemy Restrictions
```javascript
// When spawning enemies for a floor
function selectEnemiesForFloor(level, floor) {
  const weights = getSpawnWeights(level)
  const enemies = []
  
  // Determine if this floor gets Jumper or Rex (never both)
  let bouncingType = null
  if (weights[EnemyType.JUMPER] > 0 && weights[EnemyType.REX] > 0) {
    // Both are possible, choose one for this floor
    bouncingType = Math.random() < 0.5 ? EnemyType.JUMPER : EnemyType.REX
  } else if (weights[EnemyType.JUMPER] > 0) {
    bouncingType = EnemyType.JUMPER
  } else if (weights[EnemyType.REX] > 0) {
    bouncingType = EnemyType.REX
  }
  
  // Apply bouncing restriction
  const floorWeights = {...weights}
  if (bouncingType === EnemyType.JUMPER) {
    floorWeights[EnemyType.REX] = 0 // No Rex on Jumper floors
  } else if (bouncingType === EnemyType.REX) {
    floorWeights[EnemyType.JUMPER] = 0 // No Jumper on Rex floors
  }
  
  // BaseBlu limit: Only 1 per floor maximum
  let baseBluCount = 0
  
  // Continue with normal spawning using adjusted weights
  const selectedEnemies = []
  for (let i = 0; i < maxEnemies; i++) {
    const enemy = selectWithWeights(floorWeights, 1)[0]
    if (enemy === EnemyType.BASEBLU) {
      baseBluCount++
      if (baseBluCount >= 1) {
        // Remove BaseBlu from further selection
        floorWeights[EnemyType.BASEBLU] = 0
      }
    }
    selectedEnemies.push(enemy)
  }
  
  return selectedEnemies
}
```

## Enemy Purpose & Identity

### Easy Tier (50-75 points)
- **Caterpillar**: Random movement, unpredictable
- **Blue Caterpillar**: Predictable movement, easier
- **Beetle**: Pattern-based, combo opportunities

### Medium Tier (100-150 points)
- **Chomper**: Standard patrol enemy
- **Snail**: Fast patrol, reaction test

### Hard Tier (250-500 points)
- **Jumper**: Bouncing challenge (floors 31+)
- **Rex**: Bouncing with flip (appears earlier, level 4+)
- **Stalker**: Activation trap enemy

### Special Tier (1000 points)
- **BaseBlu**: Immovable obstacle, invincibility target

## Key Improvements

### 1. **No Bouncing Conflicts** ✅
- Jumper and Rex never appear together
- Each floor has clear enemy types
- Visual clarity maintained

### 2. **One BaseBlu Per Floor** ✅
- Maximum 1 BaseBlu obstacle per floor
- Prevents impossible situations
- Maintains strategic gameplay

### 3. **Balanced Distribution** ✅
- No enemy exceeds 30% in any tier
- Every enemy has representation
- Progressive difficulty curve

### 4. **Clear Progression** ✅
```
Levels 1-3:   Basic enemies only
Levels 4-10:  Add Rex (rare treat)
Levels 11-20: Balanced standard mix
Levels 21-30: Speed focus
Levels 31-40: Jumper introduced (Rex excluded)
Levels 41-50: Both bouncers possible (different floors)
Levels 51+:   Everything balanced
```

### 5. **Enemy Variety Per Floor** ✅
- Early: 1-2 enemy types per floor
- Mid: 2-3 enemy types per floor
- Late: 3-4 enemy types per floor
- Max: 4-5 enemy types per floor

## Implementation Priority

### Phase 1: Core Rules (30 minutes)
1. ✅ Implement bouncing enemy exclusion logic
2. ✅ Update spawn weights to new balanced values
3. ✅ Keep Blue Caterpillar at 50 points

### Phase 2: Testing (1 hour)
1. ✅ Verify no Jumper+Rex conflicts
2. ✅ Check distribution feels varied
3. ✅ Ensure difficulty curve is smooth

### Phase 3: Fine-tuning
1. ⬜ Adjust percentages based on playtesting
2. ⬜ Consider floor-specific patterns
3. ⬜ Add special combination events

## Expected Results

### Player Experience
- **Clear Visual Language**: One bouncing enemy type per floor
- **Balanced Challenge**: No enemy type dominates
- **Progressive Difficulty**: Smooth curve from easy to hard
- **Constant Variety**: Different enemy mixes keep gameplay fresh

### Metrics
- More even distribution of enemy kills
- Longer play sessions due to variety
- Better difficulty curve adherence
- Reduced player confusion

## Summary

This balanced approach ensures:
1. **No bouncing enemy conflicts** (Jumper vs Rex)
2. **Only one BaseBlu per floor** (prevents blocking)
3. **Even distribution** across all enemy types
4. **Blue Caterpillar stays at 50 points**
5. **Rex is present but not dominant** (10-15% max)
6. **Every enemy has a purpose and place**

The key is variety without confusion, challenge without frustration, and ensuring every floor feels different while maintaining clear gameplay rules.

---
*Balanced Distribution Plan - September 2024*
*Focus on variety and clarity*