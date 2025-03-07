// wasm-loader.js - WebAssembly loading and interface

export class WasmLoader {
    constructor(app) {
        this.app = app;
        this.zigModule = null;
        
        // Define imports for WASM module
        this.imports = {
            env: {
                // Logging
                consoleLog: (ptr, len) => {
                    if (!this.zigModule) return;
                    
                    const buffer = new Uint8Array(this.zigModule.memory.buffer);
                    const message = new TextDecoder().decode(buffer.subarray(ptr, ptr + len));
                    console.log(message);
                    
                    // Safely log to UI if available
                    try {
                        if (this.app.ui && typeof this.app.ui.addLogEntry === 'function') {
                            this.app.ui.addLogEntry(message);
                        }
                    } catch (error) {
                        console.warn('Unable to add log entry to UI:', error);
                    }
                },
                
                // Canvas drawing functions
                clearCanvas: () => {
                    this.app.canvas.clear();
                },
                drawRect: (x, y, width, height, r, g, b) => {
                    this.app.canvas.drawRect(x, y, width, height, r, g, b);
                },
                drawCircle: (x, y, radius, r, g, b, fill) => {
                    this.app.canvas.drawCircle(x, y, radius, r, g, b, fill);
                },
                drawLine: (x1, y1, x2, y2, thickness, r, g, b) => {
                    this.app.canvas.drawLine(x1, y1, x2, y2, thickness, r, g, b);
                },
                drawTriangle: (x1, y1, x2, y2, x3, y3, r, g, b, fill) => {
                    this.app.canvas.drawTriangle(x1, y1, x2, y2, x3, y3, r, g, b, fill);
                },
                drawText: (x, y, text_ptr, text_len, size, r, g, b) => {
                    if (!this.zigModule) return;
                    
                    const buffer = new Uint8Array(this.zigModule.memory.buffer);
                    const text = new TextDecoder().decode(buffer.subarray(text_ptr, text_ptr + text_len));
                    this.app.canvas.drawText(x, y, text, size, r, g, b);
                },
                
                // Audio functions
                playEnemyHitSound: () => {
                    this.app.audio.playEnemyHitSound();
                },
                playLevelCompleteSound: () => {
                    this.app.audio.playLevelCompleteSound();
                },
                playLevelFailSound: () => {
                    this.app.audio.playLevelFailSound();
                },
                playTowerShootSound: () => {
                    this.app.audio.playTowerShootSound();
                },
                playEnemyExplosionSound: () => {
                    this.app.audio.playEnemyExplosionSound();
                }
            }
        };
    }
    
    // Load the WebAssembly module
    async loadWasm(wasmUrl) {
        try {
            const response = await fetch(wasmUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch WASM: ${response.statusText}`);
            }
            
            const wasmBytes = await response.arrayBuffer();
            
            // Instantiate the WebAssembly module
            const { instance } = await WebAssembly.instantiate(wasmBytes, this.imports);
            this.zigModule = instance.exports;
            
            // Initialize the WASM module with canvas dimensions
            const canvas = document.getElementById('canvas');
            this.zigModule.init(canvas.width, canvas.height);
            
            console.log('WASM module loaded successfully');
            return this.zigModule;
        } catch (error) {
            console.error('Failed to load WASM module:', error);
            throw error;
        }
    }
    
    // Handle click on canvas
    handleCanvasClick(x, y) {
        if (!this.zigModule || this.app.isPaused) return;
        this.zigModule.handleClick(x, y);
    }
    
    // Select tower type
    selectTowerType(towerType) {
        if (!this.zigModule) return;
        this.zigModule.selectTowerType(towerType);
    }
    
    // Check if a tower can be placed at the given coordinates
    canPlaceTower(x, y) {
        if (!this.zigModule) return false;
        return this.zigModule.canPlaceTower(x, y);
    }
    
    // Get the range of the currently selected tower
    getTowerRange() {
        if (!this.zigModule) return 0;
        return this.zigModule.getTowerRange();
    }
} 