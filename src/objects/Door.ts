export class Door extends Phaser.Physics.Arcade.Sprite {
  private promptText: Phaser.GameObjects.Text | null = null
  private playerNearby: boolean = false
  private isFirstLevel: boolean
  
  constructor(scene: Phaser.Scene, x: number, y: number, isFirstLevel: boolean = false) {
    console.log("🚪 DOOR CONSTRUCTOR: Creating door")
    console.log(`   Position: (${x}, ${y})`)
    console.log(`   Is first level: ${isFirstLevel}`)
    
    // Create a placeholder texture for the door - much bigger
    const graphics = scene.add.graphics()
    graphics.fillStyle(0x8B4513, 1) // Brown color
    graphics.fillRect(0, 0, 80, 100) // Doubled size
    graphics.generateTexture('door-placeholder', 80, 100)
    graphics.destroy()
    
    super(scene, x, y, 'door-placeholder')
    
    this.isFirstLevel = isFirstLevel
    console.log("🚪 DOOR CONSTRUCTOR: Base sprite created")
    
    // Add to scene
    scene.add.existing(this)
    scene.physics.add.existing(this, true) // Static body
    
    // Set up the door appearance - bigger size
    this.setDisplaySize(80, 100) // Much larger door size
    
    // Set physics body to match visual size exactly
    const body = this.body as Phaser.Physics.Arcade.StaticBody
    body.setSize(80, 100) // Match visual door size exactly
    body.setOffset(0, 0)  // No offset - hitbox matches visual perfectly
    
    // Create the visual door frame (mining theme)
    console.log("🚪 DOOR CONSTRUCTOR: About to call createDoorVisual()")
    this.createDoorVisual()
    console.log("🚪 DOOR CONSTRUCTOR: createDoorVisual() completed")
    
    // Add debug visualization for door positioning
    // this.createDebugVisualization()  // Commented out - debugging complete
    
    // Set depth
    this.setDepth(10)
  }
  
  private createDoorVisual(): void {
    console.log("🚪 DOOR DEBUG: Creating door visual")
    console.log(`   Door position: (${this.x}, ${this.y})`)
    
    // Create a new texture for the door that replaces the brown placeholder
    const graphics = this.scene.add.graphics()
    graphics.clear() // Clear any existing graphics
    console.log("🚪 DOOR DEBUG: Creating NEW TEXTURE to replace brown box")
    
    // Purple door frame extending to floor - draw relative to canvas (0,0)
    console.log("🚪 DOOR DEBUG: Drawing purple frame on texture canvas")
    graphics.fillStyle(0x6a1b9a, 1) // Purple frame color
    graphics.fillRect(0, 0, 100, 15) // Top frame
    graphics.fillRect(0, 0, 15, 120) // Left frame (full height)
    graphics.fillRect(85, 0, 15, 120) // Right frame (full height)
    console.log(`   Frame rects: top(0, 0, 100, 15), left(0, 0, 15, 120), right(85, 0, 15, 120)`)
    
    // Inner frame with beveled edge effect (purple)
    graphics.fillStyle(0x7b1fa2, 1) // Lighter purple
    graphics.fillRect(this.x - 45, this.y - 55, 10, 100) // Left inner frame (extends to floor)
    graphics.fillRect(this.x + 35, this.y - 55, 10, 100) // Right inner frame (extends to floor)
    graphics.fillRect(this.x - 45, this.y - 55, 80, 10) // Top inner frame
    
    // Door opening (deepest part)
    graphics.fillStyle(0x0a0a0a, 1) // Almost black
    graphics.fillRect(this.x - 35, this.y - 45, 70, 90) // Inner opening
    
    // Will draw the main teal door surface LAST after all other details
    
    
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
    
    // Evenly spaced industrial hinges with bolts
    graphics.fillStyle(0x3a3a3a, 1) // Dark hinge metal
    graphics.fillRect(this.x - 48, this.y - 35, 12, 15) // Top hinge
    graphics.fillRect(this.x - 48, this.y - 8, 12, 15)  // Middle hinge  
    graphics.fillRect(this.x - 48, this.y + 19, 12, 15) // Bottom hinge
    
    // Hinge bolts and details (evenly spaced)
    graphics.fillStyle(0x5a5a5a, 1)
    const hingeYPositions = [this.y - 27, this.y - 1, this.y + 26] // Even spacing
    hingeYPositions.forEach(hingeY => {
      graphics.fillCircle(this.x - 44, hingeY, 3) // Hinge pin
      graphics.fillCircle(this.x - 40, hingeY - 5, 2) // Top bolt
      graphics.fillCircle(this.x - 40, hingeY + 5, 2) // Bottom bolt
    })
    
    
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
    
    // NOW draw the main teal door surface AFTER all the details
    console.log("🚪 DOOR DEBUG: Drawing MAIN TEAL DOOR SURFACE (AFTER all details)")
    
    // Main teal door surface (matching ladder colors)
    console.log("🚪 DOOR DEBUG: Drawing main teal door surface")
    graphics.fillStyle(0x40e0d0, 1) // Bright teal wood color (matches ladders)
    graphics.fillRect(15, 15, 70, 100) // Main door surface on canvas
    console.log(`   TEAL DOOR SURFACE: (15, 15, 70, 100) - COLOR: 0x40e0d0`)
    
    // NOW draw the teal door panels on top of everything else
    console.log("🚪 DOOR DEBUG: Drawing TEAL DOOR PANELS on canvas")
    graphics.fillStyle(0x35a0a0, 1) // Medium teal for panels
    graphics.fillRect(20, 25, 20, 20) // Top left panel
    graphics.fillRect(60, 25, 20, 20) // Top right panel
    graphics.fillRect(20, 50, 20, 20) // Middle left panel
    graphics.fillRect(60, 50, 20, 20) // Middle right panel
    graphics.fillRect(20, 75, 20, 20) // Bottom left panel
    graphics.fillRect(60, 75, 20, 20) // Bottom right panel
    console.log("   PANELS: 6 medium teal rectangles drawn with color 0x35a0a0")
    
    // Add panel border details
    graphics.lineStyle(2, 0x2a6660, 1) // Dark teal borders
    graphics.strokeRect(20, 25, 20, 20) // Top left panel border
    graphics.strokeRect(60, 25, 20, 20) // Top right panel border
    graphics.strokeRect(20, 50, 20, 20) // Middle left panel border
    graphics.strokeRect(60, 50, 20, 20) // Middle right panel border
    graphics.strokeRect(20, 75, 20, 20) // Bottom left panel border
    graphics.strokeRect(60, 75, 20, 20) // Bottom right panel border
    
    // Simple door knob (matching ladder style) - draw last
    console.log("🚪 DOOR DEBUG: Drawing DOOR KNOB (final element)")
    graphics.fillStyle(0x2a6660, 1) // Dark teal knob base
    graphics.fillCircle(75, 60, 6) // Door knob on canvas
    graphics.fillStyle(0x35a0a0, 1) // Medium teal highlight
    graphics.fillCircle(75, 60, 4) // Inner knob
    graphics.fillStyle(0x60f0e0, 1) // Light teal shine
    graphics.fillCircle(73, 58, 2) // Highlight spot
    console.log(`   DOOR KNOB: Teal knob at (75, 60) on canvas`)
    
    // Generate a new texture from our graphics and apply it to the door sprite
    console.log("🚪 DOOR DEBUG: Generating final door texture")
    graphics.generateTexture('door-visual-final', 100, 120)
    graphics.destroy() // Clean up the graphics object
    
    // Apply the new texture to the door sprite
    this.setTexture('door-visual-final')
    this.setDisplaySize(100, 120) // Match the new texture size
    
    console.log("🚪 DOOR DEBUG: ✅ TEAL DOOR COMPLETE! Purple frame + teal wood + panels + knob")
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
          this.y - 70,  // Position above door
          'Press UP to enter',
          {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 6, y: 4 },
            stroke: '#ffffff',
            strokeThickness: 1
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
  
  private createDebugVisualization(): void {
    const debugGraphics = this.scene.add.graphics()
    
    // Draw door center point (red dot)
    debugGraphics.fillStyle(0xff0000, 1)
    debugGraphics.fillCircle(this.x, this.y, 5)
    
    // Draw door bounds (green rectangle - visual size)
    debugGraphics.lineStyle(3, 0x00ff00, 1)
    debugGraphics.strokeRect(this.x - 40, this.y - 50, 80, 100) // Visual door bounds
    
    // Draw physics body bounds (blue rectangle - hitbox)
    debugGraphics.lineStyle(3, 0x0000ff, 1)
    const body = this.body as Phaser.Physics.Arcade.StaticBody
    debugGraphics.strokeRect(body.x, body.y, body.width, body.height)
    
    // Draw floor reference line (yellow horizontal line where door bottom should sit)
    debugGraphics.lineStyle(2, 0xffff00, 1)
    const doorBottomY = this.y + 50 // Where the bottom of the door currently is
    debugGraphics.lineBetween(this.x - 60, doorBottomY, this.x + 60, doorBottomY)
    
    // Draw platform reference (orange line where platform surface should be)
    debugGraphics.lineStyle(2, 0xff8800, 1)
    const platformY = doorBottomY // This should align with platform surface
    debugGraphics.lineBetween(this.x - 80, platformY, this.x + 80, platformY)
    
    // Add text labels
    const labelStyle = { fontSize: '12px', color: '#ffffff', backgroundColor: '#000000' }
    
    this.scene.add.text(this.x + 50, this.y - 30, 'DOOR CENTER', labelStyle).setDepth(100)
    this.scene.add.text(this.x + 50, this.y - 10, `X: ${this.x}, Y: ${this.y}`, labelStyle).setDepth(100)
    this.scene.add.text(this.x + 50, this.y + 10, `Physics: ${body.x}, ${body.y}`, labelStyle).setDepth(100)
    this.scene.add.text(this.x + 50, this.y + 30, `Size: ${body.width}x${body.height}`, labelStyle).setDepth(100)
    this.scene.add.text(this.x + 50, doorBottomY, 'DOOR BOTTOM', labelStyle).setDepth(100)
    this.scene.add.text(this.x + 50, platformY + 15, 'PLATFORM SURFACE', labelStyle).setDepth(100)
    
    debugGraphics.setDepth(50) // Above game elements but below UI
  }

  isPlayerNearby(): boolean {
    return this.playerNearby
  }
  
  destroy(): void {
    this.hidePrompt()
    super.destroy()
  }
}