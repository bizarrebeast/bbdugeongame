import GameSettings from "../config/GameSettings"
import { Cat, CatColor } from "./Cat"

export class CeilingCat extends Cat {
  private state: 'hidden' | 'activated' | 'chasing' = 'hidden'
  private triggerDistance: number = 32 // 1 tile away to activate mine
  public playerRef: Phaser.Physics.Arcade.Sprite | null = null
  private originalY: number
  private hasPlayerPassed: boolean = false
  private eyesSprite: Phaser.GameObjects.Graphics | null = null
  private mineTimer: number = 0
  private mineDelayDuration: number = 2000 // 2 second delay before popping out
  
  constructor(
    scene: Phaser.Scene, 
    x: number, 
    y: number, 
    platformLeft: number, 
    platformRight: number
  ) {
    super(scene, x, y, platformLeft, platformRight, CatColor.BLUE)
    
    this.originalY = y
    
    // Create a hidden red cat on the floor (normal orientation)
    const graphics = scene.add.graphics()
    graphics.fillStyle(0xff0000, 1) // Red for stalker cat
    graphics.fillCircle(10, 8, 8)
    // Eyes (initially hidden)
    graphics.fillStyle(0x000000, 1)
    graphics.fillCircle(6, 6, 2)
    graphics.fillCircle(14, 6, 2)
    // Normal ears
    graphics.fillStyle(0xff0000, 1)
    graphics.fillTriangle(4, 2, 8, 0, 8, 4)
    graphics.fillTriangle(12, 0, 16, 2, 12, 4)
    graphics.generateTexture('stalker-cat', 20, 16)
    graphics.destroy()
    
    this.setTexture('stalker-cat')
    
    // Start completely hidden
    this.setVisible(false)
    this.setVelocity(0, 0)
    this.body!.setGravityY(0) // Disable gravity completely for stalker cats
    this.body!.setImmovable(true) // Don't move while hidden
    this.setDepth(15) // Same level as other cats
    
    // Create eyes-only sprite for peek state
    this.createEyesSprite()
  }
  
  setPlayerReference(player: Phaser.Physics.Arcade.Sprite): void {
    this.playerRef = player
  }
  
  private createEyesSprite(): void {
    // Create glowing eyes sprite for the peek state
    const eyesGraphics = this.scene.add.graphics()
    eyesGraphics.fillStyle(0xffff00, 1) // Yellow glowing eyes
    eyesGraphics.fillCircle(6, 6, 3) // Slightly larger than normal eyes
    eyesGraphics.fillCircle(14, 6, 3)
    // Add glow effect
    eyesGraphics.fillStyle(0xffff00, 0.3)
    eyesGraphics.fillCircle(6, 6, 5)
    eyesGraphics.fillCircle(14, 6, 5)
    
    this.eyesSprite = eyesGraphics
    // Position eyes exactly at the cat's position (not relative offset)
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
      // Player walked past - activate mine timer
      this.state = 'activated'
      this.mineTimer = this.mineDelayDuration
      this.hasPlayerPassed = true
      
      // Show eyes immediately when activated
      if (this.eyesSprite) {
        this.eyesSprite.setPosition(this.x - 10, this.y - 8)
        this.eyesSprite.setVisible(true)
        console.log('Stalker cat activated - eyes should be visible at', this.x, this.y)
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
      console.log('Stalker cat timer finished - popping out!')
      this.popOut()
    }
  }
  
  private popOut(): void {
    this.state = 'chasing'
    this.setVisible(true) // Show the full cat
    
    // Hide the eyes-only sprite
    if (this.eyesSprite) {
      this.eyesSprite.setVisible(false)
      console.log('Stalker cat popped out - hiding eyes, showing full cat')
    }
    
    // Enable physics for chasing
    this.body!.setGravityY(0) // Keep gravity disabled - stalker cats stay on their floor
    this.body!.setImmovable(false)
    
    // Pop out animation
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      ease: 'Power2',
      yoyo: true
    })
  }
  
  private updateChasing(): void {
    if (this.landingPauseTimer > 0) {
      this.landingPauseTimer -= this.scene.game.loop.delta
      return
    }
    
    // Chase player at 1.5x speed indefinitely (no timer limit)
    const chaseSpeed = 80 * 1.5
    const playerX = this.playerRef!.x
    const playerY = this.playerRef!.y
    const direction = playerX > this.x ? 1 : -1
    
    // Allow movement across platform boundaries - don't restrict to original platform
    // Check world boundaries instead
    const worldWidth = 24 * 32 // GameSettings.game.floorWidth * tileSize
    if ((direction === 1 && this.x >= worldWidth - 20) ||
        (direction === -1 && this.x <= 20)) {
      this.setVelocityX(0)
      return
    }
    
    // If player is on a different floor, try to follow by using ladders
    const floorDifference = Math.abs(playerY - this.y)
    if (floorDifference > 100) { // Player is on different floor
      // Move towards player horizontally, will handle ladder climbing in scene
      this.direction = direction
      this.setVelocityX(chaseSpeed * direction)
    } else {
      // Same floor, chase normally
      this.direction = direction
      this.setVelocityX(chaseSpeed * direction)
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
    // Only chasing stalker cats can damage the player
    return this.state === 'chasing'
  }
  
  // Override squish to handle different states
  squish(): void {
    // Stalker cats can only be squished when chasing
    if (this.state !== 'chasing') {
      return
    }
    
    // Hide eyes when squished
    if (this.eyesSprite) {
      this.eyesSprite.setVisible(false)
    }
    
    super.squish()
  }
}