export class Door extends Phaser.Physics.Arcade.Sprite {
  private promptText: Phaser.GameObjects.Text | null = null
  private playerNearby: boolean = false
  private isFirstLevel: boolean
  
  constructor(scene: Phaser.Scene, x: number, y: number, isFirstLevel: boolean = false) {
    // Create a placeholder texture for the door - much bigger
    const graphics = scene.add.graphics()
    graphics.fillStyle(0x8B4513, 1) // Brown color
    graphics.fillRect(0, 0, 80, 100) // Doubled size
    graphics.generateTexture('door-placeholder', 80, 100)
    graphics.destroy()
    
    super(scene, x, y, 'door-placeholder')
    
    this.isFirstLevel = isFirstLevel
    
    // Add to scene
    scene.add.existing(this)
    scene.physics.add.existing(this, true) // Static body
    
    // Set up the door appearance - bigger size
    this.setDisplaySize(80, 100) // Much larger door size
    
    // Set physics body - bigger collision area
    const body = this.body as Phaser.Physics.Arcade.StaticBody
    body.setSize(70, 90)
    body.setOffset(5, 5)
    
    // Create the visual door frame (mining theme)
    this.createDoorVisual()
    
    // Set depth
    this.setDepth(10)
  }
  
  private createDoorVisual(): void {
    // Create complex mining/industrial themed door visual
    const graphics = this.scene.add.graphics()
    
    // Massive steel door frame with depth - outer frame
    graphics.fillStyle(0x2a2a2a, 1) // Very dark steel
    graphics.fillRect(this.x - 50, this.y - 60, 100, 120) // Massive outer frame
    
    // Inner frame with beveled edge effect
    graphics.fillStyle(0x3a3a3a, 1) // Slightly lighter steel
    graphics.fillRect(this.x - 45, this.y - 55, 90, 110) // Mid frame
    
    // Door opening (deepest part)
    graphics.fillStyle(0x0a0a0a, 1) // Almost black
    graphics.fillRect(this.x - 35, this.y - 45, 70, 90) // Inner opening
    
    // Heavy reinforced steel door with multiple layers
    graphics.fillStyle(0x4a4a4a, 1) // Base steel door
    graphics.fillRect(this.x - 32, this.y - 42, 64, 84) // Main door surface
    
    // Heavy wooden panels with mining theme (replacing steel plates)
    graphics.fillStyle(0x6a4838, 1) // Mining wood color (matches ladders)
    graphics.fillRect(this.x - 30, this.y - 35, 25, 30) // Top left panel
    graphics.fillRect(this.x + 5, this.y - 35, 25, 30)  // Top right panel
    graphics.fillRect(this.x - 30, this.y - 5, 25, 30)  // Middle left panel
    graphics.fillRect(this.x + 5, this.y - 5, 25, 30)   // Middle right panel
    graphics.fillRect(this.x - 30, this.y + 25, 25, 17) // Bottom left panel
    graphics.fillRect(this.x + 5, this.y + 25, 25, 17)  // Bottom right panel
    
    // Add wood grain texture to panels
    graphics.lineStyle(1, 0x5a3828, 0.6)
    // Top panels grain
    for (let i = 0; i < 4; i++) {
      const grainY = this.y - 30 + (i * 6)
      graphics.lineBetween(this.x - 28, grainY, this.x - 7, grainY) // Left panel
      graphics.lineBetween(this.x + 7, grainY, this.x + 28, grainY) // Right panel
    }
    // Middle panels grain
    for (let i = 0; i < 4; i++) {
      const grainY = this.y + (i * 6)
      graphics.lineBetween(this.x - 28, grainY, this.x - 7, grainY) // Left panel
      graphics.lineBetween(this.x + 7, grainY, this.x + 28, grainY) // Right panel
    }
    // Bottom panels grain
    for (let i = 0; i < 2; i++) {
      const grainY = this.y + 30 + (i * 6)
      graphics.lineBetween(this.x - 28, grainY, this.x - 7, grainY) // Left panel
      graphics.lineBetween(this.x + 7, grainY, this.x + 28, grainY) // Right panel
    }
    
    // Add wood knots for authenticity
    const woodKnots = [
      {x: this.x - 18, y: this.y - 20}, // Top left panel
      {x: this.x + 15, y: this.y - 25}, // Top right panel
      {x: this.x - 20, y: this.y + 10}, // Middle left panel
      {x: this.x + 18, y: this.y + 8},  // Middle right panel
    ]
    
    graphics.fillStyle(0x3a1808, 0.8)
    woodKnots.forEach(knot => {
      graphics.fillCircle(knot.x, knot.y, 2)
    })
    
    // Rivets all around the plates (authentic mining door detail)
    graphics.fillStyle(0x6a6a6a, 1) // Bright steel rivets
    const rivetPositions = [
      // Top row rivets
      {x: this.x - 25, y: this.y - 30}, {x: this.x - 15, y: this.y - 30}, {x: this.x - 5, y: this.y - 30},
      {x: this.x + 5, y: this.y - 30}, {x: this.x + 15, y: this.y - 30}, {x: this.x + 25, y: this.y - 30},
      // Middle row rivets
      {x: this.x - 25, y: this.y}, {x: this.x - 15, y: this.y}, {x: this.x - 5, y: this.y},
      {x: this.x + 5, y: this.y}, {x: this.x + 15, y: this.y}, {x: this.x + 25, y: this.y},
      // Bottom row rivets
      {x: this.x - 25, y: this.y + 30}, {x: this.x - 15, y: this.y + 30}, {x: this.x - 5, y: this.y + 30},
      {x: this.x + 5, y: this.y + 30}, {x: this.x + 15, y: this.y + 30}, {x: this.x + 25, y: this.y + 30},
      // Side rivets
      {x: this.x - 30, y: this.y - 15}, {x: this.x - 30, y: this.y + 15},
      {x: this.x + 30, y: this.y - 15}, {x: this.x + 30, y: this.y + 15}
    ]
    
    rivetPositions.forEach(rivet => {
      graphics.fillCircle(rivet.x, rivet.y, 2)
      // Rivet highlights for 3D effect
      graphics.fillStyle(0x8a8a8a, 1)
      graphics.fillCircle(rivet.x - 0.5, rivet.y - 0.5, 1)
      graphics.fillStyle(0x6a6a6a, 1)
    })
    
    // Massive industrial hinges with bolts
    graphics.fillStyle(0x3a3a3a, 1) // Dark hinge metal
    graphics.fillRect(this.x - 48, this.y - 35, 12, 20) // Top hinge
    graphics.fillRect(this.x - 48, this.y + 0, 12, 20)  // Middle hinge  
    graphics.fillRect(this.x - 48, this.y + 20, 12, 20) // Bottom hinge
    
    // Hinge bolts and details
    graphics.fillStyle(0x5a5a5a, 1)
    for (let i = 0; i < 3; i++) {
      const hingeY = this.y - 25 + (i * 25)
      graphics.fillCircle(this.x - 44, hingeY, 3) // Hinge pin
      graphics.fillCircle(this.x - 40, hingeY - 6, 2) // Top bolt
      graphics.fillCircle(this.x - 40, hingeY + 6, 2) // Bottom bolt
    }
    
    // Complex wheel handle (mining vault style)
    graphics.fillStyle(0x4a4a4a, 1) // Handle base
    graphics.fillCircle(this.x + 22, this.y + 5, 10) // Larger handle
    graphics.fillStyle(0x6a6a6a, 1)
    graphics.fillCircle(this.x + 22, this.y + 5, 8) // Inner ring
    graphics.fillStyle(0x3a3a3a, 1)
    graphics.fillCircle(this.x + 22, this.y + 5, 3) // Center hub
    
    // Multiple handle spokes (8-spoke mining wheel)
    graphics.lineStyle(3, 0x5a5a5a, 1)
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8
      const spokeLength = 6
      graphics.lineBetween(
        this.x + 22 + Math.cos(angle) * 3,
        this.y + 5 + Math.sin(angle) * 3,
        this.x + 22 + Math.cos(angle) * spokeLength,
        this.y + 5 + Math.sin(angle) * spokeLength
      )
    }
    
    // Pressure gauge on door
    graphics.fillStyle(0x1a1a1a, 1) // Gauge housing
    graphics.fillCircle(this.x - 10, this.y - 15, 8)
    graphics.fillStyle(0x3a3a3a, 1)
    graphics.fillCircle(this.x - 10, this.y - 15, 6)
    // Gauge needle
    graphics.lineStyle(1, 0xff4444, 1) // Red needle
    graphics.lineBetween(this.x - 10, this.y - 15, this.x - 7, this.y - 18)
    
    // Warning signs and hazard markings
    graphics.fillStyle(0xffaa00, 1) // Warning yellow
    graphics.fillRect(this.x + 15, this.y - 35, 12, 8) // Warning sign
    graphics.lineStyle(2, 0x2a2a2a, 1)
    graphics.lineBetween(this.x + 21, this.y - 33, this.x + 21, this.y - 29) // Exclamation mark
    graphics.fillCircle(this.x + 21, this.y - 28, 1)
    
    // Industrial pipes/conduits running alongside door
    graphics.fillStyle(0x5a5a5a, 1)
    graphics.fillRect(this.x + 35, this.y - 50, 4, 100) // Vertical pipe
    graphics.fillStyle(0x4a4a4a, 1)
    graphics.fillRect(this.x + 33, this.y - 20, 8, 4) // Pipe joint
    graphics.fillRect(this.x + 33, this.y + 10, 8, 4) // Another joint
    
    // Ventilation grilles
    graphics.lineStyle(2, 0x2a2a2a, 1)
    for (let i = 0; i < 6; i++) {
      graphics.lineBetween(this.x - 25, this.y + 30 + i * 3, this.x - 10, this.y + 30 + i * 3)
    }
    
    // Heavy-duty mining lantern cluster above door
    graphics.fillStyle(0x2a2a2a, 1) // Lantern housing
    graphics.fillRect(this.x - 8, this.y - 70, 16, 15) // Main housing
    
    // Multiple lights
    graphics.fillStyle(0xffaa00, 0.4) // Warm glow
    graphics.fillCircle(this.x - 4, this.y - 62, 12)
    graphics.fillCircle(this.x + 4, this.y - 62, 12)
    graphics.fillStyle(0xffcc00, 0.3)
    graphics.fillCircle(this.x - 4, this.y - 62, 8)
    graphics.fillCircle(this.x + 4, this.y - 62, 8)
    
    // Lantern mounting bracket
    graphics.fillStyle(0x3a3a3a, 1)
    graphics.fillRect(this.x - 2, this.y - 75, 4, 8)
    
    // Heavy chain supports
    graphics.lineStyle(2, 0x3a3a3a, 1)
    graphics.lineBetween(this.x - 6, this.y - 78, this.x - 6, this.y - 70)
    graphics.lineBetween(this.x + 6, this.y - 78, this.x + 6, this.y - 70)
    
    // Mining company identification placard
    graphics.fillStyle(0x8a7a6a, 1) // Weathered brass
    graphics.fillRect(this.x - 18, this.y - 30, 36, 15)
    graphics.fillStyle(0x7a6a5a, 1) // Aged brass overlay
    graphics.fillRect(this.x - 16, this.y - 28, 32, 11)
    
    // Detailed placard text lines
    graphics.lineStyle(1, 0x2a2a2a, 0.8)
    graphics.lineBetween(this.x - 14, this.y - 25, this.x + 14, this.y - 25) // Title line
    graphics.lineBetween(this.x - 12, this.y - 22, this.x + 12, this.y - 22) // Subtitle
    graphics.lineBetween(this.x - 10, this.y - 19, this.x + 10, this.y - 19) // Warning text
    
    graphics.setDepth(9)
  }
  
  showPrompt(player: Phaser.Physics.Arcade.Sprite): void {
    this.playerNearby = true
    
    if (!this.promptText) {
      if (this.isFirstLevel) {
        // Show instruction popup for first level
        this.createInstructionPopup()
      } else {
        // Show simple prompt for other levels
        this.promptText = this.scene.add.text(
          this.x,
          this.y - 40,
          'Press UP to enter',
          {
            fontSize: '14px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 4, y: 2 }
          }
        ).setOrigin(0.5).setDepth(100)
      }
    }
  }
  
  private createInstructionPopup(): void {
    const centerX = this.scene.cameras.main.width / 2
    const centerY = this.scene.cameras.main.height / 2
    
    // Create popup background
    const popup = this.scene.add.rectangle(
      centerX,
      centerY,
      300,
      150,
      0x2c2c2c,
      0.95
    ).setDepth(200)
    
    // Add border
    const border = this.scene.add.rectangle(
      centerX,
      centerY,
      304,
      154,
      0xffffff
    ).setDepth(199)
    border.setStrokeStyle(2, 0xffffff)
    border.setFillStyle()
    
    // Add instruction text
    this.promptText = this.scene.add.text(
      centerX,
      centerY - 20,
      'Level Complete!',
      {
        fontSize: '24px',
        color: '#44ff44',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5).setDepth(201)
    
    const instructionText = this.scene.add.text(
      centerX,
      centerY + 15,
      'Press UP to enter the door\nand advance to the next level',
      {
        fontSize: '16px',
        color: '#ffffff',
        align: 'center'
      }
    ).setOrigin(0.5).setDepth(201)
    
    // Store references to destroy later
    this.promptText.setData('popup', popup)
    this.promptText.setData('border', border)
    this.promptText.setData('instruction', instructionText)
  }
  
  hidePrompt(): void {
    this.playerNearby = false
    
    if (this.promptText) {
      // Destroy popup elements if they exist
      const popup = this.promptText.getData('popup')
      const border = this.promptText.getData('border')
      const instruction = this.promptText.getData('instruction')
      
      if (popup) popup.destroy()
      if (border) border.destroy()
      if (instruction) instruction.destroy()
      
      this.promptText.destroy()
      this.promptText = null
    }
  }
  
  isPlayerNearby(): boolean {
    return this.playerNearby
  }
  
  destroy(): void {
    this.hidePrompt()
    super.destroy()
  }
}