# DGEN1 Debug Summary - Testing Guide

## 🚀 Server Running
The dgen1 version is now running at: **http://localhost:3001/**

## 🔍 Console Logs Added

### On Page Load
You'll see these logs immediately when the game loads:

1. **🎮 dgen1 Version Initialized** - Shows canvas size, viewport, platform, wallet status
2. **📐 Canvas & Container Metrics** - Detailed measurements of all canvas elements
3. **🎯 Scene Dimensions** - Game configuration, camera, physics, and scale info
4. **🎮 Touch Controls Detection** - Shows if touch controls are enabled (now enabled for desktop testing!)

### During Gameplay

1. **🏃 Player Position** (every 2 seconds) - Shows:
   - Player x,y position
   - Velocity
   - Body bounds (physics hitbox)
   - Display bounds (visual sprite)
   - Camera scroll position

2. **Touch/Click Controls** - When you click/touch:
   - **👆 Pointer down** - Shows click coordinates and status
   - **🎯 Touchpad check** - Shows if click is near D-pad
   - **🦘 Jump button check** - Shows if click is on jump button
   - **✅ Messages** - Confirms when controls are activated

## 🎮 Controls Now Working on Desktop

### What Was Fixed
- Touch controls were disabled on desktop (line 183 check)
- Now enabled for dgen1 builds for testing
- You can now click the on-screen buttons with mouse!

### How to Test
1. **D-Pad** (left side, bottom) - Click and drag for movement
2. **Jump Button** (right side) - Click to jump
3. **Keyboard** still works:
   - Arrow keys for movement
   - Space/Up for jump
   - ESC for menu

## 📊 What to Check in Console

### Alignment Issues
Look for these values to diagnose alignment:
```javascript
// Canvas should be 720x720
canvasElement: {
  width: 720,
  height: 720
}

// Player position should match visual
Player Position: {
  position: { x, y },  // Should match what you see
  bodyBounds: {...},   // Physics hitbox
  displayBounds: {...} // Visual sprite
}
```

### Button Response
When clicking buttons, check:
- "Pointer down" logs show your click position
- Button check logs show if you're in bounds
- "✅" messages confirm activation

## 🐛 Known Issues to Watch

1. **Animation Offset** - If player sprite doesn't match position, check:
   - `bodyBounds` vs `displayBounds` in Player Position log
   - Camera scrollX/Y values

2. **Button Areas** - The console shows exact hit areas:
   - Jump button: x:340-440, y:550-720
   - D-pad: 185px diameter circle at (110, 680)

3. **Resolution** - Check if `devicePixelRatio` is causing scaling issues

## 🔧 Quick Fixes

If buttons still don't work:
1. Check console for "Touch controls disabled" message
2. Refresh the page (Cmd+R / Ctrl+R)
3. Make sure you're on http://localhost:3001/

If animations are offset:
1. Note the Player Position values
2. Compare body vs display bounds
3. Check camera scroll values

## 📝 Next Steps

With these debug logs, you can now:
1. Click anywhere and see exact coordinates
2. Test all button areas with visual feedback
3. Monitor player position vs visual display
4. Diagnose any remaining alignment issues

The game should now be fully testable on desktop with both keyboard and mouse controls!