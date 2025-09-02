# Simple Enemy Distribution Plan
*Straightforward variety and progression*

## Core Principles
1. No enemy type over 30% in any level range
2. Gradually introduce enemies as players progress
3. Keep bouncing enemies (Rex/Jumper) separated
4. Ensure variety on every floor

## Enemy Introduction Schedule

| Level | New Enemy Added | Total Enemy Types |
|-------|----------------|-------------------|
| 1 | Caterpillar, Blue Caterpillar, Beetle | 3 |
| 5 | Chomper | 4 |
| 8 | Snail | 5 |
| 12 | Rex | 6 |
| 15 | BaseBlu | 7 |
| 20 | Stalker | 8 |
| 25 | Jumper | 9 |

## Distribution Tables

### **Levels 1-4: Learning Phase**
```
Caterpillar: 40%
Beetle: 40%
Blue Caterpillar: 20%
```
*Simple, predictable enemies to learn jumping*

### **Levels 5-7: Patrol Patterns**
```
Caterpillar: 30%
Beetle: 25%
Blue Caterpillar: 20%
Chomper: 25%
```
*Chomper adds patrol pattern variety*

### **Levels 8-11: Speed Challenge**
```
Caterpillar: 20%
Beetle: 20%
Blue Caterpillar: 15%
Chomper: 30%
Snail: 15%
```
*Snail introduces speed element*

### **Levels 12-14: High Value Target**
```
Caterpillar: 15%
Beetle: 15%
Blue Caterpillar: 10%
Chomper: 25%
Snail: 20%
Rex: 15%
```
*Rex appears as exciting 500-point reward*

### **Levels 15-19: Obstacles**
```
Caterpillar: 10%
Beetle: 10%
Blue Caterpillar: 10%
Rex: 15%
Chomper: 20%
Snail: 20%
BaseBlu: 15%
```
*BaseBlu adds strategy (can't always kill)*

### **Levels 20-24: The Hunter**
```
Caterpillar: 10%
Beetle: 10%
Blue Caterpillar: 5%
Rex: 15%
Chomper: 20%
Snail: 20%
BaseBlu: 10%
Stalker: 10%
```
*Stalker adds tension and chase mechanics*

### **Levels 25-29: Bouncing Variety**
```
Caterpillar: 5%
Beetle: 5%
Blue Caterpillar: 5%
Rex: 10% (OR)
Jumper: 15% (One or other per floor)
Chomper: 15%
Snail: 20%
BaseBlu: 10%
Stalker: 15%
```
*Jumper introduced, alternates with Rex*

### **Levels 30-34: Advanced Mix**
```
Caterpillar: 5%
Beetle: 5%
Blue Caterpillar: 5%
Rex: 15% (OR)
Jumper: 15%
Chomper: 15%
Snail: 15%
BaseBlu: 10%
Stalker: 15%
```
*Balanced challenge with all enemy types*

### **Levels 35-39: Advanced Mix**
```
Caterpillar: 5%
Beetle: 5%
Rex: 10% (OR)
Jumper: 20%
Chomper: 15%
Snail: 20%
BaseBlu: 10%
Stalker: 15%
```
*More dangerous enemies, less easy ones*

### **Levels 40-49: Expert Balance**
```
Caterpillar: 5%
Beetle: 5%
Rex: 15% (OR)
Jumper: 15%
Chomper: 10%
Snail: 15%
BaseBlu: 15%
Stalker: 20%
```
*Challenging but varied*

### **Levels 50+: BEAST Mode**
```
Caterpillar: 5%
Beetle: 5%
Blue Caterpillar: 5%
Rex: 10% (OR)
Jumper: 10%
Chomper: 15%
Snail: 15%
BaseBlu: 15%
Stalker: 20%
```
*All enemies, balanced distribution*

## Spawning Rules

### 1. **Enemies Per Floor**
- Levels 1-10: 1-2 enemies
- Levels 11-20: 2-3 enemies
- Levels 21-30: 2-3 enemies
- Levels 31-40: 3-4 enemies
- Levels 41-50: 3-4 enemies
- Levels 51+: 4-5 enemies

### 2. **Bouncing Enemy Rule**
```javascript
// Per floor, choose ONE bouncing type
if (floor.canHaveRex && floor.canHaveJumper) {
  if (random() < 0.5) {
    spawnRex = true
    spawnJumper = false
  } else {
    spawnRex = false
    spawnJumper = true
  }
}
```

### 3. **BaseBlu Limit - ONE Per Floor**
- **ALL LEVELS: Maximum 1 BaseBlu per floor**
- This prevents players from getting blocked by multiple obstacles
- Ensures strategic gameplay without frustration

### 4. **Variety Guarantee**
- Each floor should have at least 2 different enemy types
- No floor should be 100% one enemy

## Speed Multipliers

Keep it simple - gradual increase:
- Levels 1-10: 1.0x
- Levels 11-20: 1.05x
- Levels 21-30: 1.10x
- Levels 31-40: 1.15x
- Levels 41-50: 1.20x
- Levels 51+: 1.25x

## Summary - What This Achieves

### ✅ **Good Variety**
- No enemy dominates (max 25-30%)
- 3 enemies at start → 9 by level 30
- Different combinations each floor

### ✅ **Clear Progression**
- New enemy every 3-5 levels (more consistent pacing)
- Rex delayed to level 12 (makes it more special)
- Stalker earlier at level 20 (adds mid-game challenge)
- Gradual difficulty increase

### ✅ **Simple Rules**
- Rex/Jumper never together
- BaseBlu has limits
- Everything else mixes freely

### ✅ **Balanced Gameplay**
```
Early (1-11): Learning basics, 3-5 enemy types
Mid (12-24): Building skills, 6-8 enemy types  
Late (25-50): Full challenge, 9 enemy types
BEAST (51+): Everything active, maximum variety
```

## Example Floors

### Level 6 Floor (Early)
- 1 Caterpillar (30% chance)
- 1 Chomper (25% chance)
Result: Easy enemy + patrol pattern

### Level 13 Floor (Rex Introduction)
- 1 Rex (15% chance)
- 1 Snail (20% chance)
- 1 Chomper (25% chance)
Result: High value + speed + standard

### Level 22 Floor (Stalker Active)
- 1 Stalker (10% chance)
- 1 Snail (20% chance)
- 1 BaseBlu (10% chance) - **Only 1 per floor maximum**
Result: Hunter + speed + obstacle

### Level 30 Floor (Full Roster)
- 1 Jumper OR Rex (15% chance)
- 1 Stalker (15% chance)
- 1 Chomper (15% chance)
Result: Bouncing + danger + standard

### Level 50+ Floor
- 1 Stalker (20% chance)
- 1 BaseBlu (15% chance) - **Only 1 per floor maximum**
- 1 Rex OR Jumper (10% chance)
- 1 Chomper (15% chance)
Result: Maximum variety challenge

---

This plan is simple, implementable, and provides good variety throughout the game without any single enemy dominating the experience.