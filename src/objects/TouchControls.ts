import GameSettings from "../config/GameSettings"

export class TouchControls {
  private scene: Phaser.Scene
  
  // D-pad buttons
  private dpadContainer: Phaser.GameObjects.Container
  private upButton: Phaser.GameObjects.Container
  private downButton: Phaser.GameObjects.Container
  private leftButton: Phaser.GameObjects.Container
  private rightButton: Phaser.GameObjects.Container
  
  // Jump button
  private jumpButton: Phaser.GameObjects.Container
  private jumpButtonCircle: Phaser.GameObjects.Arc
  private jumpButtonText: Phaser.GameObjects.Text
  
  // Action button
  private actionButton: Phaser.GameObjects.Container
  private actionButtonCircle: Phaser.GameObjects.Arc
  private actionButtonText: Phaser.GameObjects.Text
  
  // D-pad button states
  public upPressed: boolean = false
  public downPressed: boolean = false
  public leftPressed: boolean = false
  public rightPressed: boolean = false
  public jumpPressed: boolean = false
  public jumpJustPressed: boolean = false
  public actionPressed: boolean = false
  public actionJustPressed: boolean = false
  
  private lastJumpState: boolean = false
  private lastActionState: boolean = false
  
  // Track individual touches for multi-touch
  private upPointerId: number = -1
  private downPointerId: number = -1
  private leftPointerId: number = -1
  private rightPointerId: number = -1
  private jumpPointerId: number = -1
  private actionPointerId: number = -1
  
  // D-pad layout
  private dpadCenter: { x: number, y: number }
  private buttonSize: number = 40
  private dpadBackground: Phaser.GameObjects.Arc

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.dpadCenter = { x: 80, y: GameSettings.canvas.height - 80 }
    
    this.createDpad()
    this.createJumpButton()
    this.createActionButton()
    this.setupInputHandlers()
  }

  private createDpad(): void {
    // Create D-pad container
    this.dpadContainer = this.scene.add.container(this.dpadCenter.x, this.dpadCenter.y)
    this.dpadContainer.setDepth(1000)
    this.dpadContainer.setScrollFactor(0)

    // Create circular background to show diagonal press area
    this.dpadBackground = this.scene.add.circle(0, 0, this.buttonSize * 1.5, 0x222222, 0.4)
    this.dpadBackground.setStrokeStyle(2, 0x444444, 0.6)
    this.dpadContainer.add(this.dpadBackground)

    // Create individual directional buttons
    this.createDirectionalButton('up', 0, -this.buttonSize)
    this.createDirectionalButton('down', 0, this.buttonSize)
    this.createDirectionalButton('left', -this.buttonSize, 0)
    this.createDirectionalButton('right', this.buttonSize, 0)
  }

  private createDirectionalButton(direction: 'up' | 'down' | 'left' | 'right', x: number, y: number): void {
    const button = this.scene.add.container(x, y)
    
    // Button background
    const buttonBg = this.scene.add.rectangle(0, 0, this.buttonSize, this.buttonSize, 0x444444, 0.7)
    buttonBg.setStrokeStyle(2, 0x666666)
    
    // Arrow indicator
    const arrowSize = 8
    const arrow = this.scene.add.graphics()
    arrow.fillStyle(0xffffff, 0.9)
    
    switch (direction) {
      case 'up':
        arrow.fillTriangle(0, -arrowSize/2, -arrowSize/2, arrowSize/2, arrowSize/2, arrowSize/2)
        break
      case 'down':
        arrow.fillTriangle(0, arrowSize/2, -arrowSize/2, -arrowSize/2, arrowSize/2, -arrowSize/2)
        break
      case 'left':
        arrow.fillTriangle(-arrowSize/2, 0, arrowSize/2, -arrowSize/2, arrowSize/2, arrowSize/2)
        break
      case 'right':
        arrow.fillTriangle(arrowSize/2, 0, -arrowSize/2, -arrowSize/2, -arrowSize/2, arrowSize/2)
        break
    }
    
    button.add([buttonBg, arrow])
    this.dpadContainer.add(button)
    
    // Store button references
    switch (direction) {
      case 'up': this.upButton = button; break
      case 'down': this.downButton = button; break
      case 'left': this.leftButton = button; break
      case 'right': this.rightButton = button; break
    }
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

  private createActionButton(): void {
    const buttonX = GameSettings.canvas.width - 140 // Left of jump button
    const buttonY = GameSettings.canvas.height - 80
    
    // Create action button container (initially hidden)
    this.actionButton = this.scene.add.container(buttonX, buttonY)
    this.actionButton.setDepth(1000)
    this.actionButton.setScrollFactor(0)
    this.actionButton.setVisible(false)

    // Button circle (larger than jump button)
    this.actionButtonCircle = this.scene.add.circle(0, 0, 40, 0xaa4444, 0.7)
    this.actionButtonCircle.setStrokeStyle(3, 0xcc6666)
    
    // Button text
    this.actionButtonText = this.scene.add.text(0, 0, 'ACTION', {
      fontSize: '11px',
      color: '#ffffff',
      fontFamily: 'Arial Black',
      fontStyle: 'bold'
    }).setOrigin(0.5)
    
    this.actionButton.add([this.actionButtonCircle, this.actionButtonText])
  }

  private setupInputHandlers(): void {
    // Track active pointers for multi-touch
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
    
    // Check D-pad buttons
    this.checkDpadButton(pointer, touchX, touchY, 'up')
    this.checkDpadButton(pointer, touchX, touchY, 'down')
    this.checkDpadButton(pointer, touchX, touchY, 'left')
    this.checkDpadButton(pointer, touchX, touchY, 'right')
    
    // Check if touch is on jump button area
    const jumpButtonX = GameSettings.canvas.width - 60
    const jumpButtonY = GameSettings.canvas.height - 80
    const jumpButtonDist = Math.sqrt(
      Math.pow(touchX - jumpButtonX, 2) + 
      Math.pow(touchY - jumpButtonY, 2)
    )
    
    if (jumpButtonDist <= 50) { // Larger hit area for easier tapping
      if (this.jumpPointerId === -1) {
        this.jumpPointerId = pointer.id
        this.jumpPressed = true
        this.jumpButtonCircle.setFillStyle(0x6666ff, 0.9)
      }
      return
    }
    
    // Check if touch is on action button area (only if visible)
    if (this.actionButton.visible) {
      const actionButtonX = GameSettings.canvas.width - 140
      const actionButtonY = GameSettings.canvas.height - 80
      const actionButtonDist = Math.sqrt(
        Math.pow(touchX - actionButtonX, 2) + 
        Math.pow(touchY - actionButtonY, 2)
      )
      
      if (actionButtonDist <= 55) { // Larger hit area since button is bigger
        if (this.actionPointerId === -1) {
          this.actionPointerId = pointer.id
          this.actionPressed = true
          this.actionButtonCircle.setFillStyle(0xff6666, 0.9)
        }
      }
    }
  }

  private checkDpadButton(pointer: Phaser.Input.Pointer, touchX: number, touchY: number, direction: 'up' | 'down' | 'left' | 'right'): void {
    let buttonX = this.dpadCenter.x
    let buttonY = this.dpadCenter.y
    
    switch (direction) {
      case 'up': buttonY -= this.buttonSize; break
      case 'down': buttonY += this.buttonSize; break
      case 'left': buttonX -= this.buttonSize; break
      case 'right': buttonX += this.buttonSize; break
    }
    
    const distance = Math.sqrt(
      Math.pow(touchX - buttonX, 2) + 
      Math.pow(touchY - buttonY, 2)
    )
    
    if (distance <= this.buttonSize) {
      const pointerIdField = `${direction}PointerId` as keyof this
      const pressedField = `${direction}Pressed` as keyof this
      
      if ((this as any)[pointerIdField] === -1) {
        (this as any)[pointerIdField] = pointer.id
        ;(this as any)[pressedField] = true
        this.highlightButton(direction, true)
      }
    }
  }

  private highlightButton(direction: 'up' | 'down' | 'left' | 'right', highlight: boolean): void {
    let button: Phaser.GameObjects.Container
    
    switch (direction) {
      case 'up': button = this.upButton; break
      case 'down': button = this.downButton; break
      case 'left': button = this.leftButton; break
      case 'right': button = this.rightButton; break
    }
    
    const buttonBg = button.list[0] as Phaser.GameObjects.Rectangle
    if (highlight) {
      buttonBg.setFillStyle(0x666666, 0.9)
    } else {
      buttonBg.setFillStyle(0x444444, 0.7)
    }
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    // Check if this pointer is already controlling a D-pad button
    const isDpadPointer = pointer.id === this.upPointerId || 
                         pointer.id === this.downPointerId || 
                         pointer.id === this.leftPointerId || 
                         pointer.id === this.rightPointerId
    
    if (isDpadPointer) {
      // Update D-pad button states based on current finger position
      this.updateDpadFromPointer(pointer)
    } else {
      // Check if finger is sliding back onto D-pad area from outside
      this.checkDpadReentry(pointer)
    }
  }

  private handlePointerUp(pointer: Phaser.Input.Pointer): void {
    // Check D-pad button releases
    this.releaseDpadButton(pointer, 'up')
    this.releaseDpadButton(pointer, 'down')
    this.releaseDpadButton(pointer, 'left')
    this.releaseDpadButton(pointer, 'right')
    
    if (pointer.id === this.jumpPointerId) {
      this.jumpPointerId = -1
      this.jumpPressed = false
      this.jumpButtonCircle.setFillStyle(0x4444aa, 0.7)
    }
    
    if (pointer.id === this.actionPointerId) {
      this.actionPointerId = -1
      this.actionPressed = false
      this.actionButtonCircle.setFillStyle(0xaa4444, 0.7)
    }
  }

  private updateDpadFromPointer(pointer: Phaser.Input.Pointer): void {
    const touchX = pointer.x
    const touchY = pointer.y
    
    // Calculate which buttons should be active based on current finger position
    const upActive = this.isPointInButton(touchX, touchY, 'up')
    const downActive = this.isPointInButton(touchX, touchY, 'down')
    const leftActive = this.isPointInButton(touchX, touchY, 'left')
    const rightActive = this.isPointInButton(touchX, touchY, 'right')
    
    // Update button states for this pointer
    if (pointer.id === this.upPointerId || pointer.id === this.downPointerId || 
        pointer.id === this.leftPointerId || pointer.id === this.rightPointerId) {
      
      // Clear states that are no longer active for this pointer
      if (pointer.id === this.upPointerId && !upActive) {
        this.upPressed = false
        this.highlightButton('up', false)
        // Don't clear upPointerId - keep tracking the pointer
      }
      if (pointer.id === this.downPointerId && !downActive) {
        this.downPressed = false
        this.highlightButton('down', false)
        // Don't clear downPointerId - keep tracking the pointer
      }
      if (pointer.id === this.leftPointerId && !leftActive) {
        this.leftPressed = false
        this.highlightButton('left', false)
        // Don't clear leftPointerId - keep tracking the pointer
      }
      if (pointer.id === this.rightPointerId && !rightActive) {
        this.rightPressed = false
        this.highlightButton('right', false)
        // Don't clear rightPointerId - keep tracking the pointer
      }
      
      // Activate states when finger slides back onto buttons
      if (upActive && !this.upPressed && (this.upPointerId === -1 || this.upPointerId === pointer.id)) {
        this.upPointerId = pointer.id
        this.upPressed = true
        this.highlightButton('up', true)
      }
      if (downActive && !this.downPressed && (this.downPointerId === -1 || this.downPointerId === pointer.id)) {
        this.downPointerId = pointer.id
        this.downPressed = true
        this.highlightButton('down', true)
      }
      if (leftActive && !this.leftPressed && (this.leftPointerId === -1 || this.leftPointerId === pointer.id)) {
        this.leftPointerId = pointer.id
        this.leftPressed = true
        this.highlightButton('left', true)
      }
      if (rightActive && !this.rightPressed && (this.rightPointerId === -1 || this.rightPointerId === pointer.id)) {
        this.rightPointerId = pointer.id
        this.rightPressed = true
        this.highlightButton('right', true)
      }
    }
  }
  
  private checkDpadReentry(pointer: Phaser.Input.Pointer): void {
    const touchX = pointer.x
    const touchY = pointer.y
    
    // Check if finger is in D-pad general area (larger radius for re-entry)
    const dpadDistance = Math.sqrt(
      Math.pow(touchX - this.dpadCenter.x, 2) + 
      Math.pow(touchY - this.dpadCenter.y, 2)
    )
    
    // Allow re-entry if within expanded D-pad area (2x button size radius)
    if (dpadDistance <= this.buttonSize * 2.5) {
      // Check individual buttons for this pointer
      this.checkDpadButton(pointer, touchX, touchY, 'up')
      this.checkDpadButton(pointer, touchX, touchY, 'down') 
      this.checkDpadButton(pointer, touchX, touchY, 'left')
      this.checkDpadButton(pointer, touchX, touchY, 'right')
    }
  }
  
  private isPointInButton(touchX: number, touchY: number, direction: 'up' | 'down' | 'left' | 'right'): boolean {
    let buttonX = this.dpadCenter.x
    let buttonY = this.dpadCenter.y
    
    switch (direction) {
      case 'up': buttonY -= this.buttonSize; break
      case 'down': buttonY += this.buttonSize; break
      case 'left': buttonX -= this.buttonSize; break
      case 'right': buttonX += this.buttonSize; break
    }
    
    const distance = Math.sqrt(
      Math.pow(touchX - buttonX, 2) + 
      Math.pow(touchY - buttonY, 2)
    )
    
    return distance <= this.buttonSize
  }

  private releaseDpadButton(pointer: Phaser.Input.Pointer, direction: 'up' | 'down' | 'left' | 'right'): void {
    const pointerIdField = `${direction}PointerId` as keyof this
    const pressedField = `${direction}Pressed` as keyof this
    
    if ((this as any)[pointerIdField] === pointer.id) {
      (this as any)[pointerIdField] = -1
      ;(this as any)[pressedField] = false
      this.highlightButton(direction, false)
    }
  }


  public update(): void {
    // Update jump just pressed state
    this.jumpJustPressed = this.jumpPressed && !this.lastJumpState
    this.lastJumpState = this.jumpPressed
    
    // Update action just pressed state
    this.actionJustPressed = this.actionPressed && !this.lastActionState
    this.lastActionState = this.actionPressed
  }

  public getHorizontal(): number {
    let horizontal = 0
    if (this.leftPressed) horizontal -= 1
    if (this.rightPressed) horizontal += 1
    return horizontal
  }

  public getVertical(): number {
    let vertical = 0
    if (this.upPressed) vertical -= 1
    if (this.downPressed) vertical += 1
    return vertical
  }

  public isJumpPressed(): boolean {
    return this.jumpPressed
  }

  public isJumpJustPressed(): boolean {
    return this.jumpJustPressed
  }

  public isActionPressed(): boolean {
    return this.actionPressed
  }

  public isActionJustPressed(): boolean {
    return this.actionJustPressed
  }

  public showActionButton(show: boolean): void {
    this.actionButton.setVisible(show)
  }

  public destroy(): void {
    this.dpadContainer.destroy()
    this.jumpButton.destroy()
    this.actionButton.destroy()
  }
}