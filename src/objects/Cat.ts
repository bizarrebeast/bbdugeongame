import GameSettings from "../config/GameSettings"

export enum CatColor {
  BLUE = 'blue',
  YELLOW = 'yellow',
  GREEN = 'green'
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
  
  constructor(
    scene: Phaser.Scene, 
    x: number, 
    y: number, 
    platformLeft: number, 
    platformRight: number,
    color?: CatColor
  ) {
    const colors = [CatColor.BLUE, CatColor.YELLOW, CatColor.GREEN]
    const catColor = color || colors[Math.floor(Math.random() * colors.length)]
    
    // Use the new sprite for blue enemies, generate texture for others
    let textureKey: string
    
    if (catColor === CatColor.BLUE) {
      // For blue enemies, prefer the loaded sprite, fallback to generated
      if (scene.textures.exists('blueEnemy')) {
        textureKey = 'blueEnemy'
        super(scene, x, y, textureKey)
      } else {
        // Use generated texture as fallback
        textureKey = `cat-${catColor}`
        this.generateFallbackTexture(scene, catColor)
        super(scene, x, y, textureKey)
      }
    } else {
      // For other colors, always use generated texture
      textureKey = `cat-${catColor}`
      this.generateFallbackTexture(scene, catColor)
      super(scene, x, y, textureKey)
    }
    
    this.catColor = catColor
    
    scene.add.existing(this)
    scene.physics.add.existing(this)
    
    // === DETAILED DEBUG LOGGING START ===
    console.log(`🚀 STEP 1: Created ${catColor} enemy at (${x}, ${y}) with texture: ${textureKey}`)
    console.log(`🚀 STEP 2: Enemy spawn Y is ${y < 0 ? 'NEGATIVE' : 'positive'} - this ${y < 0 ? 'IS A PROBLEM' : 'looks good'}`)
    console.log(`🚀 STEP 3: Texture exists check - blueEnemy: ${scene.textures.exists('blueEnemy')}, defaultEnemy: ${scene.textures.exists('defaultEnemy')}, scene has assetPool: ${!!(scene as any).assetPool}`)
    
    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      console.log(`🚀 STEP 4: Initial physics body size: ${this.body.width}x${this.body.height}`)
    }
    
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
    if (catColor === CatColor.BLUE && textureKey === 'blueEnemy') {
      // For the new blue enemy sprite
      this.setDisplaySize(36, 36) // Reduced by 12 pixels (was 48)
      
      // Hitbox sizing is handled after physics body creation above
      
      // Position hitbox with visual offset to keep sprite elevated
      // We want the visual to appear elevated above the hitbox like before
      // Keeping the same visual offset but adjusting for new hitbox size
      // Visual is 36px tall, hitbox is 20px tall  
      // Offset blue enemies up by 2 pixels from previous position (43 + 2 = 45)
      this.setOffset(3, 45) // Center horizontally (3px), visual offset adjusted up 2px
      
      // The image shows enemy facing left, which is our default
      this.setFlipX(false)
      
      // Add debug visualization
      this.addDebugVisualization()
      
      // Debug: Log basic position info
      console.log(`🚀 STEP 6A: Blue Enemy spawned at Y: ${y}, using sprite texture`)
      if (this.body instanceof Phaser.Physics.Arcade.Body) {
        console.log(`🚀 STEP 6B: Blue enemy final hitbox size: ${this.body.width}x${this.body.height}`)
      }
    } else if (catColor !== CatColor.BLUE) {
      // Original settings for non-blue colors only
      console.log(`🚀 STEP 6C: Setting non-blue enemy hitbox to 18x14...`)
      this.setSize(18, 14)
      this.setOffset(1, 1)
      if (this.body instanceof Phaser.Physics.Arcade.Body) {
        console.log(`🚀 STEP 6D: Non-blue enemy final hitbox: ${this.body.width}x${this.body.height}`)
      }
    } else {
      // Blue enemy using fallback texture - keep the 30x20 hitbox we set above
      console.log(`🚀 STEP 6E: Blue enemy using fallback texture, keeping 30x20 hitbox`)
      if (this.body instanceof Phaser.Physics.Arcade.Body) {
        console.log(`🚀 STEP 6F: Blue fallback enemy final hitbox: ${this.body.width}x${this.body.height}`)
      }
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
    }
  }
  
  update(time: number, delta: number): void {
    if (this.isSquished) return
    
    // Movement logging temporarily disabled to see creation logs
    
    switch (this.catColor) {
      case CatColor.BLUE:
        this.updateBluePatrol()
        break
      case CatColor.YELLOW:
        this.updateYellowPatrol(delta)
        break
      case CatColor.GREEN:
        this.updateGreenBounce(delta)
        break
    }
  }
  
  private updateBluePatrol(): void {
    if (this.x <= this.platformBounds.left + 10) {
      this.direction = 1
      // Flip sprite when moving right (image faces left by default)
      if (this.texture.key === 'blueEnemy') {
        this.setFlipX(true) // Flip when moving right
      }
    } else if (this.x >= this.platformBounds.right - 10) {
      this.direction = -1
      // Don't flip when moving left (default orientation)
      if (this.texture.key === 'blueEnemy') {
        this.setFlipX(false) // No flip when moving left
      }
    }
    
    this.setVelocityX(this.moveSpeed * this.direction)
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
  
  reverseDirection(): void {
    if (this.isSquished) return
    this.direction *= -1
    this.setVelocityX(this.moveSpeed * this.direction)
    
    // Update sprite flip for blue enemy
    if (this.catColor === CatColor.BLUE && this.texture.key === 'blueEnemy') {
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
          
          // Draw text labels - FORCE REFRESH hitbox dimensions
          const currentWidth = this.body ? (this.body as Phaser.Physics.Arcade.Body).width : body.width
          const currentHeight = this.body ? (this.body as Phaser.Physics.Arcade.Body).height : body.height
          const debugText = this.scene.add.text(
            this.x,
            this.y - visualHeight/2 - 20,
            `Visual: ${Math.round(visualWidth)}x${Math.round(visualHeight)}\nHitbox: ${Math.round(currentWidth)}x${Math.round(currentHeight)} [${this.catColor}]`,
            {
              fontSize: '10px',
              color: '#ffffff',
              backgroundColor: '#000000',
              padding: { x: 2, y: 2 }
            }
          ).setOrigin(0.5).setDepth(100)
          
          // Remove text after one frame
          this.scene.time.delayedCall(16, () => {
            if (debugText) debugText.destroy()
          })
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
  
  private generateFallbackTexture(scene: Phaser.Scene, catColor: CatColor): void {
    const colorMap = {
      [CatColor.BLUE]: 0x4169e1,
      [CatColor.YELLOW]: 0xffd700,
      [CatColor.GREEN]: 0x32cd32
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
}