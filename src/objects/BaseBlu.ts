import GameSettings from '../config/GameSettings'

export class BaseBlu extends Phaser.Physics.Arcade.Sprite {
  private movementSpeed: number = 20 // Very slow patrol speed
  private direction: number = 1 // 1 for right, -1 for left
  private isPushing: boolean = false // Whether currently pushing/blocking player
  private platform: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | null = null
  private platformLeft: number = 0
  private platformRight: number = 0
  private debugRect: Phaser.GameObjects.Rectangle | null = null // Debug visualization
  private isStunned: boolean = false // Whether BaseBlu is stunned (eyes closed, immobile)
  private stunEndTime: number = 0 // When the stun effect should end
  
  // Eye animation properties
  private eyeSprites: string[] = [
    'baseblue-eyes-center',
    'baseblue-eyes-down',
    'baseblue-eyes-down-right',
    'baseblue-eyes-middle-right',
    'baseblue-eyes-up',
    'baseblue-eyes-up-left',
    'baseblue-eyes-middle-left',
    'baseblue-eyes-down-left',
    'baseblue-eyes-blinking'
  ]
  private currentEyeIndex: number = 0
  private blinkTimer: number = 0
  private nextBlinkTime: number = 0
  private eyeMovementTimer: number = 0
  private nextEyeMovementTime: number = 0
  private isBlinking: boolean = false
  private isRollingEyes: boolean = false
  private eyeRollSequence: number[] = []
  private eyeRollIndex: number = 0
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Move visual sprite up by 8 pixels and left by 15 pixels (shifted down 2px from previous -10)
    super(scene, x - 15, y - 8, 'baseblue-eyes-center')
    
    scene.add.existing(this)
    scene.physics.add.existing(this) // Dynamic body but immovable
    
    // Set visual size to 48x48
    this.setDisplaySize(48, 48)
    
    // Set up physics
    this.setCollideWorldBounds(false) // We'll handle platform edges manually
    this.setBounce(0)
    this.setGravityY(GameSettings.game.gravity)
    this.setSize(42, 38) // 42x38 hitbox
    
    // Make BaseBlu completely immovable but allow it to affect other objects
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setImmovable(true) // Cannot be moved by other bodies
    body.setMass(10000) // Extremely heavy to resist pushing
    body.moves = false // Prevent physics engine from moving this object
    
    console.log(`🔵 BASEBLUE PHYSICS: Immovable set to ${this.body?.immovable}`)
    
    // Since we moved the sprite up and left visually, adjust the physics offset
    // The physics body needs to be positioned correctly relative to the visual sprite
    // Hitbox is now 42x38 
    // Offset x: 15 (left shift) + 3 (center with wider hitbox) + 1 + 1 (shift right again) = 20
    // Offset y: 8 (visual shift up) + 5 (center vertically) + 3 + 3 (shift down again) = 19
    this.setOffset(20, 19) // Compensate for visual shifts with hitbox
    
    // Log hitbox info for debugging
    console.log(`🔵 BASEBLUE CREATED:`)
    console.log(`   Position: (${x}, ${y})`)
    console.log(`   Visual sprite: 48x48 at (${x - 15}, ${y - 8}) - shifted left 15px, up 8px`)
    console.log(`   Hitbox size: ${body.width}x${body.height}`)
    console.log(`   Hitbox offset: (${body.offset.x}, ${body.offset.y})`)
    console.log(`   Physics at original (${x}, ${y}) for floor collision`)
    console.log(`   Physics body bounds: x=${body.x}, y=${body.y}, w=${body.width}, h=${body.height}`)
    
    // Set initial direction (start going left since sprites face left)
    this.direction = -1
    // Note: We'll handle movement manually since body.moves = false
    
    console.log(`🔵 INITIAL MOVEMENT:`)
    console.log(`   Starting velocity: ${this.movementSpeed * this.direction}`)
    console.log(`   Direction: ${this.direction} (${this.direction === -1 ? 'LEFT' : 'RIGHT'})`)
    
    // Initialize eye animation timers
    this.nextBlinkTime = Phaser.Math.Between(2000, 5000)
    this.nextEyeMovementTime = Phaser.Math.Between(1000, 3000)
    
    // Set depth
    this.setDepth(15)
    
    // Create debug rectangle to visualize hitbox
    this.createDebugRect()
  }
  
  private createDebugRect(): void {
    const body = this.body as Phaser.Physics.Arcade.Body
    
    // Create a semi-transparent red rectangle showing the exact hitbox
    this.debugRect = this.scene.add.rectangle(
      this.x,
      this.y,
      body.width,
      body.height,
      0xff0000,  // Red color
      0.3        // 30% opacity
    )
    
    // Set the origin to match the sprite's physics body
    this.debugRect.setOrigin(0.5, 0.5)
    this.debugRect.setDepth(this.depth + 1) // Slightly above the sprite
    
    console.log(`🔵 DEBUG RECT: Created at (${this.x}, ${this.y}) with size ${body.width}x${body.height}`)
  }
  
  setPlatformBounds(left: number, right: number): void {
    this.platformLeft = left
    this.platformRight = right
  }
  
  update(time: number, delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body
    
    // Check if stun period has ended
    if (this.isStunned && time >= this.stunEndTime) {
      this.endStun()
    }
    
    // Log current position every 60 frames (about once per second at 60fps)
    if (Math.floor(time / 1000) !== Math.floor((time - delta) / 1000)) {
      console.log(`🔵 BASEBLUE UPDATE:`)
      console.log(`   Sprite position: (${this.x.toFixed(1)}, ${this.y.toFixed(1)})`)
      console.log(`   Body position: (${body.x.toFixed(1)}, ${body.y.toFixed(1)})`)
      console.log(`   Velocity: (${body.velocity.x.toFixed(1)}, ${body.velocity.y.toFixed(1)})`)
      console.log(`   Direction: ${this.direction}, isPushing: ${this.isPushing}, isStunned: ${this.isStunned}`)
      console.log(`   Platform bounds: ${this.platformLeft} to ${this.platformRight}`)
    }
    
    // Skip all movement and animations if stunned
    if (this.isStunned) {
      // No movement when stunned
      // Update debug rectangle position even when stunned
      if (this.debugRect) {
        this.debugRect.x = body.x + body.width / 2
        this.debugRect.y = body.y + body.height / 2
      }
      return // Skip all other updates
    }
    
    // Handle edge detection and turning
    if (!this.isPushing) {
      const oldX = this.x
      const oldDirection = this.direction
      
      if (this.x <= this.platformLeft + 16) {
        this.direction = 1 // Turn right
        this.x = this.platformLeft + 16
        console.log(`🔵 TURNING RIGHT at left edge: x was ${oldX.toFixed(1)}, now ${this.x.toFixed(1)}`)
      } else if (this.x >= this.platformRight - 16) {
        this.direction = -1 // Turn left
        this.x = this.platformRight - 16
        console.log(`🔵 TURNING LEFT at right edge: x was ${oldX.toFixed(1)}, now ${this.x.toFixed(1)}`)
      }
      
      // Manual movement since body.moves = false
      const movement = (this.movementSpeed * this.direction * delta) / 1000
      this.x += movement
      
      if (oldDirection !== this.direction) {
        console.log(`🔵 DIRECTION CHANGED: ${oldDirection} -> ${this.direction}, movement: ${movement}`)
      }
      
      // Flip sprite based on direction (sprites face left by default)
      this.setFlipX(this.direction > 0) // Flip when going right
    }
    // No need to stop velocity when pushing since we're not using velocity
    
    // Update debug rectangle position to follow the sprite
    if (this.debugRect) {
      // Position the debug rect at the physics body center
      this.debugRect.x = body.x + body.width / 2
      this.debugRect.y = body.y + body.height / 2
    }
    
    // Update eye animations
    this.updateEyeAnimations(time, delta)
  }
  
  private updateEyeAnimations(time: number, delta: number): void {
    // Handle eye rolling sequence
    if (this.isRollingEyes && this.eyeRollSequence.length > 0) {
      this.eyeMovementTimer += delta
      if (this.eyeMovementTimer >= 150) { // Fast eye movement for rolling
        this.eyeMovementTimer = 0
        this.eyeRollIndex++
        if (this.eyeRollIndex >= this.eyeRollSequence.length) {
          this.isRollingEyes = false
          this.eyeRollSequence = []
          this.eyeRollIndex = 0
          this.setTexture('baseblue-eyes-center')
        } else {
          const eyeIndex = this.eyeRollSequence[this.eyeRollIndex]
          this.setTexture(this.eyeSprites[eyeIndex])
        }
      }
      return // Skip other animations while rolling eyes
    }
    
    // Handle blinking
    this.blinkTimer += delta
    if (this.isBlinking) {
      if (this.blinkTimer >= 150) { // Blink duration
        this.isBlinking = false
        this.blinkTimer = 0
        this.nextBlinkTime = Phaser.Math.Between(2000, 5000)
        this.setTexture('baseblue-eyes-center')
      }
    } else if (this.blinkTimer >= this.nextBlinkTime) {
      this.isBlinking = true
      this.blinkTimer = 0
      this.setTexture('baseblue-eyes-blinking')
    }
    
    // Handle regular eye movement
    if (!this.isBlinking) {
      this.eyeMovementTimer += delta
      if (this.eyeMovementTimer >= this.nextEyeMovementTime) {
        this.eyeMovementTimer = 0
        this.nextEyeMovementTime = Phaser.Math.Between(1000, 3000)
        
        // Occasionally do an eye roll sequence
        if (Math.random() < 0.15) { // 15% chance to roll eyes
          this.startEyeRoll()
        } else {
          // Random eye movement
          const randomEye = Phaser.Math.Between(0, 7) // Exclude blinking sprite
          this.setTexture(this.eyeSprites[randomEye])
        }
      }
    }
  }
  
  private startEyeRoll(): void {
    this.isRollingEyes = true
    this.eyeRollIndex = 0
    this.eyeMovementTimer = 0
    
    // Create a circular eye roll pattern
    // up -> up-right -> right -> down-right -> down -> down-left -> left -> up-left -> up
    this.eyeRollSequence = [4, 3, 3, 2, 1, 7, 6, 5, 4] // Indices for eye roll
  }
  
  startPushing(): void {
    this.isPushing = true
    // No velocity to set since we use manual movement
  }
  
  stopPushing(): void {
    this.isPushing = false
  }
  
  // Called when player collides with BaseBlu
  startStun(): void {
    if (this.isStunned) return // Already stunned
    
    this.isStunned = true
    this.stunEndTime = this.scene.time.now + 2000 // 2 second stun
    // Movement is handled by manual position updates, so no velocity to stop
    this.setTexture('baseblue-eyes-blinking') // Close eyes
    
    console.log(`🔵 BASEBLUE STUNNED: Eyes closed, immobile for 2 seconds`)
  }
  
  private endStun(): void {
    this.isStunned = false
    this.setTexture('baseblue-eyes-center') // Open eyes
    // Movement will resume automatically in next update cycle
    
    console.log(`🔵 BASEBLUE RECOVERED: Resuming patrol`)
  }
  
  // Called when player jumps on top
  handlePlayerBounce(): void {
    // BaseBlu cannot be squished, just provides bounce
    // The bounce velocity is handled by the collision system
    // No points awarded for bouncing on BaseBlu
  }
  
  // Check if BaseBlu can be killed by invincible player
  canBeKilledByInvinciblePlayer(): boolean {
    return true // BaseBlu can always be killed when player is invincible
  }
  
  // Called when killed by invincible player
  handleInvinciblePlayerKill(): number {
    console.log(`🔵 BASEBLUE KILLED: By invincible player for 1000 points`)
    this.destroy()
    return 1000 // Award 1000 points
  }
  
  // Check if player is trying to push from the side
  isPlayerColliding(player: Phaser.Physics.Arcade.Sprite): boolean {
    const playerBounds = player.getBounds()
    const myBounds = this.getBounds()
    
    // Check if player is on the sides (not on top)
    const overlapY = Math.min(playerBounds.bottom, myBounds.bottom) - 
                     Math.max(playerBounds.top, myBounds.top)
    const overlapX = Math.min(playerBounds.right, myBounds.right) - 
                     Math.max(playerBounds.left, myBounds.left)
    
    // If player is more to the side than on top
    if (overlapY > 0 && overlapX > 0 && overlapY < myBounds.height * 0.5) {
      return false // This is a top collision, not side
    }
    
    return overlapX > 0 && overlapY > 0
  }
  
  destroy(): void {
    if (this.debugRect) {
      this.debugRect.destroy()
    }
    super.destroy()
  }
}