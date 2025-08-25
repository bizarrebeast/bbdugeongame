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
  
  // Pause state tracking
  private pausedTimers: Phaser.Time.TimerEvent[] = []
  private pausedTweens: Phaser.Tweens.Tween[] = []
  
  constructor(scene: GameScene) {
    this.scene = scene
    this.loadSettings()
    this.create()
  }
  
  private create(): void {
    // Main container for entire menu
    this.container = this.scene.add.container(
      GameSettings.canvas.width / 2,
      GameSettings.canvas.height / 2
    )
    this.container.setDepth(1500)
    
    // Semi-transparent background overlay
    this.backgroundOverlay = this.scene.add.rectangle(
      0, 0,
      GameSettings.canvas.width,
      GameSettings.canvas.height,
      0x000000, 0.7
    )
    this.backgroundOverlay.setInteractive() // Block game clicks
    
    // Main menu panel
    this.menuPanel = this.createMenuPanel()
    
    // Title
    const title = this.scene.add.text(0, -200, 'GAME MENU', {
      fontSize: '18px',
      fontFamily: '"Press Start 2P", system-ui',
      color: '#FFD700',
      align: 'center'
    })
    title.setOrigin(0.5)
    
    // Instructions button
    const instructionsBtn = this.createButton(
      0, -100, 
      'VIEW INSTRUCTIONS',
      () => this.showInstructions(),
      0x008080
    )
    
    // Divider line
    const divider1 = this.createDivider(-50)
    
    // Sound effects toggle
    this.soundToggle = this.createToggleSwitch(
      'Sound Effects',
      0,
      this.soundEffectsEnabled,
      (enabled) => this.setSoundEffects(enabled)
    )
    
    // Music toggle
    this.musicToggle = this.createToggleSwitch(
      'Music',
      60,
      this.musicEnabled,
      (enabled) => this.setMusic(enabled)
    )
    
    // Divider line
    const divider2 = this.createDivider(120)
    
    // SDK mute indicator (read-only)
    const sdkIndicator = this.createSDKIndicator(160)
    
    // Divider line
    const divider3 = this.createDivider(200)
    
    // Resume button
    const resumeBtn = this.createButton(
      0, 250,
      'RESUME GAME',
      () => this.close(),
      0x32CD32
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
      sdkIndicator,
      divider3,
      resumeBtn
    ])
    
    // Initially hidden
    this.container.setVisible(false)
  }
  
  private createMenuPanel(): Phaser.GameObjects.Graphics {
    const panel = this.scene.add.graphics()
    
    // Draw teal panel with border
    panel.fillStyle(0x008080, 0.95)
    panel.fillRoundedRect(-200, -300, 400, 600, 15)
    
    panel.lineStyle(3, 0x20B2AA)
    panel.strokeRoundedRect(-200, -300, 400, 600, 15)
    
    return panel
  }
  
  private createButton(
    x: number, 
    y: number, 
    text: string, 
    onClick: () => void,
    color: number = 0x008080
  ): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y)
    
    // Button background
    const bg = this.scene.add.graphics()
    bg.fillStyle(color, 0.8)
    bg.fillRoundedRect(-170, -25, 340, 50, 10)
    bg.lineStyle(2, 0x20B2AA)
    bg.strokeRoundedRect(-170, -25, 340, 50, 10)
    
    // Button text
    const btnText = this.scene.add.text(0, 0, text, {
      fontSize: '14px',
      fontFamily: '"Press Start 2P", system-ui',
      color: '#FFFFFF'
    })
    btnText.setOrigin(0.5)
    
    container.add([bg, btnText])
    
    // Make interactive
    bg.setInteractive(new Phaser.Geom.Rectangle(-170, -25, 340, 50), Phaser.Geom.Rectangle.Contains)
    
    bg.on('pointerover', () => {
      bg.clear()
      bg.fillStyle(0x20B2AA, 0.9)
      bg.fillRoundedRect(-170, -25, 340, 50, 10)
      bg.lineStyle(2, 0xFFD700)
      bg.strokeRoundedRect(-170, -25, 340, 50, 10)
    })
    
    bg.on('pointerout', () => {
      bg.clear()
      bg.fillStyle(color, 0.8)
      bg.fillRoundedRect(-170, -25, 340, 50, 10)
      bg.lineStyle(2, 0x20B2AA)
      bg.strokeRoundedRect(-170, -25, 340, 50, 10)
    })
    
    bg.on('pointerdown', onClick)
    
    return container
  }
  
  private createToggleSwitch(
    label: string,
    y: number,
    initialState: boolean,
    onChange: (enabled: boolean) => void
  ): Phaser.GameObjects.Container {
    const container = this.scene.add.container(0, y)
    
    // Label text
    const labelText = this.scene.add.text(-90, 0, label, {
      fontSize: '12px',
      fontFamily: '"Press Start 2P", system-ui',
      color: '#FFFFFF'
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
      track.lineStyle(2, 0x20B2AA)
      track.strokeRoundedRect(trackX - trackWidth/2, -trackHeight/2, trackWidth, trackHeight, 15)
    }
    
    updateTrackColor(initialState)
    
    // Toggle knob
    const knobX = initialState ? trackX + 15 : trackX - 15
    const knob = this.scene.add.circle(knobX, 0, 13, 0xFFFFFF)
    knob.setStrokeStyle(2, 0x20B2AA)
    
    container.add([labelText, track, knob])
    
    // Make interactive
    track.setInteractive(new Phaser.Geom.Rectangle(
      trackX - trackWidth/2, -trackHeight/2, trackWidth, trackHeight
    ), Phaser.Geom.Rectangle.Contains)
    
    let currentState = initialState
    
    track.on('pointerdown', () => {
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
    divider.lineStyle(1, 0x20B2AA, 0.5)
    divider.moveTo(-150, y)
    divider.lineTo(150, y)
    divider.strokePath()
    return divider
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
    if (this.isOpen) return
    
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
    
    // Fade in animation
    this.container.setAlpha(0)
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 200,
      ease: 'Power2'
    })
  }
  
  close(): void {
    if (!this.isOpen) return
    
    // Fade out animation
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        this.container.setVisible(false)
        this.isOpen = false
        
        // Resume game
        this.resumeGame()
      }
    })
  }
  
  private pauseGame(): void {
    // Pause physics
    this.scene.physics.pause()
    
    // Pause all animations
    this.scene.anims.pauseAll()
    
    // Store and pause active timers
    this.pausedTimers = this.scene.time.getAllEvents()
    this.scene.time.paused = true
    
    // Store and pause active tweens (but not menu tweens)
    const allTweens = this.scene.tweens.getAllTweens()
    this.pausedTweens = allTweens.filter(tween => {
      // Don't pause menu-related tweens
      const targets = tween.targets
      return !targets.some((target: any) => 
        target === this.container || this.container.list.includes(target)
      )
    })
    this.pausedTweens.forEach(tween => tween.pause())
    
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
    
    // Resume stored tweens
    this.pausedTweens.forEach(tween => tween.resume())
    this.pausedTweens = []
    
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