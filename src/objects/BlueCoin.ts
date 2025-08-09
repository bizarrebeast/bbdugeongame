export class BlueCoin {
  public sprite: Phaser.GameObjects.Arc
  private scene: Phaser.Scene
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene
    
    // Create a blue coin - larger than regular coins
    this.sprite = scene.add.circle(x, y, 12, 0x0080ff)
    this.sprite.setStrokeStyle(3, 0x00ccff)
    this.sprite.setDepth(12)
    
    // Add physics to the sprite
    scene.physics.add.existing(this.sprite, true) // Static body
    
    // Add more dramatic animations than regular coins
    scene.tweens.add({
      targets: this.sprite,
      rotation: Math.PI * 2,
      duration: 1500,
      repeat: -1,
      ease: 'Linear'
    })
    
    // Pulsing glow effect
    scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
    
  }
  
  
  collect(): void {
    // Play more dramatic collection effect
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.sprite.destroy()
      }
    })
  }
  
  destroy(): void {
    this.sprite.destroy()
  }
}