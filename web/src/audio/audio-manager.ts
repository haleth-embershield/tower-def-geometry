// Audio manager for handling game sounds and music

interface Logger {
  log(message: string): void;
  error(message: string): void;
  warn(message: string): void;
}

export class AudioManager {
  private backgroundMusic: HTMLAudioElement | null = null;
  private logger: Logger;
  private isMuted: boolean = false;

  constructor(logger?: Logger) {
    this.logger = logger || console;
  }

  /**
   * Load all game sound effects and music
   */
  async loadSounds(): Promise<void> {
    try {
      this.logger.log('Loading audio assets...');

      // We no longer load individual sound effects from files
      // All game sound effects are now embedded in the WASM module
      // Only load background music from public directory
      try {
        this.backgroundMusic = new Audio('audio/background.ogg');
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = 0.3; // Lower volume for background music
        await this.preloadAudio(this.backgroundMusic);
        this.logger.log('Background music loaded from public directory');
      } catch (err) {
        this.logger.warn('Failed to load background music');
      }

      this.logger.log('Audio initialization complete');
    } catch (error) {
      this.logger.error(`Error loading audio: ${error}`);
      throw error;
    }
  }

  /**
   * Preload an audio element by forcing it to load its data
   */
  private preloadAudio(audio: HTMLAudioElement): Promise<void> {
    return new Promise((resolve, reject) => {
      audio.addEventListener('canplaythrough', () => resolve(), { once: true });
      audio.addEventListener('error', (e) => reject(e), { once: true });
      audio.load();
    });
  }

  /**
   * Play background music
   */
  playBackgroundMusic(): void {
    if (this.isMuted || !this.backgroundMusic) return;
    
    this.backgroundMusic.currentTime = 0;
    this.backgroundMusic.play().catch(err => 
      this.logger.error(`Error playing background music: ${err}`)
    );
  }

  /**
   * Stop background music
   */
  stopBackgroundMusic(): void {
    if (!this.backgroundMusic) return;
    
    this.backgroundMusic.pause();
    this.backgroundMusic.currentTime = 0;
  }

  /**
   * Toggle mute state for all audio
   */
  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    
    if (this.isMuted) {
      this.stopBackgroundMusic();
    } else if (this.backgroundMusic) {
      this.playBackgroundMusic();
    }
    
    return this.isMuted;
  }

  // The following methods are kept for API compatibility
  // but they don't do anything since sounds are now handled by WASM
  
  playEnemyHitSound(): void {}
  playLevelCompleteSound(): void {}
  playLevelFailSound(): void {}
  playTowerShootSound(): void {}
  playEnemyExplosionSound(): void {}
  playSound(name: string): void {}
} 