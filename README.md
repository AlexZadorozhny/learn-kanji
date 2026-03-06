# Simple Mobile - React Native Hello World

A minimal React Native application built with Expo.

## Prerequisites
- Node.js >= 18
- npm or yarn
- Expo Go app (for physical device testing)

## Installation

```bash
npm install
```

**Required Configuration:**

This project requires a `babel.config.js` file in the root directory:

```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
```

Ensure `babel-preset-expo` is installed:
```bash
npm install --save-dev babel-preset-expo
```

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

## Project Structure
```
simple-mobile/
├── App.tsx           # Main application component
├── index.ts          # App entry point (registers root component)
├── app.json          # Expo configuration
├── babel.config.js   # Babel configuration (required)
├── package.json      # Dependencies
├── tsconfig.json     # TypeScript configuration
└── assets/           # Images and fonts
```

## Technologies
- React Native 0.83.2
- Expo ~55.0.5
- TypeScript 5.9.2
- React 19.2.0
- babel-preset-expo (required for transpilation)

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
```bash
# Use tunnel mode for cross-network connectivity
npx expo start --tunnel
```
