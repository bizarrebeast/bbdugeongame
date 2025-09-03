/**
 * Bizarre Underground - dgen1 Version
 * 720x720 Square Format with Web3 Integration
 * NO Remix/Farcade SDK Dependencies
 */

import { LoadingScene } from "./scenes/LoadingScene"
import { SplashScene } from "./scenes/SplashScene"
import { InstructionsScene } from "./scenes/InstructionsScene"
import { GameScene } from "./scenes/GameScene"
import GameSettings from "./config/GameSettings.dgen1"
import { detectPlatform } from "./utils/GamePlatform"

// No TestScene in production dgen1 build
const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement

// Build scene list
const scenes: any[] = [LoadingScene, SplashScene, InstructionsScene, GameScene]

// Game configuration for 720x720
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  width: GameSettings.canvas.width,  // 720
  height: GameSettings.canvas.height, // 720
  scale: {
    mode: Phaser.Scale.NONE, // No automatic scaling - we control it via CSS
    parent: "gameContainer",
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 720,
    height: 720,
    resolution: 1, // Force 1:1 pixel ratio for crisp pixels
  },
  canvas: canvas,
  backgroundColor: "#2e2348", // Purple theme background
  scene: scenes,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: GameSettings.game.gravity },
      debug: false,  // Debug hitboxes disabled
    },
  },
  audio: {
    disableWebAudio: false,
    noAudio: false,
  },
  fps: {
    target: 60,
  },
  pixelArt: true, // Enable for crisp pixel art
  antialias: false,
  render: {
    pixelArt: true,
    roundPixels: true,
  },
}

// Create the game instance
const game = new Phaser.Game(config)

// Store game reference globally for platform access
(window as any).game = game

// Initialize platform handler (dgen1)
const platform = detectPlatform()
game.registry.set('platform', platform)
game.registry.set('isDgen1', true)

// Initialize game state
game.registry.set('isReplay', false)

// Enhanced debug logging for alignment issues
const canvasElement = document.getElementById('gameCanvas') as HTMLCanvasElement
const containerElement = document.getElementById('gameContainer')

console.log('🎮 dgen1 Version Initialized', {
  canvas: `${GameSettings.canvas.width}x${GameSettings.canvas.height}`,
  viewport: `${window.innerWidth}x${window.innerHeight}`,
  platform: 'dgen1',
  wallet: typeof (window as any).ethereum !== 'undefined' ? 'available' : 'not found'
})

console.log('📐 Canvas & Container Metrics:', {
  canvasElement: {
    width: canvasElement?.width,
    height: canvasElement?.height,
    clientWidth: canvasElement?.clientWidth,
    clientHeight: canvasElement?.clientHeight,
    offsetWidth: canvasElement?.offsetWidth,
    offsetHeight: canvasElement?.offsetHeight,
    style: {
      width: canvasElement?.style.width,
      height: canvasElement?.style.height
    }
  },
  container: {
    clientWidth: containerElement?.clientWidth,
    clientHeight: containerElement?.clientHeight,
    offsetWidth: containerElement?.offsetWidth,
    offsetHeight: containerElement?.offsetHeight
  },
  devicePixelRatio: window.devicePixelRatio,
  phaserConfig: {
    width: config.width,
    height: config.height,
    resolution: (config.scale as any)?.resolution
  }
})

// Setup game ready event
game.events.once("ready", () => {
  // Call platform ready (no SDK, just localStorage init)
  platform.ready()
  
  // Log instructions for testing
  console.log('🎮 DGEN1 TEST MODE READY!')
  console.log('📱 Touch controls enabled for desktop - you can click the on-screen buttons!')
  console.log('🎯 Click the D-pad (left bottom) to move')
  console.log('🦘 Click the Jump button (right bottom) to jump')
  console.log('⌨️ Keyboard also works: Arrow keys + Space/Up to jump')
  
  // Load saved game state if available
  if (platform.loadGameState) {
    platform.loadGameState().then(state => {
      if (state) {
        console.log('💾 Found saved game state:', state)
        game.registry.set('savedState', state)
      }
    })
  }
  
  // Load high score
  platform.getHighScore().then(score => {
    if (score > 0) {
      console.log('🏆 High score:', score)
      game.registry.set('highScore', score)
    }
  })
  
  // Set up audio context for mobile
  let audioUnlocked = false
  const ensureAudioContext = () => {
    if (game.sound.context) {
      if (game.sound.context.state === 'suspended') {
        game.sound.context.resume()
          .then(() => {
            console.log('🔊 Audio context resumed')
            audioUnlocked = true
          })
          .catch((e: Error) => {
            console.warn('� Could not resume audio:', e)
          })
      } else if (game.sound.context.state === 'running') {
        if (!audioUnlocked) {
          console.log('🔊 Audio context ready')
          audioUnlocked = true
        }
      }
    }
  }
  
  // Audio interaction listeners
  canvas.addEventListener('click', ensureAudioContext, { passive: true })
  canvas.addEventListener('touchstart', ensureAudioContext, { passive: false })
  canvas.addEventListener('touchend', ensureAudioContext, { passive: false })
  document.addEventListener('keydown', ensureAudioContext, { passive: true })
  
  // Visibility change handler
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      ensureAudioContext()
    }
  })
  
  // Auto-save functionality
  if (GameSettings.platform.autoSave) {
    setInterval(() => {
      const currentScene = game.scene.getScenes(true)[0]
      if (currentScene && currentScene.scene.key === 'GameScene') {
        const gameScene = currentScene as any
        if (gameScene.player && !gameScene.isGameOver) {
          const state = {
            level: gameScene.levelManager?.getCurrentLevel() || 1,
            score: gameScene.score || 0,
            lives: gameScene.lives || 3,
            gems: gameScene.totalCoinsCollected || 0
          }
          
          if (platform.saveGameState) {
            platform.saveGameState(state)
            console.log('💾 Auto-saved game state')
          }
        }
      }
    }, GameSettings.platform.saveInterval)
  }
})

// Handle page unload - save state
window.addEventListener('beforeunload', () => {
  const currentScene = game.scene.getScenes(true)[0]
  if (currentScene && currentScene.scene.key === 'GameScene') {
    const gameScene = currentScene as any
    if (gameScene.player && !gameScene.isGameOver) {
      const state = {
        level: gameScene.levelManager?.getCurrentLevel() || 1,
        score: gameScene.score || 0,
        lives: gameScene.lives || 3,
        gems: gameScene.totalCoinsCollected || 0
      }
      
      if (platform.saveGameState) {
        platform.saveGameState(state)
        console.log('💾 Saved game state on exit')
      }
    }
  }
})

// Export for debugging
export { game, platform }