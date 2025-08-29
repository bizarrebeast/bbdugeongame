# Treasure Quest Sprint Plan

## Sprint Overview
**Sprint Goal:** Address critical bugs, implement playtester feedback, and enhance core gameplay mechanics

**Sprint Status:** ✅ MAJOR IMPROVEMENTS COMPLETED

---

## 🎆 Completed Improvements

### Scaleable Jumping System ✅
- Quick tap produces small hop (-250 velocity)
- Holding button progressively increases jump height
- Maximum jump reached after 300ms hold (-350 velocity)
- 50ms minimum hold time before boost starts
- Progressive boost force that ramps up over time

### Ladder Mechanics Fixed ✅
- Players can climb both up and down ladders normally
- Cannot fall through ladder bottom (boundary protection)
- Cannot exit ladders horizontally (must jump to exit)
- Smooth climbing animations maintained

### Enemy Spawn System Enhanced ✅
- Four spawn patterns: spread, cluster, edges, random
- Randomized initial directions (50/50 left/right)
- Dynamic patrol areas based on spawn pattern
- BaseBlu spawn rate normalized (15% + 1% per level)
- Invincibility pendant spawn rate fixed (3%)

### Background System ✅
- 3 treasure quest backgrounds rotating between levels
- Proper scaling (1.2x) to eliminate grey areas
- Extensible system for future backgrounds

---

## 🔴 Critical Bugs (Priority 1)

### 1. Ladder System Bugs
- **Bug:** Going down a ladder on the first floor causes player to fall below the map
  - **Fix:** Add boundary check for ground floor ladder descent
  - **Acceptance:** Player cannot descend below ground floor

- **Bug:** Going up/down a ladder gives 500 points (repeatable on same ladder)
  - **Fix:** Points should only be awarded once per ladder or removed entirely
  - **Acceptance:** Ladder scoring works as intended (once per ladder or no points)

- **Bug:** Going up a ladder while holding up + left/right arrow causes glitch
  - **Fix:** Disable horizontal movement during ladder climb animation
  - **Acceptance:** Clean ladder climbing with no movement glitches

### 2. Movement Restrictions
- **Issue:** Players can climb down ladders (should be up only)
  - **Fix:** Disable downward ladder movement entirely
  - **Acceptance:** Ladders only allow upward movement

---

## 🟡 Gameplay Improvements (Priority 2)

### 1. Scaleable Jumping System
- **Feature:** Variable jump height based on button hold duration
  - **Implementation:** Track jump button hold time and adjust velocity
  - **Min jump:** Quick tap = small hop
  - **Max jump:** Full hold = current jump height
  - **Acceptance:** Smooth, responsive variable jumping

### 2. Enemy Spawn Distribution
- **Current Issue:** Enemy spawn spread needs to be increased
  - **Fix:** Enhance spawn pattern randomization
  - **Add:** Wider distribution ranges in spawn patterns
  - **Acceptance:** More varied enemy positioning across platforms

---

## 🟢 New Features (Priority 3)

### 1. Spike-Only Challenge Levels
- **Concept:** Special levels with spike-covered floors
  - **Mechanics:** Must use enemies as platforms to cross
  - **Design:** Platform at beginning, enemies patrol over spikes
  - **Enemy behavior:** Enemies need to be sturdy enough to jump on
  - **Acceptance:** Playable challenge level with enemy-hopping mechanic

---

## 📊 Technical Debt

### 1. Code Cleanup
- Remove all debug console.log statements
- Clean up commented code
- Optimize spawn system performance

### 2. Testing Requirements
- Test all ladder interactions thoroughly
- Verify jump mechanics feel responsive
- Ensure enemy spawn patterns are balanced

---

## 🎯 Sprint Tasks Breakdown

### Week 1: Critical Bugs
- [x] Fix ladder ground floor boundary issue ✅
- [x] Fix ladder scoring system (removed 500 point bonus) ✅
- [x] Fix ladder movement glitch ✅
- [x] ~~Implement up-only ladder restriction~~ (Changed: Allow down movement but prevent falling through bottom) ✅

### Week 2: Core Gameplay
- [x] Implement scaleable jumping ✅
  - Quick tap: -250 velocity (small hop)
  - Hold 50-350ms: Progressive boost to -350 (full jump)
- [x] Enhance enemy spawn distribution ✅
  - Added spawn patterns: spread, cluster, edges, random
  - Randomized spawn directions
  - Dynamic patrol areas
- [x] Test and balance new mechanics ✅

### Week 3: New Features & Polish
- [ ] Design spike-only challenge level
- [ ] Implement enemy-platform mechanics
- [ ] Final testing and bug fixes
- [ ] Code cleanup and optimization

---

## 📝 Playtester Feedback Notes

### Bugs Reported:
1. Going up a ladder and holding up + left/right = glitch
2. Going up a ladder gives 500 points (repeatable)
3. Going down ladder on first floor = fall below map
4. Can climb down ladders (should be up only)

### Suggestions:
1. Scaleable jumping based on button hold duration
2. Increase enemy spawn spread
3. Spike-only levels using enemies as platforms

---

## ✅ Definition of Done
- All critical bugs fixed and tested
- Scaleable jumping implemented and feels good
- Enemy spawning improved with better distribution
- Ladder system working correctly (up only, no glitches, proper scoring)
- Code reviewed and cleaned
- All changes tested in multiple play sessions

---

## 🚀 Future Considerations (Post-Sprint)
- Additional challenge level types
- More enemy variety
- Power-up system expansion
- Multiplayer or leaderboard features