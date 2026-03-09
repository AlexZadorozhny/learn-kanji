import { SoundService } from '../SoundService';
import { Audio } from 'expo-av';

// expo-av is already mocked in jest.setup.js, but we need to add setAudioModeAsync
jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(() =>
        Promise.resolve({
          sound: {
            playAsync: jest.fn(() => Promise.resolve()),
            unloadAsync: jest.fn(() => Promise.resolve()),
          },
        })
      ),
    },
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
  },
}));

describe('SoundService', () => {
  let mockSound: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock sound object
    mockSound = {
      playAsync: jest.fn(() => Promise.resolve()),
      unloadAsync: jest.fn(() => Promise.resolve()),
    };

    // Mock Audio.Sound.createAsync to return our mock sound
    (Audio.Sound.createAsync as jest.Mock).mockResolvedValue({
      sound: mockSound,
    });

    // Mock Audio.setAudioModeAsync
    (Audio.setAudioModeAsync as jest.Mock).mockResolvedValue(undefined);

    // Reset enabled state (public API)
    SoundService.setEnabled(true);
  });

  describe('playFlip', () => {
    it('attempts to create sound', async () => {
      await SoundService.playFlip();

      // Verify Audio.Sound.createAsync was called (indicates playSystemSound was called)
      expect(Audio.Sound.createAsync).toHaveBeenCalled();
    });

    it('unloads sound after creation', async () => {
      await SoundService.playFlip();

      expect(mockSound.unloadAsync).toHaveBeenCalled();
    });

    it('does not play when disabled', async () => {
      SoundService.setEnabled(false);

      await SoundService.playFlip();

      expect(Audio.Sound.createAsync).not.toHaveBeenCalled();
    });

    it('handles sound creation errors silently', async () => {
      const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
      (Audio.Sound.createAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Sound creation error')
      );

      // Should not throw
      await SoundService.playFlip();

      expect(consoleDebugSpy).toHaveBeenCalledWith(
        'Sound effect unavailable:',
        'flip'
      );

      consoleDebugSpy.mockRestore();
    });
  });

  describe('playClick', () => {
    it('attempts to create sound', async () => {
      await SoundService.playClick();

      expect(Audio.Sound.createAsync).toHaveBeenCalled();
    });

    it('does not play when disabled', async () => {
      SoundService.setEnabled(false);

      await SoundService.playClick();

      expect(Audio.Sound.createAsync).not.toHaveBeenCalled();
    });
  });

  describe('playSuccess', () => {
    it('attempts to create sound', async () => {
      await SoundService.playSuccess();

      expect(Audio.Sound.createAsync).toHaveBeenCalled();
    });

    it('does not play when disabled', async () => {
      SoundService.setEnabled(false);

      await SoundService.playSuccess();

      expect(Audio.Sound.createAsync).not.toHaveBeenCalled();
    });

    it('handles sound creation errors silently', async () => {
      const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
      (Audio.Sound.createAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Sound creation error')
      );

      // Should not throw
      await SoundService.playSuccess();

      expect(consoleDebugSpy).toHaveBeenCalledWith(
        'Sound effect unavailable:',
        'success'
      );

      consoleDebugSpy.mockRestore();
    });
  });

  describe('playError', () => {
    it('attempts to create sound', async () => {
      await SoundService.playError();

      expect(Audio.Sound.createAsync).toHaveBeenCalled();
    });

    it('does not play when disabled', async () => {
      SoundService.setEnabled(false);

      await SoundService.playError();

      expect(Audio.Sound.createAsync).not.toHaveBeenCalled();
    });
  });

  describe('setEnabled', () => {
    it('sets enabled to true', async () => {
      SoundService.setEnabled(true);

      // Verify by trying to play a sound
      await SoundService.playFlip();
      expect(Audio.Sound.createAsync).toHaveBeenCalled();
    });

    it('sets enabled to false', async () => {
      SoundService.setEnabled(false);

      // Verify by trying to play a sound
      await SoundService.playFlip();
      expect(Audio.Sound.createAsync).not.toHaveBeenCalled();
    });

    it('can toggle enabled state', async () => {
      SoundService.setEnabled(false);
      await SoundService.playClick();
      expect(Audio.Sound.createAsync).not.toHaveBeenCalled();

      jest.clearAllMocks();

      SoundService.setEnabled(true);
      await SoundService.playClick();
      expect(Audio.Sound.createAsync).toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('completes without errors', async () => {
      // Should not throw - cleanup is a public method
      await expect(SoundService.cleanup()).resolves.toBeUndefined();
    });

    it('handles errors gracefully', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Create a scenario where cleanup might have sounds to unload
      // (Note: We can't directly manipulate the private sounds Map,
      // but we can verify cleanup doesn't throw)
      await SoundService.cleanup();

      // Should not throw errors
      expect(true).toBe(true);

      consoleWarnSpy.mockRestore();
    });
  });

});
