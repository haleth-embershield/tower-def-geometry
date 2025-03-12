// UI manager for handling user interface elements and interactions

interface GameApp {
  canvas: any;
  wasmLoader: any;
  audio: any;
  logger: {
    log(message: string): void;
    error(message: string): void;
    warn(message: string): void;
  };
}

export class UIManager {
  private gameApp: GameApp;
  private selectedTowerType: number = 0;
  private towerButtons: NodeListOf<HTMLElement> | null = null;
  private money: number = 100;
  private score: number = 0;
  private wave: number = 0;

  constructor(gameApp: GameApp) {
    this.gameApp = gameApp;
  }

  /**
   * Initialize the UI elements
   */
  initialize(): void {
    // Get tower buttons
    this.towerButtons = document.querySelectorAll('.tower-button');
    
    // Set up event listeners for tower buttons
    this.towerButtons.forEach((button, index) => {
      button.addEventListener('click', () => this.selectTower(index));
    });
    
    // Initialize UI displays
    this.updateMoneyDisplay();
    this.updateScoreDisplay();
    this.updateWaveDisplay();
    
    this.gameApp.logger.log('UI initialized');
  }

  /**
   * Select a tower type
   */
  selectTower(towerType: number): void {
    // Deselect previous tower
    if (this.towerButtons) {
      this.towerButtons.forEach(button => {
        button.classList.remove('active');
      });
    }
    
    // Select new tower if valid
    if (towerType > 0 && towerType <= 4) {
      this.selectedTowerType = towerType;
      
      // Update UI
      if (this.towerButtons && this.towerButtons[towerType - 1]) {
        this.towerButtons[towerType - 1].classList.add('active');
      }
      
      // Update canvas manager
      this.gameApp.canvas.setSelectedTowerType(towerType);
      
      // Update WASM module
      this.gameApp.wasmLoader.selectTowerType(towerType - 1);
      
      // Play selection sound
      this.gameApp.audio.playSound('select');
    } else {
      this.deselectTowers();
    }
  }

  /**
   * Deselect all towers
   */
  deselectTowers(): void {
    this.selectedTowerType = 0;
    
    // Update UI
    if (this.towerButtons) {
      this.towerButtons.forEach(button => {
        button.classList.remove('active');
      });
    }
    
    // Update canvas manager
    this.gameApp.canvas.setSelectedTowerType(0);
    
    // Update WASM module
    this.gameApp.wasmLoader.selectTowerType(-1);
  }

  /**
   * Update the money display
   */
  updateMoneyDisplay(newMoney?: number): void {
    if (newMoney !== undefined) {
      this.money = newMoney;
    }
    
    const moneyElement = document.getElementById('money');
    if (moneyElement) {
      moneyElement.textContent = `$${this.money}`;
    }
  }

  /**
   * Update the score display
   */
  updateScoreDisplay(newScore?: number): void {
    if (newScore !== undefined) {
      this.score = newScore;
    }
    
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
      scoreElement.textContent = `Score: ${this.score}`;
    }
  }

  /**
   * Update the wave display
   */
  updateWaveDisplay(newWave?: number): void {
    if (newWave !== undefined) {
      this.wave = newWave;
    }
    
    const waveElement = document.getElementById('wave');
    if (waveElement) {
      waveElement.textContent = `Wave: ${this.wave}`;
    }
  }

  /**
   * Show a message to the player
   */
  showMessage(message: string, duration: number = 3000): void {
    const messageElement = document.getElementById('message');
    if (!messageElement) return;
    
    messageElement.textContent = message;
    messageElement.classList.add('visible');
    
    setTimeout(() => {
      messageElement.classList.remove('visible');
    }, duration);
  }

  /**
   * Show the game over screen
   */
  showGameOver(finalScore: number, victory: boolean = false): void {
    const gameOverElement = document.getElementById('game-over');
    const gameOverTitleElement = document.getElementById('game-over-title');
    const gameOverScoreElement = document.getElementById('game-over-score');
    
    if (!gameOverElement || !gameOverTitleElement || !gameOverScoreElement) return;
    
    // Set title and score
    gameOverTitleElement.textContent = victory ? 'Victory!' : 'Game Over';
    gameOverScoreElement.textContent = `Final Score: ${finalScore}`;
    
    // Show the game over screen
    gameOverElement.classList.add('visible');
    
    // Play appropriate sound
    this.gameApp.audio.playSound(victory ? 'victory' : 'defeat');
  }

  /**
   * Get the currently selected tower type
   */
  getSelectedTowerType(): number {
    return this.selectedTowerType;
  }
} 