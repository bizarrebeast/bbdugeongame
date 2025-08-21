/**
 * Level Manager for Bizarre Underground
 * Handles discrete level progression with endless mode after level 100
 */

import { EnemySpawningSystem, EnemyType } from './EnemySpawningSystem'

export interface LevelConfig {
  levelNumber: number
  floorCount: number
  enemyTypes: string[]
  collectibleTypes: string[]
  worldWidth: number // in tiles
  isEndless: boolean
  // New properties for difficulty-based spawning
  difficultyBudgetPerFloor: number
  enemySpawnWeights: { [key: string]: number }
}

export class LevelManager {
  private currentLevel: number = 1
  private readonly ENDLESS_LEVEL = 101
  constructor() {
    // Always start from Level 1 - we'll track furthest level reached separately
    this.currentLevel = 1
  }
  
  /**
   * Get configuration for a specific level
   */
  getLevelConfig(levelNumber: number): LevelConfig {
    const isEndless = levelNumber >= this.ENDLESS_LEVEL
    const weights = EnemySpawningSystem.getSpawnWeights(levelNumber)
    
    return {
      levelNumber,
      floorCount: this.calculateFloorCount(levelNumber),
      enemyTypes: this.getEnemyTypes(levelNumber), // Keep for backward compatibility
      collectibleTypes: this.getCollectibleTypes(levelNumber),
      worldWidth: this.getWorldWidth(levelNumber),
      isEndless,
      // New difficulty-based properties
      difficultyBudgetPerFloor: EnemySpawningSystem.getDifficultyBudget(levelNumber, 1), // Base budget
      enemySpawnWeights: weights
    }
  }
  
  /**
   * Calculate number of floors for a level
   * Levels 1-5: 10 floors
   * Levels 6-10: 15 floors
   * Levels 11-15: 20 floors
   * Pattern: Add 5 floors every 5 levels
   */
  private calculateFloorCount(levelNumber: number): number {
    if (levelNumber >= this.ENDLESS_LEVEL) {
      return -1 // Infinite floors for endless mode
    }
    
    const bracket = Math.floor((levelNumber - 1) / 5) // Which 5-level bracket
    return 10 + (bracket * 5)
  }
  
  /**
   * Determine which enemy types are available at this level
   * Now returns all enemy types since we use weighted spawning instead of restrictions
   * Kept for backward compatibility with existing spawning code
   */
  private getEnemyTypes(levelNumber: number): string[] {
    // With the new weighted spawning system, all enemy types are available
    // but with different spawn probabilities based on level
    return ['blue', 'yellow', 'green', 'red']
  }

  /**
   * Get enemy types to spawn for a specific floor using the new difficulty system
   */
  getEnemyTypesForFloor(levelNumber: number, floorNumber: number): EnemyType[] {
    const budget = EnemySpawningSystem.getDifficultyBudget(levelNumber, floorNumber)
    const selectedEnemies = EnemySpawningSystem.selectEnemies(budget, levelNumber)
    
    // Log for debugging
    EnemySpawningSystem.logSpawnInfo(levelNumber, floorNumber, selectedEnemies)
    
    return selectedEnemies
  }
  
  /**
   * Determine which collectibles are available at this level
   * Level 1: All collectibles (for testing)
   * Level 2: Regular coins only
   * Level 3-4: Regular coins + Blue coins
   * Level 5-6: Regular coins + Blue coins + Diamonds
   * Level 7+: All collectibles (+ Treasure chests)
   */
  private getCollectibleTypes(levelNumber: number): string[] {
    if (levelNumber === 1) {
      return ['coin', 'blueCoin', 'diamond', 'treasureChest', 'freeLife', 'invincibilityPendant'] // All items for level 1 + testing items
    } else if (levelNumber <= 2) {
      return ['coin']
    } else if (levelNumber <= 3) {
      return ['coin', 'blueCoin']
    } else if (levelNumber <= 6) {
      return ['coin', 'blueCoin', 'diamond', 'freeLife', 'invincibilityPendant']
    } else {
      return ['coin', 'blueCoin', 'diamond', 'freeLife', 'invincibilityPendant', 'treasureChest']
    }
  }
  
  /**
   * Determine world width for this level
   * Levels 1-24: 24 tiles wide
   * Levels 25-49: 32 tiles wide
   * Levels 50+: 40 tiles wide
   */
  private getWorldWidth(levelNumber: number): number {
    if (levelNumber < 25) {
      return 24
    } else if (levelNumber < 50) {
      return 32
    } else {
      return 40
    }
  }
  
  /**
   * Check if player has completed the current level
   */
  isLevelComplete(currentFloor: number): boolean {
    const config = this.getLevelConfig(this.currentLevel)
    
    // Endless mode never completes
    if (config.isEndless) {
      return false
    }
    
    // Regular levels complete when reaching the top floor
    return currentFloor >= config.floorCount
  }
  
  /**
   * Advance to the next level
   */
  nextLevel(): number {
    this.currentLevel++
    this.saveProgress()
    return this.currentLevel
  }
  
  /**
   * Reset to level 1 (on death)
   */
  resetToStart(): void {
    this.currentLevel = 1
    // Don't save this - we want to preserve their furthest progress
  }
  
  /**
   * Get the current level number
   */
  getCurrentLevel(): number {
    return this.currentLevel
  }
  
  /**
   * Set the current level (for testing or level select)
   */
  setCurrentLevel(level: number): void {
    this.currentLevel = level
    this.saveProgress()
  }
  
  /**
   * Save progress to local storage
   */
  private saveProgress(): void {
    try {
      // Only track furthest level reached, don't save current level
      // (we always want to restart from Level 1)
      const furthestLevel = parseInt(localStorage.getItem('bizarreUnderground_furthestLevel') || '1')
      if (this.currentLevel > furthestLevel) {
        localStorage.setItem('bizarreUnderground_furthestLevel', this.currentLevel.toString())
      }
    } catch (e) {
      console.warn('Could not save progress to localStorage:', e)
    }
  }
  
  /**
   * Load progress from local storage
   * Note: We don't restore current level anymore - always start from Level 1
   */
  private loadProgress(): void {
    // No longer needed - we always start from Level 1
    // Only track furthest level reached for statistics
  }
  
  /**
   * Get furthest level ever reached
   */
  getFurthestLevel(): number {
    try {
      return parseInt(localStorage.getItem('bizarreUnderground_furthestLevel') || '1')
    } catch (e) {
      return 1
    }
  }
  
  /**
   * Get spawn rates for enemies based on level
   */
  getEnemySpawnRates(levelNumber: number): { [key: string]: number } {
    const baseRates = {
      blue: 1.0,
      yellow: 0.6,
      green: 0.4,
      red: 0.2
    }
    
    // Increase spawn rates as levels progress
    const difficultyMultiplier = 1 + (Math.min(levelNumber, 100) * 0.01) // Max 2x at level 100
    
    const rates: { [key: string]: number } = {}
    const availableEnemies = this.getEnemyTypes(levelNumber)
    
    availableEnemies.forEach(enemy => {
      rates[enemy] = baseRates[enemy] * difficultyMultiplier
    })
    
    return rates
  }
}

export default LevelManager