import GameSettings from "../config/GameSettings"

export class SplashScene extends Phaser.Scene {
  private titleImage!: Phaser.GameObjects.Image
  private transitionComplete: boolean = false

  constructor() {
    super({ key: 'SplashScene' })
  }

  preload(): void {
    // Load title background image
    this.load.image('titleBackground', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/d281be5d-2111-4a73-afb0-19b2a18c80a9/BizarreBeasts%20Treasure%20Quest%20Title%20page-vusJcO3xppbepNJe5afWyCDlKanyG7.png?QpHp')
    
    console.log('🎮 SplashScene: Loading title background')
  }

  create(): void {
    console.log('🎮 SplashScene: Creating splash screen')
    
    // Create title background image
    this.setupTitleBackground()
    
    // Start 2-second timer for automatic transition
    this.startTimer()
  }

  private setupTitleBackground(): void {
    const screenWidth = GameSettings.canvas.width
    const screenHeight = GameSettings.canvas.height
    
    // Create and position title image as background
    this.titleImage = this.add.image(screenWidth / 2, screenHeight / 2, 'titleBackground')
    this.titleImage.setDepth(0) // Background layer
    
    // Scale image to fill screen while maintaining aspect ratio
    const scaleX = screenWidth / this.titleImage.width
    const scaleY = screenHeight / this.titleImage.height
    const scale = Math.max(scaleX, scaleY) // Use larger scale to fill screen
    
    this.titleImage.setScale(scale)
    
    console.log('🎮 SplashScene: Title background positioned and scaled')
  }

  private startTimer(): void {
    console.log('🎮 SplashScene: Starting 1-second timer')
    
    // Automatically transition to game after 1 second
    this.time.delayedCall(1000, () => {
      this.transitionToGame()
    })
  }

  private transitionToGame(): void {
    if (this.transitionComplete) return
    
    this.transitionComplete = true
    console.log('🎮 SplashScene: Auto-transitioning to game after 1 second')

    // Quick fade out (0.3s) then transition to game
    this.cameras.main.fadeOut(300, 0, 0, 0)
    
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene')
    })
  }

  update(): void {
    // No updates needed for static splash screen
  }
}