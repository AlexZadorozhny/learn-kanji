# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

A Japanese Kanji learning mobile application built with Expo and React Native. Features include flashcard practice with spaced repetition, multiple choice quizzes, context word practice, stroke order writing, dark theme support, kanji browsing, progress tracking, and text-to-speech pronunciation. Targets iOS, Android, and Web platforms.

**Current Status:** Phase 1, 2 & 3 Complete + Navigation Fixes + Build Fixes + Static Analysis (Clean) - Advanced stroke validation with adaptive thresholds, Fréchet distance algorithm, performance monitoring, All 25 kanji with professional KanjiVG stroke data (bundled), All 4 practice modes complete, Dark Theme implemented, KanjiVG Bundle Integration Complete, Stroke validation fixed for curved paths, Navigation stack management fixed, expo-av removed (incompatible with expo-modules-core@55), Maestro E2E tests fixed, ESLint 9 + Prettier + Husky pre-commit hooks, All lint warnings resolved (0 errors, 0 warnings)

**Tech Stack:**

- Expo ~55.0.5
- React Native 0.83.2
- React 19.2.0
- TypeScript 5.9.2 (strict mode enabled)
- React Navigation v7 (bottom tabs + stack navigators)
- React Native Paper v5 (Material Design 3 UI)
- Zustand (state management)
- AsyncStorage (local persistence)
- ESLint 9 + Prettier + Husky (static analysis & formatting)

**Bundle Identifiers:**

- iOS/Android: `com.learn.kanji`

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

# Lint (static analysis)
npm run lint            # Check for lint errors
npm run lint:fix        # Auto-fix lint errors

# Format (code style)
npm run format          # Format all source files
npm run format:check    # Check formatting without writing
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
- `eslint.config.mjs` - ESLint 9 flat config (TypeScript, React, React Native, Prettier integration)
- `.prettierrc` - Prettier formatting rules (single quotes, 100-char width, trailing commas)
- `.husky/pre-commit` - Git pre-commit hook running lint-staged

**Application Structure:**

- **Navigation**: Bottom tabs (Home, Practice, Progress, Settings) + stack navigators
  - Each tab uses a stack navigator for nested navigation
  - Root screens (HomeScreen, PracticeModeScreen, SettingsScreen) have `headerBackVisible: false` and `headerLeft: () => null` to remove back buttons
  - Stack navigators: HomeStackNavigator, PracticeStackNavigator, SettingsStackNavigator
- **State Management**: Zustand stores (kanjiStore, progressStore, practiceStore)
- **Data Layer**: AsyncStorage for persistence, embedded kanji dataset (25 characters, all with complete stroke data)
- **Key Features**:
  - Dark theme support (Light/Dark/Auto modes with full UI coverage)
  - Kanji browsing and detail views with TTS pronunciation
  - Direct stroke practice from kanji detail screen (single-kanji focused practice)
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
module.exports = function (api) {
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
- **All 25 kanji use professional KanjiVG stroke order data** (bundled as embedded SVG strings)
- Metadata in `src/data/sample-data.ts`: meanings, on-yomi/kun-yomi readings, romaji, example words, JLPT level
- Stroke data in `src/data/kanjivg-bundled/index.ts`: Professional SVG paths from KanjiVG project, exported as `BUNDLED_KANJI_IDS`
- **Manual stroke paths removed** (595 lines deleted) - replaced with industry-standard data
- **Checking for stroke data availability**: Use `BUNDLED_KANJI_IDS.includes(kanji.id)` instead of checking `kanji.strokeOrder` (property no longer exists after KanjiVG integration)

**Stroke Order Practice:**

- Uses React Native SVG + PanResponder (simplified approach, no Skia dependency)
- Coordinate scaling: screen touch events → 100x100 SVG viewBox
- **Advanced Validation System (Phase 1, 2 & 3):**
  - **Phase 1 - Visual Indicators**: Direction arrows (green start dot + blue end arrow) on current guide stroke, horizontal progress bar with stroke thumbnails
  - **Phase 2 - Geometric Validation**: Validates start point (±15-20 units), end point (±15-20 units), direction (±45-55°), weighted accuracy scoring (40% start + 40% end + 20% direction)
  - **Phase 3 - Advanced Algorithms**:
    - **Adaptive Thresholds**: Easy kanji (75%), medium (65%), complex (60%) - automatically adjusts based on stroke count
    - **Learning Mode**: First 3 attempts get -10% threshold reduction for encouragement
    - **Fréchet Distance**: Advanced shape matching for curved strokes using discrete Fréchet distance with dynamic programming
    - **Hybrid Validation Pipeline**: 5-step process (start point → end point → direction → Fréchet/bounding box fallback)
    - **Performance Monitoring**: Tracks validation time, accuracy, success rate by stroke type and complexity
  - **Key Services**: `AdvancedStrokeValidator`, `FrechetDistanceService`, `PathResamplingService`, `ValidationConfig`, `PerformanceMonitor`, `PathParserService`, `FeedbackMessageService`
  - **Performance**: <50ms average validation time, 85%+ validation accuracy for curved strokes
  - **Android Fix**: Uses `<G>` groups instead of nested `<Svg>` for proper Android rendering
- Visual feedback: guide strokes (dashed gray), user strokes (purple with green glow on correct), incorrect (red for 2s)
- **Critical pattern**: Uses refs (`currentDrawingRef`, `currentStrokeIndexRef`) to avoid React state closure bugs in gesture handlers
- **Random selection**: Each session randomly picks 5 kanji from all available stroke data for variety
- Session management: max 5 kanji per session, tracks correct/total strokes and attempt counts
- Updates writingScore (0-100) per kanji
- Implemented in `src/components/kanji/StrokeOrderCanvas.tsx` and `src/screens/practice/StrokeOrderScreen.tsx`

**KanjiVG Integration (Complete):**

- **Three-tier architecture** for stroke order data (6,355+ kanji coverage):
  - **Tier 1 - Bundled**: 25 kanji pre-bundled in app as embedded SVG strings for instant offline access (<50ms load time)
  - **Tier 2 - On-Demand**: 6,330+ kanji fetched from GitHub on first access, cached in AsyncStorage permanently
  - **Tier 3 - Legacy Fallback**: Deprecated - bundled kanji now provide all primary stroke data (fallback code kept for safety)
- **Services** (`src/services/kanjivg/`):
  - `KanjiVGParserService`: Parses SVG paths, normalizes coordinates (109×109 → 100×100 viewBox)
  - `KanjiVGFetcherService`: Downloads from GitHub with retry logic, AsyncStorage caching, LRU eviction
  - `KanjiVGIntegrationService`: High-level coordinator, memory caching, batch loading
- **State Integration** (`src/store/kanjiStore.ts`):
  - Methods: `loadStrokeOrder()`, `loadStrokeOrderBatch()`, `hasStrokeData()`, `getStrokeDataTier()`, `clearStrokeCache()`, `initializeKanjiVG()`
  - In-memory cache with duplicate fetch prevention
  - Async initialization in `App.tsx` on startup
- **UI Features**:
  - **StrokeOrderScreen**: Async loading with ActivityIndicator, error states with retry, dynamic stroke data loading
  - **KanjiDetailScreen**: Availability badges (Instant Access/Downloaded/Available Online), background prefetching
  - **SettingsScreen**: Cache management (statistics, clear cache, download all), progress indicators
  - **LicenseScreen**: Full CC BY-SA 3.0 attribution for KanjiVG
- **Performance**: <50ms bundled load, <100ms cached load, <2s fresh fetch
- **License**: CC BY-SA 3.0 (© Ulrich Apel) - Attribution in Settings → Licenses & Attribution
- **Coverage**: 6,355+ kanji (254x improvement from original 25)
- **Bundle Implementation**: Embedded SVG strings (1,561 lines) in `index.ts` instead of separate files (Metro bundler compatibility)
- **Test Coverage**: 135 new tests (89 services + 16 store integration + 8 UI + 16 bundle loading + 6 parser fixes) - 691/691 passing

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

**Stroke Practice from Kanji Detail:**

- Dedicated "Practice Stroke Order" button on KanjiDetailScreen for immediate focused practice
- Enables single-kanji practice sessions directly from kanji detail view
- Cross-stack navigation from Home tab → Practice tab → StrokeOrderScreen
- Context preservation through explicit `fromKanjiDetail` and `detailKanjiId` params
- Customized ResultsScreen buttons when accessed from kanji detail:
  - "Practice Again" restarts practice with same kanji (uses `navigation.reset` for clean state)
  - "Back to Kanji Details" returns to original kanji detail screen and resets Practice stack
- **Navigation Stack Management (CRITICAL):**
  - Before cross-tab navigation, always reset the source stack to prevent stuck screens
  - Pattern: `navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'RootScreen' }] }))` then navigate to other tab
  - Prevents Practice tab from showing ResultsScreen when user switches back
- Navigation uses `CommonActions.reset` to maintain clean stack and prevent accumulation
- StrokeOrderScreen uses `sessionKey` param for reliable session initialization
- Implemented in `src/screens/progress/KanjiDetailScreen.tsx`, `src/screens/practice/ResultsScreen.tsx`, and updated navigation types

**Static Analysis (ESLint + Prettier + Husky):**

- **ESLint 9** with flat config (`eslint.config.mjs`):
  - `typescript-eslint` recommended rules
  - `eslint-plugin-react` + `eslint-plugin-react-hooks` (rules-of-hooks, exhaustive-deps)
  - `eslint-plugin-react-native` (no-unused-styles, no-inline-styles)
  - `eslint-config-prettier` (disables formatting rules that conflict with Prettier)
  - `no-console` as warning (allows `console.warn` and `console.error`)
  - `@typescript-eslint/no-unused-vars` with `_` prefix ignore pattern
  - Test file overrides: relaxed `no-console` and `no-explicit-any`
- **Prettier**: single quotes, trailing commas (es5), 2-space tabs, semicolons, 100-char print width
- **Husky + lint-staged**: Pre-commit hook auto-runs `eslint --fix` + `prettier --write` on staged `.ts`/`.tsx`/`.js`/`.jsx` files, `prettier --write` on staged `.json`/`.md` files
- **VS Code integration**: Format on save + ESLint auto-fix on save (configured in `.vscode/settings.json`)
- **Recommended extensions**: `dbaeumer.vscode-eslint` + `esbenp.prettier-vscode` (in `.vscode/extensions.json`)
- **Current state**: 0 errors, 0 warnings (all `no-console` fixed by removing debug logs or using `console.warn`/`console.error`; `no-inline-styles` fixed by extracting to `StyleSheet`; `react-hooks/exhaustive-deps` fixed with proper dependency arrays and `useRef` guards; `no-unused-styles` fixed by removing dead styles)

## Development Workflow

### Testing Before Commits

**CRITICAL: Always run tests before committing or pushing to GitHub**

#### Unit Tests

```bash
# Run all unit tests
npm test

# Run tests for specific files
npm test -- --testPathPattern="ComponentName"

# Run tests without coverage report (faster)
npm test -- --no-coverage
```

**Unit Test Coverage:**

- Target: Maintain high test coverage (currently 84%+)
- Current: 691 tests passing across 37 test suites
- All new features should include unit tests
- Update existing tests when modifying functionality
- Test files located in `__tests__` directories alongside source files

#### E2E Tests (Maestro)

**Prerequisites:**

1. Maestro CLI installed (`curl -Ls "https://get.maestro.mobile.dev" | bash`)
2. iOS Simulator or Android Emulator running
3. Expo development server started (`npm start`)

```bash
# Run all E2E flows (~4 minutes total)
npm run test:e2e

# Platform-specific
npm run test:e2e:ios        # iOS Simulator
npm run test:e2e:android    # Android Emulator

# Run single flow (for targeted testing)
npm run test:e2e:single .maestro/flows/01-flashcard-practice.yaml

# Interactive development mode (highly recommended)
npm run maestro:studio
```

**E2E Test Coverage:**

- 6 comprehensive flows covering all major user journeys
- Flashcard practice with spaced repetition
- Multiple choice quiz with auto-advance
- Stroke order practice UI verification
- Complex cross-tab navigation
- Theme switching and persistence
- Kanji browsing and detail views

**E2E Test Files:**

- `.maestro/flows/01-flashcard-practice.yaml` - Flashcard session flow
- `.maestro/flows/02-multiple-choice-quiz.yaml` - Quiz session flow
- `.maestro/flows/03-stroke-order-practice.yaml` - Stroke order UI verification
- `.maestro/flows/04-cross-tab-navigation.yaml` - Complex navigation patterns
- `.maestro/flows/05-theme-switching.yaml` - Theme and settings toggles
- `.maestro/flows/06-kanji-browsing.yaml` - Kanji list and detail views

**See `.maestro/README.md` for detailed E2E testing documentation.**

#### Complete Testing Workflow

**Full workflow (recommended before major commits):**

1. Make code changes
2. Run `npm run lint` to check for lint errors (should be 0 errors)
3. Run `npm run format:check` to verify formatting
4. Run `npm test` to verify all unit tests pass (691/691)
5. Start simulator and launch app
6. Run `npm run test:e2e` to verify E2E flows (6/6 passing)
7. If any tests fail, fix issues before proceeding
8. Update documentation if adding new features
9. Commit (pre-commit hook auto-runs lint-staged)
10. Push only after all checks pass

**Quick workflow (for minor changes):**

1. Make code changes
2. Run `npm test` (unit tests only)
3. Test manually in simulator if UI changes
4. Commit (pre-commit hook enforces lint + formatting automatically)

**When to run E2E tests:**

- Before major releases
- After significant navigation changes
- When modifying cross-tab flows
- When updating practice mode logic
- After theme/styling changes
- Before merging feature branches

### Git Commit Guidelines

When creating commits:

- Ensure all 691 tests pass before committing
- Ensure `npm run lint` reports 0 errors before committing
- Write clear, descriptive commit messages
- Document breaking changes or new features
- Update CLAUDE.md and MEMORY.md for significant changes
- Pre-commit hook automatically runs `eslint --fix` + `prettier --write` on staged files
- Use Co-Authored-By tag: `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`

## Prerequisites

- Node.js >= 18
- Expo Go app (for physical device testing)
- Xcode (for iOS development)
- Android Studio (for Android development)
