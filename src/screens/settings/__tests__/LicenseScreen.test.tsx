import React from 'react';
import { Linking } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import LicenseScreen from '../LicenseScreen';

// Helper to render with Paper theme
const renderWithPaper = (component: React.ReactElement) => {
  return render(<PaperProvider>{component}</PaperProvider>);
};

describe('LicenseScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Linking.openURL for each test
    jest.spyOn(Linking, 'openURL').mockImplementation(() => Promise.resolve());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders correctly', () => {
    const { toJSON } = renderWithPaper(<LicenseScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('displays KanjiVG license information', () => {
    const { getByText } = renderWithPaper(<LicenseScreen />);

    expect(getByText('KanjiVG')).toBeTruthy();
    expect(getByText('© Ulrich Apel')).toBeTruthy();
    expect(getByText('Creative Commons Attribution-Share Alike 3.0 Unported (CC BY-SA 3.0)')).toBeTruthy();
  });

  it('displays modification information', () => {
    const { getByText } = renderWithPaper(<LicenseScreen />);

    expect(getByText('Modifications')).toBeTruthy();
    expect(getByText(/normalized from 109×109 to 100×100/)).toBeTruthy();
  });

  it('displays coverage information', () => {
    const { getByText } = renderWithPaper(<LicenseScreen />);

    expect(getByText('Coverage')).toBeTruthy();
    expect(getByText(/6,355\+ Japanese kanji/)).toBeTruthy();
  });

  it('opens KanjiVG website when button is pressed', () => {
    const { getByText } = renderWithPaper(<LicenseScreen />);

    const button = getByText('Visit KanjiVG Project');
    fireEvent.press(button);

    expect(Linking.openURL).toHaveBeenCalledWith('https://kanjivg.tagaini.net');
  });

  it('opens CC BY-SA license when button is pressed', () => {
    const { getByText } = renderWithPaper(<LicenseScreen />);

    const button = getByText('View CC BY-SA 3.0 License');
    fireEvent.press(button);

    expect(Linking.openURL).toHaveBeenCalledWith('https://creativecommons.org/licenses/by-sa/3.0/');
  });

  it('handles URL opening errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (Linking.openURL as jest.Mock).mockRejectedValueOnce(new Error('Failed to open URL'));

    const { getByText } = renderWithPaper(<LicenseScreen />);

    const button = getByText('Visit KanjiVG Project');
    fireEvent.press(button);

    // Wait for promise rejection
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(consoleSpy).toHaveBeenCalledWith('Failed to open URL:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('displays application license section', () => {
    const { getByText } = renderWithPaper(<LicenseScreen />);

    expect(getByText('Simple Mobile')).toBeTruthy();
    expect(getByText(/derivative works must also be shared/)).toBeTruthy();
  });
});
