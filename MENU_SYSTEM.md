# In-Game Menu System Implementation Plan

## Overview
A comprehensive pause menu overlay styled like the instructions page, with audio toggles and instructions access. The SDK global mute remains as the master control.

## Menu Architecture

### 1. Menu Overlay Component
```typescript
class MenuOverlay {
  private scene: Phaser.Scene
  private container: Phaser.GameObjects.Container
  private backgroundOverlay: Phaser.GameObjects.Rectangle
  private menuPanel: Phaser.GameObjects.Container
  private isOpen: boolean = false
  
  // Audio states (separate from SDK global mute)
  private soundEffectsEnabled: boolean = true
  private musicEnabled: boolean = true
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.create()
    this.hide()
  }
}
```

## 2. Visual Design (Matching Instructions Page)

### Menu Panel Layout
```typescript
const MENU_CONFIG = {
  // Main panel - teal background like instructions
  panel: {
    width: 400,
    height: 500,
    backgroundColor: 0x008080,
    backgroundAlpha: 0.95,
    borderColor: 0x20B2AA,
    borderWidth: 3,
    cornerRadius: 15
  },
  
  // Title section
  title: {
    text: 'GAME MENU',
    fontSize: '18px',
    color: '#FFD700', // Gold
    y: 40
  },
  
  // Button styling
  buttons: {
    width: 340,
    height: 60,
    backgroundColor: 0x008080,
    hoverColor: 0x20B2AA,
    borderColor: 0x20B2AA,
    textColor: '#FFFFFF'
  },
  
  // Toggle switches
  toggles: {
    onColor: 0x32CD32,  // Green
    offColor: 0xFF6B6B, // Red
    trackWidth: 60,
    trackHeight: 30,
    knobSize: 26
  }
}
```

### Menu Structure
```
┌─────────────────────────┐
│      GAME MENU          │ (Gold title)
├─────────────────────────┤
│                         │
│ [VIEW INSTRUCTIONS]     │ (Teal button)
│                         │
│ ─────────────────────   │ (Divider)
│                         │
│ Sound Effects    [ON]   │ (Toggle switch)
│                         │
│ Music            [ON]   │ (Toggle switch)
│                         │
│ ─────────────────────   │
│                         │
│ SDK Mute: [Status]      │ (Info only)
│                         │
│ ─────────────────────   │
│                         │
│ [RESUME GAME]           │ (Green button)
│                         │
└─────────────────────────┘
```

## 3. Menu Activation System

### Keyboard/Button Triggers
```typescript
class MenuActivation {
  private menuKey: Phaser.Input.Keyboard.Key
  private menuButton: Phaser.GameObjects.Container // On-screen button
  
  setupControls(): void {
    // ESC key for keyboard
    this.menuKey = this.scene.input.keyboard.addKey('ESC')
    
    // Menu button (hamburger icon) in corner
    this.createMenuButton()
    
    // Check for menu activation
    this.menuKey.on('down', () => this.toggleMenu())
    this.menuButton.on('pointerdown', () => this.toggleMenu())
  }
  
  private createMenuButton(): void {
    const btnX = GameSettings.canvas.width - 40
    const btnY = 40
    
    // Hamburger menu icon
    const graphics = this.scene.add.graphics()
    graphics.lineStyle(3, 0xFFFFFF)
    graphics.moveTo(-15, -8)
    graphics.lineTo(15, -8)
    graphics.moveTo(-15, 0)
    graphics.lineTo(15, 0)
    graphics.moveTo(-15, 8)
    graphics.lineTo(15, 8)
    
    this.menuButton = this.scene.add.container(btnX, btnY, [graphics])
    this.menuButton.setInteractive(new Phaser.Geom.Circle(0, 0, 25))
    this.menuButton.setDepth(1000)
  }
}
```

## 4. Pause/Resume Logic

### Game Pause System
```typescript
class PauseManager {
  private pausedSystems = {
    physics: false,
    animations: false,
    timers: [] as Phaser.Time.TimerEvent[],
    tweens: [] as Phaser.Tweens.Tween[]
  }
  
  pauseGame(): void {
    // Pause physics
    this.scene.physics.pause()
    this.pausedSystems.physics = true
    
    // Pause all animations
    this.scene.anims.pauseAll()
    this.pausedSystems.animations = true
    
    // Store and pause timers
    this.pausedSystems.timers = this.scene.time.getAllEvents()
    this.scene.time.paused = true
    
    // Store and pause tweens
    this.pausedSystems.tweens = this.scene.tweens.getAllTweens()
    this.scene.tweens.pauseAll()
    
    // Set pause flag
    this.scene.registry.set('isPaused', true)
  }
  
  resumeGame(): void {
    // Resume physics
    this.scene.physics.resume()
    
    // Resume animations
    this.scene.anims.resumeAll()
    
    // Resume timers
    this.scene.time.paused = false
    
    // Resume tweens
    this.scene.tweens.resumeAll()
    
    // Clear pause flag
    this.scene.registry.set('isPaused', false)
  }
}
```

## 5. Instructions Overlay

### Instructions Display
```typescript
class InstructionsOverlay {
  private container: Phaser.GameObjects.Container
  private scrollablePanel: Phaser.GameObjects.Container
  private closeButton: Phaser.GameObjects.Container
  
  show(): void {
    // Create semi-transparent background
    const bg = this.scene.add.rectangle(
      GameSettings.canvas.width / 2,
      GameSettings.canvas.height / 2,
      GameSettings.canvas.width,
      GameSettings.canvas.height,
      0x000000, 0.8
    )
    
    // Create scrollable panel (reuse InstructionsScene layout)
    this.createInstructionsPanel()
    
    // Add close button
    this.createCloseButton()
    
    this.container.setVisible(true)
    this.container.setDepth(2000) // Above menu
  }
  
  private createCloseButton(): void {
    const btnX = this.panel.width - 40
    const btnY = 40
    
    // X close button
    const graphics = this.scene.add.graphics()
    graphics.lineStyle(3, 0xFFFFFF)
    graphics.moveTo(-10, -10)
    graphics.lineTo(10, 10)
    graphics.moveTo(10, -10)
    graphics.lineTo(-10, 10)
    
    this.closeButton = this.scene.add.container(btnX, btnY, [graphics])
    this.closeButton.setInteractive(new Phaser.Geom.Circle(0, 0, 20))
    this.closeButton.on('pointerdown', () => this.hide())
  }
}
```

## 6. Audio Toggle System

### Sound/Music Controls
```typescript
class AudioToggles {
  // Local game settings (separate from SDK mute)
  private settings = {
    soundEffectsEnabled: true,
    musicEnabled: true,
    masterVolume: 0.7
  }
  
  createSoundToggle(): Phaser.GameObjects.Container {
    const toggle = this.createToggleSwitch(
      'Sound Effects',
      this.settings.soundEffectsEnabled,
      (enabled) => {
        this.settings.soundEffectsEnabled = enabled
        this.updateSoundVolume()
        this.saveSettings()
      }
    )
    return toggle
  }
  
  createMusicToggle(): Phaser.GameObjects.Container {
    const toggle = this.createToggleSwitch(
      'Music',
      this.settings.musicEnabled,
      (enabled) => {
        this.settings.musicEnabled = enabled
        this.updateMusicVolume()
        this.saveSettings()
      }
    )
    return toggle
  }
  
  private updateSoundVolume(): void {
    // Apply volume only if SDK is not muted
    const sdkMuted = this.scene.game.sound.mute // Set by SDK
    if (!sdkMuted && this.settings.soundEffectsEnabled) {
      // Set SFX volume
      this.scene.game.registry.set('sfxVolume', this.settings.masterVolume)
    } else {
      this.scene.game.registry.set('sfxVolume', 0)
    }
  }
  
  private updateMusicVolume(): void {
    // Apply volume only if SDK is not muted
    const sdkMuted = this.scene.game.sound.mute
    if (!sdkMuted && this.settings.musicEnabled) {
      // Set music volume
      this.scene.game.registry.set('musicVolume', this.settings.masterVolume)
      // Update current music if playing
      if (this.scene.currentMusic) {
        this.scene.currentMusic.setVolume(this.settings.masterVolume)
      }
    } else {
      if (this.scene.currentMusic) {
        this.scene.currentMusic.setVolume(0)
      }
    }
  }
  
  // Load/save to localStorage
  private saveSettings(): void {
    localStorage.setItem('audioSettings', JSON.stringify(this.settings))
  }
  
  private loadSettings(): void {
    const saved = localStorage.getItem('audioSettings')
    if (saved) {
      this.settings = JSON.parse(saved)
    }
  }
}
```

### Toggle Switch Component
```typescript
private createToggleSwitch(
  label: string, 
  initialState: boolean,
  onChange: (enabled: boolean) => void
): Phaser.GameObjects.Container {
  const container = this.scene.add.container(0, 0)
  
  // Label text
  const labelText = this.scene.add.text(-100, 0, label, {
    fontSize: '14px',
    fontFamily: '"Press Start 2P"',
    color: '#FFFFFF'
  })
  labelText.setOrigin(0, 0.5)
  
  // Toggle track
  const track = this.scene.add.rectangle(
    80, 0, 
    MENU_CONFIG.toggles.trackWidth,
    MENU_CONFIG.toggles.trackHeight,
    initialState ? MENU_CONFIG.toggles.onColor : MENU_CONFIG.toggles.offColor,
    1
  )
  track.setStrokeStyle(2, 0x20B2AA)
  
  // Toggle knob
  const knobX = initialState ? 100 : 60
  const knob = this.scene.add.circle(
    knobX, 0,
    MENU_CONFIG.toggles.knobSize / 2,
    0xFFFFFF
  )
  knob.setStrokeStyle(2, 0x20B2AA)
  
  container.add([labelText, track, knob])
  
  // Make interactive
  track.setInteractive()
  track.on('pointerdown', () => {
    const newState = !initialState
    initialState = newState
    
    // Animate knob
    this.scene.tweens.add({
      targets: knob,
      x: newState ? 100 : 60,
      duration: 200,
      ease: 'Power2'
    })
    
    // Change color
    track.setFillStyle(
      newState ? MENU_CONFIG.toggles.onColor : MENU_CONFIG.toggles.offColor
    )
    
    // Callback
    onChange(newState)
  })
  
  return container
}
```

## 7. SDK Integration

### Global Mute Display
```typescript
class SDKMuteIndicator {
  private indicator: Phaser.GameObjects.Container
  
  create(): void {
    // Show SDK mute status (read-only)
    const sdkMuted = this.scene.game.sound.mute
    
    const text = this.scene.add.text(0, 0, 
      `SDK Global Mute: ${sdkMuted ? 'ON' : 'OFF'}`,
      {
        fontSize: '12px',
        fontFamily: '"Press Start 2P"',
        color: sdkMuted ? '#FF6B6B' : '#AAAAAA'
      }
    )
    
    // Info icon
    const info = this.scene.add.text(150, 0, '(?)', {
      fontSize: '10px',
      color: '#AAAAAA'
    })
    info.setInteractive()
    info.on('pointerover', () => {
      this.showTooltip('Controlled by Farcade platform')
    })
    
    this.indicator = this.scene.add.container(0, 0, [text, info])
  }
  
  update(): void {
    // Update display when SDK mute changes
    const sdkMuted = this.scene.game.sound.mute
    const text = this.indicator.list[0] as Phaser.GameObjects.Text
    text.setText(`SDK Global Mute: ${sdkMuted ? 'ON' : 'OFF'}`)
    text.setColor(sdkMuted ? '#FF6B6B' : '#AAAAAA')
  }
}
```

## 8. Complete Menu Implementation

### MenuOverlay Class
```typescript
export class MenuOverlay {
  private scene: GameScene
  private container: Phaser.GameObjects.Container
  private pauseManager: PauseManager
  private audioToggles: AudioToggles
  private instructionsOverlay: InstructionsOverlay
  private isOpen: boolean = false
  
  constructor(scene: GameScene) {
    this.scene = scene
    this.pauseManager = new PauseManager(scene)
    this.audioToggles = new AudioToggles(scene)
    this.create()
  }
  
  private create(): void {
    this.container = this.scene.add.container(
      GameSettings.canvas.width / 2,
      GameSettings.canvas.height / 2
    )
    this.container.setDepth(1500)
    
    // Semi-transparent background
    const bg = this.scene.add.rectangle(0, 0,
      GameSettings.canvas.width,
      GameSettings.canvas.height,
      0x000000, 0.7
    )
    bg.setInteractive() // Block clicks
    
    // Main panel
    const panel = this.createPanel()
    
    // Title
    const title = this.scene.add.text(0, -200, 'GAME MENU', {
      fontSize: '18px',
      fontFamily: '"Press Start 2P"',
      color: '#FFD700'
    })
    title.setOrigin(0.5)
    
    // Instructions button
    const instructionsBtn = this.createButton(
      0, -100, 'VIEW INSTRUCTIONS',
      () => this.showInstructions()
    )
    
    // Sound toggle
    const soundToggle = this.audioToggles.createSoundToggle()
    soundToggle.setPosition(0, 0)
    
    // Music toggle  
    const musicToggle = this.audioToggles.createMusicToggle()
    musicToggle.setPosition(0, 60)
    
    // SDK mute indicator
    const sdkIndicator = new SDKMuteIndicator(this.scene)
    sdkIndicator.create()
    sdkIndicator.indicator.setPosition(0, 140)
    
    // Resume button
    const resumeBtn = this.createButton(
      0, 220, 'RESUME GAME',
      () => this.close(),
      0x32CD32 // Green
    )
    
    this.container.add([
      bg, panel, title,
      instructionsBtn,
      soundToggle, musicToggle,
      sdkIndicator.indicator,
      resumeBtn
    ])
    
    this.container.setVisible(false)
  }
  
  open(): void {
    if (this.isOpen) return
    
    this.isOpen = true
    this.container.setVisible(true)
    
    // Pause game
    this.pauseManager.pauseGame()
    
    // Fade in
    this.container.setAlpha(0)
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 200
    })
  }
  
  close(): void {
    if (!this.isOpen) return
    
    // Fade out
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.container.setVisible(false)
        this.isOpen = false
        
        // Resume game
        this.pauseManager.resumeGame()
      }
    })
  }
}
```

## 9. Integration with GameScene

### GameScene.ts Updates
```typescript
export class GameScene extends Phaser.Scene {
  private menuOverlay: MenuOverlay
  
  create(): void {
    // ... existing create code ...
    
    // Create menu overlay
    this.menuOverlay = new MenuOverlay(this)
    
    // Set up menu activation
    const escKey = this.input.keyboard.addKey('ESC')
    escKey.on('down', () => {
      if (this.menuOverlay.isOpen) {
        this.menuOverlay.close()
      } else {
        this.menuOverlay.open()
      }
    })
    
    // Create menu button
    this.createMenuButton()
  }
  
  private createMenuButton(): void {
    // Hamburger menu in top-right
    const btn = this.add.container(
      GameSettings.canvas.width - 40,
      40
    )
    
    // Background circle
    const bg = this.add.circle(0, 0, 25, 0x008080, 0.8)
    bg.setStrokeStyle(2, 0x20B2AA)
    
    // Hamburger lines
    const graphics = this.add.graphics()
    graphics.lineStyle(2, 0xFFFFFF)
    for (let i = -1; i <= 1; i++) {
      graphics.moveTo(-12, i * 8)
      graphics.lineTo(12, i * 8)
    }
    
    btn.add([bg, graphics])
    btn.setInteractive(new Phaser.Geom.Circle(0, 0, 25))
    btn.setDepth(100)
    
    btn.on('pointerdown', () => {
      this.menuOverlay.open()
    })
    
    // Hover effect
    btn.on('pointerover', () => {
      bg.setFillStyle(0x20B2AA, 0.9)
    })
    btn.on('pointerout', () => {
      bg.setFillStyle(0x008080, 0.8)
    })
  }
}
```

## 10. Mobile Considerations

### Touch Controls
```typescript
// Ensure menu button is large enough for touch
const TOUCH_MIN_SIZE = 44 // iOS minimum

// Position away from game controls
const MENU_BUTTON_POSITION = {
  x: GameSettings.canvas.width - 50,
  y: 50 // Below score display
}

// Swipe down gesture to open menu (optional)
this.input.on('swipedown', () => {
  if (!this.menuOverlay.isOpen) {
    this.menuOverlay.open()
  }
})
```

## 11. Testing Checklist

- [ ] Menu opens/closes with ESC key
- [ ] Menu button works on click/touch
- [ ] Game properly pauses when menu opens
- [ ] Game properly resumes when menu closes
- [ ] Instructions overlay displays correctly
- [ ] Instructions can be closed
- [ ] Sound effects toggle works
- [ ] Music toggle works
- [ ] Settings persist between sessions
- [ ] SDK mute indicator shows correct state
- [ ] Audio respects both local and SDK settings
- [ ] Menu renders above game elements
- [ ] No input passes through to game when menu is open
- [ ] Animations are smooth
- [ ] Mobile touch targets are adequate size

## Implementation Priority

### Phase 1: Basic Menu
1. Create menu overlay container
2. Add pause/resume logic
3. Create menu button and ESC key trigger
4. Style panel with teal theme

### Phase 2: Audio Controls
1. Add sound effects toggle
2. Add music toggle
3. Integrate with localStorage
4. Show SDK mute status

### Phase 3: Instructions
1. Create instructions overlay
2. Add close button
3. Make scrollable if needed

### Phase 4: Polish
1. Add animations and transitions
2. Fine-tune styling
3. Test on mobile devices
4. Add tooltips and help text