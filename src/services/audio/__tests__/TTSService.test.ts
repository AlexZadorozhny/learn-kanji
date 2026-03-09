import { TTSService } from '../TTSService';
import * as Speech from 'expo-speech';

// expo-speech is already mocked in jest.setup.js

describe('TTSService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset static isSpeaking state by calling stop
    TTSService.stop();
  });

  describe('speak', () => {
    it('calls Speech.speak with Japanese language by default', async () => {
      await TTSService.speak('こんにちは');

      expect(Speech.speak).toHaveBeenCalledWith(
        'こんにちは',
        expect.objectContaining({
          language: 'ja-JP',
          pitch: 1.0,
          rate: 0.75,
        })
      );
    });

    it('calls Speech.speak with custom language option', async () => {
      await TTSService.speak('Hello', { language: 'en-US' });

      expect(Speech.speak).toHaveBeenCalledWith(
        'Hello',
        expect.objectContaining({
          language: 'en-US',
        })
      );
    });

    it('calls Speech.speak with custom pitch and rate', async () => {
      await TTSService.speak('テスト', { pitch: 1.2, rate: 1.0 });

      expect(Speech.speak).toHaveBeenCalledWith(
        'テスト',
        expect.objectContaining({
          pitch: 1.2,
          rate: 1.0,
        })
      );
    });

    it('sets isSpeaking to true when speaking', async () => {
      const speakPromise = TTSService.speak('一');

      // Check immediately after calling (before await)
      expect(TTSService.isCurrentlySpeaking()).toBe(true);

      await speakPromise;
    });

    it('stops current speech before starting new speech', async () => {
      // Mock Speech.speak to keep isSpeaking true
      (Speech.speak as jest.Mock).mockImplementationOnce(() => {
        // Don't call onDone callback, so isSpeaking stays true
        return Promise.resolve();
      });

      await TTSService.speak('first');
      expect(TTSService.isCurrentlySpeaking()).toBe(true);

      // Start new speech
      await TTSService.speak('second');

      // Should have called stop first
      expect(Speech.stop).toHaveBeenCalled();
    });

    it('calls onDone callback and sets isSpeaking to false', async () => {
      let onDoneCallback: (() => void) | undefined;

      (Speech.speak as jest.Mock).mockImplementationOnce((text, options) => {
        onDoneCallback = options.onDone;
        return Promise.resolve();
      });

      await TTSService.speak('一');
      expect(TTSService.isCurrentlySpeaking()).toBe(true);

      // Simulate speech completion
      if (onDoneCallback) {
        onDoneCallback();
      }

      expect(TTSService.isCurrentlySpeaking()).toBe(false);
    });

    it('calls onError callback and sets isSpeaking to false', async () => {
      let onErrorCallback: (() => void) | undefined;

      (Speech.speak as jest.Mock).mockImplementationOnce((text, options) => {
        onErrorCallback = options.onError;
        return Promise.resolve();
      });

      await TTSService.speak('一');
      expect(TTSService.isCurrentlySpeaking()).toBe(true);

      // Simulate speech error
      if (onErrorCallback) {
        onErrorCallback();
      }

      expect(TTSService.isCurrentlySpeaking()).toBe(false);
    });

    it('handles errors and sets isSpeaking to false', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (Speech.speak as jest.Mock).mockRejectedValueOnce(new Error('TTS error'));

      await expect(TTSService.speak('一')).rejects.toThrow('TTS error');

      expect(TTSService.isCurrentlySpeaking()).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('TTS Error:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('stop', () => {
    it('calls Speech.stop', async () => {
      await TTSService.stop();

      expect(Speech.stop).toHaveBeenCalled();
    });

    it('sets isSpeaking to false', async () => {
      // Start speaking
      await TTSService.speak('一');
      expect(TTSService.isCurrentlySpeaking()).toBe(true);

      // Stop
      await TTSService.stop();

      expect(TTSService.isCurrentlySpeaking()).toBe(false);
    });

    it('handles errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (Speech.stop as jest.Mock).mockRejectedValueOnce(new Error('Stop error'));

      // Should not throw
      await TTSService.stop();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'TTS Stop Error:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('isCurrentlySpeaking', () => {
    it('returns false initially', () => {
      expect(TTSService.isCurrentlySpeaking()).toBe(false);
    });

    it('returns true when speaking', async () => {
      const speakPromise = TTSService.speak('一');

      expect(TTSService.isCurrentlySpeaking()).toBe(true);

      await speakPromise;
    });

    it('returns false after stop', async () => {
      await TTSService.speak('一');
      expect(TTSService.isCurrentlySpeaking()).toBe(true);

      await TTSService.stop();

      expect(TTSService.isCurrentlySpeaking()).toBe(false);
    });
  });

  describe('isAvailable', () => {
    it('returns true when voices are available', async () => {
      (Speech.getAvailableVoicesAsync as jest.Mock).mockResolvedValueOnce([
        { language: 'ja-JP', name: 'Japanese Voice' },
      ]);

      const result = await TTSService.isAvailable();

      expect(result).toBe(true);
      expect(Speech.getAvailableVoicesAsync).toHaveBeenCalled();
    });

    it('returns false when no voices are available', async () => {
      (Speech.getAvailableVoicesAsync as jest.Mock).mockResolvedValueOnce([]);

      const result = await TTSService.isAvailable();

      expect(result).toBe(false);
    });

    it('returns false when getAvailableVoicesAsync fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (Speech.getAvailableVoicesAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Voice check error')
      );

      const result = await TTSService.isAvailable();

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'TTS Availability Check Error:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
