export class BlueCoin {
  public sprite: Phaser.GameObjects.Container
  private scene: Phaser.Scene
  private collected: boolean = false
  private sparkleTimer?: Phaser.Time.TimerEvent
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene
    
    // Create container for larger teal gem cluster
    this.sprite = scene.add.container(x, y)
    
    // Create larger teal gem cluster (4-6 gems)
    const numGems = 4 + Math.floor(Math.random() * 3)
    const gemGraphics = scene.add.graphics()
    
    for (let i = 0; i < numGems; i++) {
      // Position gems in a larger cluster
      const angle = (i / numGems) * Math.PI * 2
      const distance = i === 0 ? 0 : 6 + Math.random() * 3
      const gemX = Math.cos(angle) * distance
      const gemY = Math.sin(angle) * distance
      const gemSize = i === 0 ? 6 : 3 + Math.random() * 3
      
      // Draw teal gem with multiple layers for depth
      gemGraphics.fillStyle(0x008080, 0.6)
      gemGraphics.fillCircle(gemX, gemY, gemSize + 1)
      
      gemGraphics.fillStyle(0x20b2aa, 0.9)
      gemGraphics.fillCircle(gemX, gemY, gemSize)
      
      // Add highlight
      gemGraphics.fillStyle(0xffffff, 0.7)
      gemGraphics.fillCircle(gemX - gemSize * 0.3, gemY - gemSize * 0.3, gemSize * 0.3)
    }
    
    this.sprite.add(gemGraphics)
    this.sprite.setDepth(12)
    
    // Add sparkle effect
    this.sparkleTimer = scene.time.addEvent({
      delay: 600 + Math.random() * 300,
      callback: () => this.createSparkle(),
      loop: true
    })
    
    // Add physics to the sprite with proper hitbox size
    scene.physics.add.existing(this.sprite, true) // Static body
    
    // Set hitbox to match larger teal gem cluster size (approximately 20x20 for larger clusters)
    if (this.sprite.body) {
      const body = this.sprite.body as Phaser.Physics.Arcade.Body
      console.log(`🔵 BLUECOIN DEBUG - Before hitbox setup:`)
      console.log(`   Container position: (${this.sprite.x}, ${this.sprite.y})`)
      console.log(`   Default body size: ${body.width}x${body.height}`)
      console.log(`   Default body position: (${body.x}, ${body.y})`)
      
      body.setSize(20, 20)
      // Need to move body +32 right and +32 up to center it
      body.setOffset(32 - 10, 32 - 10)  // +32 to center, -10 for half body size
      
      console.log(`🔵 BLUECOIN DEBUG - After hitbox setup:`)
      console.log(`   Container position: (${this.sprite.x}, ${this.sprite.y})`)
      console.log(`   Body size: ${body.width}x${body.height}`)
      console.log(`   Body position: (${body.x}, ${body.y})`)
      console.log(`   Body offset: (${body.offset.x}, ${body.offset.y})`)
      console.log(`   Body center would be: (${body.x + body.width/2}, ${body.y + body.height/2})`)
    }
    
    // Pulsing glow effect (more dramatic for blue coins)
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
  
  private createSparkle(): void {
    if (!this.sprite || !this.sprite.scene) return
    
    const sparkle = this.scene.add.graphics()
    const sparkleX = (Math.random() - 0.5) * 20
    const sparkleY = (Math.random() - 0.5) * 20
    
    // Create star-shaped sparkle with teal color
    sparkle.fillStyle(0x00ffff, 0.9)
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
    sparkleContainer.setDepth(13)
    
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
    if (this.sparkleTimer) {
      this.sparkleTimer.destroy()
    }
    this.sprite.destroy()
  }
}