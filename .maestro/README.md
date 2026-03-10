# Maestro E2E Testing

This directory contains end-to-end tests for the Learn Kanji mobile application using [Maestro](https://maestro.mobile.dev).

## Overview

Maestro E2E tests validate critical user journeys across the entire application, complementing the existing 700+ unit tests with real user flow verification.

**Test Coverage:**
- ✅ Flashcard practice with spaced repetition (10 card session)
- ✅ Multiple choice quiz with auto-advance (10 question session)
- ✅ Stroke order practice UI verification
- ✅ Complex cross-tab navigation (Home → Practice → Results → Home)
- ✅ Theme switching (Light/Dark/Auto) with persistence
- ✅ Kanji browsing (list scrolling, detail views, stack management)

## Prerequisites

### 1. Install Maestro CLI

```bash
# Install Maestro
curl -Ls "https://get.maestro.mobile.dev" | bash

# Verify installation
maestro --version
# Should output: 2.3.0 or higher
```

### 2. Setup iOS Simulator or Android Emulator

**iOS (requires macOS with Xcode):**
```bash
# List available simulators
xcrun simctl list devices

# Boot a simulator (replace with your device ID)
xcrun simctl boot <device-id>

# Or use Expo's shortcut
npx expo start
# Press 'i' to open iOS simulator
```

**Android (requires Android Studio):**
```bash
# Start emulator (replace with your AVD name)
emulator -avd <avd-name>

# Or use Expo's shortcut
npx expo start
# Press 'a' to open Android emulator
```

### 3. Start Expo Development Server

```bash
# Start the app
npx expo start

# Wait for app to load in simulator/emulator
# Ensure the app is running before executing tests
```

## Running Tests

### Run All Flows

```bash
# Run all 6 flows on current device
npm run test:e2e

# Platform-specific
npm run test:e2e:ios      # iOS only
npm run test:e2e:android  # Android only
```

### Run Single Flow

```bash
# Run a specific flow
npm run test:e2e:single .maestro/flows/01-flashcard-practice.yaml

# Or use maestro directly
maestro test .maestro/flows/01-flashcard-practice.yaml
```

### Interactive Development Mode

**Highly recommended for test development:**

```bash
npm run maestro:studio

# Opens Maestro Studio - interactive test development environment
# Features:
# - Live device preview
# - Visual element inspector
# - Step-by-step test execution
# - Real-time YAML editing
```

### Debug Mode

```bash
maestro test --debug-output .maestro/flows/01-flashcard-practice.yaml

# Outputs detailed logs for troubleshooting
```

## Test Flow Descriptions

### 1. Flashcard Practice (`01-flashcard-practice.yaml`)

**Duration:** ~30-40 seconds
**Coverage:** SM-2 spaced repetition, flashcard flip animations, rating system

**Flow:**
1. Navigate to Practice tab
2. Tap "Start Flashcards" button
3. Complete 10 flashcards:
   - Flip card to reveal answer
   - Rate each card (Good/Easy)
4. Verify results screen displays
5. Return to practice mode

**Key Validations:**
- Flashcard flip animation works
- Rating buttons appear after flip
- Progress bar updates
- Session completion triggers results screen

### 2. Multiple Choice Quiz (`02-multiple-choice-quiz.yaml`)

**Duration:** ~25-30 seconds
**Coverage:** Quiz generation, answer validation, auto-advance

**Flow:**
1. Navigate to Practice tab
2. Tap "Start Quiz" button
3. Answer 10 questions (tapping first option each time)
4. Wait for auto-advance (1.5s per question)
5. Verify results screen
6. Return to practice mode

**Key Validations:**
- Questions load correctly
- Answer options are tappable
- Auto-advance works after selection
- Feedback colors display (green/red)

### 3. Stroke Order Practice (`03-stroke-order-practice.yaml`)

**Duration:** ~15-20 seconds
**Coverage:** Stroke order UI, canvas loading, navigation

**Flow:**
1. Navigate to Practice tab
2. Tap "Start Stroke Order Practice"
3. Wait for canvas to load (async kanji data)
4. Verify UI elements (Clear button, etc.)
5. Navigate back

**Note:** Actual drawing gestures are not tested due to Maestro limitations. Stroke validation is covered by unit tests (700 tests, 84% coverage).

**Key Validations:**
- Canvas loads without errors
- Control buttons are visible
- Back navigation works

### 4. Cross-Tab Navigation (`04-cross-tab-navigation.yaml`)

**Duration:** ~30-35 seconds
**Coverage:** Complex navigation, stack management, tab resets

**Flow:**
1. Start on Home tab
2. Tap kanji card (日) → detail screen
3. Tap "Practice Stroke Order" → navigates to Practice tab
4. Navigate back → returns to Practice Mode
5. Switch tabs → verify stack resets
6. Test alternate flow: Practice → Home tab reset

**Key Validations:**
- Cross-tab navigation preserves context
- Stack resets work correctly when switching tabs
- Tab bar updates active state
- No stuck screens or navigation loops

### 5. Theme Switching (`05-theme-switching.yaml`)

**Duration:** ~25-30 seconds
**Coverage:** Theme persistence, UI updates, toggle interactions

**Flow:**
1. Navigate to Settings tab
2. Toggle themes: Light → Dark → Auto
3. Test other toggles (notifications, sound, haptics)
4. Switch tabs and return → verify persistence
5. Reset to Auto theme

**Key Validations:**
- Theme buttons are tappable
- UI updates on theme change (hard to verify visually in E2E)
- Theme persists across tab switches
- Toggle switches work correctly

### 6. Kanji Browsing (`06-kanji-browsing.yaml`)

**Duration:** ~30-35 seconds
**Coverage:** List rendering, scrolling, detail views, stack management

**Flow:**
1. Navigate to Home tab
2. Verify kanji list loads
3. Scroll through list
4. Tap multiple kanji cards (日, 人, 一)
5. View detail screens
6. Test stack reset on tab switch

**Key Validations:**
- FlatList renders correctly
- Kanji cards are tappable
- Detail screens load with correct data
- Back navigation works
- Tab resets clear navigation stack

## testID Conventions

All UI elements use a consistent naming convention for reliable element identification:

**Format:** `[screen-name]-[element-type]-[descriptor]`

**Examples:**
- `tab-home` - Home tab button
- `flashcard-rating-good-button` - Good rating button
- `kanji-card-日` - Kanji card for character 日
- `settings-theme-dark-button` - Dark theme button

**Dynamic testIDs:**
- Kanji cards: `kanji-card-${character}` (e.g., `kanji-card-日`)
- Characters: `kanji-character-${character}` (e.g., `kanji-character-日`)

## Debugging Guide

### Common Issues

**1. "App not found" error**
```bash
# Ensure app is running on simulator/emulator
npx expo start
# Press 'i' (iOS) or 'a' (Android)

# Check appId matches app.json
grep "bundleIdentifier\|package" app.json
# Should be: com.learn.kanji
```

**2. "Element not found" error**
```bash
# Use Maestro Studio to inspect elements
maestro studio

# Check if testID exists in component
grep -r "testID=" src/

# Verify element is visible (not behind modal/animation)
```

**3. "Timeout waiting for element" error**
```bash
# Increase wait times in YAML:
- wait: 3000  # Wait longer for async operations

# Or use extendedWaitUntil:
- extendedWaitUntil:
    visible: "Element"
    timeout: 10000
```

**4. Tests fail on Android but pass on iOS**
```bash
# Some UI elements render differently on Android
# Check platform-specific styles in components
# May need conditional testIDs or element selectors
```

### Maestro Studio Tips

1. **Element Inspector:** Click on any element to see its properties (testID, text, accessibility label)
2. **Record Mode:** Record user interactions to generate YAML
3. **Step Through:** Execute flows step-by-step for debugging
4. **Screenshot Mode:** Capture screenshots at each step for documentation

### Logs and Reports

```bash
# Run with detailed output
maestro test --debug-output <flow.yaml>

# Generate HTML report (requires maestro cloud)
maestro test --format html <flow.yaml>

# View logs
tail -f ~/.maestro/logs/maestro.log
```

## Known Limitations

### 1. Stroke Order Drawing
**Limitation:** Complex gesture sequences (drawing strokes) are difficult to automate in Maestro.
**Mitigation:** Flow focuses on UI verification. Stroke validation is covered by 135+ unit tests.

### 2. TTS Verification
**Limitation:** Cannot verify audio playback (Text-to-Speech).
**Mitigation:** Tests verify button interactions; actual audio is user-verified.

### 3. Haptic Feedback
**Limitation:** Cannot verify vibration/haptic feedback.
**Mitigation:** Tests verify toggle state changes; haptics are user-verified.

### 4. Network Requests
**Limitation:** KanjiVG data fetching is not mocked in E2E tests.
**Mitigation:** Tests use bundled kanji data (25 characters) which loads instantly.

### 5. Timing Sensitivity
**Limitation:** Animations and async operations may cause flakiness.
**Mitigation:** Strategic wait statements and `waitForAnimationToEnd` commands.

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm install
      - name: Install Maestro
        run: curl -Ls "https://get.maestro.mobile.dev" | bash
      - name: Start Expo
        run: npx expo start &
      - name: Run E2E tests
        run: npm run test:e2e:ios
```

## Best Practices

1. **Run tests on clean state:** Restart app between test runs for consistency
2. **Use descriptive test names:** Each flow should have a clear purpose
3. **Keep flows focused:** Test one user journey per flow
4. **Add waits strategically:** Balance speed vs. reliability
5. **Use testIDs over text matching:** More reliable across languages/themes
6. **Document known flakiness:** Note any timing-sensitive steps
7. **Run tests before commits:** Catch regressions early

## Performance

**Total Test Suite Duration:** ~3-4 minutes (all 6 flows)

| Flow | Duration | Steps |
|------|----------|-------|
| Flashcard Practice | 30-40s | 15+ |
| Multiple Choice | 25-30s | 12+ |
| Stroke Order | 15-20s | 8+ |
| Cross-Tab Nav | 30-35s | 20+ |
| Theme Switching | 25-30s | 18+ |
| Kanji Browsing | 30-35s | 15+ |

## Contributing

When adding new E2E tests:

1. **Add testIDs to components:** Follow naming convention `[screen]-[element]-[descriptor]`
2. **Create YAML flow:** Use existing flows as templates
3. **Test on both platforms:** iOS and Android (if possible)
4. **Document the flow:** Add description to this README
5. **Update CI/CD:** Include new flow in automation

## Resources

- [Maestro Documentation](https://maestro.mobile.dev)
- [Maestro CLI Reference](https://maestro.mobile.dev/cli/commands)
- [YAML Flow Syntax](https://maestro.mobile.dev/api-reference/commands)
- [Maestro Studio Guide](https://maestro.mobile.dev/getting-started/maestro-studio)

## Support

For issues or questions:
1. Check logs: `~/.maestro/logs/maestro.log`
2. Use Maestro Studio for debugging
3. Review testID naming in components
4. Check React Native Paper component documentation for supported props
