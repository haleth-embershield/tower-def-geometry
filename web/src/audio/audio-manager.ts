// Audio manager for handling game sounds and music

interface Logger {
  log(message: string): void;
  error(message: string): void;
  warn(message: string): void;
}

interface SoundMap {
  [key: string]: HTMLAudioElement;
}

export class AudioManager {
  private sounds: SoundMap = {};
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

      // Define sound effects to load - only using the available .ogg files
      // Note: These are now loaded from WASM, but we keep the structure for compatibility
      const soundEffects = {
        // Map missing sounds to existing ones for compatibility
        'place': 'audio/tower-shoot.ogg',     // Use tower-shoot for place
        'shoot': 'audio/tower-shoot.ogg',     // Use tower-shoot for shoot
        'hit': 'audio/enemy-hit.ogg',         // Use enemy-hit for hit
        'error': 'audio/enemy-hit.ogg',       // Use enemy-hit for error
        'wave': 'audio/enemy-explosion.ogg',  // Use enemy-explosion for wave
        'victory': 'audio/level-complete.ogg', // Use level-complete for victory
        'defeat': 'audio/level-fail.ogg',     // Use level-fail for defeat
        'select': 'audio/tower-shoot.ogg'     // Use tower-shoot for select
      };

      // Load each sound effect
      const promises = Object.entries(soundEffects).map(async ([name, path]) => {
        try {
          const audio = new Audio(path);
          await this.preloadAudio(audio);
          this.sounds[name] = audio;
          this.logger.log(`Loaded audio: ${name}`);
        } catch (err) {
          this.logger.warn(`Failed to load sound: ${name} (${path})`);
        }
      });

      // Load background music from public directory
      try {
        this.backgroundMusic = new Audio('audio/background.ogg');
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = 0.3; // Lower volume for background music
        await this.preloadAudio(this.backgroundMusic);
        this.logger.log('Background music loaded from public directory');
      } catch (err) {
        this.logger.warn('Failed to load background music');
      }

      // Wait for all sounds to load
      await Promise.all(promises);
      this.logger.log('All audio files loaded successfully');
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
   * Play a sound effect by name
   */
  playSound(name: string): void {
    if (this.isMuted) return;
    
    const sound = this.sounds[name];
    if (sound) {
      // Clone the audio to allow overlapping sounds
      const clone = sound.cloneNode() as HTMLAudioElement;
      clone.volume = 0.7;
      clone.play().catch(err => this.logger.error(`Error playing sound ${name}: ${err}`));
    } else {
      this.logger.warn(`Sound not found: ${name}`);
    }
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

  // Specific sound methods to match the original API
  // Note: These are now handled by WASM, but we keep them for compatibility
  
  /**
   * Play enemy hit sound
   */
  playEnemyHitSound(): void {
    this.playSound('hit');
  }
  
  /**
   * Play level complete sound
   */
  playLevelCompleteSound(): void {
    this.playSound('victory');
  }
  
  /**
   * Play level fail sound
   */
  playLevelFailSound(): void {
    this.playSound('defeat');
  }
  
  /**
   * Play tower shoot sound
   */
  playTowerShootSound(): void {
    this.playSound('shoot');
  }
  
  /**
   * Play enemy explosion sound
   */
  playEnemyExplosionSound(): void {
    this.playSound('wave');
  }
} 