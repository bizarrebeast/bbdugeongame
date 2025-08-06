import GameSettings from "../config/GameSettings"

export class Beetle extends Phaser.Physics.Arcade.Sprite {
  private moveSpeed: number = 80
  private direction: number = 1 // 1 for right, -1 for left
  private platformBounds: { left: number; right: number }
  
  constructor(scene: Phaser.Scene, x: number, y: number, platformLeft: number, platformRight: number) {
    // Create a placeholder sprite (red rectangle for beetle)
    const graphics = scene.add.graphics()
    graphics.fillStyle(0xff0000, 1)
    graphics.fillRect(0, 0, 20, 16)
    graphics.generateTexture('beetle', 20, 16)
    graphics.destroy()
    
    super(scene, x, y, 'beetle')
    
    scene.add.existing(this)
    scene.physics.add.existing(this)
    
    // Set up physics properties
    this.setCollideWorldBounds(true)
    this.setBounce(0)
    this.setSize(18, 14)
    this.setOffset(1, 1)
    this.setDepth(15) // Beetles render on top of platforms and ladders
    
    // Store platform bounds for patrol behavior
    this.platformBounds = {
      left: platformLeft,
      right: platformRight
    }
    
    // Start moving
    this.setVelocityX(this.moveSpeed * this.direction)
  }
  
  update(): void {
    // Patrol back and forth on the platform
    if (this.x <= this.platformBounds.left + 10) {
      this.direction = 1
    } else if (this.x >= this.platformBounds.right - 10) {
      this.direction = -1
    }
    
    // Always maintain velocity
    this.setVelocityX(this.moveSpeed * this.direction)
    
    // Make sure beetle stays on platform (gravity is applied automatically)
  }
  
  // Method to reverse direction when hitting another beetle
  reverseDirection(): void {
    this.direction *= -1
    this.setVelocityX(this.moveSpeed * this.direction)
  }
  
  getDirection(): number {
    return this.direction
  }
}