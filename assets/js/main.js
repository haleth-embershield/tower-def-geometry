// main.js - Main entry point for the game's JavaScript code

import { AudioManager } from './audio.js';
import { WasmLoader } from './wasm-loader.js';
import { UIManager } from './ui/ui-manager.js';
import { CanvasManager } from './renderer/canvas.js';

// Main application class
class GameApplication {
    constructor() {
        // Initialize components
        this.canvas = new CanvasManager('canvas');
        this.audio = new AudioManager();
        this.ui = new UIManager(this);
        this.wasmLoader = new WasmLoader(this);
        
        // Game state
        this.isPaused = false;
        this.lastTimestamp = 0;
        this.animationFrameId = null;
        
        // Bind methods
        this.animate = this.animate.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        
        // Add event listeners
        window.addEventListener('keydown', this.handleKeyDown);
    }
    
    // Initialize the application
    async init() {
        try {
            // First initialize UI
            this.ui.initializeUI();
            
            // Update status
            document.getElementById('status').textContent = "Loading audio and WASM...";
            
            // Then load audio files
            await this.audio.preloadAudio();
            
            // Finally load WASM module
            await this.wasmLoader.loadWasm('towerd.wasm');
            
            // Update status
            document.getElementById('status').textContent = "Game ready";
        } catch (error) {
            console.error("Initialization error:", error);
            document.getElementById('status').textContent = `Error: ${error.message}`;
        }
    }
    
    // Start the game
    startGame() {
        if (!this.wasmLoader.zigModule) return;
        
        // Reset game state if needed
        if (typeof this.wasmLoader.zigModule.resetGame === 'function') {
            this.wasmLoader.zigModule.resetGame();
        }
        
        this.isPaused = false;
        document.getElementById('status').textContent = "Game started";
        
        // Start animation loop if not already running
        if (!this.animationFrameId) {
            this.startAnimationLoop();
        }
    }
    
    // Toggle pause state
    togglePause() {
        if (!this.wasmLoader.zigModule) return;
        
        this.isPaused = !this.isPaused;
        document.getElementById('status').textContent = this.isPaused ? "Game paused" : "Game resumed";
        
        if (!this.isPaused && !this.animationFrameId) {
            this.startAnimationLoop();
        }
    }
    
    // Start animation loop
    startAnimationLoop() {
        this.animationFrameId = requestAnimationFrame(this.animate);
    }
    
    // Animation loop
    animate(timestamp) {
        // If paused, don't request next frame
        if (this.isPaused) {
            this.animationFrameId = null;
            return;
        }
        
        // Calculate delta time in seconds
        if (!this.lastTimestamp) this.lastTimestamp = timestamp;
        const deltaTime = (timestamp - this.lastTimestamp) / 1000;
        this.lastTimestamp = timestamp;
        
        // Call WASM update function
        this.wasmLoader.zigModule.update(deltaTime);
        
        // Draw tower preview if hovering
        if (this.canvas.currentHoverX >= 0 && this.canvas.currentHoverY >= 0) {
            const canPlace = this.wasmLoader.zigModule.canPlaceTower(
                this.canvas.currentHoverX, 
                this.canvas.currentHoverY
            );
            
            const range = this.wasmLoader.zigModule.getTowerRange();
            
            this.canvas.drawTowerPreview(
                this.canvas.currentHoverX,
                this.canvas.currentHoverY,
                canPlace,
                range
            );
        }
        
        // Request next frame
        this.animationFrameId = requestAnimationFrame(this.animate);
    }
    
    // Handle keyboard events
    handleKeyDown(event) {
        if (!this.wasmLoader.zigModule) return;
        
        switch(event.key) {
            case '1': 
                this.ui.selectTower(1);
                break;
            case '2': 
                this.ui.selectTower(2);
                break;
            case '3': 
                this.ui.selectTower(3);
                break;
            case '4': 
                this.ui.selectTower(4);
                break;
            case 'Escape': 
                this.ui.selectTower(0);
                break;
            case ' ': // Space bar
                event.preventDefault();
                this.togglePause();
                break;
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new GameApplication();
    app.init();
    
    // Make app globally accessible for debugging
    window.gameApp = app;
}); 