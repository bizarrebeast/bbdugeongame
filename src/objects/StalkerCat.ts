import GameSettings from "../config/GameSettings"
import { Cat, CatColor } from "./Cat"

export class StalkerCat extends Cat {
  private state: 'hidden' | 'activated' | 'chasing' = 'hidden'
  private triggerDistance: number = 32 // 1 tile away to activate mine
  public playerRef: Phaser.Physics.Arcade.Sprite | null = null
  private originalY: number
  private hasPlayerPassed: boolean = false
  private eyesSprite: Phaser.GameObjects.Graphics | null = null
  private mineTimer: number = 0
  private mineDelayDuration: number = 2000 // 2 second delay before chasing
  private currentSpeed: number = 80 * 1.5 // Starting chase speed
  private speedIncrement: number = 5 // Speed increase per update cycle
  private originalScale: number = 1 // Track original scale
  
  constructor(
    scene: Phaser.Scene, 
    x: number, 
    y: number, 
    platformLeft: number, 
    platformRight: number
  ) {
    console.log(`🔴 STALKER CAT CREATION START:`)
    console.log(`  - Position: (${x}, ${y})`)
    console.log(`  - Platform bounds: ${platformLeft} to ${platformRight}`)
    
    super(scene, x, y, platformLeft, platformRight, CatColor.RED)
    
    console.log(`🔴 STALKER CAT AFTER SUPER:`)
    console.log(`  - Current position: (${this.x}, ${this.y})`)
    console.log(`  - Body size: ${this.body?.width}x${this.body?.height}`)
    console.log(`  - Display size: ${this.displayWidth}x${this.displayHeight}`)
    console.log(`  - Scale: ${this.scaleX}x${this.scaleY}`)
    console.log(`  - Gravity Y: ${(this.body as Phaser.Physics.Arcade.Body)?.gravity.y}`)
    
    this.originalY = y
    
    // Create a hidden red stalker cat on the floor
    const graphics = scene.add.graphics()
    graphics.fillStyle(0xff0000, 1) // Red for stalker cat
    graphics.fillCircle(10, 8, 8)
    // Eyes (normal black eyes when hidden)
    graphics.fillStyle(0x000000, 1)
    graphics.fillCircle(6, 6, 2)
    graphics.fillCircle(14, 6, 2)
    // Normal ears
    graphics.fillStyle(0xff0000, 1)
    graphics.fillTriangle(4, 2, 8, 0, 8, 4)
    graphics.fillTriangle(12, 0, 16, 2, 12, 4)
    graphics.generateTexture('red-stalker-cat', 20, 16)
    graphics.destroy()
    
    this.setTexture('red-stalker-cat')
    
    // Override the parent's red enemy sizing - we want stalker to be smaller
    this.setDisplaySize(30, 24)  // Smaller than normal red enemy
    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      this.body.setSize(28, 20)  // Custom hitbox for stalker
      this.body.setOffset(1, 2)  // Adjust offset for proper positioning
    }
    
    console.log(`🔴 STALKER CAT AFTER TEXTURE CHANGE:`)
    console.log(`  - Texture: red-stalker-cat`)
    console.log(`  - Display size: ${this.displayWidth}x${this.displayHeight}`)
    console.log(`  - Body size: ${this.body?.width}x${this.body?.height}`)
    console.log(`  - Scale: ${this.scaleX}x${this.scaleY}`)
    
    // Start completely hidden
    this.setVisible(false)
    this.setVelocity(0, 0)
    this.body!.setGravityY(0) // Disable gravity while hidden
    this.body!.setImmovable(true) // Don't move while hidden
    this.setDepth(15) // Same level as other cats
    
    console.log(`🔴 STALKER CAT FINAL SETUP:`)
    console.log(`  - Visible: ${this.visible}`)
    console.log(`  - Gravity: ${(this.body as Phaser.Physics.Arcade.Body).gravity.y}`)
    console.log(`  - Immovable: ${this.body?.immovable}`)
    console.log(`  - Position: (${this.x}, ${this.y})`)
    console.log(`  - Body bounds: L=${this.body?.left} R=${this.body?.right} T=${this.body?.top} B=${this.body?.bottom}`)
    
    // Create eyes-only sprite for activated state
    this.createEyesSprite()
  }
  
  setPlayerReference(player: Phaser.Physics.Arcade.Sprite): void {
    this.playerRef = player
  }
  
  private createEyesSprite(): void {
    // Create glowing eyes sprite for the activated state
    const eyesGraphics = this.scene.add.graphics()
    eyesGraphics.fillStyle(0xffff00, 1) // Yellow glowing eyes
    eyesGraphics.fillCircle(6, 6, 3) // Slightly larger than normal eyes
    eyesGraphics.fillCircle(14, 6, 3)
    // Add glow effect
    eyesGraphics.fillStyle(0xffff00, 0.3)
    eyesGraphics.fillCircle(6, 6, 5)
    eyesGraphics.fillCircle(14, 6, 5)
    
    this.eyesSprite = eyesGraphics
    // Position eyes exactly at the cat's position
    this.eyesSprite.setPosition(this.x - 10, this.y - 8)
    this.eyesSprite.setVisible(false)
    this.eyesSprite.setDepth(16)
  }
  
  update(time: number, delta: number): void {
    if (this.isSquished || !this.playerRef) return
    
    switch (this.state) {
      case 'hidden':
        this.updateHidden()
        break
      case 'activated':
        this.updateActivated(delta)
        break
      case 'chasing':
        this.updateChasing()
        break
    }
  }
  
  private updateHidden(): void {
    if (!this.playerRef) return
    
    const playerX = this.playerRef.x
    const playerY = this.playerRef.y
    const distanceToPlayer = Math.abs(playerX - this.x)
    
    // Check if player is on same floor (within 40 pixels vertically)
    const onSameFloor = Math.abs(playerY - this.y) < 40
    
    // Check if player has passed the cat (walked past it within trigger distance)
    if (onSameFloor && distanceToPlayer <= this.triggerDistance && !this.hasPlayerPassed) {
      console.log(`🔴👁️ STALKER CAT ACTIVATED!`)
      console.log(`  - Player distance: ${distanceToPlayer}`)
      console.log(`  - Trigger distance: ${this.triggerDistance}`)
      console.log(`  - Cat position: (${this.x}, ${this.y})`)
      console.log(`  - Player position: (${playerX}, ${playerY})`)
      
      // Player walked past - activate mine timer
      this.state = 'activated'
      this.mineTimer = this.mineDelayDuration
      this.hasPlayerPassed = true
      
      // Show eyes immediately when activated
      if (this.eyesSprite) {
        this.eyesSprite.setPosition(this.x - 10, this.y - 8)
        this.eyesSprite.setVisible(true)
        console.log(`  - Eyes shown at: (${this.eyesSprite.x}, ${this.eyesSprite.y})`)
      }
    }
  }
  
  private updateActivated(delta: number): void {
    if (!this.playerRef) return
    
    // Keep eyes positioned correctly and visible
    if (this.eyesSprite) {
      this.eyesSprite.setPosition(this.x - 10, this.y - 8)
      this.eyesSprite.setVisible(true)
    }
    
    // Count down the mine timer
    this.mineTimer -= delta
    
    if (this.mineTimer <= 0) {
      // Timer finished - pop out!
      this.popOut()
    }
  }
  
  private popOut(): void {
    console.log(`🔴💥 STALKER CAT POPPING OUT!`)
    console.log(`  - Current position: (${this.x}, ${this.y})`)
    console.log(`  - Current scale: ${this.scaleX}x${this.scaleY}`)
    console.log(`  - Display size BEFORE: ${this.displayWidth}x${this.displayHeight}`)
    console.log(`  - Body size BEFORE: ${this.body?.width}x${this.body?.height}`)
    
    this.state = 'chasing'
    this.setVisible(true) // Show the full cat
    
    // Hide the eyes-only sprite
    if (this.eyesSprite) {
      this.eyesSprite.setVisible(false)
    }
    
    // Enable movement but no gravity - stalker cats just run along the floor
    this.body!.setGravityY(0) // No gravity needed - they stay on their floor
    this.body!.setImmovable(false) // Allow movement
    
    console.log(`🔴💥 AFTER ENABLING PHYSICS:`)
    console.log(`  - Gravity: ${(this.body as Phaser.Physics.Arcade.Body).gravity.y}`)
    console.log(`  - Immovable: ${this.body?.immovable}`)
    console.log(`  - Body bounds: L=${this.body?.left} R=${this.body?.right} T=${this.body?.top} B=${this.body?.bottom}`)
    
    // Reset speed to starting value
    this.currentSpeed = 80 * 1.5
    
    // Store original size before animation
    const origScaleX = this.scaleX
    const origScaleY = this.scaleY
    
    // Pop out animation - scale up then return to original
    console.log(`🔴💥 STARTING POP ANIMATION (scale to 1.5x original, then back)`)
    this.scene.tweens.add({
      targets: this,
      scaleX: origScaleX * 1.5,
      scaleY: origScaleY * 1.5,
      duration: 100,
      ease: 'Power2',
      yoyo: true,
      onComplete: () => {
        // Ensure we return to exactly the original scale
        this.setScale(origScaleX, origScaleY)
        console.log(`🔴💥 POP ANIMATION COMPLETE:`)
        console.log(`  - Final scale: ${this.scaleX}x${this.scaleY}`)
        console.log(`  - Final display size: ${this.displayWidth}x${this.displayHeight}`)
        console.log(`  - Final body size: ${this.body?.width}x${this.body?.height}`)
        console.log(`  - Final position: (${this.x}, ${this.y})`)
      }
    })
  }
  
  private updateChasing(): void {
    const playerX = this.playerRef!.x
    const playerY = this.playerRef!.y
    
    // No gravity - stalker cats stay on their floor
    // this.body!.setGravityY(0) // Already set to 0, no need to keep setting it
    
    const floorDifference = Math.abs(playerY - this.y)
    
    // Check if player is on same floor (within 50 pixels vertically)
    if (floorDifference < 50) {
      // Same floor - chase the player with increasing speed
      this.currentSpeed += this.speedIncrement * 0.01 // Slow increase per frame
      const maxSpeed = 80 * 2.25 // Cap the speed at 2.25x base speed (180)
      if (this.currentSpeed > maxSpeed) {
        this.currentSpeed = maxSpeed
      }
      
      const direction = playerX > this.x ? 1 : -1
      
      // Check world boundaries
      const worldWidth = 24 * 32
      if ((direction === 1 && this.x >= worldWidth - 20) ||
          (direction === -1 && this.x <= 20)) {
        this.setVelocityX(0)
        return
      }
      
      // Chase aggressively
      this.direction = direction
      this.setVelocityX(this.currentSpeed * direction)
    } else {
      // Different floor - patrol back and forth
      this.updatePatrolling(16) // Pass delta as patrol uses it
    }
  }
  
  
  private updatePatrolling(delta: number): void {
    // Patrol like a yellow cat - slow speed with random movement
    this.randomMoveTimer -= delta
    
    if (this.randomMoveTimer <= 0) {
      if (Math.random() < 0.3) {
        this.direction = Math.random() < 0.5 ? -1 : 1
      }
      this.randomMoveTimer = 500 + Math.random() * 1000
    }
    
    // Check platform boundaries
    if (this.x <= this.platformBounds.left + 10) {
      this.direction = 1
    } else if (this.x >= this.platformBounds.right - 10) {
      this.direction = -1
    }
    
    // Move at yellow cat speed
    const patrolSpeed = 80 * 0.6
    this.setVelocityX(patrolSpeed * this.direction)
  }
  
  getState(): string {
    return this.state
  }
  
  canDamagePlayer(): boolean {
    // Red stalker cats can only damage the player after popping out
    return this.state === 'chasing'
  }
  
  // Override squish - red cats can always be squished
  squish(): void {
    super.squish()
  }
}