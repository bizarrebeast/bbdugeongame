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
  backgroundColor: "#000000", // Pure black to avoid grey flash
  scene: [SplashScene, InstructionsScene, GameScene],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: GameSettings.game.gravity },
      debug: GameSettings.debug,
    },
  },
  // Audio configuration for better mobile compatibility
  audio: {
    disableWebAudio: false, // Use Web Audio API when available
    noAudio: false,
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

// Initialize game state - this is NOT a replay on first start
game.registry.set('isReplay', false)

// Initialize Farcade SDK
game.events.once("ready", () => {
  initializeFarcadeSDK(game)
  
  // Set up audio context resumption on user interaction
  // This helps ensure audio works after page visibility changes or SDK unmute
  let audioUnlocked = false
  const ensureAudioContext = () => {
    if (game.sound.context) {
      console.log('🔊 Main: Audio context state:', game.sound.context.state)
      
      if (game.sound.context.state === 'suspended') {
        game.sound.context.resume()
          .then(() => {
            console.log('✅ Main: Audio context resumed successfully')
            audioUnlocked = true
          })
          .catch((e: Error) => {
            console.warn('⚠️ Main: Could not resume audio context:', e)
          })
      } else if (game.sound.context.state === 'running') {
        if (!audioUnlocked) {
          console.log('✅ Main: Audio context already running')
          audioUnlocked = true
        }
      }
    }
  }
  
  // Add listeners for user interactions to resume audio if needed
  // Use both passive and non-passive listeners for better mobile compatibility
  canvas.addEventListener('click', ensureAudioContext, { passive: true })
  canvas.addEventListener('touchstart', ensureAudioContext, { passive: false })
  canvas.addEventListener('touchend', ensureAudioContext, { passive: false })
  document.addEventListener('keydown', ensureAudioContext, { passive: true })
  
  // Also try to resume on visibility change (when tab becomes active)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      ensureAudioContext()
    }
  })
})
