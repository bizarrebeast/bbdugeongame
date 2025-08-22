/**
 * Enemy Spawning System for Bizarre Underground
 * Handles weighted enemy spawning based on difficulty scoring
 */

export enum EnemyType {
  CATERPILLAR = 'caterpillar', // Yellow - slow random movement
  CHOMPER = 'chomper',         // Blue - standard patrol
  SNAIL = 'snail',            // Red - faster patrol  
  JUMPER = 'jumper',          // Green - bouncing movement
  STALKER = 'stalker'         // Red - mine-like activation + chase
}

export interface EnemyDefinition {
  type: EnemyType
  color: string
  difficultyScore: number
  speed: number
  description: string
}

export interface SpawnWeights {
  [key: string]: number // EnemyType -> weight percentage
}

export class EnemySpawningSystem {
  private static readonly ENEMY_DEFINITIONS: Record<EnemyType, EnemyDefinition> = {
    [EnemyType.CATERPILLAR]: {
      type: EnemyType.CATERPILLAR,
      color: 'yellow',
      difficultyScore: 0.5,
      speed: 0.6,
      description: 'Slow random movement'
    },
    [EnemyType.CHOMPER]: {
      type: EnemyType.CHOMPER,
      color: 'blue', 
      difficultyScore: 1.0,
      speed: 1.0,
      description: 'Standard patrol with bite animations'
    },
    [EnemyType.SNAIL]: {
      type: EnemyType.SNAIL,
      color: 'red',
      difficultyScore: 1.5,
      speed: 1.2,
      description: 'Faster patrol enemy'
    },
    [EnemyType.JUMPER]: {
      type: EnemyType.JUMPER,
      color: 'green',
      difficultyScore: 2.5,
      speed: 1.5,
      description: 'Fast bouncing movement'
    },
    [EnemyType.STALKER]: {
      type: EnemyType.STALKER,
      color: 'red',
      difficultyScore: 4.0,
      speed: 1.5,
      description: 'Hidden activation + chase AI'
    }
  }

  private static readonly LEVEL_SPAWN_WEIGHTS: Record<string, SpawnWeights> = {
    // Levels 1-3: Easy focus
    'early': {
      [EnemyType.CATERPILLAR]: 0.35,  // 35%
      [EnemyType.CHOMPER]: 0.25,      // 25% 
      [EnemyType.SNAIL]: 0.25,        // 25%
      [EnemyType.JUMPER]: 0.10,       // 10%
      [EnemyType.STALKER]: 0.05       // 5%
    },
    // Levels 4-7: Balanced
    'balanced': {
      [EnemyType.CATERPILLAR]: 0.20,  // 20%
      [EnemyType.CHOMPER]: 0.20,      // 20%
      [EnemyType.SNAIL]: 0.25,        // 25%
      [EnemyType.JUMPER]: 0.25,       // 25%
      [EnemyType.STALKER]: 0.10       // 10%
    },
    // Levels 8-12: Challenge ramp
    'challenging': {
      [EnemyType.CATERPILLAR]: 0.15,  // 15%
      [EnemyType.CHOMPER]: 0.15,      // 15%
      [EnemyType.SNAIL]: 0.25,        // 25%
      [EnemyType.JUMPER]: 0.30,       // 30%
      [EnemyType.STALKER]: 0.15       // 15%
    },
    // Levels 13+: Hard focus
    'hard': {
      [EnemyType.CATERPILLAR]: 0.08,  // 8%
      [EnemyType.CHOMPER]: 0.12,      // 12%
      [EnemyType.SNAIL]: 0.25,        // 25%
      [EnemyType.JUMPER]: 0.35,       // 35%
      [EnemyType.STALKER]: 0.20       // 20%
    }
  }

  /**
   * Get difficulty budget for a floor based on level progression
   */
  static getDifficultyBudget(levelNumber: number, floorNumber: number): number {
    // Base difficulty increases with level
    let baseDifficulty: number
    if (levelNumber <= 3) {
      baseDifficulty = 2.0
    } else if (levelNumber <= 7) {
      baseDifficulty = 3.5
    } else if (levelNumber <= 12) {
      baseDifficulty = 5.0
    } else {
      baseDifficulty = 7.0
    }

    // Add progressive difficulty within the level (0.1 per floor)
    const floorBonus = Math.floor(floorNumber / 5) * 0.5 // +0.5 every 5 floors
    
    return baseDifficulty + floorBonus
  }

  /**
   * Get spawn weights based on level
   */
  static getSpawnWeights(levelNumber: number): SpawnWeights {
    if (levelNumber <= 3) {
      return this.LEVEL_SPAWN_WEIGHTS['early']
    } else if (levelNumber <= 7) {
      return this.LEVEL_SPAWN_WEIGHTS['balanced'] 
    } else if (levelNumber <= 12) {
      return this.LEVEL_SPAWN_WEIGHTS['challenging']
    } else {
      return this.LEVEL_SPAWN_WEIGHTS['hard']
    }
  }

  /**
   * Select enemies to spawn based on difficulty budget and weights
   */
  static selectEnemies(difficultyBudget: number, levelNumber: number): EnemyType[] {
    const weights = this.getSpawnWeights(levelNumber)
    const selectedEnemies: EnemyType[] = []
    let remainingBudget = difficultyBudget

    // Convert weights to cumulative array for selection
    const weightedTypes: { type: EnemyType, weight: number, difficulty: number }[] = []
    for (const [typeStr, weight] of Object.entries(weights)) {
      const type = typeStr as EnemyType
      const definition = this.ENEMY_DEFINITIONS[type]
      weightedTypes.push({
        type,
        weight,
        difficulty: definition.difficultyScore
      })
    }

    // Sort by difficulty (easier first) for better budget allocation
    weightedTypes.sort((a, b) => a.difficulty - b.difficulty)

    // Keep selecting enemies while we have budget
    let attempts = 0
    while (remainingBudget >= 0.5 && attempts < 20) { // Minimum 0.5 for caterpillar
      attempts++

      // Randomly select based on weights
      const rand = Math.random()
      let cumulativeWeight = 0
      let selectedType: EnemyType | null = null

      for (const item of weightedTypes) {
        cumulativeWeight += item.weight
        if (rand <= cumulativeWeight) {
          selectedType = item.type
          break
        }
      }

      if (selectedType) {
        const difficulty = this.ENEMY_DEFINITIONS[selectedType].difficultyScore
        if (difficulty <= remainingBudget) {
          selectedEnemies.push(selectedType)
          remainingBudget -= difficulty
        }
      }
    }

    return selectedEnemies
  }

  /**
   * Get enemy definition
   */
  static getEnemyDefinition(type: EnemyType): EnemyDefinition {
    return this.ENEMY_DEFINITIONS[type]
  }

  /**
   * Convert EnemyType to color string for existing Cat constructor
   */
  static getColorForEnemyType(type: EnemyType): string {
    return this.ENEMY_DEFINITIONS[type].color
  }

  /**
   * Check if enemy type is a stalker (needs special spawning)
   */
  static isStalkerType(type: EnemyType): boolean {
    return type === EnemyType.STALKER
  }

  /**
   * Get all available enemy types
   */
  static getAllEnemyTypes(): EnemyType[] {
    return Object.values(EnemyType)
  }

  /**
   * Log spawning statistics for debugging
   */
  static logSpawnInfo(levelNumber: number, floorNumber: number, selectedEnemies: EnemyType[]): void {
    const budget = this.getDifficultyBudget(levelNumber, floorNumber)
    const usedBudget = selectedEnemies.reduce((sum, type) => 
      sum + this.ENEMY_DEFINITIONS[type].difficultyScore, 0
    )
    
    // Enemy spawn info (replaced console.log)
  }
}