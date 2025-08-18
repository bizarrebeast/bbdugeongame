import GameSettings from "../config/GameSettings"

export enum CatColor {
  BLUE = 'blue',
  YELLOW = 'yellow',
  GREEN = 'green',
  RED = 'red'
}

export class Cat extends Phaser.Physics.Arcade.Sprite {
  private baseSpeed: number = 80
  private moveSpeed: number
  private direction: number = 1
  public platformBounds: { left: number; right: number }
  private catColor: CatColor
  private bounceTimer: number = 0
  private randomMoveTimer: number = 0
  private isSquished: boolean = false
  private debugGraphics: Phaser.GameObjects.Graphics | null = null
  private debugUpdateHandler: (() => void) | null = null
  
  // Blue enemy animation system
  private blueEnemyAnimationState: 'idle' | 'bite_partial' | 'bite_full' | 'blinking' = 'idle'
  private biteTimer: number = 0
  private blinkTimer: number = 0
  private biteAnimationTimer: number = 0
  private blinkAnimationTimer: number = 0
  private nextBiteTime: number = 0
  private nextBlinkTime: number = 0
  
  constructor(
    scene: Phaser.Scene, 
    x: number, 
    y: number, 
    platformLeft: number, 
    platformRight: number,
    color?: CatColor | string
  ) {
    const colors = [CatColor.BLUE, CatColor.YELLOW, CatColor.GREEN, CatColor.RED]
    
    // Convert string color to CatColor enum if needed
    let catColor: CatColor
    if (color) {
      if (typeof color === 'string') {
        catColor = color as CatColor // Cast string to CatColor enum
      } else {
        catColor = color
      }
    } else {
      catColor = colors[Math.floor(Math.random() * colors.length)]
    }
    
    // Use sprites for all enemy types, generate texture as fallback
    let textureKey: string
    
    // Generate fallback textures FIRST, before calling super
    if (catColor === CatColor.BLUE) {
      // For blue enemies, prefer the new animation sprite (start with mouth closed), fallback to old sprite, then generated
      if (scene.textures.exists('blueEnemyMouthClosed')) {
        textureKey = 'blueEnemyMouthClosed'
      } else if (scene.textures.exists('blueEnemy')) {
        textureKey = 'blueEnemy'
      } else {
        // Use generated texture as fallback
        textureKey = `cat-${catColor}`
        Cat.generateFallbackTexture(scene, catColor) // Static call
      }
    } else if (catColor === CatColor.YELLOW) {
      // For yellow enemies, look for yellow enemy sprite
      if (scene.textures.exists('yellowEnemy')) {
        textureKey = 'yellowEnemy'
      } else {
        // Use generated texture as fallback
        textureKey = `cat-${catColor}`
        Cat.generateFallbackTexture(scene, catColor) // Static call
      }
    } else if (catColor === CatColor.GREEN) {
      // For green enemies, look for green enemy sprite
      if (scene.textures.exists('greenEnemy')) {
        textureKey = 'greenEnemy'
      } else {
        // Use generated texture as fallback
        textureKey = `cat-${catColor}`
        Cat.generateFallbackTexture(scene, catColor) // Static call
      }
    } else if (catColor === CatColor.RED) {
      // For red enemies, look for red enemy sprite
      if (scene.textures.exists('redEnemy')) {
        textureKey = 'redEnemy'
      } else {
        // Use generated texture as fallback
        textureKey = `cat-${catColor}`
        Cat.generateFallbackTexture(scene, catColor) // Static call
      }
    } else {
      // For any other colors, use generated texture
      textureKey = `cat-${catColor}`
      Cat.generateFallbackTexture(scene, catColor) // Static call
    }
    
    // Now call super with the determined texture
    super(scene, x, y, textureKey)
    
    this.catColor = catColor
    
    scene.add.existing(this)
    scene.physics.add.existing(this)
    
    console.log(`🚀 ${catColor.toUpperCase()} enemy: ${textureKey} at (${x}, ${y})`)
    
    // Apply blue enemy hitbox sizing AFTER physics body is created
    if (catColor === CatColor.BLUE && this.body instanceof Phaser.Physics.Arcade.Body) {
      console.log(`🚀 STEP 5A: Setting blue enemy hitbox to 30x20...`)
      this.body.setSize(30, 20)
      console.log(`🚀 STEP 5B: Blue enemy (${textureKey}) hitbox SET, actual size: ${this.body.width}x${this.body.height}`)
    } else if (this.body instanceof Phaser.Physics.Arcade.Body) {
      console.log(`🚀 STEP 5C: ${catColor} enemy (${textureKey}) keeping default hitbox: ${this.body.width}x${this.body.height}`)
    }
    
    this.setCollideWorldBounds(true)
    this.setBounce(0)
    
    // Only green enemies (bouncing) need gravity
    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      if (catColor !== CatColor.GREEN) {
        this.body.setAllowGravity(false) // Blue, Yellow, Red patrol without gravity
      }
      // Green enemies keep gravity for bouncing behavior
    }
    
    // Set up hitbox and visual alignment
    if (catColor === CatColor.BLUE && this.isBlueEnemyAnimationSprite(textureKey)) {
      // For all blue enemy animation sprites - use consistent positioning
      this.setDisplaySize(36, 36)
      this.setOffset(3, 58) // Consistent positioning for all animation sprites
      this.setFlipX(false)
      this.initializeBlueEnemyAnimations()
      this.addDebugVisualization()
    } else if (catColor === CatColor.BLUE && textureKey === 'blueEnemy') {
      // Original blue enemy sprite fallback
      this.setDisplaySize(36, 36)
      this.setOffset(3, 45)
      this.setFlipX(false)
      this.addDebugVisualization()
    } else if (this.isEnemySprite(textureKey)) {
      // For sprite-based enemies (yellow, green, red), use proper sizing similar to blue enemies
      if (catColor === CatColor.YELLOW) {
        // Make yellow enemies 3x wider
        this.setDisplaySize(108, 36) // 3x width (36 * 3 = 108)
        this.setOffset(3, 45)
      } else {
        // Green and red enemies keep normal sizing
        this.setDisplaySize(36, 36)
        this.setOffset(3, 45)
      }
      this.setFlipX(false)
      this.addDebugVisualization()
    } else if (catColor !== CatColor.BLUE) {
      // Fallback generated texture settings for non-blue colors
      if (catColor === CatColor.YELLOW) {
        // Make yellow enemies 3x wider even with fallback texture
        this.setDisplaySize(54, 14) // 3x width (18 * 3 = 54)
        this.setOffset(1, 1)
      } else {
        this.setSize(18, 14)
        this.setOffset(1, 1)
      }
      this.addDebugVisualization()
    } else {
      // Blue enemy using fallback texture
      this.addDebugVisualization()
    }
    
    // === FINAL VERIFICATION ===
    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      console.log(`🚀 FINAL: ${catColor} enemy constructor complete - hitbox: ${this.body.width}x${this.body.height}, display: ${this.displayWidth}x${this.displayHeight}`)
    }
    
    this.setDepth(15)
    
    this.platformBounds = {
      left: platformLeft,
      right: platformRight
    }
    
    this.setupBehavior()
    
    // Set initial flip state for blue enemy sprite (facing left by default, moving right initially)
    if (catColor === CatColor.BLUE && scene.textures.exists('blueEnemy')) {
      this.setFlipX(this.direction > 0) // Flip if moving right
    }
    
    // Phaser's built-in debug visualization will show the hitbox
    
    this.setVelocityX(this.moveSpeed * this.direction)
  }
  
  private setupBehavior(): void {
    switch (this.catColor) {
      case CatColor.BLUE:
        this.moveSpeed = this.baseSpeed
        break
      case CatColor.YELLOW:
        this.moveSpeed = this.baseSpeed * 0.6
        break
      case CatColor.GREEN:
        this.moveSpeed = this.baseSpeed * 1.5
        break
      case CatColor.RED:
        this.moveSpeed = this.baseSpeed * 1.2 // Fast but not as fast as green
        break
    }
  }
  
  update(time: number, delta: number): void {
    if (this.isSquished) return
    
    // Movement logging temporarily disabled to see creation logs
    
    switch (this.catColor) {
      case CatColor.BLUE:
        this.updateBluePatrol()
        this.updateBlueEnemyAnimations(delta)
        break
      case CatColor.YELLOW:
        this.updateYellowPatrol(delta)
        break
      case CatColor.GREEN:
        this.updateGreenBounce(delta)
        break
      case CatColor.RED:
        this.updateRedPatrol()
        break
    }
  }
  
  private updateBluePatrol(): void {
    if (this.x <= this.platformBounds.left + 10) {
      this.direction = 1
    } else if (this.x >= this.platformBounds.right - 10) {
      this.direction = -1
    }
    
    this.setVelocityX(this.moveSpeed * this.direction)
    
    // Update sprite flip for all blue enemy sprites
    if (this.catColor === CatColor.BLUE) {
      this.setFlipX(this.direction > 0) // Flip when moving right
    }
  }
  
  private updateYellowPatrol(delta: number): void {
    this.randomMoveTimer -= delta
    
    if (this.randomMoveTimer <= 0) {
      if (Math.random() < 0.3) {
        this.direction = Math.random() < 0.5 ? -1 : 1
      }
      this.randomMoveTimer = 500 + Math.random() * 1000
    }
    
    if (this.x <= this.platformBounds.left + 10) {
      this.direction = 1
    } else if (this.x >= this.platformBounds.right - 10) {
      this.direction = -1
    }
    
    this.setVelocityX(this.moveSpeed * this.direction)
  }
  
  private updateGreenBounce(delta: number): void {
    this.bounceTimer -= delta
    
    if (this.bounceTimer <= 0 && this.body?.touching.down) {
      this.setVelocityY(-200)
      this.bounceTimer = 800 + Math.random() * 400
    }
    
    // Green cats travel the full width of their platform section
    if (this.x <= this.platformBounds.left + 5) {
      this.direction = 1
    } else if (this.x >= this.platformBounds.right - 5) {
      this.direction = -1
    }
    
    this.setVelocityX(this.moveSpeed * this.direction)
  }
  
  private updateRedPatrol(): void {
    // Red enemies are aggressive - they reverse direction more frequently
    // and move in shorter, erratic patterns
    if (this.x <= this.platformBounds.left + 15) {
      this.direction = 1
    } else if (this.x >= this.platformBounds.right - 15) {
      this.direction = -1
    }
    
    // Occasionally reverse direction randomly for erratic movement
    if (Math.random() < 0.002) { // 0.2% chance per frame = frequent direction changes
      this.direction *= -1
    }
    
    this.setVelocityX(this.moveSpeed * this.direction)
  }
  
  reverseDirection(): void {
    if (this.isSquished) return
    this.direction *= -1
    this.setVelocityX(this.moveSpeed * this.direction)
    
    // Update sprite flip for blue enemy
    if (this.catColor === CatColor.BLUE) {
      this.setFlipX(this.direction > 0) // Flip when moving right
    }
  }
  
  getDirection(): number {
    return this.direction
  }
  
  squish(): void {
    if (this.isSquished) return
    
    this.isSquished = true
    this.setVelocity(0, 0)
    
    // Disable physics body immediately to prevent further collisions
    if (this.body) {
      this.body.enable = false
    }
    
    // Clean up debug visualization immediately
    this.cleanupDebugVisualization()
    
    this.scene.tweens.add({
      targets: this,
      scaleY: 0.2,
      scaleX: 1.5,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        // Make sure to remove from parent group before destroying
        if (this.scene && (this.scene as any).cats) {
          (this.scene as any).cats.remove(this)
        }
        this.destroy()
      }
    })
  }
  
  getCatColor(): CatColor {
    return this.catColor
  }
  
  private addDebugVisualization(): void {
    // Only show in debug mode
    if (!GameSettings.debug) return
    
    this.debugGraphics = this.scene.add.graphics()
    
    // Store the update handler so we can remove it later
    this.debugUpdateHandler = () => {
      if (this.debugGraphics && this.debugGraphics.active && this.active) {
        this.debugGraphics.clear()
        
        // Draw visual sprite bounds (blue rectangle)
        this.debugGraphics.lineStyle(2, 0x0000ff, 0.8) // Blue for visual bounds
        const visualWidth = this.displayWidth
        const visualHeight = this.displayHeight
        this.debugGraphics.strokeRect(
          this.x - visualWidth/2,
          this.y - visualHeight/2,
          visualWidth,
          visualHeight
        )
        
        // Draw center cross (white)
        this.debugGraphics.lineStyle(1, 0xffffff, 0.8)
        this.debugGraphics.lineBetween(this.x - 5, this.y, this.x + 5, this.y) // Horizontal
        this.debugGraphics.lineBetween(this.x, this.y - 5, this.x, this.y + 5) // Vertical
        
        // Draw hitbox (red rectangle) - this is in addition to Phaser's green debug
        const body = this.body as Phaser.Physics.Arcade.Body
        if (body) {
          this.debugGraphics.lineStyle(2, 0xff0000, 0.8) // Red for hitbox
          this.debugGraphics.strokeRect(
            body.x,
            body.y,
            body.width,
            body.height
          )
          
        }
      }
    }
    
    // Update graphics position in update loop
    this.scene.events.on('postupdate', this.debugUpdateHandler)
    
    this.debugGraphics.setDepth(25) // Above enemy but below UI
    this.scene.add.existing(this.debugGraphics)
  }
  
  private cleanupDebugVisualization(): void {
    // Remove the event listener
    if (this.debugUpdateHandler) {
      this.scene.events.off('postupdate', this.debugUpdateHandler)
      this.debugUpdateHandler = null
    }
    
    // Destroy the graphics object
    if (this.debugGraphics) {
      this.debugGraphics.destroy()
      this.debugGraphics = null
    }
  }
  
  private addRoundedHitboxVisualization(): void {
    // Removed - replaced with addDebugVisualization
  }
  
  private static generateFallbackTexture(scene: Phaser.Scene, catColor: CatColor): void {
    const colorMap = {
      [CatColor.BLUE]: 0x4169e1,
      [CatColor.YELLOW]: 0xffd700,
      [CatColor.GREEN]: 0x32cd32,
      [CatColor.RED]: 0xdc143c
    }
    
    const textureKey = `cat-${catColor}`
    if (!scene.textures.exists(textureKey)) {
      const graphics = scene.add.graphics()
      graphics.fillStyle(colorMap[catColor], 1)
      graphics.fillCircle(10, 8, 8)
      graphics.fillStyle(0x000000, 1)
      graphics.fillCircle(6, 6, 2)
      graphics.fillCircle(14, 6, 2)
      graphics.fillStyle(colorMap[catColor], 1)
      graphics.fillTriangle(4, 2, 8, 0, 8, 4)
      graphics.fillTriangle(12, 0, 16, 2, 12, 4)
      graphics.generateTexture(textureKey, 20, 16)
      graphics.destroy()
    }
  }
  
  private isBlueEnemyAnimationSprite(textureKey: string): boolean {
    return [
      'blueEnemyMouthClosed',
      'blueEnemyMouthClosedBlinking',
      'blueEnemyMouthPartialOpen',
      'blueEnemyMouthPartialOpenBlinking',
      'blueEnemyMouthOpen',
      'blueEnemyMouthOpenBlinking'
    ].includes(textureKey)
  }
  
  private isEnemySprite(textureKey: string): boolean {
    return ['yellowEnemy', 'greenEnemy', 'redEnemy'].includes(textureKey)
  }
  
  private initializeBlueEnemyAnimations(): void {
    // Set random initial timers to make enemies feel unique
    this.nextBiteTime = Math.random() * 2000 + 2000 // 2-4 seconds
    this.nextBlinkTime = Math.random() * 1000 + 1000 // 1-2 seconds
    this.blueEnemyAnimationState = 'idle'
  }
  
  private updateBlueEnemyAnimations(delta: number): void {
    // Only animate if using the new animation sprites
    if (!this.isBlueEnemyAnimationSprite(this.texture.key)) {
      return
    }
    
    // Update timers
    this.biteTimer += delta
    this.blinkTimer += delta
    this.biteAnimationTimer += delta
    this.blinkAnimationTimer += delta
    
    // Handle current animation state
    switch (this.blueEnemyAnimationState) {
      case 'idle':
        this.handleIdleState()
        break
      case 'bite_partial':
        this.handleBitePartialState()
        break
      case 'bite_full':
        this.handleBiteFullState()
        break
      case 'blinking':
        this.handleBlinkingState()
        break
    }
    
    // Check for new animation triggers (independent of current state)
    this.checkForNewAnimations()
  }
  
  private handleIdleState(): void {
    // Set to mouth closed sprite
    this.changeBlueEnemyTexture('blueEnemyMouthClosed')
  }
  
  private handleBitePartialState(): void {
    if (this.biteAnimationTimer < 150) {
      // First part of bite - partial open
      this.changeBlueEnemyTexture('blueEnemyMouthPartialOpen')
    } else {
      // Transition to full bite
      this.blueEnemyAnimationState = 'bite_full'
      this.biteAnimationTimer = 0
    }
  }
  
  private handleBiteFullState(): void {
    if (this.biteAnimationTimer < 200) {
      // Full bite - mouth wide open
      this.changeBlueEnemyTexture('blueEnemyMouthOpen')
    } else {
      // Return to idle
      this.blueEnemyAnimationState = 'idle'
      this.biteAnimationTimer = 0
      // Set next bite time with variation
      this.nextBiteTime = this.biteTimer + Math.random() * 2000 + 2000 // 2-4 seconds
    }
  }
  
  private handleBlinkingState(): void {
    if (this.blinkAnimationTimer < 150) {
      // Show blinking version based on current mouth state
      let blinkTexture = 'blueEnemyMouthClosedBlinking'
      
      if (this.blueEnemyAnimationState === 'bite_partial') {
        blinkTexture = 'blueEnemyMouthPartialOpenBlinking'
      } else if (this.blueEnemyAnimationState === 'bite_full') {
        blinkTexture = 'blueEnemyMouthOpenBlinking'
      }
      
      this.changeBlueEnemyTexture(blinkTexture)
    } else {
      // Return to previous state
      this.blueEnemyAnimationState = 'idle'
      this.blinkAnimationTimer = 0
      // Set next blink time with variation
      this.nextBlinkTime = this.blinkTimer + Math.random() * 1000 + 1000 // 1-2 seconds
    }
  }
  
  private checkForNewAnimations(): void {
    // Check for bite trigger (not while already biting or blinking)
    if (this.biteTimer >= this.nextBiteTime && this.blueEnemyAnimationState === 'idle') {
      this.blueEnemyAnimationState = 'bite_partial'
      this.biteAnimationTimer = 0
    }
    
    // Check for blink trigger (can interrupt any state except ongoing blink)
    if (this.blinkTimer >= this.nextBlinkTime && this.blueEnemyAnimationState !== 'blinking') {
      this.blueEnemyAnimationState = 'blinking'
      this.blinkAnimationTimer = 0
    }
  }
  
  private changeBlueEnemyTexture(textureKey: string): void {
    if (this.scene.textures.exists(textureKey)) {
      this.setTexture(textureKey)
      // Maintain consistent display size and positioning
      this.setDisplaySize(36, 36)
      
      // Update sprite flip based on movement direction
      if (this.catColor === CatColor.BLUE) {
        this.setFlipX(this.direction > 0) // Flip when moving right
      }
    }
  }
}