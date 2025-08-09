# Visual Assets Creation Checklist 🎨

**Game:** Bizarre Underground - Retro Endless Climber  
**Theme:** Underground mine/cave environment with retro pixel art style  
**Status:** Comprehensive asset list for artwork creation  

## 🎮 CORE GAMEPLAY ASSETS

### Player Character
- [ ] **Player Idle**: Standing animation (2-4 frames)
- [ ] **Player Walking**: Side-scrolling walk cycle (4-6 frames)  
- [ ] **Player Climbing**: Ladder climbing animation (4-6 frames)
- [ ] **Player Jumping**: Jump pose and landing (2-3 frames)
- [ ] **Player Death**: Death animation sequence (3-5 frames)
- [ ] **Player Flash State**: Glowing/invincible appearance during flash power-up

### Blob Enemies (4 Types)
- [ ] **Blue Blob**: Standard patrol enemy
  - [ ] Idle/patrol animation (2-3 frames)
  - [ ] Death/squish animation (2-3 frames)
- [ ] **Yellow Blob**: Slow random movement enemy
  - [ ] Idle/wobble animation (2-3 frames) 
  - [ ] Death/squish animation (2-3 frames)
- [ ] **Green Blob**: Fast bouncing enemy
  - [ ] Bouncing animation (3-4 frames)
  - [ ] Death/squish animation (2-3 frames)
- [ ] **Red Stalker Blob**: Mine behavior enemy
  - [ ] Hidden state: Invisible/barely visible
  - [ ] Warning state: Glowing yellow eyes (2-3 frames)
  - [ ] Active state: Full blob with menacing appearance
  - [ ] Death/squish animation (2-3 frames)

## 🏗️ ENVIRONMENT ASSETS

### Platforms & Structure
- [ ] **Ground Floor Tiles**: Solid earth/stone base (tileable)
- [ ] **Platform Tiles**: Brick/stone platform sections (tileable)
- [ ] **Ladder Sprites**: Wooden/metal ladder rungs (tileable)
- [ ] **Platform Edges**: Left and right end caps for platforms
- [ ] **Background Cave Walls**: Atmospheric cave wall texture
- [ ] **Cave Ceiling**: Rocky ceiling texture for upper areas

### Environmental Details
- [ ] **Stalactites**: Hanging cave formations (various sizes)
- [ ] **Cave Crystals**: Glowing crystal formations for atmosphere
- [ ] **Rock Debris**: Small rock piles and scattered stones
- [ ] **Water Drops**: Animated dripping water effect
- [ ] **Dust Particles**: Floating mine dust for atmosphere

## 💎 COLLECTIBLE ASSETS

### Coins & Valuables
- [ ] **Regular Coin**: Yellow/gold coin with spinning animation (4-6 frames)
- [ ] **Blue Coin**: Enhanced blue coin with spinning animation (4-6 frames)
- [ ] **Diamond**: Crystalline diamond with sparkle effects (3-4 frames)
- [ ] **Treasure Chest**: Closed and open states
  - [ ] Closed chest: Wooden chest with metal bindings
  - [ ] Opening animation: Lid opening sequence (3-4 frames)
  - [ ] Open chest: Chest with contents visible

### Power-ups
- [ ] **Flash Power-up**: Lightning/electricity themed item
  - [ ] Base item: Electric orb or battery
  - [ ] Blue glow effect: Pulsing aura around item (3-4 frames)
  - [ ] Collection effect: Electrical zap visual

## 🎨 VISUAL EFFECTS

### Particle Effects
- [ ] **Coin Sparkles**: Small golden sparkles for coin collection
- [ ] **Diamond Sparkles**: Crystalline sparkles for diamond collection  
- [ ] **Chest Opening**: Treasure burst effect with coins/items
- [ ] **Blob Death**: Small explosion or poof effect
- [ ] **Flash Activation**: Screen-wide electrical effect
- [ ] **Point Popup Numbers**: Floating score text (various point values)

### UI Effects
- [ ] **Combo Multiplier**: Visual indicator for combo chains
- [ ] **Floor Milestone**: Special effect for reaching new floors
- [ ] **Power-up Timer**: Circular progress indicator for flash duration

## 📱 UI ASSETS

### HUD Elements
- [ ] **Score Display Background**: Semi-transparent panel
- [ ] **Floor Counter Background**: Semi-transparent panel  
- [ ] **Flash Timer**: Circular countdown indicator
- [ ] **Game Over Screen**: Death screen with retry button
- [ ] **Pause Menu**: Game pause overlay

### Mobile Controls
- [ ] **Virtual Joystick**: Touch joystick background and handle
- [ ] **Jump Button**: Mobile jump button design
- [ ] **Action Button**: Mobile ACTION button for chests
- [ ] **Touch Indicators**: Visual feedback for touch inputs

## 🎭 MENU & SCREEN ASSETS

### Title Screen
- [ ] **Game Logo**: "Bizarre Underground" title treatment
- [ ] **Start Button**: Play/start game button
- [ ] **Settings Button**: Options/settings access
- [ ] **Background**: Title screen cave environment

### Transitions
- [ ] **Level Complete**: Victory screen for completed levels
- [ ] **Mining Cart**: Intro animation vehicle (side view)
- [ ] **Countdown Numbers**: 3-2-1 countdown graphics
- [ ] **Loading Screen**: Game loading indicator

## 🌟 FUTURE ASSETS (Planned Sprints)

### Advanced Enemies (Future)
- [ ] **Wall Crawler Spiders**: Web-spinning cave spiders
- [ ] **Ceiling Droppers**: Enemies that fall from above
- [ ] **Boss Creatures**: Large special encounter enemies

### Environmental Hazards (Future)
- [ ] **Falling Rocks**: Debris falling from ceiling
- [ ] **Spike Traps**: Retractable floor spikes
- [ ] **Crumbling Platforms**: Platforms that collapse
- [ ] **Moving Platforms**: Horizontally sliding platforms

### Biomes (Future)
- [ ] **Crystal Cavern**: Sparkling crystal cave environment
- [ ] **Underground River**: Water-themed cave sections
- [ ] **Deep Core**: Extreme depth environment assets

## 📏 TECHNICAL SPECIFICATIONS

### Size Guidelines
- **Sprites**: 32x32 or 48x48 pixels (consistent sizing)
- **Tiles**: 32x32 pixels for tileable elements
- **UI Elements**: Scalable for mobile (minimum 48px touch targets)
- **Effects**: Various sizes based on gameplay needs

### Style Guidelines
- **Pixel Art Style**: Retro 16-bit inspired artwork
- **Color Palette**: Underground/mining theme (browns, grays, blues)
- **Animation**: Smooth 8-12 fps for character animations
- **Contrast**: High contrast for mobile visibility
- **Theme**: Cartoonish but atmospheric cave/mine setting

## 📋 ASSET ORGANIZATION

### File Structure
```
/assets/sprites/
  /player/          - Player character animations
  /enemies/         - All blob enemy types  
  /environment/     - Platforms, ladders, cave elements
  /collectibles/    - Coins, diamonds, chests, power-ups
  /effects/         - Particle effects and visual impacts
  /ui/              - HUD elements and mobile controls
  /menus/           - Title screen and transition graphics
```

### Priority Order
1. **HIGH PRIORITY**: Player, enemies, basic platforms, collectibles
2. **MEDIUM PRIORITY**: Environment details, effects, UI elements
3. **LOW PRIORITY**: Menu graphics, future content assets

---

**Next Steps:**
1. Start with HIGH PRIORITY core gameplay assets
2. Create consistent pixel art style guide
3. Test assets in-game for sizing and visibility
4. Iterate based on gameplay feedback

This checklist will be updated as new assets are identified during development.