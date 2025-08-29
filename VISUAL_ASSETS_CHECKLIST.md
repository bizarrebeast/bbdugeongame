# Visual Assets Creation Checklist 🎨

**Game:** Treasure Quest - Retro Endless Climber  
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

### Custom Overlay System ✅ COMPLETED
- [x] **Visibility Overlay**: Professional 2880×3200px black overlay with 320×320px transparent window
- [x] **Asymmetric Positioning**: Player positioned in lower 40% for optimal forward visibility
- [x] **Flash Power-up Effects**: Instant scaling and fade transitions for seamless experience

### Particle Effects
- [ ] **Coin Sparkles**: Small golden sparkles for coin collection
- [ ] **Diamond Sparkles**: Crystalline sparkles for diamond collection  
- [ ] **Chest Opening**: Treasure burst effect with coins/items
- [ ] **Blob Death**: Small explosion or poof effect
- [x] **Flash Activation**: Professional overlay scaling with instant fade effects
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

### Mobile Controls ✅ STREAMLINED
- [x] **Virtual Joystick**: Touch joystick background and handle (implemented)
- [x] **Jump Button**: Mobile jump button design (implemented)
- [x] **Simplified Interface**: Removed ACTION button for streamlined gameplay

## 🎭 MENU & SCREEN ASSETS

### Title Screen
- [ ] **Game Logo**: "Treasure Quest" title treatment
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

## 📏 RETINA DISPLAY & SIZING SPECIFICATIONS

### Game Canvas & Grid System
- **Canvas Size**: 450x800 pixels (9:16 portrait aspect ratio)
- **Tile System**: 32x32 pixel base tiles
- **Grid Dimensions**: 24 tiles wide × variable height
- **Floor Height**: 12 tiles per visible floor (384 pixels)
- **Pixel Density**: Automatic 2x scaling for retina displays via `devicePixelRatio`

### Player Character Specifications
- **Base Size**: 24x32 pixels (visual sprite)
- **Retina Size**: **48x64 pixels** (2x for crisp retina display)
- **Physics Body**: 20x30 pixels (smaller than visual sprite)
- **Sprite Offset**: 2x2 pixels for physics alignment
- **Animation Frames**: 4-6 frames recommended for smooth movement
- **File Format**: PNG with transparency

### Enemy Specifications (Blob Enemies)
- **Base Size**: 20x16 pixels (current cat/beetle placeholders)
- **Retina Size**: **40x32 pixels** (2x scaling)
- **Physics Body**: 18x14 pixels (current size, works well)
- **Maximum Safe Dimensions Without Affecting Gameplay**:
  - **Standard enemies**: Up to 32x32 pixels (1 tile square)
  - **Large enemies/mini-bosses**: Up to 48x48 pixels (1.5 tiles square)
  - **Boss enemies**: Up to 64x64 pixels (2 tiles square) - requires special platform handling
  - **Visual sprites can be larger than collision boxes** (e.g., 64x64 visual with 32x32 collision)
- **Animation Frames**: 2-4 frames per state
- **File Format**: PNG with transparency
- **Sprite Sheets**: Combine all animation frames in horizontal strips
- **Note**: Enemies must fit on platform tiles (32px wide) for patrol behavior

### Environment Tile Specifications
- **Base Tile Size**: 32x32 pixels
- **Retina Tile Size**: **64x64 pixels** (2x scaling)
- **Platform Tiles**: Seamlessly tileable edges
- **Ladder Segments**: 32-pixel height modules for easy stacking
- **Background Elements**: Can be larger (64x64, 96x96) for variety
- **File Format**: PNG for transparency, JPEG for solid backgrounds

### Collectible Asset Specifications
- **Regular Coins**: 16x16 base → **32x32 retina**
- **Special Coins/Diamonds**: 20x20 base → **40x40 retina**
- **Treasure Chest**: 32x24 base → **64x48 retina** (matches current code)
- **Power-ups**: 24x24 base → **48x48 retina**
- **Animation Frames**: 4-6 frames for spinning/glowing effects
- **File Format**: PNG with transparency

### UI Element Specifications
- **Mobile Touch Buttons**: Minimum 48x48 pixels → **96x96 retina**
- **HUD Elements**: 32-48 pixel heights → **64-96 retina**
- **Score Display**: Scalable vector fonts or 2x bitmap fonts
- **Progress Bars**: 8-12 pixel height → **16-24 retina**
- **File Format**: PNG for graphics, vector fonts preferred for text

### Particle Effect Specifications
- **Small Effects**: 8x8 base → **16x16 retina**
- **Medium Effects**: 16x16 base → **32x32 retina**
- **Large Effects**: 32x32 base → **64x64 retina**
- **Particle Count**: 4-8 frames for animated effects
- **File Format**: PNG with alpha transparency

### File Format Recommendations
- **Sprites with Transparency**: PNG-24 with alpha channel
- **Solid Backgrounds**: JPEG (smaller file size) or PNG-24
- **Simple Graphics**: PNG-8 for limited color palettes (smaller files)
- **Sprite Sheets**: PNG-24, organize frames in horizontal rows
- **Compression**: Use tools like TinyPNG for size optimization without quality loss

### Sprite Sheet Organization
```
Animation Sheet Layout (Horizontal):
[Frame 1][Frame 2][Frame 3][Frame 4]
Width: frame_width × frame_count
Height: frame_height
```

### Animation Timing Specifications
- **Idle Animations**: 500-1000ms per frame (slow, subtle)
- **Walking/Movement**: 100-200ms per frame (smooth motion)
- **Climbing**: 150-250ms per frame (moderate pace)
- **Death/Impact**: 50-100ms per frame (quick, snappy)
- **Collectible Spin**: 100-150ms per frame (eye-catching)
- **Power-up Glow**: 200-400ms per frame (pulsing effect)

### Device Scaling Considerations
- **Phaser Configuration**: `pixelArt: true`, `antialias: false`, `roundPixels: true`
- **Auto-scaling**: Phaser automatically handles 2x pixel density via `devicePixelRatio`
- **Canvas Scaling**: Uses `Phaser.Scale.FIT` with `CENTER_BOTH` for responsive design
- **Touch Targets**: Ensure all interactive elements are at least 44px (88px retina) for accessibility

### Quality Assurance Checklist
- [ ] All sprites created at 2x resolution for retina support
- [ ] Physics bodies properly sized and offset for gameplay accuracy
- [ ] Animation frames consistent in timing and size
- [ ] Transparency properly implemented for overlapping elements
- [ ] Sprite sheets organized for efficient memory usage
- [ ] File sizes optimized without quality degradation
- [ ] Test on both standard and retina displays for clarity

### Technical Notes
- **Memory Usage**: Retina assets use 4x memory (2x width × 2x height)
- **Load Times**: Larger files increase initial loading time
- **Optimization**: Use sprite atlases to reduce draw calls
- **Fallback**: Phaser automatically scales 1x assets if 2x unavailable
- **Testing**: Always test on actual mobile devices for true rendering quality

### Style Guidelines
- **Pixel Art Style**: Retro 16-bit inspired artwork with crisp edges
- **Color Palette**: Underground/mining theme (browns, grays, blues, gold accents)
- **Lighting**: Subtle highlights and shadows to enhance depth
- **Contrast**: High contrast for mobile visibility and accessibility
- **Theme**: Cartoonish but atmospheric cave/mine setting with personality

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