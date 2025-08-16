export class Diamond {
  public sprite: Phaser.GameObjects.Rectangle
  public diamondGraphics: Phaser.GameObjects.Graphics
  private scene: Phaser.Scene
  private collected: boolean = false
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene
    
    // Create invisible rectangle for physics
    this.sprite = scene.add.rectangle(x, y, 24, 24, 0x000000, 0)
    this.sprite.setDepth(13)
    
    // Add physics to the invisible sprite
    scene.physics.add.existing(this.sprite, true) // Static body
    
    // Create visible diamond graphics
    this.diamondGraphics = scene.add.graphics()
    this.createDiamondShape(x, y)
    this.diamondGraphics.setDepth(13)
    
    // Add rotation animation to graphics
    scene.tweens.add({
      targets: this.diamondGraphics,
      rotation: Math.PI * 2,
      duration: 3000,
      repeat: -1,
      ease: 'Linear'
    })
    
    // Add gentle floating motion to both sprites
    scene.tweens.add({
      targets: [this.sprite, this.diamondGraphics],
      y: y - 5,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }
  
  private createDiamondShape(x: number, y: number): void {
    // Clear any existing drawing
    this.diamondGraphics.clear()
    
    // Set position
    this.diamondGraphics.setPosition(x, y)
    
    // Draw diamond using multiple colors for prismatic effect
    const colors = [0x00ffff, 0xff00ff, 0xffff00, 0x00ff00]
    const points = [
      [0, -12],   // Top
      [8, 0],     // Right
      [0, 12],    // Bottom
      [-8, 0]     // Left
    ]
    
    // Draw diamond with gradient-like effect
    colors.forEach((color, index) => {
      const nextIndex = (index + 1) % points.length
      
      this.diamondGraphics.fillStyle(color, 0.8)
      this.diamondGraphics.beginPath()
      this.diamondGraphics.moveTo(0, 0) // Center
      this.diamondGraphics.lineTo(points[index][0], points[index][1])
      this.diamondGraphics.lineTo(points[nextIndex][0], points[nextIndex][1])
      this.diamondGraphics.closePath()
      this.diamondGraphics.fillPath()
    })
    
    // Add white outline for definition
    this.diamondGraphics.lineStyle(2, 0xffffff, 1)
    this.diamondGraphics.beginPath()
    points.forEach((point, index) => {
      if (index === 0) {
        this.diamondGraphics.moveTo(point[0], point[1])
      } else {
        this.diamondGraphics.lineTo(point[0], point[1])
      }
    })
    this.diamondGraphics.closePath()
    this.diamondGraphics.strokePath()
  }
  
  
  isCollected(): boolean {
    return this.collected
  }
  
  collect(): void {
    if (this.collected) return
    this.collected = true
    
    // Simple diamond collection animation without flash
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
    this.sprite.destroy()
    this.diamondGraphics.destroy()
  }
}