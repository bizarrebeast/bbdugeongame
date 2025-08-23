# Player Sprite Replacement Plan

## Overview
Replace current tilting/skewing player animations with a cleaner two-layer sprite system for more precise control and better visual aesthetics.

## Architecture

### Two-Layer System
```
Player Container
├── Body Sprite (upper layer)
│   ├── Subtle vertical bob (idle & walking)
│   ├── Multiple face expressions
│   └── Follows physics for jumping
└── Legs Container (lower layer)
    ├── Front Leg Sprite
    ├── Back Leg Sprite
    └── Independent piston animation
```

### Split Point
- Sprites split at the waist
- Body: Large chunky rectangular shape
- Legs: Separate sprites animating independently

## Movement States

### IDLE (Standing Still)
- **Legs**: Both feet on floor
- **Body**: Subtle up/down bob animation
- **Face**: Random expressions rotating

### WALKING
- **Legs**: Piston-like alternating motion
  - Fixed animation speed (NOT tied to movement speed)
  - Multiple frames for smooth animation
  - Left leg down → Right leg down → repeat
- **Body**: Subtle up/down bob synced with leg movement
  - Body goes slightly down when leg goes up (natural walk)
- **Face**: Random expressions + some assigned

### JUMPING
- **Legs**: 
  - Front leg goes up
  - Back leg stays down
  - Front/back determined by facing direction
- **Body**: Follows jump physics arc
- **Face**: Special jump expression

### LADDER CLIMBING
- **No changes** - Keep existing ladder sprites
- Current climbing animations remain unchanged

## Direction Facing

### Facing RIGHT
- Right leg = front (closer to viewer)
- Left leg = back (further from viewer)
- When jumping: Right leg up, left leg down
- Both layers flip horizontally

### Facing LEFT
- Left leg = front (closer to viewer)
- Right leg = back (further from viewer)
- When jumping: Left leg up, right leg down
- Both layers flip horizontally

## Face Expression System
- Some expressions rotate randomly (timer-based)
- Some expressions assigned to specific events:
  - Jump expression when jumping
  - Hurt expression when damaged
  - Victory expression on level complete
  - Idle expressions when standing

## Sprite Requirements

### Needed from Designer:
1. **Leg Sprites**
   - Multiple positions for smooth piston animation
   - Separate sprites for each position
   - Both left and right leg variants

2. **Body Sprites**
   - Walking expression face
   - Jumping expression face
   - Multiple idle expressions
   - Any special event expressions

3. **Format**
   - Individual sprite files for each frame
   - Consistent anchor points for easy alignment

## Implementation Tasks

### Code Changes Required:
1. **Remove**:
   - All tilt/skew deformation code
   - Complex rotation calculations
   - Current sprite animation system

2. **Add**:
   - Two-layer container structure
   - Independent leg animation controller
   - Body bob animation (idle & walk)
   - Face expression rotation system
   - Clean sprite-swap based animation

3. **Maintain**:
   - All physics and collision detection
   - Talking bubble mechanics (unchanged)
   - Game mechanics and controls
   - Ladder climbing system

## Technical Notes

### Animation Timing
- Leg piston speed: Fixed rate for visual consistency
- Body bob: Synced to leg movement
- Face changes: Mix of random intervals and event triggers

### Sprite Layering
- Body sprite depth: Above legs
- Legs sprite depth: Below body
- Both contained in player container
- Container handles all physics/movement

### Performance Considerations
- Use sprite pooling for expressions
- Preload all animation frames
- Minimize texture swaps per frame

## Testing Requirements
1. Verify smooth leg animations at all movement speeds
2. Test direction changes (sprite flipping)
3. Confirm jump animations (front leg up)
4. Check face expression rotations
5. Ensure ladder climbing still works
6. Test all collision detection unchanged

## Status
**PENDING** - Waiting for sprite assets from designer

---
*Last Updated: [Current Date]*
*This plan supersedes all previous player animation systems*