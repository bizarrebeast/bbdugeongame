# Sprint Plan: Visual Scale Enhancement via Floor Spacing

## Overview
**Goal**: Increase the visual size of all character sprites (player, enemies) by increasing the distance between floors while maintaining current gameplay mechanics and balance.

## Current State Analysis
- **Current Floor Spacing**: 160 pixels (5 tiles × 32 pixels/tile)
- **Current Player Sprite**: 48×64 pixels
- **Current Enemy Sprites**: 36×36 pixels (most), 52×52 pixels (red)
- **Current Physics Body (Player)**: 28×55 pixels
- **Current Jump Height**: Configured to reach one floor up

## Proposed Changes
- **Target Floor Spacing**: 240-320 pixels (7.5-10 tiles equivalent)
- **Target Player Sprite**: 72×96 pixels (1.5× scale) or 96×128 pixels (2× scale)
- **Target Enemy Sprites**: Scale proportionally to match

## Sprint Tasks

### Phase 1: Research & Planning
- [ ] **1.1 Measure Current Metrics**
  - Document exact floor spacing in GameScene
  - Measure jump arc heights and distances
  - Record enemy movement speeds relative to floor size
  - Note ladder heights and positions
  - Document camera viewport constraints

- [ ] **1.2 Determine Optimal Scale Factor**
  - Test 1.5× scale (240px floors, 72×96 player)
  - Test 2× scale (320px floors, 96×128 player)
  - Evaluate visual clarity at each scale
  - Consider mobile screen constraints

- [ ] **1.3 Physics Calculations**
  - Calculate new jump velocity for scaled floor heights
  - Determine if gravity needs adjustment
  - Plan movement speed scaling (if needed)

### Phase 2: Core Implementation

- [ ] **2.1 Floor System Refactor**
  - Create FLOOR_SPACING constant in GameSettings
  - Update createTestLevel() floor generation logic
  - Adjust platform Y-positioning calculations
  - Update dynamic floor generation

- [ ] **2.2 Player Scaling**
  - Scale player sprite display size
  - Maintain or scale physics body proportionally
  - Adjust sprite offsets for proper alignment
  - Update all player animation sprites

- [ ] **2.3 Jump & Movement Tuning**
  - Adjust jumpVelocity to reach new floor heights
  - Test and tune climbing speed for ladders
  - Verify player can still make precise platform jumps
  - Ensure movement feels responsive at new scale

- [ ] **2.4 Enemy Scaling**
  - Scale all enemy sprites (blue, yellow, green, red)
  - Adjust enemy physics bodies if needed
  - Maintain enemy-to-floor size ratios
  - Update stalker cat sprites

### Phase 3: Environmental Updates

- [ ] **3.1 Ladder System**
  - Extend ladder heights for new floor spacing
  - Adjust ladder climbing zones
  - Update ladder sprite tiling/stretching

- [ ] **3.2 Collectibles & Items**
  - Decide if collectibles scale (recommendation: keep same size)
  - Adjust Y-positioning for floor placement
  - Test collection hitboxes at new scale

- [ ] **3.3 Hazards & Obstacles**
  - Scale ceiling spikes proportionally
  - Adjust spike placement on ceilings
  - Update collision zones

- [ ] **3.4 Door & Level Transitions**
  - Adjust door positioning for top floor
  - Update intro animation distances
  - Scale door sprite if needed

### Phase 4: Visual Polish

- [ ] **4.1 Camera Adjustments**
  - Evaluate if camera zoom needs adjustment
  - Test visibility of 2-3 floors at once
  - Ensure smooth camera following

- [ ] **4.2 UI Scaling**
  - Keep UI elements at current size (recommendation)
  - Adjust UI positioning if needed
  - Test readability at new scale

- [ ] **4.3 Background & Effects**
  - Update visibility mask radius if needed
  - Adjust particle effect scales
  - Update background parallax if applicable

### Phase 5: Testing & Balancing

- [ ] **5.1 Gameplay Testing**
  - Verify all jumps are still makeable
  - Test enemy patrol patterns
  - Confirm collectibles are reachable
  - Check difficulty progression

- [ ] **5.2 Performance Testing**
  - Monitor frame rate with larger sprites
  - Check memory usage
  - Test on lower-end devices

- [ ] **5.3 Visual Testing**
  - Verify no sprite cutoff issues
  - Check for visual artifacts
  - Ensure animations look smooth
  - Test on different screen sizes

### Phase 6: Fine-tuning

- [ ] **6.1 Physics Fine-tuning**
  - Adjust micro-movements
  - Perfect jump feel
  - Tune enemy collision responses

- [ ] **6.2 Visual Fine-tuning**
  - Adjust sprite offsets
  - Perfect animation transitions
  - Polish visual effects

## Key Considerations

### Maintain Gameplay Feel
- Jump timing should feel identical
- Movement should remain responsive
- Enemy patterns should scale proportionally

### Potential Issues to Watch
1. **Performance**: Larger sprites = more pixels to render
2. **Screen Real Estate**: Less vertical floors visible at once
3. **Mobile Screens**: May need different scale for mobile
4. **Asset Quality**: Sprites may need higher resolution versions

### Configuration Strategy
```typescript
// GameSettings.ts additions
game: {
  SCALE_FACTOR: 1.5,  // or 2.0
  FLOOR_SPACING_MULTIPLIER: 1.5,  // Applied to base 160px
  SPRITE_SCALE: 1.5,  // Visual scale for all characters
  MAINTAIN_PHYSICS_SCALE: true,  // Keep physics bodies same relative size
}
```

## Success Metrics
- [ ] All sprites 1.5-2× larger visually
- [ ] Gameplay feels identical to current version
- [ ] No performance degradation
- [ ] Jump height reaches exactly one floor
- [ ] Enemies patrol without falling off platforms
- [ ] All collectibles remain accessible

## Rollback Plan
- Keep all scaling in configurable constants
- Maintain ability to switch between scale modes
- Tag commits for easy reversion
- Consider feature flag for A/B testing

## Estimated Timeline
- **Phase 1**: 2-3 hours (research & planning)
- **Phase 2**: 4-6 hours (core implementation)
- **Phase 3**: 3-4 hours (environmental updates)
- **Phase 4**: 2-3 hours (visual polish)
- **Phase 5**: 2-3 hours (testing)
- **Phase 6**: 2 hours (fine-tuning)

**Total Estimate**: 15-21 hours

## Notes for Discussion
1. Should we scale collectibles or keep them same size for visual hierarchy?
2. Do we want to maintain the same number of floors visible on screen?
3. Should enemy sprites scale exactly proportionally or slightly less?
4. Consider making scale factor configurable for different devices?
5. Do we need new higher-resolution sprite assets?

## Next Steps
1. Review this plan together
2. Decide on target scale factor (1.5× or 2×)
3. Create feature branch for implementation
4. Begin with Phase 1 measurements
5. Prototype one floor with new spacing to validate approach