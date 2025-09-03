/**
 * Game Settings for Bizarre Underground - dgen1 Version
 * 720x720 square format configuration
 */

export const GameSettings = {
  buildType: 'dgen1',  // Identify this as a dgen1 build
  debug: true,  // Enable debug for alignment testing
  
  canvas: {
    width: 720,   // Square format for dgen1
    height: 720,  // 1:1 aspect ratio
  },
  
  game: {
    tileSize: 32,
    floorHeight: 8,   // Further reduced for 720px height (was 10)
    floorWidth: 22,   // Adjusted for 720px width (22 * 32 = 704px, leaves 16px margins)
    floorSpacing: 140, // Custom spacing for dgen1 (was 160 = 32*5)
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
  
  // HUD layout for square format
  hud: {
    topBarHeight: 80,     // Standard HUD height
    bottomBarHeight: 80,  // Touch controls area
    gameAreaHeight: 560,  // Main game viewport (720 - 80 - 80)
  },
  
  // Touch control positions for square layout
  touchControls: {
    dpadPosition: { x: 100, y: 640 },
    dpadSize: 60,  // Slightly smaller for square layout
    jumpPosition: { x: 620, y: 640 },
    jumpSize: 60,
  },
  
  // Platform-specific features
  platform: {
    isDgen1: true,
    hasLocalStorage: true,
    hasWallet: true,
    autoSave: true,
    saveInterval: 30000, // Auto-save every 30 seconds
  }
}

export default GameSettings