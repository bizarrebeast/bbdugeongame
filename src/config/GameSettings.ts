/**
 * Game Settings for Bizarre Underground
 * Centralized configuration for all tunable game parameters
 */

export const GameSettings = {
  debug: false,

  canvas: {
    width: 450,  // Portrait mode - 9:16 aspect ratio
    height: 800, // Works well on mobile and desktop
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
