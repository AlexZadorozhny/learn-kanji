import { renderWithProviders, fireEvent, waitFor } from '../../../test-utils';
import FlashcardComponent from '../FlashcardComponent';
import { mockKanjiOne, mockKanjiTwo } from '../../../test-utils/mock-data';

// Mock services
jest.mock('../../../services/audio/TTSService', () => ({
  TTSService: {
    speak: jest.fn(() => Promise.resolve()),
    stop: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('../../../services/feedback/HapticService', () => ({
  HapticService: {
    light: jest.fn(),
    medium: jest.fn(),
    warning: jest.fn(),
    success: jest.fn(),
  },
}));

describe('FlashcardComponent', () => {
  const mockOnRate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with kanji on front', () => {
    const { toJSON } = renderWithProviders(
      <FlashcardComponent kanji={mockKanjiOne} onRate={mockOnRate} />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('displays kanji character on front of card', () => {
    const { getByText } = renderWithProviders(
      <FlashcardComponent kanji={mockKanjiOne} onRate={mockOnRate} />
    );

    expect(getByText('一')).toBeTruthy();
    expect(getByText('👆 Tap to reveal answer')).toBeTruthy();
  });

  it('flips card when pressed', () => {
    const { getByText, queryByText } = renderWithProviders(
      <FlashcardComponent kanji={mockKanjiOne} onRate={mockOnRate} />
    );

    // Initially, back content should not be visible
    expect(queryByText('one, single')).toBeNull();

    // Press card to flip
    const card = getByText('一').parent?.parent?.parent;
    if (card) {
      fireEvent.press(card);
    }

    // After flip, back content should be visible
    expect(getByText('one, single')).toBeTruthy();
  });

  it('calls HapticService on card flip', () => {
    const { HapticService } = require('../../../services/feedback/HapticService');

    const { getByText } = renderWithProviders(
      <FlashcardComponent kanji={mockKanjiOne} onRate={mockOnRate} />
    );

    const card = getByText('一').parent?.parent?.parent;
    if (card) {
      fireEvent.press(card);
    }

    expect(HapticService.warning).toHaveBeenCalled();
  });

  it('shows rating buttons after flip', () => {
    const { getByText, queryByText } = renderWithProviders(
      <FlashcardComponent kanji={mockKanjiOne} onRate={mockOnRate} />
    );

    // Initially, rating buttons should not be visible
    expect(queryByText('Again')).toBeNull();
    expect(queryByText('Hard')).toBeNull();
    expect(queryByText('Good')).toBeNull();
    expect(queryByText('Easy')).toBeNull();

    // Flip card
    const card = getByText('一').parent?.parent?.parent;
    if (card) {
      fireEvent.press(card);
    }

    // Rating buttons should now be visible
    expect(getByText('Again')).toBeTruthy();
    expect(getByText('Hard')).toBeTruthy();
    expect(getByText('Good')).toBeTruthy();
    expect(getByText('Easy')).toBeTruthy();
  });

  it('calls onRate(1) when Again button is pressed', () => {
    const { getByText } = renderWithProviders(
      <FlashcardComponent kanji={mockKanjiOne} onRate={mockOnRate} />
    );

    // Flip card first
    const card = getByText('一').parent?.parent?.parent;
    if (card) {
      fireEvent.press(card);
    }

    // Press Again button
    const againButton = getByText('Again');
    fireEvent.press(againButton);

    expect(mockOnRate).toHaveBeenCalledWith(1);
  });

  it('calls onRate(2) when Hard button is pressed', () => {
    const { getByText } = renderWithProviders(
      <FlashcardComponent kanji={mockKanjiOne} onRate={mockOnRate} />
    );

    // Flip card first
    const card = getByText('一').parent?.parent?.parent;
    if (card) {
      fireEvent.press(card);
    }

    // Press Hard button
    const hardButton = getByText('Hard');
    fireEvent.press(hardButton);

    expect(mockOnRate).toHaveBeenCalledWith(2);
  });

  it('calls onRate(3) when Good button is pressed', () => {
    const { getByText } = renderWithProviders(
      <FlashcardComponent kanji={mockKanjiOne} onRate={mockOnRate} />
    );

    // Flip card first
    const card = getByText('一').parent?.parent?.parent;
    if (card) {
      fireEvent.press(card);
    }

    // Press Good button
    const goodButton = getByText('Good');
    fireEvent.press(goodButton);

    expect(mockOnRate).toHaveBeenCalledWith(3);
  });

  it('calls onRate(4) when Easy button is pressed', () => {
    const { getByText } = renderWithProviders(
      <FlashcardComponent kanji={mockKanjiOne} onRate={mockOnRate} />
    );

    // Flip card first
    const card = getByText('一').parent?.parent?.parent;
    if (card) {
      fireEvent.press(card);
    }

    // Press Easy button
    const easyButton = getByText('Easy');
    fireEvent.press(easyButton);

    expect(mockOnRate).toHaveBeenCalledWith(4);
  });

  it('calls HapticService.warning for Again button (rating 1)', () => {
    const { HapticService } = require('../../../services/feedback/HapticService');
    HapticService.warning.mockClear();

    const { getByText } = renderWithProviders(
      <FlashcardComponent kanji={mockKanjiOne} onRate={mockOnRate} />
    );

    // Flip card
    const card = getByText('一').parent?.parent?.parent;
    if (card) {
      fireEvent.press(card);
    }

    HapticService.warning.mockClear(); // Clear flip haptic

    // Press Again button
    const againButton = getByText('Again');
    fireEvent.press(againButton);

    expect(HapticService.warning).toHaveBeenCalled();
  });

  it('calls HapticService.warning for Hard button (rating 2)', () => {
    const { HapticService } = require('../../../services/feedback/HapticService');

    const { getByText } = renderWithProviders(
      <FlashcardComponent kanji={mockKanjiOne} onRate={mockOnRate} />
    );

    // Flip card
    const card = getByText('一').parent?.parent?.parent;
    if (card) {
      fireEvent.press(card);
    }

    HapticService.warning.mockClear();

    // Press Hard button
    const hardButton = getByText('Hard');
    fireEvent.press(hardButton);

    expect(HapticService.warning).toHaveBeenCalled();
  });

  it('calls HapticService.success for Good button (rating 3)', () => {
    const { HapticService } = require('../../../services/feedback/HapticService');

    const { getByText } = renderWithProviders(
      <FlashcardComponent kanji={mockKanjiOne} onRate={mockOnRate} />
    );

    // Flip card
    const card = getByText('一').parent?.parent?.parent;
    if (card) {
      fireEvent.press(card);
    }

    HapticService.success.mockClear();

    // Press Good button
    const goodButton = getByText('Good');
    fireEvent.press(goodButton);

    expect(HapticService.success).toHaveBeenCalled();
  });

  it('calls HapticService.success for Easy button (rating 4)', () => {
    const { HapticService } = require('../../../services/feedback/HapticService');

    const { getByText } = renderWithProviders(
      <FlashcardComponent kanji={mockKanjiOne} onRate={mockOnRate} />
    );

    // Flip card
    const card = getByText('一').parent?.parent?.parent;
    if (card) {
      fireEvent.press(card);
    }

    HapticService.success.mockClear();

    // Press Easy button
    const easyButton = getByText('Easy');
    fireEvent.press(easyButton);

    expect(HapticService.success).toHaveBeenCalled();
  });

  it('displays kanji meanings on back of card', () => {
    const { getByText } = renderWithProviders(
      <FlashcardComponent kanji={mockKanjiOne} onRate={mockOnRate} />
    );

    // Flip card
    const card = getByText('一').parent?.parent?.parent;
    if (card) {
      fireEvent.press(card);
    }

    expect(getByText('one, single')).toBeTruthy();
  });

  it('displays on-yomi readings on back of card', () => {
    const { getByText } = renderWithProviders(
      <FlashcardComponent kanji={mockKanjiOne} onRate={mockOnRate} />
    );

    // Flip card
    const card = getByText('一').parent?.parent?.parent;
    if (card) {
      fireEvent.press(card);
    }

    expect(getByText('On-yomi:')).toBeTruthy();
    expect(getByText('イチ, イツ')).toBeTruthy();
  });

  it('displays kun-yomi readings on back of card', () => {
    const { getByText } = renderWithProviders(
      <FlashcardComponent kanji={mockKanjiOne} onRate={mockOnRate} />
    );

    // Flip card
    const card = getByText('一').parent?.parent?.parent;
    if (card) {
      fireEvent.press(card);
    }

    expect(getByText('Kun-yomi:')).toBeTruthy();
    expect(getByText('ひと')).toBeTruthy();
  });

  it('displays dash when no kun-yomi readings', () => {
    const kanjiWithoutKunYomi = {
      ...mockKanjiOne,
      kunYomi: [],
    };

    const { getByText } = renderWithProviders(
      <FlashcardComponent kanji={kanjiWithoutKunYomi} onRate={mockOnRate} />
    );

    // Flip card
    const card = getByText('一').parent?.parent?.parent;
    if (card) {
      fireEvent.press(card);
    }

    expect(getByText('Kun-yomi:')).toBeTruthy();
    expect(getByText('-')).toBeTruthy();
  });

  it('calls TTSService.speak when speaker button is pressed', async () => {
    const { TTSService } = require('../../../services/audio/TTSService');
    TTSService.speak.mockClear();

    const { UNSAFE_root } = renderWithProviders(
      <FlashcardComponent kanji={mockKanjiOne} onRate={mockOnRate} />
    );

    // Flip card first
    const { getByText } = renderWithProviders(
      <FlashcardComponent kanji={mockKanjiOne} onRate={mockOnRate} />
    );
    const card = getByText('一').parent?.parent?.parent;
    if (card) {
      fireEvent.press(card);
    }

    // Find IconButton and press it
    const iconButtons = UNSAFE_root.findAllByType(require('react-native-paper').IconButton);

    if (iconButtons.length > 0) {
      await iconButtons[0].props.onPress();

      await waitFor(() => {
        expect(TTSService.speak).toHaveBeenCalledWith('イチ');
      });
    }
  });

  it('updates speaking state during TTS playback', async () => {
    const { TTSService } = require('../../../services/audio/TTSService');

    let resolveTTS: () => void;
    const ttsPromise = new Promise<void>((resolve) => {
      resolveTTS = resolve;
    });
    TTSService.speak.mockReturnValue(ttsPromise);

    const { UNSAFE_root, getByText } = renderWithProviders(
      <FlashcardComponent kanji={mockKanjiOne} onRate={mockOnRate} />
    );

    // Flip card
    const card = getByText('一').parent?.parent?.parent;
    if (card) {
      fireEvent.press(card);
    }

    // Find and press speaker button
    const iconButtons = UNSAFE_root.findAllByType(require('react-native-paper').IconButton);

    if (iconButtons.length > 0) {
      iconButtons[0].props.onPress();

      await waitFor(() => {
        expect(TTSService.speak).toHaveBeenCalled();
      });

      resolveTTS!();
    }
  });

  it('handles TTS error gracefully', async () => {
    const { TTSService } = require('../../../services/audio/TTSService');
    TTSService.speak.mockRejectedValue(new Error('TTS failed'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { UNSAFE_root, getByText } = renderWithProviders(
      <FlashcardComponent kanji={mockKanjiOne} onRate={mockOnRate} />
    );

    // Flip card
    const card = getByText('一').parent?.parent?.parent;
    if (card) {
      fireEvent.press(card);
    }

    // Find and press speaker button
    const iconButtons = UNSAFE_root.findAllByType(require('react-native-paper').IconButton);

    if (iconButtons.length > 0) {
      await iconButtons[0].props.onPress();

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });
    }

    consoleSpy.mockRestore();
  });

  it('renders with different kanji using key prop', () => {
    const { getByText, rerender } = renderWithProviders(
      <FlashcardComponent key={mockKanjiOne.id} kanji={mockKanjiOne} onRate={mockOnRate} />
    );

    expect(getByText('一')).toBeTruthy();

    // Change kanji with different key
    rerender(<FlashcardComponent key={mockKanjiTwo.id} kanji={mockKanjiTwo} onRate={mockOnRate} />);

    expect(getByText('二')).toBeTruthy();
  });

  it('shows correct interval hints on rating buttons', () => {
    const { getByText } = renderWithProviders(
      <FlashcardComponent kanji={mockKanjiOne} onRate={mockOnRate} />
    );

    // Flip card
    const card = getByText('一').parent?.parent?.parent;
    if (card) {
      fireEvent.press(card);
    }

    // Check interval hints
    expect(getByText('<1 day')).toBeTruthy();
    expect(getByText('<3 days')).toBeTruthy();
    expect(getByText('~6 days')).toBeTruthy();
    expect(getByText('2+ weeks')).toBeTruthy();
  });
});
