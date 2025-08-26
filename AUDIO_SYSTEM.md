# Audio System Implementation

## Overview
Audio implementation using Phaser's built-in sound system. Sound effects are fully implemented with enemy-specific sounds and game state audio cues.

## Current Implementation Status ✅

### Implemented Background Music
1. **Crystal Cavern Theme**
   - Original composition created specifically for this game
   - Continuous looping throughout entire game session
   - Persists across level transitions without restarting
   - Volume control via menu toggle (30% default volume)
   - Settings saved to localStorage

### Implemented Sound Effects
1. **Player Sounds**
   - Jump sounds (3 rotating variations) - `jump-1`, `jump-2`, `jump-3`
   - Spike hit damage - `spike-hit`
   - Death from enemy - `player-dies-enemy`

2. **Collection Sounds**
   - Gem collection - `gem-collect`

3. **Enemy Defeat Sounds** (enemy-specific)
   - Caterpillar (Yellow) - `squish-caterpillar`
   - Beetle (Rollz) - `squish-beetle`
   - Chomper (Blue) - `squish-chomper`
   - Snail (Red) - `squish-snail`
   - Jumper (Green) - `squish-jumper`
   - Stalker (Red) - `squish-stalker`

4. **UI/Game State Sounds**
   - Splash screen - `splash-sound`
   - Game over - `game-over`
   - Menu toggle - `menu-toggle`
   - Door open - `door-open`
   - Treasure chest open - `treasure-chest-open`
   - Power-up collection - Various power-up sounds
   - Continue button - `continue-button`

### Implementation Details
- All sounds loaded via Vercel blob storage URLs
- Volume levels set to 0.4-0.5 for balanced audio
- Jump sounds rotate in sequence (1→2→3→1) for variety
- Enemy squish sounds mapped by enemy type/color detection
- Damage sounds differentiated between spike and enemy sources

## Phaser Sound System Architecture

### Audio Manager Setup
```typescript
// Phaser automatically creates: this.sound (in any Scene)
// Global access: this.game.sound (from anywhere with game reference)

class AudioManager {
  private scene: Phaser.Scene
  private musicTracks: Map<string, Phaser.Sound.BaseSound>
  private soundEffects: Map<string, Phaser.Sound.BaseSound>
  
  // Volume settings (0-1 scale)
  private masterVolume: number = 0.7
  private musicVolume: number = 0.8
  private sfxVolume: number = 1.0
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.setupAudioSystem()
  }
}
```

## 1. Music System

### Chapter-Based Music Tracks
```typescript
const MUSIC_TRACKS = {
  // Menu & UI
  'menu_theme': 'menu_music.mp3',
  'game_over': 'game_over.mp3',
  
  // Chapter Themes (matching backgrounds)
  'crystal_cavern': 'crystal_cavern_theme.mp3',      // Levels 1-10
  'volcanic_crystal': 'volcanic_theme.mp3',          // Levels 11-20
  'steampunk': 'steampunk_theme.mp3',               // Levels 21-30
  'storm': 'storm_theme.mp3',                       // Levels 31-40
  'galactic': 'galactic_theme.mp3',                 // Levels 41-50
  'beast_mode': 'beast_mode_theme.mp3',             // Levels 51+
  
  // Special
  'bonus_level': 'bonus_theme.mp3',
  'boss_battle': 'boss_theme.mp3',
  'invincibility': 'invincibility_theme.mp3'
}
```

### Music Implementation
```typescript
class MusicManager {
  private currentTrack: Phaser.Sound.BaseSound | null = null
  private fadeTime: number = 1000 // 1 second fade
  
  playChapterMusic(chapter: string): void {
    const trackKey = MUSIC_TRACKS[chapter]
    
    if (this.currentTrack) {
      // Fade out current track
      this.scene.tweens.add({
        targets: this.currentTrack,
        volume: 0,
        duration: this.fadeTime,
        onComplete: () => {
          this.currentTrack?.stop()
          this.startNewTrack(trackKey)
        }
      })
    } else {
      this.startNewTrack(trackKey)
    }
  }
  
  private startNewTrack(key: string): void {
    this.currentTrack = this.scene.sound.add(key, {
      loop: true,
      volume: 0
    })
    
    this.currentTrack.play()
    
    // Fade in
    this.scene.tweens.add({
      targets: this.currentTrack,
      volume: this.musicVolume,
      duration: this.fadeTime
    })
  }
}
```

## 2. Sound Effects Categories

### Player Sounds
```typescript
const PLAYER_SOUNDS = {
  // Movement
  'jump': 'player_jump.wav',           // When jumping
  'land': 'player_land.wav',           // Landing from jump
  'footstep_1': 'footstep_1.wav',      // Running (alternate)
  'footstep_2': 'footstep_2.wav',      // Running (alternate)
  'climb': 'ladder_climb.wav',         // Climbing ladders
  
  // Actions
  'throw': 'crystal_throw.wav',        // Throwing crystal ball
  'collect_coin': 'coin_collect.wav',  // Collecting coins
  'collect_gem': 'gem_collect.wav',    // Collecting gems
  'collect_orb': 'orb_collect.wav',    // Special orbs
  
  // Damage/Health
  'hurt': 'player_hurt.wav',           // Taking damage
  'die': 'player_death.wav',           // Death sound
  'respawn': 'player_respawn.wav',     // Respawning
  
  // Power-ups
  'powerup': 'powerup_collect.wav',    // Getting power-up
  'invincible_start': 'invincible.wav', // Invincibility start
  'invincible_end': 'invincible_end.wav' // Invincibility ending
}
```

### Enemy Sounds
```typescript
const ENEMY_SOUNDS = {
  // Common
  'enemy_squish': 'enemy_squish.wav',  // Defeating enemy
  'enemy_bounce': 'bounce_off.wav',    // Bouncing off enemy
  
  // Specific Enemies
  'beetle_roll': 'beetle_rolling.wav',  // Beetle rolling
  'beetle_bite': 'beetle_bite.wav',     // Beetle biting
  'cat_patrol': 'cat_footsteps.wav',    // Cat walking
  'bouncer_jump': 'bouncer_boing.wav',  // Green bouncer
  'stalker_alert': 'stalker_alert.wav', // Stalker activated
  'baseblu_push': 'heavy_push.wav'      // BaseBlu pushing
}
```

### Environment Sounds
```typescript
const ENVIRONMENT_SOUNDS = {
  // Hazards
  'spike_damage': 'spike_hit.wav',      // Hitting spikes
  'lava_bubble': 'lava_bubble.wav',     // Volcanic levels
  'steam_hiss': 'steam_release.wav',    // Steampunk levels
  'thunder': 'thunder_clap.wav',        // Storm levels
  
  // Interactive
  'door_open': 'door_open.wav',         // Level complete
  'platform_creak': 'wood_creak.wav',   // Platform sounds
  'crystal_glow': 'crystal_hum.wav',    // Ambient crystal sound
  
  // UI
  'menu_select': 'menu_select.wav',     // Menu navigation
  'menu_confirm': 'menu_confirm.wav',   // Selection confirm
  'pause': 'pause_game.wav',            // Pausing
  'unpause': 'unpause_game.wav'         // Unpausing
}
```

## 3. Implementation Strategy

### Loading & Optimization
```typescript
class AudioLoader {
  // Use audio sprites for related sounds (reduces HTTP requests)
  loadAudioSprites(): void {
    // Pack related sounds together
    this.scene.load.audioSprite('player_sounds', 
      'player_sounds.json',
      'player_sounds.mp3'
    )
    
    this.scene.load.audioSprite('enemy_sounds',
      'enemy_sounds.json', 
      'enemy_sounds.mp3'
    )
  }
  
  // Load individual tracks for music
  loadMusic(): void {
    // Only load current chapter + menu music initially
    const currentChapter = this.getChapterForLevel(this.currentLevel)
    this.scene.load.audio('menu_theme', 'audio/music/menu.mp3')
    this.scene.load.audio(currentChapter, `audio/music/${currentChapter}.mp3`)
  }
  
  // Preload next chapter's music at level 9, 19, 29, etc.
  preloadNextChapter(level: number): void {
    if (level % 10 === 9) {
      const nextChapter = this.getNextChapter(level)
      this.scene.load.audio(nextChapter, `audio/music/${nextChapter}.mp3`)
      this.scene.load.start() // Start loading
    }
  }
}
```

### Sound Effect Playing
```typescript
class SFXManager {
  private soundPool: Map<string, Phaser.Sound.BaseSound[]> = new Map()
  
  // Play with automatic pooling for frequently used sounds
  playSFX(key: string, config?: Phaser.Types.Sound.SoundConfig): void {
    const sound = this.scene.sound.add(key, {
      volume: (config?.volume || 1) * this.sfxVolume * this.masterVolume,
      rate: config?.rate || 1,
      detune: config?.detune || 0,
      delay: config?.delay || 0
    })
    
    sound.play()
    
    // Auto-cleanup
    sound.once('complete', () => {
      sound.destroy()
    })
  }
  
  // For rapid sounds (footsteps, bullets, etc.)
  playPooledSFX(key: string): void {
    let pool = this.soundPool.get(key)
    
    if (!pool) {
      pool = []
      for (let i = 0; i < 3; i++) {
        pool.push(this.scene.sound.add(key))
      }
      this.soundPool.set(key, pool)
    }
    
    // Find available sound in pool
    const sound = pool.find(s => !s.isPlaying)
    if (sound) {
      sound.play()
    }
  }
}
```

### Spatial Audio (for stereo effect)
```typescript
class SpatialAudio {
  play3DSound(key: string, x: number, y: number): void {
    const player = this.scene.player
    const distance = Phaser.Math.Distance.Between(player.x, player.y, x, y)
    const maxDistance = 500
    
    // Calculate volume based on distance
    const volume = Math.max(0, 1 - (distance / maxDistance))
    
    // Calculate pan based on x position (-1 to 1)
    const pan = Phaser.Math.Clamp((x - player.x) / maxDistance, -1, 1)
    
    this.scene.sound.add(key, {
      volume: volume * this.sfxVolume,
      pan: pan
    }).play()
  }
}
```

## 4. Volume Control System

### Settings Manager
```typescript
class AudioSettings {
  private settings = {
    masterVolume: 0.7,
    musicVolume: 0.8,
    sfxVolume: 1.0,
    muted: false
  }
  
  // Save to localStorage
  saveSettings(): void {
    localStorage.setItem('audioSettings', JSON.stringify(this.settings))
  }
  
  // Load from localStorage
  loadSettings(): void {
    const saved = localStorage.getItem('audioSettings')
    if (saved) {
      this.settings = JSON.parse(saved)
      this.applySettings()
    }
  }
  
  // Apply to Phaser sound system
  applySettings(): void {
    this.scene.sound.volume = this.settings.muted ? 0 : this.settings.masterVolume
  }
  
  // Toggle mute (for mobile/Farcade)
  toggleMute(): void {
    this.settings.muted = !this.settings.muted
    this.scene.sound.mute = this.settings.muted
  }
}
```

## 5. Adaptive Music System

### Dynamic Music Layers
```typescript
class AdaptiveMusic {
  private baseLayers = {
    drums: null as Phaser.Sound.BaseSound | null,
    melody: null as Phaser.Sound.BaseSound | null,
    harmony: null as Phaser.Sound.BaseSound | null,
    intensity: null as Phaser.Sound.BaseSound | null
  }
  
  // Add/remove layers based on gameplay
  adjustIntensity(level: 'low' | 'medium' | 'high' | 'extreme'): void {
    switch(level) {
      case 'low':
        this.setLayerVolume('drums', 0.3)
        this.setLayerVolume('melody', 0.8)
        this.setLayerVolume('harmony', 0)
        this.setLayerVolume('intensity', 0)
        break
      case 'medium':
        this.setLayerVolume('drums', 0.6)
        this.setLayerVolume('melody', 1)
        this.setLayerVolume('harmony', 0.5)
        this.setLayerVolume('intensity', 0)
        break
      case 'high':
        this.setLayerVolume('drums', 1)
        this.setLayerVolume('melody', 1)
        this.setLayerVolume('harmony', 0.8)
        this.setLayerVolume('intensity', 0.3)
        break
      case 'extreme': // Beast mode!
        this.setLayerVolume('drums', 1)
        this.setLayerVolume('melody', 1)
        this.setLayerVolume('harmony', 1)
        this.setLayerVolume('intensity', 1)
        break
    }
  }
}
```

## 6. Mobile Considerations

### Auto-Unlock Audio
```typescript
// Phaser handles this automatically, but we can ensure it:
create(): void {
  // Unlock audio on first user interaction
  this.input.once('pointerdown', () => {
    if (this.sound.context?.state === 'suspended') {
      this.sound.context.resume()
    }
  })
}
```

### Performance Optimization
```typescript
class MobileAudioOptimizer {
  // Reduce concurrent sounds on mobile
  private maxConcurrentSounds = this.sys.game.device.os.desktop ? 10 : 5
  
  // Use lower quality on mobile
  getAudioQuality(): string {
    return this.sys.game.device.os.desktop ? 'high' : 'medium'
  }
  
  // Disable non-essential sounds on low-end devices
  shouldPlayAmbientSounds(): boolean {
    return this.game.loop.actualFps > 30
  }
}
```

## 7. Integration Points

### Player.ts
```typescript
// In update()
if (justJumped) {
  this.scene.audioManager.playSFX('jump')
}

if (justLanded) {
  this.scene.audioManager.playSFX('land', {
    volume: Math.min(1, fallVelocity / 500) // Louder for higher falls
  })
}

// Footsteps while running
if (this.isMoving && onGround) {
  this.footstepTimer += delta
  if (this.footstepTimer > 200) {
    this.scene.audioManager.playPooledSFX(
      this.footstepToggle ? 'footstep_1' : 'footstep_2'
    )
    this.footstepToggle = !this.footstepToggle
    this.footstepTimer = 0
  }
}
```

### GameScene.ts
```typescript
create(): void {
  // Initialize audio manager
  this.audioManager = new AudioManager(this)
  
  // Start chapter music
  const chapter = this.getChapterForLevel(this.currentLevel)
  this.audioManager.playChapterMusic(chapter)
  
  // Set up collision sounds
  this.physics.add.overlap(this.player, this.coins, (player, coin) => {
    this.audioManager.playSFX('collect_coin')
    coin.destroy()
  })
}
```

## 8. Audio File Specifications

### Recommended Formats
- **Music**: MP3 or OGG (for compatibility)
  - Bitrate: 128-192 kbps
  - Length: 1-3 minutes (looping)
  - Size: ~2-4 MB per track

- **Sound Effects**: WAV or OGG
  - Sample Rate: 44.1 kHz
  - Bit Depth: 16-bit
  - Length: < 2 seconds typically
  - Size: < 100 KB per sound

### File Structure
```
/public/audio/
  /music/
    menu.mp3
    crystal_cavern.mp3
    volcanic_crystal.mp3
    steampunk.mp3
    storm.mp3
    galactic.mp3
    beast_mode.mp3
  /sfx/
    /player/
      jump.wav
      land.wav
      footstep_1.wav
      footstep_2.wav
    /enemies/
      squish.wav
      beetle_roll.wav
    /environment/
      spike_hit.wav
      door_open.wav
    /ui/
      menu_select.wav
      pause.wav
  /sprites/
    player_sounds.json
    player_sounds.mp3
```

## 9. Testing Checklist

### Implemented ✅
- ✅ Sound effects play without delay
- ✅ No audio popping or clicking  
- ✅ Mobile audio unlocks properly
- ✅ Performance remains smooth with audio
- ✅ Enemy-specific sounds play correctly
- ✅ Jump sound rotation works
- ✅ Damage sounds differentiate between sources

### Not Yet Implemented
- [x] Music loops seamlessly ✅
- [ ] Music fades between chapters (future feature)
- [x] Volume controls work correctly ✅
- [x] Mute functionality works ✅
- [ ] Spatial audio panning works
- [ ] Audio sprites load correctly
- [ ] Settings persist between sessions

## 10. Future Enhancements

1. **Voice Acting**: Character voices/grunts
2. **Ambient Soundscapes**: Background atmosphere per chapter
3. **Musical Stingers**: Short musical cues for achievements
4. **Reactive Music**: Music that responds to player performance
5. **Sound Modulation**: Real-time effects (reverb in caves, etc.)
6. **Accessibility**: Visual sound indicators for hearing impaired

## Implementation Status

### Completed ✅
1. ✅ Background music - Crystal Cavern theme with looping
2. ✅ Essential player sounds (jump with rotation, damage)
3. ✅ Enemy-specific defeat sounds (all 6 enemy types)
4. ✅ Collection sounds (gems, power-ups)
5. ✅ UI/Game state sounds (splash, game over, menu, doors)
6. ✅ Sound differentiation (spike vs enemy damage)
7. ✅ Volume control system with menu integration
8. ✅ Settings persistence via localStorage

### Remaining Tasks
1. ~~**Background Music System**~~ ✅ COMPLETED
   - ✅ Crystal Cavern theme implemented
   - ✅ Seamless looping
   - ✅ Persists across levels
   - Future: Chapter-based music tracks for different level ranges

2. **Additional Sound Effects**
   - Power-up collection sounds
   - Footsteps and landing sounds
   - Menu navigation sounds
   - Environmental sounds

3. **Audio Control System**
   - Volume controls
   - Mute toggle
   - Settings persistence

4. **Advanced Features**
   - Spatial audio
   - Audio sprites for optimization
   - Adaptive music layers

## Notes

- Phaser's sound system handles most complexity
- Web Audio API is preferred (better performance)
- Always test on actual mobile devices
- Consider audio bandwidth for web deployment
- Keep total audio assets under 20MB if possible