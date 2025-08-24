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
  private currentFrame: 'idle' | 'leftStep' | 'rightStep' | 'jumpLeftFoot' | 'jumpRightFoot' = 'idle'
  private currentIdleState: 'eye1' | 'eye2' | 'eye3' | 'eye4' | 'eye5' | 'blink' = 'eye1'
  private currentClimbFoot: 'left' | 'right' = 'left'
  private isMoving: boolean = false
  private isJumping: boolean = false
  private runningTiltTimer: number = 0
  private lastFrameWasJump: boolean = false
  
  // Scaleable jump system
  private jumpButtonDown: boolean = false
  private jumpHoldTime: number = 0
  private isAirborne: boolean = false
  private jumpReleased: boolean = false
  private readonly MIN_JUMP_VELOCITY: number = -250 // Small hop - just enough to be useful
  private readonly MAX_JUMP_VELOCITY: number = -350 // Full jump (current value)
  private readonly MAX_JUMP_HOLD_TIME: number = 300 // milliseconds to reach max height
  private readonly MIN_HOLD_TIME: number = 50 // Minimum time before boost starts
  
  // Speed multiplier for power-ups (like invincibility)
  private speedMultiplier: number = 1.0
  
  // Speech/Thought bubble system
  private idleTimer: number = 0
  private readonly IDLE_THRESHOLD: number = 5000 // 5 seconds in milliseconds
  private bubbleActive: boolean = false
  private onBubbleTrigger: (() => void) | null = null
  private onMovementStart: (() => void) | null = null
  
  // Two-layer running animation system
  private runBodySprite: Phaser.GameObjects.Image | null = null
  private runLegsSprite: Phaser.GameObjects.Image | null = null
  private useTwoLayerRunning: boolean = true // Enable the new system
  private currentLegFrame: 'bothDown' | 'leftMid' | 'leftHigh' | 'rightMid' | 'rightHigh' = 'bothDown'
  private legAnimationStep: number = 0 // 0-7 for the 8-step animation cycle
  private bodyAnimationTimer: number = 0 // Separate timer for body expressions
  private legAnimationTimer: number = 0 // Separate timer for legs
  
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
      // Scale to fit the expected player size
      this.setDisplaySize(48, 64)
    }
    
    // Set up physics properties (world bounds set in GameScene to allow full floor movement)
    this.setCollideWorldBounds(true)
    this.setBounce(0)
    this.setSize(18, 45)  // Reduced by 10px each for more forgiving hitbox
    
    // The hitbox is positioned correctly, we need to shift the visual sprite UP
    // so that the sprite's bottom aligns with the hitbox's bottom
    // Sprite is 64px tall, hitbox is 45px tall
    // The difference is 19px that the sprite extends above the hitbox
    // Offset moves the physics body relative to sprite center
    // Positive Y offset moves the physics body DOWN relative to sprite
    // Which effectively moves the sprite UP relative to the physics body
    // We want the physics body at the bottom 45px of the 64px sprite
    // So offset = 64/2 - 45/2 = 32 - 22.5 = 9.5
    this.setOffset(15, 15.5)  // Move physics body down, which visually shifts sprite up (decreased by 1px)
    this.setDepth(20) // Player renders on top of everything
    
    // Phaser's built-in debug visualization will show the hitbox
    
    // Initialize two-layer running system if sprites are available
    this.initializeTwoLayerRunning(scene)
    
    // Create cursor keys for input
    this.cursors = scene.input.keyboard!.createCursorKeys()
    
    // Add spacebar for jumping
    scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
  }
  
  setTouchControls(touchControls: TouchControls): void {
    this.touchControls = touchControls
  }
  
  setBubbleTriggerCallback(callback: () => void): void {
    this.onBubbleTrigger = callback
  }

  setMovementStartCallback(callback: () => void): void {
    this.onMovementStart = callback
  }
  
  private initializeTwoLayerRunning(scene: Phaser.Scene): void {
    // Check if the new two-layer sprites are available
    const hasNewSprites = scene.textures.exists('playerRunBody') && 
                          scene.textures.exists('playerRunLegsBothDown')
    
    if (hasNewSprites && this.useTwoLayerRunning) {
      // Create the body sprite (upper layer) - initially hidden
      this.runBodySprite = scene.add.image(this.x, this.y, 'playerRunBody')
      this.runBodySprite.setDisplaySize(48, 64)
      this.runBodySprite.setDepth(21) // Above the main sprite
      this.runBodySprite.setVisible(false)
      
      // Create the legs sprite (lower layer) - initially hidden
      this.runLegsSprite = scene.add.image(this.x, this.y, 'playerRunLegsBothDown')
      this.runLegsSprite.setDisplaySize(48, 64)
      this.runLegsSprite.setDepth(19) // Below the main sprite but above everything else
      this.runLegsSprite.setVisible(false)
      
      // Set initial leg frame
      this.currentLegFrame = 'bothDown'
      this.legAnimationStep = 0
    } else {
      // Disable two-layer system if sprites not available
      this.useTwoLayerRunning = false
    }
  }
  
  private updateTwoLayerPosition(): void {
    // Keep both sprites aligned with the main player sprite
    // Only update if sprites are visible to prevent unnecessary redraws
    if (this.runBodySprite && this.runLegsSprite && this.runBodySprite.visible) {
      // Only update if position actually changed to minimize redraws
      if (this.runBodySprite.x !== this.x || this.runBodySprite.y !== this.y) {
        this.runBodySprite.x = this.x
        this.runBodySprite.y = this.y
        
        this.runLegsSprite.x = this.x
        this.runLegsSprite.y = this.y
      }
      
      // Only update flip if it actually changed
      if (this.runBodySprite.flipX !== this.flipX) {
        this.runBodySprite.setFlipX(this.flipX)
        this.runLegsSprite.setFlipX(this.flipX)
      }
    }
  }
  
  private showTwoLayerRunning(show: boolean): void {
    if (this.useTwoLayerRunning && this.runBodySprite && this.runLegsSprite) {
      this.runBodySprite.setVisible(show)
      this.runLegsSprite.setVisible(show)
      // Hide the main sprite when showing two-layer system
      this.setVisible(!show)
    }
  }
  
  private updateLegAnimation(): void {
    if (!this.runLegsSprite || !this.useTwoLayerRunning) return
    
    // 8-step animation cycle: 0->1->2->1->0->3->4->3 (and repeat)
    // 0: both down, 1: left mid, 2: left high, 3: right mid, 4: right high
    const legFrames = [
      'bothDown',     // 0
      'leftMid',      // 1  
      'leftHigh',     // 2
      'leftMid',      // 3 (back to mid)
      'bothDown',     // 4 (back to both down)
      'rightMid',     // 5
      'rightHigh',    // 6
      'rightMid'      // 7 (back to mid, then cycle repeats)
    ]
    
    const frame = legFrames[this.legAnimationStep]
    this.currentLegFrame = frame as any
    
    // Update the texture based on current frame
    const textureMap = {
      'bothDown': 'playerRunLegsBothDown',
      'leftMid': 'playerRunLegsLeftMid', 
      'leftHigh': 'playerRunLegsLeftHigh',
      'rightMid': 'playerRunLegsRightMid',
      'rightHigh': 'playerRunLegsRightHigh'
    }
    
    this.runLegsSprite.setTexture(textureMap[frame])
    
    // Advance to next step (0-7 cycle)
    this.legAnimationStep = (this.legAnimationStep + 1) % 8
  }
  
  private updateBodyExpression(): void {
    if (!this.runBodySprite || !this.useTwoLayerRunning) return
    
    // Future: Add random facial expressions here when more body sprites are available
    // Example for when you have multiple body sprites:
    // const bodyExpressions = ['playerRunBody', 'playerRunBodySmile', 'playerRunBodyFocus', 'playerRunBodyTired']
    // const randomExpression = bodyExpressions[Math.floor(Math.random() * bodyExpressions.length)]
    // this.runBodySprite.setTexture(randomExpression)
    
    // For now, do NOTHING - let the body sprite remain completely static and clean
    // The texture was already set once when the sprite was created
  }
  
  notifyBubbleActive(isActive: boolean): void {
    this.bubbleActive = isActive
    if (isActive) {
      this.idleTimer = 0 // Reset timer when bubble appears
    }
  }

  update(time: number, delta: number): void {
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
    const jumpButtonHeld = spaceKey.isDown || (this.touchControls?.jumpPressed || false)
    
    // Track if player is moving horizontally
    this.isMoving = (leftPressed || rightPressed) && !this.isClimbing
    
    // Track jumping state - immediate transition when landing
    const wasJumping = this.isJumping
    // Jump sprite only when in air AND moving up/down significantly
    // Immediately false when on ground (prioritize ground detection)
    this.isJumping = !onGround && Math.abs(this.body!.velocity.y) > 10
    
    // Force immediate sprite change when landing
    if (wasJumping && onGround) {
      // Player just landed - force immediate transition away from jump sprite
      this.isJumping = false
    }
    
    // Horizontal movement
    if (!this.isClimbing) {
      const currentSpeed = GameSettings.game.playerSpeed * this.speedMultiplier
      if (leftPressed) {
        this.setVelocityX(-currentSpeed)
        this.setFlipX(true)  // Flip sprite to face left
      } else if (rightPressed) {
        this.setVelocityX(currentSpeed)
        this.setFlipX(false)  // Face right (original direction)
      } else {
        this.setVelocityX(0)
      }
      
      // Scaleable jumping system
      if (jumpJustPressed && onGround && !this.isAirborne) {
        // Start jump with initial velocity
        this.jumpButtonDown = true
        this.jumpHoldTime = 0
        this.isAirborne = true
        this.jumpReleased = false
        // Apply initial jump velocity
        this.setVelocityY(this.MIN_JUMP_VELOCITY)
        // Jump started with initial velocity
        this.triggerHapticFeedback() // Haptic feedback for jump start
      }
      
      // Continue boosting jump while airborne
      if (this.isAirborne && this.jumpButtonDown && !this.jumpReleased) {
        if (jumpButtonHeld) {
          this.jumpHoldTime += delta
          
          // Only start boosting after minimum hold time
          if (this.jumpHoldTime > this.MIN_HOLD_TIME && 
              this.jumpHoldTime < this.MAX_JUMP_HOLD_TIME && 
              this.body?.velocity.y! < 0) {
            
            // Calculate boost based on how long held (ramp up over time)
            const holdProgress = (this.jumpHoldTime - this.MIN_HOLD_TIME) / (this.MAX_JUMP_HOLD_TIME - this.MIN_HOLD_TIME)
            const boostForce = -5 - (holdProgress * 10) // Starts at -5, ramps to -15
            const oldVelocity = this.body!.velocity.y
            this.setVelocityY(this.body!.velocity.y + boostForce)
            
            // Cap at max velocity
            if (this.body!.velocity.y < this.MAX_JUMP_VELOCITY) {
              this.setVelocityY(this.MAX_JUMP_VELOCITY)
              // Reached maximum jump velocity
            } else {
              // Jump velocity boosted while holding button
            }
          }
        } else {
          // Button released
          this.jumpButtonDown = false
          this.jumpReleased = true
          // Jump button released
        }
      }
      
      // Reset jump state when landing - but with a small delay to prevent immediate re-triggering
      if (onGround && this.isAirborne && this.body?.velocity.y! >= 0) {
        this.isAirborne = false
        this.jumpButtonDown = false
        this.jumpReleased = false
        const totalHoldTime = this.jumpHoldTime
        this.jumpHoldTime = 0
        // Player landed, jump complete
        this.triggerHapticFeedback() // Haptic feedback for landing
      }
    }
    
    // Ladder climbing logic
    if (this.isClimbing && this.currentLadder) {
      // Disable gravity while climbing
      if (this.body instanceof Phaser.Physics.Arcade.Body) {
        this.body.setAllowGravity(false)
      }
      this.setVelocityX(0)
      
      // Get ladder bounds - only restrict going down past bottom
      const ladderRect = this.currentLadder as Phaser.GameObjects.Rectangle
      const ladderBottom = ladderRect.y + ladderRect.height / 2
      
      // Check if player is at ladder bottom
      const atLadderBottom = this.y >= ladderBottom - 10 // Small buffer at bottom
      
      if (upPressed) {
        // Always allow climbing up - player can exit at top
        this.setVelocityY(-GameSettings.game.climbSpeed)
        // Track climbing movement for animation
        this.isMoving = true
      } else if (downPressed && !atLadderBottom) {
        // Allow climbing down but stop at ladder bottom
        this.setVelocityY(GameSettings.game.climbSpeed)
        // Track climbing movement for animation
        this.isMoving = true
      } else {
        // Stop movement when not pressing or at ladder bottom
        this.setVelocityY(0)
      }
      
      // Allow horizontal movement to exit ladder
      if (leftPressed || rightPressed) {
        this.exitClimbing()
        // Apply horizontal movement immediately after exiting
        const currentSpeed = GameSettings.game.playerSpeed * this.speedMultiplier
        if (leftPressed) {
          this.setVelocityX(-currentSpeed)
        } else if (rightPressed) {
          this.setVelocityX(currentSpeed)
        }
      }
      
      // Exit climbing with jump (always full jump from ladder)
      if (jumpJustPressed) {
        this.exitClimbing()
        this.setVelocityY(this.MAX_JUMP_VELOCITY)
      }
    }
    
    // Handle bubble system timing
    this.updateBubbleSystem()
    
    // Handle smart animation system
    this.updateSmartAnimations()
    
    // Update two-layer running sprites position
    this.updateTwoLayerPosition()
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
    
    // IMMEDIATELY set climbing sprite to prevent idle sprite from showing
    this.currentClimbFoot = 'left'
    this.changePlayerTexture('playerClimbLeftFoot')
    this.climbAnimationTimer = 0
    this.resetAnimationTimers()
    this.resetRunningTilt() // Reset any running tilt when starting to climb
  }
  
  exitClimbing(): void {
    this.isClimbing = false
    this.currentLadder = null
    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      this.body.setAllowGravity(true)
    }
    
    // Reset to idle sprite immediately when exiting climbing
    // The smart animation system will handle transitioning to running if moving
    this.currentFrame = 'idle'
    this.changePlayerTexture('playerIdleEye1')
    this.resetAnimationTimers()
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
  
  setSpeedMultiplier(multiplier: number): void {
    this.speedMultiplier = multiplier
  }
  
  private updateBubbleSystem(): void {
    const deltaTime = this.scene.game.loop.delta
    const onGround = this.body!.blocked.down
    
    // Check if player is truly idle (not moving, not climbing, not jumping, on ground)
    const playerIsIdle = !this.isMoving && !this.isClimbing && !this.isJumping && onGround
    
    if (playerIsIdle && !this.bubbleActive) {
      // Player is idle and no bubble is active - increment timer
      this.idleTimer += deltaTime
      
      if (this.idleTimer >= this.IDLE_THRESHOLD) {
        // Trigger bubble after 5 seconds of idle
        if (this.onBubbleTrigger) {
          this.onBubbleTrigger()
        }
        this.idleTimer = 0 // Reset timer
      }
    } else {
      // Player is moving or bubble is active - reset timer
      if ((this.isMoving || this.isClimbing || this.isJumping) && this.bubbleActive && this.onMovementStart) {
        // Player started moving while bubble was active - hide bubble immediately
        this.onMovementStart()
      }
      this.idleTimer = 0
    }
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
    else if (!onGround && this.isJumping) {
      this.handleJumpingAnimation()
    }
    // Priority 3: Running/walking animations (immediate when moving on ground)
    else if (this.isMoving && onGround) {
      this.handleRunningAnimation(deltaTime)
    }
    // Priority 4: Idle animations (immediate when on ground and not moving)
    else if (onGround) {
      this.handleIdleAnimation(deltaTime)
    }
  }
  
  private handleJumpingAnimation(): void {
    // Use direction-based jumping sprites
    const textureKey = this.flipX ? 'playerJumpLeftFoot' : 'playerJumpRightFoot'
    this.changePlayerTexture(textureKey)
    this.currentFrame = 'idle' // Reset frame when jumping
    
    // Hide two-layer running system when jumping
    this.showTwoLayerRunning(false)
    
    // Reset running tilt when jumping
    this.resetRunningTilt()
  }
  
  private handleClimbingAnimation(deltaTime: number): void {
    const climbAnimationSpeed = 120 // Fun, active climbing animation (20% slower than 100ms)
    
    // Hide two-layer running system when climbing
    this.showTwoLayerRunning(false)
    
    // Animation timer for climbing movement
    this.climbAnimationTimer += deltaTime
    
    if (this.climbAnimationTimer >= climbAnimationSpeed && this.isMoving) {
      // Only animate when actually moving on the ladder
      // Alternate feet while climbing to match ladder movement
      if (this.currentClimbFoot === 'left') {
        this.currentClimbFoot = 'right'
        this.changePlayerTexture('playerClimbRightFoot')
      } else {
        this.currentClimbFoot = 'left'
        this.changePlayerTexture('playerClimbLeftFoot')
      }
      this.climbAnimationTimer = 0
    } else if (!this.isMoving) {
      // Show static climbing pose when on ladder but not moving
      this.changePlayerTexture('playerClimbLeftFoot')
      this.resetAnimationTimers()
    }
  }
  
  private handleRunningAnimation(deltaTime: number): void {
    // Check if we should use the new two-layer system
    if (this.useTwoLayerRunning && this.runBodySprite && this.runLegsSprite) {
      // 50% faster leg animation (110ms * 0.5 = 55ms)
      const legAnimationSpeed = 55 // Very fast leg movement
      const bodyAnimationSpeed = 800 // Slower body expression changes
      
      // IMMEDIATE RESPONSE: Start two-layer animation instantly when movement begins
      if (this.currentFrame === 'idle') {
        this.currentFrame = 'leftStep' // Set to running state
        this.showTwoLayerRunning(true)
        this.legAnimationTimer = 0
        this.bodyAnimationTimer = 0
        this.runningTiltTimer = 0
        this.lastFrameWasJump = false
        this.legAnimationStep = 0 // Reset leg animation to start
        return
      }
      
      this.legAnimationTimer += deltaTime
      this.bodyAnimationTimer += deltaTime
      
      // Keep two-layer system visible (position updated separately)
      this.showTwoLayerRunning(true)
      
      // Update leg animation at fast rate
      if (this.legAnimationTimer >= legAnimationSpeed) {
        this.updateLegAnimation()
        this.legAnimationTimer = 0
      }
      
      // Only update body expression when we actually want to change it
      // For now, don't call updateBodyExpression() at all since we're using a single sprite
      // The body will remain perfectly still and clean
      
      // Future: Only update when you want random expressions
      // if (this.bodyAnimationTimer >= bodyAnimationSpeed) {
      //   this.updateBodyExpression()
      //   this.bodyAnimationTimer = 0
      // }
    } else {
      // Fall back to original single-sprite animation system
      const runAnimationSpeed = 120 // Original timing
      
      // IMMEDIATE RESPONSE: Start running animation instantly when movement begins
      if (this.currentFrame === 'idle') {
        this.currentFrame = 'leftStep'
        this.changePlayerTexture('playerRunLeftFoot')
        this.walkAnimationTimer = 0
        this.runningTiltTimer = 0
        this.lastFrameWasJump = false
        return
      }
      
      this.walkAnimationTimer += deltaTime
      this.runningTiltTimer += deltaTime
      
      // Apply subtle forward/backward tilt for motion sense (ONLY during running)
      this.applyRunningTilt()
      
      if (this.walkAnimationTimer >= runAnimationSpeed) {
        // Simple alternating animation for fallback
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
      this.legAnimationTimer = 0
      this.bodyAnimationTimer = 0
      
      // Hide two-layer running system when going to idle
      this.showTwoLayerRunning(false)
      
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

  private triggerHapticFeedback(): void {
    // Trigger haptic feedback through GameScene
    const gameScene = this.scene as any
    if (gameScene && gameScene.triggerFarcadeHapticFeedback) {
      gameScene.triggerFarcadeHapticFeedback()
    }
  }
}