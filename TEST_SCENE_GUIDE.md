# 🧪 TestScene Complete Guide

## Overview
TestScene is a powerful debugging and testing environment for Treasure Quest: Bizarre Underground. It provides comprehensive tools for testing enemies, mechanics, performance, and game features without affecting the main gameplay.

## Accessing TestScene

### Requirements
- `GameSettings.debug` must be set to `true` in `/src/config/GameSettings.ts`
- TestScene is automatically loaded when debug mode is enabled

### How to Enter
- **From Main Game**: Press `T` key at any time during gameplay
- **Direct Access**: The scene is available in the scene list when debug is enabled

### How to Exit
- Click the **Exit** button in the top-right corner
- Returns to the main GameScene where you left off

## 🎮 Keyboard Controls

### Enemy Spawning
| Key | Action | Description |
|-----|--------|-------------|
| `1` | Spawn Caterpillar | Yellow enemy, slow random movement (50 pts) |
| `2` | Spawn Beetle | Red enemy, roll-and-bite behavior (75 pts) |
| `3` | Spawn Chomper | Blue cat, standard patrol (100 pts) |
| `4` | Spawn Snail | Red cat, faster patrol (150 pts) |
| `5` | Spawn Jumper | Green cat, bouncing movement (200 pts) |
| `6` | Spawn Stalker | Red cat with mine behavior (300 pts) |
| `7` | Spawn BaseBlu | Blue blocker, immovable (1000 pts) |
| `A` | Spawn All Types | Creates one of each enemy type |
| `C` | Clear All Enemies | Removes all enemies from scene |

### Debug Visualization
| Key | Action | Description |
|-----|--------|-------------|
| `H` | Toggle Hitboxes | Shows/hides physics debug boxes |
| `G` | Toggle Grid | Shows/hides alignment grid overlay |

### Player Controls
| Key | Action | Description |
|-----|--------|-------------|
| `I` | Toggle Invincibility | 10-second invincibility power-up |
| `P` | Give Power-ups | Adds Crystal Ball and Cursed Orbs |
| `Q/E` | Fire Projectiles | When Crystal Ball is active |
| Arrow Keys | Move Player | Standard movement controls |
| Space | Jump | Standard jump control |

### Game State
| Key | Action | Description |
|-----|--------|-------------|
| `L` | Adjust Lives | Cycles through 1-9 lives |
| `S` | Add Score | Adds 1000 points |
| `R` | Reset Scene | Full scene reset |

### Performance Testing
| Key | Action | Description |
|-----|--------|-------------|
| `F` | Show FPS | Toggles FPS counter display |
| `M` | Memory Stats | Shows memory usage info |

## 📊 Control Panel Features

### Speed Control
- **Buttons**: 0.5x, 1x, 2x, 4x
- **Purpose**: Test animations and physics at different speeds
- **Usage**: Click to change game time scale

### Enemy Counter
- **Display**: Shows current enemy count
- **Updates**: Real-time as enemies spawn/despawn
- **Max Tested**: 50+ enemies for performance testing

### HUD Testing
- **Lives Display**: Test life counter (max 9)
- **Score Display**: Test point accumulation
- **Timer Display**: Test power-up timers
- **Crystal Counter**: Test collectible tracking

## 🏗️ Test Environment Layout

### Platform Structure
```
Floor 2: [================] (with ladder access)
         |  |
Floor 1: [================] (with ladder access)
         |  |
Floor 0: [================] (ground level, full width)
```

### Special Features
- **Player Spawn**: Center of Floor 0
- **Enemy Spawn Zones**: Distributed across all floors
- **Ladder Placement**: Strategic positioning for movement testing
- **Edge Testing**: Platform boundaries for patrol behavior

## 🧪 Testing Scenarios

### 1. Enemy Behavior Testing
```
1. Press 'A' to spawn all enemy types
2. Press 'H' to show hitboxes
3. Observe patrol patterns and boundaries
4. Test jumping on enemies
5. Press 'C' to clear and repeat
```

### 2. Combo System Testing
```
1. Spawn multiple enemies (keys 1-7)
2. Jump on enemies in quick succession
3. Observe combo counter and point multiplication
4. Verify point popups show correct values
```

### 3. Power-up Testing
```
1. Press 'I' for invincibility
2. Press 'P' for projectile power-ups
3. Test enemy interactions during power-up
4. Observe timer countdown in HUD
```

### 4. Performance Stress Test
```
1. Press 'F' to show FPS
2. Repeatedly press 'A' to spawn many enemies
3. Monitor FPS drop threshold
4. Press 'C' to clear when done
```

### 5. Hitbox Verification
```
1. Press 'H' to enable hitboxes
2. Spawn specific enemy types
3. Verify collision boxes match sprites
4. Test player-enemy collision accuracy
```

## 🐛 Common Debugging Uses

### Issue: Enemy Getting Stuck
1. Spawn the problematic enemy type
2. Enable hitboxes with 'H'
3. Observe movement patterns
4. Check platform edge detection

### Issue: Combo Not Working
1. Spawn 3-4 enemies close together
2. Jump on them rapidly
3. Check if combo counter increments
4. Verify point calculations

### Issue: Power-up Timer Wrong
1. Press 'I' or 'P' for power-ups
2. Watch timer countdown
3. Verify effect ends at zero
4. Check for timer overlap issues

### Issue: Performance Problems
1. Press 'F' for FPS display
2. Spawn enemies until FPS drops
3. Note enemy count at performance threshold
4. Test on different speed settings

## 💡 Tips and Tricks

### Efficient Testing
- Use number keys for specific enemy types rather than 'A' for all
- Clear enemies with 'C' between tests for clean state
- Use speed controls to slow down for detailed observation
- Toggle hitboxes only when needed (impacts performance)

### Enemy-Specific Testing
- **Caterpillar**: Test random movement doesn't get stuck
- **Beetle**: Verify roll-and-bite cycle timing
- **Chomper**: Check stuck detection and recovery
- **Snail**: Test faster speed scaling
- **Jumper**: Verify bounce height consistency
- **Stalker**: Test activation range and chase behavior
- **BaseBlu**: Verify immovable property and stun mechanics

### Advanced Debugging
- Combine multiple power-ups to test interactions
- Use grid overlay ('G') for precise positioning tests
- Test ladder climbing with enemies nearby
- Verify enemy spawn distribution patterns

## 🔧 Customization

### Adding New Test Features
TestScene is designed to be extended. Common additions:
- New enemy spawn keys (8, 9, 0)
- Additional power-up tests
- Custom platform layouts
- Automated test sequences

### Modifying Test Environment
Located in `/src/scenes/TestScene.ts`:
- Platform positions: Lines 150-180
- Enemy spawn points: Lines 300-400
- Control panel layout: Lines 700-800
- Keyboard handlers: Lines 850-900

## ⚠️ Known Limitations

1. **Not Production Code**: TestScene is excluded from production builds
2. **Performance Impact**: Hitbox display affects FPS
3. **State Isolation**: Changes don't affect main game save
4. **Memory Usage**: Many enemies can cause memory issues
5. **Touch Controls**: Limited on mobile (keyboard preferred)

## 🚀 Quick Reference Card

```
ENEMIES        DEBUG         PLAYER        STATE
1 - Yellow     H - Hitbox    I - Invinc    L - Lives
2 - Beetle     G - Grid      P - Powers    S - Score
3 - Blue                     Q/E - Fire    R - Reset
4 - Red                      ←→ - Move     F - FPS
5 - Green                    ↑↓ - Climb    M - Memory
6 - Stalker                  Space - Jump
7 - BaseBlu
A - All
C - Clear

SPEED: [0.5x] [1x] [2x] [4x]    EXIT: Top-right button
```

## 📝 Maintenance Notes

### Regular Testing Checklist
- [ ] All enemy types spawn correctly
- [ ] Hitbox toggle works without errors
- [ ] Player controls responsive
- [ ] Power-ups activate properly
- [ ] Exit button returns to game
- [ ] No console errors on scene load
- [ ] FPS counter displays correctly
- [ ] Speed controls affect game time

### When to Update TestScene
- After adding new enemy types
- When implementing new power-ups
- After modifying physics settings
- When changing collision detection
- After updating player mechanics
- When adding new game features

---

*Last Updated: September 2024*  
*TestScene Version: 1.0*  
*Compatible with: Treasure Quest v1.0*