import GameSettings from "../config/GameSettings"
import { TouchControls } from "./TouchControls"

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private isClimbing: boolean = false
  private currentLadder: Phaser.GameObjects.GameObject | null = null
  private touchControls: TouchControls | null = null
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Create a placeholder sprite (colored rectangle for now)
    const graphics = scene.add.graphics()
    graphics.fillStyle(0x00ff00, 1)
    graphics.fillRect(0, 0, 24, 32)
    graphics.generateTexture('player', 24, 32)
    graphics.destroy()
    
    super(scene, x, y, 'player')
    
    scene.add.existing(this)
    scene.physics.add.existing(this)
    
    // Set up physics properties (world bounds set in GameScene to allow full floor movement)
    this.setCollideWorldBounds(true)
    this.setBounce(0)
    this.setSize(20, 30)
    this.setOffset(2, 2)
    this.setDepth(20) // Player renders on top of everything
    
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
    
    // Get input from keyboard or touch controls
    const leftPressed = this.cursors.left.isDown || (this.touchControls?.getHorizontal() || 0) < -0.3
    const rightPressed = this.cursors.right.isDown || (this.touchControls?.getHorizontal() || 0) > 0.3
    const upPressed = this.cursors.up.isDown || (this.touchControls?.getVertical() || 0) < -0.3
    const downPressed = this.cursors.down.isDown || (this.touchControls?.getVertical() || 0) > 0.3
    const jumpJustPressed = Phaser.Input.Keyboard.JustDown(spaceKey) || (this.touchControls?.isJumpJustPressed() || false)
    
    // Horizontal movement
    if (!this.isClimbing) {
      if (leftPressed) {
        this.setVelocityX(-GameSettings.game.playerSpeed)
      } else if (rightPressed) {
        this.setVelocityX(GameSettings.game.playerSpeed)
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
      this.body!.setAllowGravity(false)
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
        if (leftPressed || rightPressed) {
          this.exitClimbing()
        }
      }
      
      // Exit climbing with jump
      if (jumpJustPressed) {
        this.exitClimbing()
        this.setVelocityY(GameSettings.game.jumpVelocity)
      }
    }
  }
  
  startClimbing(ladder: Phaser.GameObjects.GameObject): void {
    this.isClimbing = true
    this.currentLadder = ladder
    this.body!.setAllowGravity(false)
    // Center player on ladder
    const ladderSprite = ladder as Phaser.GameObjects.Rectangle
    this.x = ladderSprite.x
  }
  
  exitClimbing(): void {
    this.isClimbing = false
    this.currentLadder = null
    this.body!.setAllowGravity(true)
  }
  
  checkLadderProximity(ladder: Phaser.GameObjects.GameObject): boolean {
    // Check if player is pressing up or down near a ladder
    const upPressed = this.cursors.up.isDown || (this.touchControls?.getVertical() || 0) < -0.3
    const downPressed = this.cursors.down.isDown || (this.touchControls?.getVertical() || 0) > 0.3
    
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
}