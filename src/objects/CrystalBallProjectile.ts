import GameSettings from "../config/GameSettings"

export class CrystalBallProjectile extends Phaser.Physics.Arcade.Sprite {
  private bounceCount: number = 0
  private readonly MAX_BOUNCES: number = 4
  private readonly BOUNCE_HEIGHT: number = 32 // Consistent bounce height in pixels
  private distanceTraveled: number = 0
  private readonly MAX_DISTANCE: number = 5 * GameSettings.game.tileSize // 5 tiles
  private direction: number = 1 // 1 for right, -1 for left
  private glowGraphics?: Phaser.GameObjects.Graphics
  
  constructor(scene: Phaser.Scene, x: number, y: number, direction: number) {
    super(scene, x, y, 'crystalBallProjectile')
    
    this.direction = direction
    scene.add.existing(this)
    scene.physics.add.existing(this)
    
    // Set size and physics properties to match the crystal ball sprite
    this.setDisplaySize(16, 16) // Slightly larger for better visibility
    this.setSize(12, 12) // Hitbox size
    this.setDepth(15)
    
    // Set initial velocity with slight upward arc
    const horizontalSpeed = 250 * direction // Faster than player
    const initialVerticalSpeed = -120 // Slight upward arc
    this.setVelocity(horizontalSpeed, initialVerticalSpeed)
    
    // Apply gravity for natural arc
    this.setGravityY(400)
    
    // Set up collision with world bounds
    this.setCollideWorldBounds(true)
    this.body!.onWorldBounds = true
    
    // Add subtle glow around the crystal ball sprite
    this.glowGraphics = scene.add.graphics()
    this.glowGraphics.setDepth(14)
    this.glowGraphics.fillStyle(0x44d0a7, 0.3)
    this.glowGraphics.fillCircle(x, y, 12) // Glow around the ball
    this.glowGraphics.fillStyle(0x44d0a7, 0.2) 
    this.glowGraphics.fillCircle(x, y, 18) // Outer glow
    
    // Make glow follow the projectile
    scene.tweens.add({
      targets: this.glowGraphics,
      x: { from: x, to: x + (direction * 300) },
      duration: 2000,
      onUpdate: () => {
        if (this.active && this.glowGraphics) {
          this.glowGraphics.x = this.x
          this.glowGraphics.y = this.y
        }
      },
      onComplete: () => {
        if (this.glowGraphics) {
          this.glowGraphics.destroy()
        }
      }
    })
    
    // Add rotation animation
    scene.tweens.add({
      targets: this,
      rotation: Math.PI * 2 * direction,
      duration: 500,
      repeat: -1,
      ease: 'Linear'
    })
  }
  
  
  update(time: number, delta: number): void {
    super.update(time, delta)
    
    // Check if body exists
    if (!this.body) {
      console.log('🔫 Crystal Ball projectile body missing - destroying')
      this.burst()
      return
    }
    
    const body = this.body as Phaser.Physics.Arcade.Body
    
    // Track distance traveled
    this.distanceTraveled += Math.abs(body.velocity.x) * delta / 1000
    
    // Check if we've hit max distance
    if (this.distanceTraveled >= this.MAX_DISTANCE) {
      console.log('🔫 Crystal Ball projectile hit max distance - bursting')
      this.burst()
      return
    }
    
    // Check for floor collision (bouncing)
    if (body.blocked.down) {
      console.log('🔫 Crystal Ball projectile hit floor - bouncing')
      this.handleBounce()
    }
    
    // Check for wall collision
    if (body.blocked.left || body.blocked.right) {
      console.log('🔫 Crystal Ball projectile hit wall - bursting')
      this.burst()
    }
  }
  
  private handleBounce(): void {
    this.bounceCount++
    
    if (this.bounceCount >= this.MAX_BOUNCES) {
      console.log('🔫 Crystal Ball projectile max bounces reached - bursting')
      this.burst()
      return
    }
    
    if (!this.body) {
      console.log('🔫 Crystal Ball projectile body missing during bounce - bursting')
      this.burst()
      return
    }
    
    const body = this.body as Phaser.Physics.Arcade.Body
    
    // Calculate bounce velocity to reach consistent height
    // Using physics: v = sqrt(2 * g * h)
    const gravity = body.gravity.y || 400
    const bounceVelocity = -Math.sqrt(2 * gravity * this.BOUNCE_HEIGHT)
    
    // Apply bounce
    this.setVelocityY(bounceVelocity)
    
    // Maintain horizontal velocity
    this.setVelocityX(250 * this.direction)
    
    // Create bounce effect
    this.createBounceEffect()
    
    console.log('🔫 Crystal Ball projectile bounced', this.bounceCount, 'times')
  }
  
  private createBounceEffect(): void {
    // Create small particles at bounce point
    for (let i = 0; i < 3; i++) {
      const particle = this.scene.add.graphics()
      particle.fillStyle(0x44d0a7, 1)
      particle.fillCircle(0, 0, 1)
      particle.x = this.x + (Math.random() - 0.5) * 10
      particle.y = this.y + 5
      particle.setDepth(14)
      
      this.scene.tweens.add({
        targets: particle,
        y: particle.y - 10,
        alpha: 0,
        duration: 200,
        onComplete: () => particle.destroy()
      })
    }
  }
  
  hitEnemy(): void {
    // Called when projectile hits an enemy
    this.burst()
  }
  
  burst(): void {
    if (!this.scene) return
    
    
    // Create burst effect
    for (let i = 0; i < 8; i++) {
      const burstParticle = this.scene.add.graphics()
      burstParticle.fillStyle(0x44d0a7, 1)
      burstParticle.fillCircle(0, 0, 2)
      
      const angle = (i / 8) * Math.PI * 2
      burstParticle.x = this.x
      burstParticle.y = this.y
      burstParticle.setDepth(15)
      
      const distance = 20 + Math.random() * 10
      
      this.scene.tweens.add({
        targets: burstParticle,
        x: this.x + Math.cos(angle) * distance,
        y: this.y + Math.sin(angle) * distance,
        alpha: 0,
        duration: 300,
        ease: 'Power2.easeOut',
        onComplete: () => burstParticle.destroy()
      })
    }
    
    // Clean up glow graphics
    if (this.glowGraphics) {
      this.glowGraphics.destroy()
    }
    
    // Destroy projectile
    this.destroy()
  }
}