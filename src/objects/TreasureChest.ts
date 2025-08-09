export class TreasureChest {
  public sprite: Phaser.GameObjects.Graphics
  private scene: Phaser.Scene
  private isOpened: boolean = false
  private glowEffect: Phaser.GameObjects.Arc | null = null
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene
    
    // Create treasure chest using Graphics
    this.sprite = scene.add.graphics()
    this.createChestShape(x, y, false) // Start closed
    this.sprite.setDepth(13)
    
    // Add physics to the sprite
    scene.physics.add.existing(this.sprite, true) // Static body
    
    // Set collision bounds
    const body = this.sprite.body as Phaser.Physics.Arcade.StaticBody
    body.setSize(32, 24)
    body.setOffset(-16, -12)
    
    // Add glow effect
    this.createGlowEffect(x, y)
    
    // Add subtle breathing animation
    scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }
  
  private createChestShape(x: number, y: number, opened: boolean): void {
    this.sprite.clear()
    this.sprite.setPosition(x, y)
    
    if (opened) {
      // Draw opened chest
      // Chest base
      this.sprite.fillStyle(0x8B4513, 1) // Brown
      this.sprite.fillRect(-16, 0, 32, 12)
      
      // Chest lid (open)
      this.sprite.fillStyle(0x654321, 1) // Darker brown
      this.sprite.fillRect(-16, -20, 32, 8)
      
      // Gold interior
      this.sprite.fillStyle(0xffd700, 1)
      this.sprite.fillRect(-14, -2, 28, 8)
      
      // Treasure sparkles inside
      for (let i = 0; i < 5; i++) {
        const sparkleX = -12 + Math.random() * 24
        const sparkleY = -2 + Math.random() * 6
        this.sprite.fillStyle(0xffff00, 1)
        this.sprite.fillCircle(sparkleX, sparkleY, 2)
      }
      
      // Hinges
      this.sprite.fillStyle(0x444444, 1)
      this.sprite.fillCircle(-12, -12, 2)
      this.sprite.fillCircle(12, -12, 2)
    } else {
      // Draw closed chest
      // Chest base
      this.sprite.fillStyle(0x8B4513, 1) // Brown
      this.sprite.fillRect(-16, -4, 32, 16)
      
      // Chest lid (closed)
      this.sprite.fillStyle(0x654321, 1) // Darker brown
      this.sprite.fillRoundedRect(-16, -12, 32, 8, 4)
      
      // Lock
      this.sprite.fillStyle(0xffd700, 1) // Gold lock
      this.sprite.fillRect(-2, -8, 4, 6)
      this.sprite.fillStyle(0x000000, 1) // Keyhole
      this.sprite.fillCircle(0, -5, 1)
      
      // Metal bands
      this.sprite.lineStyle(2, 0x444444, 1)
      this.sprite.strokeRect(-16, -8, 32, 2)
      this.sprite.strokeRect(-16, 4, 32, 2)
    }
    
    // Outline
    this.sprite.lineStyle(2, 0x000000, 1)
    if (opened) {
      this.sprite.strokeRect(-16, 0, 32, 12) // Base
      this.sprite.strokeRect(-16, -20, 32, 8) // Open lid
    } else {
      this.sprite.strokeRect(-16, -12, 32, 20) // Closed chest
    }
  }
  
  private createGlowEffect(x: number, y: number): void {
    this.glowEffect = this.scene.add.circle(x, y, 25, 0xffd700)
    this.glowEffect.setAlpha(0.3)
    this.glowEffect.setDepth(12)
    
    // Pulsing glow
    this.scene.tweens.add({
      targets: this.glowEffect,
      alpha: 0.1,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }
  
  public canInteract(): boolean {
    return !this.isOpened
  }
  
  public open(): { coins: number, diamond: boolean, flashPowerUp: boolean, totalPoints: number } {
    if (this.isOpened) {
      return { coins: 0, diamond: false, flashPowerUp: false, totalPoints: 0 }
    }
    
    this.isOpened = true
    
    // Update chest appearance to opened
    this.createChestShape(this.sprite.x, this.sprite.y, true)
    
    // Remove glow effect
    if (this.glowEffect) {
      this.glowEffect.destroy()
      this.glowEffect = null
    }
    
    // Opening animation
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 200,
      ease: 'Back.easeOut',
      yoyo: true
    })
    
    // Generate contents based on sprint requirements
    const coins = Math.floor(Math.random() * 6) + 5 // 5-10 coins
    const diamond = Math.random() < 0.3 // 30% chance
    const flashPowerUp = Math.random() < 1.0 // TESTING: 100% chance (normally 20%)
    
    // Calculate total points
    let totalPoints = 2500 // Base chest value
    totalPoints += coins * 50 // Coin value
    if (diamond) totalPoints += 1000 // Diamond bonus
    
    // Create treasure burst effect
    this.createTreasureBurstEffect()
    
    return { coins, diamond, flashPowerUp, totalPoints }
  }
  
  private createTreasureBurstEffect(): void {
    // Create burst of golden particles
    for (let i = 0; i < 15; i++) {
      const particle = this.scene.add.circle(
        this.sprite.x + (Math.random() - 0.5) * 10,
        this.sprite.y - 5,
        Math.random() * 3 + 2,
        0xffd700
      )
      particle.setDepth(50)
      
      const angle = (Math.PI * 2 / 15) * i + (Math.random() - 0.5) * 0.5
      const speed = Math.random() * 100 + 50
      
      this.scene.tweens.add({
        targets: particle,
        x: particle.x + Math.cos(angle) * speed,
        y: particle.y + Math.sin(angle) * speed - 30,
        alpha: 0,
        scaleX: 0.1,
        scaleY: 0.1,
        duration: 1000,
        ease: 'Power2.easeOut',
        onComplete: () => particle.destroy()
      })
    }
    
    // Flash effect
    const flash = this.scene.add.circle(this.sprite.x, this.sprite.y, 40, 0xffffff)
    flash.setDepth(49)
    flash.setAlpha(0.8)
    
    this.scene.tweens.add({
      targets: flash,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 300,
      ease: 'Power2.easeOut',
      onComplete: () => flash.destroy()
    })
  }
  
  destroy(): void {
    this.sprite.destroy()
    if (this.glowEffect) {
      this.glowEffect.destroy()
    }
  }
}