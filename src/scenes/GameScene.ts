import GameSettings from "../config/GameSettings"
import { Player } from "../objects/Player"
import { Beetle } from "../objects/Beetle"
import { Coin } from "../objects/Coin"
import { TouchControls } from "../objects/TouchControls"

export class GameScene extends Phaser.Scene {
  private platforms!: Phaser.Physics.Arcade.StaticGroup
  private ladders!: Phaser.Physics.Arcade.StaticGroup
  private player!: Player
  private beetles!: Phaser.Physics.Arcade.Group
  private coins: Coin[] = []
  private isGameOver: boolean = false
  private floorLayouts: { gapStart: number, gapSize: number }[] = []
  private score: number = 0
  private scoreText!: Phaser.GameObjects.Text
  private currentFloor: number = 0
  private floorText!: Phaser.GameObjects.Text
  private highestFloorGenerated: number = 5 // Track how many floors we've generated
  private touchControls!: TouchControls
  
  constructor() {
    super({ key: "GameScene" })
  }

  preload(): void {
    // For now, we'll create colored rectangles as placeholders
    // Later we'll load actual sprite assets
  }

  create(): void {
    // Reset game state
    this.isGameOver = false
    this.score = 0
    this.currentFloor = 0
    this.highestFloorGenerated = 5
    
    // Create platform and ladder groups
    this.platforms = this.physics.add.staticGroup()
    this.ladders = this.physics.add.staticGroup()
    
    // Create beetles group
    this.beetles = this.physics.add.group({
      classType: Beetle,
      runChildUpdate: true
    })
    
    // Initialize coins array
    this.coins = []
    
    // Create a test level with platforms and ladders
    this.createTestLevel()
    
    // Create the player
    this.player = new Player(
      this, 
      GameSettings.canvas.width / 2, 
      GameSettings.canvas.height - 80
    )
    
    // Add some beetles to test (pass floor layouts)
    this.createBeetles()
    
    // Add coins to collect
    this.createCoins()
    
    // Set up collisions (with condition check for climbing)
    this.physics.add.collider(
      this.player, 
      this.platforms,
      undefined,
      this.shouldCollideWithPlatform,
      this
    )
    
    // Beetles collide with platforms
    this.physics.add.collider(this.beetles, this.platforms)
    
    // Beetles collide with each other and reverse direction
    this.physics.add.collider(
      this.beetles,
      this.beetles,
      this.handleBeetleBeetleCollision,
      undefined,
      this
    )
    
    // Player vs beetle collision (game over)
    this.physics.add.overlap(
      this.player,
      this.beetles,
      this.handlePlayerBeetleCollision,
      undefined,
      this
    )
    
    // Set up coin collection (we'll handle this individually per coin)
    
    // Set up ladder overlap detection
    this.physics.add.overlap(
      this.player,
      this.ladders,
      this.handleLadderOverlap,
      undefined,
      this
    )
    
    // Set world bounds to accommodate wider floors
    const worldWidth = GameSettings.game.floorWidth * GameSettings.game.tileSize
    this.physics.world.setBounds(0, -10000, worldWidth, 20000)
    
    // Set up camera to follow player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)
    // Keep camera centered horizontally, only follow vertically
    this.cameras.main.followOffset.set(0, 100)
    
    // Game title removed - focusing on clean HUD
    
    // Create HUD background panel
    const hudBg = this.add.graphics()
    hudBg.fillStyle(0x000000, 0.7)
    hudBg.fillRoundedRect(8, 8, 200, 60, 8)
    hudBg.setDepth(99)
    hudBg.setScrollFactor(0)
    
    // Add score display with better styling
    this.scoreText = this.add.text(20, 20, 'SCORE: 0', {
      fontSize: '16px',
      color: '#ffd700',
      fontFamily: 'Arial Black',
      fontStyle: 'bold'
    }).setDepth(100)
    this.scoreText.setScrollFactor(0)
    
    // Add floor counter with better styling
    this.floorText = this.add.text(20, 40, 'FLOOR: 0', {
      fontSize: '16px',
      color: '#00ff88',
      fontFamily: 'Arial Black',
      fontStyle: 'bold'
    }).setDepth(100)
    this.floorText.setScrollFactor(0)
    
    // Create touch controls for mobile
    this.touchControls = new TouchControls(this)
    
    // Connect touch controls to player
    this.player.setTouchControls(this.touchControls)
  }

  private createTestLevel(): void {
    const tileSize = GameSettings.game.tileSize
    const floorWidth = GameSettings.game.floorWidth
    const floorSpacing = tileSize * 4 // Space between floors
    
    // Calculate how many floors we can fit
    const numFloors = Math.floor(GameSettings.canvas.height / floorSpacing)
    
    // Track ladder positions and floor layouts for beetle placement
    const ladderPositions: number[] = []
    const floorLayouts: { gapStart: number, gapSize: number }[] = []
    
    // First create all platforms with random gaps
    for (let floor = 0; floor < numFloors; floor++) {
      const y = GameSettings.canvas.height - tileSize/2 - (floor * floorSpacing)
      
      if (floor === 0) {
        // Ground floor - complete platform
        for (let x = 0; x < floorWidth; x++) {
          this.createPlatformTile(x * tileSize + tileSize/2, y)
        }
        // Ground floor can have ladders at multiple positions
        ladderPositions[floor] = -1 // Special marker for ground floor
        floorLayouts[floor] = { gapStart: -1, gapSize: 0 } // No gap
      } else {
        // Upper floors - create platforms with random gaps
        const hasGap = Math.random() > 0.3 // 70% chance of having a gap
        
        if (hasGap) {
          // Random gap position (avoiding edges)
          const gapStart = Math.floor(Math.random() * (floorWidth - 5)) + 2
          const gapSize = Math.floor(Math.random() * 2) + 2 // Gap of 2-3 tiles
          
          // Store gap info for beetle placement
          floorLayouts[floor] = { gapStart, gapSize }
          
          // Create platform tiles, skipping the gap
          for (let x = 0; x < floorWidth; x++) {
            if (x < gapStart || x >= gapStart + gapSize) {
              this.createPlatformTile(x * tileSize + tileSize/2, y)
            }
          }
          
          // Store safe ladder positions (not in or next to gaps)
          const leftSafe = gapStart > 3 ? Math.floor(Math.random() * (gapStart - 1)) + 1 : -1
          const rightSafe = gapStart + gapSize < floorWidth - 2 ? 
            Math.floor(Math.random() * (floorWidth - gapStart - gapSize - 2)) + gapStart + gapSize + 1 : -1
          
          // Better distribution - divide floor into thirds and alternate sections
          const floorThird = floorWidth / 3
          const prevPos = floor > 1 ? ladderPositions[floor - 1] : -1
          
          let targetSection = Math.floor(Math.random() * 3) // 0=left, 1=middle, 2=right
          
          // If previous ladder exists, prefer different section
          if (prevPos !== -1) {
            const prevSection = Math.floor(prevPos / floorThird)
            const otherSections = [0, 1, 2].filter(s => s !== prevSection)
            targetSection = otherSections[Math.floor(Math.random() * otherSections.length)]
          }
          
          // Find safe positions in target section
          const sectionStart = Math.floor(targetSection * floorThird)
          const sectionEnd = Math.floor((targetSection + 1) * floorThird)
          const sectionSafe = []
          
          if (leftSafe !== -1 && leftSafe >= sectionStart && leftSafe < sectionEnd) sectionSafe.push(leftSafe)
          if (rightSafe !== -1 && rightSafe >= sectionStart && rightSafe < sectionEnd) sectionSafe.push(rightSafe)
          
          // Use section position if available, otherwise use any safe position
          ladderPositions[floor] = sectionSafe.length > 0 ? 
            sectionSafe[Math.floor(Math.random() * sectionSafe.length)] : 
            (rightSafe !== -1 ? rightSafe : leftSafe)
        } else {
          // No gap - complete floor
          floorLayouts[floor] = { gapStart: -1, gapSize: 0 }
          
          for (let x = 0; x < floorWidth; x++) {
            this.createPlatformTile(x * tileSize + tileSize/2, y)
          }
          // Better distribution for complete floors - use thirds system
          const floorThird = floorWidth / 3
          const prevPos = floor > 1 ? ladderPositions[floor - 1] : -1
          
          let targetSection = Math.floor(Math.random() * 3)
          if (prevPos !== -1) {
            const prevSection = Math.floor(prevPos / floorThird)
            const otherSections = [0, 1, 2].filter(s => s !== prevSection)
            targetSection = otherSections[Math.floor(Math.random() * otherSections.length)]
          }
          
          const sectionStart = Math.max(2, Math.floor(targetSection * floorThird))
          const sectionEnd = Math.min(floorWidth - 2, Math.floor((targetSection + 1) * floorThird))
          ladderPositions[floor] = Math.floor(Math.random() * (sectionEnd - sectionStart)) + sectionStart
        }
      }
    }
    
    // Store floor layouts for beetle creation
    this.floorLayouts = floorLayouts
    
    // Create ladders ensuring solid ground above and below
    for (let floor = 0; floor < numFloors - 1; floor++) {
      const bottomY = GameSettings.canvas.height - tileSize - (floor * floorSpacing)
      const topY = GameSettings.canvas.height - tileSize - ((floor + 1) * floorSpacing)
      
      const currentFloor = floorLayouts[floor]
      const nextFloor = floorLayouts[floor + 1]
      
      // Find valid ladder positions that have solid ground on both floors
      const validPositions: number[] = []
      
      for (let x = 1; x < floorWidth - 1; x++) {
        const hasBottomPlatform = this.hasPlatformAt(currentFloor, x)
        const hasTopPlatform = this.hasPlatformAt(nextFloor, x)
        
        if (hasBottomPlatform && hasTopPlatform) {
          validPositions.push(x)
        }
      }
      
      if (validPositions.length > 0) {
        if (floor === 0) {
          // Ground floor - place 2 ladders if possible
          if (validPositions.length >= 2) {
            // Try to place ladders on opposite sides
            const leftPositions = validPositions.filter(pos => pos < floorWidth / 2)
            const rightPositions = validPositions.filter(pos => pos >= floorWidth / 2)
            
            if (leftPositions.length > 0 && rightPositions.length > 0) {
              const leftLadder = leftPositions[Math.floor(Math.random() * leftPositions.length)]
              const rightLadder = rightPositions[Math.floor(Math.random() * rightPositions.length)]
              this.createContinuousLadder(leftLadder * tileSize, bottomY, topY)
              this.createContinuousLadder(rightLadder * tileSize, bottomY, topY)
            } else {
              // Place 2 ladders from available positions
              const pos1 = validPositions[Math.floor(Math.random() * validPositions.length)]
              const pos2 = validPositions.filter(p => Math.abs(p - pos1) > 2)[0] || validPositions[validPositions.length - 1]
              this.createContinuousLadder(pos1 * tileSize, bottomY, topY)
              if (pos2 !== pos1) {
                this.createContinuousLadder(pos2 * tileSize, bottomY, topY)
              }
            }
          } else {
            // Only one valid position
            this.createContinuousLadder(validPositions[0] * tileSize, bottomY, topY)
          }
        } else {
          // Upper floors - place 1 ladder
          const randomPos = validPositions[Math.floor(Math.random() * validPositions.length)]
          this.createContinuousLadder(randomPos * tileSize, bottomY, topY)
        }
      }
      // If no valid positions, skip this connection (emergency fallback)
    }
  }
  
  private hasPlatformAt(floorLayout: { gapStart: number, gapSize: number }, x: number): boolean {
    if (floorLayout.gapStart === -1) {
      // No gap - platform exists everywhere
      return true
    }
    
    // Check if position is in the gap
    return x < floorLayout.gapStart || x >= floorLayout.gapStart + floorLayout.gapSize
  }
  
  private createPlatformTile(x: number, y: number): void {
    const tileSize = GameSettings.game.tileSize
    const platform = this.add.rectangle(
      x,
      y,
      tileSize,
      tileSize,
      0x654321
    )
    platform.setStrokeStyle(1, 0x432818)
    platform.setDepth(1) // Platforms render behind ladders
    this.platforms.add(platform)
  }
  
  private createContinuousLadder(x: number, bottomY: number, topY: number): void {
    const tileSize = GameSettings.game.tileSize
    
    // Create one continuous ladder from bottom to top
    const ladderHeight = bottomY - topY + tileSize
    const ladderY = (bottomY + topY) / 2
    
    // Create the full ladder as one piece
    const ladder = this.add.rectangle(
      x + tileSize/2,
      ladderY,
      tileSize * 0.8,
      ladderHeight,
      0x8B4513
    )
    ladder.setStrokeStyle(2, 0x654321)
    ladder.setDepth(10) // Render on top of platforms
    this.ladders.add(ladder)
    
    // Add visual rungs for appearance
    const numRungs = Math.floor(ladderHeight / tileSize)
    for (let i = 0; i <= numRungs; i++) {
      const rungY = bottomY - (i * tileSize)
      const rung = this.add.rectangle(
        x + tileSize/2,
        rungY,
        tileSize * 0.6,
        4,
        0x654321
      )
      rung.setDepth(11)
    }
  }

  private createBeetles(): void {
    const tileSize = GameSettings.game.tileSize
    const floorSpacing = tileSize * 4
    const floorWidth = GameSettings.game.floorWidth
    
    // Add beetles on floors 1-4 (skip ground floor where player starts) 
    for (let floor = 1; floor <= 4 && floor < this.floorLayouts.length; floor++) {
      const layout = this.floorLayouts[floor]
      const y = GameSettings.canvas.height - (floor * floorSpacing) - 40
      
      if (layout.gapStart === -1) {
        // Complete floor - can fit more beetles with wider floors
        const numBeetles = Math.floor(Math.random() * 3) + 2 // 2-4 beetles
        const sectionSize = Math.floor(floorWidth / numBeetles)
        
        for (let i = 0; i < numBeetles; i++) {
          const leftBound = Math.max(tileSize * 1.5, i * sectionSize * tileSize)
          const rightBound = Math.min(tileSize * (floorWidth - 1.5), (i + 1) * sectionSize * tileSize)
          
          if (rightBound - leftBound > tileSize * 3) {
            const beetle = new Beetle(
              this,
              (leftBound + rightBound) / 2,
              y,
              leftBound,
              rightBound
            )
            this.beetles.add(beetle)
          }
        }
      } else {
        // Floor with gap - place beetles on sections that are big enough
        const leftSectionSize = layout.gapStart
        const rightSectionSize = floorWidth - (layout.gapStart + layout.gapSize)
        
        // Left section beetles (can fit 1-2)
        if (leftSectionSize > 4) {
          const leftBeetles = leftSectionSize > 8 ? Math.floor(Math.random() * 2) + 1 : 1
          for (let i = 0; i < leftBeetles; i++) {
            const leftSectionTileSize = Math.floor(leftSectionSize / leftBeetles)
            const leftBound = tileSize * (0.5 + i * leftSectionTileSize)
            const rightBound = tileSize * (0.5 + (i + 1) * leftSectionTileSize - 0.5)
            
            if (rightBound - leftBound > tileSize * 2) {
              const beetle = new Beetle(
                this,
                (leftBound + rightBound) / 2,
                y,
                leftBound,
                Math.min(rightBound, tileSize * (layout.gapStart - 0.5))
              )
              this.beetles.add(beetle)
            }
          }
        }
        
        // Right section beetles (can fit 1-2)
        if (rightSectionSize > 4) {
          const rightStart = layout.gapStart + layout.gapSize
          const rightBeetles = rightSectionSize > 8 ? Math.floor(Math.random() * 2) + 1 : 1
          
          for (let i = 0; i < rightBeetles; i++) {
            const rightSectionTileSize = Math.floor(rightSectionSize / rightBeetles)
            const leftBound = tileSize * (rightStart + 0.5 + i * rightSectionTileSize)
            const rightBound = tileSize * (rightStart + 0.5 + (i + 1) * rightSectionTileSize - 0.5)
            
            if (rightBound - leftBound > tileSize * 2) {
              const beetle = new Beetle(
                this,
                (leftBound + rightBound) / 2,
                y,
                leftBound,
                Math.min(rightBound, tileSize * (floorWidth - 0.5))
              )
              this.beetles.add(beetle)
            }
          }
        }
      }
    }
  }
  
  private handleBeetleBeetleCollision(
    beetle1: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    beetle2: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ): void {
    // Both beetles reverse direction when they bump into each other
    const beetleObj1 = beetle1 as Beetle
    const beetleObj2 = beetle2 as Beetle
    
    beetleObj1.reverseDirection()
    beetleObj2.reverseDirection()
  }
  
  private createCoins(): void {
    const tileSize = GameSettings.game.tileSize
    const floorSpacing = tileSize * 4
    
    // Place coins on each floor
    for (let floor = 0; floor < this.floorLayouts.length; floor++) {
      const layout = this.floorLayouts[floor]
      
      // Calculate Y position above the platform
      const platformY = GameSettings.canvas.height - tileSize/2 - (floor * floorSpacing)
      const coinY = platformY - tileSize - 8 // Float above the platform
      
      // Place 2-4 coins per floor randomly on platforms
      const numCoins = Math.floor(Math.random() * 3) + 2
      const validPositions: number[] = []
      
      // Find all valid positions (where there are platforms, avoiding ladders)
      for (let x = 1; x < GameSettings.game.floorWidth - 1; x++) {
        if (this.hasPlatformAt(layout, x) && !this.hasLadderAt(x, floor)) {
          validPositions.push(x)
        }
      }
      
      // Place coins at random valid positions
      for (let i = 0; i < Math.min(numCoins, validPositions.length); i++) {
        const randomIndex = Math.floor(Math.random() * validPositions.length)
        const tileX = validPositions[randomIndex]
        const coinX = tileX * tileSize + tileSize/2 // Center on tile
        
        // Remove this position so we don't place multiple coins in the same spot
        validPositions.splice(randomIndex, 1)
        
        const coin = new Coin(this, coinX, coinY)
        this.coins.push(coin)
        
        // Set up overlap detection for this coin
        this.physics.add.overlap(
          this.player,
          coin.sprite,
          () => this.handleCoinCollection(coin),
          undefined,
          this
        )
      }
    }
  }
  
  private hasLadderAt(x: number, floor: number): boolean {
    // Simple check to avoid placing coins where ladders might be
    // This is a basic implementation - we could make it more sophisticated
    const tileSize = GameSettings.game.tileSize
    const coinX = x * tileSize + tileSize/2
    
    // Check if there are any ladders near this position
    let hasLadder = false
    this.ladders.children.entries.forEach(ladder => {
      const ladderSprite = ladder as Phaser.GameObjects.Rectangle
      if (Math.abs(ladderSprite.x - coinX) < tileSize/2) {
        const floorSpacing = tileSize * 4
        const floorY = GameSettings.canvas.height - tileSize/2 - (floor * floorSpacing)
        // Check if ladder intersects with this floor
        if (Math.abs(ladderSprite.y - floorY) < ladderSprite.height/2) {
          hasLadder = true
        }
      }
    })
    
    return hasLadder
  }
  
  private handleCoinCollection(coin: Coin): void {
    // Add points
    this.score += GameSettings.scoring.coinCollect
    
    // Update score display
    this.scoreText.setText(`SCORE: ${this.score}`)
    
    // Play collection animation and remove coin
    coin.collect()
    
    // Remove from coins array
    const index = this.coins.indexOf(coin)
    if (index > -1) {
      this.coins.splice(index, 1)
    }
  }
  
  private shouldCollideWithPlatform(): boolean {
    // Don't collide with platforms when climbing
    return !this.player.getIsClimbing()
  }
  
  private handlePlayerBeetleCollision(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    beetle: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ): void {
    if (this.isGameOver) return
    
    // Game over!
    this.isGameOver = true
    
    // Stop the player and disable physics
    const playerObj = player as Player
    playerObj.setVelocity(0, 0)
    playerObj.setTint(0xff0000) // Turn player red
    playerObj.body!.enable = false // Disable physics to prevent further collisions
    
    // Display game over message
    const gameOverText = this.add.text(
      GameSettings.canvas.width / 2,
      GameSettings.canvas.height / 2,
      'GAME OVER!\nPress R to restart',
      {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'monospace',
        align: 'center'
      }
    ).setOrigin(0.5).setDepth(200)
    
    // Add restart key
    this.input.keyboard!.on('keydown-R', () => {
      this.scene.restart()
    })
  }
  
  private handleLadderOverlap(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    ladder: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ): void {
    const playerObj = player as Player
    
    // Check if player wants to climb
    if (playerObj.checkLadderProximity(ladder)) {
      if (!playerObj.getIsClimbing()) {
        playerObj.startClimbing(ladder)
      }
    }
    
    // More generous exit conditions - don't trap player at ladder tops
    if (playerObj.getIsClimbing()) {
      const ladderRect = ladder as Phaser.GameObjects.Rectangle
      const topOfLadder = ladderRect.y - ladderRect.height / 2
      const bottomOfLadder = ladderRect.y + ladderRect.height / 2
      
      // Exit climbing if player moves way beyond ladder bounds (more generous)
      if (playerObj.y < topOfLadder - 32 || playerObj.y > bottomOfLadder + 32) {
        playerObj.exitClimbing()
      }
    }
  }

  update(_time: number, _deltaTime: number): void {
    if (this.isGameOver) return
    
    // Update touch controls
    this.touchControls.update()
    
    // Update player
    this.player.update()
    
    // Update all beetles
    this.beetles.children.entries.forEach(beetle => {
      (beetle as Beetle).update()
    })
    
    // Check if player is no longer overlapping any ladder while climbing
    if (this.player.getIsClimbing()) {
      let stillOnLadder = false
      this.ladders.children.entries.forEach(ladder => {
        if (this.physics.world.overlap(this.player, ladder)) {
          stillOnLadder = true
        }
      })
      
      if (!stillOnLadder) {
        this.player.exitClimbing()
      }
    }
    
    // Update current floor based on player position
    const tileSize = GameSettings.game.tileSize
    const floorSpacing = tileSize * 4
    const playerFloor = Math.max(0, Math.floor((GameSettings.canvas.height - this.player.y - tileSize/2) / floorSpacing))
    
    if (playerFloor !== this.currentFloor) {
      this.currentFloor = playerFloor
      this.floorText.setText(`FLOOR: ${this.currentFloor}`)
      
      // Award bonus points for reaching new floors
      if (playerFloor > this.currentFloor) {
        this.score += GameSettings.scoring.floorBonus
        this.scoreText.setText(`SCORE: ${this.score}`)
      }
    }
    
    // Generate new floors if player is getting close to the top
    if (this.currentFloor >= this.highestFloorGenerated - 3) {
      this.generateNextFloors()
    }
  }
  
  private generateNextFloors(): void {
    const tileSize = GameSettings.game.tileSize
    const floorWidth = GameSettings.game.floorWidth
    const floorSpacing = tileSize * 4
    
    // Generate 5 more floors
    for (let i = 0; i < 5; i++) {
      const floor = this.highestFloorGenerated + i + 1
      const y = -floor * floorSpacing + GameSettings.canvas.height - tileSize/2
      
      // Create floor with random gap
      const hasGap = Math.random() > 0.3
      let layout: { gapStart: number, gapSize: number }
      
      if (hasGap) {
        const gapStart = Math.floor(Math.random() * (floorWidth - 5)) + 2
        const gapSize = Math.floor(Math.random() * 2) + 2
        layout = { gapStart, gapSize }
        
        // Create platform tiles with gap
        for (let x = 0; x < floorWidth; x++) {
          if (x < gapStart || x >= gapStart + gapSize) {
            this.createPlatformTile(x * tileSize + tileSize/2, y)
          }
        }
      } else {
        layout = { gapStart: -1, gapSize: 0 }
        
        // Create complete floor
        for (let x = 0; x < floorWidth; x++) {
          this.createPlatformTile(x * tileSize + tileSize/2, y)
        }
      }
      
      this.floorLayouts[floor] = layout
      
      // Add ladder connecting to previous floor
      if (floor > 0 && this.floorLayouts[floor - 1]) {
        const prevLayout = this.floorLayouts[floor - 1]
        const validPositions: number[] = []
        
        // Find positions with platforms on both floors
        for (let x = 1; x < floorWidth - 1; x++) {
          if (this.hasPlatformAt(prevLayout, x) && this.hasPlatformAt(layout, x)) {
            validPositions.push(x)
          }
        }
        
        if (validPositions.length > 0) {
          const ladderX = validPositions[Math.floor(Math.random() * validPositions.length)]
          const bottomY = -(floor - 1) * floorSpacing + GameSettings.canvas.height - tileSize
          const topY = -floor * floorSpacing + GameSettings.canvas.height - tileSize
          this.createContinuousLadder(ladderX * tileSize, bottomY, topY)
        }
      }
      
      // Add coins on the new floor
      const numCoins = Math.floor(Math.random() * 2) + 1
      const validCoinPositions: number[] = []
      
      for (let x = 1; x < floorWidth - 1; x++) {
        if (this.hasPlatformAt(layout, x)) {
          validCoinPositions.push(x)
        }
      }
      
      for (let j = 0; j < Math.min(numCoins, validCoinPositions.length); j++) {
        const randomIndex = Math.floor(Math.random() * validCoinPositions.length)
        const tileX = validCoinPositions[randomIndex]
        const coinX = tileX * tileSize + tileSize/2
        const coinY = y - tileSize - 8
        
        validCoinPositions.splice(randomIndex, 1)
        
        const coin = new Coin(this, coinX, coinY)
        this.coins.push(coin)
        
        this.physics.add.overlap(
          this.player,
          coin.sprite,
          () => this.handleCoinCollection(coin),
          undefined,
          this
        )
      }
      
      // Add beetle on some floors
      if (floor > 1 && Math.random() > 0.5) {
        if (layout.gapStart === -1) {
          // Complete floor
          const beetle = new Beetle(
            this,
            (floorWidth / 2) * tileSize,
            y - 40,
            tileSize * 1.5,
            tileSize * (floorWidth - 1.5)
          )
          this.beetles.add(beetle)
        } else if (layout.gapStart > 3) {
          // Place on left section if big enough
          const beetle = new Beetle(
            this,
            (layout.gapStart / 2) * tileSize,
            y - 40,
            tileSize * 0.5,
            tileSize * (layout.gapStart - 0.5)
          )
          this.beetles.add(beetle)
        }
      }
    }
    
    this.highestFloorGenerated += 5
  }

  shutdown() {}
}