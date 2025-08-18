import { GemShapeGenerator, GemCut } from '../utils/GemShapes'

export class BlueCoin {
  public sprite: Phaser.GameObjects.Container
  private scene: Phaser.Scene
  private collected: boolean = false
  private sparkleTimer?: Phaser.Time.TimerEvent
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene
    
    // Create container for larger teal gem cluster
    this.sprite = scene.add.container(x, y)
    
    // Blue coins use various teal/aqua shades with emerald cut
    const tealColors = [
      0x008080, // Teal
      0x20b2aa, // Light sea green
      0x40e0d0, // Turquoise
      0x48d1cc, // Medium turquoise
      0x00ced1  // Dark turquoise
    ]
    
    // Randomly select a teal shade
    const gemColor = tealColors[Math.floor(Math.random() * tealColors.length)]
    const gemGraphics = scene.add.graphics()
    
    // Create single emerald cut gem (prestigious rectangular cut for higher value)
    const gemStyle = {
      cut: GemCut.EMERALD,
      size: 10, // Larger than regular coins to show higher value
      color: gemColor,
      facetColor: GemShapeGenerator.getFacetColor(gemColor),
      highlightColor: 0xffffff
    }
    
    // Draw single cut gem at center
    GemShapeGenerator.drawGem(gemGraphics, 0, 0, gemStyle)
    
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
      body.setSize(20, 20)
      // Need to move body +32 right and +32 up to center it
      body.setOffset(32 - 10, 32 - 10)  // +32 to center, -10 for half body size
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