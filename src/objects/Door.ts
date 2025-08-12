export class Door extends Phaser.Physics.Arcade.Sprite {
  private promptText: Phaser.GameObjects.Text | null = null
  private playerNearby: boolean = false
  private isFirstLevel: boolean
  
  constructor(scene: Phaser.Scene, x: number, y: number, isFirstLevel: boolean = false) {
    // Create a placeholder texture for the door
    const graphics = scene.add.graphics()
    graphics.fillStyle(0x8B4513, 1) // Brown color
    graphics.fillRect(0, 0, 40, 50)
    graphics.generateTexture('door-placeholder', 40, 50)
    graphics.destroy()
    
    super(scene, x, y, 'door-placeholder')
    
    this.isFirstLevel = isFirstLevel
    
    // Add to scene
    scene.add.existing(this)
    scene.physics.add.existing(this, true) // Static body
    
    // Set up the door appearance
    this.setDisplaySize(40, 50) // Door size
    
    // Set physics body
    const body = this.body as Phaser.Physics.Arcade.StaticBody
    body.setSize(30, 45)
    body.setOffset(5, 5)
    
    // Create the visual door frame (placeholder)
    this.createDoorVisual()
    
    // Set depth
    this.setDepth(10)
  }
  
  private createDoorVisual(): void {
    // Create a simple door visual (will be replaced with actual sprite later)
    const graphics = this.scene.add.graphics()
    
    // Door frame
    graphics.lineStyle(2, 0x4a3c28)
    graphics.strokeRect(this.x - 20, this.y - 25, 40, 50)
    
    // Door panel
    graphics.fillStyle(0x8B4513)
    graphics.fillRect(this.x - 18, this.y - 23, 36, 46)
    
    // Door knob
    graphics.fillStyle(0xFFD700)
    graphics.fillCircle(this.x + 10, this.y, 3)
    
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