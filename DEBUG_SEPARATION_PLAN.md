# Debug System Separation Plan

## Current Problem

The debug system has two conflicting requirements:
1. **TestScene Access**: Need `GameSettings.debug = true` to load TestScene and enable 'T' key
2. **Clean Gameplay**: Don't want debug visuals (hitboxes) in main gameplay

Currently, when `GameSettings.debug = true`:
- ✅ TestScene loads and 'T' key works
- ❌ Caterpillar (and all enemies) show debug boxes due to `addDebugVisualization()` calls

When `GameSettings.debug = false`:
- ✅ No debug boxes in gameplay
- ❌ TestScene doesn't load, 'T' key doesn't work

## Root Cause Analysis

The issue is in `Cat.ts` constructor where `addDebugVisualization()` is called unconditionally for ALL enemy types:
- Line 287: Yellow enemies (caterpillar)
- Line 294: Blue enemies (chomper)
- Line 305: Red enemies (snail/stalker)
- Line 314: Green enemies (jumper)
- Line 322: Fallback case

These calls should NOT be there - they're development artifacts that were never removed.

## Solution Design

### Option 1: Remove Unconditional Debug Calls (RECOMMENDED)
**Simply remove the `addDebugVisualization()` calls from Cat.ts constructor**

This is the cleanest solution because:
- The method checks `GameSettings.debug` internally anyway
- Debug visuals should be opt-in, not automatic
- TestScene can still manually enable debug visuals if needed
- Maintains separation of concerns

### Option 2: Dual Flag System
**Create separate flags for TestScene and visual debugging**

```typescript
export const GameSettings = {
  debug: true,           // Enable TestScene and debug features
  showDebugVisuals: false, // Control visual debug overlays
  // ...
}
```

Then update `addDebugVisualization()`:
```typescript
private addDebugVisualization(): void {
  // Check both flags
  if (!GameSettings.debug || !GameSettings.showDebugVisuals) return
  // ... rest of debug drawing code
}
```

### Option 3: Scene-Specific Debug Control
**Let each scene control its own debug visuals**

```typescript
// In GameScene
this.debugVisualsEnabled = false

// In TestScene  
this.debugVisualsEnabled = true
```

Pass this flag when creating enemies.

## Recommended Implementation Plan

### Step 1: Remove Automatic Debug Visualization
Remove all `addDebugVisualization()` calls from Cat.ts constructor:

```typescript
// DELETE these lines:
// Line 287: this.addDebugVisualization()
// Line 294: this.addDebugVisualization()
// Line 305: this.addDebugVisualization()
// Line 314: this.addDebugVisualization()
// Line 322: this.addDebugVisualization()
```

### Step 2: Re-enable Debug Mode
Set debug back to true in GameSettings:

```typescript
export const GameSettings = {
  debug: true,  // Enable TestScene and debug features
  // ...
}
```

### Step 3: Add Manual Debug Control (Optional)
If debug visuals are needed in TestScene, add a method to enable them:

```typescript
// In TestScene when creating enemies
if (this.showHitboxes) {
  cat.enableDebugVisualization()
}
```

Add the enable method to Cat.ts:
```typescript
public enableDebugVisualization(): void {
  this.addDebugVisualization()
}
```

### Step 4: Clean Up Other Debug Artifacts
Check for similar issues in other enemy classes:
- Beetle.ts
- BaseBlu.ts
- Any other game objects

## Expected Outcome

After implementation:
- ✅ `GameSettings.debug = true` enables TestScene access
- ✅ 'T' key works to access TestScene
- ✅ Main gameplay has NO debug visuals
- ✅ TestScene can optionally show debug visuals via 'H' key
- ✅ Clean separation between development tools and gameplay

## Additional Considerations

### Current Debug Features That Should Remain
- TestScene access via 'T' key
- Console logging for development
- Performance monitoring
- Debug keyboard shortcuts in TestScene

### Debug Features That Should NOT Appear in Main Game
- Hitbox visualizations
- Debug graphics overlays
- Performance stats on screen
- Debug text/labels

## Testing Checklist

After implementation:
- [ ] Start game normally - no debug boxes visible
- [ ] Press 'T' - TestScene loads successfully
- [ ] In TestScene, press 'H' - hitboxes toggle on/off
- [ ] Return to main game - still no debug boxes
- [ ] Play through multiple levels - no debug artifacts
- [ ] Test all enemy types - none show debug visuals

## Quick Fix for Immediate Relief

If you need an immediate fix without restructuring:

1. Comment out lines 287, 294, 305, 314, 322 in Cat.ts
2. Set `GameSettings.debug = true`
3. Game will work as intended

This is a temporary fix - the proper solution is to remove these lines entirely as they shouldn't be there.