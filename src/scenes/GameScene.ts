import GameSettings from "../config/GameSettings"
import { Player } from "../objects/Player"
import { Cat } from "../objects/Cat"
import { CeilingCat } from "../objects/CeilingCat"
import { Coin } from "../objects/Coin"
import { BlueCoin } from "../objects/BlueCoin"
import { Diamond } from "../objects/Diamond"
import { TreasureChest } from "../objects/TreasureChest"
import { FlashPowerUp } from "../objects/FlashPowerUp"
import { TouchControls } from "../objects/TouchControls"
import { LevelManager } from "../systems/LevelManager"
import { Door } from "../objects/Door"
import { AssetPool, AssetConfig } from "../systems/AssetPool"

export class GameScene extends Phaser.Scene {
  private platforms!: Phaser.Physics.Arcade.StaticGroup
  private ladders!: Phaser.Physics.Arcade.StaticGroup
  private player!: Player
  private cats!: Phaser.Physics.Arcade.Group
  private ceilingCats!: Phaser.Physics.Arcade.Group
  private coins: Coin[] = []
  private blueCoins: BlueCoin[] = []
  private diamonds: Diamond[] = []
  private treasureChests: TreasureChest[] = []
  private flashPowerUps: FlashPowerUp[] = []
  private isGameOver: boolean = false
  private floorLayouts: { gapStart: number, gapSize: number }[] = []
  private ladderPositions: Map<number, number[]> = new Map() // floor -> ladder x positions
  private doorPositions: Map<number, number> = new Map() // floor -> door x position
  private score: number = 0
  private scoreText!: Phaser.GameObjects.Text
  private currentFloor: number = 0
  private lives: number = 3
  private totalCoinsCollected: number = 0
  private livesText!: Phaser.GameObjects.Text
  private coinCounterText!: Phaser.GameObjects.Text
  private readonly COINS_PER_EXTRA_LIFE = 150
  private readonly MAX_LIVES = 9
  private highestFloorGenerated: number = 5 // Track how many floors we've generated
  private touchControls!: TouchControls
  private justKilledCat: boolean = false
  private comboCount: number = 0
  private comboTimer: Phaser.Time.TimerEvent | null = null
  private comboText!: Phaser.GameObjects.Text
  private visibilityMask: any // Store visibility system components
  private visibilityRadius: number = 160 // 5 tiles * 32 pixels
  private flashPowerUpActive: boolean = false
  private flashPowerUpTimer: Phaser.Time.TimerEvent | null = null
  private levelManager!: LevelManager
  private levelText!: Phaser.GameObjects.Text
  
  // Smart tile placement tracking
  private recentTiles: number[] = [] // Track last few tiles to avoid repeats
  private tileGrid: Map<string, number> = new Map() // Track tile variant at each position
  private tileUsageCount: number[] = new Array(15).fill(0) // Track usage count for each variant
  private door: Door | null = null
  private isLevelStarting: boolean = false
  private isLevelComplete: boolean = false
  private assetPool!: AssetPool
  
  constructor() {
    super({ key: "GameScene" })
  }

  preload(): void {
    // Initialize asset pool
    this.assetPool = new AssetPool(this)
    
    // Define all game assets with fallbacks
    const gameAssets: AssetConfig[] = [
      {
        key: 'visibilityOverlay',
        url: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4cc595d8-5f6a-49c0-9b97-9eabd3193403/black%20overlay-aQ9bbCj7ooLaxsRl5pO9PxSt2SsWun.png?0nSO',
        type: 'image',
        retries: 3
      },
      // Idle animations
      {
        key: 'playerIdleEye1',
        url: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4cc595d8-5f6a-49c0-9b97-9eabd3193403/Idle%20eye%20position%201-p01pa3z9fL9AyLQolMuYyBO3DIqgvB.png?FaaG',
        type: 'image',
        retries: 3,
        fallback: 'defaultPlayer'
      },
      {
        key: 'playerIdleEye2',
        url: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4cc595d8-5f6a-49c0-9b97-9eabd3193403/Idle%20eye%20position%202-ngx0e1EF33iY14vRpcSvy8QOUjMKnl.png?lsFE',
        type: 'image',
        retries: 3,
        fallback: 'defaultPlayer'
      },
      {
        key: 'playerIdleBlink',
        url: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4cc595d8-5f6a-49c0-9b97-9eabd3193403/Idle%20eye%20position%20blinking-fDIX0Bin2Vh42SGyH0DT70fwWARivM.png?QXG7',
        type: 'image',
        retries: 3,
        fallback: 'defaultPlayer'
      },
      // Climbing animations
      {
        key: 'playerClimbLeftFoot',
        url: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4cc595d8-5f6a-49c0-9b97-9eabd3193403/climbing%20ladder%20left%20foot%20up-Oipv0p2kIPLZcoV2XBC7FMjkKAzxOk.png?6y8P',
        type: 'image',
        retries: 3,
        fallback: 'defaultPlayer'
      },
      {
        key: 'playerClimbRightFoot',
        url: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4cc595d8-5f6a-49c0-9b97-9eabd3193403/climbing%20ladder%20right%20foot%20up-A7A5enZp5Z0EeXRZE8MVGvLZ9Jx5Ll.png?Hwlb',
        type: 'image',
        retries: 3,
        fallback: 'defaultPlayer'
      },
      // Jumping animations
      {
        key: 'playerJumpLeftFoot',
        url: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4cc595d8-5f6a-49c0-9b97-9eabd3193403/jumping%20left%20foot%20forward-mXUWm73dYQqZMOkl9Wn4MjBnzEdZjX.png?49nU',
        type: 'image',
        retries: 3,
        fallback: 'defaultPlayer'
      },
      {
        key: 'playerJumpRightFoot',
        url: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4cc595d8-5f6a-49c0-9b97-9eabd3193403/jumping%20right%20foot%20forward-qLrBUCfcOJhpnlFrfX8taL39RPnq4P.png?1QLd',
        type: 'image',
        retries: 3,
        fallback: 'defaultPlayer'
      },
      // Running animations
      {
        key: 'playerRunLeftFoot',
        url: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4cc595d8-5f6a-49c0-9b97-9eabd3193403/Running%20left%20foot%20forward-VN3o7CfzFLjRAoWpr40LOdeFNQaVff.png?lyKi',
        type: 'image',
        retries: 3,
        fallback: 'defaultPlayer'
      },
      {
        key: 'playerRunRightFoot',
        url: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4cc595d8-5f6a-49c0-9b97-9eabd3193403/Running%20right%20foot%20forward-FGGa0yxLpub6kRyvYj29zhOqx4sVj3.png?VhAX',
        type: 'image',
        retries: 3,
        fallback: 'defaultPlayer'
      },
      {
        key: 'blueEnemy',
        url: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4cc595d8-5f6a-49c0-9b97-9eabd3193403/enemy%20test%201-DFzrumkmpUN5HOwL25dNAVJzRcVxhv.png?rxbT',
        type: 'image',
        retries: 3,
        fallback: 'defaultEnemy'
      }
    ]
    
    // Register assets with the pool
    this.assetPool.registerAssets(gameAssets)
    
    // Create fallback textures first
    this.assetPool.createCommonFallbacks()
    
    // Load critical assets via traditional method first for immediate availability
    this.load.image('blueEnemy', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4cc595d8-5f6a-49c0-9b97-9eabd3193403/enemy%20test%201-DFzrumkmpUN5HOwL25dNAVJzRcVxhv.png?rxbT')
    this.load.image('visibilityOverlay', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4cc595d8-5f6a-49c0-9b97-9eabd3193403/black%20overlay-aQ9bbCj7ooLaxsRl5pO9PxSt2SsWun.png?0nSO')
    
    // Load new player sprite collection
    this.load.image('playerIdleEye1', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4cc595d8-5f6a-49c0-9b97-9eabd3193403/Idle%20eye%20position%201-p01pa3z9fL9AyLQolMuYyBO3DIqgvB.png?FaaG')
    this.load.image('playerIdleEye2', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4cc595d8-5f6a-49c0-9b97-9eabd3193403/Idle%20eye%20position%202-ngx0e1EF33iY14vRpcSvy8QOUjMKnl.png?lsFE')
    this.load.image('playerIdleBlink', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4cc595d8-5f6a-49c0-9b97-9eabd3193403/Idle%20eye%20blink-3tJNOxFkSwSzayJLdDqCIR8QBeFE4L.png?aEfY')
    this.load.image('playerClimbLeftFoot', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4cc595d8-5f6a-49c0-9b97-9eabd3193403/Climb%20left%20foot%20up-k5M7LS7klPY2qBpvYLcczE8mXs7QJU.png?Kzco')
    this.load.image('playerClimbRightFoot', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4cc595d8-5f6a-49c0-9b97-9eabd3193403/Climb%20right%20foot%20up-jKxZTjOJZ3hF1G1N7mXMCRg4hRAajI.png?PYzL')
    this.load.image('playerJumpLeftFoot', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4cc595d8-5f6a-49c0-9b97-9eabd3193403/Jump%20left%20foot%20forward-LzxJe5pXkkJKQfpXmElE79dGOx2ckq.png?rAmN')
    this.load.image('playerJumpRightFoot', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4cc595d8-5f6a-49c0-9b97-9eabd3193403/Jump%20right%20foot%20forward-JI9ZQNGwQOPOJOh7sTNE4WA4V5EFQl.png?KS7T')
    this.load.image('playerRunLeftFoot', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4cc595d8-5f6a-49c0-9b97-9eabd3193403/Running%20left%20foot%20forward-yfBzlRZjvXJT0q8xqQNGJJXh7pEkRj.png?6jgN')
    this.load.image('playerRunRightFoot', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4cc595d8-5f6a-49c0-9b97-9eabd3193403/Running%20right%20foot%20forward-XADkAcNq0lANLq6iKCvdAzYy3jWUIq.png?EATM')
    
    // Start pooled loading for advanced error handling and retries
    this.assetPool.loadAllAssets().then(() => {
      console.log('All assets loaded via AssetPool - retries and fallbacks ready')
      
      // Mark that assets are ready
      this.registry.set('assetsReady', true)
    }).catch((error) => {
      console.error('Asset loading failed:', error)
      // Still mark as ready so game can continue with fallbacks
      this.registry.set('assetsReady', true)
    })
  }

  create(): void {
    // Enable multi-touch support
    this.input.addPointer(2) // Allow up to 3 pointers total (default 1 + 2 more)
    
    
    // Initialize level manager
    if (!this.levelManager) {
      this.levelManager = new LevelManager()
    }
    
    // Reset game state
    this.isGameOver = false
    this.isLevelComplete = false
    this.score = 0
    this.currentFloor = 0
    this.highestFloorGenerated = 5
    
    // Use game registry to persist lives and coins across scene restarts
    // Check if we have stored values (level restart) or need to initialize (new game)
    const registry = this.game.registry
    
    if (registry.has('playerLives') && registry.get('playerLives') > 0) {
      // Restore from registry (level restart after losing life)
      this.lives = registry.get('playerLives')
      this.totalCoinsCollected = registry.get('totalCoins')
    } else {
      // Initialize new game
      this.lives = 3
      this.totalCoinsCollected = 0
      registry.set('playerLives', this.lives)
      registry.set('totalCoins', this.totalCoinsCollected)
    }
    
    // Pre-generate tile textures for performance
    this.generateTileTextures()
    
    // Reset smart tile placement tracking for new level
    this.recentTiles = []
    this.tileGrid.clear()
    this.tileUsageCount = new Array(15).fill(0)
    
    // Create platform and ladder groups
    this.platforms = this.physics.add.staticGroup()
    this.ladders = this.physics.add.staticGroup()
    
    // Create cats group
    this.cats = this.physics.add.group({
      classType: Cat,
      runChildUpdate: true
    })
    
    // Create ceiling cats group
    this.ceilingCats = this.physics.add.group({
      classType: CeilingCat,
      runChildUpdate: true
    })
    
    // Initialize collectibles arrays
    this.coins = []
    this.blueCoins = []
    this.diamonds = []
    this.treasureChests = []
    this.flashPowerUps = []
    
    // Create mining theme background
    this.createMiningThemeBackground()
    
    // Create the level
    this.createTestLevel()
    
    // Create the player (starts off-screen for walk-in animation)
    const spawnX = GameSettings.canvas.width / 2
    // Place player on ground floor - platform center is at Y=784
    // Platform is 32px tall, so platform top is at Y=768
    // Player sprite center should be positioned so physics body bottom is above platform top
    // With new offset, physics body extends from sprite center + 2 to sprite center + 32
    // So to have physics body bottom at Y=768, sprite center should be at Y=736
    const spawnY = 736  // Position player so physics body sits on platform
    
    
    this.player = new Player(
      this, 
      100,  // Start at ladder position
      GameSettings.canvas.height + 100  // Start below screen
    )
    
    // IMMEDIATELY disable physics to prevent falling before intro
    this.player.body!.enable = false
    console.log('🚫 Player physics DISABLED immediately to prevent falling')
    
    // Start intro immediately - assets will be checked during animation
    this.startLevelIntro(spawnX, spawnY)
    
    // Add some cats to test (pass floor layouts)
    this.createCats()
    
    // Add ceiling cats
    this.createCeilingCats()
    
    // Add collectibles
    this.createAllCollectibles()
    
    // Create door at top floor for level completion
    this.createLevelEndDoor()
    
    // Set up collisions (with condition check for climbing)
    this.physics.add.collider(
      this.player, 
      this.platforms,
      undefined,
      this.shouldCollideWithPlatform,
      this
    )
    
    // Cats collide with platforms
    this.physics.add.collider(this.cats, this.platforms)
    
    // Ceiling cats collide with platforms (after dropping)
    this.physics.add.collider(this.ceilingCats, this.platforms)
    
    // Cats collide with each other and reverse direction
    this.physics.add.collider(
      this.cats,
      this.cats,
      this.handleCatCatCollision,
      undefined,
      this
    )
    
    // Player vs cat collision - check for jump-to-kill vs damage
    this.physics.add.overlap(
      this.player,
      this.cats,
      this.handlePlayerCatInteraction,
      undefined,
      this
    )
    
    // Player vs ceiling cat collision - check for jump-to-kill vs damage  
    this.physics.add.overlap(
      this.player,
      this.ceilingCats,
      this.handlePlayerCeilingCatInteraction,
      undefined,
      this
    )
    
    // Red cats no longer climb ladders
    
    // Set up coin collection (we'll handle this individually per coin)
    
    // Set up ladder overlap detection
    this.physics.add.overlap(
      this.player,
      this.ladders,
      this.handleLadderOverlap,
      undefined,
      this
    )
    
    // Set world bounds to accommodate wider floors
    const worldWidth = GameSettings.game.floorWidth * GameSettings.game.tileSize
    this.physics.world.setBounds(0, -10000, worldWidth, 20000)
    
    // Set up camera to follow player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)
    // Keep camera centered horizontally, only follow vertically
    this.cameras.main.followOffset.set(0, 100)
    
    // Create visibility/vignette system
    this.createVisibilitySystem()
    
    // Game title removed - focusing on clean HUD
    
    // Create HUD background panel (darker black) - extended for level display
    const hudBg = this.add.graphics()
    hudBg.fillStyle(0x000000, 0.6)  // Black with 60% opacity (much darker)
    hudBg.fillRoundedRect(8, 8, 200, 100, 8)  // Increased height to fit all 4 text lines
    hudBg.setDepth(99)
    hudBg.setScrollFactor(0)
    
    // Add score display with better styling
    this.scoreText = this.add.text(20, 20, 'SCORE: 0', {
      fontSize: '16px',
      color: '#00ff00',  // Changed from gold to green
      fontFamily: 'Arial Black',
      fontStyle: 'bold'
    }).setDepth(100)
    
    // Create combo text (hidden initially)
    this.comboText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      '',
      {
        fontSize: '13px',
        color: '#ffff00',
        fontFamily: 'Arial Black',
        fontStyle: 'bold',
        stroke: '#ff0000',
        strokeThickness: 2,
        shadow: {
          offsetX: 1,
          offsetY: 1,
          color: '#000000',
          blur: 2,
          fill: true
        }
      }
    ).setOrigin(0.5).setDepth(200).setVisible(false)
    this.scoreText.setScrollFactor(0)
    this.comboText.setScrollFactor(0)
    
    // Add lives display with heart symbols
    this.livesText = this.add.text(20, 40, '❤️ x3', {
      fontSize: '16px',
      color: '#ff4444',
      fontFamily: 'Arial Black',
      fontStyle: 'bold'
    }).setDepth(100)
    this.livesText.setScrollFactor(0)
    
    // Add coin counter display
    this.coinCounterText = this.add.text(20, 60, 'COINS: 0/150', {
      fontSize: '16px',
      color: '#ffd700',
      fontFamily: 'Arial Black',
      fontStyle: 'bold'
    }).setDepth(100)
    this.coinCounterText.setScrollFactor(0)
    
    // Add level counter
    const currentLevel = this.levelManager.getCurrentLevel()
    this.levelText = this.add.text(20, 80, `LEVEL: ${currentLevel}`, {
      fontSize: '16px',
      color: '#ff88ff',
      fontFamily: 'Arial Black',
      fontStyle: 'bold'
    }).setDepth(100)
    this.levelText.setScrollFactor(0)
    
    // Initialize displays
    this.updateLivesDisplay()
    this.updateCoinCounterDisplay()
    
    // Create touch controls for mobile
    this.touchControls = new TouchControls(this)
    
    // Connect touch controls to player
    this.player.setTouchControls(this.touchControls)
    
    // Check for level start conditions
    const levelConfig = this.levelManager.getLevelConfig(this.levelManager.getCurrentLevel())
    if (levelConfig.isEndless) {
      this.showEndlessModePopup()
    }
  }


  private generateTileTextures(): void {
    const tileSize = GameSettings.game.tileSize
    
    // Generate 15 different tile variants with baked-in decorations
    for (let variant = 0; variant < 15; variant++) {
      const textureKey = `platform-tile-${variant}`
      
      // Skip if already exists (for scene restart)
      if (this.textures.exists(textureKey)) {
        continue
      }
      
      // Create a render texture for this variant
      const graphics = this.add.graphics()
      
      // Base purple crystal tile
      const baseColor = 0x6a4a8a
      graphics.fillStyle(baseColor, 1)
      graphics.fillRect(0, 0, tileSize, tileSize)
      
      // Add texture variations
      const tileVariation = Math.random()
      if (tileVariation < 0.4) {
        graphics.fillStyle(0x8a6aaa, 0.6)
        graphics.fillRect(
          Math.random() * 12, 
          Math.random() * 12, 
          8 + Math.random() * 8, 
          8 + Math.random() * 8
        )
      } else if (tileVariation < 0.6) {
        graphics.fillStyle(0xaa6a9a, 0.5)
        graphics.fillRect(
          Math.random() * 12, 
          Math.random() * 12, 
          6 + Math.random() * 10, 
          6 + Math.random() * 10
        )
      }
      
      // Add decorations based on variant number to ensure variety
      // Each variant gets a different combination of decorations
      
      // Crystal veining (variants 0-6)
      if (variant < 7) {
        const veinColors = [0xff69b4, 0x9370db, 0x40e0d0, 0xffd700, 0x00fa9a]
        const veinColor = veinColors[variant % veinColors.length]
        graphics.lineStyle(2, veinColor, 0.6)
        for (let i = 0; i < 3; i++) {
          const veinY = 6 + i * 8
          graphics.lineBetween(
            2, veinY, 
            tileSize - 2, veinY + Math.random() * 4 - 2
          )
        }
      }
      
      // Sparkling gems (variants 3-10)
      if (variant >= 3 && variant <= 10) {
        const gemColors = [0xff1493, 0x9370db, 0x40e0d0, 0xffd700, 0x00fa9a]
        const gemColor = gemColors[variant % gemColors.length]
        graphics.fillStyle(gemColor, 0.8)
        const gemCount = 3 + (variant % 4)
        for (let i = 0; i < gemCount; i++) {
          const gemX = 4 + Math.random() * (tileSize - 8)
          const gemY = 4 + Math.random() * (tileSize - 8)
          const gemSize = 1.5 + Math.random() * 0.5
          graphics.fillCircle(gemX, gemY, gemSize)
          
          graphics.fillStyle(0xffffff, 0.9)
          graphics.fillCircle(gemX - 0.5, gemY - 0.5, 0.5)
          graphics.fillStyle(gemColor, 0.8)
        }
      }
      
      // Small gem clusters (variants 5-12)
      if (variant >= 5 && variant <= 12) {
        const clusterColors = [0x40e0d0, 0xff69b4, 0x9370db, 0xffd700]
        const clusterColor = clusterColors[variant % clusterColors.length]
        
        const numClusters = 1 + (variant % 2)
        for (let c = 0; c < numClusters; c++) {
          const clusterX = 6 + Math.random() * (tileSize - 12)
          const clusterY = 6 + Math.random() * (tileSize - 12)
          
          graphics.fillStyle(clusterColor, 0.7)
          for (let g = 0; g < 4; g++) {
            const offsetX = (Math.random() - 0.5) * 6
            const offsetY = (Math.random() - 0.5) * 6
            const size = 0.8 + Math.random() * 0.7
            graphics.fillCircle(clusterX + offsetX, clusterY + offsetY, size)
          }
          
          graphics.fillStyle(clusterColor, 0.9)
          graphics.fillCircle(clusterX, clusterY, 1.2)
          
          graphics.fillStyle(0xffffff, 0.8)
          graphics.fillCircle(clusterX - 0.3, clusterY - 0.3, 0.4)
        }
      }
      
      // Vertical crystal clusters (variants 8-14)
      if (variant >= 8) {
        const clusterColors = [0xba68c8, 0x9c27b0, 0x673ab7, 0x40e0d0, 0xff69b4]
        const clusterColor = clusterColors[variant % clusterColors.length]
        const clusterXOffset = (Math.random() - 0.5) * (tileSize - 12)
        
        graphics.fillStyle(clusterColor, 0.7)
        graphics.fillRect(tileSize/2 - 4 + clusterXOffset, 0, 8, tileSize)
        
        graphics.fillStyle(clusterColor, 0.9)
        graphics.fillRect(tileSize/2 - 3 + clusterXOffset, 2, 2, tileSize - 4)
        graphics.fillRect(tileSize/2 + 1 + clusterXOffset, 2, 2, tileSize - 4)
        
        graphics.fillStyle(0xffffff, 0.8)
        graphics.fillRect(tileSize/2 - 2 + clusterXOffset, 4, 1, tileSize - 8)
        graphics.fillRect(tileSize/2 + 2 + clusterXOffset, 4, 1, tileSize - 8)
      }
      
      // Magical crystal clusters (even variants)
      if (variant % 2 === 0) {
        const crystalType = variant % 3
        const crystalColors = [0x9370db, 0x40e0d0, 0xff69b4]
        graphics.fillStyle(crystalColors[crystalType], 0.8)
        
        const crystalX = 5 + Math.random() * (tileSize - 10)
        const crystalY = 5 + Math.random() * (tileSize - 10)
        
        for (let i = 0; i < 4; i++) {
          const cX = crystalX + Math.random() * 10 - 5
          const cY = crystalY + Math.random() * 10 - 5
          const size = 2 + Math.random() * 3
          
          graphics.fillCircle(cX, cY, size)
          
          graphics.fillStyle(0xffffff, 0.9)
          graphics.fillCircle(cX - size/2, cY - size/2, size/3)
          
          graphics.fillStyle(crystalColors[crystalType], 0.8)
        }
      }
      
      // Diamond gems (odd variants > 7)
      if (variant % 2 === 1 && variant > 7) {
        const diamondColors = [0x40e0d0, 0xffd700, 0xff69b4, 0x9370db, 0x00fa9a]
        const diamondColor = diamondColors[variant % diamondColors.length]
        
        const numDiamonds = 1 + (variant % 2)
        for (let d = 0; d < numDiamonds; d++) {
          const diamondX = 8 + Math.random() * (tileSize - 16)
          const diamondY = 8 + Math.random() * (tileSize - 16)
          const diamondSize = 2 + Math.random() * 2
          
          graphics.fillStyle(diamondColor, 0.8)
          graphics.fillRect(diamondX - diamondSize/2, diamondY - diamondSize/4, diamondSize, diamondSize/2)
          graphics.fillRect(diamondX - diamondSize/3, diamondY - diamondSize/2, diamondSize * 0.66, diamondSize)
          
          graphics.fillStyle(diamondColor, 0.95)
          graphics.fillCircle(diamondX, diamondY, diamondSize * 0.3)
          
          graphics.fillStyle(0xffffff, 0.9)
          graphics.fillCircle(diamondX - diamondSize * 0.2, diamondY - diamondSize * 0.2, diamondSize * 0.2)
        }
      }
      
      // Add occasional cracks
      if (variant % 3 === 0) {
        graphics.lineStyle(1, 0x2a2522, 0.5)
        const crackStartX = Math.random() * tileSize
        graphics.lineBetween(
          crackStartX, 0,
          crackStartX + (Math.random() - 0.5) * 12, tileSize
        )
      }
      
      // Generate texture from graphics
      graphics.generateTexture(textureKey, tileSize, tileSize)
      graphics.destroy()
    }
  }
  
  private createMiningThemeBackground(): void {
    // Use world width instead of canvas width to cover entire game area
    const worldWidth = GameSettings.game.floorWidth * GameSettings.game.tileSize
    const width = worldWidth + 1000 // Extra width to cover sides
    const height = GameSettings.canvas.height * 10 // Much taller for vertical scrolling
    const startX = -500 // Start from negative X to cover left side
    const startY = -5000 // Start from negative Y to cover top when climbing high
    
    const bg = this.add.graphics()
    
    // VIBRANT CRYSTAL CAVERN THEME: BizarreBeasts-style colorful crystal mining cavern
    // Dark purple gradient background to make crystal elements stand out more
    for (let y = startY; y < height; y += 20) {
      const ratio = Math.max(0, Math.min(1, (y - startY) / (height - startY)))
      // Darker purple gradient: Very dark purple at top to dark purple at bottom
      const r = Math.floor(0x1a * (1 - ratio) + 0x2a * ratio)
      const g = Math.floor(0x0a * (1 - ratio) + 0x1a * ratio)
      const b = Math.floor(0x2a * (1 - ratio) + 0x4a * ratio)
      const color = (r << 16) | (g << 8) | b
      
      bg.fillStyle(color, 1)
      bg.fillRect(startX, y, width, 20)
    }
    
    // Add bright crystal formations in background
    for (let i = -15; i < 30; i++) {  // Extended range to cover full height
      const formationY = i * 400 + 100
      
      // Crystal shelf across width with shimmer
      bg.fillStyle(0x60a0ff, 0.15) // Much more faded blue crystal base
      bg.fillRect(startX, formationY, width, 8)
      
      // Add crystal spikes distributed across width
      const numCrystals = Math.floor(width / 120)
      for (let j = 0; j <= numCrystals; j++) {
        const crystalX = startX + (width / numCrystals) * j + (Math.random() - 0.5) * 40
        
        // Colorful crystal spikes
        const crystalColors = [0xff6bb3, 0x6bb3ff, 0xb3ff6b, 0xffb36b, 0xb36bff]
        const crystalColor = crystalColors[Math.floor(Math.random() * crystalColors.length)]
        
        bg.fillStyle(crystalColor, 0.2) // Much more faded
        // Draw crystal spike pointing up
        bg.fillTriangle(
          crystalX, formationY,
          crystalX - 6, formationY + 30,
          crystalX + 6, formationY + 30
        )
        
        // Add crystal highlight
        bg.fillStyle(0xffffff, 0.15) // Faded highlight
        bg.fillTriangle(
          crystalX, formationY,
          crystalX - 2, formationY + 10,
          crystalX + 2, formationY + 10
        )
      }
    }
    
    // Add magical gem veins with rainbow colors
    for (let i = 0; i < Math.floor(width / 150); i++) {
      const veinX = startX + Math.random() * width
      const veinY = startY + Math.random() * (height - startY)
      
      // Colorful gem vein
      const gemColors = [0xff4081, 0x40c4ff, 0x69f0ae, 0xffab40, 0xba68c8]
      const gemColor = gemColors[Math.floor(Math.random() * gemColors.length)]
      
      bg.fillStyle(gemColor, 0.2) // Much more faded gem veins
      const veinLength = 100 + Math.random() * 150
      const veinAngle = Math.random() * Math.PI / 3 - Math.PI / 6
      
      for (let v = 0; v < veinLength; v += 8) {
        const x = veinX + Math.cos(veinAngle) * v
        const y = veinY + Math.sin(veinAngle) * v
        bg.fillCircle(x, y, 3 + Math.random() * 4) // Sparkly gem dots
        
        // Add white sparkle highlights
        if (Math.random() > 0.7) {
          bg.fillStyle(0xffffff, 0.3) // Faded sparkles
          bg.fillCircle(x + Math.random() * 4 - 2, y + Math.random() * 4 - 2, 1)
          bg.fillStyle(gemColor, 0.2) // Reset to faded gem color
        }
      }
    }
    
    // Add magical gem clusters throughout the cavern
    for (let i = 0; i < Math.floor(width / 100); i++) {
      const gemX = startX + Math.random() * width
      const gemY = startY + Math.random() * (height - startY)
      const gemType = Math.random()
      
      if (gemType < 0.3) {
        // Large rainbow gems
        const rainbowColors = [0xff1744, 0xe91e63, 0x9c27b0, 0x673ab7, 0x3f51b5, 0x2196f3, 0x00bcd4, 0x009688, 0x4caf50, 0x8bc34a, 0xcddc39, 0xffeb3b, 0xffc107, 0xff9800, 0xff5722]
        const gemColor = rainbowColors[Math.floor(Math.random() * rainbowColors.length)]
        bg.fillStyle(gemColor, 0.25) // Much more faded
        bg.fillCircle(gemX, gemY, 8 + Math.random() * 6)
        
        // Add bright white highlight
        bg.fillStyle(0xffffff, 0.3) // Faded highlight
        bg.fillCircle(gemX - 2, gemY - 2, 2)
      } else if (gemType < 0.6) {
        // Medium amethyst/crystal clusters  
        bg.fillStyle(0xba68c8, 0.2) // Much more faded
        bg.fillCircle(gemX, gemY, 6 + Math.random() * 4)
        bg.fillStyle(0xffffff, 0.25) // Faded highlight
        bg.fillCircle(gemX - 1, gemY - 1, 1.5)
      } else {
        // Small emerald gems
        bg.fillStyle(0x4caf50, 0.2) // Much more faded
        bg.fillCircle(gemX, gemY, 4 + Math.random() * 3)
        bg.fillStyle(0xffffff, 0.3) // Faded highlight
        bg.fillCircle(gemX - 1, gemY - 1, 1)
      }
    }
    
    // Add glowing crystal formations (replace coal seams)
    for (let i = 0; i < Math.floor(width / 200); i++) {
      const formX = startX + Math.random() * width
      const formY = startY + Math.random() * (height - startY)
      
      // Glowing crystal cluster
      const glowColors = [0x40e0d0, 0xff69b4, 0x98fb98, 0xffa500]
      const glowColor = glowColors[Math.floor(Math.random() * glowColors.length)]
      
      bg.fillStyle(glowColor, 0.1) // Very faded
      bg.fillRect(formX - 20, formY - 5, 40 + Math.random() * 30, 10 + Math.random() * 8)
      
      // Add bright center
      bg.fillStyle(glowColor, 0.3) // Faded center
      bg.fillRect(formX - 10, formY - 2, 20, 4)
    }
    
    // Add magical floating light orbs (replace mining lights)
    for (let i = 0; i < Math.floor(width / 60); i++) {
      const x = startX + Math.random() * width
      const y = startY + Math.random() * (height - startY)
      
      // Floating magic orb with glow effect
      const orbColors = [0x40e0d0, 0xff1493, 0x9370db, 0x00ff7f, 0xffd700]
      const orbColor = orbColors[Math.floor(Math.random() * orbColors.length)]
      
      // Outer glow
      bg.fillStyle(orbColor, 0.08) // Very faded outer glow
      bg.fillCircle(x, y, 15)
      
      // Middle glow
      bg.fillStyle(orbColor, 0.15) // Faded middle glow
      bg.fillCircle(x, y, 8)
      
      // Bright center
      bg.fillStyle(orbColor, 0.3) // Faded center
      bg.fillCircle(x, y, 4)
      
      // White sparkle center
      bg.fillStyle(0xffffff, 0.4) // Faded sparkle
      bg.fillCircle(x, y, 2)
    }
    
    // Add magical energy streams across the cavern
    bg.lineStyle(3, 0x40e0d0, 0.3)
    for (let y = startY + 100; y < height; y += 400) {
      // Flowing magical energy streams with gentle curves
      const streamY = y + Math.random() * 100
      const segments = Math.floor(width / 100)
      
      for (let s = 0; s < segments; s++) {
        const x1 = startX + (width / segments) * s
        const x2 = startX + (width / segments) * (s + 1)
        const curve = Math.sin(s * 0.5) * 20
        
        bg.lineStyle(2, 0x40e0d0, 0.15) // Very faded energy streams
        bg.lineBetween(x1, streamY + curve, x2, streamY + Math.sin((s + 1) * 0.5) * 20)
        
        // Add sparkles along the stream
        if (Math.random() > 0.7) {
          bg.fillStyle(0xffffff, 0.2) // Faded sparkles
          bg.fillCircle(x1 + Math.random() * (x2 - x1), streamY + curve, 1)
        }
      }
    }
    
    // Add large crystal formations and geodes
    for (let i = 0; i < Math.floor(width / 80); i++) {
      const x = startX + Math.random() * width
      const y = startY + Math.random() * (height - startY)
      const size = 40 + Math.random() * 60
      
      // Large crystal geode with colorful interior
      const geodeColors = [0x9c27b0, 0x673ab7, 0x3f51b5, 0x00bcd4, 0x4caf50]
      const geodeColor = geodeColors[Math.floor(Math.random() * geodeColors.length)]
      
      // Outer geode shell
      bg.fillStyle(0x5a4a6a, 0.15) // Very faded shell
      bg.fillCircle(x, y, size)
      
      // Inner crystal cavity
      bg.fillStyle(geodeColor, 0.2) // Faded cavity
      bg.fillCircle(x, y, size * 0.7)
      
      // Bright crystal center
      bg.fillStyle(geodeColor, 0.35) // Faded center
      bg.fillCircle(x, y, size * 0.3)
      
      // White highlight
      bg.fillStyle(0xffffff, 0.3) // Faded highlight
      bg.fillCircle(x - size * 0.2, y - size * 0.2, size * 0.15)
    }
    
    bg.setDepth(-10) // Far background
    bg.setScrollFactor(0.5) // Parallax effect
  }
  
  private createTestLevel(): void {
    const tileSize = GameSettings.game.tileSize
    const floorWidth = GameSettings.game.floorWidth
    const floorSpacing = tileSize * 5 // Space between floors (increased for better vertical spacing)
    
    // Get the required floor count for this level
    const levelConfig = this.levelManager.getLevelConfig(this.levelManager.getCurrentLevel())
    const requiredFloors = levelConfig.isEndless ? 20 : levelConfig.floorCount
    
    // Generate exactly the required number of floors for discrete levels
    // For Level 1: floorCount=10, so we generate floors 0,1,2,3,4,5,6,7,8,9 (10 floors total)
    // Door goes on floor 9 (the 10th floor)
    const numFloors = levelConfig.isEndless ? 
      Math.max(requiredFloors, Math.floor(GameSettings.canvas.height / floorSpacing)) :
      requiredFloors
    
    // Track ladder positions and floor layouts for cat placement
    const ladderPositions: number[] = []
    const floorLayouts: { gapStart: number, gapSize: number }[] = []
    
    // First create all platforms with random gaps
    for (let floor = 0; floor < numFloors; floor++) {
      const y = GameSettings.canvas.height - tileSize/2 - (floor * floorSpacing)
      
      if (floor === 0) {
        // Ground floor - complete platform
        
        for (let x = 0; x < floorWidth; x++) {
          const platformX = x * tileSize + tileSize/2
          this.createPlatformTile(platformX, y, x === 0, x === floorWidth - 1)
        }
        // Ground floor can have ladders at multiple positions
        ladderPositions[floor] = -1 // Special marker for ground floor
        floorLayouts[floor] = { gapStart: -1, gapSize: 0 } // No gap
      } else {
        // Upper floors - create platforms with random gaps
        const hasGap = Math.random() > 0.3 // 70% chance of having a gap
        
        if (hasGap) {
          // Random gap position (avoiding edges)
          const gapStart = Math.floor(Math.random() * (floorWidth - 5)) + 2
          const gapSize = Math.floor(Math.random() * 2) + 2 // Gap of 2-3 tiles
          
          // Store gap info for cat placement
          floorLayouts[floor] = { gapStart, gapSize }
          
          // Create platform tiles, skipping the gap
          for (let x = 0; x < floorWidth; x++) {
            if (x < gapStart || x >= gapStart + gapSize) {
              this.createPlatformTile(x * tileSize + tileSize/2, y, x === 0, x === floorWidth - 1)
            }
          }
          
          // Store safe ladder positions (not in or next to gaps)
          const leftSafe = gapStart > 3 ? Math.floor(Math.random() * (gapStart - 1)) + 1 : -1
          const rightSafe = gapStart + gapSize < floorWidth - 2 ? 
            Math.floor(Math.random() * (floorWidth - gapStart - gapSize - 2)) + gapStart + gapSize + 1 : -1
          
          // Better distribution - divide floor into thirds and alternate sections
          const floorThird = floorWidth / 3
          const prevPos = floor > 1 ? ladderPositions[floor - 1] : -1
          
          let targetSection = Math.floor(Math.random() * 3) // 0=left, 1=middle, 2=right
          
          // If previous ladder exists, prefer different section
          if (prevPos !== -1) {
            const prevSection = Math.floor(prevPos / floorThird)
            const otherSections = [0, 1, 2].filter(s => s !== prevSection)
            targetSection = otherSections[Math.floor(Math.random() * otherSections.length)]
          }
          
          // Find safe positions in target section
          const sectionStart = Math.floor(targetSection * floorThird)
          const sectionEnd = Math.floor((targetSection + 1) * floorThird)
          const sectionSafe = []
          
          if (leftSafe !== -1 && leftSafe >= sectionStart && leftSafe < sectionEnd) sectionSafe.push(leftSafe)
          if (rightSafe !== -1 && rightSafe >= sectionStart && rightSafe < sectionEnd) sectionSafe.push(rightSafe)
          
          // Use section position if available, otherwise use any safe position
          ladderPositions[floor] = sectionSafe.length > 0 ? 
            sectionSafe[Math.floor(Math.random() * sectionSafe.length)] : 
            (rightSafe !== -1 ? rightSafe : leftSafe)
        } else {
          // No gap - complete floor
          floorLayouts[floor] = { gapStart: -1, gapSize: 0 }
          
          for (let x = 0; x < floorWidth; x++) {
            this.createPlatformTile(x * tileSize + tileSize/2, y)
          }
          // Better distribution for complete floors - use thirds system
          const floorThird = floorWidth / 3
          const prevPos = floor > 1 ? ladderPositions[floor - 1] : -1
          
          let targetSection = Math.floor(Math.random() * 3)
          if (prevPos !== -1) {
            const prevSection = Math.floor(prevPos / floorThird)
            const otherSections = [0, 1, 2].filter(s => s !== prevSection)
            targetSection = otherSections[Math.floor(Math.random() * otherSections.length)]
          }
          
          const sectionStart = Math.max(2, Math.floor(targetSection * floorThird))
          const sectionEnd = Math.min(floorWidth - 2, Math.floor((targetSection + 1) * floorThird))
          ladderPositions[floor] = Math.floor(Math.random() * (sectionEnd - sectionStart)) + sectionStart
        }
      }
    }
    
    // Store floor layouts for cat creation
    this.floorLayouts = floorLayouts
    
    // Create ladders ensuring solid ground above and below
    // Allow ladders TO the door floor, but not FROM or past it
    const doorFloor = levelConfig.isEndless ? -1 : (levelConfig.floorCount - 1)
    
    for (let floor = 0; floor < numFloors - 1; floor++) {
      // Skip creating ladder if it would lead PAST the door floor
      // We WANT ladders leading TO the door floor, just not beyond it
      if (!levelConfig.isEndless && (floor + 1) > doorFloor) {
        continue // Don't create ladders leading past the door floor
      }
      
      const bottomY = GameSettings.canvas.height - tileSize - (floor * floorSpacing)
      const topY = GameSettings.canvas.height - tileSize - ((floor + 1) * floorSpacing)
      
      const currentFloor = floorLayouts[floor]
      const nextFloor = floorLayouts[floor + 1]
      
      // Find valid ladder positions that have solid ground on both floors
      const validPositions: number[] = []
      
      for (let x = 1; x < floorWidth - 1; x++) {
        const hasBottomPlatform = this.hasPlatformAt(currentFloor, x)
        const hasTopPlatform = this.hasPlatformAt(nextFloor, x)
        
        if (hasBottomPlatform && hasTopPlatform) {
          validPositions.push(x)
        }
      }
      
      if (validPositions.length > 0) {
        if (floor === 0) {
          // Ground floor - place 2 ladders if possible
          if (validPositions.length >= 2) {
            // Try to place ladders on opposite sides
            const leftPositions = validPositions.filter(pos => pos < floorWidth / 2)
            const rightPositions = validPositions.filter(pos => pos >= floorWidth / 2)
            
            if (leftPositions.length > 0 && rightPositions.length > 0) {
              const leftLadder = leftPositions[Math.floor(Math.random() * leftPositions.length)]
              // Ensure right ladder is at least 4 tiles away from left
              const validRightPositions = rightPositions.filter(pos => Math.abs(pos - leftLadder) >= 4)
              if (validRightPositions.length > 0) {
                const rightLadder = validRightPositions[Math.floor(Math.random() * validRightPositions.length)]
                this.createContinuousLadder(leftLadder * tileSize, bottomY, topY)
                this.createContinuousLadder(rightLadder * tileSize, bottomY, topY)
                this.storeLadderPositions(floor, [leftLadder, rightLadder])
              } else {
                // Only place left ladder if right can't be properly spaced
                this.createContinuousLadder(leftLadder * tileSize, bottomY, topY)
                this.storeLadderPositions(floor, [leftLadder])
              }
            } else {
              // Place 2 ladders from available positions with proper spacing
              const pos1 = validPositions[Math.floor(Math.random() * validPositions.length)]
              const validPos2Options = validPositions.filter(p => Math.abs(p - pos1) >= 4)
              this.createContinuousLadder(pos1 * tileSize, bottomY, topY)
              if (validPos2Options.length > 0) {
                const pos2 = validPos2Options[Math.floor(Math.random() * validPos2Options.length)]
                this.createContinuousLadder(pos2 * tileSize, bottomY, topY)
                this.storeLadderPositions(floor, [pos1, pos2])
              } else {
                this.storeLadderPositions(floor, [pos1])
              }
            }
          } else {
            // Only one valid position
            this.createContinuousLadder(validPositions[0] * tileSize, bottomY, topY)
            this.storeLadderPositions(floor, [validPositions[0]])
          }
        } else {
          // Upper floors - place 1 ladder, avoid stacking directly above previous floor's ladder
          const prevFloorLadders = this.ladderPositions.get(floor - 1) || []
          
          // Prefer positions not directly above previous ladders
          const preferredPositions = validPositions.filter(pos => 
            !prevFloorLadders.some(prevPos => Math.abs(pos - prevPos) < 2)
          )
          
          // Use preferred positions if available, otherwise use any valid position
          const positionsToUse = preferredPositions.length > 0 ? preferredPositions : validPositions
          const randomPos = positionsToUse[Math.floor(Math.random() * positionsToUse.length)]
          
          this.createContinuousLadder(randomPos * tileSize, bottomY, topY)
          this.storeLadderPositions(floor, [randomPos])
        }
      }
      // If no valid positions, skip this connection (emergency fallback)
    }
  }
  
  private storeLadderPositions(floor: number, positions: number[]): void {
    this.ladderPositions.set(floor, positions)
  }
  
  private hasPlatformAt(floorLayout: { gapStart: number, gapSize: number }, x: number): boolean {
    if (floorLayout.gapStart === -1) {
      // No gap - platform exists everywhere
      return true
    }
    
    // Check if position is in the gap
    return x < floorLayout.gapStart || x >= floorLayout.gapStart + floorLayout.gapSize
  }
  
  private selectSmartTileVariant(x: number, y: number): number {
    const tileSize = GameSettings.game.tileSize
    const gridX = Math.floor(x / tileSize)
    const gridY = Math.floor(y / tileSize)
    const posKey = `${gridX},${gridY}`
    
    // Check if we already have a tile at this position (for respawns)
    if (this.tileGrid.has(posKey)) {
      return this.tileGrid.get(posKey)!
    }
    
    // Get neighbors to avoid duplicates
    const neighbors: number[] = []
    
    // Check left neighbor
    const leftKey = `${gridX - 1},${gridY}`
    if (this.tileGrid.has(leftKey)) {
      neighbors.push(this.tileGrid.get(leftKey)!)
    }
    
    // Check right neighbor (if already placed)
    const rightKey = `${gridX + 1},${gridY}`
    if (this.tileGrid.has(rightKey)) {
      neighbors.push(this.tileGrid.get(rightKey)!)
    }
    
    // Check above neighbor
    const aboveKey = `${gridX},${gridY - 1}`
    if (this.tileGrid.has(aboveKey)) {
      neighbors.push(this.tileGrid.get(aboveKey)!)
    }
    
    // Check below neighbor
    const belowKey = `${gridX},${gridY + 1}`
    if (this.tileGrid.has(belowKey)) {
      neighbors.push(this.tileGrid.get(belowKey)!)
    }
    
    // Create a pool of available variants (0-14)
    const availableVariants: number[] = []
    for (let i = 0; i < 15; i++) {
      availableVariants.push(i)
    }
    
    // Remove neighbors and recent tiles from available pool
    const toAvoid = [...neighbors, ...this.recentTiles.slice(-3)] // Avoid last 3 tiles and all neighbors
    const filtered = availableVariants.filter(v => !toAvoid.includes(v))
    
    // If we have filtered options, use them. Otherwise use all variants but still avoid immediate neighbors
    let pool = filtered.length > 0 ? filtered : availableVariants.filter(v => !neighbors.includes(v))
    
    // If still no options (very rare), use all variants
    if (pool.length === 0) {
      pool = availableVariants
    }
    
    // Weight selection towards less-used variants for better distribution
    const weightedPool: number[] = []
    const maxUsage = Math.max(...this.tileUsageCount) || 1
    
    pool.forEach(variant => {
      // Variants that have been used less get more weight
      const weight = Math.max(1, maxUsage - this.tileUsageCount[variant] + 1)
      for (let w = 0; w < weight; w++) {
        weightedPool.push(variant)
      }
    })
    
    // Select from weighted pool
    const selectedVariant = weightedPool[Math.floor(Math.random() * weightedPool.length)]
    
    // Update tracking
    this.tileGrid.set(posKey, selectedVariant)
    this.recentTiles.push(selectedVariant)
    this.tileUsageCount[selectedVariant]++
    
    // Keep recent tiles list to a reasonable size (last 5 tiles)
    if (this.recentTiles.length > 5) {
      this.recentTiles.shift()
    }
    
    return selectedVariant
  }
  
  private createPlatformTile(x: number, y: number, isLeftEdge: boolean = false, isRightEdge: boolean = false): void {
    const tileSize = GameSettings.game.tileSize
    
    // Smart tile selection to avoid duplicates
    const variantIndex = this.selectSmartTileVariant(x, y)
    const textureKey = `platform-tile-${variantIndex}`
    
    // Create sprite from cached texture
    const tileSprite = this.add.sprite(x, y, textureKey)
    tileSprite.setDepth(1)
    
    // Add drop shadow for depth
    const shadowSprite = this.add.sprite(x + 3, y + 3, textureKey)
    shadowSprite.setDepth(0)
    shadowSprite.setTint(0x000000)
    shadowSprite.setAlpha(0.3)
    
    // Create invisible physics platform
    const platform = this.add.rectangle(
      x,
      y,
      tileSize,
      tileSize,
      0x000000,
      0  // Fully transparent
    )
    platform.setDepth(0)
    this.platforms.add(platform)
  }
  
  private createContinuousLadder(x: number, bottomY: number, topY: number): void {
    const tileSize = GameSettings.game.tileSize
    
    // Create one continuous ladder from bottom to top
    // Extend slightly above and below floor levels for player access, but not a full tile
    const ladderHeight = bottomY - topY + (tileSize * 0.5) // Half tile extension for access
    const ladderY = (bottomY + topY) / 2
    
    // Create the invisible ladder hitbox
    const ladder = this.add.rectangle(
      x + tileSize/2,
      ladderY,
      tileSize * 0.8,
      ladderHeight,
      0xFFFFFF,
      0  // Invisible
    )
    ladder.setDepth(10)
    this.ladders.add(ladder)
    
    // Mining Theme Ladder - Chunkier, more visible teal crystal ladder
    const ladderGraphics = this.add.graphics()
    const ladderX = x + tileSize/2
    
    // Thicker vertical teal rails - extend up significantly to balance with bottom extensions
    // First draw the outline/stroke
    ladderGraphics.lineStyle(2, 0x2a6660, 1) // Dark teal outline
    ladderGraphics.strokeRect(ladderX - 13, topY - tileSize * 1.0 - 1, 7, ladderHeight + tileSize * 1.0 + 2) // Left rail outline
    ladderGraphics.strokeRect(ladderX + 6, topY - tileSize * 1.0 - 1, 7, ladderHeight + tileSize * 1.0 + 2) // Right rail outline
    
    // Then fill the rails
    ladderGraphics.fillStyle(0x40e0d0, 1) // Bright teal gem color
    ladderGraphics.fillRect(ladderX - 12, topY - tileSize * 1.0, 5, ladderHeight + tileSize * 1.0) // Extended much further up
    ladderGraphics.fillRect(ladderX + 7, topY - tileSize * 1.0, 5, ladderHeight + tileSize * 1.0)
    
    // Teal grain effect - more visible, extended to balance with bottom
    ladderGraphics.lineStyle(2, 0x35a0a0, 0.8) // Medium teal grain
    ladderGraphics.lineBetween(ladderX - 10, topY - tileSize * 1.0, ladderX - 10, topY + ladderHeight)
    ladderGraphics.lineBetween(ladderX + 9, topY - tileSize * 1.0, ladderX + 9, topY + ladderHeight)
    
    // Teal highlights for more definition - extended to balance with bottom
    ladderGraphics.lineStyle(1, 0x60f0e0, 0.6) // Light teal highlights
    ladderGraphics.lineBetween(ladderX - 11, topY - tileSize * 1.0, ladderX - 11, topY + ladderHeight)
    ladderGraphics.lineBetween(ladderX + 8, topY - tileSize * 1.0, ladderX + 8, topY + ladderHeight)
    
    // Thicker teal rungs
    const numRungs = Math.floor(ladderHeight / 22) // More frequent rungs
    for (let i = 0; i <= numRungs; i++) {
      const rungY = bottomY - (i * 22)
      
      // Draw rung outline first
      ladderGraphics.lineStyle(1, 0x2a6660, 0.8) // Dark teal outline for rungs
      ladderGraphics.strokeRect(ladderX - 13, rungY - 4, 26, 8)
      
      // Thicker teal rung
      ladderGraphics.fillStyle(0x40e0d0, 1) // Bright teal gem color for rungs
      ladderGraphics.fillRect(ladderX - 12, rungY - 3, 24, 6) // Wider and taller rungs
      
      // Rung highlights
      ladderGraphics.lineStyle(1, 0x60f0e0, 0.7) // Light teal rung highlights
      ladderGraphics.lineBetween(ladderX - 12, rungY - 2, ladderX + 12, rungY - 2)
      
      // Larger teal brackets at connection points
      ladderGraphics.fillStyle(0x2a6660, 1) // Dark teal brackets
      ladderGraphics.fillRect(ladderX - 14, rungY - 4, 6, 8)
      ladderGraphics.fillRect(ladderX + 8, rungY - 4, 6, 8)
      
      // Larger teal bolts
      ladderGraphics.fillStyle(0x1a4040, 1) // Very dark teal bolts
      ladderGraphics.fillCircle(ladderX - 11, rungY, 2) // Bigger bolts
      ladderGraphics.fillCircle(ladderX + 11, rungY, 2)
      
      // Bolt highlights
      ladderGraphics.fillStyle(0x35a0a0, 1) // Medium teal bolt highlights
      ladderGraphics.fillCircle(ladderX - 11, rungY - 1, 1)
      ladderGraphics.fillCircle(ladderX + 11, rungY - 1, 1)
    }
    
    // Add rail extensions above the ladder (like at the bottom) - no extra rung
    const railExtensionLength = tileSize * 0.3
    const railExtensionY = topY - tileSize * 0.4
    
    ladderGraphics.fillStyle(0x40e0d0, 1) // Bright teal gem color for extensions
    ladderGraphics.fillRect(ladderX - 12, railExtensionY, 5, railExtensionLength)
    ladderGraphics.fillRect(ladderX + 7, railExtensionY, 5, railExtensionLength)
    
    // Teal grain on rail extensions
    ladderGraphics.lineStyle(2, 0x35a0a0, 0.8) // Medium teal grain for extensions
    ladderGraphics.lineBetween(ladderX - 10, railExtensionY, ladderX - 10, railExtensionY + railExtensionLength)
    ladderGraphics.lineBetween(ladderX + 9, railExtensionY, ladderX + 9, railExtensionY + railExtensionLength)
    
    // Teal highlights on rail extensions
    ladderGraphics.lineStyle(1, 0x60f0e0, 0.6) // Light teal highlights for extensions
    ladderGraphics.lineBetween(ladderX - 11, railExtensionY, ladderX - 11, railExtensionY + railExtensionLength)
    ladderGraphics.lineBetween(ladderX + 8, railExtensionY, ladderX + 8, railExtensionY + railExtensionLength)
    
    ladderGraphics.setDepth(11)
  }

  private createCats(): void {
    const tileSize = GameSettings.game.tileSize
    const floorSpacing = tileSize * 5
    const floorWidth = GameSettings.game.floorWidth
    
    // Get allowed enemy types for current level
    const levelConfig = this.levelManager.getLevelConfig(this.levelManager.getCurrentLevel())
    const allowedEnemies = levelConfig.enemyTypes
    
    // Map enemy types to cat colors
    const availableColors: string[] = []
    if (allowedEnemies.includes('blue')) availableColors.push('blue')
    if (allowedEnemies.includes('yellow')) availableColors.push('yellow')
    if (allowedEnemies.includes('green')) availableColors.push('green')
    
    // If no regular enemies are allowed yet, return
    if (availableColors.length === 0) return
    
    // Add cats on floors 1 through second-to-last floor (skip ground floor and door floor)
    const doorFloor = levelConfig.isEndless ? 999 : (levelConfig.floorCount - 1)
    const maxEnemyFloor = levelConfig.isEndless ? Math.min(20, this.floorLayouts.length - 1) : doorFloor - 1
    
    for (let floor = 1; floor <= maxEnemyFloor && floor < this.floorLayouts.length; floor++) {
      const layout = this.floorLayouts[floor]
      // Calculate Y position - cats should sit ON the platform, not IN it
      // Platform is at: GameSettings.canvas.height - tileSize/2 - (floor * floorSpacing)
      // We want cat's physics body bottom to be at platform top
      // Platform is 32px tall, so platform top is 16px above platform center
      const platformY = GameSettings.canvas.height - tileSize/2 - (floor * floorSpacing)
      const platformTop = platformY - tileSize/2 // Top of the platform
      
      // For enemies: position them so they fall onto the platform correctly
      // The physics body will settle with its bottom at platform top due to gravity
      // We spawn them slightly above and let gravity pull them down
      // Hitbox is 16px tall, so center should be 8px above platform when settled
      const y = platformTop - 20 // Spawn slightly above platform, gravity will settle them
      
      console.log(`Floor ${floor} platform debug:`, {
        platformCenterY: platformY,
        platformTop: platformTop,
        catCenterY: y,
        catBottomY: y + 8 // Half of hitbox height
      })
      
      if (layout.gapStart === -1) {
        // Complete floor - place cats based on level
        // Level 1: Moderate enemies (2-3 cats), higher levels: more enemies (2-4 cats)
        const isLevel1 = this.levelManager.getCurrentLevel() === 1
        const numCats = isLevel1 ? 
          Math.floor(Math.random() * 2) + 2 : // 2-3 cats for level 1
          Math.floor(Math.random() * 3) + 2   // 2-4 cats for other levels
        const sectionSize = Math.floor(floorWidth / numCats)
        
        for (let i = 0; i < numCats; i++) {
          const leftBound = Math.max(tileSize * 1.5, i * sectionSize * tileSize)
          const rightBound = Math.min(tileSize * (floorWidth - 1.5), (i + 1) * sectionSize * tileSize)
          
          if (rightBound - leftBound > tileSize * 3) {
            // Pick a random color from available colors
            const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)]
            
            // Green cats get full floor bounds, others get section bounds
            const cat = new Cat(
              this,
              (leftBound + rightBound) / 2,
              y,
              leftBound,
              rightBound,
              randomColor as any
            )
            
            // Override bounds for green cats to use full floor
            if (cat.getCatColor() === 'green') {
              cat.platformBounds = {
                left: tileSize * 1.5,
                right: tileSize * (floorWidth - 1.5)
              }
            }
            
            this.cats.add(cat)
          }
        }
      } else {
        // Floor with gap - place cats on sections
        const leftSectionSize = layout.gapStart
        const rightSectionSize = floorWidth - (layout.gapStart + layout.gapSize)
        
        // Left section cats
        if (leftSectionSize > 4) {
          const isLevel1 = this.levelManager.getCurrentLevel() === 1
          const leftCats = isLevel1 ? 
            1 : // Always 1 cat for level 1
            (leftSectionSize > 8 ? Math.floor(Math.random() * 2) + 1 : 1)
          for (let i = 0; i < leftCats; i++) {
            const leftSectionTileSize = Math.floor(leftSectionSize / leftCats)
            const leftBound = tileSize * (0.5 + i * leftSectionTileSize)
            const rightBound = tileSize * (0.5 + (i + 1) * leftSectionTileSize - 0.5)
            
            if (rightBound - leftBound > tileSize * 2) {
              // Pick a random color from available colors
              const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)]
              
              const cat = new Cat(
                this,
                (leftBound + rightBound) / 2,
                y,
                leftBound,
                Math.min(rightBound, tileSize * (layout.gapStart - 0.5)),
                randomColor as any
              )
              
              // Green cats use full left section bounds
              if (cat.getCatColor() === 'green') {
                cat.platformBounds = {
                  left: tileSize * 0.5,
                  right: tileSize * (layout.gapStart - 0.5)
                }
              }
              
              this.cats.add(cat)
            }
          }
        }
        
        // Right section cats
        if (rightSectionSize > 4) {
          const rightStart = layout.gapStart + layout.gapSize
          const isLevel1 = this.levelManager.getCurrentLevel() === 1
          const rightCats = isLevel1 ?
            1 : // Always 1 cat for level 1
            (rightSectionSize > 8 ? Math.floor(Math.random() * 2) + 1 : 1)
          
          for (let i = 0; i < rightCats; i++) {
            const rightSectionTileSize = Math.floor(rightSectionSize / rightCats)
            const leftBound = tileSize * (rightStart + 0.5 + i * rightSectionTileSize)
            const rightBound = tileSize * (rightStart + 0.5 + (i + 1) * rightSectionTileSize - 0.5)
            
            if (rightBound - leftBound > tileSize * 2) {
              // Pick a random color from available colors
              const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)]
              
              const cat = new Cat(
                this,
                (leftBound + rightBound) / 2,
                y,
                leftBound,
                Math.min(rightBound, tileSize * (floorWidth - 0.5)),
                randomColor as any
              )
              
              // Green cats use full right section bounds
              if (cat.getCatColor() === 'green') {
                cat.platformBounds = {
                  left: tileSize * (rightStart + 0.5),
                  right: tileSize * (floorWidth - 0.5)
                }
              }
              
              this.cats.add(cat)
            }
          }
        }
      }
    }
  }
  
  private createCeilingCats(): void {
    // Check if red enemies should spawn based on current level
    const levelConfig = this.levelManager.getLevelConfig(this.levelManager.getCurrentLevel())
    if (!levelConfig.enemyTypes.includes('red')) {
      // Red enemies not unlocked yet
      return
    }
    
    const tileSize = GameSettings.game.tileSize
    const floorSpacing = tileSize * 5
    const floorWidth = GameSettings.game.floorWidth
    
    // Add ceiling cats starting from floor 2, up to second-to-last floor (avoid door floor)
    const doorFloor = levelConfig.isEndless ? 999 : (levelConfig.floorCount - 1)
    const maxCeilingCatFloor = levelConfig.isEndless ? Math.min(25, this.floorLayouts.length - 1) : doorFloor - 1
    
    for (let floor = 2; floor <= maxCeilingCatFloor && floor < this.floorLayouts.length; floor++) {
      const layout = this.floorLayouts[floor]
      
      // Calculate floor position for stalker cats (on the floor, not ceiling)
      // Place stalker cats directly on the current floor
      const floorY = GameSettings.canvas.height - tileSize/2 - (floor * floorSpacing)
      const stalkerY = floorY - 16 // Just above the floor platform
      
      // Determine number of ceiling cats (0-1 for now, will scale later)
      const maxCeilingCats = floor < 20 ? 1 : 2
      const numCeilingCats = Math.random() < 0.6 ? Math.floor(Math.random() * maxCeilingCats) + 1 : 0
      
      if (numCeilingCats === 0) continue
      
      // Find valid positions (where there are platforms below)
      const validPositions: number[] = []
      
      if (layout.gapStart === -1) {
        // Complete floor - can place anywhere
        for (let x = 2; x < floorWidth - 2; x++) {
          validPositions.push(x)
        }
      } else {
        // Floor with gap - place only over platform sections
        for (let x = 2; x < layout.gapStart - 1; x++) {
          validPositions.push(x)
        }
        for (let x = layout.gapStart + layout.gapSize + 1; x < floorWidth - 2; x++) {
          validPositions.push(x)
        }
      }
      
      // Place ceiling cats at random valid positions
      for (let i = 0; i < Math.min(numCeilingCats, validPositions.length); i++) {
        const randomIndex = Math.floor(Math.random() * validPositions.length)
        const tileX = validPositions[randomIndex]
        const ceilingCatX = tileX * tileSize + tileSize/2
        
        // Remove position to avoid overlapping ceiling cats
        validPositions.splice(randomIndex, 1)
        
        // Calculate platform bounds for the section below
        let leftBound = tileSize * 0.5
        let rightBound = tileSize * (floorWidth - 0.5)
        
        if (layout.gapStart !== -1) {
          if (tileX < layout.gapStart) {
            // Left section
            rightBound = tileSize * (layout.gapStart - 0.5)
          } else {
            // Right section
            leftBound = tileSize * (layout.gapStart + layout.gapSize + 0.5)
          }
        }
        
        const stalkerCat = new CeilingCat(
          this,
          ceilingCatX,
          stalkerY,
          leftBound,
          rightBound
        )
        
        // Set player reference for detection
        stalkerCat.setPlayerReference(this.player)
        
        this.ceilingCats.add(stalkerCat)
      }
    }
  }
  
  private handleCatCatCollision(
    cat1: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    cat2: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ): void {
    // Both cats reverse direction when they bump into each other
    const catObj1 = cat1 as Cat
    const catObj2 = cat2 as Cat
    
    catObj1.reverseDirection()
    catObj2.reverseDirection()
  }
  
  
  private createAllCollectibles(): void {
    const tileSize = GameSettings.game.tileSize
    const floorSpacing = tileSize * 5
    
    // Get allowed collectible types for current level
    const levelConfig = this.levelManager.getLevelConfig(this.levelManager.getCurrentLevel())
    const allowedCollectibles = levelConfig.collectibleTypes
    
    // Place collectibles on each floor based on rarity rules from sprint plan
    for (let floor = 0; floor < this.floorLayouts.length; floor++) {
      const layout = this.floorLayouts[floor]
      
      // Calculate Y position above the platform
      const platformY = GameSettings.canvas.height - tileSize/2 - (floor * floorSpacing)
      const collectibleY = platformY - tileSize - 8 // Float above the platform
      
      // Find all valid positions (where there are platforms, avoiding ladders)
      const validPositions: number[] = []
      for (let x = 1; x < GameSettings.game.floorWidth - 1; x++) {
        if (this.hasPlatformAt(layout, x) && !this.hasLadderAt(x, floor) && !this.hasDoorAt(x, floor)) {
          validPositions.push(x)
        }
      }
      
      if (validPositions.length === 0) continue
      
      // Track all used positions and their types for this floor
      const floorUsedPositions: Array<{x: number, type: string}> = []
      
      // Regular coins: 2-4 per floor (most common) - always allowed if coins are in the list
      if (allowedCollectibles.includes('coin')) {
        const numCoins = Math.floor(Math.random() * 3) + 2
        this.placeCollectiblesOfType(validPositions, numCoins, 'coin', collectibleY, floor, floorUsedPositions)
      }
      
      // Blue coins: 1 per 1-2 floors (500 points)
      if (allowedCollectibles.includes('blueCoin') && floor > 0 && (floor % 2 === 0 || Math.random() < 0.5)) {
        this.placeCollectiblesOfType(validPositions, 1, 'blueCoin', collectibleY, floor, floorUsedPositions)
      }
      
      // Diamonds: 1 per 1-3 floors (1000 points)
      if (allowedCollectibles.includes('diamond') && floor > 1 && (floor % 3 === 0 || Math.random() < 0.3)) {
        this.placeCollectiblesOfType(validPositions, 1, 'diamond', collectibleY, floor, floorUsedPositions)
      }
      
      // Treasure chests: 1 per 1-3 floors starting floor 3 (2500 points + contents)
      if (allowedCollectibles.includes('treasureChest') && floor >= 3 && (floor % 3 === 0 || Math.random() < 0.35)) {
        this.placeCollectiblesOfType(validPositions, 1, 'treasureChest', collectibleY, floor, floorUsedPositions)
      }
      
      // Flash power-ups: DISABLED
      // Note: Flash power-ups are disabled for now
      // if (floor > 20 && Math.random() < 0.1) {
      //   this.placeCollectiblesOfType(validPositions, 1, 'flashPowerUp', collectibleY, floor, floorUsedPositions)
      // }
    }
  }
  
  private placeCollectiblesOfType(
    validPositions: number[], 
    count: number, 
    type: 'coin' | 'blueCoin' | 'diamond' | 'treasureChest' | 'flashPowerUp',
    y: number,
    floor: number,
    floorUsedPositions: Array<{x: number, type: string}>
  ): void {
    const tileSize = GameSettings.game.tileSize
    
    // Filter positions to avoid ladders and doors
    const availablePositions = validPositions.filter(x => 
      !this.hasLadderAt(x, floor) && !this.hasDoorAt(x, floor)
    )
    
    for (let i = 0; i < Math.min(count, availablePositions.length); i++) {
      // Find a position that's not occupied
      let attempts = 0
      let tileX = -1
      
      while (attempts < 20 && tileX === -1) {
        const candidateIndex = Math.floor(Math.random() * availablePositions.length)
        const candidate = availablePositions[candidateIndex]
        
        if (!this.isPositionOccupiedWithVariety(candidate, type, floorUsedPositions)) {
          tileX = candidate
          floorUsedPositions.push({x: tileX, type: type})
          // Remove this position and nearby positions to prevent clustering
          for (let j = availablePositions.length - 1; j >= 0; j--) {
            if (Math.abs(availablePositions[j] - tileX) < 2) {
              availablePositions.splice(j, 1)
            }
          }
        }
        attempts++
      }
      
      if (tileX === -1) break // Couldn't find a valid position
      
      const x = tileX * tileSize + tileSize/2
      
      switch (type) {
        case 'coin':
          const coin = new Coin(this, x, y)
          this.coins.push(coin)
          this.physics.add.overlap(
            this.player,
            coin.sprite,
            () => this.handleCoinCollection(coin),
            undefined,
            this
          )
          break
          
        case 'blueCoin':
          const blueCoin = new BlueCoin(this, x, y)
          this.blueCoins.push(blueCoin)
          this.physics.add.overlap(
            this.player,
            blueCoin.sprite,
            () => this.handleBlueCoinCollection(blueCoin),
            undefined,
            this
          )
          break
          
        case 'diamond':
          const diamond = new Diamond(this, x, y)
          this.diamonds.push(diamond)
          this.physics.add.overlap(
            this.player,
            diamond.sprite,
            () => this.handleDiamondCollection(diamond),
            undefined,
            this
          )
          break
          
        case 'treasureChest':
          const chest = new TreasureChest(this, x, y)
          this.treasureChests.push(chest)
          // Treasure chests use interaction system, not automatic collection
          break
          
        case 'flashPowerUp':
          const flashPowerUp = new FlashPowerUp(this, x, y)
          this.flashPowerUps.push(flashPowerUp)
          this.physics.add.overlap(
            this.player,
            flashPowerUp.sprite,
            () => this.handleFlashPowerUpCollection(flashPowerUp),
            undefined,
            this
          )
          break
      }
    }
  }
  
  private hasLadderAt(x: number, floor: number): boolean {
    // Check if there's a ladder at this position using stored positions
    const ladders = this.ladderPositions.get(floor) || []
    return ladders.includes(x)
  }
  
  private hasDoorAt(x: number, floor: number): boolean {
    // Check if there's a door at this position (need extra clearance around doors)
    const doorX = this.doorPositions.get(floor)
    if (doorX === undefined) return false
    
    // Need 2-3 tiles clearance around door (doors are wider than ladders)
    return Math.abs(x - doorX) <= 2
  }
  
  private isPositionOccupied(x: number, floor: number, usedPositions: number[]): boolean {
    // Check if position has ladder (need clearance)
    if (this.hasLadderAt(x, floor)) {
      return true
    }
    
    // Check if position conflicts with door (need clearance)
    const doorX = this.doorPositions.get(floor)
    if (doorX !== undefined && Math.abs(x - doorX) < 4) { // 4 tiles clearance from door
      return true
    }
    
    // Check for ladder conflicts on this floor (wider clearance)
    const ladderPositions = this.ladderPositions.get(floor) || []
    for (const ladderX of ladderPositions) {
      if (Math.abs(x - ladderX) < 2) { // 2 tiles clearance from ladders
        return true
      }
    }
    
    // Check if position is already used by another item (minimum 2 tile spacing)
    return usedPositions.some(pos => Math.abs(pos - x) < 2)
  }

  private isPositionOccupiedWithVariety(
    x: number, 
    type: string, 
    usedPositions: Array<{x: number, type: string}>
  ): boolean {
    // Check if position is already occupied (minimum 2 tile spacing)
    const occupied = usedPositions.some(item => Math.abs(item.x - x) < 2)
    if (occupied) return true
    
    // Check for same gem type clustering (prevent same type within 3 tiles)
    const sameTypeNearby = usedPositions.some(item => 
      item.type === type && Math.abs(item.x - x) < 3
    )
    
    return sameTypeNearby
  }
  
  private handleCoinCollection(coin: Coin): void {
    // Don't collect during intro animation
    if (this.isLevelStarting) return
    
    // Check if coin is already collected to prevent multiple collections
    if (coin.isCollected()) return
    
    // Add points
    this.score += GameSettings.scoring.coinCollect
    
    // Increment coin counter and check for extra life
    this.totalCoinsCollected++
    this.game.registry.set('totalCoins', this.totalCoinsCollected)  // Save to registry
    this.checkForExtraLife()
    
    // Update displays
    this.updateScoreDisplay()
    this.updateCoinCounterDisplay()
    
    // Show point popup
    this.showPointPopup(coin.sprite.x, coin.sprite.y - 20, GameSettings.scoring.coinCollect)
    
    // Play collection animation and remove coin
    coin.collect()
    
    // Remove from coins array immediately to prevent multiple collections
    const index = this.coins.indexOf(coin)
    if (index > -1) {
      this.coins.splice(index, 1)
    }
  }
  
  private handleBlueCoinCollection(blueCoin: BlueCoin): void {
    // Don't collect during intro animation
    if (this.isLevelStarting) return
    
    // Check if already collected
    if (blueCoin.isCollected()) return
    
    const points = 500
    this.score += points
    
    // Blue coins count as 5 coins toward extra life
    this.totalCoinsCollected += 5
    this.game.registry.set('totalCoins', this.totalCoinsCollected)  // Save to registry
    this.checkForExtraLife()
    
    // Update displays
    this.updateScoreDisplay()
    this.updateCoinCounterDisplay()
    
    // Show point popup
    this.showPointPopup(blueCoin.sprite.x, blueCoin.sprite.y - 20, points)
    
    // Play collection animation
    blueCoin.collect()
    
    // Remove from array
    const index = this.blueCoins.indexOf(blueCoin)
    if (index > -1) {
      this.blueCoins.splice(index, 1)
    }
  }
  
  private handleDiamondCollection(diamond: Diamond): void {
    // Don't collect during intro animation
    if (this.isLevelStarting) return
    
    // Check if already collected
    if (diamond.isCollected()) return
    
    const points = 1000
    this.score += points
    
    // Diamonds count as 10 coins toward extra life
    this.totalCoinsCollected += 10
    this.game.registry.set('totalCoins', this.totalCoinsCollected)  // Save to registry
    this.checkForExtraLife()
    
    // Update displays
    this.updateScoreDisplay()
    this.updateCoinCounterDisplay()
    
    // Show point popup
    this.showPointPopup(diamond.sprite.x, diamond.sprite.y - 20, points)
    
    // Play collection animation
    diamond.collect()
    
    // Remove from array
    const index = this.diamonds.indexOf(diamond)
    if (index > -1) {
      this.diamonds.splice(index, 1)
    }
  }
  
  private handleFlashPowerUpCollection(flashPowerUp: FlashPowerUp): void {
    // Don't collect during intro animation
    if (this.isLevelStarting) return
    
    // Activate flash power-up (reveals full screen for 5 seconds)
    this.activateFlashPowerUp()
    
    // Play collection animation
    flashPowerUp.collect()
    
    // Remove from array
    const index = this.flashPowerUps.indexOf(flashPowerUp)
    if (index > -1) {
      this.flashPowerUps.splice(index, 1)
    }
  }
  
  private activateFlashPowerUp(): void {
    this.flashPowerUpActive = true
    
    // Clear existing timer if any
    if (this.flashPowerUpTimer) {
      this.flashPowerUpTimer.destroy()
    }
    
    // Immediately fade out the visibility mask for instant full screen reveal
    // Scale up happens instantly but invisibly
    this.visibilityMask.setScale(6, 6) // Instant scale
    this.tweens.add({
      targets: this.visibilityMask,
      alpha: 0, // Immediate fade out
      duration: 100, // Very fast fade
      ease: 'Power2.easeOut'
    })
    
    // Set 5-second timer
    this.flashPowerUpTimer = this.time.delayedCall(5000, () => {
      this.flashPowerUpActive = false
      this.flashPowerUpTimer = null
      
      // Immediately return to normal - instant scale and fade back
      this.visibilityMask.setScale(1, 1) // Instant scale back to normal
      this.visibilityMask.setAlpha(1) // Instant fade back to visible
    })
  }
  
  private shouldCollideWithPlatform(): boolean {
    // Don't collide with platforms when climbing
    return !this.player.getIsClimbing()
  }
  
  private handlePlayerCatInteraction(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    cat: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ): void {
    if (this.isGameOver || this.justKilledCat) return
    
    const playerObj = player as Player
    const catObj = cat as Cat
    
    // Check if player is falling down onto the cat (jump-to-kill)
    const playerBody = playerObj.body as Phaser.Physics.Arcade.Body
    const catBody = catObj.body as Phaser.Physics.Arcade.Body
    
    const playerFalling = playerBody.velocity.y > 0 // Moving downward
    const playerAboveCat = playerBody.bottom <= catBody.top + 15 // Player's bottom is near cat's top (increased tolerance)
    
    if (playerFalling && playerAboveCat) {
      // Jump-to-kill!
      this.justKilledCat = true
      this.handleCatKill(playerObj, catObj)
      
      // Reset flag after a short delay to allow for physics processing
      this.time.delayedCall(100, () => {
        this.justKilledCat = false
      })
    } else if (!this.justKilledCat) {
      // Regular collision - damage player (only if we didn't just kill)
      this.handlePlayerDamage(playerObj, catObj)
    }
  }
  
  private handlePlayerCeilingCatInteraction(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    cat: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ): void {
    if (this.isGameOver || this.justKilledCat) return
    
    const playerObj = player as Player
    const ceilingCatObj = cat as CeilingCat
    
    // Check if this stalker cat can damage the player
    if (!ceilingCatObj.canDamagePlayer()) {
      // This stalker cat can't damage player right now
      return
    }
    
    // Check if player is falling down onto the cat (jump-to-kill)
    const playerBody = playerObj.body as Phaser.Physics.Arcade.Body
    const catBody = ceilingCatObj.body as Phaser.Physics.Arcade.Body
    
    const playerFalling = playerBody.velocity.y > 0 // Moving downward
    const playerAboveCat = playerBody.bottom <= catBody.top + 15 // Player's bottom is near cat's top (increased tolerance)
    
    if (playerFalling && playerAboveCat) {
      // Jump-to-kill ceiling cat (only when chasing)
      this.justKilledCat = true
      this.handleCeilingCatKill(playerObj, ceilingCatObj)
      
      // Reset flag after a short delay to allow for physics processing
      this.time.delayedCall(100, () => {
        this.justKilledCat = false
      })
    } else if (!this.justKilledCat) {
      // Regular collision - damage player (only if we didn't just kill)
      this.handlePlayerDamage(playerObj, ceilingCatObj)
    }
  }
  
  private handleCatKill(player: Player, cat: Cat): void {
    // Check if cat is already squished to prevent multiple kills
    if ((cat as any).isSquished) return
    
    // Don't allow combo while climbing ladders
    if (player.getIsClimbing()) {
      // Just award base points without combo
      const basePoints = 200
      this.score += basePoints
      this.updateScoreDisplay()
      
      // Make player bounce up (slightly less than normal jump)
      player.setVelocityY(GameSettings.game.jumpVelocity * 0.7)
      
      // Squish the cat
      cat.squish()
      
      // Show point popup at cat position
      this.showPointPopup(cat.x, cat.y - 20, basePoints)
      
      return
    }
    
    // Calculate points with current combo multiplier (before incrementing)
    const basePoints = 200
    const comboMultiplier = Math.max(1, this.comboCount) // Current combo count (minimum 1)
    const points = basePoints * comboMultiplier
    
    // Award points
    this.score += points
    this.updateScoreDisplay()
    
    // Now increment combo for next kill
    this.comboCount++
    
    // Update combo display
    this.updateComboDisplay()
    
    // Reset combo timer
    if (this.comboTimer) {
      this.comboTimer.destroy()
    }
    
    // Set new combo timer (1 second to maintain combo)
    this.comboTimer = this.time.delayedCall(1000, () => {
      this.resetCombo()
    })
    
    // Make player bounce up (slightly less than normal jump)
    player.setVelocityY(GameSettings.game.jumpVelocity * 0.7)
    
    // Squish the cat
    cat.squish()
    
    // Show point popup at cat position
    this.showPointPopup(cat.x, cat.y - 20, points)
    
  }
  
  private handleCeilingCatKill(player: Player, ceilingCat: CeilingCat): void {
    // Check if ceiling cat is already squished to prevent multiple kills
    if ((ceilingCat as any).isSquished) return
    
    // Don't allow combo while climbing ladders
    if (player.getIsClimbing()) {
      // Just award base points without combo
      const basePoints = 200
      this.score += basePoints
      this.updateScoreDisplay()
      
      // Make player bounce up (slightly less than normal jump)
      player.setVelocityY(GameSettings.game.jumpVelocity * 0.7)
      
      // Squish the ceiling cat
      ceilingCat.squish()
      
      // Show point popup at cat position
      this.showPointPopup(ceilingCat.x, ceilingCat.y - 20, basePoints)
      
      return
    }
    
    // Calculate points with current combo multiplier (before incrementing)
    const basePoints = 200
    const comboMultiplier = Math.max(1, this.comboCount) // Current combo count (minimum 1)
    const points = basePoints * comboMultiplier
    
    // Award points
    this.score += points
    this.updateScoreDisplay()
    
    // Now increment combo for next kill
    this.comboCount++
    
    // Update combo display
    this.updateComboDisplay()
    
    // Reset combo timer
    if (this.comboTimer) {
      this.comboTimer.destroy()
    }
    
    // Set new combo timer (1 second to maintain combo)
    this.comboTimer = this.time.delayedCall(1000, () => {
      this.resetCombo()
    })
    
    // Make player bounce up (slightly less than normal jump)
    player.setVelocityY(GameSettings.game.jumpVelocity * 0.7)
    
    // Squish the ceiling cat
    ceilingCat.squish()
    
    // Show point popup at cat position
    this.showPointPopup(ceilingCat.x, ceilingCat.y - 20, points)
    
  }
  
  private updateScoreDisplay(): void {
    this.scoreText.setText(`SCORE: ${this.score}`)
  }
  
  private updateComboDisplay(): void {
    if (this.comboCount > 1) {
      this.comboText.setText(`COMBO x${this.comboCount}!`)
      this.comboText.setVisible(true)
      
      // Animate combo text
      this.tweens.add({
        targets: this.comboText,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 100,
        ease: 'Power2',
        yoyo: true
      })
    }
  }
  
  private resetCombo(): void {
    this.comboCount = 0
    this.comboText.setVisible(false)
    if (this.comboTimer) {
      this.comboTimer.destroy()
      this.comboTimer = null
    }
  }
  
  private createVisibilitySystem(): void {
    // Create single overlay image with transparent area for visibility
    this.visibilityMask = this.add.image(0, 0, 'visibilityOverlay')
    this.visibilityMask.setDepth(98) // In front of game objects but behind HUD
    this.visibilityMask.setOrigin(0.5, 0.5) // Center origin for easy positioning
  }
  
  private updateVisibilitySystem(): void {
    if (!this.visibilityMask) return
    
    // Hide visibility mask for now
    this.visibilityMask.setVisible(false)
    
    // Get player world position
    const playerX = this.player.x
    const playerY = this.player.y
    
    // Position the overlay image so the player appears in the lower 40% of the transparent area
    // 
    // Image specs:
    // - Total size: 2880 × 3200
    // - Image center: (1440, 1600)
    // - Transparent area: 320 × 320, positioned at y=1600 to y=1920 in image coordinates
    // - Player should be 128px from bottom of transparent area (40% from bottom) = y=1792 in image coordinates
    //
    // Offset needed: Image center is at y=1600, player should be at y=1792
    // So image needs to be positioned 192 pixels UP from player position
    const overlayX = playerX
    const overlayY = playerY - 192
    
    this.visibilityMask.setPosition(overlayX, overlayY)
    
    // Scale handling is done in activateFlashPowerUp() and when timer expires
  }
  
  private showPointPopup(x: number, y: number, points: number): void {
    // Create popup text matching HUD font style
    const popupText = this.add.text(x, y, `+${points}`, {
      fontSize: '16px',
      color: '#00ff00',
      fontFamily: 'Arial Black',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(150)
    
    // Simple fade out animation - no movement
    this.tweens.add({
      targets: popupText,
      alpha: 0,
      duration: 1200,
      ease: 'Power1.easeOut',
      onComplete: () => {
        popupText.destroy()
      }
    })
  }
  
  private handlePlayerDamage(player: Player, cat: any): void {
    if (this.isGameOver) return
    
    // Reset combo on hit
    this.resetCombo()
    
    // Lose a life
    this.lives--
    this.game.registry.set('playerLives', this.lives)  // Save to registry
    this.updateLivesDisplay()
    
    // Stop the player and disable physics temporarily
    player.setVelocity(0, 0)
    player.setTint(0xff0000) // Turn player red
    player.body!.enable = false // Disable physics to prevent further collisions
    
    // Check if player has lives remaining
    if (this.lives > 0) {
      // Still have lives - restart current level
      this.showLostLifePopup()
    } else {
      // No lives left - game over
      this.isGameOver = true
      this.showGameOverScreen()
    }
  }
  
  private handleLadderOverlap(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    ladder: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ): void {
    const playerObj = player as Player
    
    // Check if player wants to climb
    if (playerObj.checkLadderProximity(ladder)) {
      if (!playerObj.getIsClimbing()) {
        playerObj.startClimbing(ladder)
      }
    }
    
    // More generous exit conditions - don't trap player at ladder tops
    if (playerObj.getIsClimbing()) {
      const ladderRect = ladder as Phaser.GameObjects.Rectangle
      const topOfLadder = ladderRect.y - ladderRect.height / 2
      const bottomOfLadder = ladderRect.y + ladderRect.height / 2
      
      // Exit climbing if player moves way beyond ladder bounds (more generous)
      if (playerObj.y < topOfLadder - 32 || playerObj.y > bottomOfLadder + 32) {
        playerObj.exitClimbing()
      }
    }
  }
  
  private updateTreasureChestInteraction(): void {
    // Check for automatic chest opening on contact
    for (let i = this.treasureChests.length - 1; i >= 0; i--) {
      const chest = this.treasureChests[i]
      
      if (!chest.canInteract()) continue
      
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        chest.sprite.x, chest.sprite.y
      )
      
      // Check if player is touching the chest (smaller distance for contact)
      if (distance < 32) { // Contact range - about 1 tile
        // Check if player is on the same floor (within reasonable Y distance)
        const playerBody = this.player.body as Phaser.Physics.Arcade.Body
        const isOnGround = playerBody.blocked.down
        
        if (isOnGround) {
          this.openTreasureChest(chest)
          break // Only open one chest per frame
        }
      }
    }
  }
  
  private updateDoorPrompt(): void {
    if (!this.door) {
      return
    }
    
    // Check if player is near the door and on the correct floor
    const levelConfig = this.levelManager.getLevelConfig(this.levelManager.getCurrentLevel())
    const doorFloor = levelConfig.floorCount - 1
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body
    const isOnGround = playerBody.blocked.down
    
    // Calculate distance to door
    const distance = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.door.x, this.door.y
    )
    
    // Show prompt if player is close to door, on correct floor, and on ground
    const isNearDoor = distance < 80 // Door activation range (increased from 60)
    const isOnDoorFloor = this.currentFloor === doorFloor
    
    if (isNearDoor && isOnDoorFloor && isOnGround) {
      this.door.showPrompt(this.player)
      
      // Also check for UP key press here
      const upPressed = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP).isDown ||
                       this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W).isDown ||
                       (this.touchControls?.upPressed || false)
      
      if (upPressed && !this.isLevelComplete) {
        this.completeLevel()
      }
    } else {
      this.door.hidePrompt()
    }
  }
  
  private openTreasureChest(chest: TreasureChest): void {
    // Don't open chests during intro animation
    if (this.isLevelStarting) return
    
    const contents = chest.open()
    
    // Award base chest points (2500)
    this.score += 2500
    this.updateScoreDisplay()
    
    // Show point popup for chest
    this.showPointPopup(chest.sprite.x, chest.sprite.y - 30, 2500)
    
    // Spawn items on the floor around the chest
    this.spawnTreasureChestContents(chest.sprite.x, chest.sprite.y, contents)
    
    // Make chest fade away after opening
    this.tweens.add({
      targets: chest.sprite,
      alpha: 0,
      duration: 2000,
      ease: 'Power2.easeOut',
      onComplete: () => {
        // Remove from treasureChests array
        const index = this.treasureChests.indexOf(chest)
        if (index > -1) {
          this.treasureChests.splice(index, 1)
        }
        chest.destroy()
      }
    })
    
    // No need to remove interaction since chests open automatically on contact
  }
  
  private spawnTreasureChestContents(chestX: number, chestY: number, contents: any): void {
    const spawnPositions = [
      { x: chestX - 60, y: chestY },
      { x: chestX + 60, y: chestY },
      { x: chestX - 45, y: chestY },
      { x: chestX + 45, y: chestY },
      { x: chestX - 30, y: chestY },
      { x: chestX + 30, y: chestY },
      { x: chestX - 15, y: chestY },
      { x: chestX + 15, y: chestY },
      { x: chestX, y: chestY - 30 },
      { x: chestX, y: chestY + 15 }
    ]
    
    let positionIndex = 0
    
    // Spawn coins (5-10 as specified in contents)
    for (let i = 0; i < contents.coins; i++) {
      if (positionIndex >= spawnPositions.length) break
      
      const pos = spawnPositions[positionIndex++]
      const coin = new Coin(this, pos.x, pos.y)
      this.coins.push(coin)
      
      // Add physics overlap detection
      this.physics.add.overlap(
        this.player,
        coin.sprite,
        () => this.handleCoinCollection(coin),
        undefined,
        this
      )
      
      // Add bouncy spawn animation
      this.tweens.add({
        targets: coin.sprite,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 300,
        ease: 'Back.easeOut',
        yoyo: true
      })
    }
    
    // Spawn diamond if present
    if (contents.diamond && positionIndex < spawnPositions.length) {
      const pos = spawnPositions[positionIndex++]
      const diamond = new Diamond(this, pos.x, pos.y)
      this.diamonds.push(diamond)
      
      // Add physics overlap detection
      this.physics.add.overlap(
        this.player,
        diamond.sprite,
        () => this.handleDiamondCollection(diamond),
        undefined,
        this
      )
      
      // Add dramatic spawn animation
      this.tweens.add({
        targets: [diamond.sprite, diamond.diamondGraphics],
        scaleX: 1.5,
        scaleY: 1.5,
        duration: 500,
        ease: 'Back.easeOut',
        yoyo: true
      })
    }
    
    // Flash power-up spawning disabled
    // if (contents.flashPowerUp && positionIndex < spawnPositions.length) {
    //   const pos = spawnPositions[positionIndex++]
    //   const flashPowerUp = new FlashPowerUp(this, pos.x, pos.y)
    //   this.flashPowerUps.push(flashPowerUp)
    //   
    //   // Add physics overlap detection
    //   this.physics.add.overlap(
    //     this.player,
    //     flashPowerUp.sprite,
    //     () => this.handleFlashPowerUpCollection(flashPowerUp),
    //     undefined,
    //     this
    //   )
    //   
    //   // Add electric spawn animation
    //   this.tweens.add({
    //     targets: flashPowerUp.sprite,
    //     scaleX: 1.4,
    //     scaleY: 1.4,
    //     duration: 400,
    //     ease: 'Back.easeOut',
    //     yoyo: true
    //   })
    // }
  }

  update(_time: number, _deltaTime: number): void {
    if (this.isGameOver) return
    
    
    // Update touch controls
    this.touchControls.update()
    
    // Check for treasure chest interaction
    this.updateTreasureChestInteraction()
    
    // Update door prompt visibility
    this.updateDoorPrompt()
    
    // Update player
    this.player.update()
    
    // Update visibility system
    this.updateVisibilitySystem()
    
    // Update all cats
    this.cats.children.entries.forEach(cat => {
      (cat as Cat).update(this.time.now, this.game.loop.delta)
    })
    
    // Update all ceiling cats and check ladder exits
    this.ceilingCats.children.entries.forEach(ceilingCat => {
      const catObj = ceilingCat as CeilingCat
      catObj.update(this.time.now, this.game.loop.delta)
      
      // Red cats no longer climb ladders
    })
    
    // Check if player is no longer overlapping any ladder while climbing
    if (this.player.getIsClimbing()) {
      let stillOnLadder = false
      this.ladders.children.entries.forEach(ladder => {
        if (this.physics.world.overlap(this.player, ladder)) {
          stillOnLadder = true
        }
      })
      
      if (!stillOnLadder) {
        this.player.exitClimbing()
      }
    }
    
    // Update current floor based on player position
    const tileSize = GameSettings.game.tileSize
    const floorSpacing = tileSize * 5
    const playerFloor = Math.max(0, Math.floor((GameSettings.canvas.height - this.player.y - tileSize/2) / floorSpacing))
    
    if (playerFloor !== this.currentFloor) {
      // Award bonus points for reaching new floors
      if (playerFloor > this.currentFloor) {
        this.score += GameSettings.scoring.floorBonus
        this.updateScoreDisplay()
      }
      this.currentFloor = playerFloor
      // No floor text to update anymore - we show coins instead
    }
    
    // Generate new floors if player is getting close to the top
    // But NEVER generate floors for discrete levels - all floors are created in createTestLevel
    const levelConfig = this.levelManager.getLevelConfig(this.levelManager.getCurrentLevel())
    
    if (levelConfig.isEndless && this.currentFloor >= this.highestFloorGenerated - 3) {
      this.generateNextFloors()
    }
  }
  
  private generateNextFloors(): void {
    const tileSize = GameSettings.game.tileSize
    const floorWidth = GameSettings.game.floorWidth
    const floorSpacing = tileSize * 5
    
    // Check level limits
    const levelConfig = this.levelManager.getLevelConfig(this.levelManager.getCurrentLevel())
    const maxFloor = levelConfig.isEndless ? 999 : levelConfig.floorCount
    
    // Generate up to 5 more floors, but stop BEFORE the door floor for discrete levels
    // Door floor should be the final floor, so don't generate it here - it's generated in createTestLevel
    let floorsToGenerate
    if (levelConfig.isEndless) {
      floorsToGenerate = 5 // Endless mode, keep generating
    } else {
      // For discrete levels, stop generating floors BEFORE the door floor
      // The door is on the last floor (levelConfig.floorCount - 1, but floor counting starts at 0)
      // So the door is on floor index (floorCount - 1) 
      floorsToGenerate = Math.min(5, Math.max(0, levelConfig.floorCount - 1 - this.highestFloorGenerated))
    }
    
    for (let i = 0; i < floorsToGenerate; i++) {
      const floor = this.highestFloorGenerated + i + 1
      const y = -floor * floorSpacing + GameSettings.canvas.height - tileSize/2
      
      // Create floor with random gap
      const hasGap = Math.random() > 0.3
      let layout: { gapStart: number, gapSize: number }
      
      if (hasGap) {
        const gapStart = Math.floor(Math.random() * (floorWidth - 5)) + 2
        const gapSize = Math.floor(Math.random() * 2) + 2
        layout = { gapStart, gapSize }
        
        // Create platform tiles with gap
        for (let x = 0; x < floorWidth; x++) {
          if (x < gapStart || x >= gapStart + gapSize) {
            this.createPlatformTile(x * tileSize + tileSize/2, y)
          }
        }
      } else {
        layout = { gapStart: -1, gapSize: 0 }
        
        // Create complete floor
        for (let x = 0; x < floorWidth; x++) {
          this.createPlatformTile(x * tileSize + tileSize/2, y)
        }
      }
      
      this.floorLayouts[floor] = layout
      
      // Add ladder connecting to previous floor
      // But don't add ladders leading TO the top floor (where the door is)
      const isTopFloor = !levelConfig.isEndless && floor >= levelConfig.floorCount - 1
      
      if (floor > 0 && this.floorLayouts[floor - 1] && !isTopFloor) {
        const prevLayout = this.floorLayouts[floor - 1]
        const validPositions: number[] = []
        
        // Find positions with platforms on both floors
        for (let x = 1; x < floorWidth - 1; x++) {
          if (this.hasPlatformAt(prevLayout, x) && this.hasPlatformAt(layout, x)) {
            validPositions.push(x)
          }
        }
        
        if (validPositions.length > 0) {
          const ladderX = validPositions[Math.floor(Math.random() * validPositions.length)]
          const bottomY = -(floor - 1) * floorSpacing + GameSettings.canvas.height - tileSize
          const topY = -floor * floorSpacing + GameSettings.canvas.height - tileSize
          this.createContinuousLadder(ladderX * tileSize, bottomY, topY)
          this.storeLadderPositions(floor - 1, [ladderX]) // Store for the bottom floor
        }
      }
      
      // Add collectibles on the new floor using the same system as initial creation
      const collectibleY = y - tileSize - 8
      const validPositions: number[] = []
      
      for (let x = 1; x < floorWidth - 1; x++) {
        if (this.hasPlatformAt(layout, x)) {
          validPositions.push(x)
        }
      }
      
      if (validPositions.length > 0) {
        // Get allowed collectible types for current level (reuse the levelConfig from above)
        const allowedCollectibles = levelConfig.collectibleTypes
        
        // Track all used positions for this floor across all collectible types
        const floorUsedPositions: number[] = []
        
        // Regular coins: 2-4 per floor
        if (allowedCollectibles.includes('coin')) {
          const numCoins = Math.floor(Math.random() * 3) + 2
          this.placeCollectiblesOfType(validPositions, numCoins, 'coin', collectibleY, floor, floorUsedPositions)
        }
        
        // Blue coins: 1 per 1-2 floors (500 points)
        if (allowedCollectibles.includes('blueCoin') && floor > 0 && (floor % 2 === 0 || Math.random() < 0.5)) {
          this.placeCollectiblesOfType(validPositions, 1, 'blueCoin', collectibleY, floor, floorUsedPositions)
        }
        
        // Diamonds: 1 per 1-3 floors (1000 points)  
        if (allowedCollectibles.includes('diamond') && floor > 1 && (floor % 3 === 0 || Math.random() < 0.3)) {
          this.placeCollectiblesOfType(validPositions, 1, 'diamond', collectibleY, floor, floorUsedPositions)
        }
        
        // Treasure chests: 1 per 1-3 floors starting floor 3 (2500 points + contents)
        if (allowedCollectibles.includes('treasureChest') && floor >= 3 && (floor % 3 === 0 || Math.random() < 0.35)) {
          this.placeCollectiblesOfType(validPositions, 1, 'treasureChest', collectibleY, floor, floorUsedPositions)
        }
        
        // Flash power-ups: DISABLED
        // if (floor > 20 && Math.random() < 0.1) {
        //   this.placeCollectiblesOfType(validPositions, 1, 'flashPowerUp', collectibleY, floor, floorUsedPositions)
        // }
      }
      
      // Get allowed enemy types for current level (reuse the levelConfig from above)
      const allowedEnemies = levelConfig.enemyTypes
      
      // Map enemy types to cat colors
      const availableColors: string[] = []
      if (allowedEnemies.includes('blue')) availableColors.push('blue')
      if (allowedEnemies.includes('yellow')) availableColors.push('yellow')
      if (allowedEnemies.includes('green')) availableColors.push('green')
      
      // Add regular cat on some floors (if any colors are available)
      if (availableColors.length > 0 && floor > 1 && Math.random() > 0.5) {
        const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)]
        
        if (layout.gapStart === -1) {
          // Complete floor
          console.log(`Spawning enemy on complete floor at base Y: ${y}, final Y: ${y - 16}`)
          const cat = new Cat(
            this,
            (floorWidth / 2) * tileSize,
            y - 16, // Spawn just above the floor platform
            tileSize * 1.5,
            tileSize * (floorWidth - 1.5),
            randomColor as any
          )
          // Green cats already get full floor bounds by default
          this.cats.add(cat)
        } else if (layout.gapStart > 3) {
          // Place on left section if big enough
          const cat = new Cat(
            this,
            (layout.gapStart / 2) * tileSize,
            y - 16, // Spawn just above the floor platform
            tileSize * 0.5,
            tileSize * (layout.gapStart - 0.5),
            randomColor as any
          )
          // Green cats use full left section bounds
          if (cat.getCatColor() === 'green') {
            cat.platformBounds = {
              left: tileSize * 0.5,
              right: tileSize * (layout.gapStart - 0.5)
            }
          }
          this.cats.add(cat)
        }
      }
      
      // Add ceiling cats to some floors (only if red enemies are allowed)
      if (allowedEnemies.includes('red') && floor > 2 && Math.random() > 0.4) { // 60% chance
        const maxCeilingCats = floor < 20 ? 1 : 2
        const numCeilingCats = Math.floor(Math.random() * maxCeilingCats) + 1
        
        // Find valid ceiling positions
        const validCeilingPositions: number[] = []
        
        if (layout.gapStart === -1) {
          // Complete floor
          for (let x = 2; x < floorWidth - 2; x++) {
            validCeilingPositions.push(x)
          }
        } else {
          // Floor with gap
          for (let x = 2; x < layout.gapStart - 1; x++) {
            validCeilingPositions.push(x)
          }
          for (let x = layout.gapStart + layout.gapSize + 1; x < floorWidth - 2; x++) {
            validCeilingPositions.push(x)
          }
        }
        
        // Place ceiling cats
        for (let j = 0; j < Math.min(numCeilingCats, validCeilingPositions.length); j++) {
          const randomIndex = Math.floor(Math.random() * validCeilingPositions.length)
          const tileX = validCeilingPositions[randomIndex]
          const ceilingCatX = tileX * tileSize + tileSize/2
          
          // Calculate floor Y position for stalker cats (on the floor, not ceiling)
          const currentFloorY = -floor * floorSpacing + GameSettings.canvas.height - tileSize/2
          const stalkerY = currentFloorY - 16 // Just above the floor platform
          
          validCeilingPositions.splice(randomIndex, 1)
          
          // Calculate platform bounds
          let leftBound = tileSize * 0.5
          let rightBound = tileSize * (floorWidth - 0.5)
          
          if (layout.gapStart !== -1) {
            if (tileX < layout.gapStart) {
              rightBound = tileSize * (layout.gapStart - 0.5)
            } else {
              leftBound = tileSize * (layout.gapStart + layout.gapSize + 0.5)
            }
          }
          
          const stalkerCat = new CeilingCat(
            this,
            ceilingCatX,
            stalkerY,
            leftBound,
            rightBound
          )
          
          stalkerCat.setPlayerReference(this.player)
          this.ceilingCats.add(stalkerCat)
        }
      }
    }
    
    this.highestFloorGenerated += floorsToGenerate
  }

  private waitForAssetsAndStartIntro(targetX: number, targetY: number): void {
    console.log('⏳ WAITING FOR ASSETS TO LOAD')
    
    const checkAssets = () => {
      const assetsReady = this.registry.get('assetsReady')
      const hasClimbSprites = this.textures.exists('playerClimbLeftFoot') && this.textures.exists('playerClimbRightFoot')
      const hasRunSprites = this.textures.exists('playerRunLeftFoot') && this.textures.exists('playerRunRightFoot')
      
      console.log(`   Assets ready flag: ${assetsReady}`)
      console.log(`   Climb sprites: ${hasClimbSprites}`)
      console.log(`   Run sprites: ${hasRunSprites}`)
      
      if (assetsReady && hasClimbSprites && hasRunSprites) {
        console.log('✅ ALL ASSETS READY - Starting intro')
        this.startLevelIntro(targetX, targetY)
      } else {
        // Check again in 100ms
        this.time.delayedCall(100, checkAssets)
      }
    }
    
    checkAssets()
  }

  private startLevelIntro(targetX: number, targetY: number): void {
    this.isLevelStarting = true
    
    console.log('🎬 LEVEL INTRO START')
    console.log(`   Target position: (${targetX}, ${targetY})`)
    console.log(`   Canvas size: ${GameSettings.canvas.width}x${GameSettings.canvas.height}`)
    console.log('   Player physics already disabled - no falling!')
    
    // Create entrance ladder extending below the floor
    const tileSize = GameSettings.game.tileSize
    const ladderX = 100 // Position ladder on the left side
    const floorY = GameSettings.canvas.height - tileSize/2
    
    console.log('🪜 ENTRANCE LADDER SETUP')
    console.log(`   Tile size: ${tileSize}`)
    console.log(`   Floor Y position: ${floorY}`)
    console.log(`   Target Y position: ${targetY}`)
    console.log(`   Ladder X position: ${ladderX}`)
    
    // Create entrance ladder to match game style exactly
    const entranceLadder = this.add.graphics()
    
    // Calculate ladder dimensions - extends from below screen to above floor
    const ladderTop = targetY - 60 // Extends above player position
    const ladderBottom = GameSettings.canvas.height + 100 // Below screen
    const ladderHeight = ladderBottom - ladderTop
    
    // Draw ladder like typical platformer game - brown wooden rails
    entranceLadder.fillStyle(0x8B4513, 1) // Brown wood color for rails
    entranceLadder.fillRect(ladderX - 8, ladderTop, 4, ladderHeight) // Left rail
    entranceLadder.fillRect(ladderX + 4, ladderTop, 4, ladderHeight) // Right rail
    
    // Add horizontal wooden rungs
    const rungSpacing = 16 // Closer spacing for better climbing feel
    const numRungs = Math.floor(ladderHeight / rungSpacing)
    entranceLadder.fillStyle(0xA0522D, 1) // Lighter brown for rungs
    
    for (let i = 0; i < numRungs; i++) {
      const rungY = ladderTop + (i * rungSpacing) + 8
      entranceLadder.fillRect(ladderX - 10, rungY, 20, 2) // Horizontal rungs
    }
    
    entranceLadder.setDepth(5)
    
    console.log(`   Ladder extends from Y:${ladderTop} (top) to Y:${ladderBottom} (bottom)`)
    console.log(`   Ladder height: ${ladderHeight}px`)
    
    // Position player at bottom of ladder (off-screen)
    const playerStartY = ladderBottom - 20
    this.player.x = ladderX
    this.player.y = playerStartY
    
    // Set initial climbing sprite (or fallback)
    if (this.textures.exists('playerClimbLeftFoot')) {
      this.player.setTexture('playerClimbLeftFoot')
    } else {
      this.player.setTexture('playerIdleEye1') // Fallback
    }
    this.player.setDisplaySize(48, 64)
    
    console.log('👤 PLAYER START POSITION')
    console.log(`   Player starting at: (${ladderX}, ${playerStartY})`)
    console.log(`   Player will climb to: (${ladderX}, ${targetY})`)
    
    // Debug markers (temporary)
    if (GameSettings.debug) {
      const debugGraphics = this.add.graphics()
      debugGraphics.fillStyle(0xff0000, 0.5)
      debugGraphics.fillCircle(ladderX, floorY, 10) // Red dot at floor level
      debugGraphics.fillStyle(0x00ff00, 0.5)
      debugGraphics.fillCircle(ladderX, playerStartY, 10) // Green dot at player start
      debugGraphics.fillStyle(0x0000ff, 0.5)
      debugGraphics.fillCircle(targetX, targetY, 10) // Blue dot at target position
      debugGraphics.setDepth(500)
      
      console.log('🔴 Red = Floor level')
      console.log('🟢 Green = Player start position')
      console.log('🔵 Blue = Target position')
    }
    
    // Phase 1: Climbing animation - climb to the actual target Y (not floor Y)
    this.animatePlayerClimbing(ladderX, targetY, () => {
      // Phase 2: Walking animation
      this.animatePlayerWalking(targetX, targetY, () => {
        // Phase 3: Complete intro
        this.player.body!.enable = true
        this.isLevelStarting = false
        
        // Fade out entrance ladder
        this.tweens.add({
          targets: entranceLadder,
          alpha: 0,
          duration: 500,
          onComplete: () => {
            entranceLadder.destroy()
          }
        })
        
        // Show start banner
        this.showStartBanner()
      })
    })
  }
  
  private animatePlayerClimbing(ladderX: number, targetY: number, onComplete: () => void): void {
    console.log('🧗 CLIMBING ANIMATION START')
    console.log(`   Current player Y: ${this.player.y}`)
    console.log(`   Target Y: ${targetY}`)
    console.log(`   Distance to climb: ${this.player.y - targetY}px`)
    
    // Check if sprites are loaded
    const hasClimbSprites = this.textures.exists('playerClimbLeftFoot') && this.textures.exists('playerClimbRightFoot')
    console.log(`   Climb sprites loaded: ${hasClimbSprites}`)
    
    if (!hasClimbSprites) {
      console.warn('⚠️ Climb sprites not loaded! Using fallback animation')
    }
    
    // Manual climbing animation
    let climbFrame = 0
    const climbSpeed = 80 // Speed of climbing
    const frameRate = 120 // Animation frame rate in ms
    
    // Create a timer for animation frames
    const climbTimer = this.time.addEvent({
      delay: frameRate,
      callback: () => {
        // Check for sprites each frame (they might load during animation)
        const spritesNowAvailable = this.textures.exists('playerClimbLeftFoot') && this.textures.exists('playerClimbRightFoot')
        
        // Alternate climbing sprites if available
        if (spritesNowAvailable) {
          if (climbFrame % 2 === 0) {
            this.player.setTexture('playerClimbLeftFoot')
          } else {
            this.player.setTexture('playerClimbRightFoot')
          }
          this.player.setDisplaySize(48, 64) // Maintain sprite size
        }
        climbFrame++
      },
      loop: true
    })
    
    // Move player up the ladder
    this.tweens.add({
      targets: this.player,
      y: targetY,
      duration: 2000, // 2 seconds to climb
      ease: 'Linear',
      onUpdate: (tween) => {
        if (climbFrame === 1) { // Log once during climb
          console.log(`   Climbing... Current Y: ${this.player.y.toFixed(0)}`)
        }
      },
      onComplete: () => {
        console.log('🧗 CLIMBING COMPLETE')
        console.log(`   Final climb position: (${this.player.x}, ${this.player.y})`)
        climbTimer.destroy()
        onComplete()
      }
    })
  }
  
  private animatePlayerWalking(targetX: number, targetY: number, onComplete: () => void): void {
    console.log('🚶 WALKING ANIMATION START')
    console.log(`   Current player position: (${this.player.x}, ${this.player.y})`)
    console.log(`   Target X: ${targetX}`)
    console.log(`   Distance to walk: ${targetX - this.player.x}px`)
    
    // Check if sprites are loaded
    const hasRunSprites = this.textures.exists('playerRunLeftFoot') && this.textures.exists('playerRunRightFoot')
    console.log(`   Run sprites loaded: ${hasRunSprites}`)
    
    if (!hasRunSprites) {
      console.warn('⚠️ Run sprites not loaded! Using fallback animation')
    }
    
    // Manual walking animation
    let walkFrame = 0
    const frameRate = 120 // Animation frame rate in ms
    
    // Face right for walking
    this.player.setFlipX(false)
    
    // Create a timer for animation frames
    const walkTimer = this.time.addEvent({
      delay: frameRate,
      callback: () => {
        // Check for sprites each frame (they might load during animation)
        const spritesNowAvailable = this.textures.exists('playerRunLeftFoot') && this.textures.exists('playerRunRightFoot')
        
        // Alternate walking sprites if available
        if (spritesNowAvailable) {
          if (walkFrame % 2 === 0) {
            this.player.setTexture('playerRunLeftFoot')
          } else {
            this.player.setTexture('playerRunRightFoot')
          }
          this.player.setDisplaySize(48, 64) // Maintain sprite size
        }
        walkFrame++
      },
      loop: true
    })
    
    // Move player horizontally to starting position
    this.tweens.add({
      targets: this.player,
      x: targetX,
      duration: 1500, // 1.5 seconds to walk
      ease: 'Linear',
      onComplete: () => {
        console.log('🚶 WALKING COMPLETE')
        console.log(`   Final position: (${this.player.x}, ${this.player.y})`)
        console.log('✅ INTRO SEQUENCE COMPLETE - Enabling controls')
        
        walkTimer.destroy()
        // Set to idle animation
        this.player.setTexture('playerIdleEye1')
        this.player.setDisplaySize(48, 64)
        onComplete()
      }
    })
  }
  
  private showStartBanner(): void {
    const levelNum = this.levelManager.getCurrentLevel()
    const levelConfig = this.levelManager.getLevelConfig(levelNum)
    
    const bannerText = this.add.text(
      GameSettings.canvas.width / 2,
      GameSettings.canvas.height / 2 - 100,
      levelConfig.isEndless ? 'ENDLESS MODE!' : `LEVEL ${levelNum}`,
      {
        fontSize: '36px',
        color: '#ffff00',
        fontFamily: 'Arial Black',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 6
      }
    ).setOrigin(0.5).setDepth(300).setScrollFactor(0)
    
    const startText = this.add.text(
      GameSettings.canvas.width / 2,
      GameSettings.canvas.height / 2 - 50,
      'GO!',
      {
        fontSize: '48px',
        color: '#00ff00',
        fontFamily: 'Arial Black',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 6
      }
    ).setOrigin(0.5).setDepth(300).setScrollFactor(0).setAlpha(0)
    
    // Animate the banner
    this.time.delayedCall(500, () => {
      this.tweens.add({
        targets: startText,
        alpha: 1,
        duration: 300,
        yoyo: true,
        hold: 500,
        onComplete: () => {
          bannerText.destroy()
          startText.destroy()
        }
      })
    })
  }
  
  private showEndlessModePopup(): void {
    // Create popup for endless mode announcement
    const popup = this.add.rectangle(
      GameSettings.canvas.width / 2,
      GameSettings.canvas.height / 2,
      350,
      200,
      0x2c2c2c,
      0.95
    ).setDepth(250).setScrollFactor(0)
    
    const border = this.add.rectangle(
      GameSettings.canvas.width / 2,
      GameSettings.canvas.height / 2,
      354,
      204,
      0xffffff
    ).setDepth(249).setScrollFactor(0)
    border.setStrokeStyle(3, 0xffffff)
    border.setFillStyle()
    
    const title = this.add.text(
      GameSettings.canvas.width / 2,
      GameSettings.canvas.height / 2 - 50,
      'ENDLESS MODE UNLOCKED!',
      {
        fontSize: '24px',
        color: '#ff44ff',
        fontFamily: 'Arial Black',
        fontStyle: 'bold',
        align: 'center'
      }
    ).setOrigin(0.5).setDepth(251).setScrollFactor(0)
    
    const desc = this.add.text(
      GameSettings.canvas.width / 2,
      GameSettings.canvas.height / 2 + 10,
      'No more levels!\nClimb as high as you can!\nDifficulty has plateaued.',
      {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'Arial',
        align: 'center'
      }
    ).setOrigin(0.5).setDepth(251).setScrollFactor(0)
    
    // Auto-dismiss after 3 seconds
    this.time.delayedCall(3000, () => {
      popup.destroy()
      border.destroy()
      title.destroy()
      desc.destroy()
    })
  }
  
  private createLevelEndDoor(): void {
    const levelConfig = this.levelManager.getLevelConfig(this.levelManager.getCurrentLevel())
    
    // Only create door for non-endless levels
    if (!levelConfig.isEndless && levelConfig.floorCount > 0) {
      const tileSize = GameSettings.game.tileSize
      const floorSpacing = tileSize * 5 // Same spacing as in createTestLevel
      
      // Calculate the Y position of the top floor
      const topFloor = levelConfig.floorCount - 1
      const topFloorY = GameSettings.canvas.height - tileSize/2 - (topFloor * floorSpacing)
      
      // Enhanced door placement with ladder and collectible conflict avoidance
      const doorX = this.findSafeDoorPosition(topFloor)
      
      // Place door on top floor - door is 100 pixels tall, position so bottom sits on platform surface
      // topFloorY is platform center, platform is 32px tall, so platform top is topFloorY - 16
      const platformTop = topFloorY - (tileSize / 2)
      const doorY = platformTop - 50 // Door center positioned so bottom sits on platform surface
      console.log(`🚪 DOOR POSITIONING DEBUG: topFloorY=${topFloorY}, platformTop=${platformTop}, doorY=${doorY}`)
      console.log(`🚪 DOOR POSITIONING DEBUG: Camera Y=${this.cameras.main.scrollY}, Player Y should be around ${doorY + 100}`)
      
      const isFirstLevel = this.levelManager.getCurrentLevel() === 1
      this.door = new Door(this, doorX, doorY, isFirstLevel)
      
      // Store door position for future collision avoidance
      this.storeDoorPosition(topFloor, Math.floor(doorX / tileSize))
      
      // Add collision detection for door
      this.physics.add.overlap(
        this.player,
        this.door,
        this.handleDoorOverlap,
        undefined,
        this
      )
    }
  }
  
  private findSafeDoorPosition(floor: number): number {
    const tileSize = GameSettings.game.tileSize
    const floorWidth = GameSettings.game.floorWidth
    const doorFloorLayout = this.floorLayouts[floor]
    const doorWidth = 3 // Door takes up about 3 tiles width
    
    // Get ladder positions on this floor to avoid conflicts
    const ladderPositions = this.ladderPositions.get(floor) || []
    
    // Find safe positions (not over gaps, not conflicting with ladders)
    const safePositions: number[] = []
    
    for (let x = 2; x < floorWidth - 2 - doorWidth; x++) {
      let isSafe = true
      
      // Check if this position and surrounding area are over solid ground
      for (let dx = 0; dx < doorWidth; dx++) {
        if (!this.hasPlatformAt(doorFloorLayout, x + dx)) {
          isSafe = false
          break
        }
      }
      
      // Check for ladder conflicts (door needs clearance from ladders)
      if (isSafe) {
        for (const ladderX of ladderPositions) {
          if (Math.abs(x - ladderX) < 4) { // Need at least 4 tiles clearance from ladders
            isSafe = false
            break
          }
        }
      }
      
      if (isSafe) {
        safePositions.push(x)
      }
    }
    
    // Choose position - prefer center, but avoid conflicts
    let doorTileX: number
    if (safePositions.length > 0) {
      // Find position closest to center
      const centerTile = Math.floor(floorWidth / 2)
      doorTileX = safePositions.reduce((closest, pos) => 
        Math.abs(pos - centerTile) < Math.abs(closest - centerTile) ? pos : closest
      )
    } else {
      // Fallback - use center and hope for the best
      doorTileX = Math.floor(floorWidth / 2) - Math.floor(doorWidth / 2)
    }
    
    return (doorTileX + doorWidth/2) * tileSize // Return center X position of door
  }
  
  private storeDoorPosition(floor: number, tileX: number): void {
    // Store door position for collision avoidance in collectible placement
    if (!this.doorPositions) {
      this.doorPositions = new Map()
    }
    this.doorPositions.set(floor, tileX)
  }
  
  private handleDoorOverlap(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    door: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ): void {
    const doorObj = door as Door
    const playerObj = player as Player
    
    // Check if player is on the door floor (standing on ground)
    const levelConfig = this.levelManager.getLevelConfig(this.levelManager.getCurrentLevel())
    const doorFloor = levelConfig.floorCount - 1
    const playerBody = playerObj.body as Phaser.Physics.Arcade.Body
    const isOnGround = playerBody.blocked.down
    
    
    // Player must be on the correct floor and on ground
    if (this.currentFloor === doorFloor && isOnGround) {
      // Show prompt to enter door
      doorObj.showPrompt(playerObj)
      
      // Check for UP key press to activate door
      const upPressed = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP).isDown ||
                       this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W).isDown ||
                       (this.touchControls?.upPressed || false)
      
      if (upPressed && !this.isLevelComplete) {
        this.completeLevel()
      }
    } else {
      // Hide prompt when not in range
      doorObj.hidePrompt()
    }
  }
  
  private completeLevel(): void {
    if (this.isLevelComplete) return
    
    this.isLevelComplete = true
    
    // Disable player controls
    this.player.body!.enable = false
    
    // Show level complete screen
    this.showLevelCompleteScreen()
  }
  
  private showLevelCompleteScreen(): void {
    const levelNum = this.levelManager.getCurrentLevel()
    
    // Create overlay
    const overlay = this.add.rectangle(
      GameSettings.canvas.width / 2,
      GameSettings.canvas.height / 2,
      GameSettings.canvas.width,
      GameSettings.canvas.height,
      0x000000,
      0.7
    ).setDepth(299).setScrollFactor(0)
    
    // Create popup
    const popup = this.add.rectangle(
      GameSettings.canvas.width / 2,
      GameSettings.canvas.height / 2,
      350,
      250,
      0x2c2c2c
    ).setDepth(300).setScrollFactor(0)
    
    const border = this.add.rectangle(
      GameSettings.canvas.width / 2,
      GameSettings.canvas.height / 2,
      354,
      254,
      0xffffff
    ).setDepth(299.5).setScrollFactor(0)
    border.setStrokeStyle(3, 0xffffff)
    border.setFillStyle()
    
    // Title
    const title = this.add.text(
      GameSettings.canvas.width / 2,
      GameSettings.canvas.height / 2 - 80,
      `LEVEL ${levelNum} COMPLETE!`,
      {
        fontSize: '28px',
        color: '#44ff44',
        fontFamily: 'Arial Black',
        fontStyle: 'bold',
        align: 'center'
      }
    ).setOrigin(0.5).setDepth(301).setScrollFactor(0)
    
    // Stats
    const stats = this.add.text(
      GameSettings.canvas.width / 2,
      GameSettings.canvas.height / 2 - 20,
      `Score: ${this.score}\nFloors Climbed: ${this.currentFloor}`,
      {
        fontSize: '18px',
        color: '#ffffff',
        fontFamily: 'Arial',
        align: 'center'
      }
    ).setOrigin(0.5).setDepth(301).setScrollFactor(0)
    
    // Next level preview
    const nextLevel = levelNum + 1
    const nextConfig = this.levelManager.getLevelConfig(nextLevel)
    const preview = this.add.text(
      GameSettings.canvas.width / 2,
      GameSettings.canvas.height / 2 + 40,
      nextConfig.isEndless ? 'Next: ENDLESS MODE!' : `Next: Level ${nextLevel}`,
      {
        fontSize: '16px',
        color: '#ffff00',
        fontFamily: 'Arial',
        align: 'center'
      }
    ).setOrigin(0.5).setDepth(301).setScrollFactor(0)
    
    // Continue button
    const continueBtn = this.add.rectangle(
      GameSettings.canvas.width / 2,
      GameSettings.canvas.height / 2 + 85,
      150,
      40,
      0x44ff44
    ).setDepth(301).setScrollFactor(0)
    continueBtn.setInteractive({ useHandCursor: true })
    continueBtn.setStrokeStyle(2, 0x22aa22)
    
    const continueText = this.add.text(
      GameSettings.canvas.width / 2,
      GameSettings.canvas.height / 2 + 85,
      'CONTINUE',
      {
        fontSize: '20px',
        color: '#ffffff',
        fontFamily: 'Arial Black',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5).setDepth(302).setScrollFactor(0)
    
    // Continue button handler
    continueBtn.on('pointerdown', () => {
      // Advance to next level
      this.levelManager.nextLevel()
      
      // Restart scene with new level
      this.scene.restart()
    })
  }

  private updateCoinCounterDisplay(): void {
    const coinsTowardNext = this.totalCoinsCollected % this.COINS_PER_EXTRA_LIFE
    this.coinCounterText.setText(`COINS: ${coinsTowardNext}/${this.COINS_PER_EXTRA_LIFE}`)
  }

  private updateLivesDisplay(): void {
    // Show hearts for lives (max 9 to fit on screen)
    const heartsToShow = Math.min(this.lives, 9)
    const heartText = heartsToShow > 0 ? `❤️ x${heartsToShow}` : '💀 GAME OVER'
    this.livesText.setText(heartText)
  }

  private checkForExtraLife(): void {
    if (this.totalCoinsCollected > 0 && this.totalCoinsCollected % this.COINS_PER_EXTRA_LIFE === 0) {
      if (this.lives < this.MAX_LIVES) {
        this.lives++
        this.game.registry.set('playerLives', this.lives)  // Save to registry
        this.updateLivesDisplay()
        
        // Show extra life popup
        this.showExtraLifePopup()
      }
    }
  }

  private showExtraLifePopup(): void {
    const popup = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 50,
      'EXTRA LIFE!',
      {
        fontSize: '24px',
        color: '#00ff00',
        fontFamily: 'Arial Black',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3
      }
    ).setOrigin(0.5).setDepth(300).setScrollFactor(0)

    // Animate popup
    this.tweens.add({
      targets: popup,
      y: popup.y - 30,
      alpha: 0,
      duration: 2000,
      ease: 'Power2.easeOut',
      onComplete: () => popup.destroy()
    })
  }

  private showLostLifePopup(): void {
    // Create semi-transparent overlay
    const overlay = this.add.rectangle(
      GameSettings.canvas.width / 2,
      GameSettings.canvas.height / 2,
      GameSettings.canvas.width,
      GameSettings.canvas.height,
      0x000000,
      0.7
    ).setDepth(199).setScrollFactor(0)
    
    // Create popup background
    const popupWidth = 280
    const popupHeight = 180
    const popupX = this.cameras.main.width / 2
    const popupY = this.cameras.main.height / 2
    
    const popupBg = this.add.rectangle(
      popupX,
      popupY,
      popupWidth,
      popupHeight,
      0x2c2c2c
    ).setDepth(200).setScrollFactor(0)
    
    popupBg.setStrokeStyle(3, 0xffffff)
    
    // Lost life title
    const title = this.add.text(
      popupX,
      popupY - 45,
      'LIFE LOST!',
      {
        fontSize: '28px',
        color: '#ff6666',
        fontFamily: 'Arial Black',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3
      }
    ).setOrigin(0.5).setDepth(201).setScrollFactor(0)
    
    // Lives remaining
    const livesText = this.add.text(
      popupX,
      popupY - 10,
      `Lives Remaining: ${this.lives}`,
      {
        fontSize: '18px',
        color: '#ffffff',
        fontFamily: 'Arial Black',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5).setDepth(201).setScrollFactor(0)
    
    // Continue button
    const continueBtn = this.add.rectangle(
      popupX,
      popupY + 40,
      140,
      35,
      0x44ff44
    ).setDepth(201).setScrollFactor(0)
    continueBtn.setInteractive({ useHandCursor: true })
    continueBtn.setStrokeStyle(2, 0x22aa22)
    
    const continueText = this.add.text(
      popupX,
      popupY + 40,
      'CONTINUE',
      {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'Arial Black',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5).setDepth(202).setScrollFactor(0)
    
    // Continue button handler - restart current level
    continueBtn.on('pointerdown', () => {
      this.scene.restart() // This will keep current level and not reset lives/coins
    })
    
    // Hover effects
    continueBtn.on('pointerover', () => {
      continueBtn.setFillStyle(0x66ff66)
    })
    
    continueBtn.on('pointerout', () => {
      continueBtn.setFillStyle(0x44ff44)
    })
  }

  private showGameOverScreen(): void {
    // Create semi-transparent overlay
    const overlay = this.add.rectangle(
      GameSettings.canvas.width / 2,
      GameSettings.canvas.height / 2,
      GameSettings.canvas.width,
      GameSettings.canvas.height,
      0x000000,
      0.7
    ).setDepth(199).setScrollFactor(0)
    
    // Create popup background
    const popupWidth = 300
    const popupHeight = 220
    const popupX = this.cameras.main.width / 2
    const popupY = this.cameras.main.height / 2
    
    const popupBg = this.add.rectangle(
      popupX,
      popupY,
      popupWidth,
      popupHeight,
      0x2c2c2c
    ).setDepth(200).setScrollFactor(0)
    
    popupBg.setStrokeStyle(3, 0xffffff)
    
    // Game over title
    const gameOverTitle = this.add.text(
      popupX,
      popupY - 60,
      'GAME OVER!',
      {
        fontSize: '32px',
        color: '#ff4444',
        fontFamily: 'Arial Black',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
      }
    ).setOrigin(0.5).setDepth(201).setScrollFactor(0)
    
    // Display final score
    const scoreText = this.add.text(
      popupX,
      popupY - 20,
      `Final Score: ${this.score}`,
      {
        fontSize: '20px',
        color: '#ffd700',
        fontFamily: 'Arial Black',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5).setDepth(201).setScrollFactor(0)
    
    // Display total coins collected
    const coinsText = this.add.text(
      popupX,
      popupY + 5,
      `Coins Collected: ${this.totalCoinsCollected}`,
      {
        fontSize: '16px',
        color: '#ffd700',
        fontFamily: 'Arial Black',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5).setDepth(201).setScrollFactor(0)
    
    // Restart button (full game restart)
    const restartButton = this.add.rectangle(
      popupX,
      popupY + 50,
      150,
      40,
      0x44ff44
    ).setDepth(201).setScrollFactor(0)
    restartButton.setInteractive({ useHandCursor: true })
    restartButton.setStrokeStyle(2, 0x22aa22)
    
    const restartText = this.add.text(
      popupX,
      popupY + 50,
      'START OVER',
      {
        fontSize: '18px',
        color: '#ffffff',
        fontFamily: 'Arial Black',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5).setDepth(202).setScrollFactor(0)
    
    // Start over handler - reset everything
    restartButton.on('pointerdown', () => {
      // Reset to level 1 and reset lives/coins
      this.levelManager.resetToStart()
      this.game.registry.set('playerLives', 3)
      this.game.registry.set('totalCoins', 0)
      this.scene.restart()
    })
    
    // Hover effects
    restartButton.on('pointerover', () => {
      restartButton.setFillStyle(0x66ff66)
    })
    
    restartButton.on('pointerout', () => {
      restartButton.setFillStyle(0x44ff44)
    })
    
    // Keyboard support
    this.input.keyboard!.on('keydown-R', () => {
      this.levelManager.resetToStart()
      this.game.registry.set('playerLives', 3)
      this.game.registry.set('totalCoins', 0)
      this.scene.restart()
    })
  }

  shutdown() {}
}