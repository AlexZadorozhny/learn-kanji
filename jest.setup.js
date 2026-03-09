import '@testing-library/jest-native/extend-expect';

// Mock expo-speech (used by TTSService)
jest.mock('expo-speech', () => ({
  speak: jest.fn(() => Promise.resolve()),
  stop: jest.fn(() => Promise.resolve()),
  getAvailableVoicesAsync: jest.fn(() => Promise.resolve([{ language: 'ja-JP' }])),
}));

// Mock expo-haptics (used by HapticService)
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// Mock expo-av (used by SoundService)
jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(() => Promise.resolve({
        sound: {
          playAsync: jest.fn(),
          unloadAsync: jest.fn(),
        },
      })),
    },
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Mock react-native-svg (for stroke order components)
jest.mock('react-native-svg', () => {
  const React = require('react');
  return {
    Svg: ({ children, ...props }) => React.createElement('Svg', props, children),
    Path: (props) => React.createElement('Path', props),
    G: ({ children, ...props }) => React.createElement('G', props, children),
    Circle: (props) => React.createElement('Circle', props),
    Polygon: (props) => React.createElement('Polygon', props),
  };
});

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
