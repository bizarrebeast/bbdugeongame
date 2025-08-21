import GameSettings from "../config/GameSettings"

export class TreasureChest {
  public sprite: Phaser.GameObjects.Sprite
  private scene: Phaser.Scene
  private isOpened: boolean = false
  private glowEffect: Phaser.GameObjects.Arc | null = null
  private debugHitbox: Phaser.GameObjects.Graphics | null = null
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene
    
    // Create treasure chest using sprite image (shifted up 4 pixels visually)
    this.sprite = scene.add.sprite(x, y - 4, 'treasure-chest')
    this.sprite.setDisplaySize(60, 60) // Set to 60x60 pixels as requested
    this.sprite.setDepth(13)
    
    // Add physics to the sprite
    scene.physics.add.existing(this.sprite, true) // Static body
    
    // Set collision bounds (40x30 hitbox for 60x60 sprite) 
    // Adjust offset to account for the visual sprite being moved up 4 pixels
    const body = this.sprite.body as Phaser.Physics.Arcade.StaticBody
    body.setSize(40, 30)
    body.setOffset(-20, -15 + 4) // +4 to compensate for sprite being moved up
    
    // Add debug hitbox visualization
    if (GameSettings.debug) {
      this.createDebugHitbox(x, y)
    }
    
    // Add glow effect (match the shifted sprite position)
    this.createGlowEffect(x, y - 4)
    
    // Chest pulsing animation disabled
  }
  
  
  private createGlowEffect(x: number, y: number): void {
    // Simple single circle with 15% opacity
    this.glowEffect = this.scene.add.circle(x, y, 18, 0xffd700)
    this.glowEffect.setAlpha(0.15)
    this.glowEffect.setDepth(12)
    
    // Pulsing glow
    this.scene.tweens.add({
      targets: this.glowEffect,
      alpha: 0.05,
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
    
    // Update chest appearance to opened (could change sprite frame if we had multiple frames)
    // For now, just apply a tint to indicate it's been opened
    this.sprite.setTint(0x808080) // Gray tint to show it's opened
    
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
    
    // Generate contents based on level progression
    const contents = this.generateRewardsByLevel()
    
    // Calculate total points
    let totalPoints = 2500 // Base chest value
    totalPoints += contents.coins * 50 // Regular coins (50 points each)
    totalPoints += contents.blueCoins * 500 // Blue coins (500 points each)
    totalPoints += contents.diamonds * 1000 // Diamonds (1000 points each)
    
    // Create treasure burst effect
    this.createTreasureBurstEffect()
    
    return { 
      coins: contents.coins, 
      blueCoins: contents.blueCoins,
      diamonds: contents.diamonds, 
      flashPowerUp: false, // Disabled for now
      totalPoints 
    }
  }
  
  private generateRewardsByLevel(): { coins: number, blueCoins: number, diamonds: number } {
    // Get current level from scene (assuming it's available via registry or level manager)
    const currentLevel = this.scene.registry.get('currentLevel') || 1
    
    // Define reward tiers based on level progression
    let rewardTier: 'early' | 'mid' | 'late'
    if (currentLevel <= 3) {
      rewardTier = 'early'
    } else if (currentLevel <= 7) {
      rewardTier = 'mid' 
    } else {
      rewardTier = 'late'
    }
    
    // Generate 3-5 total items
    const totalItems = Math.floor(Math.random() * 3) + 3 // 3-5 items
    
    const rewards = { coins: 0, blueCoins: 0, diamonds: 0 }
    
    // Define probabilities for each tier (higher value items less likely)
    const probabilities = {
      early: {   // Levels 1-3: Mostly regular coins
        coin: 0.85,      // 85% chance for regular coins
        blueCoin: 0.13,  // 13% chance for blue coins  
        diamond: 0.02    // 2% chance for diamonds
      },
      mid: {     // Levels 4-7: More variety
        coin: 0.65,      // 65% chance for regular coins
        blueCoin: 0.28,  // 28% chance for blue coins
        diamond: 0.07    // 7% chance for diamonds
      },
      late: {    // Levels 8+: Best rewards
        coin: 0.45,      // 45% chance for regular coins
        blueCoin: 0.40,  // 40% chance for blue coins
        diamond: 0.15    // 15% chance for diamonds
      }
    }
    
    const tierProbs = probabilities[rewardTier]
    
    // Generate each reward item
    for (let i = 0; i < totalItems; i++) {
      const roll = Math.random()
      
      if (roll < tierProbs.diamond) {
        rewards.diamonds++
      } else if (roll < tierProbs.diamond + tierProbs.blueCoin) {
        rewards.blueCoins++
      } else {
        rewards.coins++
      }
    }
    
    console.log(`🏴󠁧󠁢󠁳󠁣󠁴󠁿 CHEST REWARDS (Level ${currentLevel}, Tier: ${rewardTier}):`)
    console.log(`   Total items: ${totalItems}`)
    console.log(`   Regular coins: ${rewards.coins}`)
    console.log(`   Blue coins: ${rewards.blueCoins}`) 
    console.log(`   Diamonds: ${rewards.diamonds}`)
    
    return rewards
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
  
  private createDebugHitbox(x: number, y: number): void {
    this.debugHitbox = this.scene.add.graphics()
    this.debugHitbox.setDepth(999) // On top of everything
    
    // Draw hitbox outline (same dimensions as physics body - now 40x30)
    this.debugHitbox.lineStyle(2, 0x00ff00, 0.8) // Bright green, semi-transparent
    this.debugHitbox.strokeRect(x - 20, y - 15, 40, 30)
    
    // Add a small center dot to show exact position
    this.debugHitbox.fillStyle(0xff0000, 1.0) // Red dot
    this.debugHitbox.fillCircle(x, y, 2)
    
    // Add text label
    const debugText = this.scene.add.text(x, y - 35, 'CHEST\n40x30', {
      fontSize: '8px',
      color: '#00ff00',
      fontFamily: 'monospace',
      align: 'center',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 2, y: 1 }
    }).setOrigin(0.5).setDepth(1000)
    
    // Store text reference for cleanup
    this.debugHitbox.setData('debugText', debugText)
  }
  
  destroy(): void {
    this.sprite.destroy()
    if (this.glowEffect) {
      this.glowEffect.destroy()
    }
    if (this.debugHitbox) {
      const debugText = this.debugHitbox.getData('debugText')
      if (debugText) {
        debugText.destroy()
      }
      this.debugHitbox.destroy()
    }
  }
}