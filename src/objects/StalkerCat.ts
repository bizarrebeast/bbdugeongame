import GameSettings from "../config/GameSettings"
import { Cat, CatColor } from "./Cat"

export class StalkerCat extends Cat {
  private state: 'hidden' | 'activated' | 'chasing' = 'hidden'
  private triggerDistance: number = 32 // 1 tile away to activate mine
  public playerRef: Phaser.Physics.Arcade.Sprite | null = null
  private originalY: number
  private hasPlayerPassed: boolean = false
  // Remove separate eye sprite - use main sprite with eye-only texture instead
  private mineTimer: number = 0
  private mineDelayDuration: number = 2000 // 2 second delay before chasing
  private currentSpeed: number = 80 * 1.5 // Starting chase speed
  private speedIncrement: number = 5 // Speed increase per update cycle
  private originalScale: number = 1 // Track original scale
  
  // Animation system like other enemies
  private currentEyeState: 'eye1' | 'eye2' | 'eye3' | 'eye4' | 'blink' = 'eye1'
  private eyeAnimationTimer: number = 0
  
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
    
    // Use actual stalker enemy sprite (start with eye1 sprite)
    const initialTexture = scene.textures.exists('stalkerEnemyEye1') ? 'stalkerEnemyEye1' : 'stalkerEnemyEye1'
    this.setTexture(initialTexture)
    this.currentEyeState = 'eye1'
    
    // Set consistent size for stalker sprites using only displaySize
    this.setDisplaySize(30, 30)  // Square stalker size
    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      this.body.setSize(28, 26)  // Custom hitbox for stalker
      this.body.setOffset(1, 48)  // Move visual sprite up 48 pixels
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
    console.log(`  - Sprite position: (${this.x}, ${this.y})`)
    console.log(`  - Body bounds: L=${this.body?.left} R=${this.body?.right} T=${this.body?.top} B=${this.body?.bottom}`)
    console.log(`  - Body offset: (${this.body?.offset.x}, ${this.body?.offset.y})`)
    console.log(`  - Visual sprite appears at: (${this.x}, ${this.y - 48}) [48px up from body due to offset]`)
    
    // No separate eye sprite needed - will use main sprite with eye texture
  }
  
  setPlayerReference(player: Phaser.Physics.Arcade.Sprite): void {
    this.playerRef = player
  }
  
  // No longer needed - using main sprite for eye display
  
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
        this.updateEyeAnimations(delta) // Add eye animations when visible and chasing
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
      
      // Show eyes by making main sprite visible with eye-only texture
      this.setTexture('stalkerEnemyEyeOnly')
      this.setDisplaySize(30, 30) // Same size as full stalker sprite
      this.setVisible(true)
      console.log(`👁️ EYES ACTIVATED:`)
      console.log(`  - Main sprite now showing eye-only texture`)
      console.log(`  - Stalker sprite at: (${this.x}, ${this.y})`)
      console.log(`  - Visual appears at: (${this.x}, ${this.y - 48}) due to offset`)
      console.log(`  - Display size: ${this.displayWidth}x${this.displayHeight}`)
    }
  }
  
  private updateActivated(delta: number): void {
    if (!this.playerRef) return
    
    // Eyes are now the main sprite itself - no separate positioning needed
    // Just ensure it stays visible with eye texture during activation
    this.setVisible(true)
    
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
    console.log(`  - Original spawn Y: ${this.originalY}`)
    
    this.state = 'chasing'
    this.setVisible(true) // Show the full cat
    
    // Switch to full stalker sprite and ensure proper scale and size
    this.setTexture('stalkerEnemyEye1') // Start with eye1 texture for chasing
    this.setScale(1, 1)
    this.setDisplaySize(30, 30)
    this.currentEyeState = 'eye1' // Reset eye animation state
    
    // Update originalY to current position to prevent teleporting
    this.originalY = this.y
    console.log(`  - Updated floor lock to current position: (${this.x}, ${this.originalY})`)
    
    // Enable movement but no gravity - stalker cats just run along the floor
    this.body!.setGravityY(0) // No gravity needed - they stay on their floor
    this.body!.setImmovable(false) // Allow movement
    
    console.log(`🔴💥 AFTER ENABLING PHYSICS:`)
    console.log(`  - Position locked to: (${this.x}, ${this.y})`)
    console.log(`  - Gravity: ${(this.body as Phaser.Physics.Arcade.Body).gravity.y}`)
    console.log(`  - Immovable: ${this.body?.immovable}`)
    console.log(`  - Display size: ${this.displayWidth}x${this.displayHeight}`)
    console.log(`  - Scale: ${this.scaleX}x${this.scaleY}`)
    
    // Reset speed to starting value
    this.currentSpeed = 80 * 1.5
  }
  
  private updateChasing(): void {
    const playerX = this.playerRef!.x
    const playerY = this.playerRef!.y
    
    // Lock Y position to spawn floor to prevent any drift or falling
    this.y = this.originalY
    
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
    // Lock Y position to spawn floor during patrolling too
    this.y = this.originalY
    
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

  private updateEyeAnimations(delta: number): void {
    // Natural eye animation system similar to other enemies
    this.eyeAnimationTimer += delta
    
    // Organic timing with different patterns for different states
    let animationSpeed: number
    
    if (this.currentEyeState === 'blink') {
      // Quick natural blink
      animationSpeed = 100 + Math.random() * 80
    } else {
      // Eye movement timing with organic variation
      const baseTimings = {
        'eye1': 1200, // Up left - comfortable
        'eye2': 1100, // Up right - comfortable  
        'eye3': 1400, // Down left - more extreme
        'eye4': 1600, // Down right - most extreme
      }
      
      const baseTiming = baseTimings[this.currentEyeState as keyof typeof baseTimings] || 1200
      // Add natural variation for organic feel
      animationSpeed = baseTiming + (Math.random() - 0.5) * 800
    }
    
    // Handle eye animation transitions
    if (this.eyeAnimationTimer >= animationSpeed) {
      const randomAction = Math.random()
      
      switch (this.currentEyeState) {
        case 'eye1': // Up left
          if (randomAction < 0.25) {
            this.currentEyeState = 'blink'
            this.changeEyeTexture('stalkerEnemyBlinking')
          } else if (randomAction < 0.55) {
            this.currentEyeState = 'eye2'
            this.changeEyeTexture('stalkerEnemyEye2')
          } else if (randomAction < 0.75) {
            this.currentEyeState = 'eye3'
            this.changeEyeTexture('stalkerEnemyEye3')
          } else {
            this.currentEyeState = 'eye4'
            this.changeEyeTexture('stalkerEnemyEye4')
          }
          break
          
        case 'eye2': // Up right
          if (randomAction < 0.3) {
            this.currentEyeState = 'blink'
            this.changeEyeTexture('stalkerEnemyBlinking')
          } else if (randomAction < 0.60) {
            this.currentEyeState = 'eye1'
            this.changeEyeTexture('stalkerEnemyEye1')
          } else if (randomAction < 0.80) {
            this.currentEyeState = 'eye3'
            this.changeEyeTexture('stalkerEnemyEye3')
          } else {
            this.currentEyeState = 'eye4'
            this.changeEyeTexture('stalkerEnemyEye4')
          }
          break
          
        case 'eye3': // Down left
          if (randomAction < 0.2) {
            this.currentEyeState = 'blink'
            this.changeEyeTexture('stalkerEnemyBlinking')
          } else if (randomAction < 0.45) {
            this.currentEyeState = 'eye1'
            this.changeEyeTexture('stalkerEnemyEye1')
          } else if (randomAction < 0.70) {
            this.currentEyeState = 'eye2'
            this.changeEyeTexture('stalkerEnemyEye2')
          } else {
            this.currentEyeState = 'eye4'
            this.changeEyeTexture('stalkerEnemyEye4')
          }
          break
          
        case 'eye4': // Down right
          if (randomAction < 0.15) {
            this.currentEyeState = 'blink'
            this.changeEyeTexture('stalkerEnemyBlinking')
          } else if (randomAction < 0.40) {
            // Strong tendency to return to comfortable positions
            this.currentEyeState = 'eye1'
            this.changeEyeTexture('stalkerEnemyEye1')
          } else if (randomAction < 0.65) {
            this.currentEyeState = 'eye2'
            this.changeEyeTexture('stalkerEnemyEye2')
          } else {
            this.currentEyeState = 'eye3'
            this.changeEyeTexture('stalkerEnemyEye3')
          }
          break
          
        case 'blink':
          // After blink, return to eye positions with bias toward comfortable ones
          if (randomAction < 0.35) {
            this.currentEyeState = 'eye1'
            this.changeEyeTexture('stalkerEnemyEye1')
          } else if (randomAction < 0.65) {
            this.currentEyeState = 'eye2'
            this.changeEyeTexture('stalkerEnemyEye2')
          } else if (randomAction < 0.80) {
            this.currentEyeState = 'eye3'
            this.changeEyeTexture('stalkerEnemyEye3')
          } else {
            this.currentEyeState = 'eye4'
            this.changeEyeTexture('stalkerEnemyEye4')
          }
          break
      }
      this.eyeAnimationTimer = 0
    }
  }

  private changeEyeTexture(textureKey: string): void {
    if (this.scene.textures.exists(textureKey)) {
      this.setTexture(textureKey)
      this.setDisplaySize(30, 30) // Maintain square stalker size
    }
  }
}