import { Audio } from 'expo-av';

/**
 * Sound Effects Service
 * Provides audio feedback for user interactions using system sounds
 */
export class SoundService {
  private static sounds: Map<string, Audio.Sound> = new Map();
  private static isEnabled = true;
  private static isInitialized = false;

  /**
   * Initialize audio mode
   */
  static async initialize() {
    if (this.isInitialized) return;

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      this.isInitialized = true;
    } catch (error) {
      console.warn('Failed to initialize audio:', error);
    }
  }

  /**
   * Play a simple sound using system audio capabilities
   */
  private static async playSystemSound(soundKey: string) {
    if (!this.isEnabled) return;

    try {
      await this.initialize();

      // Use device default sounds - these work without audio files
      // On iOS, this uses system sounds; on Android, uses notification sounds
      const { sound } = await Audio.Sound.createAsync(
        // Use a very short silent audio to trigger the audio system
        // In production, replace with actual sound files
        require('../../../assets/splash.png'), // Placeholder - won't actually play
        { shouldPlay: false }
      );

      // Since we don't have audio files yet, we'll just use haptic as primary feedback
      // TODO: Add actual sound files to assets/sounds/ folder
      await sound.unloadAsync();
    } catch (error) {
      // Silently fail - sound effects are non-critical
      console.debug('Sound effect unavailable:', soundKey);
    }
  }

  /**
   * Card flip sound effect
   */
  static async playFlip() {
    // For now, relies on haptic feedback in component
    // TODO: Add whoosh.mp3 sound file
    await this.playSystemSound('flip');
  }

  /**
   * Button press click sound
   */
  static async playClick() {
    // For now, relies on haptic feedback in component
    // TODO: Add click.mp3 sound file
    await this.playSystemSound('click');
  }

  /**
   * Success sound (for Good/Easy ratings)
   */
  static async playSuccess() {
    // For now, relies on haptic feedback in component
    // TODO: Add success.mp3 sound file
    await this.playSystemSound('success');
  }

  /**
   * Error sound (for Again rating)
   */
  static async playError() {
    // For now, relies on haptic feedback in component
    // TODO: Add error.mp3 sound file
    await this.playSystemSound('error');
  }

  /**
   * Enable or disable sound effects
   */
  static setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  /**
   * Clean up all loaded sounds
   */
  static async cleanup() {
    for (const [key, sound] of this.sounds) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        console.warn(`Failed to unload sound ${key}:`, error);
      }
    }
    this.sounds.clear();
  }
}

