import GameSettings from "../config/GameSettings"

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private isClimbing: boolean = false
  private currentLadder: Phaser.GameObjects.GameObject | null = null
  
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
  
  update(): void {
    const onGround = this.body!.blocked.down
    const spaceKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    
    // Horizontal movement
    if (!this.isClimbing) {
      if (this.cursors.left.isDown) {
        this.setVelocityX(-GameSettings.game.playerSpeed)
      } else if (this.cursors.right.isDown) {
        this.setVelocityX(GameSettings.game.playerSpeed)
      } else {
        this.setVelocityX(0)
      }
      
      // Jumping
      if (Phaser.Input.Keyboard.JustDown(spaceKey) && onGround) {
        this.setVelocityY(GameSettings.game.jumpVelocity)
      }
    }
    
    // Ladder climbing logic
    if (this.isClimbing) {
      // Disable gravity while climbing
      this.body!.setAllowGravity(false)
      this.setVelocityX(0)
      
      if (this.cursors.up.isDown) {
        this.setVelocityY(-GameSettings.game.climbSpeed)
      } else if (this.cursors.down.isDown) {
        this.setVelocityY(GameSettings.game.climbSpeed)
      } else {
        this.setVelocityY(0)
      }
      
      // Allow horizontal movement at top of ladder when standing on platform
      if (onGround && this.cursors.up.isUp) {
        if (this.cursors.left.isDown || this.cursors.right.isDown) {
          this.exitClimbing()
        }
      }
      
      // Exit climbing with jump
      if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
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
    if (this.cursors.up.isDown || this.cursors.down.isDown) {
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