export class FlashPowerUp {
  public sprite: Phaser.GameObjects.Graphics
  private scene: Phaser.Scene
  private lightningBolts: Phaser.GameObjects.Graphics[] = []
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene
    
    // Create flash power-up using Graphics
    this.sprite = scene.add.graphics()
    this.createFlashShape(x, y)
    this.sprite.setDepth(13)
    
    // Add physics to the sprite
    scene.physics.add.existing(this.sprite, true) // Static body
    
    // Set collision bounds
    const body = this.sprite.body as Phaser.Physics.Arcade.StaticBody
    body.setSize(24, 24)
    body.setOffset(-12, -12)
    
    // Add dramatic pulsing animation
    scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Power2.easeInOut'
    })
    
    // Add floating motion
    scene.tweens.add({
      targets: this.sprite,
      y: y - 10,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
    
    // Create lightning bolt effects
    this.createLightningEffects(x, y)
  }
  
  private createFlashShape(x: number, y: number): void {
    this.sprite.clear()
    this.sprite.setPosition(x, y)
    
    // Draw lightning bolt shape
    this.sprite.fillStyle(0xffff00, 1) // Bright yellow
    
    // Lightning bolt path
    const points = [
      [0, -12],   // Top
      [-4, -4],   // Upper left bend
      [0, -4],    // Center left
      [-6, 4],    // Lower left
      [0, 4],     // Center right
      [4, -4],    // Upper right bend
      [0, -4],    // Center
      [6, 12]     // Bottom point
    ]
    
    this.sprite.beginPath()
    points.forEach((point, index) => {
      if (index === 0) {
        this.sprite.moveTo(point[0], point[1])
      } else {
        this.sprite.lineTo(point[0], point[1])
      }
    })
    this.sprite.closePath()
    this.sprite.fillPath()
    
    // Add white core
    this.sprite.fillStyle(0xffffff, 1)
    this.sprite.beginPath()
    points.forEach((point, index) => {
      const innerPoint = [point[0] * 0.6, point[1] * 0.6]
      if (index === 0) {
        this.sprite.moveTo(innerPoint[0], innerPoint[1])
      } else {
        this.sprite.lineTo(innerPoint[0], innerPoint[1])
      }
    })
    this.sprite.closePath()
    this.sprite.fillPath()
    
    // Add electric outline
    this.sprite.lineStyle(2, 0x00ffff, 1)
    this.sprite.beginPath()
    points.forEach((point, index) => {
      if (index === 0) {
        this.sprite.moveTo(point[0], point[1])
      } else {
        this.sprite.lineTo(point[0], point[1])
      }
    })
    this.sprite.closePath()
    this.sprite.strokePath()
  }
  
  private createLightningEffects(x: number, y: number): void {
    // Create small lightning bolts around the main power-up
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI * 2 / 4) * i
      const distance = 30
      const boltX = x + Math.cos(angle) * distance
      const boltY = y + Math.sin(angle) * distance
      
      const bolt = this.scene.add.graphics()
      bolt.setPosition(boltX, boltY)
      bolt.setDepth(12)
      
      // Draw small lightning bolt
      bolt.lineStyle(2, 0x00ffff, 0.8)
      bolt.beginPath()
      bolt.moveTo(-3, -3)
      bolt.lineTo(0, 0)
      bolt.lineTo(3, 3)
      bolt.strokePath()
      
      this.lightningBolts.push(bolt)
      
      // Animate with random flicker
      this.scene.tweens.add({
        targets: bolt,
        alpha: 0,
        duration: 200,
        delay: Math.random() * 1000,
        repeat: -1,
        yoyo: true,
        ease: 'Power2.easeInOut'
      })
      
      // Random rotation
      this.scene.tweens.add({
        targets: bolt,
        rotation: Math.PI * 2,
        duration: 2000 + Math.random() * 1000,
        repeat: -1,
        ease: 'Linear'
      })
    }
    
    // Create electric aura
    const aura = this.scene.add.circle(x, y, 35, 0x00ffff)
    aura.setAlpha(0.1)
    aura.setDepth(11)
    
    this.scene.tweens.add({
      targets: aura,
      scaleX: 1.2,
      scaleY: 1.2,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }
  
  collect(): void {
    // Create spectacular electric collection effect
    const flash = this.scene.add.circle(this.sprite.x, this.sprite.y, 100, 0xffffff)
    flash.setDepth(100)
    flash.setAlpha(1)
    
    // Screen flash effect
    this.scene.tweens.add({
      targets: flash,
      scaleX: 5,
      scaleY: 5,
      alpha: 0,
      duration: 600,
      ease: 'Power2.easeOut',
      onComplete: () => flash.destroy()
    })
    
    // Electric burst
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 / 12) * i
      const bolt = this.scene.add.graphics()
      bolt.setPosition(this.sprite.x, this.sprite.y)
      bolt.setDepth(99)
      
      bolt.lineStyle(4, 0x00ffff, 1)
      bolt.beginPath()
      bolt.moveTo(0, 0)
      bolt.lineTo(Math.cos(angle) * 60, Math.sin(angle) * 60)
      bolt.strokePath()
      
      this.scene.tweens.add({
        targets: bolt,
        alpha: 0,
        scaleX: 2,
        scaleY: 2,
        duration: 400,
        ease: 'Power2.easeOut',
        onComplete: () => bolt.destroy()
      })
    }
    
    // Power-up collection animation
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 3,
      scaleY: 3,
      rotation: Math.PI * 4,
      alpha: 0,
      duration: 600,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.sprite.destroy()
      }
    })
    
    // Destroy lightning bolts
    this.lightningBolts.forEach(bolt => bolt.destroy())
  }
  
  destroy(): void {
    this.sprite.destroy()
    this.lightningBolts.forEach(bolt => bolt.destroy())
  }
}