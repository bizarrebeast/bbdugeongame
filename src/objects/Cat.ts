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
    if (catColor === CatColor.BLUE && scene.textures.exists('blueEnemy')) {
      super(scene, x, y, 'blueEnemy')
    } else {
      // Fallback to generated texture for other colors or if sprite not loaded
      const colorMap = {
        [CatColor.BLUE]: 0x4169e1,
        [CatColor.YELLOW]: 0xffd700,
        [CatColor.GREEN]: 0x32cd32
      }
      
      const graphics = scene.add.graphics()
      graphics.fillStyle(colorMap[catColor], 1)
      graphics.fillCircle(10, 8, 8)
      graphics.fillStyle(0x000000, 1)
      graphics.fillCircle(6, 6, 2)
      graphics.fillCircle(14, 6, 2)
      graphics.fillStyle(colorMap[catColor], 1)
      graphics.fillTriangle(4, 2, 8, 0, 8, 4)
      graphics.fillTriangle(12, 0, 16, 2, 12, 4)
      graphics.generateTexture(`cat-${catColor}`, 20, 16)
      graphics.destroy()
      
      super(scene, x, y, `cat-${catColor}`)
    }
    
    this.catColor = catColor
    
    scene.add.existing(this)
    scene.physics.add.existing(this)
    
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
    if (catColor === CatColor.BLUE && scene.textures.exists('blueEnemy')) {
      // For the new blue enemy sprite
      this.setDisplaySize(36, 36) // Reduced by 12 pixels (was 48)
      this.setSize(20, 16) // Hitbox size
      
      // Position hitbox with visual offset 39px up (36 + 3 more)
      // Visual is 36px tall, hitbox is 16px tall
      // We want the visual to appear 39px higher than default
      // Offset moves the physics body relative to the sprite
      // To move visual up by 39px, we move physics body down by 39px
      // Original offset was 10, add 39 = 49
      this.setOffset(8, 49) // Center horizontally, move hitbox down 49px to lift visual up 39px
      
      // The image shows enemy facing left, which is our default
      this.setFlipX(false)
      
      // Add debug visualization
      this.addDebugVisualization()
      
      // Debug: Log position info to understand floor alignment
      console.log('Blue Enemy Debug:', {
        spriteY: y,
        visualHeight: 36,
        hitboxHeight: 16,
        offset: 10,
        bottomOfSprite: y + 18, // Half of visual height
        bottomOfHitbox: y + 10 + 8 // Offset + half hitbox height
      })
    } else {
      // Original settings for other colors
      this.setSize(18, 14)
      this.setOffset(1, 1)
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
    
    const graphics = this.scene.add.graphics()
    
    // Update graphics position in update loop
    this.scene.events.on('postupdate', () => {
      if (graphics && graphics.active && this.active) {
        graphics.clear()
        
        // Draw visual sprite bounds (blue rectangle)
        graphics.lineStyle(2, 0x0000ff, 0.8) // Blue for visual bounds
        const visualWidth = this.displayWidth
        const visualHeight = this.displayHeight
        graphics.strokeRect(
          this.x - visualWidth/2,
          this.y - visualHeight/2,
          visualWidth,
          visualHeight
        )
        
        // Draw center cross (white)
        graphics.lineStyle(1, 0xffffff, 0.8)
        graphics.lineBetween(this.x - 5, this.y, this.x + 5, this.y) // Horizontal
        graphics.lineBetween(this.x, this.y - 5, this.x, this.y + 5) // Vertical
        
        // Draw hitbox (red rectangle) - this is in addition to Phaser's green debug
        const body = this.body as Phaser.Physics.Arcade.Body
        graphics.lineStyle(2, 0xff0000, 0.8) // Red for hitbox
        graphics.strokeRect(
          body.x,
          body.y,
          body.width,
          body.height
        )
        
        // Draw text labels
        const debugText = this.scene.add.text(
          this.x,
          this.y - visualHeight/2 - 20,
          `Visual: ${Math.round(visualWidth)}x${Math.round(visualHeight)}\nHitbox: ${Math.round(body.width)}x${Math.round(body.height)}`,
          {
            fontSize: '10px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 2, y: 2 }
          }
        ).setOrigin(0.5).setDepth(100)
        
        // Remove text after one frame
        this.scene.time.delayedCall(16, () => {
          debugText.destroy()
        })
      }
    })
    
    graphics.setDepth(25) // Above enemy but below UI
    this.scene.add.existing(graphics)
  }
  
  private addRoundedHitboxVisualization(): void {
    // Removed - replaced with addDebugVisualization
  }
}