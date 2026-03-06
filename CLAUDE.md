# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

A minimal React Native mobile application built with Expo. Targets iOS, Android, and Web platforms.

**Tech Stack:**
- Expo ~55.0.5
- React Native 0.83.2
- React 19.2.0
- TypeScript 5.9.2 (strict mode enabled)

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
- `App.tsx` - Main application component with inline styles

**Configuration:**
- `app.json` - Expo configuration for all platforms (avoid adding `updates` config for local dev)
- `tsconfig.json` - Extends Expo's base config with strict mode
- `babel.config.js` - **Required** - Uses `babel-preset-expo` for code transpilation

**Current Structure:**
Single-file app architecture. All UI logic in `App.tsx` using React Native StyleSheet for styling.

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
  };
};
```

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

## Prerequisites

- Node.js >= 18
- Expo Go app (for physical device testing)
- Xcode (for iOS development)
- Android Studio (for Android development)
