export interface ChapterConfig {
  name: string
  levelRange: [number, number]
  backgrounds: string[]
  theme: string
}

export class BackgroundManager {
  private scene: Phaser.Scene
  private chapters: Map<string, ChapterConfig>
  private loadedTextures: Set<string>
  private textureCache: Map<string, Phaser.Textures.Texture>
  private readonly MAX_CACHED_BACKGROUNDS = 10
  private readonly PRELOAD_COUNT = 2
  private currentChapter: string = ''
  private currentLevel: number = 1
  private beastModePool: string[] = []
  private lastBeastModeRotation: number = 0

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.loadedTextures = new Set()
    this.textureCache = new Map()
    this.chapters = new Map()
    
    this.initializeChapters()
  }

  private initializeChapters(): void {
    // Initialize chapter structure
    this.chapters.set('crystal_cavern', {
      name: 'Crystal Cavern',
      levelRange: [1, 10],
      backgrounds: [
        'crystal-cavern-1',
        'crystal-cavern-2',
        'crystal-cavern-3',
        'crystal-cavern-4',
        'crystal-cavern-5',
        'crystal-cavern-6',
        'crystal-cavern-7',
        'crystal-cavern-8',
        'crystal-cavern-9',
        'crystal-cavern-10'
      ],
      theme: 'underground crystal caves with glowing gems'
    })

    this.chapters.set('volcanic_crystal', {
      name: 'Volcanic Crystal Cavern',
      levelRange: [11, 20],
      backgrounds: [
        'volcanic-crystal-1',
        'volcanic-crystal-2',
        'volcanic-crystal-3',
        'volcanic-crystal-4',
        'volcanic-crystal-5',
        'volcanic-crystal-6',
        'volcanic-crystal-7',
        'volcanic-crystal-8',
        'volcanic-crystal-9',
        'volcanic-crystal-10'
      ],
      theme: 'lava-infused crystal formations, heat effects'
    })

    this.chapters.set('steampunk', {
      name: 'Steampunk Crystal Cavern',
      levelRange: [21, 30],
      backgrounds: [
        'steampunk-1',
        'steampunk-2',
        'steampunk-3',
        'steampunk-4',
        'steampunk-5',
        'steampunk-6',
        'steampunk-7',
        'steampunk-8',
        'steampunk-9',
        'steampunk-10'
      ],
      theme: 'industrial machinery, gears, steam pipes'
    })

    this.chapters.set('storm', {
      name: 'Electrified Crystal Cavern',
      levelRange: [31, 40],
      backgrounds: [
        'electrified-1',
        'electrified-2',
        'electrified-3',
        'electrified-4',
        'electrified-5',
        'electrified-6',
        'electrified-7',
        'electrified-8',
        'electrified-9',
        'electrified-10'
      ],
      theme: 'lightning, clouds, turbulent weather'
    })

    this.chapters.set('galactic', {
      name: 'Galactic',
      levelRange: [41, 50],
      backgrounds: [
        // Placeholder - reusing crystal cavern backgrounds for now
        'crystal-cavern-1',
        'crystal-cavern-2',
        'crystal-cavern-3',
        'crystal-cavern-4',
        'crystal-cavern-5',
        'crystal-cavern-6',
        'crystal-cavern-7',
        'crystal-cavern-8',
        'crystal-cavern-9',
        'crystal-cavern-10'
      ],
      theme: 'space, stars, nebulae, cosmic themes'
    })

    this.chapters.set('beast_mode', {
      name: 'Beast Mode',
      levelRange: [51, Infinity],
      backgrounds: [],
      theme: 'random pool from all chapters'
    })

    this.chapters.set('bonus', {
      name: 'Special Bonus',
      levelRange: [-1, -1], // Special identifier for bonus levels
      backgrounds: [
        // Placeholder
        'crystal-cavern-bg'
      ],
      theme: 'unique backgrounds for bonus levels'
    })
  }

  public getChapterForLevel(level: number): string {
    if (level >= 51) return 'beast_mode'
    if (level >= 41) return 'galactic'
    if (level >= 31) return 'storm'
    if (level >= 21) return 'steampunk'
    if (level >= 11) return 'volcanic_crystal'
    return 'crystal_cavern'
  }

  public getBackgroundForLevel(level: number): string {
    const chapter = this.getChapterForLevel(level)
    this.currentLevel = level
    
    if (chapter !== this.currentChapter) {
      this.currentChapter = chapter
      
      // Handle Beast Mode specially
      if (chapter === 'beast_mode') {
        return this.getBeastModeBackground(level)
      }
    }

    const chapterConfig = this.chapters.get(chapter)
    if (!chapterConfig || chapterConfig.backgrounds.length === 0) {
      return this.getFallbackBackground(level)
    }

    // Rotate through available backgrounds in the chapter
    const backgroundIndex = (level - chapterConfig.levelRange[0]) % chapterConfig.backgrounds.length
    return chapterConfig.backgrounds[backgroundIndex]
  }

  private getBeastModeBackground(level: number): string {
    // Rotate pool every 5 levels
    if (level % 5 === 0 && level !== this.lastBeastModeRotation) {
      this.lastBeastModeRotation = level
      this.rotateBeastModePool()
    }

    // Initialize pool if empty
    if (this.beastModePool.length === 0) {
      this.loadBeastModePool()
    }

    // Select from pool
    const poolIndex = (level - 51) % this.beastModePool.length
    return this.beastModePool[poolIndex]
  }

  private loadBeastModePool(): void {
    // Collect all backgrounds from all chapters
    const allBackgrounds: string[] = []
    
    this.chapters.forEach((chapter, key) => {
      if (key !== 'beast_mode' && key !== 'bonus') {
        allBackgrounds.push(...chapter.backgrounds)
      }
    })

    // Select random subset
    const poolSize = Math.min(15, allBackgrounds.length)
    this.beastModePool = this.selectRandomSubset(allBackgrounds, poolSize)
    
    // Add beast mode exclusives if they exist
    const beastModeChapter = this.chapters.get('beast_mode')
    if (beastModeChapter && beastModeChapter.backgrounds.length > 0) {
      this.beastModePool.push(...beastModeChapter.backgrounds)
    }
  }

  private rotateBeastModePool(): void {
    // Shuffle the pool for variety
    for (let i = this.beastModePool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.beastModePool[i], this.beastModePool[j]] = [this.beastModePool[j], this.beastModePool[i]]
    }
  }

  private selectRandomSubset(array: string[], count: number): string[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  public async loadChapterBackgrounds(chapter: string): Promise<void> {
    const chapterConfig = this.chapters.get(chapter)
    if (!chapterConfig) return

    const loadPromises: Promise<void>[] = []
    
    for (const backgroundKey of chapterConfig.backgrounds) {
      if (!this.loadedTextures.has(backgroundKey)) {
        // Check if texture already exists in scene
        if (!this.scene.textures.exists(backgroundKey)) {
          // For now, textures are preloaded in GameScene
          // This will be updated when we have dynamic loading
          this.loadedTextures.add(backgroundKey)
        }
      }
    }

    await Promise.all(loadPromises)
  }

  public unloadChapterBackgrounds(chapter: string): void {
    const chapterConfig = this.chapters.get(chapter)
    if (!chapterConfig) return

    // Keep a minimum cache to prevent reloading frequently used backgrounds
    if (this.loadedTextures.size <= this.MAX_CACHED_BACKGROUNDS) {
      return
    }

    chapterConfig.backgrounds.forEach(textureKey => {
      if (this.scene.textures.exists(textureKey)) {
        // Don't unload if it's currently in use
        if (textureKey !== this.getBackgroundForLevel(this.currentLevel)) {
          this.scene.textures.remove(textureKey)
          this.loadedTextures.delete(textureKey)
          this.textureCache.delete(textureKey)
        }
      }
    })
  }

  public preloadNextLevels(currentLevel: number): void {
    // Preload backgrounds for next 2 levels
    for (let i = 1; i <= this.PRELOAD_COUNT; i++) {
      const nextLevel = currentLevel + i
      const nextChapter = this.getChapterForLevel(nextLevel)
      
      // If transitioning to new chapter, start preloading it
      if (nextChapter !== this.currentChapter) {
        this.loadChapterBackgrounds(nextChapter)
        break
      }
    }
  }

  public disposeUnusedTextures(): void {
    const currentBackground = this.getBackgroundForLevel(this.currentLevel)
    const nearbyBackgrounds = new Set<string>()
    
    // Keep current and nearby level backgrounds
    for (let i = -1; i <= this.PRELOAD_COUNT; i++) {
      const level = this.currentLevel + i
      if (level > 0) {
        nearbyBackgrounds.add(this.getBackgroundForLevel(level))
      }
    }

    // Dispose textures not in use
    this.loadedTextures.forEach(textureKey => {
      if (!nearbyBackgrounds.has(textureKey) && this.loadedTextures.size > this.MAX_CACHED_BACKGROUNDS) {
        if (this.scene.textures.exists(textureKey)) {
          this.scene.textures.remove(textureKey)
          this.loadedTextures.delete(textureKey)
        }
      }
    })
  }

  public isChapterTransition(nextLevel: number): boolean {
    return this.getChapterForLevel(nextLevel) !== this.currentChapter
  }

  public getChapterName(level: number): string {
    const chapter = this.getChapterForLevel(level)
    const chapterConfig = this.chapters.get(chapter)
    return chapterConfig?.name || 'Unknown'
  }

  private getFallbackBackground(level: number): string {
    // Return the existing crystal cavern background as fallback
    return 'crystal-cavern-bg'
  }

  public generateProceduralBackground(chapter: string): string {
    // This could generate a simple gradient or pattern based on chapter theme
    // For now, return fallback
    return this.getFallbackBackground(this.currentLevel)
  }

  // Method to add background URLs when they become available
  public addBackgroundUrls(chapter: string, urls: string[]): void {
    const chapterConfig = this.chapters.get(chapter)
    if (chapterConfig) {
      chapterConfig.backgrounds = urls
    }
  }

  // Get info about current chapter for UI display
  public getCurrentChapterInfo(): { name: string, theme: string, progress: number } {
    const chapterConfig = this.chapters.get(this.currentChapter)
    if (!chapterConfig) {
      return { name: 'Unknown', theme: '', progress: 0 }
    }

    let progress = 0
    if (this.currentChapter !== 'beast_mode') {
      const [start, end] = chapterConfig.levelRange
      progress = ((this.currentLevel - start) / (end - start + 1)) * 100
    }

    return {
      name: chapterConfig.name,
      theme: chapterConfig.theme,
      progress: Math.min(100, Math.max(0, progress))
    }
  }
}