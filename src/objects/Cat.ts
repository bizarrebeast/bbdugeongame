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
  private gapDetectionCooldown: number = 0
  private collisionCooldown: number = 0
  private debugGraphics: Phaser.GameObjects.Graphics | null = null
  private debugUpdateHandler: (() => void) | null = null
  
  // Blue enemy animation system
  private yellowEnemyAnimationState: 'mouthClosed' | 'mouthOpen' | 'blinking' = 'mouthClosed'
  private blueEnemyAnimationState: 'idle' | 'bite_partial' | 'bite_full' | 'blinking' = 'idle'
  private biteTimer: number = 0
  private blinkTimer: number = 0
  private biteAnimationTimer: number = 0
  private blinkAnimationTimer: number = 0
  private nextExpressionTime: number = 0
  private nextBiteTime: number = 0
  private nextBlinkTime: number = 0
  
  // Red enemy animation system
  private redEnemyAnimationState: 'patrol' | 'bite_starting' | 'bite_opening' | 'bite_wide' | 'bite_closing' = 'patrol'
  private redBiteTimer: number = 0
  private redBlinkTimer: number = 0
  private redBiteSequenceTimer: number = 0
  private redEyeState: 1 | 2 = 1
  private nextRedBiteTime: number = 0
  private nextRedBlinkTime: number = 0
  private redBiteFrameIndex: number = 0
  
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
      // For yellow enemies, prioritize animation sprites
      if (scene.textures.exists('yellowEnemyMouthClosedEyeOpen')) {
        textureKey = 'yellowEnemyMouthClosedEyeOpen' // Start with mouth closed
      } else if (scene.textures.exists('yellowEnemy')) {
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
      // For red enemies, use the animated sprites (start with mouth closed eyes 1)
      if (scene.textures.exists('redEnemyMouthClosedEyes1')) {
        textureKey = 'redEnemyMouthClosedEyes1'
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
    
    // Extra logging for green enemies to track creation and physics
    if (catColor === CatColor.GREEN) {
      console.log(`🟢 GREEN ENEMY CREATION DEBUG:`)
      console.log(`  - Texture key: ${textureKey}`)
      console.log(`  - Using sprite: ${this.isEnemySprite(textureKey)}`)
      console.log(`  - Position: (${x}, ${y})`)
    }
    
    // Apply enemy hitbox sizing AFTER physics body is created
    if (catColor === CatColor.BLUE && this.body instanceof Phaser.Physics.Arcade.Body) {
      console.log(`🚀 STEP 5A: Setting blue enemy hitbox to 30x20...`)
      this.body.setSize(30, 20)
      console.log(`🚀 STEP 5B: Blue enemy (${textureKey}) hitbox SET, actual size: ${this.body.width}x${this.body.height}`)
    } else if (catColor === CatColor.RED && this.body instanceof Phaser.Physics.Arcade.Body) {
      this.body.setSize(32, 32)
    } else if (catColor === CatColor.GREEN && this.body instanceof Phaser.Physics.Arcade.Body) {
      console.log(`🟢 GREEN ENEMY HITBOX DEBUG:`)
      console.log(`  - Sprite size: 36x36 pixels`)
      console.log(`  - Default body size before adjustment: ${this.body.width}x${this.body.height}`)
      console.log(`  - Keeping default hitbox for bouncing mechanics`)
      console.log(`  - FINAL GREEN ENEMY HITBOX: ${this.body.width}x${this.body.height}`)
      console.log(`  - Body position: (${this.body.x}, ${this.body.y})`)
      console.log(`  - Sprite position: (${this.x}, ${this.y})`)
      console.log(`  - Offset: (${this.body.offset.x}, ${this.body.offset.y})`)
      console.log(`  - Gravity enabled: ${this.body.allowGravity}`)
      console.log(`  - World bounds collision: ${this.body.collideWorldBounds}`)
    } else if (this.body instanceof Phaser.Physics.Arcade.Body) {
      console.log(`🚀 STEP 5C: ${catColor} enemy (${textureKey}) keeping default hitbox: ${this.body.width}x${this.body.height}`)
    }
    
    this.setCollideWorldBounds(true)
    this.setBounce(0)
    
    // Only green enemies (bouncing) need gravity
    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      if (catColor !== CatColor.GREEN) {
        this.body.setAllowGravity(false) // Blue, Yellow, Red patrol without gravity
      } else {
        // Green enemies keep gravity for bouncing behavior
        console.log(`🟢 GREEN ENEMY PHYSICS SETUP:`)
        console.log(`  - Gravity enabled: ${this.body.allowGravity}`)
        console.log(`  - World bounds collision: ${this.body.collideWorldBounds}`)
        console.log(`  - Initial velocity: (${this.body.velocity.x}, ${this.body.velocity.y})`)
      }
    }
    
    // Set up hitbox and visual alignment
    if (catColor === CatColor.YELLOW && this.isYellowEnemyAnimationSprite(textureKey)) {
      // For all yellow enemy animation sprites - use 60x24 size
      this.setDisplaySize(60, 24)
      this.setOffset(3, -5) // Increased by 1 pixel (-6 + 1 = -5)
      this.setFlipX(false)
      this.initializeYellowEnemyAnimations()
      this.addDebugVisualization()
    } else if (catColor === CatColor.BLUE && this.isBlueEnemyAnimationSprite(textureKey)) {
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
    } else if (catColor === CatColor.RED && this.isRedEnemyAnimationSprite(textureKey)) {
      // For red enemy animation sprites - fine-tuned positioning
      this.setDisplaySize(52, 52) // Larger sprite size (52x52)
      this.setOffset(3, 44) // Decreased Y offset by 2 pixels (46 - 2 = 44)
      this.setFlipX(false)
      this.initializeRedEnemyAnimations()
      this.addDebugVisualization()
    } else if (this.isEnemySprite(textureKey)) {
      // For sprite-based enemies (yellow, green, red), use proper sizing similar to blue enemies
      if (catColor === CatColor.YELLOW) {
        // Make yellow enemies 3x wider
        this.setDisplaySize(108, 36) // 3x width (36 * 3 = 108)
        this.setOffset(3, 45)
      } else if (catColor === CatColor.GREEN) {
        // Green enemies with adjusted positioning
        this.setDisplaySize(36, 36)
        this.setOffset(3, -3) // Decreased by 48 pixels total (45 - 24 - 16 - 8 = -3)
      } else {
        // Red enemies keep normal sizing
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
    
    // Update collision cooldown for all enemy types
    this.collisionCooldown -= delta
    
    // Movement logging temporarily disabled to see creation logs
    
    switch (this.catColor) {
      case CatColor.BLUE:
        this.updateBluePatrol()
        this.updateBlueEnemyAnimations(delta)
        break
      case CatColor.YELLOW:
        this.updateYellowPatrol(delta)
        this.updateYellowEnemyAnimations(delta)
        break
      case CatColor.GREEN:
        this.updateGreenBounce(delta)
        break
      case CatColor.RED:
        this.updateRedPatrol()
        this.updateRedEnemyAnimations(delta)
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
    
    // Flip sprite based on direction for yellow enemies with animation sprites
    if (this.isYellowEnemyAnimationSprite(this.texture.key)) {
      this.setFlipX(this.direction === 1) // Flip when going right (direction = 1)
    }
  }
  
  private updateGreenBounce(delta: number): void {
    
    this.bounceTimer -= delta
    
    if (this.bounceTimer <= 0 && this.body?.touching.down) {
      this.setVelocityY(-200)
      this.bounceTimer = 800 + Math.random() * 400
    }
    
    // Simplified movement - just use platform bounds for now
    // Green enemies travel the full width of their platform section
    
    // Green cats travel the full width of their platform section (like original logic)
    if (this.x <= this.platformBounds.left + 5) {
      this.direction = 1
    } else if (this.x >= this.platformBounds.right - 5) {
      this.direction = -1
    }
    
    this.setVelocityX(this.moveSpeed * this.direction)
  }
  
  private updateRedPatrol(): void {
    // Red enemies use strict platform bounds to prevent falling through gaps
    const edgeBuffer = 25 // Larger buffer to prevent getting too close to edges
    
    // Strong platform bounds checking similar to green enemies
    if (this.x <= this.platformBounds.left + edgeBuffer) {
      this.direction = 1
      // Force position if too close to edge
      if (this.x <= this.platformBounds.left + 5) {
        this.setX(this.platformBounds.left + 5)
      }
    } else if (this.x >= this.platformBounds.right - edgeBuffer) {
      this.direction = -1
      // Force position if too close to edge
      if (this.x >= this.platformBounds.right - 5) {
        this.setX(this.platformBounds.right - 5)
      }
    }
    
    // Reduced random direction changes to prevent erratic movement near edges
    if (Math.random() < 0.0005) { // 0.05% chance per frame = less frequent direction changes
      // Only reverse if not near edges
      if (this.x > this.platformBounds.left + edgeBuffer && this.x < this.platformBounds.right - edgeBuffer) {
        this.direction *= -1
      }
    }
    
    // Strict safety check: if red enemy is outside safe bounds, immediately constrain
    if (this.x < this.platformBounds.left + 5 || this.x > this.platformBounds.right - 5) {
      const constrainedX = Math.max(this.platformBounds.left + 5, Math.min(this.platformBounds.right - 5, this.x))
      this.setX(constrainedX)
      this.direction *= -1 // Reverse direction when constrained
    }
    
    this.setVelocityX(this.moveSpeed * this.direction)
  }
  
  reverseDirection(): void {
    if (this.isSquished) return
    
    // Only reverse if not in collision cooldown (prevents rapid bouncing)
    if (this.collisionCooldown <= 0) {
      this.direction *= -1
      this.setVelocityX(this.moveSpeed * this.direction)
      
      // Set collision cooldown to prevent immediate re-collision
      this.collisionCooldown = 200 // 200ms cooldown
      
      // Update sprite flip for blue enemy
      if (this.catColor === CatColor.BLUE) {
        this.setFlipX(this.direction > 0) // Flip when moving right
      }
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
  
  private isYellowEnemyAnimationSprite(textureKey: string): boolean {
    return [
      'yellowEnemyMouthOpenEyeOpen',
      'yellowEnemyMouthOpenBlinking',
      'yellowEnemyMouthClosedEyeOpen',
      'yellowEnemyMouthClosedBlinking'
    ].includes(textureKey)
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
  
  private initializeYellowEnemyAnimations(): void {
    // Set random initial timers to make enemies feel unique
    this.nextBlinkTime = Math.random() * 1000 + 1000 // 1-2 seconds
    this.nextExpressionTime = Math.random() * 3000 + 3000 // 3-6 seconds
    this.yellowEnemyAnimationState = 'mouthClosed'
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
  
  // ============== RED ENEMY ANIMATION SYSTEM ==============
  
  private isRedEnemyAnimationSprite(textureKey: string): boolean {
    return [
      'redEnemyMouthClosedEyes1',
      'redEnemyMouthClosedEyes2',
      'redEnemyMouthClosedBlinking',
      'redEnemyMouthPartialOpenEyes1Wink',
      'redEnemyMouthPartialOpenEyes2',
      'redEnemyMouthWideOpenEyes1Wink',
      'redEnemyMouthWideOpenEyes2',
      'redEnemyMouthWideOpenEyes3'
    ].includes(textureKey)
  }
  
  private initializeRedEnemyAnimations(): void {
    // Set random initial timers to make enemies feel unique
    this.nextRedBiteTime = Math.random() * 2000 + 3000 // 3-5 seconds for bite
    this.nextRedBlinkTime = Math.random() * 500 + 1000 // 1-1.5 seconds for blink
    this.redEnemyAnimationState = 'patrol'
    this.redEyeState = Math.random() < 0.5 ? 1 : 2 // Start with random eye state
  }
  
  private updateYellowEnemyAnimations(delta: number): void {
    // Only animate if using the new animation sprites
    if (!this.isYellowEnemyAnimationSprite(this.texture.key)) {
      return
    }
    
    // Update timers
    this.blinkTimer += delta
    this.biteTimer += delta // Reusing for expression changes
    this.blinkAnimationTimer += delta
    
    // Handle blinking animation
    if (this.yellowEnemyAnimationState === 'blinking') {
      if (this.blinkAnimationTimer >= 200) { // 200ms blink
        // Return to previous state (mouth open or closed)
        this.yellowEnemyAnimationState = this.biteTimer >= this.nextExpressionTime ? 'mouthOpen' : 'mouthClosed'
        this.blinkAnimationTimer = 0
        this.nextBlinkTime = this.blinkTimer + Math.random() * 1000 + 1000 // 1-2 seconds
      }
    }
    
    // Handle expression changes (mouth open/closed)
    if (this.biteTimer >= this.nextExpressionTime && this.yellowEnemyAnimationState !== 'blinking') {
      this.yellowEnemyAnimationState = this.yellowEnemyAnimationState === 'mouthClosed' ? 'mouthOpen' : 'mouthClosed'
      this.nextExpressionTime = this.biteTimer + Math.random() * 3000 + 3000 // 3-6 seconds
    }
    
    // Handle random blinking
    if (this.blinkTimer >= this.nextBlinkTime && this.yellowEnemyAnimationState !== 'blinking') {
      this.yellowEnemyAnimationState = 'blinking'
      this.blinkAnimationTimer = 0
    }
    
    // Set appropriate texture based on current state
    let newTexture = 'yellowEnemyMouthClosedEyeOpen'
    if (this.yellowEnemyAnimationState === 'blinking') {
      newTexture = this.biteTimer >= this.nextExpressionTime ? 'yellowEnemyMouthOpenBlinking' : 'yellowEnemyMouthClosedBlinking'
    } else if (this.yellowEnemyAnimationState === 'mouthOpen') {
      newTexture = 'yellowEnemyMouthOpenEyeOpen'
    }
    
    if (this.texture.key !== newTexture) {
      this.setTexture(newTexture)
    }
  }
  
  private updateRedEnemyAnimations(delta: number): void {
    // Only animate if using the red animation sprites
    if (!this.isRedEnemyAnimationSprite(this.texture.key)) {
      return
    }
    
    // Update timers
    this.redBiteTimer += delta
    this.redBlinkTimer += delta
    this.redBiteSequenceTimer += delta
    
    // Handle current animation state
    switch (this.redEnemyAnimationState) {
      case 'patrol':
        this.handleRedPatrolState()
        break
      case 'bite_starting':
        this.handleRedBiteStartingState()
        break
      case 'bite_opening':
        this.handleRedBiteOpeningState()
        break
      case 'bite_wide':
        this.handleRedBiteWideState()
        break
      case 'bite_closing':
        this.handleRedBiteClosingState()
        break
    }
    
    // Check for new animation triggers
    this.checkForRedAnimationTriggers()
  }
  
  private handleRedPatrolState(): void {
    // Cycle between two eye states during patrol
    const eyeCycleTime = 800 + Math.random() * 400 // 0.8-1.2 seconds
    
    if (this.redBiteSequenceTimer >= eyeCycleTime) {
      // Switch eye state
      this.redEyeState = this.redEyeState === 1 ? 2 : 1
      this.redBiteSequenceTimer = 0
    }
    
    // Use appropriate eye state
    this.changeRedEnemyTexture(this.redEyeState === 1 ? 'redEnemyMouthClosedEyes1' : 'redEnemyMouthClosedEyes2')
  }
  
  private handleRedBiteStartingState(): void {
    if (this.redBiteSequenceTimer < 80) {
      // Start bite with partial open
      this.changeRedEnemyTexture('redEnemyMouthPartialOpenEyes2')
    } else {
      // Move to opening phase
      this.redEnemyAnimationState = 'bite_opening'
      this.redBiteSequenceTimer = 0
      this.redBiteFrameIndex = 0
    }
  }
  
  private handleRedBiteOpeningState(): void {
    if (this.redBiteSequenceTimer < 100) {
      // Show partial open with wink variation
      this.changeRedEnemyTexture('redEnemyMouthPartialOpenEyes1Wink')
    } else {
      // Move to wide open phase
      this.redEnemyAnimationState = 'bite_wide'
      this.redBiteSequenceTimer = 0
      this.redBiteFrameIndex = 0
    }
  }
  
  private handleRedBiteWideState(): void {
    const wideFrames = ['redEnemyMouthWideOpenEyes1Wink', 'redEnemyMouthWideOpenEyes2', 'redEnemyMouthWideOpenEyes3']
    const frameTime = 120 // Each wide frame lasts 120ms
    
    const currentFrameIndex = Math.floor(this.redBiteSequenceTimer / frameTime)
    
    if (currentFrameIndex < wideFrames.length) {
      this.changeRedEnemyTexture(wideFrames[currentFrameIndex])
    } else {
      // Move to closing phase
      this.redEnemyAnimationState = 'bite_closing'
      this.redBiteSequenceTimer = 0
    }
  }
  
  private handleRedBiteClosingState(): void {
    if (this.redBiteSequenceTimer < 80) {
      // Close through partial
      this.changeRedEnemyTexture('redEnemyMouthPartialOpenEyes2')
    } else {
      // Return to patrol
      this.redEnemyAnimationState = 'patrol'
      this.redBiteSequenceTimer = 0
      // Set next bite time with variation
      this.nextRedBiteTime = this.redBiteTimer + Math.random() * 2000 + 3000 // 3-5 seconds
    }
  }
  
  private checkForRedAnimationTriggers(): void {
    // Check for bite trigger (not while already biting)
    if (this.redBiteTimer >= this.nextRedBiteTime && this.redEnemyAnimationState === 'patrol') {
      this.redEnemyAnimationState = 'bite_starting'
      this.redBiteSequenceTimer = 0
    }
    
    // Check for blink trigger (independent of bite state)
    if (this.redBlinkTimer >= this.nextRedBlinkTime) {
      // Quick blink during any state (but don't interrupt bite sequence visually)
      if (this.redEnemyAnimationState === 'patrol') {
        // Only show blink during patrol state to not interfere with bite
        this.changeRedEnemyTexture('redEnemyMouthClosedBlinking')
        
        // Schedule return to normal state
        this.scene.time.delayedCall(150, () => {
          if (this.redEnemyAnimationState === 'patrol') {
            this.changeRedEnemyTexture(this.redEyeState === 1 ? 'redEnemyMouthClosedEyes1' : 'redEnemyMouthClosedEyes2')
          }
        })
      }
      
      // Set next blink time
      this.nextRedBlinkTime = this.redBlinkTimer + Math.random() * 1000 + 1000 // 1-2 seconds
    }
  }
  
  private changeRedEnemyTexture(textureKey: string): void {
    if (this.scene.textures.exists(textureKey)) {
      this.setTexture(textureKey)
      // Maintain consistent display size and positioning
      this.setDisplaySize(52, 52) // Maintain larger 52x52 size
      
      // Update sprite flip based on movement direction
      if (this.catColor === CatColor.RED) {
        this.setFlipX(this.direction > 0) // Flip when moving right
      }
    }
  }
}