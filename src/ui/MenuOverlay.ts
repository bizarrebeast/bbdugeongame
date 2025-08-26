import { GameScene } from '../scenes/GameScene'
import GameSettings from '../config/GameSettings'

export class MenuOverlay {
  private scene: GameScene
  private container: Phaser.GameObjects.Container
  private isOpen: boolean = false
  
  // Audio settings (separate from SDK mute)
  private soundEffectsEnabled: boolean = true
  private musicEnabled: boolean = true
  
  // UI elements
  private backgroundOverlay: Phaser.GameObjects.Rectangle
  private menuPanel: Phaser.GameObjects.Graphics
  private soundToggle: Phaser.GameObjects.Container | null = null
  private musicToggle: Phaser.GameObjects.Container | null = null
  private instructionsOverlay: Phaser.GameObjects.Container | null = null
  
  constructor(scene: GameScene) {
    this.scene = scene
    this.loadSettings()
    this.create()
  }
  
  private create(): void {
    // Get camera dimensions for proper centering
    const camera = this.scene.cameras.main
    const centerX = camera.width / 2
    const centerY = camera.height / 2
    
    
    // Main container for entire menu - positioned at camera center
    this.container = this.scene.add.container(centerX, centerY)
    this.container.setDepth(1500)
    // Make the container fixed to camera so it doesn't move with the game world
    this.container.setScrollFactor(0, 0)
    
    // Semi-transparent background overlay - covers entire camera view
    this.backgroundOverlay = this.scene.add.rectangle(
      0, 0,
      camera.width * 2, // Make it extra wide to ensure full coverage
      camera.height * 2, // Make it extra tall to ensure full coverage
      0x000000, 0.7
    )
    // Block all game clicks by consuming pointer events
    this.backgroundOverlay.setInteractive()
    this.backgroundOverlay.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation()
    })
    
    // Main menu panel - positioned at center relative to container
    this.menuPanel = this.createMenuPanel()
    
    // Title
    const title = this.scene.add.text(0, -200, 'GAME MENU', {
      fontSize: '18px',
      fontFamily: '"Press Start 2P", system-ui',
      color: '#FFD700', // Keep gold for title
      align: 'center'
    })
    title.setOrigin(0.5)
    
    // Instructions button
    const instructionsBtn = this.createButton(
      0, -140, 
      'VIEW INSTRUCTIONS',
      () => this.openInstructionsScene(),
      0x4a148c // Purple
    )
    
    // Divider line
    const divider1 = this.createDivider(-100)
    
    // Sound effects toggle (with line break)
    this.soundToggle = this.createToggleSwitch(
      'Sound\nEffects',
      -60,
      this.soundEffectsEnabled,
      (enabled) => this.setSoundEffects(enabled)
    )
    
    // Music toggle
    this.musicToggle = this.createToggleSwitch(
      'Music',
      -10,
      this.musicEnabled,
      (enabled) => this.setMusic(enabled)
    )
    
    // Divider line
    const divider2 = this.createDivider(30)
    
    // BizarreBeasts info instead of SDK indicator
    const bizarreInfo = this.createBizarreInfo(60)
    
    // Divider line
    const divider3 = this.createDivider(170)
    
    // Resume button
    const resumeBtn = this.createButton(
      0, 210,
      'RESUME GAME',
      () => this.close(),
      0x32CD32 // Keep green for resume
    )
    
    // Add all elements to container
    this.container.add([
      this.backgroundOverlay,
      this.menuPanel,
      title,
      instructionsBtn,
      divider1,
      this.soundToggle,
      this.musicToggle,
      divider2,
      bizarreInfo,
      divider3,
      resumeBtn
    ])
    
    // Set scroll factor for all children to match container
    this.container.list.forEach((child: any) => {
      if (child.setScrollFactor) {
        child.setScrollFactor(0)
      }
    })
    
    // Initially hidden
    this.container.setVisible(false)
  }
  
  private createMenuPanel(): Phaser.GameObjects.Graphics {
    const panel = this.scene.add.graphics()
    
    // Draw purple panel with border - centered relative to container
    const panelWidth = Math.min(400, this.scene.cameras.main.width - 40)
    const panelHeight = Math.min(500, this.scene.cameras.main.height - 40)
    const panelX = -panelWidth / 2
    const panelY = -panelHeight / 2
    
    
    // Purple background with gold border
    panel.fillStyle(0x4a148c, 0.95) // Purple background
    panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 15)
    
    panel.lineStyle(3, 0xFFD700) // Gold border
    panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 15)
    
    return panel
  }
  
  private createButton(
    x: number, 
    y: number, 
    text: string, 
    onClick: () => void,
    color: number = 0x4a148c
  ): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y)
    
    // Use a rectangle game object instead of graphics for better hit detection
    const buttonWidth = 340
    const buttonHeight = 50
    
    // Create visual background rectangle
    const bgRect = this.scene.add.rectangle(0, 0, buttonWidth, buttonHeight, color, 0.8)
    bgRect.setStrokeStyle(2, 0xFFD700)
    
    // Button text
    const btnText = this.scene.add.text(0, 0, text, {
      fontSize: '14px',
      fontFamily: '"Press Start 2P", system-ui',
      color: '#FFD700' // Yellow text
    })
    btnText.setOrigin(0.5)
    
    container.add([bgRect, btnText])
    
    // Make the rectangle interactive (it will use its own bounds)
    bgRect.setInteractive({ useHandCursor: true })
    
    // Debug: Check if interactive is set
    console.log(`Button "${text}" interactive:`, bgRect.input !== null)
    
    bgRect.on('pointerover', () => {
      console.log('Button hover:', text)
      bgRect.setFillStyle(0x20B2AA, 0.9)
    })
    
    bgRect.on('pointerout', () => {
      bgRect.setFillStyle(color, 0.8)
    })
    
    bgRect.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      console.log('Button clicked:', text)
      if (pointer && pointer.event) {
        pointer.event.stopPropagation()
      }
      onClick()
    })
    
    // Also make the container itself interactive as a fallback
    container.setInteractive(new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains)
    container.on('pointerdown', () => {
      console.log('Container clicked:', text)
      onClick()
    })
    
    return container
  }
  
  private createToggleSwitch(
    label: string,
    y: number,
    initialState: boolean,
    onChange: (enabled: boolean) => void
  ): Phaser.GameObjects.Container {
    const container = this.scene.add.container(0, y)
    
    // Label text (supports multi-line)
    const labelText = this.scene.add.text(-90, 0, label, {
      fontSize: '12px',
      fontFamily: '"Press Start 2P", system-ui',
      color: '#FFD700', // Yellow text
      align: 'left',
      lineSpacing: 5
    })
    labelText.setOrigin(0, 0.5)
    
    // Toggle track
    const track = this.scene.add.graphics()
    const trackX = 80
    const trackWidth = 60
    const trackHeight = 30
    
    const updateTrackColor = (enabled: boolean) => {
      track.clear()
      track.fillStyle(enabled ? 0x32CD32 : 0xFF6B6B, 1)
      track.fillRoundedRect(trackX - trackWidth/2, -trackHeight/2, trackWidth, trackHeight, 15)
      track.lineStyle(2, 0xFFD700) // Gold border
      track.strokeRoundedRect(trackX - trackWidth/2, -trackHeight/2, trackWidth, trackHeight, 15)
    }
    
    updateTrackColor(initialState)
    
    // Toggle knob
    const knobX = initialState ? trackX + 15 : trackX - 15
    const knob = this.scene.add.circle(knobX, 0, 13, 0xFFFFFF)
    knob.setStrokeStyle(2, 0xFFD700) // Gold border
    
    container.add([labelText, track, knob])
    
    // Make interactive
    track.setInteractive(new Phaser.Geom.Rectangle(
      trackX - trackWidth/2, -trackHeight/2, trackWidth, trackHeight
    ), Phaser.Geom.Rectangle.Contains)
    
    let currentState = initialState
    
    track.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation()
      currentState = !currentState
      
      // Animate knob
      this.scene.tweens.add({
        targets: knob,
        x: currentState ? trackX + 15 : trackX - 15,
        duration: 200,
        ease: 'Power2'
      })
      
      // Update colors
      updateTrackColor(currentState)
      
      // Callback
      onChange(currentState)
    })
    
    // Store current state in container data
    container.setData('enabled', currentState)
    container.setData('updateState', (enabled: boolean) => {
      currentState = enabled
      knob.x = enabled ? trackX + 15 : trackX - 15
      updateTrackColor(enabled)
    })
    
    return container
  }
  
  private createDivider(y: number): Phaser.GameObjects.Graphics {
    const divider = this.scene.add.graphics()
    divider.lineStyle(1, 0xFFD700, 0.3) // Gold divider
    divider.moveTo(-150, y)
    divider.lineTo(150, y)
    divider.strokePath()
    return divider
  }
  
  private createBizarreInfo(y: number): Phaser.GameObjects.Container {
    const container = this.scene.add.container(0, y)
    
    // Project name
    const projectName = this.scene.add.text(0, 0, 'BizarreBeasts ($BB)', {
      fontSize: '12px',
      fontFamily: '"Press Start 2P", system-ui',
      color: '#FFD700' // Yellow text
    })
    projectName.setOrigin(0.5)
    
    // Contract address (same size as Created by)
    const contractText = this.scene.add.text(0, 25, 'CA:', {
      fontSize: '10px',
      fontFamily: '"Press Start 2P", system-ui',
      color: '#FFD700'
    })
    contractText.setOrigin(0.5)
    
    const contractAddress = this.scene.add.text(0, 45, 
      '0x0520bf1d3cEE163407aDA79109333aB1599b4004', {
      fontSize: '7px',
      fontFamily: 'monospace',
      color: '#FFD700',
      wordWrap: { width: 320 }
    })
    contractAddress.setOrigin(0.5)
    
    // Creator info
    const creatorText = this.scene.add.text(0, 70, 'Created by @bizarrebeast', {
      fontSize: '10px',
      fontFamily: '"Press Start 2P", system-ui',
      color: '#FFD700'
    })
    creatorText.setOrigin(0.5)
    
    // Join info
    const joinText = this.scene.add.text(0, 95, 'Join /bizarrebeasts', {
      fontSize: '10px',
      fontFamily: '"Press Start 2P", system-ui',
      color: '#FFD700'
    })
    joinText.setOrigin(0.5)
    
    container.add([projectName, contractText, contractAddress, creatorText, joinText])
    
    return container
  }
  
  private createSDKIndicator(y: number): Phaser.GameObjects.Container {
    const container = this.scene.add.container(0, y)
    
    // Check SDK mute status
    const sdkMuted = this.scene.game.sound.mute
    
    const text = this.scene.add.text(0, 0,
      `SDK Global: ${sdkMuted ? 'MUTED' : 'ACTIVE'}`,
      {
        fontSize: '11px',
        fontFamily: '"Press Start 2P", system-ui',
        color: sdkMuted ? '#FF6B6B' : '#AAAAAA'
      }
    )
    text.setOrigin(0.5)
    
    // Info text below
    const info = this.scene.add.text(0, 20, 
      '(Controlled by platform)',
      {
        fontSize: '8px',
        fontFamily: '"Press Start 2P", system-ui',
        color: '#777777'
      }
    )
    info.setOrigin(0.5)
    
    container.add([text, info])
    
    // Store reference to update later
    container.setData('updateStatus', () => {
      const muted = this.scene.game.sound.mute
      text.setText(`SDK Global: ${muted ? 'MUTED' : 'ACTIVE'}`)
      text.setColor(muted ? '#FF6B6B' : '#AAAAAA')
    })
    
    return container
  }
  
  private setSoundEffects(enabled: boolean): void {
    this.soundEffectsEnabled = enabled
    this.scene.registry.set('sfxEnabled', enabled)
    this.saveSettings()
    
    // Update volume if SDK is not muted
    if (!this.scene.game.sound.mute) {
      this.scene.registry.set('sfxVolume', enabled ? 1.0 : 0)
    }
  }
  
  private setMusic(enabled: boolean): void {
    this.musicEnabled = enabled
    this.scene.registry.set('musicEnabled', enabled)
    this.saveSettings()
    
    // Update music volume if SDK is not muted
    if (!this.scene.game.sound.mute) {
      this.scene.registry.set('musicVolume', enabled ? 0.7 : 0)
      // TODO: Update current music volume when music system is implemented
    }
  }
  
  private loadSettings(): void {
    const saved = localStorage.getItem('audioSettings')
    if (saved) {
      const settings = JSON.parse(saved)
      this.soundEffectsEnabled = settings.soundEffectsEnabled !== false
      this.musicEnabled = settings.musicEnabled !== false
    }
    
    // Apply loaded settings
    this.scene.registry.set('sfxEnabled', this.soundEffectsEnabled)
    this.scene.registry.set('musicEnabled', this.musicEnabled)
  }
  
  private saveSettings(): void {
    const settings = {
      soundEffectsEnabled: this.soundEffectsEnabled,
      musicEnabled: this.musicEnabled
    }
    localStorage.setItem('audioSettings', JSON.stringify(settings))
  }
  
  open(): void {
    if (this.isOpen) {
      return
    }
    
    this.isOpen = true
    this.container.setVisible(true)
    
    // Update SDK indicator
    const indicators = this.container.list.filter(obj => 
      obj instanceof Phaser.GameObjects.Container && obj.getData('updateStatus')
    )
    indicators.forEach(indicator => {
      const updateFn = indicator.getData('updateStatus')
      if (updateFn) updateFn()
    })
    
    // Pause game
    this.pauseGame()
    
    // Just set it visible directly - the fade animation seems to break it
    this.container.setAlpha(1)
  }
  
  close(): void {
    console.log('close() called, isOpen:', this.isOpen)
    if (!this.isOpen) {
      return
    }
    
    // Set flag immediately
    this.isOpen = false
    
    // Hide the container immediately
    this.container.setVisible(false)
    this.container.setAlpha(1) // Reset alpha for next open
    console.log('Menu closed')
    
    // Resume game immediately
    this.resumeGame()
  }
  
  private pauseGame(): void {
    // Pause physics
    this.scene.physics.pause()
    
    // Pause all animations
    this.scene.anims.pauseAll()
    
    // Pause timers
    this.scene.time.paused = true
    
    // Pause all tweens in the scene
    this.scene.tweens.pauseAll()
    
    // Set pause flag
    this.scene.registry.set('isPaused', true)
  }
  
  private resumeGame(): void {
    // Resume physics
    this.scene.physics.resume()
    
    // Resume animations
    this.scene.anims.resumeAll()
    
    // Resume timers
    this.scene.time.paused = false
    
    // Resume all tweens
    this.scene.tweens.resumeAll()
    
    // Clear pause flag
    this.scene.registry.set('isPaused', false)
  }
  
  private showInstructions(): void {
    // Create instructions overlay if it doesn't exist
    if (!this.instructionsOverlay) {
      this.createInstructionsOverlay()
    }
    
    this.instructionsOverlay?.setVisible(true)
    
    // Fade in
    this.instructionsOverlay?.setAlpha(0)
    this.scene.tweens.add({
      targets: this.instructionsOverlay,
      alpha: 1,
      duration: 200
    })
  }
  
  private createInstructionsOverlay(): void {
    // Create container for instructions
    this.instructionsOverlay = this.scene.add.container(
      GameSettings.canvas.width / 2,
      GameSettings.canvas.height / 2
    )
    this.instructionsOverlay.setDepth(2000) // Above menu
    
    // Dark background
    const bg = this.scene.add.rectangle(
      0, 0,
      GameSettings.canvas.width,
      GameSettings.canvas.height,
      0x000000, 0.9
    )
    bg.setInteractive()
    
    // Instructions panel
    const panel = this.scene.add.graphics()
    panel.fillStyle(0x008080, 0.95)
    panel.fillRoundedRect(-300, -250, 600, 500, 15)
    panel.lineStyle(3, 0x20B2AA)
    panel.strokeRoundedRect(-300, -250, 600, 500, 15)
    
    // Title
    const title = this.scene.add.text(0, -210, 'INSTRUCTIONS', {
      fontSize: '18px',
      fontFamily: '"Press Start 2P", system-ui',
      color: '#FFD700'
    })
    title.setOrigin(0.5)
    
    // Instructions content (simplified version)
    const instructions = [
      'CONTROLS:',
      '',
      'Move: WASD or Arrow Keys',
      'Jump: Space or E',
      'Climb: Up/Down on ladders',
      'Throw: Q, V, or M',
      '',
      'OBJECTIVE:',
      '',
      'Collect coins and gems',
      'Avoid or defeat enemies',
      'Reach the door to advance',
      '',
      'Press ESC to open this menu'
    ]
    
    const content = this.scene.add.text(0, -100, instructions.join('\n'), {
      fontSize: '12px',
      fontFamily: '"Press Start 2P", system-ui',
      color: '#FFFFFF',
      align: 'center',
      lineSpacing: 8
    })
    content.setOrigin(0.5)
    
    // Close button
    const closeBtn = this.createButton(
      0, 210,
      'CLOSE',
      () => this.hideInstructions(),
      0xFF6B6B
    )
    
    this.instructionsOverlay.add([bg, panel, title, content, closeBtn])
    this.instructionsOverlay.setVisible(false)
  }
  
  private hideInstructions(): void {
    this.scene.tweens.add({
      targets: this.instructionsOverlay,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.instructionsOverlay?.setVisible(false)
      }
    })
  }
  
  private openInstructionsScene(): void {
    console.log('openInstructionsScene called')
    
    // Keep menu state but hide it
    this.container.setVisible(false)
    // Don't change isOpen flag - we're still conceptually in the menu
    
    // Sleep the game scene (preserves state better than pause)
    this.scene.scene.sleep('GameScene')
    
    console.log('Launching InstructionsScene as overlay...')
    // Launch instructions as an overlay scene
    this.scene.scene.launch('InstructionsScene', { 
      returnScene: 'GameScene',
      fromMenu: true,  // This tells InstructionsScene to show "Close" instead of "Skip All"
      reopenMenu: true // This tells it to reopen the menu when closing
    })
  }
  
  private showDebugHitboxes(): void {
    console.log('Drawing debug hitboxes...')
    
    // Skip the background overlay (index 0) and draw debug rectangles for all interactive elements
    this.container.list.forEach((child: any, index) => {
      // Skip the background overlay
      if (index === 0) {
        console.log('Skipping background overlay')
        return
      }
      
      if (child.type === 'Container') {
        // Find interactive children in containers (buttons)
        child.list?.forEach((subChild: any, subIndex) => {
          if (subChild.type === 'Rectangle' && subChild.input) {
            // This is a button rectangle
            try {
              // Calculate bounds manually for rectangles
              const x = this.container.x + child.x + subChild.x
              const y = this.container.y + child.y + subChild.y
              const width = subChild.width
              const height = subChild.height
              
              const debugRect = this.scene.add.rectangle(
                x,
                y,
                width,
                height,
                0x00FF00, 0.3  // Green with transparency
              )
              debugRect.setStrokeStyle(3, 0x00FF00, 1)
              debugRect.setScrollFactor(0)
              debugRect.setDepth(2002)
              
              // Add label with button name
              let buttonName = 'Unknown'
              if (index === 3) buttonName = 'Instructions'
              else if (index === 10) buttonName = 'Resume'
              
              const label = this.scene.add.text(
                x,
                y,
                buttonName,
                { fontSize: '12px', color: '#00FF00', backgroundColor: '#000000' }
              )
              label.setScrollFactor(0)
              label.setDepth(2003)
              label.setOrigin(0.5)
              
              console.log(`Button ${buttonName} (${index}): x=${x}, y=${y}, w=${width}, h=${height}`)
            } catch (e) {
              console.log(`Error getting bounds for ${index}:`, e)
            }
          }
        })
      }
    })
    
    // Show the toggle switch hitboxes
    if (this.soundToggle) {
      const track = this.soundToggle.list.find((child: any) => child.type === 'Graphics')
      if (track?.input) {
        // Position relative to the container
        const x = this.container.x + this.soundToggle.x + 80
        const y = this.container.y + this.soundToggle.y
        
        const debugRect = this.scene.add.rectangle(
          x, y,
          60, 30,  // Toggle dimensions
          0xFFFF00, 0.3  // Yellow
        )
        debugRect.setStrokeStyle(3, 0xFFFF00, 1)
        debugRect.setScrollFactor(0)
        debugRect.setDepth(2002)
        
        const label = this.scene.add.text(
          x, y,
          'Sound',
          { fontSize: '10px', color: '#FFFF00', backgroundColor: '#000000' }
        )
        label.setScrollFactor(0)
        label.setDepth(2003)
        label.setOrigin(0.5)
        
        console.log(`Sound Toggle: x=${x}, y=${y}`)
      }
    }
    
    if (this.musicToggle) {
      const track = this.musicToggle.list.find((child: any) => child.type === 'Graphics')
      if (track?.input) {
        // Position relative to the container
        const x = this.container.x + this.musicToggle.x + 80
        const y = this.container.y + this.musicToggle.y
        
        const debugRect = this.scene.add.rectangle(
          x, y,
          60, 30,  // Toggle dimensions
          0xFFFF00, 0.3  // Yellow
        )
        debugRect.setStrokeStyle(3, 0xFFFF00, 1)
        debugRect.setScrollFactor(0)
        debugRect.setDepth(2002)
        
        const label = this.scene.add.text(
          x, y,
          'Music',
          { fontSize: '10px', color: '#FFFF00', backgroundColor: '#000000' }
        )
        label.setScrollFactor(0)
        label.setDepth(2003)
        label.setOrigin(0.5)
        
        console.log(`Music Toggle: x=${x}, y=${y}`)
      }
    }
  }
  
  getIsOpen(): boolean {
    return this.isOpen
  }
  
  toggle(): void {
    if (this.isOpen) {
      this.close()
    } else {
      this.open()
    }
  }
}