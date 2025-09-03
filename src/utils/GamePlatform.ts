/**
 * Platform Abstraction Layer
 * Allows game to run on both Remix and dgen1 platforms
 */

export interface GamePlatform {
  ready(): void;
  gameOver(score: number): void;
  haptic(type: string): void;
  mute(): void;
  unmute(): void;
  saveScore(score: number): Promise<void>;
  getHighScore(): Promise<number>;
  saveGameState?(state: any): Promise<void>;
  loadGameState?(): Promise<any>;
  connectWallet?(): Promise<string | null>;  // Optional - only for dgen1
  disconnectWallet?(): Promise<void>;  // Optional - only for dgen1
  showWalletAccount?(): Promise<void>;  // Optional - only for dgen1
  showWalletButton?(): void;  // Optional - show wallet button after splash
  hideWalletButton?(): void;  // Optional - hide wallet button during splash
}

/**
 * Remix/Farcade Platform Implementation
 */
export class RemixPlatform implements GamePlatform {
  ready() {
    // Use Farcade SDK if available
    if (typeof window !== 'undefined' && (window as any).Farcade) {
      (window as any).Farcade.gameReady();
    }
  }

  gameOver(score: number) {
    if (typeof window !== 'undefined' && (window as any).Farcade) {
      (window as any).Farcade.gameOver(score);
    }
  }

  haptic(type: string) {
    if (typeof window !== 'undefined' && (window as any).Farcade) {
      (window as any).Farcade.haptic(type);
    }
  }

  mute() {
    if (typeof window !== 'undefined' && (window as any).Farcade) {
      (window as any).Farcade.mute();
    }
  }

  unmute() {
    if (typeof window !== 'undefined' && (window as any).Farcade) {
      (window as any).Farcade.unmute();
    }
  }

  async saveScore(score: number) {
    // Remix handles this through gameOver
    this.gameOver(score);
  }

  async getHighScore() {
    // Remix doesn't provide high score API
    return 0;
  }
  
  // Wallet methods not available on Remix platform
  async connectWallet(): Promise<string | null> {
    console.log('Wallet connection not available on Remix platform');
    return null;
  }
}

/**
 * dgen1 Platform Implementation
 */
export class Dgen1Platform implements GamePlatform {
  private web3Manager: any = null;
  private walletAddress: string | null = null;
  private walletConnected: boolean = false;

  constructor() {
    // Initialize Web3Manager when platform is created
    this.initializeWeb3();
  }

  private async initializeWeb3() {
    try {
      // Dynamically import to avoid build issues
      const { getWeb3Manager } = await import('./Web3Utils');
      
      // Reown project ID
      const PROJECT_ID = 'eeb2e2fdeb3d0163fd4f3a84733c3fcf';
      
      this.web3Manager = getWeb3Manager(PROJECT_ID);
      await this.web3Manager.initialize();
      
      // Check if already connected
      if (this.web3Manager.isConnected()) {
        this.walletAddress = this.web3Manager.getAddress();
        this.walletConnected = true;
        console.log('✅ Wallet already connected:', this.walletAddress);
      }
      
      // Hide wallet button initially (will show after splash)
      this.hideWalletButton();
    } catch (error) {
      console.log('Web3 initialization optional - game continues normally');
    }
  }

  ready() {
    console.log('🎮 Game ready on dgen1 platform');
    
    // Load saved settings
    const audioMuted = localStorage.getItem('bz_audioMuted') === 'true';
    if (audioMuted && (window as any).game) {
      (window as any).game.sound.mute = true;
    }
  }

  gameOver(score: number) {
    console.log(`🎯 Game Over - Score: ${score}`);
    
    // Save to localStorage
    this.saveToLocalStorage(score);
    
    // Optional: Save to blockchain if wallet connected
    if (this.walletConnected) {
      console.log(`💰 Would save score ${score} for wallet ${this.walletAddress}`);
    }
  }

  haptic(type: string) {
    if ('vibrate' in navigator) {
      const duration = type === 'heavy' ? 100 : 50;
      navigator.vibrate(duration);
    }
  }

  mute() {
    if ((window as any).game) {
      (window as any).game.sound.mute = true;
    }
    localStorage.setItem('bz_audioMuted', 'true');
  }

  unmute() {
    if ((window as any).game) {
      (window as any).game.sound.mute = false;
    }
    localStorage.setItem('bz_audioMuted', 'false');
  }

  async saveScore(score: number) {
    // Save to localStorage
    const scores = JSON.parse(localStorage.getItem('bz_scores') || '[]');
    scores.push({
      score,
      date: Date.now(),
      wallet: this.walletAddress || 'anonymous'
    });
    
    // Keep top 10 scores
    scores.sort((a: any, b: any) => b.score - a.score);
    scores.splice(10);
    
    localStorage.setItem('bz_scores', JSON.stringify(scores));
    localStorage.setItem('bz_highScore', scores[0]?.score.toString() || '0');
  }

  async getHighScore() {
    const highScore = localStorage.getItem('bz_highScore');
    return highScore ? parseInt(highScore) : 0;
  }

  async saveGameState(state: any) {
    const saveData = {
      ...state,
      timestamp: Date.now()
    };
    localStorage.setItem('bz_saveState', JSON.stringify(saveData));
  }

  async loadGameState() {
    const saved = localStorage.getItem('bz_saveState');
    if (!saved) return null;
    
    const state = JSON.parse(saved);
    
    // Check if save is less than 24 hours old
    if (Date.now() - state.timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem('bz_saveState');
      return null;
    }
    
    return state;
  }

  private saveToLocalStorage(score: number) {
    this.saveScore(score);
    
    // Update statistics
    const stats = JSON.parse(localStorage.getItem('bz_stats') || '{}');
    stats.gamesPlayed = (stats.gamesPlayed || 0) + 1;
    stats.totalScore = (stats.totalScore || 0) + score;
    stats.bestScore = Math.max(stats.bestScore || 0, score);
    stats.lastPlayed = Date.now();
    localStorage.setItem('bz_stats', JSON.stringify(stats));
  }

  /**
   * Connect wallet using Reown AppKit
   */
  async connectWallet(): Promise<string | null> {
    if (!this.web3Manager) {
      await this.initializeWeb3();
    }
    
    if (this.web3Manager) {
      const address = await this.web3Manager.connect();
      if (address) {
        this.walletAddress = address;
        this.walletConnected = true;
        return address;
      }
    }
    
    return null;
  }

  /**
   * Disconnect wallet
   */
  async disconnectWallet(): Promise<void> {
    if (this.web3Manager) {
      await this.web3Manager.disconnect();
      this.walletAddress = null;
      this.walletConnected = false;
    }
  }

  /**
   * Show/hide wallet button
   */
  showWalletButton(): void {
    if (this.web3Manager && this.web3Manager.showWalletButton) {
      this.web3Manager.showWalletButton();
    }
  }
  
  hideWalletButton(): void {
    if (this.web3Manager && this.web3Manager.hideWalletButton) {
      this.web3Manager.hideWalletButton();
    }
  }
  
  /**
   * Show wallet account modal
   */
  async showWalletAccount(): Promise<void> {
    if (this.web3Manager && this.walletConnected) {
      await this.web3Manager.showAccount();
    }
  }
}

/**
 * Platform Detection Helper
 */
export function detectPlatform(): GamePlatform {
  // Check for dgen1 indicators
  const isDgen1 = 
    window.location.hostname.includes('dgen1') ||
    window.location.search.includes('dgen1=true') ||
    window.location.port === '3001' ||  // Check for dgen1 dev port
    ((window as any).game && (window as any).game.registry?.get('isDgen1')) ||  // Check game registry
    (window.innerWidth === 720 && window.innerHeight === 720);
  
  if (isDgen1) {
    console.log('🎮 Detected dgen1 platform (port:', window.location.port, ', registry:', (window as any).game?.registry?.get('isDgen1'), ')');
    return new Dgen1Platform();
  } else {
    console.log('🎮 Using Remix/Farcade platform (port:', window.location.port, ')');
    return new RemixPlatform();
  }
}
