# Background System Implementation Guide

## Overview
This document outlines the implementation plan for the 50+ background system with chapter-based themes and optimized loading strategies.

## Chapter Structure

| Levels | Chapter Name | Theme Description | Background Count |
|--------|-------------|-------------------|------------------|
| 1-10 | Crystal Cavern | Underground crystal caves with glowing gems | ~10 backgrounds |
| 11-20 | Volcanic Crystal Cavern | Lava-infused crystal formations, heat effects | ~10 backgrounds |
| 21-30 | Steampunk | Industrial machinery, gears, steam pipes | ~10 backgrounds |
| 31-40 | Storm | Lightning, clouds, turbulent weather | ~10 backgrounds |
| 41-50 | Galactic | Space, stars, nebulae, cosmic themes | ~10 backgrounds |
| 51+ | Beast Mode | Random pool from all chapters + exclusive extras | All + extras |
| Bonus | Special Bonus | Unique backgrounds for bonus levels | ~5 backgrounds |

## Technical Implementation

### 1. BackgroundManager Class Structure
```typescript
class BackgroundManager {
  // Chapter definitions with level ranges and background arrays
  private chapters: Map<string, ChapterConfig>
  
  // Currently loaded textures tracking
  private loadedTextures: Set<string>
  private textureCache: Map<string, Phaser.Textures.Texture>
  
  // Performance settings
  private readonly MAX_CACHED_BACKGROUNDS = 10
  private readonly PRELOAD_COUNT = 2
  
  // Current state
  private currentChapter: string
  private currentLevel: number
  
  // Methods
  public async loadChapterBackgrounds(chapter: string): Promise<void>
  public unloadChapterBackgrounds(chapter: string): void
  public getBackgroundForLevel(level: number): string
  public preloadNextLevels(currentLevel: number): void
  public disposeUnusedTextures(): void
  public getChapterForLevel(level: number): string
}
```

### 2. Background URL Structure (To Be Added)
```typescript
// Example structure for when URLs are provided
const BACKGROUNDS = {
  crystal_cavern: [
    // URLs for levels 1-10 backgrounds
  ],
  volcanic_crystal: [
    // URLs for levels 11-20 backgrounds
  ],
  steampunk: [
    // URLs for levels 21-30 backgrounds
  ],
  storm: [
    // URLs for levels 31-40 backgrounds
  ],
  galactic: [
    // URLs for levels 41-50 backgrounds
  ],
  beast_mode_extras: [
    // Additional exclusive backgrounds for 51+
  ],
  bonus: [
    // Special bonus level backgrounds
  ]
}
```

### 3. Loading Optimization Strategies

#### A. Lazy Loading
- Load backgrounds only when entering a new chapter
- Don't preload all 50+ backgrounds at game start
- Load on-demand with intelligent prefetching

#### B. Memory Management
```typescript
// Texture disposal when switching chapters
private disposeChapterTextures(chapter: string): void {
  const textures = this.chapters.get(chapter)?.backgrounds || []
  textures.forEach(textureKey => {
    if (this.scene.textures.exists(textureKey)) {
      this.scene.textures.remove(textureKey)
      this.loadedTextures.delete(textureKey)
    }
  })
}
```

#### C. Preloading Strategy
1. **Current Level**: Always loaded
2. **Next 2 Levels**: Preloaded in background
3. **Previous Level**: Kept for retry scenarios
4. **Chapter Transition**: Preload next chapter at levels 9, 19, 29, 39, 49

#### D. Beast Mode (51+) Special Handling
```typescript
private loadBeastModePool(): void {
  // Select random subset from all chapters
  const poolSize = 15
  const allBackgrounds = [...all chapter backgrounds]
  const selectedPool = this.selectRandomSubset(allBackgrounds, poolSize)
  
  // Add beast mode exclusive backgrounds
  selectedPool.push(...this.beastModeExtras)
  
  // Rotate pool every 5 levels for variety
  if (this.currentLevel % 5 === 0) {
    this.rotateBeastModePool()
  }
}
```

### 4. Performance Considerations

#### Image Optimization
- **Format**: Use WebP for 30-40% smaller file sizes
- **Resolution**: Load appropriate resolution based on device
- **Compression**: Aim for ~200-300KB per background

#### Loading Indicators
```typescript
// Show subtle loading indicator during chapter transitions
private showChapterTransition(nextChapter: string): void {
  // Display "Entering [Chapter Name]" message
  // Show progress bar if loading takes > 500ms
}
```

### 5. Integration Points

#### GameScene.ts
```typescript
// In create()
this.backgroundManager = new BackgroundManager(this)
const bgKey = this.backgroundManager.getBackgroundForLevel(currentLevel)
this.createBackground(bgKey)

// In level transition
if (this.backgroundManager.isChapterTransition(nextLevel)) {
  await this.backgroundManager.loadChapterBackgrounds(nextChapter)
  this.backgroundManager.unloadPreviousChapter()
}
```

#### Preload Scene
```typescript
// Only load essential assets and first chapter
preload(): void {
  // Load game sprites, sounds, etc.
  // Load only Crystal Cavern (1-10) backgrounds initially
  this.backgroundManager.loadChapterBackgrounds('crystal_cavern')
}
```

### 6. Fallback Strategies

#### Missing Background Handling
```typescript
private getFallbackBackground(level: number): string {
  // Use procedural gradient based on chapter theme
  const chapter = this.getChapterForLevel(level)
  return this.generateProceduralBackground(chapter)
}
```

#### Network Failure
- Cache successfully loaded backgrounds in localStorage
- Use cached versions if network fails
- Show low-res placeholder while loading

### 7. Testing Checklist

- [ ] Memory usage stays under 10MB for backgrounds
- [ ] Chapter transitions complete in < 2 seconds
- [ ] No frame drops during background switches
- [ ] Proper texture disposal (no memory leaks)
- [ ] Fallback backgrounds work correctly
- [ ] Beast mode pool rotation functions properly
- [ ] Bonus level backgrounds load correctly
- [ ] Retry scenarios use cached backgrounds
- [ ] Mobile devices handle loading smoothly

## Implementation Timeline

### Phase 1: Core System
1. Create BackgroundManager class
2. Implement chapter detection logic
3. Add texture loading/unloading methods

### Phase 2: Optimization
1. Add preloading system
2. Implement memory management
3. Create loading indicators

### Phase 3: Beast Mode & Extras
1. Implement random pool selection
2. Add pool rotation logic
3. Include beast mode exclusive backgrounds

### Phase 4: Polish
1. Add fallback backgrounds
2. Implement network failure handling
3. Optimize for mobile devices

## Notes for URL Integration

When providing background URLs, please organize them in this format:
```
Chapter Name - Level Range
- background_url_1
- background_url_2
- ...
```

This will make it easy to integrate into the system structure.

## Future Enhancements

1. **Parallax Layers**: Support multi-layer backgrounds for depth
2. **Animated Backgrounds**: Support for subtle animations (particles, etc.)
3. **Dynamic Lighting**: Adjust background tint based on level events
4. **Seasonal Themes**: Special backgrounds for holidays/events
5. **User Customization**: Allow players to unlock/select favorite backgrounds