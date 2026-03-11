import { FeedbackMessageService } from '../FeedbackMessageService';

describe('FeedbackMessageService', () => {
  describe('generateStartPointFeedback', () => {
    it('generates "higher" feedback', () => {
      const message = FeedbackMessageService.generateStartPointFeedback(
        { x: 50, y: 50 },
        { x: 50, y: 40 } // Target is higher
      );

      expect(message).toContain('higher');
    });

    it('generates "lower" feedback', () => {
      const message = FeedbackMessageService.generateStartPointFeedback(
        { x: 50, y: 40 },
        { x: 50, y: 50 } // Target is lower
      );

      expect(message).toContain('lower');
    });

    it('generates "to the right" feedback', () => {
      const message = FeedbackMessageService.generateStartPointFeedback(
        { x: 40, y: 50 },
        { x: 50, y: 50 } // Target is to the right
      );

      expect(message).toContain('to the right');
    });

    it('generates "to the left" feedback', () => {
      const message = FeedbackMessageService.generateStartPointFeedback(
        { x: 50, y: 50 },
        { x: 40, y: 50 } // Target is to the left
      );

      expect(message).toContain('to the left');
    });

    it('generates combined diagonal feedback', () => {
      const message = FeedbackMessageService.generateStartPointFeedback(
        { x: 40, y: 40 },
        { x: 50, y: 50 } // Target is lower and to the right
      );

      expect(message).toContain('lower');
      expect(message).toContain('to the right');
    });

    it('ignores small differences', () => {
      const message = FeedbackMessageService.generateStartPointFeedback(
        { x: 50, y: 50 },
        { x: 52, y: 52 } // Very small difference
      );

      expect(message).toContain('Begin your stroke');
    });
  });

  describe('generateEndPointFeedback', () => {
    it('generates "higher" feedback', () => {
      const message = FeedbackMessageService.generateEndPointFeedback(
        { x: 50, y: 50 },
        { x: 50, y: 40 } // Target is higher
      );

      expect(message).toContain('higher');
    });

    it('generates "lower" feedback', () => {
      const message = FeedbackMessageService.generateEndPointFeedback(
        { x: 50, y: 40 },
        { x: 50, y: 50 } // Target is lower
      );

      expect(message).toContain('lower');
    });

    it('generates "to the right" feedback', () => {
      const message = FeedbackMessageService.generateEndPointFeedback(
        { x: 40, y: 50 },
        { x: 50, y: 50 } // Target is to the right
      );

      expect(message).toContain('to the right');
    });

    it('generates "to the left" feedback', () => {
      const message = FeedbackMessageService.generateEndPointFeedback(
        { x: 50, y: 50 },
        { x: 40, y: 50 } // Target is to the left
      );

      expect(message).toContain('to the left');
    });

    it('generates combined diagonal feedback', () => {
      const message = FeedbackMessageService.generateEndPointFeedback(
        { x: 40, y: 40 },
        { x: 50, y: 50 } // Target is lower and to the right
      );

      expect(message).toContain('lower');
      expect(message).toContain('to the right');
    });
  });

  describe('generateDirectionFeedback', () => {
    it('generates rightward feedback', () => {
      const userAngle = Math.PI / 12; // 15 degrees
      const targetAngle = 0; // 0 degrees (right)

      const message = FeedbackMessageService.generateDirectionFeedback(userAngle, targetAngle);

      expect(message).toBeTruthy();
      expect(message).toContain('Draw more');
    });

    it('generates downward feedback', () => {
      const userAngle = 0; // 0 degrees (right)
      const targetAngle = Math.PI / 2; // 90 degrees (down)

      const message = FeedbackMessageService.generateDirectionFeedback(userAngle, targetAngle);

      expect(message).toBeTruthy();
      expect(message.toLowerCase()).toContain('draw more');
    });

    it('generates leftward feedback', () => {
      const userAngle = 0; // 0 degrees (right)
      const targetAngle = Math.PI; // 180 degrees (left)

      const message = FeedbackMessageService.generateDirectionFeedback(userAngle, targetAngle);

      expect(message).toContain('opposite direction');
    });

    it('generates upward feedback', () => {
      const userAngle = Math.PI / 2; // 90 degrees (down)
      const targetAngle = (3 * Math.PI) / 2; // 270 degrees (up)

      const message = FeedbackMessageService.generateDirectionFeedback(userAngle, targetAngle);

      expect(message).toContain('opposite direction');
    });

    it('handles small direction differences', () => {
      const userAngle = 0; // 0 degrees
      const targetAngle = Math.PI / 12; // 15 degrees

      const message = FeedbackMessageService.generateDirectionFeedback(userAngle, targetAngle);

      expect(message).toBeTruthy();
      expect(message).toContain('Draw more');
    });

    it('handles diagonal directions', () => {
      const userAngle = 0; // 0 degrees (right)
      const targetAngle = Math.PI / 4; // 45 degrees (diagonal down-right)

      const message = FeedbackMessageService.generateDirectionFeedback(userAngle, targetAngle);

      expect(message).toBeTruthy();
    });
  });

  describe('generateShapeFeedback', () => {
    it('generates generic shape feedback', () => {
      const message = FeedbackMessageService.generateShapeFeedback();

      expect(message).toBe('Follow the guide stroke more closely');
    });
  });

  describe('generateCombinedFeedback', () => {
    it('prioritizes start point error', () => {
      const message = FeedbackMessageService.generateCombinedFeedback(
        true, // has start error
        true, // has end error
        true, // has direction error
        { x: 40, y: 40 },
        { x: 50, y: 50 },
        { x: 80, y: 80 },
        { x: 90, y: 90 },
        0,
        Math.PI / 2
      );

      expect(message).toContain('Begin your stroke');
    });

    it('returns end point feedback when start is correct', () => {
      const message = FeedbackMessageService.generateCombinedFeedback(
        false, // no start error
        true, // has end error
        true, // has direction error
        { x: 50, y: 50 },
        { x: 50, y: 50 },
        { x: 80, y: 80 },
        { x: 90, y: 90 },
        0,
        Math.PI / 2
      );

      expect(message).toContain('End your stroke');
    });

    it('returns direction feedback when start and end are correct', () => {
      const message = FeedbackMessageService.generateCombinedFeedback(
        false, // no start error
        false, // no end error
        true, // has direction error
        { x: 50, y: 50 },
        { x: 50, y: 50 },
        { x: 90, y: 90 },
        { x: 90, y: 90 },
        0,
        Math.PI / 2
      );

      expect(message).toContain('Draw more');
    });

    it('returns generic feedback when no specific errors', () => {
      const message = FeedbackMessageService.generateCombinedFeedback(
        false, // no start error
        false, // no end error
        false // no direction error
      );

      expect(message).toBe('Follow the guide stroke more closely');
    });

    it('handles missing optional parameters', () => {
      const message = FeedbackMessageService.generateCombinedFeedback(
        true, // has start error but no points provided
        false,
        false
      );

      expect(message).toBe('Follow the guide stroke more closely');
    });
  });

  describe('directional accuracy', () => {
    it('identifies horizontal right strokes', () => {
      const message = FeedbackMessageService.generateDirectionFeedback(
        Math.PI / 12, // 15 degrees - closer to target
        0 // 0 degrees (right)
      );

      // Should give directional feedback
      expect(message).toBeTruthy();
      expect(message).toContain('Draw more');
    });

    it('identifies vertical down strokes', () => {
      const message = FeedbackMessageService.generateDirectionFeedback(
        Math.PI / 6, // 30 degrees
        Math.PI / 2 // 90 degrees (down)
      );

      expect(message.toLowerCase()).toMatch(/down|draw more/);
    });

    it('identifies diagonal strokes', () => {
      const message = FeedbackMessageService.generateDirectionFeedback(
        0, // 0 degrees
        Math.PI / 4 // 45 degrees (diagonal)
      );

      expect(message).toBeTruthy();
      expect(message).toContain('Draw more');
    });
  });

  describe('edge cases', () => {
    it('handles exact matches gracefully', () => {
      const startMessage = FeedbackMessageService.generateStartPointFeedback(
        { x: 50, y: 50 },
        { x: 50, y: 50 }
      );
      expect(startMessage).toContain('Begin your stroke');

      const endMessage = FeedbackMessageService.generateEndPointFeedback(
        { x: 50, y: 50 },
        { x: 50, y: 50 }
      );
      expect(endMessage).toContain('End your stroke');
    });

    it('handles very small differences', () => {
      const message = FeedbackMessageService.generateStartPointFeedback(
        { x: 50, y: 50 },
        { x: 51, y: 51 }
      );

      expect(message).toBeTruthy();
    });

    it('handles extreme angles', () => {
      const message1 = FeedbackMessageService.generateDirectionFeedback(
        0,
        2 * Math.PI // 360 degrees = 0 degrees
      );
      expect(message1).toBeTruthy();

      const message2 = FeedbackMessageService.generateDirectionFeedback(
        -Math.PI / 2, // -90 degrees
        Math.PI / 2 // 90 degrees
      );
      expect(message2).toContain('opposite direction');
    });
  });
});
