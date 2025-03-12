// TypeScript implementation of the WASM loader
import type { WasmModule } from "../../types/wasm.d.ts";

// Define logger type for compatibility
interface Logger {
  log(message: string): void;
  error(message: string): void;
  warn(message: string): void;
}

export class WasmLoader {
  private wasmModule: WasmModule | null = null;
  private logger: Logger;
  private gameApp: any; // Reference to the main game application

  constructor(gameApp: any, logger?: Logger) {
    this.gameApp = gameApp;
    this.logger = logger || console;
  }

  /**
   * Load and instantiate the WebAssembly module
   * @returns Promise resolving to the initialized WASM module
   */
  async loadWasm(): Promise<WasmModule> {
    if (this.wasmModule) return this.wasmModule;
    
    try {
      this.logger.log("Loading WASM module...");
      
      // Define JavaScript functions that will be called from Zig
      const importObject = {
        env: {
          // Example of a logging function that can be called from Zig
          consoleLog: (ptr: number, len: number) => {
            // Implementation would depend on how strings are passed from Zig
            // This is a placeholder
            this.logger.log(`[WASM] Log message from ptr ${ptr}, len: ${len}`);
          }
        }
      };
      
      // Fetch and instantiate the WASM module
      const response = await fetch('towerd.wasm');
      const bytes = await response.arrayBuffer();
      const { instance } = await WebAssembly.instantiate(bytes, importObject);
      
      // Cast the exports to our WasmModule interface
      this.wasmModule = instance.exports as unknown as WasmModule;
      
      this.logger.log("WASM module loaded successfully");
      return this.wasmModule;
    } catch (error) {
      this.logger.error(`Failed to load WASM module: ${error}`);
      throw error;
    }
  }

  /**
   * Initialize the WASM module with the canvas dimensions
   * @param width Canvas width
   * @param height Canvas height
   */
  async initializeGame(width: number, height: number): Promise<void> {
    const wasm = await this.loadWasm();
    wasm.init(width, height);
    this.logger.log(`Game initialized with canvas size: ${width}x${height}`);
  }

  /**
   * Reset the game state
   */
  async resetGame(): Promise<void> {
    const wasm = await this.loadWasm();
    wasm.resetGame();
    this.logger.log("Game reset");
  }

  /**
   * Update the game state
   * @param deltaTime Time elapsed since the last frame in seconds
   */
  async updateGame(deltaTime: number): Promise<void> {
    const wasm = await this.loadWasm();
    wasm.update(deltaTime);
  }

  /**
   * Handle mouse click at the specified coordinates
   * @param x X coordinate
   * @param y Y coordinate
   */
  async handleClick(x: number, y: number): Promise<void> {
    const wasm = await this.loadWasm();
    wasm.handleClick(x, y);
  }

  /**
   * Select tower type to be placed
   * @param towerType Tower type identifier
   */
  async selectTowerType(towerType: number): Promise<void> {
    const wasm = await this.loadWasm();
    wasm.selectTowerType(towerType);
  }

  /**
   * Check if a tower can be placed at the specified coordinates
   * @param x X coordinate
   * @param y Y coordinate
   * @returns True if a tower can be placed, false otherwise
   */
  async canPlaceTower(x: number, y: number): Promise<boolean> {
    const wasm = await this.loadWasm();
    return wasm.canPlaceTower(x, y);
  }

  /**
   * Get the range of the currently selected tower type
   * @returns The tower range value
   */
  async getTowerRange(): Promise<number> {
    const wasm = await this.loadWasm();
    return wasm.getTowerRange();
  }
} 