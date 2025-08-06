import GameSettings from "../config/GameSettings"

export class TouchControls {
  private scene: Phaser.Scene
  private joystick: Phaser.GameObjects.Container
  private joystickBase: Phaser.GameObjects.Arc
  private joystickKnob: Phaser.GameObjects.Arc
  private jumpButton: Phaser.GameObjects.Container
  private jumpButtonCircle: Phaser.GameObjects.Arc
  private jumpButtonText: Phaser.GameObjects.Text
  
  private isDragging: boolean = false
  private joystickCenter: { x: number, y: number }
  private joystickRadius: number = 40
  private knobRadius: number = 15
  
  // Input state
  public horizontal: number = 0 // -1 to 1
  public vertical: number = 0 // -1 to 1
  public jumpPressed: boolean = false
  public jumpJustPressed: boolean = false
  
  private lastJumpState: boolean = false
  
  // Track individual touches
  private joystickPointerId: number = -1
  private jumpPointerId: number = -1

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.joystickCenter = { x: 80, y: GameSettings.canvas.height - 80 }
    
    this.createJoystick()
    this.createJumpButton()
    this.setupInputHandlers()
  }

  private createJoystick(): void {
    // Create joystick container
    this.joystick = this.scene.add.container(this.joystickCenter.x, this.joystickCenter.y)
    this.joystick.setDepth(1000)
    this.joystick.setScrollFactor(0)

    // Joystick base (outer circle)
    this.joystickBase = this.scene.add.circle(0, 0, this.joystickRadius, 0x333333, 0.6)
    this.joystickBase.setStrokeStyle(3, 0x666666)
    
    // Joystick knob (inner circle)
    this.joystickKnob = this.scene.add.circle(0, 0, this.knobRadius, 0x666666, 0.8)
    this.joystickKnob.setStrokeStyle(2, 0x999999)
    
    this.joystick.add([this.joystickBase, this.joystickKnob])
  }

  private createJumpButton(): void {
    const buttonX = GameSettings.canvas.width - 60
    const buttonY = GameSettings.canvas.height - 80
    
    // Create jump button container
    this.jumpButton = this.scene.add.container(buttonX, buttonY)
    this.jumpButton.setDepth(1000)
    this.jumpButton.setScrollFactor(0)

    // Button circle
    this.jumpButtonCircle = this.scene.add.circle(0, 0, 35, 0x4444aa, 0.7)
    this.jumpButtonCircle.setStrokeStyle(3, 0x6666cc)
    
    // Button text
    this.jumpButtonText = this.scene.add.text(0, 0, 'JUMP', {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'Arial Black',
      fontStyle: 'bold'
    }).setOrigin(0.5)
    
    this.jumpButton.add([this.jumpButtonCircle, this.jumpButtonText])
  }

  private setupInputHandlers(): void {
    // Track active pointers for each control area
    const activePointers = new Set<number>()
    
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      activePointers.add(pointer.id)
      this.handlePointerDown(pointer)
    })

    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (activePointers.has(pointer.id)) {
        this.handlePointerMove(pointer)
      }
    })

    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      activePointers.delete(pointer.id)
      this.handlePointerUp(pointer)
    })
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    const touchX = pointer.x
    const touchY = pointer.y
    
    // Check if touch is on joystick area
    const joystickDist = Math.sqrt(
      Math.pow(touchX - this.joystickCenter.x, 2) + 
      Math.pow(touchY - this.joystickCenter.y, 2)
    )
    
    if (joystickDist <= this.joystickRadius + 20) { // Slightly larger hit area
      if (this.joystickPointerId === -1) {
        this.joystickPointerId = pointer.id
        this.isDragging = true
        this.updateJoystickFromScreen(touchX, touchY)
      }
      return
    }
    
    // Check if touch is on jump button area
    const buttonX = GameSettings.canvas.width - 60
    const buttonY = GameSettings.canvas.height - 80
    const buttonDist = Math.sqrt(
      Math.pow(touchX - buttonX, 2) + 
      Math.pow(touchY - buttonY, 2)
    )
    
    if (buttonDist <= 50) { // Larger hit area for easier tapping
      if (this.jumpPointerId === -1) {
        this.jumpPointerId = pointer.id
        this.jumpPressed = true
        this.jumpButtonCircle.setFillStyle(0x6666ff, 0.9)
      }
    }
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    if (pointer.id === this.joystickPointerId && this.isDragging) {
      this.updateJoystickFromScreen(pointer.x, pointer.y)
    }
  }

  private handlePointerUp(pointer: Phaser.Input.Pointer): void {
    if (pointer.id === this.joystickPointerId) {
      this.joystickPointerId = -1
      this.isDragging = false
      this.resetJoystick()
    }
    
    if (pointer.id === this.jumpPointerId) {
      this.jumpPointerId = -1
      this.jumpPressed = false
      this.jumpButtonCircle.setFillStyle(0x4444aa, 0.7)
    }
  }

  private updateJoystickFromScreen(screenX: number, screenY: number): void {
    // Convert screen coordinates to local joystick coordinates
    const dx = screenX - this.joystickCenter.x
    const dy = screenY - this.joystickCenter.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance <= this.joystickRadius) {
      // Inside joystick area
      this.joystickKnob.x = dx
      this.joystickKnob.y = dy
      this.horizontal = dx / this.joystickRadius
      this.vertical = dy / this.joystickRadius
    } else {
      // Outside joystick area - clamp to edge
      const angle = Math.atan2(dy, dx)
      const maxX = Math.cos(angle) * this.joystickRadius
      const maxY = Math.sin(angle) * this.joystickRadius
      
      this.joystickKnob.x = maxX
      this.joystickKnob.y = maxY
      this.horizontal = maxX / this.joystickRadius
      this.vertical = maxY / this.joystickRadius
    }
  }

  private resetJoystick(): void {
    this.joystickKnob.x = 0
    this.joystickKnob.y = 0
    this.horizontal = 0
    this.vertical = 0
  }

  public update(): void {
    // Update jump just pressed state
    this.jumpJustPressed = this.jumpPressed && !this.lastJumpState
    this.lastJumpState = this.jumpPressed
  }

  public getHorizontal(): number {
    return this.horizontal
  }

  public getVertical(): number {
    return this.vertical
  }

  public isJumpPressed(): boolean {
    return this.jumpPressed
  }

  public isJumpJustPressed(): boolean {
    return this.jumpJustPressed
  }

  public destroy(): void {
    this.joystick.destroy()
    this.jumpButton.destroy()
  }
}