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

      // Define sound effects to load
      const soundEffects = {
        'place': 'audio/place.mp3',
        'shoot': 'audio/shoot.mp3',
        'hit': 'audio/hit.mp3',
        'error': 'audio/error.mp3',
        'wave': 'audio/wave.mp3',
        'victory': 'audio/victory.mp3',
        'defeat': 'audio/defeat.mp3'
      };

      // Load each sound effect
      const promises = Object.entries(soundEffects).map(async ([name, path]) => {
        try {
          const audio = new Audio(path);
          await this.preloadAudio(audio);
          this.sounds[name] = audio;
        } catch (err) {
          this.logger.warn(`Failed to load sound: ${name} (${path})`);
        }
      });

      // Load background music
      try {
        this.backgroundMusic = new Audio('audio/background.mp3');
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = 0.5;
        await this.preloadAudio(this.backgroundMusic);
      } catch (err) {
        this.logger.warn('Failed to load background music');
      }

      // Wait for all sounds to load
      await Promise.all(promises);
      this.logger.log('Audio assets loaded successfully');
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
} 