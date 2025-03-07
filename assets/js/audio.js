// audio.js - Audio system for the game

export class AudioManager {
    constructor() {
        // Initialize audio context
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.audioBuffers = {};
        
        // Define audio files to load
        this.audioFiles = [
            { name: 'enemyHit', path: 'audio/enemy-hit.ogg' },
            { name: 'levelComplete', path: 'audio/level-complete.ogg' },
            { name: 'levelFail', path: 'audio/level-fail.ogg' },
            { name: 'towerShoot', path: 'audio/tower-shoot.ogg' },
            { name: 'enemyExplosion', path: 'audio/enemy-explosion.ogg' }
        ];
    }
    
    // Preload all audio files
    async preloadAudio() {
        try {
            const loadPromises = this.audioFiles.map(async (file) => {
                const response = await fetch(file.path);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                this.audioBuffers[file.name] = audioBuffer;
                console.log(`Loaded audio: ${file.name}`);
            });
            
            await Promise.all(loadPromises);
            console.log('All audio files loaded successfully');
        } catch (error) {
            console.error('Error loading audio files:', error);
            throw error;
        }
    }
    
    // Play a sound by name
    playSound(soundName) {
        if (this.audioBuffers[soundName]) {
            const source = this.audioContext.createBufferSource();
            source.buffer = this.audioBuffers[soundName];
            source.connect(this.audioContext.destination);
            source.start(0);
        }
    }
    
    // Play enemy hit sound
    playEnemyHitSound() {
        this.playSound('enemyHit');
    }
    
    // Play level complete sound
    playLevelCompleteSound() {
        this.playSound('levelComplete');
    }
    
    // Play level fail sound
    playLevelFailSound() {
        this.playSound('levelFail');
    }
    
    // Play tower shoot sound
    playTowerShootSound() {
        this.playSound('towerShoot');
    }
    
    // Play enemy explosion sound
    playEnemyExplosionSound() {
        this.playSound('enemyExplosion');
    }
} 