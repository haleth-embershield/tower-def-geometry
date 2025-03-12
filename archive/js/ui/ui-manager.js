// ui-manager.js - UI management and interactions

export class UIManager {
    constructor(app) {
        this.app = app;
        
        // UI elements
        this.startButton = null;
        this.pauseButton = null;
        this.towerButtons = {};
        this.logContainer = null;
        this.logToggle = null;
        
        // Initialize log buffer for messages received before UI is ready
        this.logBuffer = [];
    }
    
    // Initialize UI elements and event listeners
    initializeUI() {
        // Get UI elements
        this.startButton = document.getElementById('start-button');
        this.pauseButton = document.getElementById('pause-button');
        this.logContainer = document.getElementById('log-container');
        this.logToggle = document.getElementById('log-toggle');
        
        // Tower buttons
        this.towerButtons = {
            line: document.getElementById('tower-line'),
            triangle: document.getElementById('tower-triangle'),
            square: document.getElementById('tower-square'),
            pentagon: document.getElementById('tower-pentagon')
        };
        
        // Add event listeners
        this.startButton.addEventListener('click', () => this.app.startGame());
        this.pauseButton.addEventListener('click', () => this.app.togglePause());
        
        // Tower selection buttons
        this.towerButtons.line.addEventListener('click', () => this.selectTower(1));
        this.towerButtons.triangle.addEventListener('click', () => this.selectTower(2));
        this.towerButtons.square.addEventListener('click', () => this.selectTower(3));
        this.towerButtons.pentagon.addEventListener('click', () => this.selectTower(4));
        
        // Log toggle
        this.logToggle.addEventListener('click', () => this.toggleLog());
        
        // Process any buffered log messages
        this.processLogBuffer();
        
        console.log('UI initialized');
    }
    
    // Process any log messages that were received before UI was ready
    processLogBuffer() {
        if (this.logBuffer.length > 0 && this.logContainer) {
            // Clear the initial placeholder message
            this.logContainer.innerHTML = '';
            
            // Add all buffered messages
            for (const message of this.logBuffer) {
                this.addLogEntryDirect(message);
            }
            
            // Clear the buffer
            this.logBuffer = [];
        }
    }
    
    // Select tower type
    selectTower(towerType) {
        // Update UI
        Object.values(this.towerButtons).forEach(btn => btn.classList.remove('active'));
        
        // Set active class based on selection
        switch(towerType) {
            case 1: this.towerButtons.line.classList.add('active'); break;
            case 2: this.towerButtons.triangle.classList.add('active'); break;
            case 3: this.towerButtons.square.classList.add('active'); break;
            case 4: this.towerButtons.pentagon.classList.add('active'); break;
            default: break; // For ESC key (deselect)
        }
        
        // Call WASM function to set selected tower type
        this.app.wasmLoader.selectTowerType(towerType);
    }
    
    // Add log entry to the log container
    addLogEntry(message) {
        if (!this.logContainer) {
            // If log container isn't ready yet, buffer the message
            this.logBuffer.push(message);
            return;
        }
        
        this.addLogEntryDirect(message);
    }
    
    // Directly add a log entry to the container (no buffering)
    addLogEntryDirect(message) {
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.textContent = message;
        this.logContainer.appendChild(entry);
        
        // Auto-scroll to bottom
        this.logContainer.scrollTop = this.logContainer.scrollHeight;
        
        // Limit number of entries
        while (this.logContainer.children.length > 100) {
            this.logContainer.removeChild(this.logContainer.firstChild);
        }
    }
    
    // Toggle log visibility
    toggleLog() {
        this.logContainer.classList.toggle('hidden');
        this.logToggle.classList.toggle('collapsed');
    }
} 