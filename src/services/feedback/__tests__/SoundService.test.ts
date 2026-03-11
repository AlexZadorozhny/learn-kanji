import { SoundService } from '../SoundService';

describe('SoundService', () => {
  beforeEach(() => {
    SoundService.setEnabled(true);
  });

  describe('playFlip', () => {
    it('completes without errors', async () => {
      await expect(SoundService.playFlip()).resolves.toBeUndefined();
    });
  });

  describe('playClick', () => {
    it('completes without errors', async () => {
      await expect(SoundService.playClick()).resolves.toBeUndefined();
    });
  });

  describe('playSuccess', () => {
    it('completes without errors', async () => {
      await expect(SoundService.playSuccess()).resolves.toBeUndefined();
    });
  });

  describe('playError', () => {
    it('completes without errors', async () => {
      await expect(SoundService.playError()).resolves.toBeUndefined();
    });
  });

  describe('setEnabled', () => {
    it('sets enabled state without errors', () => {
      expect(() => SoundService.setEnabled(true)).not.toThrow();
      expect(() => SoundService.setEnabled(false)).not.toThrow();
    });
  });

  describe('initialize', () => {
    it('completes without errors', async () => {
      await expect(SoundService.initialize()).resolves.toBeUndefined();
    });
  });

  describe('cleanup', () => {
    it('completes without errors', async () => {
      await expect(SoundService.cleanup()).resolves.toBeUndefined();
    });
  });
});
