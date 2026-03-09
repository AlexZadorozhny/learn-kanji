module.exports = {
  preset: 'jest-expo',

  // Transform React Native and Expo packages (critical for RN testing)
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|zustand)',
  ],

  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],

  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**/*',
    '!src/data/**/*',
    // Exclude files that are tested through integration or are wrapper utilities
    '!src/store/**/*', // Stores tested implicitly through screen tests
    '!src/navigation/**/*', // Navigation config doesn't need unit tests
    '!src/services/audio/**/*', // External API wrappers
    '!src/services/feedback/**/*', // External API wrappers
    '!src/services/storage/**/*', // AsyncStorage wrapper
    '!src/components/kanji/StrokeOrderCanvas.tsx', // Complex canvas component
    '!src/components/practice/FlashcardComponent.tsx', // Complex animated component
    // Exclude complex practice screens with heavy state management (tested through integration)
    '!src/screens/practice/FlashcardScreen.tsx',
    '!src/screens/practice/MultipleChoiceScreen.tsx',
    '!src/screens/practice/ContextPracticeScreen.tsx',
    '!src/screens/practice/StrokeOrderScreen.tsx',
  ],

  testMatch: [
    '**/__tests__/**/*.(test|spec).(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)',
  ],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
};
