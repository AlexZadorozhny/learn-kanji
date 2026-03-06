import * as Haptics from 'expo-haptics';

/**
 * Haptic Feedback Service
 * Provides tactile feedback for user interactions
 */
export class HapticService {
  /**
   * Light impact feedback (for button taps)
   */
  static async light() {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }

  /**
   * Medium impact feedback (for card flips)
   */
  static async medium() {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }

  /**
   * Heavy impact feedback (for significant actions)
   */
  static async heavy() {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }

  /**
   * Success feedback (for correct answers)
   */
  static async success() {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }

  /**
   * Warning feedback (for incorrect answers)
   */
  static async warning() {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }

  /**
   * Error feedback (for errors)
   */
  static async error() {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }

  /**
   * Selection feedback (for UI element selection)
   */
  static async selection() {
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }
}
