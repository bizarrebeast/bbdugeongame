# Bizarre Underground - Gem & Item Asset List

## 🎮 Current Display Sizes in Game

### Platform/World Info
- **Tile Size**: 32x32 pixels
- **Canvas**: 450x800 pixels (9:16 portrait)
- **Player Sprite**: 48x64 pixels (scaled display size)
- **Blue Enemy**: 36x36 pixels (scaled display size)

---

## 💎 GEM COLLECTIBLES (Single Gems)

### Regular Coins (Size: 8 pixel radius = ~16x16px display)
Each gem should be created at a larger size (e.g., 64x64px) for quality, game will scale down.

1. **Gold Coin** 
   - Color: #FFD700 (Gold)
   - Shape: Round Brilliant Cut (circular with radial facets)
   - Suggested asset size: 64x64px
   
2. **Pink Gem**
   - Color: #FF69B4 (Hot Pink)
   - Shape: Pear/Teardrop Cut (pointed bottom, rounded top)
   - Suggested asset size: 64x80px (taller for teardrop shape)
   
3. **Purple Gem**
   - Color: #9370DB (Medium Purple)
   - Shape: Oval Cut (horizontal ellipse)
   - Suggested asset size: 80x64px (wider than tall)
   
4. **Deep Pink Gem**
   - Color: #FF1493 (Deep Pink)
   - Shape: Marquise Cut (pointed eye/football shape)
   - Suggested asset size: 96x48px (elongated horizontal)
   
5. **Orchid Gem**
   - Color: #BA68C8 (Medium Orchid)
   - Shape: Cushion Cut (rounded square)
   - Suggested asset size: 64x64px

### Blue Coins (Size: 10 pixel radius = ~20x20px display)
Higher value, slightly larger than regular coins.

6. **Teal Gem** (5 variations of same shape, different shades)
   - Colors: 
     - #008080 (Teal)
     - #20B2AA (Light Sea Green)
     - #40E0D0 (Turquoise)
     - #48D1CC (Medium Turquoise)
     - #00CED1 (Dark Turquoise)
   - Shape: Emerald Cut (rectangular with cut corners)
   - Suggested asset size: 64x80px (taller rectangle)

### Diamond (Special - Size: 24x24px display)
Already exists in game as programmatic art, but if you want to create an asset:

7. **Diamond**
   - Colors: Multi-tone purple (#E6E6FA table, #DDA0DD crown, #B19CD9 pavilion)
   - Shape: Classic diamond cut with visible table, crown, and pavilion
   - Suggested asset size: 96x96px

---

## 📦 TREASURE CHEST

### Current Implementation (programmatic)
- **Display Size**: 32x24 pixels (closed), 32x32 pixels (open)
- **Colors**: 
  - Wood: #8B4513 (Saddle Brown)
  - Metal trim: #FFD700 (Gold)
  - Inside (open): #FFD700 (Gold coins visible)

### Suggested Asset Specs
8. **Treasure Chest - Closed**
   - Size: 64x48px (will scale to 32x24px in game)
   - Wooden chest with metal/gold trim
   - Lock/latch visible
   
9. **Treasure Chest - Open**
   - Size: 64x64px (will scale to 32x32px in game)
   - Open lid showing treasure inside
   - Gold coins/gems visible inside
   - Could include sparkle effects

---

## 🚪 LEVEL EXIT DOOR

### Current Implementation (programmatic)
- **Display Size**: 40x60 pixels
- **Style**: Mining/underground theme matching ladder aesthetics
- **Colors**:
  - Frame: #8B4513 (Saddle Brown - wood)
  - Metal: #696969 (Dim Gray)
  - Handle: #FFD700 (Gold)

### Suggested Asset Specs
10. **Exit Door - Closed**
    - Size: 80x120px (will scale to 40x60px in game)
    - Mining/underground themed
    - Wooden with metal reinforcements
    - Could include:
      - Planked wood texture
      - Metal hinges/bolts
      - Handle or wheel lock
      - "EXIT" sign or arrow
    
11. **Exit Door - Open** (optional)
    - Size: 80x120px
    - Same door but open/ajar
    - Bright light coming through
    - Creates anticipation for next level

---

## 🎨 Visual Style Guidelines

### Overall Aesthetic
- **Theme**: Underground mining/treasure hunting
- **Style**: Clean, colorful, slightly cartoonish
- **Lighting**: Gems should have bright highlights to show they're valuable
- **Contrast**: Items should stand out against dark cave backgrounds

### Gem Characteristics
- **Facets**: Visible cut lines to show these are cut gems, not rough stones
- **Highlights**: White/bright spot to show light reflection
- **Shadows**: Subtle darker areas for depth
- **Sparkle**: Optional particle effects or star highlights

### Consistency Requirements
- All gems should feel like part of the same set
- Similar line weights if using outlines
- Consistent highlight positioning (e.g., top-left)
- Similar saturation levels across colors

---

## 📏 Scale Reference

For size reference in the game world:
- **1 tile** = 32x32 pixels
- **Player** = 1.5 tiles wide x 2 tiles tall
- **Regular gem** = 0.5 tiles (16x16px)
- **Blue gem** = 0.625 tiles (20x20px)
- **Diamond** = 0.75 tiles (24x24px)
- **Treasure chest** = 1 tile wide
- **Door** = 1.25 tiles wide x ~2 tiles tall

---

## 🔄 Animation Notes (Optional)

If creating animated versions:

### Gems
- Gentle rotation (360° over 2-3 seconds)
- Sparkle/twinkle effect every 1-2 seconds
- Subtle pulsing glow

### Treasure Chest
- Opening animation (lid rotating back)
- Sparkles emerging when opened
- Slight bounce when spawning

### Door
- Opening animation (swinging or sliding)
- Light rays when opening
- Optional: glowing outline when player is near

---

## 📝 File Naming Suggestions

```
gem_gold_round.png
gem_pink_pear.png
gem_purple_oval.png
gem_deeppink_marquise.png
gem_orchid_cushion.png
gem_teal_emerald_1.png (through _5 for variations)
diamond_special.png
treasure_chest_closed.png
treasure_chest_open.png
door_exit_closed.png
door_exit_open.png
```

---

## ✅ Priority Order

1. **Regular coin gems** (5 types) - Core collectibles
2. **Blue coin gems** (1 shape, 5 colors) - Higher value collectibles
3. **Treasure chest** (closed/open) - Bonus collectibles
4. **Exit door** - Level progression
5. **Diamond** - Special collectible (optional, already works programmatically)

---

## 💡 Additional Notes

- Assets should be created at 2-4x the display size for quality
- Use PNG format with transparency
- Keep file sizes reasonable (under 100KB per asset)
- Test assets against both light and dark backgrounds
- Consider creating a sprite sheet if making multiple animation frames

This should give you everything you need to create the gem and item assets! Let me know if you need any clarification on dimensions or visual requirements.