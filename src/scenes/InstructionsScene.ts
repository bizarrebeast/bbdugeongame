import GameSettings from "../config/GameSettings"

interface InstructionItem {
  sprite: string
  title: string
  description: string
  spriteSize: { width: number, height: number }
}

export class InstructionsScene extends Phaser.Scene {
  private bgImage!: Phaser.GameObjects.Image
  private scrollContainer!: Phaser.GameObjects.Container
  private maskGraphics!: Phaser.GameObjects.Graphics
  private skipButton!: Phaser.GameObjects.Container
  private scrollIndicator!: Phaser.GameObjects.Container
  private titleText!: Phaser.GameObjects.Text
  
  // Scrolling state
  private scrollY: number = 0
  private maxScrollY: number = 0
  private contentHeight: number = 0
  private isDragging: boolean = false
  private dragStartY: number = 0
  private scrollStartY: number = 0

  private fromMenu: boolean = false
  private reopenMenu: boolean = false
  
  constructor() {
    super({ key: 'InstructionsScene' })
  }

  init(data?: any): void {
    // Check if we came from the menu
    this.fromMenu = data?.fromMenu || false
    this.reopenMenu = data?.reopenMenu || false
  }

  preload(): void {
    // Load background image
    this.load.image('instructionsBg', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/Treasure%20Quest%20BG%205-pVHhUmXIAvnZT4aFVRFgYvljKibVS0.png?qco1')
    
    // Load game sprites for visual references
    this.loadGameSprites()
  }

  private loadGameSprites(): void {
    // Player sprites
    this.load.image('playerIdleEye1', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/Idle%20eye%20position%201-aD6V48lNdWK5R1x5CPNs4XLX869cmI.png?0XJy')
    this.load.image('playerJumpRightFoot', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/jumping%20right%20foot%20forward-3clf2KnwfbN3O6BsrtaeHSTAviNbnF.png?xx8e')
    this.load.image('playerClimbInstructions', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/climbing%20instructions%20sprite-1DYkU3H7zBfBhzSDEkjgUSCrDXYBRW.png?v0Zt')
    // Player throwing sprites
    this.load.image('playerThrowingGem', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/running%20body%20eyes%20throwing%20gem-7trW3lxLa5cH2ASj5SX3nkwO6dDh6z.png?uNG0')
    this.load.image('playerBothFeetDown', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/both%20feet%20down-Df4cKPxtG04wJmnzY3QzaUeW22F1BN.png?Iekl')
    
    // Collectibles
    this.load.image('crystal-hud-icon', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/crystal%20hud%20icon-6cCEP7jp90eqI7W9LeBp7v4s3OgCPX.png?nMJm')
    this.load.image('blueCoin', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/big%20blue%20gem-GzKKZKUsDMh3CXMEIV4OmMl4ksrqqm.png?sill')
    this.load.image('diamond', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/diamond-LB22Ijoji8erIrMFMvtSwd5Y9rDDwS.png?LlEv')
    this.load.image('crystalBallCollectible', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/crystal%20ball%20collectible-BYMW8D53PB5JZUqKCfjKdI59qi0Yk8.png?rzg5')
    this.load.image('cursedOrbCollectible', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/cursed%20orb-rHogWhnYUk2xThrTWajfHqMSfxeyfd.png?0wr6')
    this.load.image('tealOrbCollectible', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/cursed%20teal%20orb-wupZvLrfiaRIZZyP4TbIOq5HLiVsXz.png?i2qV')
    this.load.image('pendant', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/pendant-cJISby3d7EEREasbi0gRZkn2u3rNrG.png?xf9m')
    this.load.image('heart-crystal', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/free%20life%20heart%20crystal-2EJMsIvSQKzdgrqytakBZcDbGf7Jpf.png?E1JG')
    this.load.image('yellow-chest', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/yellow%20chest-QMRMmVk9i7S0qkLteaXfhjqQBI351B.png?sE5u')
    
    // Enemies
    this.load.image('blueEnemy', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/blue%20enemy%20mouth%20closed-HUXqx9HBdotEhJE2LBgzK8Z4kA7e2H.png?AVKZ')
    this.load.image('yellowEnemy', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/yellow%20mouth%20open%20eye%20open-4dEmp2gPrn80UE2QOE1uSSovKJjcCe.png?SLUI')
    this.load.image('redEnemy', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/mouth%20closed%20eyes%201-RKF3p3F7fxdBSfen8UD9UGqIzf8zlv.png?xRpM')
    this.load.image('greenEnemy', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/green%20test-0I8rDwYn5lbuPQTEUiYrg8ctBccIAC.png?IBFc')
    this.load.image('stalkerEnemy', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/stalker%20enemy%20eye%201-Xt3Vtu2FiWWLT9l2wfeakBAqVSZet8.png?gS6O')
    this.load.image('beetle', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/beetle%20mouth%20open%2070-gToASj29g9XTDxUDHBKXDOfpYOKudu.png?uZh3')
    
    // BaseBlu enemy (was missing)
    this.load.image('baseblue-eyes-center', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/baseblue%20eyes%20center-BWjYc09iCwYsTuEB3TEsa7GdmDc4Nj.png?NZtQ')
    
    // Environmental
    this.load.image('ladderInstructions', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/ladder%20for%20instructions-G7U9VNDZ8e7krygwL64remh9sNOppw.png?i8q2')
    this.load.image('floor-tile-1', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/Floor%201-jbZVv42Z0BQYmH6sJLCOBTJs4op2eT.png?mhnt')
    this.load.image('pink-floor-spike-tile', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/pink%20spikes%20floor%20tile-ncAVgIHazwYlznCBP4H6LWLiIhN7OF.png?n27v')
    this.load.image('yellow-ceiling-spike-tile', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/yellow%20spikes%20ceiling%20tile-8vq9W1Y2e1RSpgUfMl9sTp0ZILFHL3.png?mUEb')
    this.load.image('doorClosed', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/treasure%20quest%20door-SX8un6qHvlx4mzlRYUC77dJ4lpBmOT.png?548U')
  }

  create(): void {
    this.setupBackground()
    this.createTitle()
    this.createScrollableContainer()
    this.createInstructionCategories()
    this.createSkipButton()
    this.createScrollIndicator()
    this.setupScrolling()
  }

  private setupBackground(): void {
    const screenWidth = GameSettings.canvas.width
    const screenHeight = GameSettings.canvas.height
    
    // Create background image
    this.bgImage = this.add.image(screenWidth / 2, screenHeight / 2, 'instructionsBg')
    this.bgImage.setDepth(0)
    
    // Scale to fill screen
    const scaleX = screenWidth / this.bgImage.width
    const scaleY = screenHeight / this.bgImage.height
    const scale = Math.max(scaleX, scaleY)
    this.bgImage.setScale(scale)
  }

  private createTitle(): void {
    const screenWidth = GameSettings.canvas.width
    
    // Create title with HUD styling (purple background)
    this.titleText = this.add.text(screenWidth / 2, 60, 'HOW TO PLAY', {
      fontSize: '28px',
      fontFamily: '"Press Start 2P", system-ui',
      color: '#FFD700', // Gold text
      stroke: '#4B0082', // Purple stroke
      strokeThickness: 2
    })
    this.titleText.setOrigin(0.5, 0.5)
    this.titleText.setDepth(100)
    
    // Add background box for title
    const titleBg = this.add.graphics()
    titleBg.fillStyle(0x4B0082, 0.6) // Purple background, 60% opacity
    titleBg.lineStyle(2, 0xFF00FF) // Magenta border
    const titleBounds = this.titleText.getBounds()
    titleBg.fillRoundedRect(titleBounds.x - 20, titleBounds.y - 10, titleBounds.width + 40, titleBounds.height + 20, 10)
    titleBg.strokeRoundedRect(titleBounds.x - 20, titleBounds.y - 10, titleBounds.width + 40, titleBounds.height + 20, 10)
    titleBg.setDepth(99)
  }

  private createScrollableContainer(): void {
    const screenWidth = GameSettings.canvas.width
    const screenHeight = GameSettings.canvas.height
    
    // Create purple background rectangle with magenta border and rounded corners
    const backgroundRect = this.add.graphics()
    backgroundRect.fillStyle(0x4B0082, 0.6) // Purple background, 60% opacity
    backgroundRect.lineStyle(2, 0xFF00FF) // Magenta border
    backgroundRect.fillRoundedRect(20, 100, screenWidth - 40, screenHeight - 200, 15)
    backgroundRect.strokeRoundedRect(20, 100, screenWidth - 40, screenHeight - 200, 15)
    backgroundRect.setDepth(5)
    
    // Create scrollable container
    this.scrollContainer = this.add.container(0, 0)
    this.scrollContainer.setDepth(10)
    
    // Create invisible mask for scrollable area (leave space for title and skip button)
    this.maskGraphics = this.add.graphics()
    this.maskGraphics.fillStyle(0xffffff)
    this.maskGraphics.fillRect(20, 100, screenWidth - 40, screenHeight - 200)
    this.maskGraphics.setVisible(false) // Hide the white mask rectangle
    
    const mask = this.maskGraphics.createGeometryMask()
    this.scrollContainer.setMask(mask)
  }

  private createInstructionCategories(): void {
    let currentY = 120 // Start below title
    
    // Define instruction categories with expanded content
    const categories = [
      {
        title: 'MOVEMENT & CONTROLS',
        items: [
          { sprite: 'playerIdleEye1', title: 'Move', description: 'Use WASD/arrow keys or pink crystal D-pad to move', spriteSize: { width: 38, height: 58 }},
          { sprite: 'playerJumpRightFoot', title: 'Jump', description: 'Press SPACE or E to jump (or use pink crystal button)', spriteSize: { width: 38, height: 58 }},
          { sprite: 'playerClimbInstructions', title: 'Climb', description: 'Use UP/DOWN arrows or D-pad to climb ladders', spriteSize: { width: 38, height: 58 }},
          { sprite: 'playerThrow', title: 'Throw', description: 'Press Q, V, or M to throw crystal balls (or yellow crystal button)', spriteSize: { width: 38, height: 58 }}
        ]
      },
      {
        title: 'COLLECTIBLES & ITEMS',
        items: [
          { sprite: 'crystal-hud-icon', title: 'Gems', description: 'Collect for 50 points each. 150 gems = free life', spriteSize: { width: 19, height: 19 }},
          { sprite: 'blueCoin', title: 'Blue Gems', description: 'Rare gems worth 500 points each', spriteSize: { width: 26, height: 26 }},
          { sprite: 'diamond', title: 'Diamonds', description: 'Valuable gems worth 1000 points each', spriteSize: { width: 35, height: 35 }},
          { sprite: 'heart-crystal', title: 'Heart Crystal', description: 'Gain an extra life worth 2000 points', spriteSize: { width: 35, height: 35 }},
          { sprite: 'pendant', title: 'Pendant', description: 'Invincibility power-up worth 300 points', spriteSize: { width: 24, height: 24 }},
          { sprite: 'crystalBallCollectible', title: 'Crystal Ball', description: 'Power-up: Shoot crystal balls for 20 seconds', spriteSize: { width: 24, height: 24 }},
          { sprite: 'cursedOrbCollectible', title: 'Cursed Orb', description: 'Power-up: Darkness effect for 10 seconds', spriteSize: { width: 24, height: 24 }},
          { sprite: 'tealOrbCollectible', title: 'Teal Orb', description: 'Power-up: Controls reversed for 10 seconds', spriteSize: { width: 24, height: 24 }},
          { sprite: 'yellow-chest', title: 'Treasure Chest', description: 'Contains random rewards (2500 points + items)', spriteSize: { width: 36, height: 36 }}
        ]
      },
      {
        title: 'ENEMIES & HAZARDS',
        items: [
          { sprite: 'yellowEnemy', title: 'Caterpillar', description: 'Slow random movement (50 points)', spriteSize: { width: 65, height: 26 }},
          { sprite: 'beetle', title: 'Rollz', description: 'Simple patrol enemy (75 points)', spriteSize: { width: 54, height: 54 }},
          { sprite: 'blueEnemy', title: 'Chomper', description: 'Standard patrol enemy (100 points)', spriteSize: { width: 58, height: 58 }},
          { sprite: 'redEnemy', title: 'Snail', description: 'Faster patrol movement (150 points)', spriteSize: { width: 58, height: 58 }},
          { sprite: 'greenEnemy', title: 'Bouncer', description: 'Fast bouncing movement (200 points)', spriteSize: { width: 58, height: 58 }},
          { sprite: 'stalkerEnemy', title: 'Stalker', description: 'Activates and chases you (300 points)', spriteSize: { width: 58, height: 58 }},
          { sprite: 'baseblue-eyes-center', title: 'Blu', description: 'Immovable blocker (1000 points when invincible)', spriteSize: { width: 58, height: 58 }}
        ]
      },
      {
        title: 'ENVIRONMENT & NAVIGATION',
        items: [
          { sprite: 'ladderInstructions', title: 'Ladders', description: 'Climb up and down between floors', spriteSize: { width: 48, height: 72 }},
          { sprite: 'floor-tile-1', title: 'Platforms', description: 'Solid ground you can walk and jump on', spriteSize: { width: 38, height: 38 }},
          { sprite: 'pink-floor-spike-tile', title: 'Floor Spikes', description: 'Sharp floor hazards that damage you', spriteSize: { width: 38, height: 38 }},
          { sprite: 'yellow-ceiling-spike-tile', title: 'Ceiling Spikes', description: 'Sharp ceiling hazards that damage you', spriteSize: { width: 38, height: 38 }},
          { sprite: 'doorClosed', title: 'Exit Door', description: 'Reach the door at the top to complete the level', spriteSize: { width: 36, height: 48 }}
        ]
      }
    ]

    categories.forEach(category => {
      currentY = this.createCategory(category.title, category.items, currentY)
      currentY += 40 // Space between categories
    })
    
    this.contentHeight = currentY
    this.maxScrollY = Math.max(0, this.contentHeight - (GameSettings.canvas.height - 200))
  }

  private createCategory(title: string, items: InstructionItem[], startY: number): number {
    const screenWidth = GameSettings.canvas.width
    let currentY = startY
    
    // Category header
    const headerBg = this.add.graphics()
    headerBg.fillStyle(0xFFC0CB, 0.6) // Pink background, 60% opacity
    headerBg.lineStyle(2, 0xFF00FF) // Magenta border
    headerBg.fillRoundedRect(40, currentY, screenWidth - 80, 40, 10)
    headerBg.strokeRoundedRect(40, currentY, screenWidth - 80, 40, 10)
    this.scrollContainer.add(headerBg)
    
    const headerText = this.add.text(screenWidth / 2, currentY + 20, title, {
      fontSize: '15px', // Reduced by 15% from 18px
      fontFamily: '"Press Start 2P", system-ui',
      color: '#000000', // Black text on pink
      fontStyle: 'bold'
    })
    headerText.setOrigin(0.5, 0.5)
    this.scrollContainer.add(headerText)
    
    currentY += 60 // Move past header
    
    // Category items (expanded by default)
    items.forEach(item => {
      currentY = this.createInstructionItem(item, currentY)
      currentY += 10 // Small space between items
    })
    
    return currentY
  }

  private createInstructionItem(item: InstructionItem, startY: number): number {
    const screenWidth = GameSettings.canvas.width
    
    // Item background (increased height to accommodate text with better padding)
    const itemBg = this.add.graphics()
    itemBg.fillStyle(0x008080, 0.7) // Teal background, 70% opacity
    itemBg.lineStyle(2, 0x20B2AA) // Light sea green border
    
    // Increase height for throw box to match proper padding
    const boxHeight = item.sprite === 'playerThrow' ? 130 : 110
    itemBg.fillRoundedRect(60, startY, screenWidth - 120, boxHeight, 10)
    itemBg.strokeRoundedRect(60, startY, screenWidth - 120, boxHeight, 10)
    this.scrollContainer.add(itemBg)
    
    // Sprite visual reference with special handling
    if (item.sprite === 'playerThrow') {
      // Special handling for throw animation - combine two sprites
      if (this.textures.exists('playerThrowingGem') && this.textures.exists('playerBothFeetDown')) {
        // Create container for two-layer sprite - adjust position for better spacing
        const throwContainer = this.add.container(100, startY + 60)
        
        // Add legs sprite (bottom layer - both feet down)
        const legsSprite = this.add.image(0, 0, 'playerBothFeetDown')
        legsSprite.setDisplaySize(item.spriteSize.width, item.spriteSize.height)
        throwContainer.add(legsSprite)
        
        // Add body sprite with gem throwing face (top layer)
        const bodySprite = this.add.image(0, 0, 'playerThrowingGem')
        bodySprite.setDisplaySize(item.spriteSize.width, item.spriteSize.height)
        throwContainer.add(bodySprite)
        
        this.scrollContainer.add(throwContainer)
      }
    } else if (this.textures.exists(item.sprite)) {
      const sprite = this.add.image(100, startY + 55, item.sprite)
      
      // Apply cropping for spike sprites
      if (item.sprite === 'pink-floor-spike-tile') {
        // Crop 1 pixel from top
        sprite.setCrop(0, 1, sprite.width, sprite.height - 1)
        sprite.setDisplaySize(item.spriteSize.width, item.spriteSize.height - 1)
      } else if (item.sprite === 'yellow-ceiling-spike-tile') {
        // Crop 1 pixel from bottom  
        sprite.setCrop(0, 0, sprite.width, sprite.height - 1)
        sprite.setDisplaySize(item.spriteSize.width, item.spriteSize.height - 1)
      } else {
        sprite.setDisplaySize(item.spriteSize.width, item.spriteSize.height)
      }
      
      this.scrollContainer.add(sprite)
    }
    
    // Item title - adjust position for throw box
    const titleY = item.sprite === 'playerThrow' ? startY + 25 : startY + 20
    const titleText = this.add.text(140, titleY, item.title, {
      fontSize: '12px',
      fontFamily: '"Press Start 2P", system-ui',
      color: '#FFD700', // Gold text
      fontStyle: 'bold'
    })
    titleText.setOrigin(0, 0.5)
    this.scrollContainer.add(titleText)
    
    // Item description - adjust position for throw box with more padding
    const descY = item.sprite === 'playerThrow' ? startY + 75 : startY + 65
    const descText = this.add.text(140, descY, item.description, {
      fontSize: '12px',
      fontFamily: '"Press Start 2P", system-ui',
      color: '#FFFFFF', // White text
      wordWrap: { width: screenWidth - 200 },
      lineSpacing: 4 // Increased line spacing by ~10%
    })
    descText.setOrigin(0, 0.5)
    this.scrollContainer.add(descText)
    
    // Return appropriate next Y position based on box height
    const nextY = item.sprite === 'playerThrow' ? startY + 140 : startY + 120
    return nextY
  }

  private createSkipButton(): void {
    const screenWidth = GameSettings.canvas.width
    const screenHeight = GameSettings.canvas.height
    
    // Skip button container
    this.skipButton = this.add.container(screenWidth - 80, screenHeight - 50)
    this.skipButton.setDepth(101)
    
    // Button background
    const buttonBg = this.add.graphics()
    buttonBg.fillStyle(0x32CD32, 0.9) // Green
    buttonBg.lineStyle(2, 0xFFD700) // Gold border
    buttonBg.fillRoundedRect(-60, -20, 120, 40, 8)
    buttonBg.strokeRoundedRect(-60, -20, 120, 40, 8)
    this.skipButton.add(buttonBg)
    
    // Button text - "CLOSE" if from menu, "SKIP ALL" if from game start
    const buttonLabel = this.fromMenu ? 'CLOSE' : 'SKIP ALL'
    const buttonText = this.add.text(0, 0, buttonLabel, {
      fontSize: '12px',
      fontFamily: '"Press Start 2P", system-ui',
      color: '#000000', // Black text
      fontStyle: 'bold'
    })
    buttonText.setOrigin(0.5, 0.5)
    this.skipButton.add(buttonText)
    
    // Make button interactive
    this.skipButton.setSize(120, 40)
    this.skipButton.setInteractive()
    this.skipButton.on('pointerdown', () => {
      console.log('🎮 InstructionsScene: Skip requested')
      this.transitionToGame()
    })
    
    // Hover effects
    this.skipButton.on('pointerover', () => {
      buttonBg.clear()
      buttonBg.fillStyle(0x32CD32, 1.0) // Brighter green
      buttonBg.lineStyle(3, 0xFFD700) // Thicker border
      buttonBg.fillRoundedRect(-60, -20, 120, 40, 8)
      buttonBg.strokeRoundedRect(-60, -20, 120, 40, 8)
    })
    
    this.skipButton.on('pointerout', () => {
      buttonBg.clear()
      buttonBg.fillStyle(0x32CD32, 0.9) // Normal green
      buttonBg.lineStyle(2, 0xFFD700) // Normal border
      buttonBg.fillRoundedRect(-60, -20, 120, 40, 8)
      buttonBg.strokeRoundedRect(-60, -20, 120, 40, 8)
    })
  }

  private createScrollIndicator(): void {
    const screenHeight = GameSettings.canvas.height
    
    // Scroll indicator container
    this.scrollIndicator = this.add.container(GameSettings.canvas.width - 15, screenHeight / 2)
    this.scrollIndicator.setDepth(101)
    
    // Scroll track
    const track = this.add.graphics()
    track.fillStyle(0x4B0082, 0.5) // Purple
    track.fillRoundedRect(-5, -150, 10, 300, 5)
    this.scrollIndicator.add(track)
    
    // Scroll thumb
    const thumb = this.add.graphics()
    thumb.fillStyle(0xFFD700, 0.8) // Gold
    thumb.fillRoundedRect(-4, -20, 8, 40, 4)
    this.scrollIndicator.add(thumb)
    
    this.updateScrollIndicator()
  }

  private setupScrolling(): void {
    // Mouse wheel scrolling
    this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number) => {
      this.scrollY += deltaY * 0.5
      this.scrollY = Phaser.Math.Clamp(this.scrollY, 0, this.maxScrollY)
      this.updateScrollPosition()
    })
    
    // Touch/mouse dragging
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isDragging = true
      this.dragStartY = pointer.y
      this.scrollStartY = this.scrollY
    })
    
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        const deltaY = this.dragStartY - pointer.y
        this.scrollY = this.scrollStartY + deltaY
        this.scrollY = Phaser.Math.Clamp(this.scrollY, 0, this.maxScrollY)
        this.updateScrollPosition()
      }
    })
    
    this.input.on('pointerup', () => {
      this.isDragging = false
    })
  }

  private updateScrollPosition(): void {
    this.scrollContainer.y = -this.scrollY
    this.updateScrollIndicator()
  }

  private updateScrollIndicator(): void {
    if (this.maxScrollY > 0) {
      const scrollPercent = this.scrollY / this.maxScrollY
      const thumbY = (scrollPercent - 0.5) * 260 // Move within track bounds
      
      // Update thumb position
      const thumb = this.scrollIndicator.list[1] as Phaser.GameObjects.Graphics
      thumb.y = thumbY
      
      this.scrollIndicator.setVisible(true)
    } else {
      this.scrollIndicator.setVisible(false)
    }
  }

  private transitionToGame(): void {
    // Quick fade out
    this.cameras.main.fadeOut(300, 0, 0, 0)
    
    this.cameras.main.once('camerafadeoutcomplete', () => {
      if (this.fromMenu && this.reopenMenu) {
        // Stop the instructions scene
        this.scene.stop('InstructionsScene')
        // Wake up the game scene (it was sleeping)
        this.scene.wake('GameScene')
        
        // Get the GameScene and reopen the menu
        const gameScene = this.scene.get('GameScene') as any
        if (gameScene && gameScene.menuOverlay) {
          // Show the menu again
          gameScene.menuOverlay.container.setVisible(true)
        }
      } else {
        // Normal transition to game (starts fresh)
        this.scene.start('GameScene')
      }
    })
  }

  update(): void {
    // Scrolling updates handled by event system
  }
}