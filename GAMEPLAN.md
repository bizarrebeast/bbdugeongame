# Game Plan: Retro Endless Climber

## Core Concept
A retro simplified Donkey Kong style game where the player climbs levels on ladders in an endless fashion to get more points, with player goals for bonuses and progressively increasing difficulty.

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

### Controls
- **Mobile:** Touch controls with virtual joystick and buttons
- **Desktop:** Arrow keys for movement, spacebar for jump, control/shift for fire

## Level Design

### Structure
- Single endless tower with procedurally generated floor layouts
- Increases in complexity as player climbs higher
- Each floor maintains consistent core mechanics
- Varying platform arrangements and enemy placement

### Procedural Generation Rules
- Ensure all platforms are reachable
- Maintain fair ladder placement
- Balance enemy density with available safe zones
- Guarantee at least one path upward

## Enemies & Obstacles

### Enemy Types
- **Spiders:** Crawl along platforms and down ladders
- **Beetles:** Move horizontally across platforms
- **Movement Patterns:** Predictable crawling patterns that players can learn and time movements around
- **No rolling objects** - focus on pattern-based challenges

## Power-ups & Collectibles

### Collectible Items
1. **Coins:** Basic point value items scattered throughout levels
2. **Power-up Items:** Grant temporary abilities

### Temporary Abilities
- **Invincibility:** Brief immunity to enemies (5-10 seconds)
- **Speed Boost:** Faster climbing and movement (8-12 seconds)
- **Double Points:** Multiplies all points earned (15-20 seconds)
- **Visual Indicators:** Each power-up displays remaining time via UI element

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

## Scoring System

### Point Awards
- **Defeating Enemies:** 100 points per enemy
- **Collecting Coins:** 50 points per coin
- **Height Milestones:** Bonus points every 10 floors (500, 1000, 1500, etc.)
- **Power-up Collection:** 200 points
- **Combo System:** Consecutive actions without taking damage multiply score

### High Score Integration
- Remix platform handles leaderboard integration
- Daily, weekly, and all-time high scores
- Player profile tracking for personal bests

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

## MVP Features (Priority Order)

1. Basic movement and ladder climbing
2. Single enemy type (beetles)
3. Simple procedural floor generation
4. Coin collection and basic scoring
5. One power-up type (invincibility)
6. Local high score tracking
7. Basic UI (score, lives, current floor)

## Post-MVP Roadmap

- Additional enemy types (spiders)
- Full power-up system
- Online leaderboards via Remix
- Sound effects and background music
- Multiple character skins
- Achievement system
- Daily challenges
- Mobile touch control optimization

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