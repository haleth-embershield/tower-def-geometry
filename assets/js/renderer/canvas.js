// canvas.js - Canvas management and rendering

export class CanvasManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Tower placement preview state
        this.currentHoverX = -1;
        this.currentHoverY = -1;
        
        // Bind methods
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleClick = this.handleClick.bind(this);
        
        // Add event listeners
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseleave', this.handleMouseLeave);
        this.canvas.addEventListener('click', this.handleClick);
    }
    
    // Clear the canvas
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Draw a rectangle
    drawRect(x, y, width, height, r, g, b) {
        this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        this.ctx.fillRect(x, y, width, height);
    }
    
    // Draw a circle
    drawCircle(x, y, radius, r, g, b, fill) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        if (fill) {
            this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            this.ctx.fill();
        } else {
            this.ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }
    
    // Draw a line
    drawLine(x1, y1, x2, y2, thickness, r, g, b) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
        this.ctx.lineWidth = thickness;
        this.ctx.stroke();
    }
    
    // Draw a triangle
    drawTriangle(x1, y1, x2, y2, x3, y3, r, g, b, fill) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.lineTo(x3, y3);
        this.ctx.closePath();
        if (fill) {
            this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            this.ctx.fill();
        } else {
            this.ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }
    
    // Draw text
    drawText(x, y, text, size, r, g, b) {
        this.ctx.font = `${size}px sans-serif`;
        this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        this.ctx.fillText(text, x, y);
    }
    
    // Draw tower placement preview
    drawTowerPreview(x, y, canPlace, range) {
        if (x < 0 || y < 0) return;
        
        // Draw tower placement indicator
        this.ctx.beginPath();
        this.ctx.arc(x, y, 20, 0, Math.PI * 2);
        this.ctx.strokeStyle = canPlace ? 'rgba(0, 255, 238, 0.5)' : 'rgba(255, 0, 0, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Draw tower range indicator if placement is valid
        if (canPlace && range > 0) {
            this.ctx.beginPath();
            this.ctx.arc(x, y, range, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(0, 255, 238, 0.2)';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }
        
        if (!canPlace) {
            // Draw X
            this.ctx.beginPath();
            this.ctx.moveTo(x - 15, y - 15);
            this.ctx.lineTo(x + 15, y + 15);
            this.ctx.moveTo(x + 15, y - 15);
            this.ctx.lineTo(x - 15, y + 15);
            this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
            this.ctx.stroke();
        }
    }
    
    // Handle mouse move for tower placement preview
    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Snap to grid (40x40)
        this.currentHoverX = Math.floor(x / 40) * 40 + 20;
        this.currentHoverY = Math.floor(y / 40) * 40 + 20;
    }
    
    // Handle mouse leave
    handleMouseLeave() {
        this.currentHoverX = -1;
        this.currentHoverY = -1;
    }
    
    // Handle canvas click
    handleClick(event) {
        // This will be delegated to the app through the WasmLoader
        if (window.gameApp && window.gameApp.wasmLoader) {
            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            window.gameApp.wasmLoader.handleCanvasClick(x, y);
        }
    }
} 