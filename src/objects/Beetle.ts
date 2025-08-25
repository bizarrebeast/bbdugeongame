import GameSettings from "../config/GameSettings"

export class Beetle extends Phaser.Physics.Arcade.Sprite {
  private moveSpeed: number = 80
  private direction: number = 1 // 1 for right, -1 for left
  private platformBounds: { left: number; right: number }
  private animationTimer: number = 0
  private currentFrame: number = 0
  private animationFrames: string[] = [
    'beetle-mouth-closed',
    'beetle-mouth-open-30',
    'beetle-mouth-open-70',
    'beetle-mouth-open-30'
  ]
  
  constructor(scene: Phaser.Scene, x: number, y: number, platformLeft: number, platformRight: number) {
    // Use beetle sprite or create placeholder if not loaded
    const textureKey = scene.textures.exists('beetle-mouth-closed') ? 'beetle-mouth-closed' : 'beetle'
    
    // Create placeholder if sprites not loaded
    if (!scene.textures.exists('beetle-mouth-closed')) {
      const graphics = scene.add.graphics()
      graphics.fillStyle(0xff0000, 1)
      graphics.fillRect(0, 0, 20, 16)
      graphics.generateTexture('beetle', 20, 16)
      graphics.destroy()
    }
    
    super(scene, x, y, textureKey)
    
    scene.add.existing(this)
    scene.physics.add.existing(this)
    
    // Set up physics properties
    this.setCollideWorldBounds(true)
    this.setBounce(0)
    
    // Set size to 45x45 for both visual and hitbox
    const beetleSize = 45
    
    // Set display size to 45x45
    this.setDisplaySize(beetleSize, beetleSize)
    
    // Set physics body to match display size (45x45)
    this.setSize(beetleSize, beetleSize)
    
    // Move the visual sprite up 30 pixels and left 13 pixels relative to the hitbox
    // Positive offset moves the hitbox down and right, making the visual appear up and left
    this.setOffset(13, 30)
    
    this.setDepth(15) // Beetles render on top of platforms and ladders
    
    // Store platform bounds for patrol behavior
    this.platformBounds = {
      left: platformLeft,
      right: platformRight
    }
    
    // Start moving
    this.setVelocityX(this.moveSpeed * this.direction)
  }
  
  update(time?: number, delta?: number): void {
    // Patrol back and forth on the platform
    if (this.x <= this.platformBounds.left + 10) {
      this.direction = 1
      this.setFlipX(false)
    } else if (this.x >= this.platformBounds.right - 10) {
      this.direction = -1
      this.setFlipX(true)
    }
    
    // Always maintain velocity
    this.setVelocityX(this.moveSpeed * this.direction)
    
    // Animate biting if sprites are available
    if (this.scene.textures.exists('beetle-mouth-closed') && delta) {
      this.animateBiting(delta)
    }
  }
  
  private animateBiting(delta: number): void {
    this.animationTimer += delta
    
    // Change frame every 300ms for slower, more natural biting animation
    if (this.animationTimer >= 300) {
      this.animationTimer = 0
      
      // Cycle through animation frames
      this.currentFrame = (this.currentFrame + 1) % this.animationFrames.length
      const frameTexture = this.animationFrames[this.currentFrame]
      
      // Update texture if it exists
      if (this.scene.textures.exists(frameTexture)) {
        this.setTexture(frameTexture)
      }
    }
  }
  
  // Method to reverse direction when hitting another beetle
  reverseDirection(): void {
    this.direction *= -1
    this.setVelocityX(this.moveSpeed * this.direction)
    this.setFlipX(this.direction < 0)
  }
  
  getDirection(): number {
    return this.direction
  }
}