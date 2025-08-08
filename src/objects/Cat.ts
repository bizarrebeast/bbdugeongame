import GameSettings from "../config/GameSettings"

export enum CatColor {
  BLUE = 'blue',
  YELLOW = 'yellow',
  GREEN = 'green'
}

export class Cat extends Phaser.Physics.Arcade.Sprite {
  private baseSpeed: number = 80
  private moveSpeed: number
  private direction: number = 1
  public platformBounds: { left: number; right: number }
  private catColor: CatColor
  private bounceTimer: number = 0
  private randomMoveTimer: number = 0
  private isSquished: boolean = false
  
  constructor(
    scene: Phaser.Scene, 
    x: number, 
    y: number, 
    platformLeft: number, 
    platformRight: number,
    color?: CatColor
  ) {
    const colors = [CatColor.BLUE, CatColor.YELLOW, CatColor.GREEN]
    const catColor = color || colors[Math.floor(Math.random() * colors.length)]
    
    const colorMap = {
      [CatColor.BLUE]: 0x4169e1,
      [CatColor.YELLOW]: 0xffd700,
      [CatColor.GREEN]: 0x32cd32
    }
    
    const graphics = scene.add.graphics()
    graphics.fillStyle(colorMap[catColor], 1)
    graphics.fillCircle(10, 8, 8)
    graphics.fillStyle(0x000000, 1)
    graphics.fillCircle(6, 6, 2)
    graphics.fillCircle(14, 6, 2)
    graphics.fillStyle(colorMap[catColor], 1)
    graphics.fillTriangle(4, 2, 8, 0, 8, 4)
    graphics.fillTriangle(12, 0, 16, 2, 12, 4)
    graphics.generateTexture(`cat-${catColor}`, 20, 16)
    graphics.destroy()
    
    super(scene, x, y, `cat-${catColor}`)
    
    this.catColor = catColor
    
    scene.add.existing(this)
    scene.physics.add.existing(this)
    
    this.setCollideWorldBounds(true)
    this.setBounce(0)
    this.setSize(18, 14)
    this.setOffset(1, 1)
    this.setDepth(15)
    
    this.platformBounds = {
      left: platformLeft,
      right: platformRight
    }
    
    this.setupBehavior()
    
    this.setVelocityX(this.moveSpeed * this.direction)
  }
  
  private setupBehavior(): void {
    switch (this.catColor) {
      case CatColor.BLUE:
        this.moveSpeed = this.baseSpeed
        break
      case CatColor.YELLOW:
        this.moveSpeed = this.baseSpeed * 0.6
        break
      case CatColor.GREEN:
        this.moveSpeed = this.baseSpeed * 1.5
        break
    }
  }
  
  update(time: number, delta: number): void {
    if (this.isSquished) return
    
    switch (this.catColor) {
      case CatColor.BLUE:
        this.updateBluePatrol()
        break
      case CatColor.YELLOW:
        this.updateYellowPatrol(delta)
        break
      case CatColor.GREEN:
        this.updateGreenBounce(delta)
        break
    }
  }
  
  private updateBluePatrol(): void {
    if (this.x <= this.platformBounds.left + 10) {
      this.direction = 1
    } else if (this.x >= this.platformBounds.right - 10) {
      this.direction = -1
    }
    
    this.setVelocityX(this.moveSpeed * this.direction)
  }
  
  private updateYellowPatrol(delta: number): void {
    this.randomMoveTimer -= delta
    
    if (this.randomMoveTimer <= 0) {
      if (Math.random() < 0.3) {
        this.direction = Math.random() < 0.5 ? -1 : 1
      }
      this.randomMoveTimer = 500 + Math.random() * 1000
    }
    
    if (this.x <= this.platformBounds.left + 10) {
      this.direction = 1
    } else if (this.x >= this.platformBounds.right - 10) {
      this.direction = -1
    }
    
    this.setVelocityX(this.moveSpeed * this.direction)
  }
  
  private updateGreenBounce(delta: number): void {
    this.bounceTimer -= delta
    
    if (this.bounceTimer <= 0 && this.body?.touching.down) {
      this.setVelocityY(-200)
      this.bounceTimer = 800 + Math.random() * 400
    }
    
    // Green cats travel the full width of their platform section
    if (this.x <= this.platformBounds.left + 5) {
      this.direction = 1
    } else if (this.x >= this.platformBounds.right - 5) {
      this.direction = -1
    }
    
    this.setVelocityX(this.moveSpeed * this.direction)
  }
  
  reverseDirection(): void {
    if (this.isSquished) return
    this.direction *= -1
    this.setVelocityX(this.moveSpeed * this.direction)
  }
  
  getDirection(): number {
    return this.direction
  }
  
  squish(): void {
    if (this.isSquished) return
    
    this.isSquished = true
    this.setVelocity(0, 0)
    
    this.scene.tweens.add({
      targets: this,
      scaleY: 0.2,
      scaleX: 1.5,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        this.destroy()
      }
    })
  }
  
  getCatColor(): CatColor {
    return this.catColor
  }
}