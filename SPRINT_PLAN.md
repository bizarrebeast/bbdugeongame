# Bizarre Underground Sprint Plan

## Sprint Overview
**Sprint Goal:** Address critical bugs, implement playtester feedback, and enhance core gameplay mechanics

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
- [ ] Fix ladder ground floor boundary issue
- [ ] Fix ladder scoring system
- [ ] Fix ladder movement glitch
- [ ] Implement up-only ladder restriction

### Week 2: Core Gameplay
- [ ] Implement scaleable jumping
- [ ] Enhance enemy spawn distribution
- [ ] Test and balance new mechanics

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