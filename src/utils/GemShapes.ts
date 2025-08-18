/**
 * Gem Shape Generator - Creates varied cut gem shapes for collectibles
 * Replaces bubble-like circles with realistic gem cuts
 */

export enum GemCut {
  ROUND = 'round',
  EMERALD = 'emerald', 
  PEAR = 'pear',
  MARQUISE = 'marquise',
  OVAL = 'oval',
  CUSHION = 'cushion'
}

export interface GemStyle {
  cut: GemCut
  size: number
  color: number
  facetColor?: number
  highlightColor?: number
}

export class GemShapeGenerator {
  
  /**
   * Generate a random gem style for variety
   */
  static getRandomGemStyle(baseColor: number, size: number = 4): GemStyle {
    const cuts = Object.values(GemCut)
    const randomCut = cuts[Math.floor(Math.random() * cuts.length)]
    
    return {
      cut: randomCut,
      size: size + Math.random() * 2 - 1, // Size variation
      color: baseColor,
      facetColor: this.getFacetColor(baseColor),
      highlightColor: 0xffffff
    }
  }
  
  /**
   * Draw a cut gem shape on graphics object
   */
  static drawGem(graphics: Phaser.GameObjects.Graphics, x: number, y: number, style: GemStyle): void {
    switch (style.cut) {
      case GemCut.ROUND:
        this.drawRoundCut(graphics, x, y, style)
        break
      case GemCut.EMERALD:
        this.drawEmeraldCut(graphics, x, y, style)
        break
      case GemCut.PEAR:
        this.drawPearCut(graphics, x, y, style)
        break
      case GemCut.MARQUISE:
        this.drawMarquiseCut(graphics, x, y, style)
        break
      case GemCut.OVAL:
        this.drawOvalCut(graphics, x, y, style)
        break
      case GemCut.CUSHION:
        this.drawCushionCut(graphics, x, y, style)
        break
    }
  }
  
  private static drawRoundCut(graphics: Phaser.GameObjects.Graphics, x: number, y: number, style: GemStyle): void {
    const radius = style.size
    
    // Main gem body
    graphics.fillStyle(style.color, 0.8)
    graphics.fillCircle(x, y, radius)
    
    // Facet lines to make it look cut, not bubble-like
    graphics.lineStyle(0.5, style.facetColor!, 0.6)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const x1 = x + Math.cos(angle) * radius * 0.3
      const y1 = y + Math.sin(angle) * radius * 0.3
      const x2 = x + Math.cos(angle) * radius * 0.9
      const y2 = y + Math.sin(angle) * radius * 0.9
      graphics.lineBetween(x1, y1, x2, y2)
    }
    
    // Highlight
    graphics.fillStyle(style.highlightColor!, 0.7)
    graphics.fillCircle(x - radius * 0.3, y - radius * 0.3, radius * 0.3)
    
    // Outline
    graphics.lineStyle(1, 0xffffff, 0.8)
    graphics.strokeCircle(x, y, radius)
  }
  
  private static drawEmeraldCut(graphics: Phaser.GameObjects.Graphics, x: number, y: number, style: GemStyle): void {
    const size = style.size
    
    // Emerald cut - rectangular with cut corners
    const points = [
      [-size * 0.8, -size],        // Top left
      [size * 0.8, -size],         // Top right
      [size, -size * 0.6],         // Top right cut
      [size, size * 0.6],          // Bottom right cut
      [size * 0.8, size],          // Bottom right
      [-size * 0.8, size],         // Bottom left
      [-size, size * 0.6],         // Bottom left cut
      [-size, -size * 0.6]         // Top left cut
    ]
    
    // Main gem body
    graphics.fillStyle(style.color, 0.8)
    graphics.beginPath()
    graphics.moveTo(x + points[0][0], y + points[0][1])
    for (let i = 1; i < points.length; i++) {
      graphics.lineTo(x + points[i][0], y + points[i][1])
    }
    graphics.closePath()
    graphics.fillPath()
    
    // Step cut facet lines
    graphics.lineStyle(0.5, style.facetColor!, 0.6)
    // Horizontal facet lines
    for (let i = 1; i <= 3; i++) {
      const yLine = -size + (i * size * 2 / 4)
      graphics.lineBetween(x - size * 0.6, y + yLine, x + size * 0.6, y + yLine)
    }
    // Vertical facet lines
    for (let i = 1; i <= 3; i++) {
      const xLine = -size * 0.6 + (i * size * 1.2 / 4)
      graphics.lineBetween(x + xLine, y - size * 0.6, x + xLine, y + size * 0.6)
    }
    
    // Highlight
    graphics.fillStyle(style.highlightColor!, 0.7)
    graphics.fillRect(x - size * 0.4, y - size * 0.4, size * 0.3, size * 0.3)
    
    // Outline
    graphics.lineStyle(1, 0xffffff, 0.8)
    graphics.beginPath()
    graphics.moveTo(x + points[0][0], y + points[0][1])
    for (let i = 1; i < points.length; i++) {
      graphics.lineTo(x + points[i][0], y + points[i][1])
    }
    graphics.closePath()
    graphics.strokePath()
  }
  
  private static drawPearCut(graphics: Phaser.GameObjects.Graphics, x: number, y: number, style: GemStyle): void {
    const size = style.size
    
    // Pear cut - teardrop shape
    graphics.fillStyle(style.color, 0.8)
    graphics.beginPath()
    graphics.moveTo(x, y - size)           // Top point
    graphics.lineTo(x + size * 0.6, y + size * 0.4)    // Right side
    graphics.lineTo(x, y + size * 1.2)                  // Bottom point
    graphics.lineTo(x - size * 0.6, y + size * 0.4)     // Left side
    graphics.lineTo(x, y - size)                        // Back to top
    graphics.closePath()
    graphics.fillPath()
    
    // Facet lines
    graphics.lineStyle(0.5, style.facetColor!, 0.6)
    // Radial lines from center
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2
      const xEnd = x + Math.cos(angle) * size * 0.4
      const yEnd = y + Math.sin(angle) * size * 0.4
      graphics.lineBetween(x, y, xEnd, yEnd)
    }
    
    // Highlight
    graphics.fillStyle(style.highlightColor!, 0.7)
    graphics.fillEllipse(x - size * 0.2, y - size * 0.4, size * 0.3, size * 0.2)
    
    // Outline
    graphics.lineStyle(1, 0xffffff, 0.8)
    graphics.beginPath()
    graphics.moveTo(x, y - size)
    graphics.lineTo(x + size * 0.6, y + size * 0.4)
    graphics.lineTo(x, y + size * 1.2)
    graphics.lineTo(x - size * 0.6, y + size * 0.4)
    graphics.lineTo(x, y - size)
    graphics.strokePath()
  }
  
  private static drawMarquiseCut(graphics: Phaser.GameObjects.Graphics, x: number, y: number, style: GemStyle): void {
    const size = style.size
    
    // Marquise cut - football/eye shape
    graphics.fillStyle(style.color, 0.8)
    graphics.beginPath()
    graphics.moveTo(x - size, y)                    // Left point
    graphics.lineTo(x + size, y)    // Right point
    graphics.lineTo(x - size, y)    // Back to left
    graphics.closePath()
    graphics.fillPath()
    
    // Facet lines
    graphics.lineStyle(0.5, style.facetColor!, 0.6)
    graphics.lineBetween(x - size * 0.6, y, x + size * 0.6, y)  // Center line
    graphics.lineBetween(x, y - size * 0.4, x, y + size * 0.4)  // Cross line
    
    // Diagonal facets
    graphics.lineBetween(x - size * 0.4, y - size * 0.2, x + size * 0.4, y + size * 0.2)
    graphics.lineBetween(x - size * 0.4, y + size * 0.2, x + size * 0.4, y - size * 0.2)
    
    // Highlight
    graphics.fillStyle(style.highlightColor!, 0.7)
    graphics.fillEllipse(x - size * 0.3, y - size * 0.2, size * 0.3, size * 0.2)
    
    // Outline
    graphics.lineStyle(1, 0xffffff, 0.8)
    graphics.beginPath()
    graphics.moveTo(x - size, y)
    graphics.lineTo(x, y - size * 0.6)    // Top point
    graphics.lineTo(x + size, y)          // Right point
    graphics.lineTo(x, y + size * 0.6)    // Bottom point
    graphics.lineTo(x - size, y)          // Back to left
    graphics.strokePath()
  }
  
  private static drawOvalCut(graphics: Phaser.GameObjects.Graphics, x: number, y: number, style: GemStyle): void {
    const size = style.size
    
    // Oval cut
    graphics.fillStyle(style.color, 0.8)
    graphics.fillEllipse(x, y, size * 1.2, size * 0.8)
    
    // Facet lines
    graphics.lineStyle(0.5, style.facetColor!, 0.6)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const x1 = x + Math.cos(angle) * size * 0.3
      const y1 = y + Math.sin(angle) * size * 0.2
      const x2 = x + Math.cos(angle) * size * 0.9
      const y2 = y + Math.sin(angle) * size * 0.6
      graphics.lineBetween(x1, y1, x2, y2)
    }
    
    // Highlight
    graphics.fillStyle(style.highlightColor!, 0.7)
    graphics.fillEllipse(x - size * 0.3, y - size * 0.2, size * 0.3, size * 0.2)
    
    // Outline
    graphics.lineStyle(1, 0xffffff, 0.8)
    graphics.strokeEllipse(x, y, size * 1.2, size * 0.8)
  }
  
  private static drawCushionCut(graphics: Phaser.GameObjects.Graphics, x: number, y: number, style: GemStyle): void {
    const size = style.size
    
    // Cushion cut - rounded square
    const radius = size * 0.3
    graphics.fillStyle(style.color, 0.8)
    graphics.fillRoundedRect(x - size, y - size, size * 2, size * 2, radius)
    
    // Facet lines
    graphics.lineStyle(0.5, style.facetColor!, 0.6)
    // Cross pattern
    graphics.lineBetween(x - size * 0.6, y, x + size * 0.6, y)
    graphics.lineBetween(x, y - size * 0.6, x, y + size * 0.6)
    // Diagonal lines
    graphics.lineBetween(x - size * 0.4, y - size * 0.4, x + size * 0.4, y + size * 0.4)
    graphics.lineBetween(x - size * 0.4, y + size * 0.4, x + size * 0.4, y - size * 0.4)
    
    // Highlight
    graphics.fillStyle(style.highlightColor!, 0.7)
    graphics.fillRoundedRect(x - size * 0.4, y - size * 0.4, size * 0.3, size * 0.3, radius * 0.5)
    
    // Outline
    graphics.lineStyle(1, 0xffffff, 0.8)
    graphics.strokeRoundedRect(x - size, y - size, size * 2, size * 2, radius)
  }
  
  static getFacetColor(baseColor: number): number {
    // Create a slightly lighter version of the base color for facet lines
    const r = (baseColor >> 16) & 0xFF
    const g = (baseColor >> 8) & 0xFF
    const b = baseColor & 0xFF
    
    // Lighten by 40
    const newR = Math.min(255, r + 40)
    const newG = Math.min(255, g + 40)
    const newB = Math.min(255, b + 40)
    
    return (newR << 16) | (newG << 8) | newB
  }
}