# Enemy Introduction Timeline & Progression
*Detailed breakdown of when each enemy type appears and why*

## 🎮 Enemy Introduction Schedule

### **Level 1-3: Foundation**
**Enemies Available: 3**
```
✅ Yellow Caterpillar (50 pts) - 40%
✅ Blue Caterpillar (50 pts) - 25%
✅ Beetle (75 pts) - 35%
```
**Purpose**: Learn basic jump-to-kill mechanics with slow, predictable enemies
**Player Experience**: 
- Caterpillars teach random vs predictable movement
- Beetles teach pattern recognition
- No overwhelming mechanics
- Safe learning environment

---

### **Level 4: First Excitement** 🌟
**NEW ENEMY INTRODUCED:**
```
🆕 Rex (500 pts) - 10% spawn chance
```
**Total Enemies: 4**
**Why Level 4?**
- Player has mastered basics
- Ready for a "wow" moment
- Rex's high value creates excitement
- Flipping animation is visually distinct
- Rare spawn (10%) makes it special

---

### **Level 5-6: Speed Introduction**
**NEW ENEMIES INTRODUCED:**
```
🆕 Chomper (100 pts) - 15% spawn chance
🆕 Snail (150 pts) - 10% spawn chance
```
**Total Enemies: 6**
**Why Level 5-6?**
- Players comfortable with jumping
- Ready for patrol enemies
- Chomper = standard speed baseline
- Snail = "faster than expected" surprise
- Bite animations add visual variety

---

### **Level 7-10: Tutorial Completion**
**No new enemies** - Mastery phase
```
Distribution stabilizes:
- Caterpillar: 20%
- Blue Caterpillar: 15%
- Beetle: 20%
- Chomper: 20%
- Snail: 15%
- Rex: 10%
```
**Purpose**: Practice with full basic roster before difficulty increase

---

### **Level 11-20: Basic Challenge Era**
**No new enemies** - Refinement phase
```
Adjusted distribution:
- Chomper: 25% (becomes primary enemy)
- Snail: 20% (speed element increases)
- Rex: 15% (slightly more common)
- Others: Balanced mix
```
**Why no new enemies?**
- Focus on mastering existing mechanics
- Speed multiplier starts increasing (1.05x → 1.10x)
- Players learn enemy combinations
- Building confidence before next tier

---

### **Level 21: Obstacle Introduction** 🚧
**NEW ENEMY INTRODUCED:**
```
🆕 BaseBlu (1000 pts when invincible) - 10% spawn chance
```
**Total Enemies: 7**
**Why Level 21?**
- Halfway through normal progression
- Players understand invincibility powerup
- Adds strategic element (can't kill normally)
- Creates navigation puzzles
- Max 1 per floor initially

**Special Mechanics:**
- Immovable blocker
- Bounces player when jumped on
- Only vulnerable during invincibility
- Forces route planning

---

### **Level 22-30: Speed Tier**
**No new enemies** - Speed focus
```
Distribution shifts to faster enemies:
- Snail: 30% (speed demon showcase)
- Chomper: 25%
- BaseBlu: 10-15%
- Rex: 10% (still present for variety)
```
**Speed Scaling**: 1.10x → 1.15x

---

### **Level 31: Bouncing Challenge** 🦘
**NEW ENEMY INTRODUCED:**
```
🆕 Jumper/Green Cat (250 pts) - 20% spawn chance
```
**Total Enemies: 8**
**Why Level 31?**
- Players have mastered ground enemies
- Ready for vertical challenge
- Jumper adds unpredictability
- High bounce requires timing

**IMPORTANT RULE**: 
- When Jumper spawns, Rex is excluded from that floor
- Prevents multiple bouncing enemies confusion

---

### **Level 35: The Hunter Arrives** 🎯
**NEW ENEMY INTRODUCED:**
```
🆕 Stalker (350 pts) - 15% spawn chance
```
**Total Enemies: 9 (COMPLETE ROSTER)**
**Why Level 35?**
- Late enough that players are skilled
- Adds stealth/activation mechanic
- Creates tension and paranoia
- Mine-like behavior is unique

**Special Mechanics:**
- Starts hidden/inactive
- Activates when player gets within 32px
- 3-second activation delay
- Chases player with increasing speed
- 4-second persistent chase timer

---

## 📊 Complete Introduction Timeline

| Level | New Enemy | Total Types | Reason for Introduction |
|-------|-----------|-------------|-------------------------|
| 1 | Caterpillar, Blue Cat, Beetle | 3 | Foundation enemies |
| 4 | **Rex** | 4 | First "jackpot" enemy |
| 5 | **Chomper** | 5 | Standard patrol baseline |
| 6 | **Snail** | 6 | Speed element |
| 21 | **BaseBlu** | 7 | Strategic obstacle |
| 31 | **Jumper** | 8 | Vertical challenge |
| 35 | **Stalker** | 9 | Ultimate predator |

---

## 🎯 Design Philosophy Behind Timeline

### **Early Game (1-10): Learn & Discover**
- Start with 3 simple enemies
- Add Rex early for excitement (level 4)
- Gradually introduce patrol enemies
- Keep spawn rates balanced
- Total of 6 enemy types by level 10

### **Mid Game (11-30): Build & Challenge**
- No new enemies until level 21
- Focus on combinations and patterns
- BaseBlu at 21 adds puzzle element
- Speed increases become focus
- Total of 7 enemy types

### **Late Game (31-50): Master & Survive**
- Jumper at 31 adds vertical chaos
- Stalker at 35 adds hunt mechanic
- All 9 enemies available
- Complex combinations
- Maximum variety

### **BEAST Mode (51+): Chaos & Glory**
- All enemies in rotation
- Balanced distribution
- No new introductions
- Pure skill test

---

## 🔄 Alternative Spawn Rules by Level

### **Bouncing Enemy Rotation**
```javascript
Levels 4-30:   Rex only (10-15%)
Levels 31-40:  Jumper primary (20%), Rex rare (5%)
Levels 41-50:  Alternating floors (never both)
Levels 51+:    Alternating floors (never both)
```

### **BaseBlu Limits**
```javascript
Levels 1-20:   0 per floor
Levels 21-30:  Max 1 per floor
Levels 31-40:  Max 1 per floor
Levels 41-50:  Max 2 per floor
Levels 51+:    Max 2 per floor
```

### **Stalker Activation Range**
```javascript
Levels 35-40:  32px activation range
Levels 41-50:  40px activation range (harder)
Levels 51+:    48px activation range (hardest)
```

---

## 🎮 Player Psychology & Pacing

### **Why This Order Works**

1. **Rex at Level 4** 
   - Early "wow" moment
   - Shows game has surprises
   - 500 points feels like jackpot
   - Sets expectation of special enemies

2. **Chomper & Snail at 5-6**
   - Natural progression from static to patrol
   - Teaches speed differences
   - Bite animations add personality

3. **Long Gap (7-20)**
   - Prevents overwhelming players
   - Time to master basics
   - Builds anticipation

4. **BaseBlu at 21**
   - Milestone enemy (Level 20 boss feeling)
   - Changes strategy (can't always kill)
   - Puzzle element refreshes gameplay

5. **Jumper at 31**
   - Major mechanical shift
   - Vertical gameplay element
   - Keeps late game fresh

6. **Stalker at 35**
   - Final enemy saves best for last
   - Horror element adds tension
   - Activation mechanic is unique

---

## 📈 Difficulty Curve Visualization

```
Complexity
    ^
    |     Stalker(35)
    |        /
    |    Jumper(31)
    |      /
    |  BaseBlu(21)
    |    /
    | Snail(6)
    | Chomper(5)
    | Rex(4)
    |/Beetle(1)
    +----------------> Level
    1    10   20   30   40   50
```

---

## 🎯 Key Takeaways

1. **Enemy Count Progression**
   - Levels 1-3: 3 enemies
   - Levels 4-10: 6 enemies
   - Levels 11-20: 6 enemies
   - Levels 21-30: 7 enemies
   - Levels 31-34: 8 enemies
   - Levels 35+: 9 enemies (complete)

2. **Introduction Spacing**
   - Early rush (6 enemies by level 6)
   - Long consolidation (7-20)
   - Milestone additions (21, 31, 35)
   - Complete roster by level 35

3. **Mechanical Progression**
   - Static → Moving → Fast → Bouncing → Hunting
   - Simple → Complex
   - Predictable → Chaotic

4. **Special Rules**
   - One bouncing enemy per floor (Rex OR Jumper)
   - BaseBlu limits increase with level
   - Stalker activation range scales

This timeline ensures players are never overwhelmed but always have something new to discover, with Rex appearing early enough to create excitement but not dominating the experience.

---
*Enemy Introduction Timeline - September 2024*
*Balanced progression for optimal player experience*