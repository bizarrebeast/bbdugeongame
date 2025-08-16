import GameSettings from "../config/GameSettings"
import { TouchControls } from "./TouchControls"

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private isClimbing: boolean = false
  private currentLadder: Phaser.GameObjects.GameObject | null = null
  private touchControls: TouchControls | null = null
  private walkAnimationTimer: number = 0
  private currentFrame: 'idle' | 'leftStep' | 'rightStep' = 'idle'
  private isMoving: boolean = false
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Use the loaded player idle sprite or fallback to placeholder
    const textureKey = scene.textures.exists('playerIdle') ? 'playerIdle' : 'player'
    
    // Create fallback if sprite not loaded
    if (!scene.textures.exists('playerIdle')) {
      const graphics = scene.add.graphics()
      graphics.fillStyle(0x00ff00, 1)
      graphics.fillRect(0, 0, 24, 32)
      graphics.generateTexture('player', 24, 32)
      graphics.destroy()
    }
    
    super(scene, x, y, textureKey)
    
    scene.add.existing(this)
    scene.physics.add.existing(this)
    
    // Scale the sprite if using the new player sprites
    if (textureKey === 'playerIdle') {
      // Scale to fit the expected player size (48x64 for retina display)
      this.setDisplaySize(48, 64)
    }
    
    // Set up physics properties (world bounds set in GameScene to allow full floor movement)
    this.setCollideWorldBounds(true)
    this.setBounce(0)
    this.setSize(28, 55)
    
    // The hitbox is positioned correctly, we need to shift the visual sprite UP
    // so that the sprite's bottom aligns with the hitbox's bottom
    // Sprite is 64px tall, hitbox is 55px tall
    // The difference is 9px that the sprite extends above the hitbox
    // Offset moves the physics body relative to sprite center
    // Positive Y offset moves the physics body DOWN relative to sprite
    // Which effectively moves the sprite UP relative to the physics body
    // We want the physics body at the bottom 55px of the 64px sprite
    // So offset = 64/2 - 55/2 = 32 - 27.5 = 4.5
    this.setOffset(10, 9)  // Move physics body down, which visually shifts sprite up
    this.setDepth(20) // Player renders on top of everything
    
    // Phaser's built-in debug visualization will show the hitbox
    
    // Create cursor keys for input
    this.cursors = scene.input.keyboard!.createCursorKeys()
    
    // Add spacebar for jumping
    scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
  }
  
  setTouchControls(touchControls: TouchControls): void {
    this.touchControls = touchControls
  }

  update(): void {
    const onGround = this.body!.blocked.down
    const spaceKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    
    // Add WASD keys support
    const wKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W)
    const aKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A)
    const sKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S)
    const dKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    
    // Get input from keyboard (arrows or WASD) or touch controls (now discrete D-pad)
    const leftPressed = this.cursors.left.isDown || aKey.isDown || (this.touchControls?.leftPressed || false)
    const rightPressed = this.cursors.right.isDown || dKey.isDown || (this.touchControls?.rightPressed || false)
    const upPressed = this.cursors.up.isDown || wKey.isDown || (this.touchControls?.upPressed || false)
    const downPressed = this.cursors.down.isDown || sKey.isDown || (this.touchControls?.downPressed || false)
    const jumpJustPressed = Phaser.Input.Keyboard.JustDown(spaceKey) || (this.touchControls?.isJumpJustPressed() || false)
    
    // Track if player is moving horizontally
    this.isMoving = (leftPressed || rightPressed) && !this.isClimbing
    
    // Horizontal movement
    if (!this.isClimbing) {
      if (leftPressed) {
        this.setVelocityX(-GameSettings.game.playerSpeed)
        this.setFlipX(true)  // Flip sprite to face left
      } else if (rightPressed) {
        this.setVelocityX(GameSettings.game.playerSpeed)
        this.setFlipX(false)  // Face right (original direction)
      } else {
        this.setVelocityX(0)
      }
      
      // Jumping
      if (jumpJustPressed && onGround) {
        this.setVelocityY(GameSettings.game.jumpVelocity)
      }
    }
    
    // Ladder climbing logic
    if (this.isClimbing) {
      // Disable gravity while climbing
      if (this.body instanceof Phaser.Physics.Arcade.Body) {
        this.body.setAllowGravity(false)
      }
      this.setVelocityX(0)
      
      if (upPressed) {
        this.setVelocityY(-GameSettings.game.climbSpeed)
      } else if (downPressed) {
        // Always allow climbing down, but with floor boundary protection
        const tileSize = GameSettings.game.tileSize
        const groundFloorY = GameSettings.canvas.height - tileSize/2 // Ground floor platform position
        const groundFloorLimit = groundFloorY - 20 // Allow player to reach just above ground platforms
        
        if (this.y < groundFloorLimit) {
          // Safe to climb down
          this.setVelocityY(GameSettings.game.climbSpeed)
        } else {
          // At ground floor limit - stop here to prevent falling through
          this.setVelocityY(0)
        }
      } else {
        this.setVelocityY(0)
      }
      
      // Allow horizontal movement at top of ladder when standing on platform
      if (onGround && !upPressed) {
        if (leftPressed) {
          this.exitClimbing()
          this.setFlipX(true)  // Face left when exiting ladder
        } else if (rightPressed) {
          this.exitClimbing()
          this.setFlipX(false)  // Face right when exiting ladder
        }
      }
      
      // Exit climbing with jump
      if (jumpJustPressed) {
        this.exitClimbing()
        this.setVelocityY(GameSettings.game.jumpVelocity)
      }
    }
    
    // Handle walking animation
    this.updateWalkingAnimation()
  }
  
  startClimbing(ladder: Phaser.GameObjects.GameObject): void {
    this.isClimbing = true
    this.currentLadder = ladder
    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      this.body.setAllowGravity(false)
    }
    // Center player on ladder
    const ladderSprite = ladder as Phaser.GameObjects.Rectangle
    this.x = ladderSprite.x
  }
  
  exitClimbing(): void {
    this.isClimbing = false
    this.currentLadder = null
    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      this.body.setAllowGravity(true)
    }
  }
  
  checkLadderProximity(ladder: Phaser.GameObjects.GameObject): boolean {
    // Check if player is pressing up or down near a ladder
    const wKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W)
    const sKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S)
    // Use discrete D-pad input for ladder climbing
    const upPressed = this.cursors.up.isDown || wKey.isDown || (this.touchControls?.upPressed || false)
    const downPressed = this.cursors.down.isDown || sKey.isDown || (this.touchControls?.downPressed || false)
    
    if (upPressed || downPressed) {
      const ladderSprite = ladder as Phaser.GameObjects.Rectangle
      const distance = Math.abs(this.x - ladderSprite.x)
      return distance < 20 // Within 20 pixels of ladder center
    }
    return false
  }
  
  getIsClimbing(): boolean {
    return this.isClimbing
  }
  
  private updateWalkingAnimation(): void {
    const animationSpeed = 200 // milliseconds per frame
    
    if (this.isMoving) {
      // Update animation timer
      this.walkAnimationTimer += this.scene.game.loop.delta
      
      if (this.walkAnimationTimer >= animationSpeed) {
        // Switch between left and right step
        if (this.currentFrame === 'idle' || this.currentFrame === 'rightStep') {
          this.currentFrame = 'leftStep'
          this.changePlayerTexture('playerLeftStep')
        } else {
          this.currentFrame = 'rightStep'
          this.changePlayerTexture('playerRightStep')
        }
        this.walkAnimationTimer = 0
      }
    } else {
      // Player is idle - show idle frame
      if (this.currentFrame !== 'idle') {
        this.currentFrame = 'idle'
        this.changePlayerTexture('playerIdle')
        this.walkAnimationTimer = 0
      }
    }
  }
  
  private changePlayerTexture(textureKey: string): void {
    if (this.scene.textures.exists(textureKey)) {
      this.setTexture(textureKey)
      // Maintain scale for all player textures
      this.setDisplaySize(48, 64)
    }
  }
  
  private addRoundedHitboxVisualization(): void {
    // Only show in debug mode
    if (!GameSettings.debug) return
    
    const graphics = this.scene.add.graphics()
    const body = this.body as Phaser.Physics.Arcade.Body
    
    // Draw rounded rectangle overlay on the rectangular hitbox
    graphics.lineStyle(2, 0x00ff88, 0.8) // Green with transparency
    graphics.strokeRoundedRect(
      body.x - this.x, 
      body.y - this.y, 
      body.width, 
      body.height, 
      6 // Corner radius
    )
    
    // Attach graphics to follow the player
    graphics.setDepth(25) // Above player but below UI
    this.scene.add.existing(graphics)
    
    // Update graphics position in update loop
    this.scene.events.on('postupdate', () => {
      if (graphics && graphics.active) {
        graphics.x = this.x
        graphics.y = this.y
      }
    })
  }
}