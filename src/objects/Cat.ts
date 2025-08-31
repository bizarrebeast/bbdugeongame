import GameSettings from "../config/GameSettings"

export enum CatColor {
  BLUE = 'blue',
  YELLOW = 'yellow',
  GREEN = 'green',
  RED = 'red'
}

/**
 * IMPORTANT: Phaser setOffset() Coordinate System Reference
 * ======================================================
 * setOffset(x, y) positions the sprite's TOP-LEFT corner relative to the physics body
 * 
 * Y-AXIS BEHAVIOR:
 * - SMALLER Y offset = sprite moves DOWN (towards bottom of screen)
 * - LARGER Y offset = sprite moves UP (towards top of screen)
 * 
 * X-AXIS BEHAVIOR:
 * - SMALLER X offset = sprite moves LEFT
 * - LARGER X offset = sprite moves RIGHT
 * 
 * VISUAL DIRECTION HELPERS:
 * - To move sprite DOWN: SUBTRACT from Y offset
 * - To move sprite UP: ADD to Y offset
 * - To move sprite LEFT: SUBTRACT from X offset  
 * - To move sprite RIGHT: ADD to X offset
 */
export class Cat extends Phaser.Physics.Arcade.Sprite {
  private baseSpeed: number = 80
  private moveSpeed: number
  private direction: number
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
  private blueTextureFixed: boolean = false  // Track if we've already fixed the texture
  
  // Stuck detection for Chompers
  private stuckTimer: number = 0
  private lastPositionX: number = 0
  private stuckThreshold: number = 2000 // 2 seconds max for any animation
  private positionCheckInterval: number = 500 // Check position every 0.5 seconds
  private positionCheckTimer: number = 0
  
  // Individual speed variation to prevent clustering
  private individualSpeedMultiplier: number = 1
  private turnDelayTimer: number = 0
  
  // Red enemy animation system
  private redEnemyAnimationState: 'patrol' | 'bite_starting' | 'bite_opening' | 'bite_wide' | 'bite_closing' = 'patrol'
  private redBiteTimer: number = 0
  private redBlinkTimer: number = 0
  private redBiteSequenceTimer: number = 0
  private redEyeState: 1 | 2 = 1
  private nextRedBiteTime: number = 0
  private nextRedBlinkTime: number = 0
  private redBiteFrameIndex: number = 0
  
  // Green enemy (Bouncer) animation system
  private greenEnemyAnimationState: 'eyeRight' | 'eyeCenter' | 'eyeLeft' | 'blinking' = 'eyeRight'
  private greenEyeTimer: number = 0
  private greenBlinkTimer: number = 0
  private nextGreenEyeTime: number = 0
  private nextGreenBlinkTime: number = 0
  
  // Stalker properties (special type of red enemy)
  private isStalker: boolean = false
  private stalkerState: 'hidden' | 'activated' | 'chasing' = 'hidden'
  private stalkerTriggerDistance: number = 64  // Increased from 32 to 64 pixels (2 tiles)
  private stalkerPlayerRef: Phaser.Physics.Arcade.Sprite | null = null
  private stalkerOriginalY: number = 0
  private stalkerHasPlayerPassed: boolean = false
  private stalkerMineTimer: number = 0
  private stalkerMineDelayDuration: number = 3000 // 3 second delay
  private stalkerCurrentSpeed: number = 80 * 1.5
  private stalkerSpeedIncrement: number = 5
  private stalkerChasePersistenceTimer: number = 0
  private stalkerChasePersistenceDuration: number = 4000 // 4 seconds
  private stalkerIsInPersistentChase: boolean = false
  
  // Stalker eye animation
  private stalkerEyeState: 'eye1' | 'eye2' | 'eye3' | 'eye4' | 'blink' = 'eye1'
  private stalkerEyeAnimationTimer: number = 0
  
  constructor(
    scene: Phaser.Scene, 
    x: number, 
    y: number, 
    platformLeft: number, 
    platformRight: number,
    color?: CatColor | string,
    isStalker: boolean = false
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
    
    // Use proper animation sprites for all enemy types
    let textureKey: string
    
    if (catColor === CatColor.BLUE) {
      textureKey = 'blueEnemyMouthClosed'
    } else if (catColor === CatColor.YELLOW) {
      textureKey = 'yellowEnemyMouthClosedEyeOpen'
    } else if (catColor === CatColor.GREEN) {
      textureKey = 'greenEnemy'
    } else if (catColor === CatColor.RED) {
      textureKey = 'redEnemyMouthClosedEyes1'
    } else {
      // This shouldn't happen with proper enemy spawning
      // Unexpected cat color fallback (replaced console.log)
      textureKey = 'blueEnemyMouthClosed' // Default fallback
    }
    
    // Now call super with the determined texture
    super(scene, x, y, textureKey)
    
    this.catColor = catColor
    this.isStalker = isStalker
    
    // Set display size for green enemy immediately after creation
    // This prevents the 84x84 default size from being used
    if (catColor === CatColor.GREEN) {
      this.setDisplaySize(36, 36)
      console.log('🟢 GREEN INITIAL: Display size set to 36x36')
    }
    
    // Set up stalker if needed
    if (this.isStalker) {
      this.stalkerOriginalY = y
      // Use stalker enemy sprites
      if (scene.textures.exists('stalkerEnemyEye1')) {
        this.setTexture('stalkerEnemyEye1')
      }
      this.stalkerEyeState = 'eye1'
      // Stalker cat creation (replaced console.log)
    }
    
    scene.add.existing(this)
    scene.physics.add.existing(this)
    
    // Caterpillar enemy debug info (replaced console.log)
    
    // Apply enemy hitbox sizing AFTER physics body is created
    if (catColor === CatColor.BLUE && this.body instanceof Phaser.Physics.Arcade.Body) {
      this.body.setSize(63.5, 45)  // Decreased width by 4px: 67.5-4=63.5, height stays 45
      
      // Adjust physics body offset to align with sprite visual
      const isAnimationSprite = this.isBlueEnemyAnimationSprite(textureKey)
      const spriteYOffset = isAnimationSprite ? 32 : 19  // Updated offsets after moving down 26px total
      
      // Center the hitbox on the sprite visual
      this.body.setOffset(-15.75 + 2, spriteYOffset - 4.5) // Center horizontally with 2px left offset
      
    } else if (catColor === CatColor.YELLOW && this.body instanceof Phaser.Physics.Arcade.Body) {
      // Decrease Caterpillar (yellow enemy) hitbox by 30%
      const defaultWidth = this.body.width
      const defaultHeight = this.body.height
      this.body.setSize(defaultWidth * 0.7, defaultHeight * 0.7)
      
      // Center the smaller hitbox horizontally and align bottom edges
      const hitboxCenterOffsetX = (defaultWidth - this.body.width) / 2
      const hitboxCenterOffsetY = (defaultHeight - this.body.height) / 2
      this.body.setOffset(hitboxCenterOffsetX, hitboxCenterOffsetY)
      
      // Caterpillar hitbox debug info (replaced console.log)
      
    } else if (catColor === CatColor.RED && this.body instanceof Phaser.Physics.Arcade.Body) {
      // Increase Snail (red patrol enemy) hitbox by 50%
      this.body.setSize(48, 48)  // 32*1.5=48 for both dimensions
      // Center the larger hitbox on the sprite (accounting for 14px sprite offset down)
      this.body.setOffset(-8, -8 + 14)  // Offset to center: (-8, 6) to account for sprite movement
    } else if (catColor === CatColor.GREEN && this.body instanceof Phaser.Physics.Arcade.Body) {
      // Green bouncer - custom hitbox size 26x22 in screen pixels
      // Phaser's setSize works in texture space, not display space
      // If texture is 84x84 displayed at 36x36, scale is 36/84 = 0.428571
      // To get 26x22 screen pixels, we need: 26/0.428571 = 60.67, 22/0.428571 = 51.33
      const textureWidth = this.texture.get().width
      const textureHeight = this.texture.get().height
      const scaleX = this.displayWidth / textureWidth
      const scaleY = this.displayHeight / textureHeight
      
      // Calculate the body size in texture space to achieve desired screen size
      const desiredScreenWidth = 26
      const desiredScreenHeight = 22
      const bodyWidthInTextureSpace = desiredScreenWidth / scaleX
      const bodyHeightInTextureSpace = desiredScreenHeight / scaleY
      
      this.body.setSize(bodyWidthInTextureSpace, bodyHeightInTextureSpace)
      
      console.log('🟢 GREEN BOUNCER HITBOX SETUP:')
      console.log('  Body size requested: 26 x 22')
      console.log('  Body size actual:', this.body.width, 'x', this.body.height)
      console.log('  Current sprite display size:', this.displayWidth, 'x', this.displayHeight)
      console.log('  Sprite position:', this.x, ',', this.y)
      console.log('  Texture key:', this.texture.key)
      console.log('  Texture frame size:', this.texture.get().width, 'x', this.texture.get().height)
      
      // The physics body offset positions the hitbox relative to the sprite's top-left corner
      // Keep the hitbox centered as it was working correctly
      // To move visual sprite up 5px relative to the hitbox:
      // We offset the hitbox down 5px from center
      
      // First center the hitbox (this was correct)
      const hitboxCenterX = (textureWidth - bodyWidthInTextureSpace) / 2
      const hitboxCenterY = (textureHeight - bodyHeightInTextureSpace) / 2
      
      // Apply visual offset: sprite up 5px means hitbox down 5px
      const visualOffsetX = 0  // No horizontal offset
      const visualOffsetY = 5 / scaleY  // Move hitbox down in texture space
      
      this.body.setOffset(hitboxCenterX + visualOffsetX, hitboxCenterY + visualOffsetY)
      
      console.log('  Physics offset applied:', this.body.offset.x, ',', this.body.offset.y)
      console.log('  Scales:', scaleX, scaleY)
      console.log('  Visual offset in texture space:', visualOffsetX, visualOffsetY)
    }
    
    this.setCollideWorldBounds(true)
    this.setBounce(0)
    
    // Only green enemies (bouncing) need gravity
    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      if (catColor !== CatColor.GREEN) {
        this.body.setAllowGravity(false) // Blue, Yellow, Red patrol without gravity
      } else {
        // Green enemies keep gravity for bouncing behavior
        // Green enemy physics setup (replaced console.log)
      }
    }
    
    // Set up hitbox and visual alignment
    if (catColor === CatColor.YELLOW && this.isYellowEnemyAnimationSprite(textureKey)) {
      // For all yellow enemy animation sprites - use 54x21.6 size (90% of original)
      this.setDisplaySize(54, 21.6)
      
      // Align bottom edge of sprite with bottom edge of hitbox
      // setOffset positions the TOP-LEFT corner of the sprite
      // Sprite: 54x21.6, Hitbox: 70x28 (after 30% reduction)
      // To align bottom edges:
      // - X: Center sprite horizontally relative to hitbox: (70-54)/2 = 8px to the right
      // - Y: Move sprite down so bottoms align: (28-21.6) = 6.4px down
      this.setOffset(15, 4) // Moved 20 pixels left total (-5 + 20 = 15)
      
      // Caterpillar sprite offset debug (replaced console.log)
      
      this.setFlipX(false)
      this.initializeYellowEnemyAnimations()
      this.addDebugVisualization()
    } else if (catColor === CatColor.BLUE && this.isBlueEnemyAnimationSprite(textureKey)) {
      // For all blue enemy animation sprites - use consistent positioning
      this.setDisplaySize(36, 36)
      this.setOffset(3 - 2 + 4, 58 - 18 - 8) // Move left 6px total (2px + 4px) and down 26 pixels
      this.setFlipX(false)
      this.initializeBlueEnemyAnimations()
      this.addDebugVisualization()
    } else if (catColor === CatColor.RED && this.isRedEnemyAnimationSprite(textureKey)) {
      // For red enemy animation sprites - fine-tuned positioning
      const displaySize = this.isStalker ? 42 : 52 // Stalkers: 20% smaller (42x42), regular red: (52x52)
      this.setDisplaySize(displaySize, displaySize)
      // Adjust offset for stalkers vs regular red enemies  
      // Calculate Y offset: stalkers=24 (UP 6px), snails=26 (DOWN 4px from original 30)
      const yOffset = this.isStalker ? (44 - 12 - 2 - 6) : ((44 - 12 - 2) - 4) 
      this.setOffset(18, yOffset) // X=18 (moved LEFT 15px), Y=24/26 (stalkers UP, snails DOWN)
      this.setFlipX(false)
      this.initializeRedEnemyAnimations()
      this.addDebugVisualization()
      
      if (this.isStalker) {
        // Stalker sprite positioning info (replaced console.log)
      }
    } else if (catColor === CatColor.GREEN && textureKey === 'greenEnemy') {
      // Green enemy - display size already set in constructor
      // Offset is handled in the physics body setup, not here
      this.setFlipX(false)
      this.addDebugVisualization()
      
      console.log('🟢 GREEN VISUAL FINAL:')
      console.log('  Display size remains:', this.displayWidth, 'x', this.displayHeight)
      console.log('  Physics body handles visual offset')
    } else {
      // No fallback needed - all enemies should use proper animation sprites
      // Unknown sprite warning (replaced console.log)
      this.addDebugVisualization()
    }
    
    // === FINAL VERIFICATION ===
    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      // Enemy constructor complete (replaced console.log)
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
    
    // Special setup for stalkers
    if (this.isStalker) {
      // Start hidden
      this.setVisible(false)
      this.setVelocity(0, 0)
      this.body!.setGravityY(0) // No gravity for stalkers
      this.body!.setImmovable(true) // Don't move while hidden
      // Stalker hidden and waiting (replaced console.log)
    } else {
      this.setVelocityX(this.moveSpeed * this.direction)
    }
  }
  
  private setupBehavior(): void {
    // Add individual speed variation to prevent clustering (85% to 115%)
    this.individualSpeedMultiplier = 0.85 + Math.random() * 0.3
    
    // Get current level from scene if available
    const scene = this.scene as any
    const currentLevel = scene.levelManager?.getCurrentLevel() || 1
    const isEarlyLevel = currentLevel <= 10
    
    switch (this.catColor) {
      case CatColor.BLUE:
        this.moveSpeed = this.baseSpeed * this.individualSpeedMultiplier
        break
      case CatColor.YELLOW:
        // Even slower in early levels for better predictability
        const yellowSpeedMultiplier = isEarlyLevel ? 0.4 : 0.6  // 40% speed in levels 1-10, 60% after
        this.moveSpeed = this.baseSpeed * yellowSpeedMultiplier * this.individualSpeedMultiplier
        break
      case CatColor.GREEN:
        // Reduce green bouncer speed for more manageable gameplay
        this.moveSpeed = this.baseSpeed * 1.0 * this.individualSpeedMultiplier  // Reduced from 1.5x to 1.0x
        break
      case CatColor.RED:
        this.moveSpeed = this.baseSpeed * 1.2 * this.individualSpeedMultiplier // Fast but not as fast as green
        break
    }
    
    // Initial direction - more predictable in early levels
    if (this.catColor === CatColor.YELLOW && isEarlyLevel) {
      // In early levels, yellow enemies tend to move away from spawn center
      // This gives players more time to react
      const centerX = (this.platformBounds.left + this.platformBounds.right) / 2
      this.direction = this.x < centerX ? -1 : 1  // Move towards edges
    } else if (this.catColor === CatColor.GREEN) {
      // Green enemies: randomize initial direction to prevent clustering
      this.direction = Math.random() < 0.5 ? -1 : 1
      // Also randomize initial bounce timer to prevent synchronized bouncing
      this.bounceTimer = Math.random() * 1500  // Random start between 0-1.5 seconds
    } else {
      // Random initial direction for other enemies and later levels
      this.direction = Math.random() < 0.5 ? -1 : 1
    }
  }
  
  
  update(time: number, delta: number): void {
    if (this.isSquished) return
    
    // Update collision cooldown for all enemy types
    this.collisionCooldown -= delta
    
    // Special handling for stalkers
    if (this.isStalker) {
      this.updateStalker(delta)
      return
    }
    
    // Movement logging temporarily disabled to see creation logs
    
    switch (this.catColor) {
      case CatColor.BLUE:
        this.updateBluePatrol()
        this.updateBlueEnemyAnimations(delta)
        this.checkIfChomperStuck(delta)  // Check for stuck state
        break
      case CatColor.YELLOW:
        this.updateYellowPatrol(delta)
        this.updateYellowEnemyAnimations(delta)
        break
      case CatColor.GREEN:
        this.updateGreenBounce(delta)
        this.updateGreenEnemyAnimations(delta)
        break
      case CatColor.RED:
        this.updateRedPatrol()
        this.updateRedEnemyAnimations(delta)
        break
    }
  }
  
  private updateBluePatrol(): void {
    // PAUSE MOVEMENT during bite animations to prevent getting stuck
    if (this.blueEnemyAnimationState === 'bite_partial' || 
        this.blueEnemyAnimationState === 'bite_full') {
      this.setVelocityX(0) // Stop moving during bite
      return // Skip rest of patrol logic
    }
    
    // Handle turn delay timer
    if (this.turnDelayTimer > 0) {
      this.turnDelayTimer -= Phaser.Math.Clamp(16, 0, 100) // Use fixed delta approximation
    }
    
    // Check for edge proximity and turn around if too close during idle
    const edgeBuffer = 32 // 1 tile buffer from edges
    if (this.x <= this.platformBounds.left + edgeBuffer) {
      if (this.turnDelayTimer <= 0) {
        this.direction = 1
        // Add small random delay to prevent synchronized turning (50-200ms)
        this.turnDelayTimer = 50 + Math.random() * 150
        // If we're about to bite and near edge, delay the bite
        if (this.biteTimer >= this.nextBiteTime) {
          this.nextBiteTime = this.biteTimer + 500 // Delay bite by 0.5s
        }
      }
    } else if (this.x >= this.platformBounds.right - edgeBuffer) {
      if (this.turnDelayTimer <= 0) {
        this.direction = -1
        // Add small random delay to prevent synchronized turning (50-200ms)
        this.turnDelayTimer = 50 + Math.random() * 150
        // If we're about to bite and near edge, delay the bite
        if (this.biteTimer >= this.nextBiteTime) {
          this.nextBiteTime = this.biteTimer + 500 // Delay bite by 0.5s
        }
      }
    }
    
    // Normal patrol movement
    this.setVelocityX(this.moveSpeed * this.direction)
    
    // Update sprite flip for all blue enemy sprites
    if (this.catColor === CatColor.BLUE) {
      this.setFlipX(this.direction > 0) // Flip when moving right
    }
  }
  
  private updateYellowPatrol(delta: number): void {
    // Get current level from scene if available
    const scene = this.scene as any
    const currentLevel = scene.levelManager?.getCurrentLevel() || 1
    const isEarlyLevel = currentLevel <= 10
    
    this.randomMoveTimer -= delta
    
    if (this.randomMoveTimer <= 0) {
      // In levels 1-10: Much more predictable movement
      // In later levels: Original erratic behavior
      const changeChance = isEarlyLevel ? 0.05 : 0.3  // 5% vs 30% chance to change direction
      
      if (Math.random() < changeChance) {
        this.direction = Math.random() < 0.5 ? -1 : 1
      }
      
      // More consistent timing in early levels
      if (isEarlyLevel) {
        this.randomMoveTimer = 2000 + Math.random() * 1000  // 2-3 seconds (predictable)
      } else {
        this.randomMoveTimer = 500 + Math.random() * 1000   // 0.5-1.5 seconds (erratic)
      }
    }
    
    // Handle turn delay timer
    if (this.turnDelayTimer > 0) {
      this.turnDelayTimer -= delta
    }
    
    // Check boundaries with turn delay to prevent synchronized turning
    if (this.x <= this.platformBounds.left + 10) {
      if (this.turnDelayTimer <= 0) {
        this.direction = 1
        // Add random delay before next possible turn (100-500ms)
        this.turnDelayTimer = 100 + Math.random() * 400
      }
    } else if (this.x >= this.platformBounds.right - 10) {
      if (this.turnDelayTimer <= 0) {
        this.direction = -1
        // Add random delay before next possible turn (100-500ms)
        this.turnDelayTimer = 100 + Math.random() * 400
      }
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
      // Add more randomness to bounce timing to prevent clustering
      this.bounceTimer = 1000 + Math.random() * 1000  // 1-2 seconds (was 0.8-1.2)
    }
    
    // Green enemies patrol the full width of their platform
    // Use larger margins to ensure they travel the full width
    if (this.x <= this.platformBounds.left + 20) {
      this.direction = 1
      // Add small random speed variation when turning to prevent clustering
      const variation = 0.9 + Math.random() * 0.2
      this.setVelocityX(this.moveSpeed * this.direction * variation)
    } else if (this.x >= this.platformBounds.right - 20) {
      this.direction = -1
      // Add small random speed variation when turning to prevent clustering
      const variation = 0.9 + Math.random() * 0.2
      this.setVelocityX(this.moveSpeed * this.direction * variation)
    } else {
      // Maintain current velocity while not at edges
      this.setVelocityX(this.moveSpeed * this.direction)
    }
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
      // Only fix the texture once, not every frame
      if (this.catColor === CatColor.BLUE && !this.blueTextureFixed && this.scene.textures.exists('blueEnemyMouthClosed')) {
        this.setTexture('blueEnemyMouthClosed')
        this.setDisplaySize(36, 36)
        this.blueTextureFixed = true  // Mark as fixed so we don't keep resetting
        // Re-initialize animations after fixing texture
        this.initializeBlueEnemyAnimations()
      }
      return
    }
    
    // Reset the fixed flag if we have a valid texture now
    this.blueTextureFixed = false
    
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
    } else if (this.biteAnimationTimer > 400) {
      // SAFETY: Force transition if taking too long
      console.warn('Bite partial state exceeded max duration - forcing transition')
      this.blueEnemyAnimationState = 'idle'
      this.biteAnimationTimer = 0
      this.nextBiteTime = this.biteTimer + 3000 // Delay next bite
    } else {
      // Normal transition to full bite
      this.blueEnemyAnimationState = 'bite_full'
      this.biteAnimationTimer = 0
    }
  }
  
  private handleBiteFullState(): void {
    if (this.biteAnimationTimer < 200) {
      // Full bite - mouth wide open
      this.changeBlueEnemyTexture('blueEnemyMouthOpen')
    } else if (this.biteAnimationTimer > 500) {
      // SAFETY: Force end if taking too long
      console.warn('Bite full state exceeded max duration - forcing idle')
      this.blueEnemyAnimationState = 'idle'
      this.biteAnimationTimer = 0
      this.nextBiteTime = this.biteTimer + 3000 // Delay next bite
    } else {
      // Normal return to idle
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
    
    // Check for blink trigger - CANNOT interrupt bite animations
    // This prevents the stuck biting issue
    if (this.blinkTimer >= this.nextBlinkTime && 
        this.blueEnemyAnimationState !== 'blinking' &&
        this.blueEnemyAnimationState !== 'bite_partial' &&  // Don't interrupt bite
        this.blueEnemyAnimationState !== 'bite_full') {      // Don't interrupt bite
      this.blueEnemyAnimationState = 'blinking'
      this.blinkAnimationTimer = 0
    }
  }
  
  private changeBlueEnemyTexture(textureKey: string): void {
    // Check if scene still exists (enemy might be destroyed or scene cleaning up)
    if (!this.scene) return
    
    if (this.scene.textures.exists(textureKey)) {
      this.setTexture(textureKey)
      // Maintain consistent display size and positioning
      this.setDisplaySize(36, 36)
      
      // Maintain current flip state based on movement direction
      // Don't change flip here - it's already handled in updateBluePatrol
      // Just preserve the current flip state
    } else {
      // Fallback to default texture if requested texture doesn't exist
      if (this.scene.textures.exists('blueEnemyMouthClosed')) {
        this.setTexture('blueEnemyMouthClosed')
        this.setDisplaySize(36, 36)
      }
    }
  }
  
  private checkIfChomperStuck(delta: number): void {
    // Only check during bite animations
    if (this.blueEnemyAnimationState === 'bite_partial' || 
        this.blueEnemyAnimationState === 'bite_full') {
      
      // Check if position hasn't changed
      this.positionCheckTimer += delta
      if (this.positionCheckTimer >= this.positionCheckInterval) {
        const currentX = this.x
        const moved = Math.abs(currentX - this.lastPositionX) > 1
        
        if (!moved && Math.abs(this.body!.velocity.x) < 1) {
          // Not moving during bite - increment stuck timer
          this.stuckTimer += this.positionCheckInterval
          console.warn(`Chomper stuck for ${this.stuckTimer}ms at position ${currentX}`)
        } else {
          // Moving normally, reset stuck timer
          this.stuckTimer = 0
        }
        
        this.lastPositionX = currentX
        this.positionCheckTimer = 0
      }
      
      // Check if animation is taking too long
      if (this.biteAnimationTimer > 500) {
        console.warn('Bite animation taking too long - forcing reset')
        this.forceResetChomper()
      }
      
      // Check if stuck for too long
      if (this.stuckTimer >= this.stuckThreshold) {
        console.error('Chomper stuck for 2+ seconds - forcing recovery!')
        this.forceResetChomper()
      }
    } else {
      // Not in bite animation, reset timers
      this.stuckTimer = 0
      this.positionCheckTimer = 0
      this.lastPositionX = this.x
    }
  }
  
  private forceResetChomper(): void {
    console.warn('=== FORCE RESETTING STUCK CHOMPER ===')
    
    // Reset animation state
    this.blueEnemyAnimationState = 'idle'
    this.biteAnimationTimer = 0
    this.blinkAnimationTimer = 0
    
    // Delay next bite to prevent immediate re-trigger
    this.nextBiteTime = this.biteTimer + 4000 // 4 second delay
    
    // Reset stuck detection
    this.stuckTimer = 0
    this.positionCheckTimer = 0
    
    // Force texture update
    this.changeBlueEnemyTexture('blueEnemyMouthClosed')
    
    // Check for edge and force direction change if needed
    if (this.x <= this.platformBounds.left + 32) {
      this.direction = 1 // Go right
    } else if (this.x >= this.platformBounds.right - 32) {
      this.direction = -1 // Go left
    }
    
    // Force movement resume
    this.setVelocityX(this.moveSpeed * this.direction)
    
    // Mark this enemy as potentially problematic
    this.setData('recoveredFromStuck', true)
    this.setData('stuckRecoveryCount', (this.getData('stuckRecoveryCount') || 0) + 1)
    
    // If stuck too many times, mark for replacement
    if (this.getData('stuckRecoveryCount') >= 3) {
      console.error('Chomper stuck 3+ times - marking for replacement')
      this.setData('needsReplacement', true)
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
    // Check if scene still exists (enemy might be destroyed or scene cleaning up)
    if (!this.scene) return
    
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
  
  // ============== STALKER METHODS ==============
  
  setPlayerReference(player: Phaser.Physics.Arcade.Sprite): void {
    this.stalkerPlayerRef = player
  }
  
  canDamagePlayer(): boolean {
    // Stalkers can only damage the player after popping out
    return this.isStalker && this.stalkerState === 'chasing'
  }
  
  private updateStalker(delta: number): void {
    if (!this.stalkerPlayerRef) return
    
    // Position tracking for debug (replaced console.log)
    const previousY = this.y
    
    switch (this.stalkerState) {
      case 'hidden':
        this.updateStalkerHidden()
        break
      case 'activated':
        this.updateStalkerActivated(delta)
        break
      case 'chasing':
        this.updateStalkerChasing(delta)
        this.updateStalkerEyeAnimations(delta)
        break
    }
    
    // Y position change tracking (replaced console.log)
    if (Math.abs(this.y - previousY) > 0.1) {
      // Y position changed unexpectedly (replaced console.log)
    }
  }
  
  private updateStalkerHidden(): void {
    if (!this.stalkerPlayerRef) return
    
    const playerX = this.stalkerPlayerRef.x
    const playerY = this.stalkerPlayerRef.y
    const distanceToPlayer = Math.abs(playerX - this.x)
    
    // Check if player is on same floor or above (not below) - prevent stalker from seeing player below
    const playerIsAboveOrSameLevel = playerY <= this.y + 40 // Player must be at same level or above
    const playerIsNotTooFarAbove = playerY >= this.y - 40 // But not too far above
    const canSeePlayer = playerIsAboveOrSameLevel && playerIsNotTooFarAbove
    
    if (canSeePlayer && distanceToPlayer <= this.stalkerTriggerDistance && !this.stalkerHasPlayerPassed) {
      // Stalker activated (replaced console.log)
      
      // Activate stalker
      this.stalkerState = 'activated'
      this.stalkerMineTimer = this.stalkerMineDelayDuration
      this.stalkerHasPlayerPassed = true
      
      // Show eyes only
      if (this.scene.textures.exists('stalkerEnemyEyeOnly')) {
        this.setTexture('stalkerEnemyEyeOnly')
        // Changed texture to stalkerEnemyEyeOnly (replaced console.log)
      }
      this.setVisible(true)
      // Now visible and activated (replaced console.log)
    }
  }
  
  private updateStalkerActivated(delta: number): void {
    this.stalkerMineTimer -= delta
    
    if (this.stalkerMineTimer <= 0) {
      this.stalkerPopOut()
    }
  }
  
  private stalkerPopOut(): void {
    // Stalker popping out (replaced console.log)
    
    this.stalkerState = 'chasing'
    this.setVisible(true)
    
    // Switch to full stalker sprite
    if (this.scene.textures.exists('stalkerEnemyEye1')) {
      this.setTexture('stalkerEnemyEye1')
      // Changed texture to stalkerEnemyEye1 (replaced console.log)
    }
    this.stalkerEyeState = 'eye1'
    
    // Enable movement
    this.body!.setGravityY(0) // Still no gravity
    this.body!.setImmovable(false) // Allow movement
    // Physics settings (replaced console.log)
    
    // Update original Y to prevent teleporting
    this.stalkerOriginalY = this.y
    // Updated floor lock (replaced console.log)
    
    // Reset speed
    this.stalkerCurrentSpeed = 80 * 1.5
    
    // Start chase persistence
    this.stalkerChasePersistenceTimer = this.stalkerChasePersistenceDuration
    this.stalkerIsInPersistentChase = true
    // Starting persistent chase (replaced console.log)
  }
  
  private updateStalkerChasing(delta: number): void {
    const playerX = this.stalkerPlayerRef!.x
    const playerY = this.stalkerPlayerRef!.y
    
    // Keep Y position stable
    const beforeY = this.y
    this.y = this.stalkerOriginalY
    
    if (Math.abs(beforeY - this.stalkerOriginalY) > 0.1) {
      // Stalker Y correction (replaced console.log)
    }
    
    // Only chase player if they are at same level or above (not below)
    const playerIsAboveOrSameLevel = playerY <= this.y + 40 // Player must be at same level or above
    const playerIsNotTooFarAbove = playerY >= this.y - 120 // But not too far above (increased tolerance for chasing)
    const canChasePlayer = playerIsAboveOrSameLevel && playerIsNotTooFarAbove
    
    // Update chase persistence
    if (this.stalkerIsInPersistentChase) {
      this.stalkerChasePersistenceTimer -= delta
      if (this.stalkerChasePersistenceTimer <= 0) {
        this.stalkerIsInPersistentChase = false
      }
    }
    
    if (canChasePlayer) {
      // Chase the player
      this.stalkerCurrentSpeed += this.stalkerSpeedIncrement * 0.01
      const maxSpeed = 80 * 2.25
      if (this.stalkerCurrentSpeed > maxSpeed) {
        this.stalkerCurrentSpeed = maxSpeed
      }
      
      const direction = playerX > this.x ? 1 : -1
      this.direction = direction
      this.setVelocityX(this.stalkerCurrentSpeed * direction)
    } else {
      // Player too far vertically
      if (this.stalkerIsInPersistentChase) {
        // Continue moving horizontally
        const direction = playerX > this.x ? 1 : -1
        this.direction = direction
        this.setVelocityX(this.stalkerCurrentSpeed * direction * 0.7)
      } else {
        // Patrol like regular red enemy
        this.updateRedPatrol()
      }
    }
  }
  
  private updateStalkerEyeAnimations(delta: number): void {
    // Check if scene still exists (enemy might be destroyed or scene cleaning up)
    if (!this.scene) return
    if (!this.scene.textures.exists('stalkerEnemyEye1')) return
    
    this.stalkerEyeAnimationTimer += delta
    
    let animationSpeed: number
    if (this.stalkerEyeState === 'blink') {
      animationSpeed = 100 + Math.random() * 80
    } else {
      animationSpeed = 1200 + (Math.random() - 0.5) * 800
    }
    
    if (this.stalkerEyeAnimationTimer >= animationSpeed) {
      const randomAction = Math.random()
      
      // Simple eye state transitions
      if (this.stalkerEyeState === 'blink') {
        // Return to a random eye state
        const states = ['eye1', 'eye2', 'eye3', 'eye4'] as const
        this.stalkerEyeState = states[Math.floor(Math.random() * 4)]
      } else {
        // Either blink or change eye position
        if (randomAction < 0.2) {
          this.stalkerEyeState = 'blink'
        } else {
          const states = ['eye1', 'eye2', 'eye3', 'eye4'] as const
          this.stalkerEyeState = states[Math.floor(Math.random() * 4)]
        }
      }
      
      // Apply the texture
      const textureMap = {
        'eye1': 'stalkerEnemyEye1',
        'eye2': 'stalkerEnemyEye2', 
        'eye3': 'stalkerEnemyEye3',
        'eye4': 'stalkerEnemyEye4',
        'blink': 'stalkerEnemyBlinking'
      }
      
      const textureKey = textureMap[this.stalkerEyeState]
      if (this.scene.textures.exists(textureKey)) {
        this.setTexture(textureKey)
      }
      
      this.stalkerEyeAnimationTimer = 0
    }
  }
  
  getIsStalker(): boolean {
    return this.isStalker
  }
  
  private updateGreenEnemyAnimations(delta: number): void {
    // Update timers
    this.greenEyeTimer += delta
    this.greenBlinkTimer += delta
    
    // Initialize next times if not set
    if (this.nextGreenEyeTime === 0) {
      this.nextGreenEyeTime = 1000 + Math.random() * 2000 // 1-3 seconds for eye movement
    }
    if (this.nextGreenBlinkTime === 0) {
      this.nextGreenBlinkTime = 3000 + Math.random() * 4000 // 3-7 seconds between blinks
    }
    
    // Check for blinking (has priority over eye movement)
    if (this.greenBlinkTimer >= this.nextGreenBlinkTime) {
      this.greenEnemyAnimationState = 'blinking'
      this.setTexture('greenEnemyBlink')
      
      // Schedule end of blink (100-150ms)
      setTimeout(() => {
        if (this.greenEnemyAnimationState === 'blinking') {
          // Return to random eye position after blink
          const states: Array<'eyeRight' | 'eyeCenter' | 'eyeLeft'> = ['eyeRight', 'eyeCenter', 'eyeLeft']
          this.greenEnemyAnimationState = states[Math.floor(Math.random() * states.length)]
          this.updateGreenEnemyTexture()
        }
      }, 100 + Math.random() * 50)
      
      // Reset blink timer
      this.greenBlinkTimer = 0
      this.nextGreenBlinkTime = 3000 + Math.random() * 4000
      return
    }
    
    // Check for eye movement (only if not blinking)
    if (this.greenEnemyAnimationState !== 'blinking' && this.greenEyeTimer >= this.nextGreenEyeTime) {
      // Choose a different eye position
      const currentState = this.greenEnemyAnimationState
      const states: Array<'eyeRight' | 'eyeCenter' | 'eyeLeft'> = ['eyeRight', 'eyeCenter', 'eyeLeft']
      const availableStates = states.filter(s => s !== currentState)
      
      this.greenEnemyAnimationState = availableStates[Math.floor(Math.random() * availableStates.length)]
      this.updateGreenEnemyTexture()
      
      // Reset eye timer
      this.greenEyeTimer = 0
      this.nextGreenEyeTime = 800 + Math.random() * 1500 // 0.8-2.3 seconds
    }
  }
  
  private updateGreenEnemyTexture(): void {
    let textureKey = 'greenEnemy' // Default
    
    switch (this.greenEnemyAnimationState) {
      case 'eyeRight':
        textureKey = 'greenEnemy' // Default sprite has eye right
        break
      case 'eyeCenter':
        textureKey = 'greenEnemyEyeCenter'
        break
      case 'eyeLeft':
        textureKey = 'greenEnemyEyeLeft'
        break
      case 'blinking':
        textureKey = 'greenEnemyBlink'
        break
    }
    
    // Check if scene still exists (enemy might be destroyed or scene cleaning up)
    if (!this.scene) return
    
    if (this.scene.textures.exists(textureKey)) {
      this.setTexture(textureKey)
    }
  }
}