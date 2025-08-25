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

  constructor() {
    super({ key: 'InstructionsScene' })
  }

  preload(): void {
    // Load background image
    this.load.image('instructionsBg', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/Treasure%20Quest%20BG%205-pVHhUmXIAvnZT4aFVRFgYvljKibVS0.png?qco1')
    
    // Load game sprites for visual references
    this.loadGameSprites()
    
    console.log('🎮 InstructionsScene: Loading assets')
  }

  private loadGameSprites(): void {
    // Player sprites
    this.load.image('playerIdleEye1', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/Idle%20eye%20position%201-aD6V48lNdWK5R1x5CPNs4XLX869cmI.png?0XJy')
    this.load.image('playerJumpRightFoot', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/jumping%20right%20foot%20forward-3clf2KnwfbN3O6BsrtaeHSTAviNbnF.png?xx8e')
    this.load.image('playerClimbLeftFoot', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/climbing%20ladder%20left%20foot%20up-HkXPep0kpt9he1WtndEXsXRVHQBdlq.png?ncVM')
    
    // Collectibles
    this.load.image('coin', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/pink%20round-E2EKGSTZHnnCdW0QkFmTDRKY7ERfw7.png?izQh')
    this.load.image('blueCoin', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/big%20blue%20gem-GzKKZKUsDMh3CXMEIV4OmMl4ksrqqm.png?sill')
    this.load.image('diamond', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/diamond-LB22Ijoji8erIrMFMvtSwd5Y9rDDwS.png?LlEv')
    this.load.image('crystalBallCollectible', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/crystal%20ball%20collectible-BYMW8D53PB5JZUqKCfjKdI59qi0Yk8.png?rzg5')
    this.load.image('cursedOrbCollectible', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/cursed%20orb-rHogWhnYUk2xThrTWajfHqMSfxeyfd.png?0wr6')
    this.load.image('tealOrbCollectible', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/cursed%20teal%20orb-wupZvLrfiaRIZZyP4TbIOq5HLiVsXz.png?i2qV')
    this.load.image('pendant', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/pendant-cJISby3d7EEREasbi0gRZkn2u3rNrG.png?xf9m')
    this.load.image('heart-crystal', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/free%20life%20heart%20crystal-2EJMsIvSQKzdgrqytakBZcDbGf7Jpf.png?E1JG')
    
    // Enemies
    this.load.image('blueEnemy', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/blue%20enemy%20mouth%20closed-HUXqx9HBdotEhJE2LBgzK8Z4kA7e2H.png?AVKZ')
    this.load.image('yellowEnemy', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/yellow%20mouth%20open%20eye%20open-4dEmp2gPrn80UE2QOE1uSSovKJjcCe.png?SLUI')
    this.load.image('redEnemy', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/mouth%20closed%20eyes%201-RKF3p3F7fxdBSfen8UD9UGqIzf8zlv.png?xRpM')
    this.load.image('stalkerEnemy', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/stalker%20enemy%20eye%201-Xt3Vtu2FiWWLT9l2wfeakBAqVSZet8.png?gS6O')
    this.load.image('beetle', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/beetle-wEGgkZjC08EeQiAyHJGr9J9G3ZWVJF.png?G9xM')
    
    // Environmental
    this.load.image('tealLadder', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/new%20ladder-ULDbdT9I4h8apxhpJI6WT1PzmaMzLo.png?okOd')
    this.load.image('floor-tile-1', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/Floor%201-jbZVv42Z0BQYmH6sJLCOBTJs4op2eT.png?mhnt')
    this.load.image('pink-floor-spike-tile', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/pink%20spikes%20floor%20tile-ncAVgIHazwYlznCBP4H6LWLiIhN7OF.png?n27v')
    this.load.image('yellow-ceiling-spike-tile', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/yellow%20spikes%20ceiling%20tile-8vq9W1Y2e1RSpgUfMl9sTp0ZILFHL3.png?mUEb')
    this.load.image('doorClosed', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/treasure%20quest%20door-SX8un6qHvlx4mzlRYUC77dJ4lpBmOT.png?548U')
  }

  create(): void {
    console.log('🎮 InstructionsScene: Creating instructions screen')
    
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
    
    console.log('🎮 InstructionsScene: Background setup complete')
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
    titleBg.fillStyle(0x4B0082, 0.8) // Purple with transparency
    titleBg.lineStyle(2, 0xFFD700) // Gold border
    const titleBounds = this.titleText.getBounds()
    titleBg.fillRoundedRect(titleBounds.x - 20, titleBounds.y - 10, titleBounds.width + 40, titleBounds.height + 20, 10)
    titleBg.strokeRoundedRect(titleBounds.x - 20, titleBounds.y - 10, titleBounds.width + 40, titleBounds.height + 20, 10)
    titleBg.setDepth(99)
  }

  private createScrollableContainer(): void {
    const screenWidth = GameSettings.canvas.width
    const screenHeight = GameSettings.canvas.height
    
    // Create scrollable container
    this.scrollContainer = this.add.container(0, 0)
    this.scrollContainer.setDepth(10)
    
    // Create mask for scrollable area (leave space for title and skip button)
    this.maskGraphics = this.add.graphics()
    this.maskGraphics.fillStyle(0xffffff)
    this.maskGraphics.fillRect(20, 100, screenWidth - 40, screenHeight - 200)
    
    const mask = this.maskGraphics.createGeometryMask()
    this.scrollContainer.setMask(mask)
  }

  private createInstructionCategories(): void {
    let currentY = 120 // Start below title
    
    // Define instruction categories with expanded content
    const categories = [
      {
        title: '🎮 MOVEMENT & CONTROLS',
        items: [
          { sprite: 'playerIdleEye1', title: 'Move', description: 'Use WASD keys or arrow keys to move left and right', spriteSize: { width: 32, height: 48 }},
          { sprite: 'playerJumpRightFoot', title: 'Jump', description: 'Press SPACE or W/UP to jump over gaps and enemies', spriteSize: { width: 32, height: 48 }},
          { sprite: 'playerClimbLeftFoot', title: 'Climb', description: 'Use ladders to move between floors - press W/UP near ladder', spriteSize: { width: 32, height: 48 }}
        ]
      },
      {
        title: '💎 COLLECTIBLES & ITEMS',
        items: [
          { sprite: 'coin', title: 'Gems', description: 'Collect for 50 points each. 150 gems = free life', spriteSize: { width: 16, height: 16 }},
          { sprite: 'blueCoin', title: 'Blue Gems', description: 'Rare gems worth 500 points each', spriteSize: { width: 22, height: 22 }},
          { sprite: 'diamond', title: 'Diamonds', description: 'Valuable gems worth 1000 points each', spriteSize: { width: 29, height: 29 }},
          { sprite: 'crystalBallCollectible', title: 'Crystal Ball', description: 'Power-up: Shoot crystal balls for 20 seconds', spriteSize: { width: 20, height: 20 }},
          { sprite: 'cursedOrbCollectible', title: 'Cursed Orb', description: 'Power-up: Darkness effect for 10 seconds', spriteSize: { width: 20, height: 20 }},
          { sprite: 'tealOrbCollectible', title: 'Teal Orb', description: 'Power-up: Controls reversed for 10 seconds', spriteSize: { width: 20, height: 20 }},
          { sprite: 'pendant', title: 'Pendant', description: 'Invincibility power-up worth 300 points', spriteSize: { width: 20, height: 20 }},
          { sprite: 'heart-crystal', title: 'Heart Crystal', description: 'Gain an extra life worth 2000 points', spriteSize: { width: 29, height: 29 }}
        ]
      },
      {
        title: '👹 ENEMIES & HAZARDS',
        items: [
          { sprite: 'blueEnemy', title: 'Blue Enemy', description: 'Animated enemies that move and can hurt you', spriteSize: { width: 48, height: 48 }},
          { sprite: 'yellowEnemy', title: 'Yellow Enemy', description: 'Patrol enemies that move back and forth', spriteSize: { width: 54, height: 22 }},
          { sprite: 'redEnemy', title: 'Red Enemy', description: 'Aggressive enemies with multiple animations', spriteSize: { width: 48, height: 48 }},
          { sprite: 'stalkerEnemy', title: 'Stalker Enemy', description: 'Advanced enemies that track your movement', spriteSize: { width: 48, height: 48 }},
          { sprite: 'beetle', title: 'Beetle', description: 'Small crawling enemies - jump over them', spriteSize: { width: 18, height: 14 }},
          { sprite: 'pink-floor-spike-tile', title: 'Floor Spikes', description: 'Sharp floor hazards that damage you', spriteSize: { width: 32, height: 32 }},
          { sprite: 'yellow-ceiling-spike-tile', title: 'Ceiling Spikes', description: 'Sharp ceiling hazards that damage you', spriteSize: { width: 32, height: 32 }}
        ]
      },
      {
        title: '🏗️ ENVIRONMENT & NAVIGATION',
        items: [
          { sprite: 'tealLadder', title: 'Ladders', description: 'Climb up and down between floors', spriteSize: { width: 20, height: 60 }},
          { sprite: 'floor-tile-1', title: 'Platforms', description: 'Solid ground you can walk and jump on', spriteSize: { width: 32, height: 32 }},
          { sprite: 'doorClosed', title: 'Exit Door', description: 'Reach the door at the top to complete the level', spriteSize: { width: 30, height: 40 }}
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
    headerBg.fillStyle(0x32CD32, 0.9) // Green background
    headerBg.lineStyle(2, 0xFFD700) // Gold border
    headerBg.fillRoundedRect(40, currentY, screenWidth - 80, 40, 8)
    headerBg.strokeRoundedRect(40, currentY, screenWidth - 80, 40, 8)
    this.scrollContainer.add(headerBg)
    
    const headerText = this.add.text(screenWidth / 2, currentY + 20, title, {
      fontSize: '14px',
      fontFamily: '"Press Start 2P", system-ui',
      color: '#000000', // Black text on green
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
    
    // Item background
    const itemBg = this.add.graphics()
    itemBg.fillStyle(0xFFC0CB, 0.6) // Pink background, 60% opacity
    itemBg.lineStyle(2, 0xFF00FF) // Magenta border
    itemBg.fillRoundedRect(60, startY, screenWidth - 120, 80, 10)
    itemBg.strokeRoundedRect(60, startY, screenWidth - 120, 80, 10)
    this.scrollContainer.add(itemBg)
    
    // Sprite visual reference
    if (this.textures.exists(item.sprite)) {
      const sprite = this.add.image(100, startY + 40, item.sprite)
      sprite.setDisplaySize(item.spriteSize.width, item.spriteSize.height)
      this.scrollContainer.add(sprite)
    }
    
    // Item title
    const titleText = this.add.text(140, startY + 25, item.title, {
      fontSize: '12px',
      fontFamily: '"Press Start 2P", system-ui',
      color: '#FFD700', // Gold text
      fontStyle: 'bold'
    })
    titleText.setOrigin(0, 0.5)
    this.scrollContainer.add(titleText)
    
    // Item description
    const descText = this.add.text(140, startY + 50, item.description, {
      fontSize: '10px',
      fontFamily: '"Press Start 2P", system-ui',
      color: '#FFFFFF', // White text
      wordWrap: { width: screenWidth - 200 }
    })
    descText.setOrigin(0, 0.5)
    this.scrollContainer.add(descText)
    
    return startY + 90
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
    
    // Button text
    const buttonText = this.add.text(0, 0, 'SKIP ALL', {
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
    console.log('🎮 InstructionsScene: Transitioning to game')
    
    // Quick fade out
    this.cameras.main.fadeOut(300, 0, 0, 0)
    
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene')
    })
  }

  update(): void {
    // Scrolling updates handled by event system
  }
}