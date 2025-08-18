import GameSettings from "../config/GameSettings"
import { TouchControls } from "./TouchControls"

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private isClimbing: boolean = false
  private currentLadder: Phaser.GameObjects.GameObject | null = null
  private touchControls: TouchControls | null = null
  private walkAnimationTimer: number = 0
  private climbAnimationTimer: number = 0
  private idleAnimationTimer: number = 0
  private currentFrame: 'idle' | 'leftStep' | 'rightStep' = 'idle'
  private currentIdleState: 'eye1' | 'eye2' | 'eye3' | 'eye4' | 'eye5' | 'blink' = 'eye1'
  private currentClimbFoot: 'left' | 'right' = 'left'
  private isMoving: boolean = false
  private isJumping: boolean = false
  private runningTiltTimer: number = 0
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Use the new player idle sprite or fallback to placeholder
    const textureKey = scene.textures.exists('playerIdleEye1') ? 'playerIdleEye1' : 'player'
    
    // Create fallback if sprite not loaded
    if (!scene.textures.exists('playerIdleEye1')) {
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
    if (textureKey === 'playerIdleEye1' || textureKey.startsWith('player')) {
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
    this.setOffset(10, 6)  // Move physics body down, which visually shifts sprite up (decreased by 2px)
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
    
    // Track jumping state - immediate transition when landing
    const wasJumping = this.isJumping
    // Jump sprite only when in air AND moving up/down significantly
    // Immediately false when on ground
    this.isJumping = !onGround && Math.abs(this.body!.velocity.y) > 10
    
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
        // Track climbing movement for animation
        this.isMoving = true
      } else if (downPressed) {
        // Always allow climbing down, but with floor boundary protection
        const tileSize = GameSettings.game.tileSize
        const groundFloorY = GameSettings.canvas.height - tileSize/2 // Ground floor platform position
        const groundFloorLimit = groundFloorY - 20 // Allow player to reach just above ground platforms
        
        if (this.y < groundFloorLimit) {
          // Safe to climb down
          this.setVelocityY(GameSettings.game.climbSpeed)
          // Track climbing movement for animation
          this.isMoving = true
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
    
    // Handle smart animation system
    this.updateSmartAnimations()
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
  
  private updateSmartAnimations(): void {
    const deltaTime = this.scene.game.loop.delta
    const onGround = this.body!.blocked.down
    
    // Priority 1: Climbing animations (climbing overrides jumping)
    if (this.isClimbing) {
      if (this.isMoving) {
        this.handleClimbingAnimation(deltaTime)
      } else {
        // Show static climbing pose when on ladder but not moving
        this.changePlayerTexture('playerClimbLeftFoot')
        this.resetAnimationTimers()
      }
    }
    // Priority 2: Jumping animations (only when actually in air)
    else if (this.isJumping && !onGround) {
      this.handleJumpingAnimation()
    }
    // Priority 3: Running/walking animations
    else if (this.isMoving) {
      this.handleRunningAnimation(deltaTime)
    }
    // Priority 4: Idle animations (immediate when on ground and not moving)
    else {
      this.handleIdleAnimation(deltaTime)
    }
  }
  
  private handleJumpingAnimation(): void {
    // Use direction-based jumping sprites
    const textureKey = this.flipX ? 'playerJumpLeftFoot' : 'playerJumpRightFoot'
    this.changePlayerTexture(textureKey)
    this.currentFrame = 'idle' // Reset walking frame when jumping
    
    // Reset running tilt when jumping
    this.resetRunningTilt()
  }
  
  private handleClimbingAnimation(deltaTime: number): void {
    const climbAnimationSpeed = 120 // Fun, active climbing animation (20% slower than 100ms)
    
    // IMMEDIATE RESPONSE: Start climbing animation instantly when climbing begins
    if (this.currentFrame !== 'idle' && !this.texture.key.includes('Climb')) {
      this.currentClimbFoot = 'left'
      this.changePlayerTexture('playerClimbLeftFoot')
      this.climbAnimationTimer = 0
      this.resetAnimationTimers()
      
      // Reset any running tilt when starting to climb
      this.resetRunningTilt()
      return
    }
    
    this.climbAnimationTimer += deltaTime
    
    if (this.climbAnimationTimer >= climbAnimationSpeed) {
      // Alternate feet while climbing to match ladder movement
      if (this.currentClimbFoot === 'left') {
        this.currentClimbFoot = 'right'
        this.changePlayerTexture('playerClimbRightFoot')
      } else {
        this.currentClimbFoot = 'left'
        this.changePlayerTexture('playerClimbLeftFoot')
      }
      this.climbAnimationTimer = 0
    }
  }
  
  private handleRunningAnimation(deltaTime: number): void {
    const runAnimationSpeed = 120 // Snappy, responsive running animation
    
    // IMMEDIATE RESPONSE: Start running animation instantly when movement begins
    if (this.currentFrame === 'idle') {
      this.currentFrame = 'leftStep'
      this.changePlayerTexture('playerRunLeftFoot')
      this.walkAnimationTimer = 0
      this.runningTiltTimer = 0
      return
    }
    
    this.walkAnimationTimer += deltaTime
    this.runningTiltTimer += deltaTime
    
    // Apply subtle forward/backward tilt for motion sense (ONLY during running)
    this.applyRunningTilt()
    
    if (this.walkAnimationTimer >= runAnimationSpeed) {
      // Switch between left and right step for running
      if (this.currentFrame === 'rightStep') {
        this.currentFrame = 'leftStep'
        this.changePlayerTexture('playerRunLeftFoot')
      } else {
        this.currentFrame = 'rightStep'
        this.changePlayerTexture('playerRunRightFoot')
      }
      this.walkAnimationTimer = 0
    }
  }
  
  private handleIdleAnimation(deltaTime: number): void {
    this.idleAnimationTimer += deltaTime
    
    // Reset to idle state when stopping movement
    if (this.currentFrame !== 'idle') {
      this.currentFrame = 'idle'
      this.currentIdleState = 'eye1'
      this.changePlayerTexture('playerIdleEye1')
      this.idleAnimationTimer = 0
      this.walkAnimationTimer = 0
      this.climbAnimationTimer = 0
      
      // Reset running tilt when stopping
      this.resetRunningTilt()
      return
    }
    
    // Organic timing with different patterns for different states
    let animationSpeed: number
    
    if (this.currentIdleState === 'blink') {
      // Quick natural blink - 100-180ms with slight variation
      animationSpeed = 100 + Math.random() * 80
    } else {
      // Eye movement timing with organic variation patterns (slowed down)
      // Base timing gets longer the more "extreme" the eye position
      const baseTimings = {
        'eye1': 1200, // Center-left, comfortable
        'eye2': 1100, // Center-right, comfortable
        'eye3': 1400, // More extreme position
        'eye4': 1600, // Even more extreme
        'eye5': 1800  // Most extreme, longest hold
      }
      
      const baseTiming = baseTimings[this.currentIdleState as keyof typeof baseTimings] || 1200
      // Add natural variation (±400ms) for organic feel
      animationSpeed = baseTiming + (Math.random() - 0.5) * 800
    }
    
    // Handle organic eye animation transitions
    if (this.idleAnimationTimer >= animationSpeed) {
      const randomAction = Math.random()
      const availableEyePositions = ['eye1', 'eye2', 'eye3', 'eye4', 'eye5'] as const
      
      switch (this.currentIdleState) {
        case 'eye1':
          if (randomAction < 0.25) {
            this.currentIdleState = 'blink'
            this.changePlayerTexture('playerIdleBlink')
          } else if (randomAction < 0.55) {
            // Likely to move to nearby positions
            this.currentIdleState = 'eye2'
            this.changePlayerTexture('playerIdleEye2')
          } else if (randomAction < 0.75) {
            this.currentIdleState = 'eye3'
            this.changePlayerTexture('playerIdleEye3')
          } else if (randomAction < 0.90) {
            this.currentIdleState = 'eye4'
            this.changePlayerTexture('playerIdleEye4')
          } else {
            // Rare jump to extreme position
            this.currentIdleState = 'eye5'
            this.changePlayerTexture('playerIdleEye5')
          }
          break
          
        case 'eye2':
          if (randomAction < 0.3) {
            this.currentIdleState = 'blink'
            this.changePlayerTexture('playerIdleBlink')
          } else if (randomAction < 0.60) {
            this.currentIdleState = 'eye1'
            this.changePlayerTexture('playerIdleEye1')
          } else if (randomAction < 0.80) {
            this.currentIdleState = 'eye3'
            this.changePlayerTexture('playerIdleEye3')
          } else if (randomAction < 0.95) {
            this.currentIdleState = 'eye4'
            this.changePlayerTexture('playerIdleEye4')
          } else {
            this.currentIdleState = 'eye5'
            this.changePlayerTexture('playerIdleEye5')
          }
          break
          
        case 'eye3':
          if (randomAction < 0.2) {
            this.currentIdleState = 'blink'
            this.changePlayerTexture('playerIdleBlink')
          } else if (randomAction < 0.45) {
            // Return to comfortable positions more often
            this.currentIdleState = 'eye1'
            this.changePlayerTexture('playerIdleEye1')
          } else if (randomAction < 0.70) {
            this.currentIdleState = 'eye2'
            this.changePlayerTexture('playerIdleEye2')
          } else if (randomAction < 0.90) {
            this.currentIdleState = 'eye4'
            this.changePlayerTexture('playerIdleEye4')
          } else {
            this.currentIdleState = 'eye5'
            this.changePlayerTexture('playerIdleEye5')
          }
          break
          
        case 'eye4':
          if (randomAction < 0.15) {
            this.currentIdleState = 'blink'
            this.changePlayerTexture('playerIdleBlink')
          } else if (randomAction < 0.40) {
            // Strong tendency to return to center
            this.currentIdleState = 'eye1'
            this.changePlayerTexture('playerIdleEye1')
          } else if (randomAction < 0.65) {
            this.currentIdleState = 'eye2'
            this.changePlayerTexture('playerIdleEye2')
          } else if (randomAction < 0.85) {
            this.currentIdleState = 'eye3'
            this.changePlayerTexture('playerIdleEye3')
          } else {
            this.currentIdleState = 'eye5'
            this.changePlayerTexture('playerIdleEye5')
          }
          break
          
        case 'eye5':
          if (randomAction < 0.1) {
            this.currentIdleState = 'blink'
            this.changePlayerTexture('playerIdleBlink')
          } else {
            // Very strong tendency to return to more comfortable positions
            if (randomAction < 0.45) {
              this.currentIdleState = 'eye1'
              this.changePlayerTexture('playerIdleEye1')
            } else if (randomAction < 0.75) {
              this.currentIdleState = 'eye2'
              this.changePlayerTexture('playerIdleEye2')
            } else if (randomAction < 0.90) {
              this.currentIdleState = 'eye3'
              this.changePlayerTexture('playerIdleEye3')
            } else {
              this.currentIdleState = 'eye4'
              this.changePlayerTexture('playerIdleEye4')
            }
          }
          break
          
        case 'blink':
          // After blink, weighted random return to eye positions
          // Favor comfortable central positions
          if (randomAction < 0.35) {
            this.currentIdleState = 'eye1'
            this.changePlayerTexture('playerIdleEye1')
          } else if (randomAction < 0.65) {
            this.currentIdleState = 'eye2'
            this.changePlayerTexture('playerIdleEye2')
          } else if (randomAction < 0.80) {
            this.currentIdleState = 'eye3'
            this.changePlayerTexture('playerIdleEye3')
          } else if (randomAction < 0.95) {
            this.currentIdleState = 'eye4'
            this.changePlayerTexture('playerIdleEye4')
          } else {
            this.currentIdleState = 'eye5'
            this.changePlayerTexture('playerIdleEye5')
          }
          break
      }
      this.idleAnimationTimer = 0
    }
  }
  
  private resetAnimationTimers(): void {
    this.walkAnimationTimer = 0
    this.climbAnimationTimer = 0
    this.idleAnimationTimer = 0
  }
  
  private changePlayerTexture(textureKey: string): void {
    if (this.scene.textures.exists(textureKey)) {
      this.setTexture(textureKey)
      // Maintain scale for all player textures
      this.setDisplaySize(48, 64)
    }
  }
  
  private applyRunningTilt(): void {
    // Create subtle forward/backward tilt based on running cycle
    const tiltFrequency = 0.02 // How fast the tilt oscillates (matches foot timing roughly)
    const tiltAmplitude = 0.08 // Maximum tilt angle in radians (~4.6 degrees)
    
    // Calculate tilt angle - alternates between forward and back lean
    const tiltAngle = Math.sin(this.runningTiltTimer * tiltFrequency) * tiltAmplitude
    
    // Apply the rotation
    this.setRotation(tiltAngle)
  }
  
  private resetRunningTilt(): void {
    // Smoothly return to upright position
    this.setRotation(0)
    this.runningTiltTimer = 0
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