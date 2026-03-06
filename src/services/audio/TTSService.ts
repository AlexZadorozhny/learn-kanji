import * as Speech from 'expo-speech';

/**
 * Text-to-Speech Service
 * Wrapper around expo-speech for Japanese pronunciation
 */
export class TTSService {
  private static isSpeaking = false;

  /**
   * Speak Japanese text using device TTS
   * @param text - Japanese text (hiragana, katakana, or kanji)
   * @param options - Optional speech configuration
   */
  static async speak(
    text: string,
    options?: {
      language?: string;
      pitch?: number;
      rate?: number;
    }
  ): Promise<void> {
    try {
      // Stop any current speech
      if (this.isSpeaking) {
        await this.stop();
      }

      this.isSpeaking = true;

      await Speech.speak(text, {
        language: options?.language || 'ja-JP', // Japanese
        pitch: options?.pitch || 1.0,
        rate: options?.rate || 0.75, // Slightly slower for learning
        onDone: () => {
          this.isSpeaking = false;
        },
        onError: () => {
          this.isSpeaking = false;
        },
      });
    } catch (error) {
      console.error('TTS Error:', error);
      this.isSpeaking = false;
      throw error;
    }
  }

  /**
   * Stop current speech
   */
  static async stop(): Promise<void> {
    try {
      await Speech.stop();
      this.isSpeaking = false;
    } catch (error) {
      console.error('TTS Stop Error:', error);
    }
  }

  /**
   * Check if TTS is currently speaking
   */
  static isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Check if TTS is available on the device
   */
  static async isAvailable(): Promise<boolean> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      return voices.length > 0;
    } catch (error) {
      console.error('TTS Availability Check Error:', error);
      return false;
    }
  }
}
