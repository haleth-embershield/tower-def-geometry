// Canvas manager for handling rendering and canvas interactions

export class CanvasManager {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private width: number = 800;
  private height: number = 600;
  private currentHoverX: number = -1;
  private currentHoverY: number = -1;
  private selectedTowerType: number = 0;
  private canvasId: string;

  constructor(canvasId: string) {
    // Canvas will be initialized in the initialize method
    this.canvasId = canvasId;
  }

  /**
   * Initialize the canvas and set up event listeners
   */
  initialize(): { width: number, height: number } {
    // Get canvas element
    this.canvas = document.getElementById(this.canvasId) as HTMLCanvasElement;
    if (!this.canvas) {
      throw new Error(`Canvas element with ID '${this.canvasId}' not found`);
    }

    // Get 2D context
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }

    // Set canvas dimensions
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    // Set up mouse move event listener for tower preview
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    
    // Set up mouse leave event listener to clear hover state
    this.canvas.addEventListener('mouseleave', () => {
      this.currentHoverX = -1;
      this.currentHoverY = -1;
    });

    return { width: this.width, height: this.height };
  }

  /**
   * Handle mouse movement over the canvas
   */
  private handleMouseMove(event: MouseEvent): void {
    if (!this.canvas) return;
    
    const rect = this.canvas.getBoundingClientRect();
    this.currentHoverX = event.clientX - rect.left;
    this.currentHoverY = event.clientY - rect.top;
  }

  /**
   * Set the currently selected tower type
   */
  setSelectedTowerType(type: number): void {
    this.selectedTowerType = type;
  }

  /**
   * Render the game state
   * This is a placeholder - the actual rendering would be more complex
   */
  render(): void {
    if (!this.ctx || !this.canvas) return;
    
    // Clear the canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // The actual rendering would be done by the WASM module
    // This is just a placeholder for any additional UI elements
    
    // Draw tower preview if hovering and a tower type is selected
    if (this.currentHoverX >= 0 && this.currentHoverY >= 0 && this.selectedTowerType > 0) {
      this.drawTowerPreview(this.currentHoverX, this.currentHoverY, true, 100);
    }
  }

  /**
   * Draw a preview of a tower at the specified position
   */
  drawTowerPreview(x: number, y: number, canPlace: boolean, range: number): void {
    if (!this.ctx) return;
    
    // Draw tower range circle
    this.ctx.beginPath();
    this.ctx.arc(x, y, range, 0, Math.PI * 2);
    this.ctx.fillStyle = canPlace ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)';
    this.ctx.fill();
    this.ctx.strokeStyle = canPlace ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    // Draw tower placeholder
    this.ctx.beginPath();
    
    // Different shapes based on tower type
    switch (this.selectedTowerType) {
      case 1: // Line tower
        this.ctx.moveTo(x - 15, y);
        this.ctx.lineTo(x + 15, y);
        this.ctx.lineWidth = 4;
        break;
      case 2: // Triangle tower
        this.ctx.moveTo(x, y - 15);
        this.ctx.lineTo(x + 13, y + 10);
        this.ctx.lineTo(x - 13, y + 10);
        this.ctx.closePath();
        break;
      case 3: // Square tower
        this.ctx.rect(x - 10, y - 10, 20, 20);
        break;
      case 4: // Pentagon tower
        const size = 15;
        for (let i = 0; i < 5; i++) {
          const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
          const px = x + size * Math.cos(angle);
          const py = y + size * Math.sin(angle);
          if (i === 0) {
            this.ctx.moveTo(px, py);
          } else {
            this.ctx.lineTo(px, py);
          }
        }
        this.ctx.closePath();
        break;
      default:
        this.ctx.arc(x, y, 10, 0, Math.PI * 2);
    }
    
    this.ctx.fillStyle = canPlace ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)';
    this.ctx.fill();
    this.ctx.strokeStyle = canPlace ? '#0f0' : '#f00';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  /**
   * Get the canvas element
   */
  getCanvas(): HTMLCanvasElement | null {
    return this.canvas;
  }

  /**
   * Get the canvas context
   */
  getContext(): CanvasRenderingContext2D | null {
    return this.ctx;
  }

  /**
   * Get the canvas dimensions
   */
  getDimensions(): { width: number, height: number } {
    return { width: this.width, height: this.height };
  }

  /**
   * Get the current hover position
   */
  getHoverPosition(): { x: number, y: number } {
    return { x: this.currentHoverX, y: this.currentHoverY };
  }
} 