# Treasure Quest - Release Notes

## Version 1.0.1 - Balance Update

### Release Date: August 2025

### Changes
- **Difficulty Adjustments**:
  - Capped maximum enemies per floor to 5 (previously up to 7-8)
  - Reduced enemy counts across all tiers for better balance
  - Level 1 now spawns only 1 enemy per floor for gentle introduction
  - Fixed stalker enemies appearing in tutorial levels
- **Gameplay Improvements**:
  - Reduced minimum jump height for better control (allows tiny bounces)
  - Fixed HUD level counter not updating between levels
  - Added portal-sucking animation when enemies are defeated by crystal balls
  - New sound effects for door opening, power-up collection, and curse collection
- **UI Updates**:
  - Simplified HUD to show only level number (removed chapter text)
  - Fixed "Press UP" prompt not showing on level 1
  - Updated prompt styling to yellow text with black stroke

## Version 1.0.0 - Production Release

### Release Date: December 2024

### Overview
Treasure Quest is a retro-style endless climbing arcade game. Players climb through procedurally generated crystal caverns, defeat colorful blob enemies, collect treasures, and chase high scores in this nostalgic underground adventure.

### Core Features

#### Gameplay
- **50 Discrete Levels + Endless Beast Mode**: Progressive difficulty from levels 1-50, then unlimited Beast Mode
- **Bonus Levels**: Special treasure-filled bonus levels after every 10 levels
- **5-Floor Structure**: Each level features 5 floors with procedurally generated layouts
- **Retro Arcade Movement**: Classic 8-bit style controls with modern responsiveness
- **Jump-to-Kill Combat**: Defeat enemies by jumping on them, with combo multipliers
- **Mobile-Optimized**: 5:9 aspect ratio with full touch controls and virtual joystick

#### Visual Content
- **70 Unique Backgrounds**: Unprecedented visual variety
  - 50 main chapter backgrounds (Crystal, Volcanic, Steampunk, Electrified, Galactic)
  - 7 bonus level backgrounds
  - 13 Beast Mode exclusive backgrounds
- **5 Themed Chapters**: Each with distinct visual style and atmosphere
- **Dynamic Chapter Transitions**: Visual announcements when entering new chapters
- **Custom Player Animations**: 9 unique sprites with smart state management

#### Enemy System
- **7 Enemy Types**: Each with unique behaviors and point values
  - Caterpillar (50 points) - Slow random movement
  - Rollz (75 points) - Simple patrol
  - Chomper (100 points) - Standard patrol
  - Snail (150 points) - Faster patrol
  - Bouncer (200 points) - Fast bouncing movement
  - Stalker (300 points) - Activates and chases player
  - Blu (1000 points) - Immovable blocker (only vulnerable when invincible)
- **6-Tier Progressive Spawning**: Dynamic difficulty scaling
- **Anti-Clustering Algorithm**: Ensures fair enemy distribution

#### Collectibles & Power-ups
- **Gems**: Standard collectible (50 points, 150 = extra life)
- **Blue Gems**: Rare gems (500 points)
- **Diamonds**: Valuable gems (1000 points)
- **Heart Crystals**: Extra life (2000 points)
- **Treasure Chests**: Random rewards (2500 points + items)
- **Pendant**: Invincibility for 10 seconds
- **Crystal Ball**: Throw projectiles for 20 seconds
- **Cursed Orb**: Darkness effect for 10 seconds
- **Teal Orb**: Reversed controls for 10 seconds

#### Audio
- **Original Soundtrack**: "Crystal Cavern" - custom composed background music
- **Dynamic Sound Effects**: 
  - Collectible sounds with variety
  - Enemy defeat sounds
  - Power-up activation
  - UI feedback sounds

#### User Interface
- **Comprehensive HUD**: Lives, score, gems, level/chapter display
- **Enhanced Game Over Stats**: 
  - Total score with breakdown
  - Enemies defeated by type
  - Treasure chests opened
  - Floor bonus earned
- **Animated Instructions**: Scrollable how-to-play with visual guides
- **Touch Controls**: Virtual D-pad and action buttons for mobile

### Technical Features
- **TypeScript + Phaser.js**: Type-safe game development
- **Hot-Reload Development**: Instant testing with QR codes
- **Single-File Build**: Optimized for Remix platform deployment
- **Background Management System**: Efficient loading of 70 backgrounds
- **Persistent Progress**: Saves furthest level reached
- **Debug Mode**: Hitbox visualization for development

### Platform Integration
- **Remix SDK**: Full integration with platform features
- **Leaderboard Ready**: Score system designed for competitive play
- **Mobile-First Design**: Optimized for vertical mobile screens
- **Cross-Device Support**: Works on desktop and mobile browsers

### Known Features
- Bonus levels appear after levels 10, 20, 30, 40, and 50
- Beast Mode (51+) rotates through all 70 backgrounds for maximum variety
- Spike hazards on floors and ceilings (except in bonus levels)
- Procedurally generated gaps and platform layouts
- Smart enemy patrol zones that avoid ladders
- Progressive difficulty budget system for enemy spawning

### Credits
- **Music**: "Crystal Cavern" - Original composition
- **Development**: Built with Phaser.js and TypeScript
- **Platform**: Designed for Remix

### Future Enhancements (Post 1.0)
- Additional enemy types
- New power-ups and collectibles
- Seasonal backgrounds and themes
- Multiplayer features
- Achievement system
- Custom character skins

---

## Installation & Deployment

### For Developers
```bash
npm install
npm run dev
```

### For Production
```bash
npm run build
# Copy contents of dist/index.html to Remix platform
```

### System Requirements
- Modern web browser with WebGL support
- Mobile: iOS 12+ or Android 8+
- Desktop: Chrome, Firefox, Safari, or Edge (latest versions)

---

*Thank you for playing Treasure Quest! For support or feedback, please contact the development team.*