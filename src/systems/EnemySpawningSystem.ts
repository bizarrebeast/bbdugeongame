/**
 * Enemy Spawning System for Bizarre Underground
 * Handles weighted enemy spawning based on difficulty scoring
 */

export enum EnemyType {
  BASEBLU = 'baseblu',         // Blue blocker - very slow, immovable obstacle
  BEETLE = 'beetle',           // Red beetle - simple patrol
  CATERPILLAR = 'caterpillar', // Yellow cat - slow random movement
  CHOMPER = 'chomper',         // Blue cat - standard patrol
  SNAIL = 'snail',            // Red cat - faster patrol  
  JUMPER = 'jumper',          // Green cat - bouncing movement
  STALKER = 'stalker'         // Red cat - mine-like activation + chase
}

export interface EnemyDefinition {
  type: EnemyType
  color: string
  difficultyScore: number
  speed: number
  pointValue: number  // Points awarded for defeating this enemy
  description: string
}

export interface SpawnWeights {
  [key: string]: number // EnemyType -> weight percentage
}

export class EnemySpawningSystem {
  private static readonly ENEMY_DEFINITIONS: Record<EnemyType, EnemyDefinition> = {
    [EnemyType.BASEBLU]: {
      type: EnemyType.BASEBLU,
      color: 'blue',
      difficultyScore: 2.0,
      speed: 0.25,
      pointValue: 1000,  // High value when killed by invincible player
      description: 'Immovable blocker, can only be killed when invincible'
    },
    [EnemyType.BEETLE]: {
      type: EnemyType.BEETLE,
      color: 'red',
      difficultyScore: 0.8,
      speed: 1.0,
      pointValue: 75,
      description: 'Simple patrol beetle'
    },
    [EnemyType.CATERPILLAR]: {
      type: EnemyType.CATERPILLAR,
      color: 'yellow',
      difficultyScore: 0.5,
      speed: 0.6,
      pointValue: 50,
      description: 'Slow random movement'
    },
    [EnemyType.CHOMPER]: {
      type: EnemyType.CHOMPER,
      color: 'blue', 
      difficultyScore: 1.0,
      speed: 1.0,
      pointValue: 100,
      description: 'Standard patrol with bite animations'
    },
    [EnemyType.SNAIL]: {
      type: EnemyType.SNAIL,
      color: 'red',
      difficultyScore: 1.5,
      speed: 1.2,
      pointValue: 150,
      description: 'Faster patrol enemy'
    },
    [EnemyType.JUMPER]: {
      type: EnemyType.JUMPER,
      color: 'green',
      difficultyScore: 2.5,
      speed: 1.5,
      pointValue: 200,
      description: 'Fast bouncing movement'
    },
    [EnemyType.STALKER]: {
      type: EnemyType.STALKER,
      color: 'red',
      difficultyScore: 4.0,
      speed: 1.5,
      pointValue: 300,
      description: 'Hidden activation + chase AI'
    }
  }

  private static readonly LEVEL_SPAWN_WEIGHTS: Record<string, SpawnWeights> = {
    // Levels 1-10: Tutorial Tier
    'tutorial': {
      [EnemyType.CATERPILLAR]: 0.70,  // 70% - Yellow Cat
      [EnemyType.BEETLE]: 0.30,       // 30% - Beetle
      [EnemyType.BASEBLU]: 0.00,
      [EnemyType.CHOMPER]: 0.00,
      [EnemyType.SNAIL]: 0.00,
      [EnemyType.JUMPER]: 0.00,
      [EnemyType.STALKER]: 0.00
    },
    // Levels 11-20: Basic Challenge
    'basic': {
      [EnemyType.CHOMPER]: 0.50,      // 50% - Blue Cat
      [EnemyType.CATERPILLAR]: 0.30,  // 30% - Yellow Cat
      [EnemyType.BEETLE]: 0.20,       // 20% - Beetle
      [EnemyType.BASEBLU]: 0.00,
      [EnemyType.SNAIL]: 0.00,
      [EnemyType.JUMPER]: 0.00,
      [EnemyType.STALKER]: 0.00
    },
    // Levels 21-30: Speed Increase
    'speed': {
      [EnemyType.SNAIL]: 0.50,        // 50% - Red Cat
      [EnemyType.CHOMPER]: 0.35,      // 35% - Blue Cat
      [EnemyType.BASEBLU]: 0.15,      // 15% - BaseBlu (max 1 per floor)
      [EnemyType.CATERPILLAR]: 0.00,
      [EnemyType.BEETLE]: 0.00,
      [EnemyType.JUMPER]: 0.00,
      [EnemyType.STALKER]: 0.00
    },
    // Levels 31-40: Advanced Mechanics
    'advanced': {
      [EnemyType.JUMPER]: 0.40,       // 40% - Green Cat
      [EnemyType.SNAIL]: 0.35,        // 35% - Red Cat
      [EnemyType.STALKER]: 0.125,     // 12.5% - Red Cat Stalker
      [EnemyType.BASEBLU]: 0.125,     // 12.5% - BaseBlu
      [EnemyType.CATERPILLAR]: 0.00,
      [EnemyType.BEETLE]: 0.00,
      [EnemyType.CHOMPER]: 0.00
    },
    // Levels 41-50: Expert Challenge
    'expert': {
      [EnemyType.STALKER]: 0.35,      // 35% - Red Cat Stalker
      [EnemyType.JUMPER]: 0.30,       // 30% - Green Cat
      [EnemyType.BASEBLU]: 0.25,      // 25% - BaseBlu (max 2 per floor)
      // 10% mixed earlier enemies
      [EnemyType.CATERPILLAR]: 0.025, // 2.5%
      [EnemyType.BEETLE]: 0.025,      // 2.5%
      [EnemyType.CHOMPER]: 0.025,     // 2.5%
      [EnemyType.SNAIL]: 0.025        // 2.5%
    },
    // Levels 51+: BEAST MODE - Chaos Variety
    'beast': {
      [EnemyType.STALKER]: 0.20,      // 20% - Balanced mix
      [EnemyType.JUMPER]: 0.20,       // 20%
      [EnemyType.BASEBLU]: 0.15,      // 15%
      [EnemyType.SNAIL]: 0.15,        // 15%
      [EnemyType.CHOMPER]: 0.15,      // 15%
      [EnemyType.CATERPILLAR]: 0.10,  // 10%
      [EnemyType.BEETLE]: 0.05        // 5%
    }
  }

  /**
   * Get max enemies per floor based on level tier
   * Reduced difficulty scaling for better gameplay balance
   */
  static getMaxEnemiesPerFloor(levelNumber: number): number {
    if (levelNumber <= 10) return 2      // 1-2 per floor
    else if (levelNumber <= 20) return 2 // 1-2 per floor (was 3)
    else if (levelNumber <= 30) return 3 // 2-3 per floor (was 4)
    else if (levelNumber <= 40) return 3 // 2-3 per floor (was 5)
    else if (levelNumber <= 50) return 4 // 3-4 per floor (was 5)
    else return 4                        // 3-4 per floor for BEAST MODE (was 5)
  }

  /**
   * Get speed scaling multiplier based on level
   */
  static getSpeedMultiplier(levelNumber: number): number {
    if (levelNumber <= 10) {
      // 1.0x → 1.05x
      const progress = (levelNumber - 1) / 9
      return 1.0 + (progress * 0.05)
    } else if (levelNumber <= 20) {
      // 1.05x → 1.10x
      const progress = (levelNumber - 10) / 10
      return 1.05 + (progress * 0.05)
    } else if (levelNumber <= 30) {
      // 1.10x → 1.15x
      const progress = (levelNumber - 20) / 10
      return 1.10 + (progress * 0.05)
    } else if (levelNumber <= 40) {
      // 1.15x → 1.20x
      const progress = (levelNumber - 30) / 10
      return 1.15 + (progress * 0.05)
    } else if (levelNumber <= 50) {
      // 1.20x → 1.25x
      const progress = (levelNumber - 40) / 10
      return 1.20 + (progress * 0.05)
    } else {
      // BEAST MODE: capped at 1.25x
      return 1.25
    }
  }

  /**
   * Get BaseBlu max per floor based on level
   */
  static getBaseBluMaxPerFloor(levelNumber: number): number {
    if (levelNumber <= 20) return 0      // No BaseBlu
    else if (levelNumber <= 30) return 1 // Max 1 per floor
    else if (levelNumber <= 40) return 2 // No specific limit stated, using 2
    else return 2                        // Max 2 per floor (41+)
  }

  /**
   * Get spawn weights based on level
   */
  static getSpawnWeights(levelNumber: number): SpawnWeights {
    if (levelNumber <= 10) {
      return this.LEVEL_SPAWN_WEIGHTS['tutorial']
    } else if (levelNumber <= 20) {
      return this.LEVEL_SPAWN_WEIGHTS['basic']
    } else if (levelNumber <= 30) {
      return this.LEVEL_SPAWN_WEIGHTS['speed']
    } else if (levelNumber <= 40) {
      return this.LEVEL_SPAWN_WEIGHTS['advanced']
    } else if (levelNumber <= 50) {
      return this.LEVEL_SPAWN_WEIGHTS['expert']
    } else {
      return this.LEVEL_SPAWN_WEIGHTS['beast']
    }
  }

  /**
   * Select enemies to spawn for a floor
   */
  static selectEnemiesForFloor(levelNumber: number, floorNumber: number): EnemyType[] {
    const weights = this.getSpawnWeights(levelNumber)
    const maxEnemies = this.getMaxEnemiesPerFloor(levelNumber)
    const baseBluMaxPerFloor = this.getBaseBluMaxPerFloor(levelNumber)
    
    const selectedEnemies: EnemyType[] = []
    let baseBluCount = 0
    
    // Special case for level 1: Start extra gentle with just 1 enemy guaranteed
    let actualEnemyCount: number
    if (levelNumber === 1) {
      // Level 1: Always just 1 enemy per floor for a gentle introduction
      actualEnemyCount = 1
    } else {
      // Randomly determine actual enemy count (e.g., 2 max becomes 1-2 random)
      const minEnemies = Math.max(1, maxEnemies - 1)
      actualEnemyCount = Math.floor(Math.random() * 2) + minEnemies
    }
    
    // Keep selecting enemies up to the count
    for (let i = 0; i < actualEnemyCount; i++) {
      // Build weighted selection array, excluding enemies at 0% spawn rate
      const availableTypes: { type: EnemyType, weight: number }[] = []
      let totalWeight = 0
      
      for (const [typeStr, weight] of Object.entries(weights)) {
        if (weight > 0) {
          const type = typeStr as EnemyType
          
          // Check BaseBlu spawn limit
          if (type === EnemyType.BASEBLU && baseBluCount >= baseBluMaxPerFloor) {
            continue // Skip BaseBlu if we've hit the limit
          }
          
          // Skip Chomper (blue enemy) on floor 9 due to animation issues
          if (type === EnemyType.CHOMPER && floorNumber === 9) {
            continue // Skip chompers on floor 9
          }
          
          availableTypes.push({ type, weight })
          totalWeight += weight
        }
      }
      
      if (availableTypes.length === 0) break
      
      // Select enemy based on weights
      const rand = Math.random() * totalWeight
      let cumulativeWeight = 0
      let selectedType: EnemyType | null = null
      
      for (const item of availableTypes) {
        cumulativeWeight += item.weight
        if (rand <= cumulativeWeight) {
          selectedType = item.type
          break
        }
      }
      
      if (selectedType) {
        selectedEnemies.push(selectedType)
        if (selectedType === EnemyType.BASEBLU) {
          baseBluCount++
        }
      }
    }
    
    return selectedEnemies
  }

  /**
   * @deprecated Use selectEnemiesForFloor instead
   */
  static selectEnemies(difficultyBudget: number, levelNumber: number): EnemyType[] {
    return this.selectEnemiesForFloor(levelNumber, 0)
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
   * Check if enemy type is BaseBlu (needs special spawning)
   */
  static isBaseBluType(type: EnemyType): boolean {
    return type === EnemyType.BASEBLU
  }

  /**
   * Check if enemy type is Beetle (needs special spawning)
   */
  static isBeetleType(type: EnemyType): boolean {
    return type === EnemyType.BEETLE
  }

  /**
   * Get point value for defeating an enemy type
   */
  static getPointValue(type: EnemyType): number {
    return this.ENEMY_DEFINITIONS[type].pointValue
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