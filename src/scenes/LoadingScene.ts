import GameSettings from "../config/GameSettings"

export class LoadingScene extends Phaser.Scene {
  constructor() {
    super({ key: "LoadingScene" })
  }

  preload() {
    // LoadingScene now loads NOTHING!
    // 
    // Why? Because:
    // - SplashScene loads its own assets (titleBackground, splash-sound)
    // - InstructionsScene loads its own assets (instruction sprites)
    // - GameScene has AssetPool that loads game sprites on-demand
    // - BackgroundManager loads backgrounds on-demand
    //
    // This makes the initial load nearly instant!
  }

  create() {
    console.log('⏳ LoadingScene started')
    console.log('⏳ isReplay flag value:', this.game.registry.get('isReplay'))
    
    // Check if this is a replay - if so, go directly to GameScene
    if (this.game.registry.get('isReplay')) {
      console.log('🎮 LoadingScene: Replay detected, skipping to GameScene')
      this.scene.start("GameScene")
      return
    }
    
    // Otherwise, proceed normally to splash scene
    // No loading bar needed because there's nothing to load!
    console.log('⏳ LoadingScene: No replay flag, proceeding to SplashScene')
    this.scene.start("SplashScene")
  }
}