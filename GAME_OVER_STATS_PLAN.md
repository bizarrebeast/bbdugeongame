# Enhanced Game Over Screen Stats Plan

## Overview
Redesign the game over screen to display comprehensive gameplay statistics including treasure chests opened and enemy kills by type, with improved visual organization.

## Current Game Over Screen
Currently shows:
- "GAME OVER" title
- Basic score display
- Floor reached
- "TAP TO RESTART" prompt

## Enhanced Statistics to Track

### 1. Treasure Statistics
- **Treasure Chests Opened**: Total count across all levels
- **Treasure Tier Breakdown** (optional):
  - Purple chests opened
  - Teal chests opened  
  - Yellow chests opened

### 2. Enemy Kill Statistics
Track kills for each enemy type (using names from Instructions):
- **Caterpillar**: Count of yellow caterpillars defeated
- **Rollz**: Count of red beetle enemies defeated
- **Chomper**: Count of blue chompers defeated
- **Snail**: Count of red snails defeated
- **Bouncer**: Count of green bouncing enemies defeated
- **Stalker**: Count of red stalkers defeated
- **Blu**: Count of blue blocker enemies defeated

### 3. Existing Statistics (Keep)
- **Total Score**: Final accumulated score
- **Floors Climbed**: Highest floor reached
- **Gems Collected**: Total gems/coins collected
- **Lives Lost**: How many lives were used

## Tracking Implementation

### 1. Add Properties to GameScene
```typescript
// In GameScene class
private gameStats = {
  treasureChestsOpened: 0,
  enemyKills: {
    caterpillar: 0,
    rollz: 0,
    chomper: 0,
    snail: 0,
    bouncer: 0,
    stalker: 0,
    blu: 0
  },
  gemsCollected: 0,
  floorsClimbed: 0,
  livesLost: 0
}
```

### 2. Update Kill Tracking
When enemy is defeated, increment the appropriate counter based on enemy type/color.

### 3. Update Treasure Tracking
When treasure chest is opened, increment the counter.

## Enhanced Game Over Screen Layout

### Design Concept
```
╔════════════════════════════════════════╗
║           GAME OVER                     ║
║         Score: 12,450                   ║
╠════════════════════════════════════════╣
║   📊 PERFORMANCE STATS                 ║
║   ├─ Floors Climbed: 15                ║
║   ├─ Gems Collected: 85                ║
║   └─ Treasure Chests: 12               ║
╠════════════════════════════════════════╣
║   ⚔️ COMBAT STATS                      ║
║   ├─ Caterpillar: 23                   ║
║   ├─ Rollz: 18                         ║
║   ├─ Chomper: 15                       ║
║   ├─ Snail: 12                         ║
║   ├─ Bouncer: 8                        ║
║   ├─ Stalker: 5                        ║
║   └─ Blu: 2                            ║
║   Total Enemies: 83                    ║
╠════════════════════════════════════════╣
║        TAP TO RESTART                  ║
╚════════════════════════════════════════╝
```

### Visual Improvements

#### 1. Section Headers
- Use icons/emojis to separate sections
- Different colors for each section (purple/gold/green theme)

#### 2. Two-Column Layout for Enemy Stats
To save vertical space:
```
ENEMIES DEFEATED
Caterpillar: 23  |  Snail: 12
Rollz: 18        |  Bouncer: 8  
Chomper: 15      |  Stalker: 5
                 |  Blu: 2
```

#### 3. Color Coding
- Section headers: Gold (#FFD700)
- Stats labels: Light purple (#9932CC)
- Numbers: White or bright green (#9ACF07)
- Background: Dark purple (#4A148C) with opacity

#### 4. Sizing Adjustments
- Make popup taller to accommodate stats
- Use smaller font for stat details
- Keep title and restart prompt prominent

## Implementation Steps

### Phase 1: Tracking System
1. Add gameStats object to GameScene
2. Update enemy defeat methods to track kills by type
3. Update treasure chest opening to increment counter
4. Track gems collected and floors climbed

### Phase 2: UI Layout
1. Create sectioned layout with dividers
2. Implement two-column display for enemy stats
3. Add section headers with icons
4. Apply color scheme

### Phase 3: Display Logic
1. Update showGameOverScreen() method
2. Format numbers with commas for readability
3. Calculate and display total enemies defeated
4. Add smooth fade-in animation for stats

### Phase 4: Polish
1. Add subtle animations (stats counting up)
2. Sound effect when stats appear
3. Ensure text fits on mobile screens
4. Test readability with different stat values

## Code Structure

### GameScene Properties
```typescript
private gameStats = {
  treasureChestsOpened: 0,
  enemyKills: new Map<string, number>(),
  // ... other stats
}
```

### Enemy Type Detection
```typescript
private getEnemyType(enemy: any): string {
  if (enemy instanceof Cat) {
    const color = enemy.getColor()
    switch(color) {
      case 'yellow': return 'caterpillar'
      case 'blue': return 'chomper'
      case 'red': return enemy.isStalker ? 'stalker' : 'snail'
      case 'green': return 'bouncer'
    }
  } else if (enemy instanceof Beetle) {
    return 'rollz'
  } else if (enemy instanceof BaseBlu) {
    return 'blu'
  }
  return 'unknown'
}
```

### Display Method
```typescript
private createGameOverStats(): Phaser.GameObjects.Container {
  const container = this.add.container(centerX, centerY)
  
  // Add background panel
  // Add title
  // Add performance stats section
  // Add combat stats section (two columns)
  // Add restart prompt
  
  return container
}
```

## Testing Checklist
- [ ] All enemy types tracked correctly
- [ ] Treasure chest counter increments properly
- [ ] Stats persist through level transitions
- [ ] Layout looks good on mobile (5:9 aspect ratio)
- [ ] Text is readable at all screen sizes
- [ ] Numbers format correctly (with commas)
- [ ] Stats reset properly on game restart
- [ ] No overlap or cutoff issues

## Future Enhancements
1. Add "Best" indicators for personal records
2. Show accuracy percentage (enemies killed vs encountered)
3. Display power-ups collected breakdown
4. Add time played statistic
5. Show combo streak record
6. Integration with leaderboard system

## Questions to Consider
1. Should stats accumulate across multiple games or reset each time?
2. Should we show enemy sprites next to their names?
3. Do we want to track partial chest openings (started but died)?
4. Should we differentiate between jump kills vs power-up kills?
5. Do we want a "Share Stats" button for social features?

## Priority
This is a **Priority 1** feature that enhances player engagement and provides valuable feedback about their gameplay performance.