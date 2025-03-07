// canvas.js - Canvas management and rendering

export class CanvasManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Original canvas dimensions
        this.originalWidth = this.canvas.width;
        this.originalHeight = this.canvas.height;
        
        // Scale factors for rendering
        this.scaleX = 1;
        this.scaleY = 1;
        
        // Tower placement preview state
        this.currentHoverX = -1;
        this.currentHoverY = -1;
        this.isTouchDevice = 'ontouchstart' in window;
        
        // Bind methods
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleResize = this.handleResize.bind(this);
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initial resize
        this.handleResize();
    }
    
    // Setup event listeners based on device type
    setupEventListeners() {
        // Mouse events for desktop
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseleave', this.handleMouseLeave);
        this.canvas.addEventListener('click', this.handleClick);
        
        // Touch events for mobile
        if (this.isTouchDevice) {
            this.canvas.addEventListener('touchstart', this.handleTouchStart);
            this.canvas.addEventListener('touchmove', this.handleTouchMove);
            this.canvas.addEventListener('touchend', this.handleTouchEnd);
        }
        
        // Resize event
        window.addEventListener('resize', this.handleResize);
    }
    
    // Handle window resize
    handleResize() {
        const containerWidth = this.canvas.parentElement.clientWidth;
        
        // Calculate the display size of the canvas
        const displayWidth = containerWidth;
        const displayHeight = (this.originalHeight / this.originalWidth) * displayWidth;
        
        // Set the canvas display size (CSS)
        this.canvas.style.width = `${displayWidth}px`;
        this.canvas.style.height = `${displayHeight}px`;
        
        // Set the canvas internal resolution (actual size)
        this.canvas.width = this.originalWidth;
        this.canvas.height = this.originalHeight;
        
        // Calculate the new scale factors
        this.scaleX = this.canvas.width / this.originalWidth;
        this.scaleY = this.canvas.height / this.originalHeight;
        
        // Update scale in WASM if needed
        if (window.gameApp && window.gameApp.wasmLoader.zigModule) {
            // If the WASM module has a setScale function, call it
            if (typeof window.gameApp.wasmLoader.zigModule.setScale === 'function') {
                window.gameApp.wasmLoader.zigModule.setScale(this.scaleX, this.scaleY);
            }
        }
    }
    
    // Convert screen coordinates to game world coordinates
    screenToWorld(screenX, screenY) {
        // Get the canvas's current display dimensions
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        return {
            x: screenX * scaleX,
            y: screenY * scaleY
        };
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
        
        // Convert to world coordinates
        const worldPos = this.screenToWorld(x, y);
        
        // Snap to grid (40x40)
        this.currentHoverX = Math.floor(worldPos.x / 40) * 40 + 20;
        this.currentHoverY = Math.floor(worldPos.y / 40) * 40 + 20;
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
            
            // Convert to world coordinates
            const worldPos = this.screenToWorld(x, y);
            
            window.gameApp.wasmLoader.handleCanvasClick(worldPos.x, worldPos.y);
        }
    }
    
    // Handle touch start event
    handleTouchStart(event) {
        event.preventDefault();
        
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            // Convert to world coordinates
            const worldPos = this.screenToWorld(x, y);
            
            // Snap to grid (40x40)
            this.currentHoverX = Math.floor(worldPos.x / 40) * 40 + 20;
            this.currentHoverY = Math.floor(worldPos.y / 40) * 40 + 20;
        }
    }
    
    // Handle touch move event
    handleTouchMove(event) {
        event.preventDefault();
        
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            // Convert to world coordinates
            const worldPos = this.screenToWorld(x, y);
            
            // Snap to grid (40x40)
            this.currentHoverX = Math.floor(worldPos.x / 40) * 40 + 20;
            this.currentHoverY = Math.floor(worldPos.y / 40) * 40 + 20;
        }
    }
    
    // Handle touch end event
    handleTouchEnd(event) {
        event.preventDefault();
        
        // This will be delegated to the app through the WasmLoader
        if (window.gameApp && window.gameApp.wasmLoader && this.currentHoverX >= 0 && this.currentHoverY >= 0) {
            window.gameApp.wasmLoader.handleCanvasClick(this.currentHoverX, this.currentHoverY);
            
            // Reset hover coordinates
            this.currentHoverX = -1;
            this.currentHoverY = -1;
        }
    }
} 