# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

A Japanese Kanji learning mobile application built with Expo and React Native. Features include flashcard practice with spaced repetition, multiple choice quizzes, context word practice, stroke order writing, dark theme support, kanji browsing, progress tracking, and text-to-speech pronunciation. Targets iOS, Android, and Web platforms.

**Current Status:** Milestone 9 Complete - Dark Theme implemented with Light/Dark/Auto modes, All 4 practice modes complete, Dataset: 25 kanji (5 with stroke data)

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
- **Data Layer**: AsyncStorage for persistence, embedded kanji dataset (25 characters, 5 with stroke data)
- **Key Features**:
  - Dark theme support (Light/Dark/Auto modes with full UI coverage)
  - Kanji browsing and detail views with TTS pronunciation
  - Flashcard practice with SM-2 spaced repetition algorithm
  - Multiple choice quiz with 3 question types (kanji→meaning, meaning→kanji, kanji→reading)
  - Context practice through example words with TTS
  - Stroke order practice with interactive canvas and validation
  - Progress tracking with 4 score types (recognition, reading, writing, context)
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

**Multiple Choice Quiz:**
- Three question types generated randomly per kanji
- QuizService generates intelligent distractors (similar stroke count, actual readings/meanings)
- Visual feedback with color coding (green = correct, red = incorrect)
- Auto-advance after 1.5 seconds with haptic feedback
- Updates readingScore (0-100) per kanji
- Implemented in `src/services/practice/QuizService.ts`

**Context Practice:**
- Shows 3 example words per kanji demonstrating real usage
- TTS pronunciation on tap for any word
- Binary scoring: "Got It!" vs "Need Practice"
- Updates contextScore (0-100) per kanji
- Max 10 kanji per session
- Implemented in `src/screens/practice/ContextPracticeScreen.tsx`

**Kanji Data:**
- 25 most common kanji by frequency rank
- First 5 kanji include stroke order data (SVG paths): 一, 二, 三, 人, 日
- Each includes: meanings, on-yomi/kun-yomi readings, romaji, example words, JLPT level
- Located in `src/data/sample-data.ts`

**Stroke Order Practice:**
- Uses React Native SVG + PanResponder (simplified approach, no Skia dependency)
- Coordinate scaling: screen touch events → 100x100 SVG viewBox
- Validation: bounding box approach (50% overlap threshold, ±25 unit tolerance)
- Visual feedback: guide strokes (dashed gray), user strokes (purple), incorrect (red for 2s)
- **Critical pattern**: Uses refs (`currentDrawingRef`, `currentStrokeIndexRef`) to avoid React state closure bugs in gesture handlers
- Session management: max 5 kanji, tracks correct/total strokes
- Updates writingScore (0-100) per kanji
- Implemented in `src/components/kanji/StrokeOrderCanvas.tsx` (434 lines) and `src/screens/practice/StrokeOrderScreen.tsx`

**Dark Theme:**
- Three modes: Light, Dark, and Auto (follows system preference)
- Persistent setting stored in AsyncStorage via settingsStore
- Full coverage: all screens, navigation bars (top/bottom), and components
- Material Design 3 color system with proper contrast ratios
- Dynamic theme colors applied to:
  - Background (`theme.colors.background`)
  - Surfaces/Cards (`theme.colors.surface`)
  - Text colors (`theme.colors.onSurface`, `theme.colors.onSurfaceVariant`)
  - Navigation bars and headers
- Semantic colors preserved (green/red for correct/incorrect, etc.)
- Implemented in `src/store/settingsStore.ts`, `src/theme/theme.ts`, and navigation files

## Prerequisites

- Node.js >= 18
- Expo Go app (for physical device testing)
- Xcode (for iOS development)
- Android Studio (for Android development)
