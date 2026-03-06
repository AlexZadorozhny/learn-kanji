# Japanese Kanji Learning App

A React Native mobile application built with Expo for learning Japanese Kanji characters through interactive practice modes.

## Current Status: Milestone 5 Complete ✅

- ✅ **Milestone 1**: Basic Navigation (4 tabs: Home, Practice, Progress, Settings)
- ✅ **Milestone 2**: Data Display (Kanji list with 5 sample characters)
- ✅ **Milestone 3**: Navigation Flow (Detail screen with full kanji information)
- ✅ **Milestone 4**: Audio/TTS Pronunciation (Japanese text-to-speech for all readings)
- ✅ **Milestone 5**: Data Persistence (AsyncStorage integration with auto-save)
- 🚧 **Next**: Milestone 6 - Flashcard Practice Mode

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
- 📝 **Kanji List**: Browse 5 sample kanji characters (一、二、三、人、日)
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

### Planned
- ✍️ **Stroke Order Practice**: Interactive drawing canvas
- 📝 **Flashcard Mode**: SRS-based recognition practice
- ❓ **Multiple Choice Quizzes**: Test kanji knowledge
- 📚 **Context Practice**: Learn kanji in real words and phrases
- 📊 **Progress Tracking**: Monitor learning progress with statistics
- 🔥 **Streak System**: Daily study tracking

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
    │   └── kanji/
    │       └── KanjiCard.tsx  # Kanji card component
    ├── data/
    │   └── sample-data.ts     # Sample kanji data (5 characters)
    ├── navigation/
    │   ├── RootNavigator.tsx
    │   ├── MainTabNavigator.tsx
    │   ├── HomeStackNavigator.tsx
    │   └── types.ts           # Navigation type definitions
    ├── screens/
    │   ├── home/
    │   │   └── HomeScreen.tsx
    │   ├── practice/
    │   │   └── PracticeModeScreen.tsx
    │   ├── progress/
    │   │   ├── ProgressScreen.tsx
    │   │   └── KanjiDetailScreen.tsx
    │   └── settings/
    │       └── SettingsScreen.tsx
    ├── services/
    │   ├── audio/
    │   │   └── TTSService.ts  # Text-to-speech wrapper (expo-speech)
    │   └── storage/
    │       └── StorageService.ts  # AsyncStorage wrapper for persistence
    ├── store/
    │   ├── kanjiStore.ts      # Zustand: kanji data state
    │   └── progressStore.ts   # Zustand: progress tracking with persistence
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
Currently includes 5 basic kanji:
- **一** (ichi) - one
- **二** (ni) - two
- **三** (san) - three
- **人** (hito) - person
- **日** (hi) - day/sun

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
