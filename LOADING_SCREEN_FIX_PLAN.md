# Loading Screen Issue - Fix Plan
## Date: 2025-08-31

### Problem Description
After today's changes, the "GOING BIZARRE" loading screen is appearing after every level completion, not just before level 1 as intended.

### Root Cause Analysis

#### Current Loading Screen Logic
The loading screen is controlled by these flags in `init()`:
```typescript
const isDeathRetry = this.game.registry.get('isDeathRetry') || false
const isReplay = this.game.registry.get('isReplay') || false
const skipLoadingScreen = isReplay || (isDeathRetry && playerLives > 0)
this.showLoadingScreen = !skipLoadingScreen
```

#### The Problem
When progressing to the next level (line 7296):
```typescript
this.scene.restart()  // No flags set!
```

The scene restarts but:
- `isReplay` is NOT set to true
- `isDeathRetry` is false (not a death)
- `levelProgression` is true but NOT checked in loading screen logic
- Result: `showLoadingScreen = true` 🐛

### Why This Started Today

Looking at recent changes:
1. **Lives system fix** - Added registry cleanup, might have affected flags
2. **Enemy separation** - No impact on loading screen
3. **Kill tracking** - No impact on loading screen

The issue likely existed before but may have been masked. Our registry cleanup might have exposed it.

### Solution Options

## Option 1: Add isReplay Flag for Level Progression (RECOMMENDED) ✅
Set `isReplay = true` when continuing to next level.

**Implementation:**
```typescript
// In continueToNextLevel() before scene.restart()
registry.set('isReplay', true)  // Skip loading screen
this.scene.restart()
```

**Pros:**
- Simple, clean fix
- Uses existing logic
- Minimal code change

**Cons:**
- Slightly misleading name (not really a "replay")

## Option 2: Check levelProgression Flag in Loading Logic
Add levelProgression to the skip conditions.

**Implementation:**
```typescript
const levelProgression = this.game.registry.get('levelProgression') || false
const skipLoadingScreen = isReplay || (isDeathRetry && playerLives > 0) || levelProgression
```

**Pros:**
- More semantically correct
- Clear intent

**Cons:**
- Need to ensure flag is set correctly
- More complex logic

## Option 3: Create New Flag for Loading Screen
Add dedicated `skipNextLoadingScreen` flag.

**Implementation:**
```typescript
const skipNextLoading = this.game.registry.get('skipNextLoadingScreen') || false
const skipLoadingScreen = skipNextLoading || isReplay || (isDeathRetry && playerLives > 0)
```

**Pros:**
- Most explicit
- Future-proof

**Cons:**
- Another flag to manage
- More complexity

## Option 4: Only Show Loading on First Level
Check if currentLevel === 1.

**Implementation:**
```typescript
const currentLevel = this.game.registry.get('currentLevel') || 1
const skipLoadingScreen = currentLevel > 1 || isReplay || (isDeathRetry && playerLives > 0)
```

**Pros:**
- Simple logic
- Always correct

**Cons:**
- What about chapter transitions?
- Less flexible

---

## Recommended Implementation

### Fix the continueToNextLevel method (Line ~7240):

```typescript
private continueToNextLevel(): void {
  // ... existing code ...
  
  // Save accumulated score and crystals before progressing
  const registry = this.game.registry
  registry.set('levelProgression', true)
  
  // ADD THIS LINE to skip loading screen on level progression
  registry.set('isReplay', true)
  
  // ... rest of existing code ...
  
  if (nextLevel === 51) {
    this.showBeastModeNotification(() => {
      this.scene.restart()
    })
  } else if (wasInBonus && !isNowInBonus && nextLevel > 1) {
    // Coming out of bonus level to a new chapter
    registry.set('showChapterSplash', true)
    registry.set('chapterSplashLevel', nextLevel)
    this.scene.restart()
  } else {
    // Regular level progression
    this.scene.restart()
  }
}
```

### Also Update checkForChapterSplash (Line ~789):
Currently it clears isReplay:
```typescript
if (this.game.registry.get('isReplay')) {
  this.game.registry.set('isReplay', false)  // This might be too early
}
```

Change to clear it AFTER checking for loading screen need.

---

## Testing Plan

1. **Start new game** → Should see "GOING BIZARRE" loading screen ✅
2. **Complete level 1** → Should NOT see loading screen ✅
3. **Die and continue** → Should NOT see loading screen ✅
4. **Complete level 10 (bonus)** → Should NOT see loading screen ✅
5. **Complete level 20** → Should NOT see loading screen ✅
6. **Restart game** → Should see loading screen ✅

---

## Impact Analysis

- **Risk**: Low - Only affects visual presentation
- **Game Balance**: No impact
- **Performance**: No impact
- **Save System**: No impact

---

## Files to Modify

1. `/src/scenes/GameScene.ts`
   - Line ~7240: Add `registry.set('isReplay', true)` in continueToNextLevel
   - Optionally: Adjust when isReplay flag is cleared

---

## Alternative Quick Fix

If we just want loading screen ONLY on first game start:
```typescript
// In init() method
const currentLevel = this.game.registry.get('currentLevel') || 1
const isFirstStart = currentLevel === 1 && !isDeathRetry && !isReplay
this.showLoadingScreen = isFirstStart
```

But this might skip desired loading screens for chapter transitions.

---

## Summary

The loading screen shows after every level because:
1. `scene.restart()` is called without setting skip flags
2. Loading screen logic only checks `isReplay` and `isDeathRetry`
3. Neither flag is set during normal level progression

**Fix**: Set `isReplay = true` before restarting scene for level progression.