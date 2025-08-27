import GameSettings from "../config/GameSettings"

export class LoadingScene extends Phaser.Scene {
  private progressBar!: Phaser.GameObjects.Graphics
  private progressBox!: Phaser.GameObjects.Graphics
  private loadText!: Phaser.GameObjects.Text
  private percentText!: Phaser.GameObjects.Text
  private assetText!: Phaser.GameObjects.Text
  
  constructor() {
    super({ key: "LoadingScene" })
  }

  preload() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    // Create progress bar background
    this.progressBox = this.add.graphics()
    this.progressBox.fillStyle(0x222222, 0.8)
    this.progressBox.fillRect(width / 2 - 160, height / 2 - 30, 320, 50)

    // Create progress bar
    this.progressBar = this.add.graphics()

    // Loading text
    this.loadText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: "Loading...",
      style: {
        font: "20px monospace",
        color: "#ffffff"
      }
    })
    this.loadText.setOrigin(0.5, 0.5)

    // Percent text
    this.percentText = this.make.text({
      x: width / 2,
      y: height / 2 - 5,
      text: "0%",
      style: {
        font: "18px monospace",
        color: "#ffffff"
      }
    })
    this.percentText.setOrigin(0.5, 0.5)

    // Asset loading text
    this.assetText = this.make.text({
      x: width / 2,
      y: height / 2 + 50,
      text: "",
      style: {
        font: "16px monospace",
        color: "#ffffff"
      }
    })
    this.assetText.setOrigin(0.5, 0.5)

    // Listen to loading progress
    this.load.on("progress", (value: number) => {
      this.percentText.setText(`${Math.floor(value * 100)}%`)
      this.progressBar.clear()
      this.progressBar.fillStyle(0xffffff, 1)
      this.progressBar.fillRect(width / 2 - 150, height / 2 - 20, 300 * value, 30)
    })

    this.load.on("fileprogress", (file: any) => {
      this.assetText.setText(`Loading: ${file.key}`)
    })

    this.load.on("complete", () => {
      this.progressBar.destroy()
      this.progressBox.destroy()
      this.loadText.destroy()
      this.percentText.destroy()
      this.assetText.destroy()
    })

    // Load all game assets with priority system
    this.loadAssets()
  }

  private loadAssets() {
    // Priority 1: Critical UI and player assets
    this.loadPriority1Assets()
    
    // Priority 2: Essential game objects
    this.loadPriority2Assets()
    
    // Priority 3: Environment and backgrounds
    this.loadPriority3Assets()
    
    // Priority 4: Nice-to-have assets
    this.loadPriority4Assets()
  }

  private loadPriority1Assets() {
    // Player and essential UI
    this.load.image("player", "https://p2yrt7fs2g5b0cht.public.blob.vercel-storage.com/gameAssets/bizarreBeast-QnEGlHOpXszsANT47t84uP6UXXGN8t.png")
    this.load.image("life-icon", "https://p2yrt7fs2g5b0cht.public.blob.vercel-storage.com/gameAssets/life-yQj1dxCZ8ZGCrWhMXYy0aCc3Y4LV9e.png")
    
    // Essential platforms
    this.load.image("floor-wood-1", "https://p2yrt7fs2g5b0cht.public.blob.vercel-storage.com/gameAssets/floor%20wood%201-q3ypHqJWtALdxqJCRjDCRQ4S5x17oa.png")
    this.load.image("floor-wood-2", "https://p2yrt7fs2g5b0cht.public.blob.vercel-storage.com/gameAssets/floor%20wood%202-FZSEqUtQUvJ9dRsBgf7DRhF8l8bbBS.png")
    this.load.image("floor-wood-3", "https://p2yrt7fs2g5b0cht.public.blob.vercel-storage.com/gameAssets/floor%20wood%203-XlMrx5CvpXfvBOHgdAh4Rn4eWVMOXD.png")
    
    // Ladder
    this.load.image("ladder", "https://p2yrt7fs2g5b0cht.public.blob.vercel-storage.com/gameAssets/ladder-QbVoZsHzJYyAGsykkKzO1v6rrvF7Q7.png")
  }

  private loadPriority2Assets() {
    // Enemies
    this.load.image("cat", "https://p2yrt7fs2g5b0cht.public.blob.vercel-storage.com/gameAssets/cat-yoRVdPRBjNH2q4HaQQdj5JoMtRzxAb.png")
    this.load.image("snake", "https://p2yrt7fs2g5b0cht.public.blob.vercel-storage.com/gameAssets/snake-1OQj8gvhJvIWJo5WaE8LPjSklRb0zI.png")
    this.load.image("turtle", "https://p2yrt7fs2g5b0cht.public.blob.vercel-storage.com/gameAssets/turtle-2L5DV0GUIRMPzaKTQrRLb1mhcgUpzQ.png")
    this.load.image("BaseBlu", "https://p2yrt7fs2g5b0cht.public.blob.vercel-storage.com/gameAssets/BaseBlu-rT0e0VGCMRs2lZGnE1JnEL4Ajkqo1P.png")
    this.load.image("bumblebee", "https://p2yrt7fs2g5b0cht.public.blob.vercel-storage.com/gameAssets/bumblebee-VqCnWJe5Mw60OJbiXSsA4xBP4tSaJO.png")
    this.load.image("flying-dragon", "https://p2yrt7fs2g5b0cht.public.blob.vercel-storage.com/gameAssets/flying%20dragon-VOVZ7EXY3Vau2YbmNwCm2zyOxU5BHa.png")
    this.load.image("dragon", "https://p2yrt7fs2g5b0cht.public.blob.vercel-storage.com/gameAssets/dragon-AslRGw3O2D7KZ7wCTOBgNu6wH8jpXf.png")
    
    // Collectibles
    this.load.image("coin", "https://p2yrt7fs2g5b0cht.public.blob.vercel-storage.com/gameAssets/coin-gFCLwyZCMuGcUKlrkHuwi4AQDSHbTU.png")
    this.load.image("diamond", "https://p2yrt7fs2g5b0cht.public.blob.vercel-storage.com/gameAssets/diamond-AiNXqKqxIMJDnHB4qdL2QYsB6Y5ESd.png")
    this.load.image("mystery-box", "https://p2yrt7fs2g5b0cht.public.blob.vercel-storage.com/gameAssets/mystery%20box-tn3vzlRU1KuCbIqzIi0N61iS1AjQWY.png")
    this.load.image("crystal", "https://p2yrt7fs2g5b0cht.public.blob.vercel-storage.com/gameAssets/crystal-qHaKQIdEqhLQ5Z72nQQTdlhWhT8OSc.png")
    this.load.image("extra-life", "https://p2yrt7fs2g5b0cht.public.blob.vercel-storage.com/gameAssets/extraLife-i2vRSoCGAKN0MhvBUhQ3g4hJ3kBQIJ.png")
    
    // Hazards
    this.load.image("spike", "https://p2yrt7fs2g5b0cht.public.blob.vercel-storage.com/gameAssets/spike-w8gJYM5OVazj5z5OWh9jnOV9t48uLk.png")
    this.load.image("ceiling-spike", "https://p2yrt7fs2g5b0cht.public.blob.vercel-storage.com/gameAssets/ceilingSpike-eQBGvhtOXJIu6Z7D83YJULxCnKo5wH.png")
    
    // Treasure chest
    this.load.image("treasure-chest", "https://p2yrt7fs2g5b0cht.public.blob.vercel-storage.com/gameAssets/treasure%20chest-LjBzIvwJCCxqtTBCwZj3a0d8rKK7AX.png")
  }

  private loadPriority3Assets() {
    // Load chapter 1 backgrounds (floors 1-20)
    for (let i = 1; i <= 20; i++) {
      const bgNumber = ((i - 1) % 4) + 1
      this.load.image(`bg-chapter1-${i}`, `https://p2yrt7fs2g5b0cht.public.blob.vercel-storage.com/gameAssets/chapter%201%20background%20${bgNumber}-vQzXvCdoQmJOqzXvCdoQmJOqzXvCd${bgNumber}.png`)
    }
    
    // Additional platform variations
    this.load.image("floor-stone-1", "https://p2yrt7fs2g5b0cht.public.blob.vercel-storage.com/gameAssets/floor%20stone%201-hTLXN3yP8MPfmZKqJHQR7sWv4YBCx9.png")
    this.load.image("floor-stone-2", "https://p2yrt7fs2g5b0cht.public.blob.vercel-storage.com/gameAssets/floor%20stone%202-9qMLzRTPvJWFgbXSKNHYA5CU8mD7Wx.png")
    this.load.image("floor-stone-3", "https://p2yrt7fs2g5b0cht.public.blob.vercel-storage.com/gameAssets/floor%20stone%203-7nKGwQSOuHVEfaZRJMGXB4DT9lC6Vy.png")
    
    this.load.image("floor-metal-1", "https://p2yrt7fs2g5b0cht.public.blob.vercel-storage.com/gameAssets/floor%20metal%201-xPLMN2vQ6JOqaYBDFGHTIsRu5WCl8K.png")
    this.load.image("floor-metal-2", "https://p2yrt7fs2g5b0cht.public.blob.vercel-storage.com/gameAssets/floor%20metal%202-rNHJK1oP4LMfgXASDEBYCqTv6ZIm9U.png")
    this.load.image("floor-metal-3", "https://p2yrt7fs2g5b0cht.public.blob.vercel-storage.com/gameAssets/floor%20metal%203-mKGIF9nO3ILdeSZQCMAWBpRt7YHk8V.png")
  }

  private loadPriority4Assets() {
    // Power-up effects
    this.load.image("invincibility-pendant", "https://p2yrt7fs2g5b0cht.public.blob.vercel-storage.com/gameAssets/invincibility%20pendant-3O5tRqPzJHXgcYKmLBSVU9kN7xDA2F.png")
    this.load.image("power-jump", "https://p2yrt7fs2g5b0cht.public.blob.vercel-storage.com/gameAssets/power%20jump-hNQJ8gPsKMLfbXCYTZRWV7xA5oEq4D.png")
    this.load.image("flash", "https://p2yrt7fs2g5b0cht.public.blob.vercel-storage.com/gameAssets/flash-qR9OxMnHJKLgfVBYCZWSTU8vA3pE6I.png")
    
    // Additional decorative elements
    this.load.image("dark-overlay", "https://p2yrt7fs2g5b0cht.public.blob.vercel-storage.com/gameAssets/darkOverlay-zN4OqTpXJKMhgVBYCaRWS9vU8xL5En.png")
  }

  create() {
    // Transition to the splash scene after loading
    this.scene.start("SplashScene")
  }
}