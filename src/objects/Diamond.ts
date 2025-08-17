export class Diamond {
  public sprite: Phaser.GameObjects.Rectangle
  public diamondGraphics: Phaser.GameObjects.Graphics
  private scene: Phaser.Scene
  private collected: boolean = false
  private sparkleTimer?: Phaser.Time.TimerEvent
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene
    
    // Create invisible rectangle for physics
    this.sprite = scene.add.rectangle(x, y, 24, 24, 0x000000, 0)
    this.sprite.setDepth(13)
    
    // Add physics to the invisible sprite
    scene.physics.add.existing(this.sprite, true) // Static body
    
    // Debug logging for Diamond (which works correctly)
    if (this.sprite.body) {
      const body = this.sprite.body as Phaser.Physics.Arcade.Body
      console.log(`💎 DIAMOND DEBUG:`)
      console.log(`   Rectangle position: (${this.sprite.x}, ${this.sprite.y})`)
      console.log(`   Body size: ${body.width}x${body.height}`)
      console.log(`   Body position: (${body.x}, ${body.y})`)
      console.log(`   Body center: (${body.x + body.width/2}, ${body.y + body.height/2})`)
    }
    
    // Create visible diamond graphics
    this.diamondGraphics = scene.add.graphics()
    this.createDiamondShape(x, y)
    this.diamondGraphics.setDepth(13)
    
    
    // Add gentle floating motion to both sprites
    scene.tweens.add({
      targets: [this.sprite, this.diamondGraphics],
      y: y - 5,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
    
    // Add sparkle effect
    this.sparkleTimer = scene.time.addEvent({
      delay: 400 + Math.random() * 200,
      callback: () => this.createSparkle(),
      loop: true
    })
  }
  
  private createSparkle(): void {
    if (!this.sprite || !this.sprite.scene) return
    
    const sparkle = this.scene.add.graphics()
    const sparkleX = (Math.random() - 0.5) * 30
    const sparkleY = (Math.random() - 0.5) * 30
    
    // Create star-shaped sparkle
    sparkle.fillStyle(0xffffff, 0.9)
    sparkle.beginPath()
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const radius = i % 2 === 0 ? 2 : 1
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      if (i === 0) sparkle.moveTo(x, y)
      else sparkle.lineTo(x, y)
    }
    sparkle.closePath()
    sparkle.fillPath()
    
    const sparkleContainer = this.scene.add.container(this.sprite.x + sparkleX, this.sprite.y + sparkleY)
    sparkleContainer.add(sparkle)
    sparkleContainer.setDepth(14)
    
    this.scene.tweens.add({
      targets: sparkleContainer,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      rotation: Math.PI,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        sparkleContainer.destroy()
      }
    })
  }
  
  private createDiamondShape(x: number, y: number): void {
    // Clear any existing drawing
    this.diamondGraphics.clear()
    
    // Set position
    this.diamondGraphics.setPosition(x, y)
    
    // Create proper diamond cut with table, crown, and pavilion
    const tableColor = 0xe6e6fa  // Light lavender
    const crownColor = 0xdda0dd  // Plum
    const pavilionColor = 0xb19cd9  // Medium lavender
    
    // Draw pavilion (bottom part)
    this.diamondGraphics.fillStyle(pavilionColor, 0.9)
    this.diamondGraphics.beginPath()
    this.diamondGraphics.moveTo(0, 0)    // Center
    this.diamondGraphics.lineTo(-6, 8)   // Bottom left
    this.diamondGraphics.lineTo(0, 12)   // Bottom point
    this.diamondGraphics.lineTo(6, 8)    // Bottom right
    this.diamondGraphics.closePath()
    this.diamondGraphics.fillPath()
    
    // Draw crown (top part)
    this.diamondGraphics.fillStyle(crownColor, 0.9)
    this.diamondGraphics.beginPath()
    this.diamondGraphics.moveTo(0, 0)    // Center
    this.diamondGraphics.lineTo(-6, -8)  // Top left
    this.diamondGraphics.lineTo(0, -12)  // Top point
    this.diamondGraphics.lineTo(6, -8)   // Top right
    this.diamondGraphics.closePath()
    this.diamondGraphics.fillPath()
    
    // Draw table (center facet)
    this.diamondGraphics.fillStyle(tableColor, 0.95)
    this.diamondGraphics.beginPath()
    this.diamondGraphics.moveTo(-3, -2)  // Top left of table
    this.diamondGraphics.lineTo(3, -2)   // Top right of table
    this.diamondGraphics.lineTo(3, 2)    // Bottom right of table
    this.diamondGraphics.lineTo(-3, 2)   // Bottom left of table
    this.diamondGraphics.closePath()
    this.diamondGraphics.fillPath()
    
    // Add facet lines for realistic cut appearance
    this.diamondGraphics.lineStyle(1, 0xffffff, 0.6)
    
    // Crown facet lines
    this.diamondGraphics.lineBetween(0, -12, -3, -2)  // Top to table left
    this.diamondGraphics.lineBetween(0, -12, 3, -2)   // Top to table right
    this.diamondGraphics.lineBetween(-6, -8, -3, 2)   // Left crown to table
    this.diamondGraphics.lineBetween(6, -8, 3, 2)     // Right crown to table
    
    // Pavilion facet lines
    this.diamondGraphics.lineBetween(0, 12, -3, 2)    // Bottom to table left
    this.diamondGraphics.lineBetween(0, 12, 3, 2)     // Bottom to table right
    this.diamondGraphics.lineBetween(-6, 8, -3, -2)   // Left pavilion to table
    this.diamondGraphics.lineBetween(6, 8, 3, -2)     // Right pavilion to table
    
    // Add brilliant white outline
    this.diamondGraphics.lineStyle(2, 0xffffff, 1)
    this.diamondGraphics.beginPath()
    this.diamondGraphics.moveTo(0, -12)  // Top
    this.diamondGraphics.lineTo(6, -8)   // Top right
    this.diamondGraphics.lineTo(6, 8)    // Bottom right
    this.diamondGraphics.lineTo(0, 12)   // Bottom
    this.diamondGraphics.lineTo(-6, 8)   // Bottom left
    this.diamondGraphics.lineTo(-6, -8)  // Top left
    this.diamondGraphics.closePath()
    this.diamondGraphics.strokePath()
  }
  
  
  isCollected(): boolean {
    return this.collected
  }
  
  collect(): void {
    if (this.collected) return
    this.collected = true
    
    // Stop sparkle timer
    if (this.sparkleTimer) {
      this.sparkleTimer.destroy()
    }
    
    // Immediately disable physics to prevent further collisions
    if (this.sprite.body) {
      this.sprite.body.enable = false
    }
    
    // Diamond collection animation with brilliant flash
    this.scene.tweens.add({
      targets: [this.sprite, this.diamondGraphics],
      scaleX: 2.5,
      scaleY: 2.5,
      alpha: 0,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.sprite.destroy()
        this.diamondGraphics.destroy()
      }
    })
  }
  
  destroy(): void {
    if (this.sparkleTimer) {
      this.sparkleTimer.destroy()
    }
    this.sprite.destroy()
    this.diamondGraphics.destroy()
  }
}