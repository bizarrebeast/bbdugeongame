export class Coin {
  public sprite: Phaser.GameObjects.Arc
  private scene: Phaser.Scene
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene
    
    // Create a simple circle for the coin
    this.sprite = scene.add.circle(x, y, 8, 0xffd700)
    this.sprite.setStrokeStyle(2, 0xffff00)
    this.sprite.setDepth(12)
    
    // Add physics to the sprite
    scene.physics.add.existing(this.sprite, true) // Static body
    
    // Add animations
    scene.tweens.add({
      targets: this.sprite,
      rotation: Math.PI * 2,
      duration: 2000,
      repeat: -1,
      ease: 'Linear'
    })
    
    scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }
  
  collect(): void {
    // Play collection effect
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.sprite.destroy()
      }
    })
  }
  
  destroy(): void {
    this.sprite.destroy()
  }
}