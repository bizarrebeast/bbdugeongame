import GameSettings from "../config/GameSettings"
import { Player } from "../objects/Player"
import { Cat } from "../objects/Cat"
import { StalkerCat } from "../objects/StalkerCat"
import { Coin } from "../objects/Coin"
import { BlueCoin } from "../objects/BlueCoin"
import { Diamond } from "../objects/Diamond"
import { TreasureChest } from "../objects/TreasureChest"
import { FlashPowerUp } from "../objects/FlashPowerUp"
import { TouchControls } from "../objects/TouchControls"
import { LevelManager } from "../systems/LevelManager"
import { Door } from "../objects/Door"
import { AssetPool, AssetConfig } from "../systems/AssetPool"
import { GemShapeGenerator, GemStyle, GemCut } from "../utils/GemShapes"

export class GameScene extends Phaser.Scene {
  private platforms!: Phaser.Physics.Arcade.StaticGroup
  private ladders!: Phaser.Physics.Arcade.StaticGroup
  private spikes!: Phaser.Physics.Arcade.StaticGroup
  private player!: Player
  private cats!: Phaser.Physics.Arcade.Group
  private stalkerCats!: Phaser.Physics.Arcade.Group
  private coins: Coin[] = []
  private blueCoins: BlueCoin[] = []
  private diamonds: Diamond[] = []
  private treasureChests: TreasureChest[] = []
  private flashPowerUps: FlashPowerUp[] = []
  private isGameOver: boolean = false
  private floorLayouts: { gapStart: number, gapSize: number }[] = []
  private ladderPositions: Map<number, number[]> = new Map() // floor -> ladder x positions
  private doorPositions: Map<number, number> = new Map() // floor -> door x position
  private score: number = 0 // Current level score only
  private accumulatedScore: number = 0 // Score from completed levels
  private scoreText!: Phaser.GameObjects.Text
  private currentFloor: number = 0
  private lives: number = 3
  private totalCoinsCollected: number = 0 // Still using coins internally for backwards compatibility
  private livesText!: Phaser.GameObjects.Text
  private coinCounterText!: Phaser.GameObjects.Text // Display shows crystals, but variable kept for compatibility
  private readonly COINS_PER_EXTRA_LIFE = 150 // Crystals needed for extra life
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
      {
        key: 'playerIdleEye3',
        url: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/idle%20eye%20position%203-TLisG1UJypI7PhiKszpBcC8Nx8ZyrS.png?6Tg9',
        type: 'image',
        retries: 3,
        fallback: 'defaultPlayer'
      },
      {
        key: 'playerIdleEye4',
        url: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/idle%20eye%20position%204-kvrv3THif8vcKjFB0NPzOeclqapVi6.png?PuWO',
        type: 'image',
        retries: 3,
        fallback: 'defaultPlayer'
      },
      {
        key: 'playerIdleEye5',
        url: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/idle%20eye%20position%205-1P13Nmi3xqoC5kWevrWUxutqyXfr99.png?F4D2',
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
        url: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/running%20left%20foot%20forward%20new-aH3WiqHkbYLeW14yketC7EdmowlQ02.png?jLLJ',
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
      },
      {
        key: 'tealLadder',
        url: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/new%20ladder-ULDbdT9I4h8apxhpJI6WT1PzmaMzLo.png?okOd',
        type: 'image',
        retries: 3
      }
    ]
    
    // Register assets with the pool
    this.assetPool.registerAssets(gameAssets)
    
    // Create fallback textures first
    this.assetPool.createCommonFallbacks()
    
    // Load critical assets via traditional method first for immediate availability
    this.load.image('blueEnemy', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4cc595d8-5f6a-49c0-9b97-9eabd3193403/enemy%20test%201-DFzrumkmpUN5HOwL25dNAVJzRcVxhv.png?rxbT')
    this.load.image('visibilityOverlay', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4cc595d8-5f6a-49c0-9b97-9eabd3193403/black%20overlay-aQ9bbCj7ooLaxsRl5pO9PxSt2SsWun.png?0nSO')
    
    // Load new blue enemy animation sprites
    this.load.image('blueEnemyMouthClosed', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/blue%20enemy%20mouth%20closed-HUXqx9HBdotEhJE2LBgzK8Z4kA7e2H.png?AVKZ')
    this.load.image('blueEnemyMouthClosedBlinking', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/blue%20enemy%20mouth%20closed%20blinking-bJ1xwYkoCZvjd4T9MdXzR45PfaZIcF.png?6LRV')
    this.load.image('blueEnemyMouthPartialOpen', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/blue%20enemy%20mouth%20partially%20open-PrzEwLEPYIPE6pJTgHBWV7SVvKYcSX.png?0RG2')
    this.load.image('blueEnemyMouthPartialOpenBlinking', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/blue%20enemy%20mouth%20partially%20open%20blinking-GfMaaIsvJGkTrtx4vIFnh11fvyTc5N.png?d3qY')
    this.load.image('blueEnemyMouthOpen', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/blue%20enemy%20mouth%20open-4hO9JLZDfnWgcQWlvfqiU7SCOXaA0g.png?sh1i')
    this.load.image('blueEnemyMouthOpenBlinking', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/blue%20enemy%20mouth%20open%20blinking-Nl5UA9KyScZCBwu9BrKXR0IdNk3aen.png?B9Tr')
    
    // Load red enemy animation sprites (8 sprites for patrol, bite, and blink)
    this.load.image('redEnemyMouthClosedEyes1', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/mouth%20closed%20eyes%201-RKF3p3F7fxdBSfen8UD9UGqIzf8zlv.png?xRpM')
    this.load.image('redEnemyMouthClosedEyes2', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/mouth%20closed%20eyes%202-vLWsEKkj7nPhdADyj947N0FQDi3QUf.png?Z82J')
    this.load.image('redEnemyMouthClosedBlinking', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/mouth%20closed%20eyes%20blinking-PiVnlocHV8Fra4PC2jrZGZISgIPvsv.png?aQjM')
    this.load.image('redEnemyMouthPartialOpenEyes1Wink', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/mouth%20partially%20open%20eyes%201%20with%20one%20blinking-CuKxjBkQYU77bxH1e6KMS5tIdsz17T.png?G49S')
    this.load.image('redEnemyMouthPartialOpenEyes2', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/mouth%20partially%20open%20eyes%202-A43kcb28mR0IQbtfIU0KJJqBswRrlD.png?QDz4')
    this.load.image('redEnemyMouthWideOpenEyes1Wink', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/mouth%20wide%20open%20eyes%201%20with%20one%20blinking-bYhh1tBYiobaJsDTFoTkLpbeTJY8vs.png?7MZ2')
    this.load.image('redEnemyMouthWideOpenEyes2', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/mouth%20wide%20open%20eyes%202-eeVDATMEgV6VQ9mPDfyEX1CFJPPr4W.png?RQBw')
    this.load.image('redEnemyMouthWideOpenEyes3', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/mouth%20wide%20open%20eyes%203-BYXzuHGU9Dd18kQEB6bztT5k8jFhJt.png?IzuG')
    
    // Load green enemy sprite
    this.load.image('greenEnemy', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/green%20test-0I8rDwYn5lbuPQTEUiYrg8ctBccIAC.png?IBFc')
    
    // Load stalker enemy animation sprites (6 sprites for natural eye movement and blinking)
    this.load.image('stalkerEnemyEye1', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/stalker%20enemy%20eye%201-Xt3Vtu2FiWWLT9l2wfeakBAqVSZet8.png?gS6O')
    this.load.image('stalkerEnemyEye2', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/stalker%20enemy%20eye%202-n2c58R6bdpzzPAVlVRgMZoKmngtTUo.png?nTFi')
    this.load.image('stalkerEnemyEye3', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/stalker%20enemy%20eye%203-K1hEnZ0oXDlCbLGCuJz1GD1YbYATZ6.png?safa')
    this.load.image('stalkerEnemyEye4', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/stalker%20enemy%20eye%204-Y0pnlUUMFdmHY7HxQk2gGe9Nr41glQ.png?cgFm')
    this.load.image('stalkerEnemyBlinking', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/stalker%20enemy%20eye%205%20blinking-CPlBOBjLFGic1DKAwXNjnMpyRwBVgr.png?vYe6')
    this.load.image('stalkerEnemyEyeOnly', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/stalker%20enemy%20eye%20only-3BuhEI2UePG6So3jAYE5NPnoQTsnc0.png?6wB1')
    
    // Load new player sprite collection
    this.load.image('playerIdleEye1', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/Idle%20eye%20position%201-aD6V48lNdWK5R1x5CPNs4XLX869cmI.png?0XJy')
    this.load.image('playerIdleEye2', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/Idle%20eye%20position%202-oQdxdPT1VWpTLUelgIRXIHXFw5jEuu.png?nGbT')
    this.load.image('playerIdleBlink', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/Idle%20eye%20position%20blinking-qmZlXgNwk3w2B610GpK1dkndEDFmEg.png?q97J')
    this.load.image('playerIdleEye3', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/idle%20eye%20position%203-TLisG1UJypI7PhiKszpBcC8Nx8ZyrS.png?6Tg9')
    this.load.image('playerIdleEye4', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/idle%20eye%20position%204-kvrv3THif8vcKjFB0NPzOeclqapVi6.png?PuWO')
    this.load.image('playerIdleEye5', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/idle%20eye%20position%205-1P13Nmi3xqoC5kWevrWUxutqyXfr99.png?F4D2')
    this.load.image('playerClimbLeftFoot', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/climbing%20ladder%20left%20foot%20up-HkXPep0kpt9he1WtndEXsXRVHQBdlq.png?ncVM')
    this.load.image('playerClimbRightFoot', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/climbing%20ladder%20right%20foot%20up-hkc4X4pm3mSs1J3UpRQwRw8GhealC6.png?t8RZ')
    this.load.image('playerJumpLeftFoot', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/jumping%20left%20foot%20forward-DVmoTTdCOBfI9FRTg9vs949sTzKoOB.png?9FM5')
    this.load.image('playerJumpRightFoot', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/jumping%20right%20foot%20forward-3clf2KnwfbN3O6BsrtaeHSTAviNbnF.png?xx8e')
    this.load.image('playerRunLeftFoot', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/running%20left%20foot%20forward%20new-aH3WiqHkbYLeW14yketC7EdmowlQ02.png?jLLJ')
    this.load.image('playerRunRightFoot', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/Running%20right%20foot%20forward%202-aGnWjaFUNnYXwTfNKfSCfCLppOHzDU.png?mXmE')
    
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
    this.currentFloor = 0
    this.highestFloorGenerated = 5
    
    // Use game registry to persist lives and coins across scene restarts
    // Check if we have stored values (level restart) or need to initialize (new game)
    const registry = this.game.registry
    
    // Check if this is a level progression (not a death/restart)
    const isLevelProgression = registry.has('levelProgression') && registry.get('levelProgression') === true
    
    if (isLevelProgression) {
      // Level progression - move current score to accumulated, start new level fresh
      this.accumulatedScore = registry.get('accumulatedScore') || 0
      this.score = 0 // Start new level with 0 current score
      this.lives = registry.get('playerLives')
      this.totalCoinsCollected = registry.get('totalCoins')
      // Clear the progression flag
      registry.set('levelProgression', false)
    } else if (registry.has('playerLives') && registry.get('playerLives') > 0) {
      // Restore from registry (level restart after losing life)
      this.lives = registry.get('playerLives')
      // Keep accumulated score from completed levels, reset only current level
      this.accumulatedScore = registry.get('accumulatedScore') || 0
      this.score = 0 // Reset current level score on death
      this.totalCoinsCollected = 0 // Reset crystals on death
      registry.set('totalCoins', 0)
    } else {
      // Initialize new game
      this.lives = 3
      this.score = 0
      this.accumulatedScore = 0
      this.totalCoinsCollected = 0
      registry.set('playerLives', this.lives)
      registry.set('totalCoins', this.totalCoinsCollected)
      registry.set('accumulatedScore', 0)
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
    
    // Create spikes group for environmental hazards
    this.spikes = this.physics.add.staticGroup()
    
    // Create cats group
    this.cats = this.physics.add.group({
      classType: Cat,
      runChildUpdate: true
    })
    
    // Create stalker cats group
    this.stalkerCats = this.physics.add.group({
      classType: StalkerCat,
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
    
    // Create temporary floor grid for positioning reference
    // this.createTemporaryFloorGrid()
    
    // Add some cats to test (pass floor layouts)
    console.log('🎮 ABOUT TO CALL createCats()...')
    this.createCats()
    console.log('🎮 createCats() call completed')
    
    // Add stalker cats
    this.createStalkerCats()
    
    // Add ceiling spikes
    this.createCeilingSpikes()
    
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
    
    // Cats collide with platforms and FLOOR spikes only (floor spikes act like platforms for enemies)
    this.physics.add.collider(this.cats, this.platforms)
    // Custom collision for spikes - only collide with floor spikes, not ceiling spikes
    this.physics.add.collider(
      this.cats, 
      this.spikes,
      undefined, // No callback needed
      (cat, spike) => {
        // Process callback - return true to collide, false to pass through
        const spikeObj = spike as Phaser.GameObjects.Rectangle
        const isFloorSpike = spikeObj.getData('isFloorSpike')
        // Only collide with floor spikes, pass through ceiling spikes
        return isFloorSpike === true
      },
      this
    )
    
    // Stalker cats collide with platforms and floor spikes (after dropping)
    this.physics.add.collider(this.stalkerCats, this.platforms)
    // Stalker cats also only collide with floor spikes, not ceiling spikes
    this.physics.add.collider(
      this.stalkerCats, 
      this.spikes,
      undefined,
      (cat, spike) => {
        const spikeObj = spike as Phaser.GameObjects.Rectangle
        const isFloorSpike = spikeObj.getData('isFloorSpike')
        return isFloorSpike === true
      },
      this
    )
    
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
    
    // Player vs stalker cat collision - check for jump-to-kill vs damage  
    this.physics.add.overlap(
      this.player,
      this.stalkerCats,
      this.handlePlayerStalkerCatInteraction,
      undefined,
      this
    )
    
    // Player vs spikes collision - lose life on contact
    this.physics.add.overlap(
      this.player,
      this.spikes,
      this.handlePlayerSpikeCollision,
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
    
    // Create dark purple HUD background bar across top
    const screenWidth = this.cameras.main.width
    const hudBg = this.add.graphics()
    hudBg.fillStyle(0x4a148c, 1.0)  // Dark purple color with full opacity
    hudBg.lineStyle(2, 0x7b1fa2, 1.0) // Slightly lighter purple border with full opacity
    
    // Single connected rectangle across the top
    hudBg.fillRoundedRect(8, 8, screenWidth - 16, 56, 12)  // Full width minus margins
    hudBg.strokeRoundedRect(8, 8, screenWidth - 16, 56, 12) // Add border stroke
    
    hudBg.setDepth(99)
    hudBg.setScrollFactor(0)
    
    // Add score display with purple theme styling
    this.scoreText = this.add.text(20, 20, 'SCORE: 0', {
      fontSize: '16px',
      color: '#ffd700',  // Gold color
      fontFamily: 'Arial Black',
      fontStyle: 'bold',
      stroke: '#4a148c',  // Dark purple stroke to match HUD
      strokeThickness: 1,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',  // Black drop shadow
        blur: 3,
        fill: true
      }
    }).setDepth(100)
    
    // Create combo text with purple theme (hidden initially)
    this.comboText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      '',
      {
        fontSize: '13px',
        color: '#ffd700',  // Gold color
        fontFamily: 'Arial Black',
        fontStyle: 'bold',
        stroke: '#4a148c',  // Dark purple stroke to match HUD theme
        strokeThickness: 2,
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: '#000000',  // Black drop shadow
          blur: 3,
          fill: true
        }
      }
    ).setOrigin(0.5).setDepth(200).setVisible(false)
    this.scoreText.setScrollFactor(0)
    this.comboText.setScrollFactor(0)
    
    // Add crystal counter display (left side, bottom)
    this.coinCounterText = this.add.text(20, 40, 'CRYSTALS: 0/150', {
      fontSize: '16px',
      color: '#40e0d0',  // Teal color for crystals
      fontFamily: 'Arial Black',
      fontStyle: 'bold',
      stroke: '#4a148c',  // Dark purple stroke to match HUD
      strokeThickness: 1,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',  // Black drop shadow
        blur: 3,
        fill: true
      }
    }).setDepth(100)
    this.coinCounterText.setScrollFactor(0)
    
    // Add lives display with hearts (right side, top, right-aligned)
    this.livesText = this.add.text(screenWidth - 20, 20, '❤️ x3', {
      fontSize: '16px',
      color: '#ff4444',  // Red color for hearts
      fontFamily: 'Arial Black',
      fontStyle: 'bold',
      stroke: '#4a148c',  // Dark purple stroke to match HUD
      strokeThickness: 1,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',  // Black drop shadow
        blur: 3,
        fill: true
      }
    }).setOrigin(1, 0).setDepth(100)  // Right-aligned with setOrigin(1, 0)
    this.livesText.setScrollFactor(0)
    
    // Add level counter (right side, bottom, right-aligned)
    const currentLevel = this.levelManager.getCurrentLevel()
    this.levelText = this.add.text(screenWidth - 20, 40, `LEVEL: ${currentLevel}`, {
      fontSize: '16px',
      color: '#ff88ff',
      fontFamily: 'Arial Black',
      fontStyle: 'bold',
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',  // Black drop shadow
        blur: 3,
        fill: true
      }
    }).setOrigin(1, 0).setDepth(100)  // Right-aligned with setOrigin(1, 0)
    this.levelText.setScrollFactor(0)
    
    // Initialize displays
    this.updateLivesDisplay()
    this.updateCoinCounterDisplay()
    this.updateScoreDisplay() // Show correct total score from the start
    
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
          
          // Add spikes to all gaps in initial floor creation too
          console.log(`🔱 Initial floor ${floor}: Creating spikes: gapStart=${gapStart}, gapSize=${gapSize}, floorY=${y}`)
          this.createSpikesInGap(gapStart, gapSize, y, tileSize)
          
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
      
      // Find valid ladder positions that have solid ground on both floors and avoid door conflicts
      const validPositions: number[] = []
      
      for (let x = 1; x < floorWidth - 1; x++) {
        const hasBottomPlatform = this.hasPlatformAt(currentFloor, x)
        const hasTopPlatform = this.hasPlatformAt(nextFloor, x)
        
        // Check for door conflicts on both floors (ladders need clearance from doors)
        const hasBottomDoorConflict = this.hasDoorAt(x, floor)
        const hasTopDoorConflict = this.hasDoorAt(x, floor + 1)
        
        if (hasBottomPlatform && hasTopPlatform && !hasBottomDoorConflict && !hasTopDoorConflict) {
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
    
    // Add physics body to platform and make it immovable
    this.physics.add.existing(platform, true) // true = static body
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
    
    // Use new teal ladder sprite
    if (this.textures.exists('tealLadder')) {
      const ladderX = x + tileSize/2
      const totalHeight = ladderHeight + tileSize * 1.0 // Include extension height
      const centerY = (topY + bottomY) / 2 - tileSize * 0.5 + 3 // Adjust center for extension, move down 3px
      
      // Create ladder sprite
      const ladderSprite = this.add.image(ladderX, centerY, 'tealLadder')
      // Scale to proper height while maintaining aspect ratio
      ladderSprite.setDisplaySize(ladderSprite.width * (totalHeight / ladderSprite.height), totalHeight)
      ladderSprite.setDepth(11)
    } else {
      // Fallback to simple graphics ladder
      const ladderGraphics = this.add.graphics()
      const ladderX = x + tileSize/2
      
      ladderGraphics.fillStyle(0x40e0d0, 1) // Teal color
      ladderGraphics.fillRect(ladderX - 2, topY - tileSize * 0.5, 4, ladderHeight + tileSize * 1.0)
      ladderGraphics.fillRect(ladderX - 13, topY, 26, 4) // Top rung
      ladderGraphics.fillRect(ladderX - 13, bottomY - 4, 26, 4) // Bottom rung
      
      // Middle rungs
      const numRungs = Math.floor(ladderHeight / 32)
      for (let i = 1; i < numRungs; i++) {
        const rungY = topY + (i * (ladderHeight / (numRungs + 1)))
        ladderGraphics.fillRect(ladderX - 13, rungY, 26, 3)
      }
      
      ladderGraphics.setDepth(11)
    }
  }

  private createSpikesInGap(gapStart: number, gapSize: number, floorY: number, tileSize: number): void {
    console.log(`🔱 createSpikesInGap called: creating ${gapSize} spike tiles`)
    // Create pink spikes in each tile of the gap
    for (let x = gapStart; x < gapStart + gapSize; x++) {
      const spikeX = x * tileSize + tileSize/2
      const spikeY = floorY // Position at floor level
      
      console.log(`🔱 Creating spike at tile ${x}: position (${spikeX}, ${spikeY})`)
      this.createSpikeGraphics(spikeX, spikeY, tileSize)
    }
  }
  
  private createSpikeGraphics(x: number, y: number, tileSize: number): void {
    const spikeHeight = tileSize // Full tile height (32px)
    const spikesPerTile = 3 // 3 spikes per tile, side by side
    const spikeWidth = tileSize / spikesPerTile // Width per spike
    
    // Position spikes at the bottom edge of platforms (align with green line), moved up 1px
    const spikeBaseY = y + tileSize/2 - 1 // Move to bottom of platform tiles, 1px higher
    
    console.log(`🔱 createSpikeGraphics: x=${x}, y=${y}, spikeBaseY=${spikeBaseY}, spikeHeight=${spikeHeight}, spikesPerTile=${spikesPerTile}`)
    
    // Create graphics object for spikes
    const spikesGraphics = this.add.graphics()
    
    // First draw drop shadows for all spikes (like floor tiles)
    spikesGraphics.fillStyle(0x000000, 0.3) // Black shadow with 30% opacity
    for (let i = 0; i < spikesPerTile; i++) {
      const offsetX = (i - (spikesPerTile - 1) / 2) * spikeWidth
      const spikeX = x + offsetX
      
      // Create shadow triangle slightly offset down and right
      const shadowOffsetX = 3
      const shadowOffsetY = 3
      
      spikesGraphics.beginPath()
      spikesGraphics.moveTo(spikeX - spikeWidth/2 + shadowOffsetX, spikeBaseY + shadowOffsetY) // Bottom left
      spikesGraphics.lineTo(spikeX + spikeWidth/2 + shadowOffsetX, spikeBaseY + shadowOffsetY) // Bottom right  
      spikesGraphics.lineTo(spikeX + shadowOffsetX, spikeBaseY - spikeHeight + shadowOffsetY) // Top point
      spikesGraphics.closePath()
      spikesGraphics.fillPath()
    }
    
    // Now draw the actual spikes on top
    spikesGraphics.fillStyle(0xff1493, 1) // Deep pink color
    
    // Create 3 triangular spikes per tile, side by side
    for (let i = 0; i < spikesPerTile; i++) {
      const offsetX = (i - (spikesPerTile - 1) / 2) * spikeWidth
      const spikeX = x + offsetX
      
      console.log(`🔱 Creating triangular spike ${i}: offsetX=${offsetX}, spikeX=${spikeX}`)
      
      // Create triangular spike pointing upward
      spikesGraphics.beginPath()
      spikesGraphics.moveTo(spikeX - spikeWidth/2, spikeBaseY) // Bottom left
      spikesGraphics.lineTo(spikeX + spikeWidth/2, spikeBaseY) // Bottom right  
      spikesGraphics.lineTo(spikeX, spikeBaseY - spikeHeight) // Top point
      spikesGraphics.closePath()
      spikesGraphics.fillPath()
      
      // Add gem-style outline for consistency
      spikesGraphics.lineStyle(1, 0xffffff, 0.8)
      spikesGraphics.beginPath()
      spikesGraphics.moveTo(spikeX - spikeWidth/2, spikeBaseY) // Bottom left
      spikesGraphics.lineTo(spikeX + spikeWidth/2, spikeBaseY) // Bottom right  
      spikesGraphics.lineTo(spikeX, spikeBaseY - spikeHeight) // Top point
      spikesGraphics.closePath()
      spikesGraphics.strokePath()
    }
    
    spikesGraphics.setDepth(12) // Above platforms but below player
    console.log(`🔱 Graphics created with depth 12, ${spikesPerTile} triangular spikes`)
    
    // Create physics body for collision detection - same height as floor tiles for enemy movement
    // Visual spikes still look the same, but collision body extends to floor level
    const fullTileHeight = tileSize
    const spikeCollisionY = y // Same Y as platform tiles
    const spikeBody = this.add.rectangle(x, spikeCollisionY, tileSize * 0.9, fullTileHeight, 0x000000, 0)
    spikeBody.setVisible(false) // Invisible collision box
    
    // Store spike data for different collision behaviors
    spikeBody.setData('isFloorSpike', true)
    spikeBody.setData('visualSpikeHeight', spikeHeight) // Store visual spike height for player damage
    spikeBody.setData('visualSpikeBaseY', spikeBaseY) // Store visual spike base Y
    
    this.spikes.add(spikeBody)
    console.log(`🔱 Physics body added: full tile height (${fullTileHeight}px) at platform level for enemy collision`)
    console.log(`🔱 Visual spikes: height ${spikeHeight}px at ${spikeBaseY} for player damage`)
  }

  private createCeilingSpikes(): void {
    const tileSize = GameSettings.game.tileSize
    const floorSpacing = tileSize * 5
    const levelConfig = this.levelManager.getLevelConfig(this.levelManager.getCurrentLevel())
    
    // Only spawn ceiling spikes on level 1 for testing, later only on higher levels
    const minFloorForCeilingSpikes = 1 // Will change to higher number later
    
    // Iterate through floors to randomly place ceiling spikes
    for (let floor = minFloorForCeilingSpikes; floor < this.floorLayouts.length - 1; floor++) {
      const layout = this.floorLayouts[floor]
      
      // 30% chance of ceiling spikes on this floor
      if (Math.random() > 0.3) continue
      
      // Calculate ceiling position (just below the floor above)
      const ceilingY = GameSettings.canvas.height - tileSize/2 - ((floor + 1) * floorSpacing) + tileSize
      
      // Find valid positions (avoiding ladders, door, collectibles, and gaps)
      const validPositions: number[] = []
      
      // Get ladder positions for this floor
      const ladderPositions = this.getLadderPositionsForFloor(floor)
      
      // Build list of valid positions
      for (let x = 2; x < GameSettings.game.floorWidth - 2; x++) {
        // Skip if over a gap or within 1-tile buffer zone
        if (layout.gapStart !== -1 && x >= layout.gapStart - 1 && x < layout.gapStart + layout.gapSize + 1) {
          continue
        }
        
        // Skip if near a ladder (within 3 tiles for safety)
        let nearLadder = false
        for (const ladderX of ladderPositions) {
          if (Math.abs(x - ladderX) < 3) {
            nearLadder = true
            break
          }
        }
        if (nearLadder) continue
        
        // Skip if near door (on door floor)
        if (floor === this.floorLayouts.length - 2) {
          const doorX = Math.floor(GameSettings.game.floorWidth / 2)
          if (Math.abs(x - doorX) < 3) continue
        }
        
        validPositions.push(x)
      }
      
      // Place 1-3 ceiling spike clusters randomly
      const numSpikeClusters = Math.floor(Math.random() * 3) + 1
      
      for (let i = 0; i < Math.min(numSpikeClusters, validPositions.length / 3); i++) {
        if (validPositions.length === 0) break
        
        const randomIndex = Math.floor(Math.random() * validPositions.length)
        const spikeX = validPositions[randomIndex]
        
        // Create a cluster of 2-3 tiles of ceiling spikes
        const clusterSize = Math.floor(Math.random() * 2) + 2
        
        for (let j = 0; j < clusterSize; j++) {
          const tileX = spikeX + j
          if (tileX >= GameSettings.game.floorWidth - 2) break
          
          // Remove used positions
          const idx = validPositions.indexOf(tileX)
          if (idx > -1) validPositions.splice(idx, 1)
          
          console.log(`🔱⬇️ Creating ceiling spike at floor ${floor}, tile X=${tileX}`)
          this.createCeilingSpikeGraphics(tileX * tileSize + tileSize/2, ceilingY, tileSize)
        }
      }
    }
  }

  private createCeilingSpikeGraphics(x: number, y: number, tileSize: number): void {
    const spikeHeight = tileSize * 0.5 // 50% of tile height
    const spikesPerTile = 3 // 3 spikes per tile, matching floor spikes
    const spikeWidth = tileSize / spikesPerTile
    
    // Position spikes hanging from ceiling
    const spikeBaseY = y - tileSize/2 + 1 // Attach to ceiling
    
    // Create graphics object for ceiling spikes (yellow color)
    const spikesGraphics = this.add.graphics()
    spikesGraphics.fillStyle(0xffff00, 1) // Yellow color for ceiling spikes
    spikesGraphics.lineStyle(2, 0xffd700, 1) // Golden outline
    
    // Create triangular spikes pointing downward
    for (let i = 0; i < spikesPerTile; i++) {
      const spikeX = x - tileSize/2 + (i * spikeWidth) + spikeWidth/2
      
      // Draw inverted triangle (pointing down)
      spikesGraphics.beginPath()
      spikesGraphics.moveTo(spikeX - spikeWidth/3, spikeBaseY) // Top left
      spikesGraphics.lineTo(spikeX + spikeWidth/3, spikeBaseY) // Top right
      spikesGraphics.lineTo(spikeX, spikeBaseY + spikeHeight) // Bottom point
      spikesGraphics.closePath()
      spikesGraphics.fillPath()
      spikesGraphics.strokePath()
    }
    
    spikesGraphics.setDepth(12) // Same depth as floor spikes
    
    // Create physics body for collision detection
    const spikeBody = this.add.rectangle(x, spikeBaseY + spikeHeight/2, tileSize * 0.9, spikeHeight, 0x000000, 0)
    spikeBody.setVisible(false) // Invisible collision box
    spikeBody.setData('isCeilingSpike', true) // Mark as ceiling spike
    spikeBody.setData('graphics', spikesGraphics) // Store graphics reference for shaking
    spikeBody.setData('x', x) // Store position for dropping later
    spikeBody.setData('y', spikeBaseY)
    
    this.physics.add.existing(spikeBody, true) // Static body
    this.spikes.add(spikeBody)
  }

  private getLadderPositionsForFloor(floor: number): number[] {
    // Get ladder positions from stored ladder data
    const positions: number[] = []
    const tileSize = GameSettings.game.tileSize
    const floorSpacing = tileSize * 5
    
    this.ladders.children.entries.forEach(ladder => {
      const ladderObj = ladder as Phaser.GameObjects.Rectangle
      // Calculate which floor this ladder connects
      // Ladder bottom Y position
      const ladderBottomY = ladderObj.y + ladderObj.height/2
      // Convert to floor number (0 = ground floor)
      const ladderFloor = Math.floor((GameSettings.canvas.height - ladderBottomY) / floorSpacing)
      
      // Ladders connect floor to floor+1, so check both
      if (ladderFloor === floor || ladderFloor === floor - 1 || ladderFloor === floor + 1) {
        const ladderTileX = Math.floor(ladderObj.x / tileSize)
        positions.push(ladderTileX)
        console.log(`🪜 Floor ${floor}: Found ladder at tile X=${ladderTileX}, ladder Y=${ladderObj.y}`)
      }
    })
    
    console.log(`🪜 Floor ${floor}: Total ladder positions: ${positions.join(', ')}`)
    return positions
  }

  private createCats(): void {
    const tileSize = GameSettings.game.tileSize
    const floorSpacing = tileSize * 5
    const floorWidth = GameSettings.game.floorWidth
    
    // Get allowed enemy types for current level
    const levelConfig = this.levelManager.getLevelConfig(this.levelManager.getCurrentLevel())
    const allowedEnemies = levelConfig.enemyTypes
    console.log(`🐱 Level ${this.levelManager.getCurrentLevel()}: ${allowedEnemies.join(', ')}`)
    
    // Map enemy types to cat colors
    const availableColors: string[] = []
    if (allowedEnemies.includes('blue')) availableColors.push('blue')
    if (allowedEnemies.includes('yellow')) availableColors.push('yellow')
    if (allowedEnemies.includes('green')) availableColors.push('green')
    if (allowedEnemies.includes('red')) availableColors.push('red') // ADD RED SUPPORT
    console.log(`🐱 Available: ${availableColors.join(', ')}`)
    
    // If no regular enemies are allowed yet, return
    if (availableColors.length === 0) {
      return
    }
    
    // Add cats on floors 1 through second-to-last floor (skip ground floor and door floor)
    const doorFloor = levelConfig.isEndless ? 999 : (levelConfig.floorCount - 1)
    const maxEnemyFloor = levelConfig.isEndless ? Math.min(20, this.floorLayouts.length - 1) : doorFloor - 1
    
    let enemiesCreated = 0
    for (let floor = 2; floor <= maxEnemyFloor && floor < this.floorLayouts.length; floor++) {
      const layout = this.floorLayouts[floor]
      // Calculate Y position - cats should sit ON the platform, not IN it
      // Platform is at: GameSettings.canvas.height - tileSize/2 - (floor * floorSpacing)
      const platformY = GameSettings.canvas.height - tileSize/2 - (floor * floorSpacing)
      
      // Position enemy ON TOP of floor tiles, like the player
      const floorSurfaceY = platformY - tileSize/2  // Top surface of platform tiles
      const y = floorSurfaceY - 15     // Position enemy standing on top (hitbox bottom above surface)
      
      console.log(`🟢 FLOOR ${floor} POSITIONING: platformY=${platformY}, floorSurfaceY=${floorSurfaceY}, enemyY=${y}`)
      
      if (layout.gapStart === -1) {
        // Complete floor - place cats based on level
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
            console.log(`🐱 INITIAL SPAWN: ${randomColor} enemy on floor ${floor} (complete floor)`)
            
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
                tileSize * 0.5,  // Full floor left bound
                tileSize * (floorWidth - 0.5),  // Full floor right bound
                randomColor as any
              )
              
              // All enemies now use full floor bounds since spikes act as platforms
              // No need to override for green cats anymore
              
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
                tileSize * 0.5,  // Full floor left bound
                tileSize * (floorWidth - 0.5),  // Full floor right bound
                randomColor as any
              )
              
              // All enemies now use full floor bounds since spikes act as platforms
              // No need to override for green cats anymore
              
              this.cats.add(cat)
            }
          }
        }
      }
    }
    
    console.log(`🐱 CREATE CATS COMPLETE: Created ${enemiesCreated} enemies total`)
  }
  
  private createTemporaryFloorGrid(): void {
    console.log('📐 CREATING TEMPORARY FLOOR GRID...')
    const tileSize = GameSettings.game.tileSize
    const floorSpacing = tileSize * 5
    const canvasWidth = GameSettings.canvas.width
    
    // Create graphics object for drawing grid lines
    const gridGraphics = this.add.graphics()
    gridGraphics.lineStyle(2, 0x00ff00, 0.7) // Green lines, 70% opacity
    gridGraphics.setDepth(100) // On top of everything
    
    // Draw horizontal lines for each floor - align with TOP surface of platform tiles
    for (let floor = 0; floor < this.floorLayouts.length; floor++) {
      // Calculate platform center Y, then move up to top surface
      const platformCenterY = GameSettings.canvas.height - tileSize/2 - (floor * floorSpacing)
      const topSurfaceY = platformCenterY - tileSize/2 // Move up by half tile height to get top surface
      
      // Draw full-width horizontal line on top surface of platform tiles
      gridGraphics.moveTo(0, topSurfaceY)
      gridGraphics.lineTo(canvasWidth, topSurfaceY)
      
      // Add floor number label with top surface Y coordinate
      const floorText = this.add.text(10, topSurfaceY - 20, `Floor ${floor} (Top:${Math.round(topSurfaceY)})`, {
        fontSize: '12px',
        color: '#00ff00',
        backgroundColor: '#000000aa',
        padding: { x: 4, y: 2 }
      })
      floorText.setDepth(101)
      
      console.log(`📐 Floor ${floor} line drawn at Y: ${topSurfaceY} (platform top surface)`)
    }
    
    // Draw the stroke to make lines visible
    gridGraphics.strokePath()
    
    console.log(`📐 Grid complete - ${this.floorLayouts.length} floor lines drawn`)
  }
  
  private createStalkerCats(): void {
    // Check if red enemies should spawn based on current level
    const levelConfig = this.levelManager.getLevelConfig(this.levelManager.getCurrentLevel())
    if (!levelConfig.enemyTypes.includes('red')) {
      // Red enemies not unlocked yet
      return
    }
    
    const tileSize = GameSettings.game.tileSize
    const floorSpacing = tileSize * 5
    const floorWidth = GameSettings.game.floorWidth
    
    // Add stalker cats starting from floor 2, up to second-to-last floor (avoid door floor)
    const doorFloor = levelConfig.isEndless ? 999 : (levelConfig.floorCount - 1)
    const maxStalkerCatFloor = levelConfig.isEndless ? Math.min(25, this.floorLayouts.length - 1) : doorFloor - 1
    
    for (let floor = 2; floor <= maxStalkerCatFloor && floor < this.floorLayouts.length; floor++) {
      const layout = this.floorLayouts[floor]
      
      // Calculate floor position for stalker cats (on the floor, not ceiling)
      // Place stalker cats directly on the current floor
      const floorY = GameSettings.canvas.height - tileSize/2 - (floor * floorSpacing)
      const floorSurfaceY = floorY - tileSize/2  // Top surface of platform tiles
      const stalkerY = floorSurfaceY - 15        // Same as regular cats - standing on floor
      
      // Determine number of stalker cats (0-1 for now, will scale later)
      const maxStalkerCats = floor < 20 ? 1 : 2
      const numStalkerCats = Math.random() < 0.6 ? Math.floor(Math.random() * maxStalkerCats) + 1 : 0
      
      if (numStalkerCats === 0) continue
      
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
      
      // Place stalker cats at random valid positions
      for (let i = 0; i < Math.min(numStalkerCats, validPositions.length); i++) {
        const randomIndex = Math.floor(Math.random() * validPositions.length)
        const tileX = validPositions[randomIndex]
        const stalkerCatX = tileX * tileSize + tileSize/2
        
        // Remove position to avoid overlapping stalker cats
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
        
        const stalkerCat = new StalkerCat(
          this,
          stalkerCatX,
          stalkerY,
          leftBound,
          rightBound
        )
        
        // Set player reference for detection
        stalkerCat.setPlayerReference(this.player)
        
        this.stalkerCats.add(stalkerCat)
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
    
    // Add small separation to prevent sticking
    const separationForce = 10
    if (catObj1.x < catObj2.x) {
      // cat1 is on the left, push apart
      catObj1.setX(catObj1.x - separationForce)
      catObj2.setX(catObj2.x + separationForce)
    } else {
      // cat2 is on the left, push apart
      catObj2.setX(catObj2.x - separationForce)
      catObj1.setX(catObj1.x + separationForce)
    }
    
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
  
  private handlePlayerStalkerCatInteraction(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    cat: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ): void {
    if (this.isGameOver || this.justKilledCat) return
    
    const playerObj = player as Player
    const stalkerCatObj = cat as StalkerCat
    
    // Check if this stalker cat can damage the player
    if (!stalkerCatObj.canDamagePlayer()) {
      // This stalker cat can't damage player right now
      return
    }
    
    // Check if player is falling down onto the cat (jump-to-kill)
    const playerBody = playerObj.body as Phaser.Physics.Arcade.Body
    const catBody = stalkerCatObj.body as Phaser.Physics.Arcade.Body
    
    const playerFalling = playerBody.velocity.y > 0 // Moving downward
    const playerAboveCat = playerBody.bottom <= catBody.top + 15 // Player's bottom is near cat's top (increased tolerance)
    
    if (playerFalling && playerAboveCat) {
      // Jump-to-kill stalker cat (only when chasing)
      this.justKilledCat = true
      this.handleStalkerCatKill(playerObj, stalkerCatObj)
      
      // Reset flag after a short delay to allow for physics processing
      this.time.delayedCall(100, () => {
        this.justKilledCat = false
      })
    } else if (!this.justKilledCat) {
      // Regular collision - damage player (only if we didn't just kill)
      this.handlePlayerDamage(playerObj, stalkerCatObj)
    }
  }
  
  private handlePlayerSpikeCollision(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    spike: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ): void {
    if (this.isGameOver) return
    
    const playerObj = player as Player
    const playerBody = playerObj.body as Phaser.Physics.Arcade.Body
    const spikeObj = spike as Phaser.GameObjects.Rectangle
    
    // Check if this is a ceiling spike
    const isCeilingSpike = spikeObj.getData('isCeilingSpike')
    
    if (isCeilingSpike) {
      // Ceiling spikes damage when:
      // 1. Player jumps up into them (negative Y velocity)
      // 2. TODO: They drop onto player (will implement dropping later)
      if (playerBody.velocity.y < -50) { // Jumping up into ceiling spikes
        console.log(`🔱 Player jumped into ceiling spikes! Velocity Y: ${playerBody.velocity.y}`)
        
        // Add shaking animation before damage
        const graphics = spikeObj.getData('graphics') as Phaser.GameObjects.Graphics
        if (graphics) {
          // Shake the spikes
          this.tweens.add({
            targets: graphics,
            x: graphics.x + 2,
            duration: 50,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
              graphics.x = spikeObj.getData('x') - GameSettings.game.tileSize/2
            }
          })
        }
        
        this.handlePlayerDamage(playerObj)
      }
    } else {
      // Floor spikes - check if player is in the dangerous visual spike area
      const isFloorSpike = spikeObj.getData('isFloorSpike')
      
      if (isFloorSpike) {
        const visualSpikeHeight = spikeObj.getData('visualSpikeHeight')
        const visualSpikeBaseY = spikeObj.getData('visualSpikeBaseY')
        
        // With full-height spikes, damage when player lands on them while falling
        // Since spikes are now full tile height, we can use simpler collision detection
        if (playerBody.velocity.y > 50) { // Falling down onto spikes
          console.log(`🔱 Player fell onto floor spikes! Velocity Y: ${playerBody.velocity.y}`)
          this.handlePlayerDamage(playerObj)
        } else {
          console.log(`🔱 Player touched floor spikes but not falling fast enough (Y velocity: ${playerBody.velocity.y}) - no damage`)
        }
      } else {
        // Legacy floor spike behavior (if any old spikes don't have the new data)
        if (playerBody.velocity.y > 50) { // Must be falling with some speed
          console.log(`🔱 Player fell onto legacy floor spikes! Velocity Y: ${playerBody.velocity.y}`)
          this.handlePlayerDamage(playerObj)
        } else {
          console.log(`🔱 Player touched legacy floor spikes but not falling (Y velocity: ${playerBody.velocity.y}) - no damage`)
        }
      }
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
  
  private handleStalkerCatKill(player: Player, stalkerCat: StalkerCat): void {
    // Check if stalker cat is already squished to prevent multiple kills
    if ((stalkerCat as any).isSquished) return
    
    // Don't allow combo while climbing ladders
    if (player.getIsClimbing()) {
      // Just award base points without combo
      const basePoints = 200
      this.score += basePoints
      this.updateScoreDisplay()
      
      // Make player bounce up (slightly less than normal jump)
      player.setVelocityY(GameSettings.game.jumpVelocity * 0.7)
      
      // Squish the stalker cat
      stalkerCat.squish()
      
      // Show point popup at cat position
      this.showPointPopup(stalkerCat.x, stalkerCat.y - 20, basePoints)
      
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
    
    // Squish the stalker cat
    stalkerCat.squish()
    
    // Show point popup at cat position
    this.showPointPopup(stalkerCat.x, stalkerCat.y - 20, points)
    
  }
  
  private updateScoreDisplay(): void {
    // Show total score = accumulated from completed levels + current level score
    const totalScore = this.accumulatedScore + this.score
    this.scoreText.setText(`SCORE: ${totalScore}`)
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
    
    // Update all stalker cats and check ladder exits
    this.stalkerCats.children.entries.forEach(stalkerCat => {
      const catObj = stalkerCat as StalkerCat
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
      const y = GameSettings.canvas.height - tileSize/2 - (floor * floorSpacing)
      
      // Create floor with random gap
      const hasGap = Math.random() > 0.3
      let layout: { gapStart: number, gapSize: number }
      
      console.log(`🏗️ Floor ${floor}: hasGap=${hasGap}`)
      
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
        
        // Add spikes to all gaps
        console.log(`🔱 Creating spikes: gapStart=${gapStart}, gapSize=${gapSize}, floorY=${y}`)
        this.createSpikesInGap(gapStart, gapSize, y, tileSize)
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
      if (allowedEnemies.includes('red')) availableColors.push('red') // ADD RED SUPPORT
      
      // Add regular cat on some floors (if any colors are available) - NEVER on floor 0 or 1
      if (availableColors.length > 0 && floor > 1 && Math.random() > 0.5) {
        const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)]
        console.log(`🐱 SPAWNING: ${randomColor} enemy on floor ${floor} (from colors: ${availableColors.join(', ')})`)
        
        if (layout.gapStart === -1) {
          // Complete floor
          // Position enemy ON TOP of floor tiles, like the player
          const floorSurfaceY = y - tileSize/2  // Top surface of platform tiles
          const enemyY = floorSurfaceY - 15     // Position enemy standing on top (hitbox bottom above surface)
          console.log(`Spawning enemy on complete floor - floor surface Y: ${floorSurfaceY}, enemy Y: ${enemyY} (standing on tiles)`)
          const cat = new Cat(
            this,
            (floorWidth / 2) * tileSize,
            enemyY, // Position enemy standing on top of tiles
            tileSize * 1.5,
            tileSize * (floorWidth - 1.5),
            randomColor as any
          )
          // Green cats already get full floor bounds by default
          this.cats.add(cat)
          enemiesCreated++
        } else if (layout.gapStart > 3) {
          // Place on left section if big enough
          // Position enemy ON TOP of floor tiles, like the player
          const floorSurfaceY = y - tileSize/2  // Top surface of platform tiles
          const enemyY = floorSurfaceY - 15     // Position enemy standing on top (hitbox bottom above surface)
          console.log(`Spawning enemy on left section - floor surface Y: ${floorSurfaceY}, enemy Y: ${enemyY} (standing on tiles)`)
          const cat = new Cat(
            this,
            (layout.gapStart / 2) * tileSize,
            enemyY, // Position enemy standing on top of tiles
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
          enemiesCreated++
        }
      }
      
      // Add stalker cats to some floors (only if red enemies are allowed)
      if (allowedEnemies.includes('red') && floor > 2 && Math.random() > 0.4) { // 60% chance
        const maxStalkerCats = floor < 20 ? 1 : 2
        const numStalkerCats = Math.floor(Math.random() * maxStalkerCats) + 1
        
        // Find valid ceiling positions
        const validStalkerPositions: number[] = []
        
        if (layout.gapStart === -1) {
          // Complete floor
          for (let x = 2; x < floorWidth - 2; x++) {
            validStalkerPositions.push(x)
          }
        } else {
          // Floor with gap
          for (let x = 2; x < layout.gapStart - 1; x++) {
            validStalkerPositions.push(x)
          }
          for (let x = layout.gapStart + layout.gapSize + 1; x < floorWidth - 2; x++) {
            validStalkerPositions.push(x)
          }
        }
        
        // Place stalker cats
        for (let j = 0; j < Math.min(numStalkerCats, validStalkerPositions.length); j++) {
          const randomIndex = Math.floor(Math.random() * validStalkerPositions.length)
          const tileX = validStalkerPositions[randomIndex]
          const stalkerCatX = tileX * tileSize + tileSize/2
          
          // Calculate floor Y position for stalker cats (on the floor, not ceiling)
          const currentFloorY = -floor * floorSpacing + GameSettings.canvas.height - tileSize/2
          const stalkerY = currentFloorY - 16 // Just above the floor platform
          
          validStalkerPositions.splice(randomIndex, 1)
          
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
          
          const stalkerCat = new StalkerCat(
            this,
            stalkerCatX,
            stalkerY,
            leftBound,
            rightBound
          )
          
          stalkerCat.setPlayerReference(this.player)
          this.stalkerCats.add(stalkerCat)
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
    const ladderX = tileSize/2 // Position ladder on the farthest left tile (tile 0)
    const floorY = GameSettings.canvas.height - tileSize/2
    
    console.log('🪜 ENTRANCE LADDER SETUP')
    console.log(`   Tile size: ${tileSize}`)
    console.log(`   Floor Y position: ${floorY}`)
    console.log(`   Target Y position: ${targetY}`)
    console.log(`   Ladder X position: ${ladderX}`)
    
    // Create entrance ladder using new teal ladder sprite
    const ladderTop = targetY - 60 // Extends above player position
    const ladderBottom = GameSettings.canvas.height + 100 // Below screen
    const ladderHeight = ladderBottom - ladderTop
    const ladderCenterY = (ladderTop + ladderBottom) / 2 + 52
    
    let entranceLadder: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics
    
    if (this.textures.exists('tealLadder')) {
      // Use new teal ladder sprite
      entranceLadder = this.add.image(ladderX, ladderCenterY, 'tealLadder')
      entranceLadder.setDisplaySize(entranceLadder.width * (ladderHeight / entranceLadder.height), ladderHeight)
      entranceLadder.setDepth(5)
    } else {
      // Fallback to graphics ladder
      entranceLadder = this.add.graphics()
      entranceLadder.fillStyle(0x40e0d0, 1) // Teal color to match game theme
      entranceLadder.fillRect(ladderX - 2, ladderTop, 4, ladderHeight) // Center rail
      entranceLadder.fillRect(ladderX - 13, ladderTop, 26, 4) // Top rung
      entranceLadder.fillRect(ladderX - 13, ladderBottom - 4, 26, 4) // Bottom rung
      
      // Middle rungs
      const numRungs = Math.floor(ladderHeight / 32)
      for (let i = 1; i < numRungs; i++) {
        const rungY = ladderTop + (i * (ladderHeight / (numRungs + 1)))
        entranceLadder.fillRect(ladderX - 13, rungY, 26, 3)
      }
      
      entranceLadder.setDepth(5)
    }
    
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
      `Score: ${this.accumulatedScore + this.score}\nFloors Climbed: ${this.currentFloor}`,
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
      // Save accumulated score and crystals before progressing
      const registry = this.game.registry
      registry.set('levelProgression', true)
      // Add current level score to accumulated score
      registry.set('accumulatedScore', this.accumulatedScore + this.score)
      registry.set('totalCoins', this.totalCoinsCollected)
      
      // Advance to next level
      this.levelManager.nextLevel()
      
      // Restart scene with new level
      this.scene.restart()
    })
  }

  private updateCoinCounterDisplay(): void {
    const crystalsTowardNext = this.totalCoinsCollected % this.COINS_PER_EXTRA_LIFE
    this.coinCounterText.setText(`CRYSTALS: ${crystalsTowardNext}/${this.COINS_PER_EXTRA_LIFE}`)
  }

  private updateLivesDisplay(): void {
    // Show hearts for lives (max 9 to fit on screen)  
    const livesToShow = Math.min(this.lives, 9)
    const livesText = livesToShow > 0 ? `❤️ x${livesToShow}` : 'GAME OVER'
    this.livesText.setText(livesText)
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
      `Final Score: ${this.accumulatedScore + this.score}`,
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