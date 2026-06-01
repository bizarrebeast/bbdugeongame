/**
 * Game Settings for Bizarre Underground
 * Centralized configuration for all tunable game parameters
 */

export const GameSettings = {
  debug: false,  // Debug mode disabled for production

  canvas: {
    width: 450,  // Portrait mode - 9:16 full-mobile (matches the 5:9 frame; fills tall containers)
    height: 800, // Reverted from 480x720 (2:3) which was a workaround for Remix's old 2:3 container
  },

  game: {
    tileSize: 32,
    floorHeight: 12, // tiles per floor (visible area)
    floorWidth: 24,  // tiles wide - much wider for more interesting levels
    gravity: 800,
    playerSpeed: 160,
    climbSpeed: 120,
    jumpVelocity: -350,
  },

  scoring: {
    enemyDefeat: 100,
    coinCollect: 50,
    floorBonus: 500,
  },
}

export default GameSettings
