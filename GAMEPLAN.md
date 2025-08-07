# Bizarre Underground: Retro Endless Climber ✅ IMPLEMENTED

## Core Concept
A retro simplified Donkey Kong style game where the player climbs levels on ladders in an endless fashion to get more points, with player goals for bonuses and progressively increasing difficulty.

**🎮 GAME STATUS: FULLY PLAYABLE** - Complete with mobile touch controls, endless generation, and all core mechanics!

## Game Details

### Genre & Visual Style
- **Genre:** Vintage style arcade platformer
- **Art Style:** Cartoonish/pixel art based on custom illustrations
- **Platform:** Cross-platform (mobile and desktop)

### Setting & Theme
- **Environment:** Underground cavern/mine setting
- **Visual Elements:** Brick platforms reminiscent of classic Mario underground levels
- **Atmosphere:** Dark cavern with atmospheric lighting effects

### Target Experience
Fast-paced arcade excitement with a nostalgic feel - players should experience the thrill of 'just one more level' as they chase high scores, combined with the satisfying challenge of mastering timing and pattern recognition.

## Gameplay Mechanics

### Core Actions
- **Movement:** Joystick/arrow keys for horizontal movement
- **Climbing:** Up/down on ladders
- **Jumping:** Jump button to clear gaps and avoid enemies
- **Combat:** Fire button to defeat enemies (if applicable)

### Controls ✅ IMPLEMENTED
- **Mobile:** ✅ Virtual joystick for movement/climbing + jump button with multi-touch support
- **Desktop:** ✅ Arrow keys for movement/climbing, spacebar for jump
- **Dual Input:** ✅ Both control schemes work simultaneously

## Level Design ✅ IMPLEMENTED

### Structure ✅ FULLY BUILT
- ✅ Single endless tower with procedurally generated floor layouts  
- ✅ Dynamically generates new floors as player climbs higher
- ✅ 24-tile wide floors for dynamic gameplay (expanded from 14 tiles)
- ✅ Varying platform arrangements with random gaps
- ✅ Smart ladder placement distributed across floor thirds

### Procedural Generation Rules ✅ ACTIVE
- ✅ Ensures all platforms are reachable via ladder placement validation
- ✅ Smart ladder positioning with solid ground validation above/below
- ✅ Balanced enemy density (2-4 beetles per complete floor, 1-2 per gap sections)
- ✅ Guarantees upward progression with proper ladder connections
- ✅ 70% chance of gaps per floor for variety
- ✅ Ground floor protection prevents infinite falling

## Enemies & Obstacles ✅ IMPLEMENTED

### Enemy Types ✅ ACTIVE
- **Beetles:** ✅ Move horizontally across platforms with patrol boundaries
- **Movement Patterns:** ✅ Predictable back-and-forth patterns within platform sections
- **Collision Behavior:** ✅ Beetles reverse direction when hitting each other
- **Smart Placement:** ✅ Respect platform gaps and safe zones
- **No Falling:** ✅ Beetles stay on their designated platform sections

### Future Additions 🔄 PLANNED
- **Spiders:** Crawl along platforms and down ladders (not yet implemented)

## Power-ups & Collectibles

### Collectible Items ✅ PARTIAL IMPLEMENTATION
1. **Coins:** ✅ Basic point value items scattered throughout levels with spinning animations
2. **Power-up Items:** 🔄 Grant temporary abilities (planned for future)

### Coin System ✅ ACTIVE
- ✅ 2-4 coins randomly placed per floor on solid platforms
- ✅ Avoid ladder positions for clean gameplay
- ✅ Collection animation with scale/fade effects
- ✅ 50 points per coin collected

### Future Power-ups 🔄 PLANNED
- **Invincibility:** Brief immunity to enemies (5-10 seconds)
- **Speed Boost:** Faster climbing and movement (8-12 seconds)  
- **Double Points:** Multiplies all points earned (15-20 seconds)

## Difficulty Progression

### Scaling Elements
- Gradual enemy speed increases as height increases
- Higher enemy spawn frequency at greater heights
- More complex platform arrangements every X floors

### Future Additions (Post-MVP)
- New enemy types with unique patterns
- Narrower platforms requiring precise jumps
- Longer gaps between platforms
- Moving platforms or environmental hazards

## Scoring System ✅ IMPLEMENTED

### Point Awards ✅ ACTIVE
- **Collecting Coins:** ✅ 50 points per coin
- **Height Milestones:** ✅ 500 bonus points for reaching new floors
- **Professional HUD:** ✅ Real-time score display with stylish UI

### Current Implementation ✅ WORKING
- ✅ Live score tracking with formatted display
- ✅ Floor counter showing current height
- ✅ Semi-transparent HUD background for readability
- ✅ Bold styling for clear mobile visibility

### Future Additions 🔄 PLANNED
- **Defeating Enemies:** 100 points per enemy (combat system needed)
- **Combo System:** Consecutive actions multiply score
- **High Score Integration:** Remix platform leaderboards

## Player Character

### Design
- Custom character based on original artwork
- Unique jumpman-style character with personality
- Smooth animation states for:
  - Idle
  - Walking
  - Climbing
  - Jumping
  - Power-up activation

### Abilities
- Standard movement and jumping
- Ladder climbing
- Future: Potential for unlockable characters with slight stat variations

## Technical Implementation Notes

### Phaser.js Considerations
- Use Phaser's built-in physics for platforming mechanics
- Implement tile-based level generation system
- Sprite-based animation system for characters and enemies
- Particle effects for power-ups and collectibles

### Remix Integration
- Server-side high score validation
- User authentication for leaderboards
- Progressive enhancement for offline play
- Save game state to local storage

## MVP Features ✅ COMPLETED

1. ✅ **Basic movement and ladder climbing** - Full keyboard + touch controls
2. ✅ **Single enemy type (beetles)** - Smart patrol AI with collision behavior  
3. ✅ **Procedural floor generation** - Dynamic endless levels with gaps and ladders
4. ✅ **Coin collection and basic scoring** - Animated coins with point system
5. ✅ **Professional UI** - Score, floor counter, and styled HUD
6. ✅ **Mobile optimization** - Full touch controls with multi-touch support
7. ✅ **Game over system** - Collision detection with restart functionality

## Post-MVP Roadmap 🔄 FUTURE DEVELOPMENT

### High Priority
- **Additional enemy types** - Spiders that climb ladders
- **Power-up system** - Invincibility, speed boost, double points
- **Sound effects and background music** - Retro arcade audio
- **Combat system** - Ability to defeat enemies for points

### Medium Priority  
- **Online leaderboards** - Remix platform integration
- **Achievement system** - Milestone rewards
- **Multiple character skins** - Unlockable appearances
- **Enhanced visuals** - Better sprites and animations

### Lower Priority
- **Daily challenges** - Special objectives
- **Advanced level features** - Moving platforms, environmental hazards
- **Social features** - Share scores, compete with friends

---

## 🎮 CURRENT GAME STATUS: FULLY PLAYABLE

**✅ What's Working:**
- Complete mobile and desktop gameplay
- Endless procedural generation
- Enemy AI with collision behavior  
- Coin collection system
- Professional UI and controls
- Multi-touch support for mobile
- Game over and restart system
- Ground floor boundary protection

---

## 📋 NEXT SPRINT: CAT CHAOS UPDATE

### 1. Enemy System Overhaul 🐱

#### Cat Enemy Types
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

#### Implementation Notes:
- Rename Beetle.ts to Cat.ts and update all references
- Create CeilingCat.ts extending Cat with drop behavior
- Add color property to Cat class for visual variety
- Implement chase AI with 1.5x speed multiplier

### 2. Combat System 🎯

#### Jump-to-Kill Mechanic
- Player can kill cats by jumping on them
- **Bounce behavior:** Auto-bounce on kill (slightly less than normal jump)
- **Points:** 200 points per cat killed
- **Squish animation:** Simple scale down effect
- **Vulnerability:** Ceiling cats only vulnerable after landing

#### Combo System
- **Window:** 1 second between kills to maintain combo
- **Multiplier:** 1x → 2x → 3x → 4x → etc.
- **Score calculation:** 200 × combo multiplier
- **Visual feedback:** "COMBO x2!" popup text
- **Mid-air reset:** Successful kill resets jump for chain combos

### 3. Visibility System (Vignette) 🔦

#### Darkness Mechanic
- **Complete black** outside player's visibility radius
- **Radius:** 5 tiles around player
- **Hard edge** transition (no gradual fade)
- **Dynamic:** Areas re-hide when player moves away
- **Affects everything:** Platforms, ladders, enemies, coins all hidden

#### Flash Power-up
- **Effect:** Reveals full screen for 5 seconds
- **Sources:** Treasure chests (random), collectible after floor 20
- **Visual indicator:** Timer or flash icon in UI

### 4. Enhanced Collectibles System 💎

#### Item Types & Values
1. **Regular Coins:** 50 points (current, most common)
2. **Blue Coins:** 500 points (worth 10 regular coins)
3. **Diamonds:** 1000 points
4. **Treasure Chests:** 2500 points + contents
5. **Flash Power-up:** Special ability item

#### Rarity & Placement
- **Regular coins:** 2-4 per floor (current)
- **Blue coins:** 1 per 1-2 floors
- **Diamonds:** 1 per 1-3 floors  
- **Treasure chests:** 1 per 1-3 floors (starting floor 3)
- **Placement:** Random + challenging spots for rare items

#### Treasure Chest Mechanics
- Requires action button ("E" key / mobile "ACTION" button)
- Button appears left of jump button when near chest
- Brief opening animation (player vulnerable)
- **Contents:** 5-10 coins + chance of diamond + chance of flash power-up
- Full reset on death (chests respawn)

### 5. UI/UX Updates 🎨

#### Point Popups
- **All collectibles:** Show "+50", "+500", "+1000" etc.
- **Enemy kills:** Show "+200" with combo multiplier
- **Chest opening:** Show total value gained
- **Style:** Float up and fade out animation

#### Action Button
- Desktop: "E" key for interaction
- Mobile: "ACTION" button (left of jump)
- Larger text than jump button
- Only visible when near interactable

#### Movement Support
- Add WASD as alternative to arrow keys
- W = Up, A = Left, S = Down, D = Right
- Both control schemes work simultaneously

### Technical Implementation Order 📝

1. **Phase 1: Cat Enemy Reskin**
   - Convert beetles to cats with color variants
   - Implement behavior differences per color
   - Add squish death animation

2. **Phase 2: Combat System**
   - Add jump-to-kill detection
   - Implement bounce mechanic
   - Create combo system with multipliers
   - Add point popup system

3. **Phase 3: Ceiling Cats**
   - Create CeilingCat class
   - Implement drop trigger logic
   - Add chase AI
   - Integrate with combat system

4. **Phase 4: Visibility System**
   - Create darkness overlay
   - Implement 5-tile visibility radius
   - Add dynamic reveal/hide system
   - Ensure proper depth ordering

5. **Phase 5: Enhanced Collectibles**
   - Add blue coins and diamonds
   - Create treasure chest system
   - Implement action button
   - Add flash power-up

6. **Phase 6: Polish**
   - Add all point popups
   - Implement WASD controls
   - Test and balance difficulty
   - Optimize performance with visibility system

## Art Assets Needed

- Character sprite sheet (idle, walk, climb, jump)
- Enemy sprites (beetle, spider)
- Tileset for platforms and ladders
- Background art for cavern atmosphere
- UI elements (score display, power-up indicators)
- Collectible sprites (coins, power-ups)
- Particle effects (collection sparkles, power-up auras)

## Audio Requirements

- Background music (retro arcade style, looping)
- Jump sound effect
- Climbing sound effect
- Enemy defeat sound
- Coin collection sound
- Power-up activation sound
- Level milestone fanfare
- Game over jingle

---

*This document will be updated as development progresses and new ideas emerge.*