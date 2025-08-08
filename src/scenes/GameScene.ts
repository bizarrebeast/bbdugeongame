import GameSettings from "../config/GameSettings"
import { Player } from "../objects/Player"
import { Cat } from "../objects/Cat"
import { CeilingCat } from "../objects/CeilingCat"
import { Coin } from "../objects/Coin"
import { TouchControls } from "../objects/TouchControls"

export class GameScene extends Phaser.Scene {
  private platforms!: Phaser.Physics.Arcade.StaticGroup
  private ladders!: Phaser.Physics.Arcade.StaticGroup
  private player!: Player
  private cats!: Phaser.Physics.Arcade.Group
  private ceilingCats!: Phaser.Physics.Arcade.Group
  private coins: Coin[] = []
  private isGameOver: boolean = false
  private floorLayouts: { gapStart: number, gapSize: number }[] = []
  private score: number = 0
  private scoreText!: Phaser.GameObjects.Text
  private currentFloor: number = 0
  private floorText!: Phaser.GameObjects.Text
  private highestFloorGenerated: number = 5 // Track how many floors we've generated
  private touchControls!: TouchControls
  private justKilledCat: boolean = false
  private comboCount: number = 0
  private comboTimer: Phaser.Time.TimerEvent | null = null
  private comboText!: Phaser.GameObjects.Text
  private visibilityMask: any // Store visibility system components
  private visibilityRadius: number = 160 // 5 tiles * 32 pixels
  
  constructor() {
    super({ key: "GameScene" })
  }

  preload(): void {
    // For now, we'll create colored rectangles as placeholders
    // Later we'll load actual sprite assets
  }

  create(): void {
    // Enable multi-touch support
    this.input.addPointer(2) // Allow up to 3 pointers total (default 1 + 2 more)
    
    // Reset game state
    this.isGameOver = false
    this.score = 0
    this.currentFloor = 0
    this.highestFloorGenerated = 5
    
    // Create platform and ladder groups
    this.platforms = this.physics.add.staticGroup()
    this.ladders = this.physics.add.staticGroup()
    
    // Create cats group
    this.cats = this.physics.add.group({
      classType: Cat,
      runChildUpdate: true
    })
    
    // Create ceiling cats group
    this.ceilingCats = this.physics.add.group({
      classType: CeilingCat,
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
    
    // Add some cats to test (pass floor layouts)
    this.createCats()
    
    // Add ceiling cats
    this.createCeilingCats()
    
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
    
    // Cats collide with platforms
    this.physics.add.collider(this.cats, this.platforms)
    
    // Ceiling cats collide with platforms (after dropping)
    this.physics.add.collider(this.ceilingCats, this.platforms)
    
    // Cats collide with each other and reverse direction
    this.physics.add.collider(
      this.cats,
      this.cats,
      this.handleCatCatCollision,
      undefined,
      this
    )
    
    // Player vs cat collision - check for jump-to-kill vs damage
    this.physics.add.overlap(
      this.player,
      this.cats,
      this.handlePlayerCatInteraction,
      undefined,
      this
    )
    
    // Player vs ceiling cat collision - check for jump-to-kill vs damage  
    this.physics.add.overlap(
      this.player,
      this.ceilingCats,
      this.handlePlayerCeilingCatInteraction,
      undefined,
      this
    )
    
    // Ceiling cats can use ladders
    this.physics.add.overlap(
      this.ceilingCats,
      this.ladders,
      this.handleCeilingCatLadderOverlap,
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
    
    // Create visibility/vignette system
    this.createVisibilitySystem()
    
    // Game title removed - focusing on clean HUD
    
    // Create HUD background panel (translucent white)
    const hudBg = this.add.graphics()
    hudBg.fillStyle(0xffffff, 0.3)  // White with 30% opacity
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
    
    // Create combo text (hidden initially)
    this.comboText = this.add.text(
      GameSettings.canvas.width / 2,
      80,
      '',
      {
        fontSize: '13px',
        color: '#ffff00',
        fontFamily: 'Arial Black',
        fontStyle: 'bold',
        stroke: '#ff0000',
        strokeThickness: 2,
        shadow: {
          offsetX: 1,
          offsetY: 1,
          color: '#000000',
          blur: 2,
          fill: true
        }
      }
    ).setOrigin(0.5).setDepth(200).setVisible(false)
    this.scoreText.setScrollFactor(0)
    this.comboText.setScrollFactor(0)
    
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
    
    // Track ladder positions and floor layouts for cat placement
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
          
          // Store gap info for cat placement
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
    
    // Store floor layouts for cat creation
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

  private createCats(): void {
    const tileSize = GameSettings.game.tileSize
    const floorSpacing = tileSize * 4
    const floorWidth = GameSettings.game.floorWidth
    
    // Add cats on floors 1-4 (skip ground floor where player starts) 
    for (let floor = 1; floor <= 4 && floor < this.floorLayouts.length; floor++) {
      const layout = this.floorLayouts[floor]
      const y = GameSettings.canvas.height - (floor * floorSpacing) - 40
      
      if (layout.gapStart === -1) {
        // Complete floor - place 2-4 cats with full floor bounds for green cats
        const numCats = Math.floor(Math.random() * 3) + 2 // 2-4 cats
        const sectionSize = Math.floor(floorWidth / numCats)
        
        for (let i = 0; i < numCats; i++) {
          const leftBound = Math.max(tileSize * 1.5, i * sectionSize * tileSize)
          const rightBound = Math.min(tileSize * (floorWidth - 1.5), (i + 1) * sectionSize * tileSize)
          
          if (rightBound - leftBound > tileSize * 3) {
            // Green cats get full floor bounds, others get section bounds
            const cat = new Cat(
              this,
              (leftBound + rightBound) / 2,
              y,
              leftBound,
              rightBound
            )
            
            // Override bounds for green cats to use full floor
            if (cat.getCatColor() === 'green') {
              cat.platformBounds = {
                left: tileSize * 1.5,
                right: tileSize * (floorWidth - 1.5)
              }
            }
            
            this.cats.add(cat)
          }
        }
      } else {
        // Floor with gap - place cats on sections
        const leftSectionSize = layout.gapStart
        const rightSectionSize = floorWidth - (layout.gapStart + layout.gapSize)
        
        // Left section cats
        if (leftSectionSize > 4) {
          const leftCats = leftSectionSize > 8 ? Math.floor(Math.random() * 2) + 1 : 1
          for (let i = 0; i < leftCats; i++) {
            const leftSectionTileSize = Math.floor(leftSectionSize / leftCats)
            const leftBound = tileSize * (0.5 + i * leftSectionTileSize)
            const rightBound = tileSize * (0.5 + (i + 1) * leftSectionTileSize - 0.5)
            
            if (rightBound - leftBound > tileSize * 2) {
              const cat = new Cat(
                this,
                (leftBound + rightBound) / 2,
                y,
                leftBound,
                Math.min(rightBound, tileSize * (layout.gapStart - 0.5))
              )
              
              // Green cats use full left section bounds
              if (cat.getCatColor() === 'green') {
                cat.platformBounds = {
                  left: tileSize * 0.5,
                  right: tileSize * (layout.gapStart - 0.5)
                }
              }
              
              this.cats.add(cat)
            }
          }
        }
        
        // Right section cats
        if (rightSectionSize > 4) {
          const rightStart = layout.gapStart + layout.gapSize
          const rightCats = rightSectionSize > 8 ? Math.floor(Math.random() * 2) + 1 : 1
          
          for (let i = 0; i < rightCats; i++) {
            const rightSectionTileSize = Math.floor(rightSectionSize / rightCats)
            const leftBound = tileSize * (rightStart + 0.5 + i * rightSectionTileSize)
            const rightBound = tileSize * (rightStart + 0.5 + (i + 1) * rightSectionTileSize - 0.5)
            
            if (rightBound - leftBound > tileSize * 2) {
              const cat = new Cat(
                this,
                (leftBound + rightBound) / 2,
                y,
                leftBound,
                Math.min(rightBound, tileSize * (floorWidth - 0.5))
              )
              
              // Green cats use full right section bounds
              if (cat.getCatColor() === 'green') {
                cat.platformBounds = {
                  left: tileSize * (rightStart + 0.5),
                  right: tileSize * (floorWidth - 0.5)
                }
              }
              
              this.cats.add(cat)
            }
          }
        }
      }
    }
  }
  
  private createCeilingCats(): void {
    const tileSize = GameSettings.game.tileSize
    const floorSpacing = tileSize * 4
    const floorWidth = GameSettings.game.floorWidth
    
    // Add ceiling cats starting from floor 2 (0-1 per floor until level 20, then 0-2)
    for (let floor = 2; floor <= 5 && floor < this.floorLayouts.length; floor++) {
      const layout = this.floorLayouts[floor]
      
      // Calculate floor position for stalker cats (on the floor, not ceiling)
      // Place stalker cats directly on the current floor
      const floorY = GameSettings.canvas.height - tileSize/2 - (floor * floorSpacing)
      const stalkerY = floorY - 16 // Just above the floor platform
      
      // Determine number of ceiling cats (0-1 for now, will scale later)
      const maxCeilingCats = floor < 20 ? 1 : 2
      const numCeilingCats = Math.random() < 0.6 ? Math.floor(Math.random() * maxCeilingCats) + 1 : 0
      
      if (numCeilingCats === 0) continue
      
      // Find valid positions (where there are platforms below)
      const validPositions: number[] = []
      
      if (layout.gapStart === -1) {
        // Complete floor - can place anywhere
        for (let x = 2; x < floorWidth - 2; x++) {
          validPositions.push(x)
        }
      } else {
        // Floor with gap - place only over platform sections
        for (let x = 2; x < layout.gapStart - 1; x++) {
          validPositions.push(x)
        }
        for (let x = layout.gapStart + layout.gapSize + 1; x < floorWidth - 2; x++) {
          validPositions.push(x)
        }
      }
      
      // Place ceiling cats at random valid positions
      for (let i = 0; i < Math.min(numCeilingCats, validPositions.length); i++) {
        const randomIndex = Math.floor(Math.random() * validPositions.length)
        const tileX = validPositions[randomIndex]
        const ceilingCatX = tileX * tileSize + tileSize/2
        
        // Remove position to avoid overlapping ceiling cats
        validPositions.splice(randomIndex, 1)
        
        // Calculate platform bounds for the section below
        let leftBound = tileSize * 0.5
        let rightBound = tileSize * (floorWidth - 0.5)
        
        if (layout.gapStart !== -1) {
          if (tileX < layout.gapStart) {
            // Left section
            rightBound = tileSize * (layout.gapStart - 0.5)
          } else {
            // Right section
            leftBound = tileSize * (layout.gapStart + layout.gapSize + 0.5)
          }
        }
        
        const stalkerCat = new CeilingCat(
          this,
          ceilingCatX,
          stalkerY,
          leftBound,
          rightBound
        )
        
        // Set player reference for detection
        stalkerCat.setPlayerReference(this.player)
        
        this.ceilingCats.add(stalkerCat)
      }
    }
  }
  
  private handleCatCatCollision(
    cat1: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    cat2: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ): void {
    // Both cats reverse direction when they bump into each other
    const catObj1 = cat1 as Cat
    const catObj2 = cat2 as Cat
    
    catObj1.reverseDirection()
    catObj2.reverseDirection()
  }
  
  private handleCeilingCatLadderOverlap(
    ceilingCat: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    ladder: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ): void {
    const catObj = ceilingCat as CeilingCat
    
    // Only allow ladder climbing if in chasing state
    if (catObj.getState() !== 'chasing' || !catObj.playerRef) return
    
    const playerY = catObj.playerRef.y
    const catY = catObj.y
    const playerIsAbove = playerY < catY - 50
    const playerIsBelow = playerY > catY + 50
    
    // If player is on different floor, use ladder
    if (playerIsAbove && catObj.body!.touching.down) {
      // Player is above, climb up
      catObj.setVelocityY(-120) // Climb speed
      catObj.body!.setGravityY(0) // Disable gravity while climbing
    } else if (playerIsBelow) {
      // Player is below, climb down
      catObj.setVelocityY(120) // Climb speed
      catObj.body!.setGravityY(0) // Disable gravity while climbing
    } else {
      // On same level, restore normal gravity
      catObj.body!.setGravityY(800) // Normal gravity
    }
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
    this.updateScoreDisplay()
    
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
  
  private handlePlayerCatInteraction(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    cat: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ): void {
    if (this.isGameOver || this.justKilledCat) return
    
    const playerObj = player as Player
    const catObj = cat as Cat
    
    // Check if player is falling down onto the cat (jump-to-kill)
    const playerBody = playerObj.body as Phaser.Physics.Arcade.Body
    const catBody = catObj.body as Phaser.Physics.Arcade.Body
    
    const playerFalling = playerBody.velocity.y > 0 // Moving downward
    const playerAboveCat = playerBody.bottom <= catBody.top + 15 // Player's bottom is near cat's top (increased tolerance)
    
    if (playerFalling && playerAboveCat) {
      // Jump-to-kill!
      this.justKilledCat = true
      this.handleCatKill(playerObj, catObj)
      
      // Reset flag after a short delay to allow for physics processing
      this.time.delayedCall(100, () => {
        this.justKilledCat = false
      })
    } else if (!this.justKilledCat) {
      // Regular collision - damage player (only if we didn't just kill)
      this.handlePlayerDamage(playerObj, catObj)
    }
  }
  
  private handlePlayerCeilingCatInteraction(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    cat: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ): void {
    if (this.isGameOver || this.justKilledCat) return
    
    const playerObj = player as Player
    const ceilingCatObj = cat as CeilingCat
    
    // Check if this is a stalker cat that can't damage the player yet
    if (ceilingCatObj.canDamagePlayer && !ceilingCatObj.canDamagePlayer()) {
      // This is a hidden or activated stalker cat - don't damage player
      return
    }
    
    // Check if player is falling down onto the cat (jump-to-kill)
    const playerBody = playerObj.body as Phaser.Physics.Arcade.Body
    const catBody = ceilingCatObj.body as Phaser.Physics.Arcade.Body
    
    const playerFalling = playerBody.velocity.y > 0 // Moving downward
    const playerAboveCat = playerBody.bottom <= catBody.top + 15 // Player's bottom is near cat's top (increased tolerance)
    
    if (playerFalling && playerAboveCat && ceilingCatObj.getState() === 'chasing') {
      // Jump-to-kill ceiling cat (only when chasing)
      this.justKilledCat = true
      this.handleCeilingCatKill(playerObj, ceilingCatObj)
      
      // Reset flag after a short delay to allow for physics processing
      this.time.delayedCall(100, () => {
        this.justKilledCat = false
      })
    } else if (!this.justKilledCat) {
      // Regular collision - damage player (only if we didn't just kill)
      this.handlePlayerDamage(playerObj, ceilingCatObj)
    }
  }
  
  private handleCatKill(player: Player, cat: Cat): void {
    // Increment combo
    this.comboCount++
    
    // Calculate points with combo multiplier
    const basePoints = 200
    const comboMultiplier = this.comboCount
    const points = basePoints * comboMultiplier
    
    // Award points
    this.score += points
    this.updateScoreDisplay()
    
    // Update combo display
    this.updateComboDisplay()
    
    // Reset combo timer
    if (this.comboTimer) {
      this.comboTimer.destroy()
    }
    
    // Set new combo timer (1 second to maintain combo)
    this.comboTimer = this.time.delayedCall(1000, () => {
      this.resetCombo()
    })
    
    // Make player bounce up (slightly less than normal jump)
    player.setVelocityY(GameSettings.game.jumpVelocity * 0.7)
    
    // Squish the cat
    cat.squish()
    
    // Show point popup at cat position
    this.showPointPopup(cat.x, cat.y - 20, points)
    
    console.log(`Cat squished! Score: ${this.score}, Combo: x${this.comboCount}, Points: ${points}`)
  }
  
  private handleCeilingCatKill(player: Player, ceilingCat: CeilingCat): void {
    // Increment combo
    this.comboCount++
    
    // Calculate points with combo multiplier
    const basePoints = 200
    const comboMultiplier = this.comboCount
    const points = basePoints * comboMultiplier
    
    // Award points
    this.score += points
    this.updateScoreDisplay()
    
    // Update combo display
    this.updateComboDisplay()
    
    // Reset combo timer
    if (this.comboTimer) {
      this.comboTimer.destroy()
    }
    
    // Set new combo timer (1 second to maintain combo)
    this.comboTimer = this.time.delayedCall(1000, () => {
      this.resetCombo()
    })
    
    // Make player bounce up (slightly less than normal jump)
    player.setVelocityY(GameSettings.game.jumpVelocity * 0.7)
    
    // Squish the ceiling cat
    ceilingCat.squish()
    
    // Show point popup at cat position
    this.showPointPopup(ceilingCat.x, ceilingCat.y - 20, points)
    
    console.log(`Ceiling cat squished! Score: ${this.score}, Combo: x${this.comboCount}, Points: ${points}`)
  }
  
  private updateScoreDisplay(): void {
    this.scoreText.setText(`SCORE: ${this.score}`)
  }
  
  private updateComboDisplay(): void {
    if (this.comboCount > 1) {
      this.comboText.setText(`COMBO x${this.comboCount}!`)
      this.comboText.setVisible(true)
      
      // Animate combo text
      this.tweens.add({
        targets: this.comboText,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 100,
        ease: 'Power2',
        yoyo: true
      })
    }
  }
  
  private resetCombo(): void {
    this.comboCount = 0
    this.comboText.setVisible(false)
    if (this.comboTimer) {
      this.comboTimer.destroy()
      this.comboTimer = null
    }
  }
  
  private createVisibilitySystem(): void {
    // Create four black rectangles to surround the visible area
    const width = GameSettings.canvas.width * 3
    const height = GameSettings.canvas.height * 3
    
    this.visibilityMask = {
      top: this.add.rectangle(0, 0, width, height, 0x000000),
      bottom: this.add.rectangle(0, 0, width, height, 0x000000),
      left: this.add.rectangle(0, 0, width, height, 0x000000),
      right: this.add.rectangle(0, 0, width, height, 0x000000)
    }
    
    // Set depth for all darkness rectangles (in front of hitboxes but behind HUD)
    Object.values(this.visibilityMask).forEach(rect => {
      rect.setDepth(98)
      rect.setOrigin(0, 0)
    })
  }
  
  private updateVisibilitySystem(): void {
    if (!this.visibilityMask) return
    
    const { top, bottom, left, right } = this.visibilityMask
    const radius = this.visibilityRadius
    
    // Get player world position
    const playerX = this.player.x
    const playerY = this.player.y
    
    // Position the black rectangles around the visible square
    // Top rectangle (extend way up to cover top of screen)
    top.setPosition(playerX - radius * 3, playerY - radius * 10) 
    top.setSize(radius * 6, radius * 9)
    
    // Bottom rectangle (extend way down to cover bottom of screen)
    bottom.setPosition(playerX - radius * 3, playerY + radius)
    bottom.setSize(radius * 6, radius * 9)
    
    // Left rectangle (extend way left to cover left of screen)
    left.setPosition(playerX - radius * 10, playerY - radius)
    left.setSize(radius * 9, radius * 2)
    
    // Right rectangle (extend way right to cover right of screen)
    right.setPosition(playerX + radius, playerY - radius)
    right.setSize(radius * 9, radius * 2)
  }
  
  private showPointPopup(x: number, y: number, points: number): void {
    // Create popup text (40% of original size)
    const popupText = this.add.text(x, y, `+${points}`, {
      fontSize: '10px',
      color: '#00ff00',
      fontFamily: 'Arial Black',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 1
    }).setOrigin(0.5).setDepth(150)
    
    // Animate popup: float up and fade out (adjusted for smaller size)
    this.tweens.add({
      targets: popupText,
      y: y - 30,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        popupText.destroy()
      }
    })
    
    // Also animate scale (reduced from 1.5 to 1.2 for smaller text)
    this.tweens.add({
      targets: popupText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 200,
      ease: 'Back.easeOut'
    })
  }
  
  private handlePlayerDamage(player: Player, cat: any): void {
    if (this.isGameOver) return
    
    // Reset combo on death
    this.resetCombo()
    
    // Game over!
    this.isGameOver = true
    
    // Stop the player and disable physics
    player.setVelocity(0, 0)
    player.setTint(0xff0000) // Turn player red
    player.body!.enable = false // Disable physics to prevent further collisions
    
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
    
    // Update visibility system
    this.updateVisibilitySystem()
    
    // Update all cats
    this.cats.children.entries.forEach(cat => {
      (cat as Cat).update(this.time.now, this.game.loop.delta)
    })
    
    // Update all ceiling cats
    this.ceilingCats.children.entries.forEach(ceilingCat => {
      (ceilingCat as CeilingCat).update(this.time.now, this.game.loop.delta)
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
      
      // Add cat on some floors
      if (floor > 1 && Math.random() > 0.5) {
        if (layout.gapStart === -1) {
          // Complete floor
          const cat = new Cat(
            this,
            (floorWidth / 2) * tileSize,
            y - 40,
            tileSize * 1.5,
            tileSize * (floorWidth - 1.5)
          )
          // Green cats already get full floor bounds by default
          this.cats.add(cat)
        } else if (layout.gapStart > 3) {
          // Place on left section if big enough
          const cat = new Cat(
            this,
            (layout.gapStart / 2) * tileSize,
            y - 40,
            tileSize * 0.5,
            tileSize * (layout.gapStart - 0.5)
          )
          // Green cats use full left section bounds
          if (cat.getCatColor() === 'green') {
            cat.platformBounds = {
              left: tileSize * 0.5,
              right: tileSize * (layout.gapStart - 0.5)
            }
          }
          this.cats.add(cat)
        }
      }
      
      // Add ceiling cats to some floors
      if (floor > 2 && Math.random() > 0.4) { // 60% chance
        const maxCeilingCats = floor < 20 ? 1 : 2
        const numCeilingCats = Math.floor(Math.random() * maxCeilingCats) + 1
        
        // Find valid ceiling positions
        const validCeilingPositions: number[] = []
        
        if (layout.gapStart === -1) {
          // Complete floor
          for (let x = 2; x < floorWidth - 2; x++) {
            validCeilingPositions.push(x)
          }
        } else {
          // Floor with gap
          for (let x = 2; x < layout.gapStart - 1; x++) {
            validCeilingPositions.push(x)
          }
          for (let x = layout.gapStart + layout.gapSize + 1; x < floorWidth - 2; x++) {
            validCeilingPositions.push(x)
          }
        }
        
        // Place ceiling cats
        for (let j = 0; j < Math.min(numCeilingCats, validCeilingPositions.length); j++) {
          const randomIndex = Math.floor(Math.random() * validCeilingPositions.length)
          const tileX = validCeilingPositions[randomIndex]
          const ceilingCatX = tileX * tileSize + tileSize/2
          
          // Calculate floor Y position for stalker cats (on the floor, not ceiling)
          const currentFloorY = -floor * floorSpacing + GameSettings.canvas.height - tileSize/2
          const stalkerY = currentFloorY - 16 // Just above the floor platform
          
          validCeilingPositions.splice(randomIndex, 1)
          
          // Calculate platform bounds
          let leftBound = tileSize * 0.5
          let rightBound = tileSize * (floorWidth - 0.5)
          
          if (layout.gapStart !== -1) {
            if (tileX < layout.gapStart) {
              rightBound = tileSize * (layout.gapStart - 0.5)
            } else {
              leftBound = tileSize * (layout.gapStart + layout.gapSize + 0.5)
            }
          }
          
          const stalkerCat = new CeilingCat(
            this,
            ceilingCatX,
            stalkerY,
            leftBound,
            rightBound
          )
          
          stalkerCat.setPlayerReference(this.player)
          this.ceilingCats.add(stalkerCat)
        }
      }
    }
    
    this.highestFloorGenerated += 5
  }

  shutdown() {}
}