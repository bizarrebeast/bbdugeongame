import { SplashScene } from "./scenes/SplashScene"
import { InstructionsScene } from "./scenes/InstructionsScene"
import { GameScene } from "./scenes/GameScene"
import { initializeFarcadeSDK } from "./utils/RemixUtils"
import GameSettings from "./config/GameSettings"

const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement

// Game configuration
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL, // Using WebGL for shader support
  width: GameSettings.canvas.width,
  height: GameSettings.canvas.height,
  scale: {
    mode: Phaser.Scale.FIT,
    parent: "gameContainer",
    autoCenter: Phaser.Scale.CENTER_BOTH,
    // Support for high DPI displays
    resolution: window.devicePixelRatio || 1,
  },
  canvas: canvas,
  backgroundColor: "#1a0f2e", // Dark underground purple
  scene: [SplashScene, InstructionsScene, GameScene],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: GameSettings.game.gravity },
      debug: GameSettings.debug,
    },
  },
  // Target frame rate
  fps: {
    target: 60,
  },
  // Additional WebGL settings for smooth/crisp graphics
  pixelArt: false, // Disable pixel perfect for smooth rendering
  antialias: true,
  render: {
    pixelArt: false,
    roundPixels: false,
  },
}

// Create the game instance
const game = new Phaser.Game(config)

// Initialize Farcade SDK
game.events.once("ready", () => {
  initializeFarcadeSDK(game)
})
