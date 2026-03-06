# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

A Japanese Kanji learning mobile application built with Expo and React Native. Features include flashcard practice with spaced repetition, kanji browsing, progress tracking, and text-to-speech pronunciation. Targets iOS, Android, and Web platforms.

**Current Status:** Milestone 6 Complete - Flashcard Practice Mode with SRS, Dataset expanded to 25 kanji

**Tech Stack:**
- Expo ~55.0.5
- React Native 0.83.2
- React 19.2.0
- TypeScript 5.9.2 (strict mode enabled)
- React Navigation v7 (bottom tabs + stack navigators)
- React Native Paper v5 (Material Design 3 UI)
- Zustand (state management)
- AsyncStorage (local persistence)

**Bundle Identifiers:**
- iOS/Android: `com.simple.mobile`

## Development Commands

```bash
# Start development server (shows QR code for device testing)
npx expo start

# Start with tunnel mode (for network restrictions or cross-network testing)
npx expo start --tunnel

# Platform-specific launches
npx expo start --ios        # iOS Simulator (requires Xcode)
npx expo start --android    # Android Emulator (requires Android Studio)
npx expo start --web        # Web browser

# Clear Metro bundler cache
npx expo start --clear

# Stop Expo server
pkill -f "expo start"
```

**Interactive Development Mode:**
- Press `i` to open iOS simulator
- Press `a` to open Android emulator
- Press `w` to open web browser
- Scan QR code with Camera (iOS) or Expo Go app (Android) for physical device testing

## Architecture

**Entry Points:**
- `index.ts` - Registers the root component via `registerRootComponent()`
- `App.tsx` - Root navigation container with React Navigation and Paper theme provider

**Configuration:**
- `app.json` - Expo configuration for all platforms (avoid adding `updates` config for local dev)
- `tsconfig.json` - Extends Expo's base config with strict mode
- `babel.config.js` - **Required** - Uses `babel-preset-expo` + `react-native-reanimated/plugin`

**Application Structure:**
- **Navigation**: Bottom tabs (Home, Practice, Progress, Settings) + stack navigators
- **State Management**: Zustand stores (kanjiStore, progressStore, practiceStore)
- **Data Layer**: AsyncStorage for persistence, embedded kanji dataset (25 characters)
- **Key Features**:
  - Kanji browsing and detail views with TTS pronunciation
  - Flashcard practice with SM-2 spaced repetition algorithm
  - Progress tracking with recognition scores
  - Haptic feedback for interactions

**Project Structure:**
```
src/
├── components/       # Reusable UI components (KanjiCard, FlashcardComponent)
├── data/            # Sample kanji data (25 characters)
├── navigation/      # React Navigation setup (tabs, stacks, types)
├── screens/         # Screen components (Home, Practice, Progress, Settings)
├── services/        # Business logic (SRS, TTS, Storage, Haptics)
├── store/           # Zustand state management
├── theme/           # React Native Paper theme configuration
└── types/           # TypeScript type definitions
```

## Required Dependencies

The project requires `babel-preset-expo` as a dev dependency:
```bash
npm install --save-dev babel-preset-expo
```

The `babel.config.js` must be present in the root directory with the following configuration:
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'], // Must be last
  };
};
```

**IMPORTANT:** The `react-native-reanimated/plugin` must be the last item in the plugins array for animations to work correctly.

## Common Issues

**"Something went wrong" or "Failed to download remote update" on Device:**
- Remove any `updates` configuration from `app.json` during local development
- Use tunnel mode: `npx expo start --tunnel`
- Clear Expo Go cache: Device Settings → Apps → Expo Go → Clear Cache
- Reload app: Shake device → Select "Reload"

**Red screen with Babel errors:**
- Ensure `babel-preset-expo` is installed: `npm install --save-dev babel-preset-expo`
- Verify `babel.config.js` exists in project root
- Restart with cleared cache: `npx expo start --clear`

**Port Already in Use:**
```bash
lsof -ti:8081 | xargs kill -9
```

**Watchman Issues (macOS):**
```bash
brew install watchman
watchman watch-del-all
```

**Node Modules Corruption:**
```bash
rm -rf node_modules && npm install
```

**Network Connection Issues:**
- Use tunnel mode if device and computer are on different networks
- Tunnel mode is slower but more reliable: `npx expo start --tunnel`

## Key Implementation Details

**Spaced Repetition System (SRS):**
- Uses SM-2 algorithm for optimal review scheduling
- Implemented in `src/services/practice/SRSService.ts`
- Tracks easinessFactor, interval, and repetitions per kanji
- Self-rating system: Again (1), Hard (2), Good (3), Easy (4)

**Flashcard Animation:**
- 3D flip animation using React Native Animated API
- Conditional rendering prevents answer flash on card transitions
- Key prop forces remount for clean state on each new card

**Progress Tracking:**
- AsyncStorage persistence via `src/services/storage/StorageService.ts`
- Auto-save after every flashcard rating
- Tracks recognition score (0-100) per kanji
- Study stats: total time, streaks, mastered kanji count

**Haptic Feedback:**
- Context-aware vibration patterns for different ratings
- Double-tap patterns simulate sound effects
- Implemented in `src/services/feedback/HapticService.ts`

**Kanji Data:**
- 25 most common kanji by frequency rank
- Each includes: meanings, on-yomi/kun-yomi readings, romaji, example words, JLPT level
- Located in `src/data/sample-data.ts`

## Prerequisites

- Node.js >= 18
- Expo Go app (for physical device testing)
- Xcode (for iOS development)
- Android Studio (for Android development)
