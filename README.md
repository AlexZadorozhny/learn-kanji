# Japanese Kanji Learning App

A React Native mobile application built with Expo for learning Japanese Kanji characters through interactive practice modes.

## Current Status: Stroke Order Practice Complete ✅

- ✅ **Milestone 1**: Basic Navigation (4 tabs: Home, Practice, Progress, Settings)
- ✅ **Milestone 2**: Data Display (Kanji list with 25 sample characters)
- ✅ **Milestone 3**: Navigation Flow (Detail screen with full kanji information)
- ✅ **Milestone 4**: Audio/TTS Pronunciation (Japanese text-to-speech for all readings)
- ✅ **Milestone 5**: Data Persistence (AsyncStorage integration with auto-save)
- ✅ **Milestone 6**: Flashcard Practice Mode (SRS scheduling with flip animations)
- ✅ **Milestone 7**: Quiz & Context Practice Modes (Multiple choice questions and word practice)
- ✅ **Milestone 8**: Stroke Order Practice (Interactive drawing canvas with validation)
- ✅ **Dataset Expansion**: Expanded from 5 to 25 most common kanji (first 5 with stroke data)
- 🚧 **Next**: Polish UI, Results Screen improvements, Settings

## Prerequisites
- Node.js >= 18
- npm or yarn
- Expo Go app (for physical device testing)

## Installation

```bash
npm install
```

**Required Configuration:**

The project includes a `babel.config.js` with the reanimated plugin:

```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'], // Must be last
  };
};
```

All dependencies are tracked in `package.json` and will be installed automatically.

## Running the App

### Development Mode (shows QR code)
```bash
npx expo start
```

Then:
- **iOS**: Scan QR code with Camera app
- **Android**: Scan QR code with Expo Go app
- **Press 'i'**: Open iOS simulator (requires Xcode)
- **Press 'a'**: Open Android emulator (requires Android Studio)
- **Press 'w'**: Open in web browser

### Specific Platforms
```bash
npx expo start --ios      # iOS Simulator
npx expo start --android  # Android Emulator
npx expo start --web      # Web Browser
```

### Tunnel Mode (for network issues)
```bash
npx expo start --tunnel   # Creates public URL for cross-network testing
```

Use tunnel mode when:
- Device and computer are on different networks
- Experiencing connection issues with local network
- Working with restrictive network configurations

## Features

### Implemented
- 📱 **Bottom Tab Navigation**: Home, Practice, Progress, Settings
- 📝 **Kanji List**: Browse 25 most common kanji characters by frequency
- 🔍 **Detail View**: View comprehensive kanji information:
  - Character display with stroke count
  - English meanings
  - On-yomi (音読み) readings with romaji
  - Kun-yomi (訓読み) readings with romaji
  - Example words with readings and translations
  - JLPT level indicators
- 🔊 **Audio Pronunciation**: Text-to-speech for kanji readings:
  - Japanese TTS (ja-JP) using expo-speech
  - Tap speaker icons to hear on-yomi readings
  - Tap speaker icons to hear kun-yomi readings
  - Tap speaker icons to hear example word pronunciations
  - Optimized speech rate (0.75x) for learning
- 💾 **Data Persistence**: Local storage with AsyncStorage:
  - Auto-save progress after every update
  - Persist user progress across app sessions
  - Store study statistics (study time, streaks, mastered kanji)
  - Progress screen displays real-time statistics
  - Clear data functionality for testing
- 🎴 **Flashcard Practice Mode**: SRS-based recognition practice:
  - Smooth 3D flip animation with card interactions
  - SM-2 spaced repetition algorithm for optimal review scheduling
  - Self-rating system: Again, Hard, Good, Easy
  - Review queue shows due and new cards
  - Session results with accuracy and time statistics
  - Recognition score tracking (0-100)
  - Haptic feedback for card flips and button presses
  - Context-aware vibration patterns for different ratings
  - Auto-save progress after each card review
  - Progress persistence across app sessions
- ❓ **Multiple Choice Quiz Mode**: Test knowledge with randomized questions:
  - Three question types: kanji→meaning, meaning→kanji, kanji→reading
  - 4-option questions with intelligent distractors
  - Visual feedback (green for correct, red for incorrect)
  - Auto-advance after 1.5 seconds
  - Reading score tracking (0-100)
  - QuizService generates randomized questions
- 📚 **Context Practice Mode**: Learn kanji through example words:
  - Display 3 example words per kanji showing real usage
  - Tap words to hear TTS pronunciation
  - Show/hide translations with reveal button
  - Binary scoring: "Got It!" or "Need Practice"
  - Context score tracking (0-100)
  - Max 10 kanji per session
- ✍️ **Stroke Order Practice**: Interactive drawing canvas:
  - Draw each stroke in correct order with real-time validation
  - Visual feedback with guide strokes (toggle on/off)
  - Simplified bounding box validation (50% threshold, 25 unit tolerance)
  - Incorrect strokes shown in red for 2 seconds
  - Undo and clear functionality
  - Writing score tracking (0-100)
  - Supports multi-stroke kanji (一, 二, 三, 人, 日)
  - Session management for up to 5 kanji
  - Uses React Native SVG and PanResponder for gesture handling

### Planned
- 🔥 **Streak System**: Daily study tracking
- 📊 **Expanded Dataset**: Add more kanji with stroke order data
- 🎯 **Results Screen**: Enhanced session summary with detailed statistics

## Project Structure
```
simple-mobile/
├── App.tsx                    # Root component with navigation
├── index.ts                   # App entry point
├── app.json                   # Expo configuration
├── babel.config.js            # Babel configuration
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript configuration
├── assets/                    # Images and fonts
└── src/
    ├── components/
    │   ├── kanji/
    │   │   ├── KanjiCard.tsx  # Kanji card component
    │   │   └── StrokeOrderCanvas.tsx  # Interactive drawing canvas
    │   └── practice/
    │       └── FlashcardComponent.tsx  # Flashcard with flip animation
    ├── data/
    │   └── sample-data.ts     # Sample kanji data (25 characters)
    ├── navigation/
    │   ├── RootNavigator.tsx
    │   ├── MainTabNavigator.tsx
    │   ├── HomeStackNavigator.tsx
    │   ├── PracticeStackNavigator.tsx
    │   └── types.ts           # Navigation type definitions
    ├── screens/
    │   ├── home/
    │   │   └── HomeScreen.tsx
    │   ├── practice/
    │   │   ├── PracticeModeScreen.tsx
    │   │   ├── FlashcardScreen.tsx
    │   │   ├── StrokeOrderScreen.tsx
    │   │   ├── MultipleChoiceScreen.tsx
    │   │   ├── ContextPracticeScreen.tsx
    │   │   └── ResultsScreen.tsx
    │   ├── progress/
    │   │   ├── ProgressScreen.tsx
    │   │   └── KanjiDetailScreen.tsx
    │   └── settings/
    │       └── SettingsScreen.tsx
    ├── services/
    │   ├── audio/
    │   │   └── TTSService.ts  # Text-to-speech wrapper (expo-speech)
    │   ├── storage/
    │   │   └── StorageService.ts  # AsyncStorage wrapper for persistence
    │   ├── practice/
    │   │   ├── SRSService.ts  # Spaced Repetition System (SM-2 algorithm)
    │   │   └── QuizService.ts  # Quiz question generation with distractors
    │   └── feedback/
    │       ├── HapticService.ts  # Haptic feedback wrapper
    │       └── SoundService.ts   # Sound effects (placeholder)
    ├── store/
    │   ├── kanjiStore.ts      # Zustand: kanji data state
    │   ├── progressStore.ts   # Zustand: progress tracking with persistence
    │   └── practiceStore.ts   # Zustand: practice session management
    ├── theme/
    │   ├── theme.ts           # React Native Paper theme
    │   ├── colors.ts
    │   └── typography.ts
    └── types/
        ├── kanji.ts           # Kanji type definitions
        ├── progress.ts        # Progress type definitions
        └── practice.ts        # Practice type definitions
```

## Technologies

### Core
- **React Native** 0.83.2
- **Expo** ~55.0.5
- **TypeScript** 5.9.2 (strict mode)
- **React** 19.2.0

### Navigation
- **React Navigation** v7
  - `@react-navigation/native`
  - `@react-navigation/native-stack`
  - `@react-navigation/bottom-tabs`

### UI Framework
- **React Native Paper** v5 (Material Design 3)
- **Expo Vector Icons**

### State Management
- **Zustand** - Lightweight state management
- **AsyncStorage** - Local data persistence

### Utilities
- **expo-speech** - Text-to-speech for pronunciation
- **expo-haptics** - Haptic feedback for tactile interactions
- **expo-av** - Audio playback for sound effects
- **react-native-svg** - SVG rendering
- **date-fns** - Date utilities
- **react-native-reanimated** - Smooth animations
- **react-native-gesture-handler** - Touch gestures

## Data Model

### Kanji Character Structure
Each kanji includes:
- **Character**: The kanji itself (e.g., "一")
- **Meanings**: English translations
- **On-yomi readings**: Chinese-derived pronunciations (in katakana)
- **Kun-yomi readings**: Native Japanese pronunciations (in hiragana)
- **Stroke count**: Number of strokes to write the character
- **Example words**: Real Japanese words using the kanji
- **JLPT level**: Japanese Language Proficiency Test level (N5-N1)
- **Grade level**: Japanese school grade (1-6)

### Sample Data
Currently includes 25 most common kanji by frequency rank:
- **Numbers**: 一 (one), 二 (two), 三 (three)
- **People & Life**: 人 (person), 生 (life), 子 (child)
- **Time**: 日 (day/sun), 年 (year), 時 (time), 月 (month), 分 (minute), 間 (interval)
- **Places**: 国 (country), 上 (up), 下 (down), 中 (middle), 前 (front), 後 (back)
- **Actions**: 出 (exit), 行 (go), 見 (see), 学 (study)
- **Things**: 本 (book), 手 (hand), 大 (big)

## Development Tips

**Hot Reload:** Changes to code automatically refresh the app

**Clear Cache:**
```bash
npx expo start --clear
```

**Reset Project:**
```bash
rm -rf node_modules
npm install
```

## Troubleshooting

### "Something went wrong" Blue/Red Screen on Device

**If you see "Failed to download remote update":**
1. Ensure `app.json` doesn't have an `updates` configuration during development
2. Use tunnel mode: `npx expo start --tunnel`
3. Clear Expo Go cache on device:
   - Android: Settings → Apps → Expo Go → Storage → Clear Cache
4. Reload the app:
   - Shake device → Select "Reload"
   - Or close and reopen the app

**If you see Babel/Transform errors:**
1. Install babel preset: `npm install --save-dev babel-preset-expo`
2. Ensure `babel.config.js` exists in project root
3. Restart with cache cleared: `npx expo start --clear`

### Port Already in Use
```bash
lsof -ti:8081 | xargs kill -9
npx expo start
```

### Metro Bundler Cache Issues
```bash
npx expo start --clear
```

### Node Modules Corruption
```bash
rm -rf node_modules
npm install
```

### Watchman Issues (macOS)
```bash
brew install watchman
watchman watch-del-all
```

### Connection Issues Between Device and Computer

**Symptoms:**
- "Failed to download remote update" error
- "Cannot connect to Metro" error
- Expo Go can't reach the dev server

**Solutions:**

1. **Ensure same WiFi network**: Computer and device must be on the same WiFi

2. **Clear Expo Go cache** (Android):
   ```
   Settings → Apps → Expo Go → Storage → Clear Cache → Force Stop
   ```

3. **Remove old cached projects** in Expo Go:
   - Tap three dots (⋮) → Recently opened
   - Delete any old "simple-mobile" entries

4. **Use tunnel mode** (slower but more reliable):
   ```bash
   npx expo start --tunnel
   ```
   Then manually enter the `exp://...` URL in Expo Go

5. **Get tunnel URL programmatically**:
   ```bash
   curl -s http://localhost:4040/api/tunnels | grep public_url
   ```

6. **Manual URL entry**:
   - Local network: `exp://YOUR_IP:8081` (e.g., `exp://192.168.0.62:8081`)
   - Tunnel: Use the `exp://...exp.direct:80` URL from tunnel output

7. **If all else fails**: Uninstall and reinstall Expo Go app

## Development Workflow

### Testing on Android
1. Start Expo server: `npx expo start` or `npx expo start --tunnel`
2. Open Expo Go on Android device
3. Scan QR code or enter URL manually
4. App reloads automatically on code changes

### Git Workflow
```bash
# Check status
git status

# Add all changes
git add -A

# Commit with descriptive message
git commit -m "Your message here"

# View commit history
git log --oneline
```

### Task Management
This project uses a detailed task list for iterative development. View tasks with:
```
/tasks
```

Milestones are verified on Android device after each implementation phase.

## Architecture Decisions

### Why These Technologies?

- **React Navigation**: Industry standard with excellent TypeScript support
- **React Native Paper**: Material Design 3, small bundle size, TypeScript-first
- **Zustand**: Minimal boilerplate (1.5KB), simpler than Redux for this use case
- **AsyncStorage**: Offline-first approach, no backend needed
- **Frequency-based learning**: Most practical kanji learned first

### Design Principles
- **Offline-first**: All data stored locally, no internet required
- **TypeScript strict mode**: Catch errors at compile time
- **Small iterations**: Each milestone is testable on device
- **Mobile-first**: Optimized for Android/iOS, web is secondary

## License

MIT

## Acknowledgments

- Kanji data will be sourced from KanjiVG and KANJIDIC2 (Creative Commons)
- Built with Expo and React Native
- Material Design 3 via React Native Paper
