/**
 * Sound Effects Service
 * Stub implementation - relies on haptic feedback for user interactions.
 * TODO: Re-add audio support once expo-av compatibility is restored.
 */
export class SoundService {
  private static isEnabled = true;

  static async initialize() {
    // No-op: sound effects not yet implemented
  }

  static async playFlip() {
    // Relies on haptic feedback in component
  }

  static async playClick() {
    // Relies on haptic feedback in component
  }

  static async playSuccess() {
    // Relies on haptic feedback in component
  }

  static async playError() {
    // Relies on haptic feedback in component
  }

  static setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  static async cleanup() {
    // No-op
  }
}
