# 📋 SPRINT: CAT CHAOS UPDATE

## Sprint Goal
Transform the game with cat enemies, combat system, visibility mechanics, and enhanced collectibles.

## 1. Enemy System Overhaul 🐱

### Cat Enemy Types
**Ground Cats (formerly beetles):**
- **Blue Cat:** Standard patrol behavior at normal speed
- **Yellow Cat:** Slower speed, slightly random movement patterns  
- **Green Cat:** Bouncing movement, travels full floor width

**Ceiling Cats (new enemy type):**
- Start attached to ceiling (bottom of floor above)
- Drop trigger: Player passes underneath and moves 1 tile away
- Fall straight down with flip animation
- Brief landing pause, then chase player at 1.5x speed
- Can be squished after landing
- Placement: 0-1 per floor until level 20, then 0-2 per floor

### Implementation Notes:
- Rename Beetle.ts to Cat.ts and update all references
- Create CeilingCat.ts extending Cat with drop behavior
- Add color property to Cat class for visual variety
- Implement chase AI with 1.5x speed multiplier

## 2. Combat System 🎯

### Jump-to-Kill Mechanic
- Player can kill cats by jumping on them
- **Bounce behavior:** Auto-bounce on kill (slightly less than normal jump)
- **Points:** 200 points per cat killed
- **Squish animation:** Simple scale down effect
- **Vulnerability:** Ceiling cats only vulnerable after landing

### Combo System
- **Window:** 1 second between kills to maintain combo
- **Multiplier:** 1x → 2x → 3x → 4x → etc.
- **Score calculation:** 200 × combo multiplier
- **Visual feedback:** "COMBO x2!" popup text
- **Mid-air reset:** Successful kill resets jump for chain combos

## 3. Visibility System (Vignette) 🔦

### Darkness Mechanic
- **Complete black** outside player's visibility radius
- **Radius:** 5 tiles around player
- **Hard edge** transition (no gradual fade)
- **Dynamic:** Areas re-hide when player moves away
- **Affects everything:** Platforms, ladders, enemies, coins all hidden

### Flash Power-up
- **Effect:** Reveals full screen for 5 seconds
- **Sources:** Treasure chests (random), collectible after floor 20
- **Visual indicator:** Timer or flash icon in UI

## 4. Enhanced Collectibles System 💎

### Item Types & Values
1. **Regular Coins:** 50 points (current, most common)
2. **Blue Coins:** 500 points (worth 10 regular coins)
3. **Diamonds:** 1000 points
4. **Treasure Chests:** 2500 points + contents
5. **Flash Power-up:** Special ability item

### Rarity & Placement
- **Regular coins:** 2-4 per floor (current)
- **Blue coins:** 1 per 1-2 floors
- **Diamonds:** 1 per 1-3 floors  
- **Treasure chests:** 1 per 1-3 floors (starting floor 3)
- **Placement:** Random + challenging spots for rare items

### Treasure Chest Mechanics
- Requires action button ("E" key / mobile "ACTION" button)
- Button appears left of jump button when near chest
- Brief opening animation (player vulnerable)
- **Contents:** 5-10 coins + chance of diamond + chance of flash power-up
- Full reset on death (chests respawn)

## 5. UI/UX Updates 🎨

### Point Popups
- **All collectibles:** Show "+50", "+500", "+1000" etc.
- **Enemy kills:** Show "+200" with combo multiplier
- **Chest opening:** Show total value gained
- **Style:** Float up and fade out animation

### Action Button
- Desktop: "E" key for interaction
- Mobile: "ACTION" button (left of jump)
- Larger text than jump button
- Only visible when near interactable

### Movement Support
- Add WASD as alternative to arrow keys
- W = Up, A = Left, S = Down, D = Right
- Both control schemes work simultaneously

## Technical Implementation Order 📝

### Phase 1: Cat Enemy Reskin
- [ ] Convert beetles to cats with color variants
- [ ] Implement behavior differences per color
- [ ] Add squish death animation

### Phase 2: Combat System
- [ ] Add jump-to-kill detection
- [ ] Implement bounce mechanic
- [ ] Create combo system with multipliers
- [ ] Add point popup system

### Phase 3: Ceiling Cats
- [ ] Create CeilingCat class
- [ ] Implement drop trigger logic
- [ ] Add chase AI
- [ ] Integrate with combat system

### Phase 4: Visibility System
- [ ] Create darkness overlay
- [ ] Implement 5-tile visibility radius
- [ ] Add dynamic reveal/hide system
- [ ] Ensure proper depth ordering

### Phase 5: Enhanced Collectibles
- [ ] Add blue coins and diamonds
- [ ] Create treasure chest system
- [ ] Implement action button
- [ ] Add flash power-up

### Phase 6: Polish
- [ ] Add all point popups
- [ ] Implement WASD controls
- [ ] Test and balance difficulty
- [ ] Optimize performance with visibility system

## Success Criteria ✅
- All cat enemy types working with unique behaviors
- Combat system allows skillful combo play
- Visibility creates tension and exploration feel
- Collectible variety adds strategic choices
- All features work on mobile and desktop

## Notes for Implementation
- Start with Phase 1 to establish visual identity
- Test each phase thoroughly before moving on
- Keep mobile controls in mind for all new features
- Performance test visibility system early