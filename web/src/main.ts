// Main TypeScript entry point for the game's frontend

import { AudioManager } from './audio/audio-manager';
import { WasmLoader } from './wasm/wasm-loader';
import { UIManager } from './ui/ui-manager';
import { CanvasManager } from './renderer/canvas-manager';

// Logger implementation
class Logger {
  private logContainer: HTMLElement | null = null;

  constructor() {
    // Wait for DOM to load
    window.addEventListener('DOMContentLoaded', () => {
      this.logContainer = document.getElementById('log-container');
    });
  }

  log(message: string): void {
    console.log(message);
    this.appendToLogContainer(message);
  }

  error(message: string): void {
    console.error(message);
    this.appendToLogContainer(`ERROR: ${message}`, 'error');
  }

  warn(message: string): void {
    console.warn(message);
    this.appendToLogContainer(`WARNING: ${message}`, 'warning');
  }

  private appendToLogContainer(message: string, type: 'log' | 'error' | 'warning' = 'log'): void {
    if (!this.logContainer) return;

    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    entry.textContent = message;
    this.logContainer.appendChild(entry);
    
    // Auto-scroll to bottom
    this.logContainer.scrollTop = this.logContainer.scrollHeight;
  }
}

// Main application class
class GameApplication {
  // Components
  public canvas: CanvasManager;
  public audio: AudioManager;
  public ui: UIManager;
  public wasmLoader: WasmLoader;
  public logger: Logger;
  
  // Game state
  private isPaused: boolean = false;
  private lastTimestamp: number = 0;
  private animationFrameId: number | null = null;
  
  constructor() {
    // Initialize logger
    this.logger = new Logger();
    
    // Initialize components
    this.canvas = new CanvasManager('canvas');
    this.audio = new AudioManager(this.logger);
    this.ui = new UIManager(this);
    this.wasmLoader = new WasmLoader(this, this.logger);
    
    // Bind methods
    this.animate = this.animate.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    
    // Add event listeners
    window.addEventListener('keydown', this.handleKeyDown);
  }
  
  // Initialize the application
  async init(): Promise<void> {
    try {
      // Update status
      this.updateStatus('Initializing game...');
      
      // Initialize the canvas
      const { width, height } = this.canvas.initialize();
      
      // Initialize the WASM module
      await this.wasmLoader.initializeGame(width, height);
      
      // Load audio assets
      await this.audio.loadSounds();
      
      // Initialize UI
      this.ui.initialize();
      
      // Update status
      this.updateStatus('Game ready!');
      
      // Add event listeners for UI buttons
      this.setupEventListeners();
    } catch (error) {
      this.logger.error(`Initialization failed: ${error}`);
      this.updateStatus('Failed to initialize game. Check console for details.');
    }
  }
  
  // Start the game
  startGame(): void {
    // Reset the game
    this.wasmLoader.resetGame();
    
    // Start animation loop if not running
    if (this.animationFrameId === null) {
      this.startAnimationLoop();
    }
    
    // Play background music
    this.audio.playBackgroundMusic();
    
    this.isPaused = false;
    this.updateStatus('Game started!');
  }
  
  // Toggle pause state
  togglePause(): void {
    this.isPaused = !this.isPaused;
    
    if (this.isPaused) {
      this.updateStatus('Game paused');
      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    } else {
      this.updateStatus('Game resumed');
      if (this.animationFrameId === null) {
        this.startAnimationLoop();
      }
    }
  }
  
  // Start the animation loop
  private startAnimationLoop(): void {
    this.lastTimestamp = performance.now();
    this.animationFrameId = requestAnimationFrame(this.animate);
  }
  
  // Animation frame handler
  private animate(timestamp: number): void {
    // Calculate delta time in seconds
    const deltaTime = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;
    
    // Skip if delta time is too large (e.g., tab was inactive)
    if (deltaTime > 0.1) {
      this.animationFrameId = requestAnimationFrame(this.animate);
      return;
    }
    
    try {
      // Update game state through WASM
      this.wasmLoader.updateGame(deltaTime);
      
      // Render the frame
      this.canvas.render();
      
      // Continue animation loop
      this.animationFrameId = requestAnimationFrame(this.animate);
    } catch (error) {
      this.logger.error(`Animation error: ${error}`);
      this.updateStatus('Game error occurred. Check console for details.');
      
      // Stop animation loop on error
      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    }
  }
  
  // Handle keyboard events
  private handleKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case ' ':
        // Space bar toggles pause
        this.togglePause();
        break;
      case 'Escape':
        // Esc deselects the current tower
        this.ui.deselectTowers();
        break;
      case '1': case '2': case '3': case '4':
        // Number keys select tower types
        const towerType = parseInt(event.key) - 1;
        this.ui.selectTower(towerType);
        break;
    }
  }
  
  // Set up UI event listeners
  private setupEventListeners(): void {
    // Start button
    const startButton = document.getElementById('start-button');
    if (startButton) {
      startButton.addEventListener('click', () => this.startGame());
    }
    
    // Pause button
    const pauseButton = document.getElementById('pause-button');
    if (pauseButton) {
      pauseButton.addEventListener('click', () => this.togglePause());
    }
    
    // Tower selection buttons
    const towerButtons = document.querySelectorAll('.tower-button');
    towerButtons.forEach((button, index) => {
      button.addEventListener('click', () => this.ui.selectTower(index));
    });
    
    // Canvas click for placing towers
    const canvas = document.getElementById('canvas');
    if (canvas) {
      canvas.addEventListener('click', async (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Check if we can place a tower here
        const canPlace = await this.wasmLoader.canPlaceTower(x, y);
        if (canPlace) {
          await this.wasmLoader.handleClick(x, y);
          this.audio.playSound('place');
        } else {
          this.audio.playSound('error');
        }
      });
    }
    
    // Log toggle
    const logToggle = document.getElementById('log-toggle');
    const logContainer = document.getElementById('log-container');
    if (logToggle && logContainer) {
      logToggle.addEventListener('click', () => {
        logContainer.classList.toggle('expanded');
        const toggleIcon = logToggle.querySelector('.log-toggle-icon');
        if (toggleIcon) {
          toggleIcon.textContent = logContainer.classList.contains('expanded') ? '▲' : '▼';
        }
      });
    }
  }
  
  // Update status message
  private updateStatus(message: string): void {
    const statusElement = document.getElementById('status');
    if (statusElement) {
      statusElement.textContent = message;
    }
    this.logger.log(message);
  }
}

// Initialize and start the application when the DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  const app = new GameApplication();
  app.init().catch(error => {
    console.error('Failed to initialize application:', error);
  });
}); 