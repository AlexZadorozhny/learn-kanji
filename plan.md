# Japanese Kanji Learning App - Implementation Plan

## Context

Transform the minimal "Hello World" Expo app into a comprehensive Japanese Kanji learning application. The app will teach users to read, write, and pronounce kanji symbols through four practice modes: flashcard recognition, stroke order writing, multiple choice quizzes, and contextual word/phrase practice.

**Current State**: Single-screen app (`App.tsx`) with basic Expo setup, no navigation or features.

**User Requirements**:
- **Data**: Local embedded database (offline-first)
- **Progression**: Frequency-based (most common kanji first)
- **Storage**: AsyncStorage (local device only)
- **Practice Modes**: All four modes (flashcards, writing, quizzes, context)

## Technical Architecture

### Core Technology Decisions

| Component | Solution | Rationale |
|-----------|----------|-----------|
| **Navigation** | React Navigation v7 | Industry standard, excellent TypeScript support, flexible |
| **UI Framework** | React Native Paper v5 | Material Design 3, small bundle, TypeScript-first |
| **State Management** | Zustand | Minimal boilerplate (1.5KB), TypeScript-first, perfect for app complexity |
| **Local Storage** | AsyncStorage | Expo-recommended, simple API, cross-platform |
| **Canvas/Drawing** | React Native Skia | Hardware-accelerated (60fps+), SVG support, gesture integration |
| **Audio/TTS** | expo-speech | Built-in TTS, no audio files, works offline, supports Japanese |

### Dependencies to Add

```bash
# Navigation
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-safe-area-context react-native-screens

# UI Framework
npm install react-native-paper react-native-vector-icons

# Gestures & Animation (required for Skia)
npm install react-native-gesture-handler react-native-reanimated

# Canvas/Drawing
npm install @shopify/react-native-skia

# State & Storage
npm install zustand @react-native-async-storage/async-storage

# Utilities
npm install expo-speech react-native-svg date-fns
```

**IMPORTANT**: Update `babel.config.js` to include reanimated plugin:
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'], // Must be last
  };
};
```

## Data Models

### Kanji Data Structure

```typescript
interface KanjiCharacter {
  id: string;                    // "U+4E00"
  character: string;              // "一"
  frequencyRank: number;          // 1 = most common
  meanings: string[];             // ["one", "single"]
  onYomi: Reading[];              // [{reading: "イチ", romaji: "ichi"}]
  kunYomi: Reading[];             // [{reading: "ひと", romaji: "hito"}]
  strokes: number;                // Total stroke count
  strokeOrder: StrokePath[];      // SVG paths for each stroke
  radicals: string[];             // Component radicals
  exampleWords: ExampleWord[];    // Context phrases/words
}

interface Reading {
  reading: string;      // Hiragana/katakana
  romaji: string;       // Romanized
}

interface StrokePath {
  path: string;         // SVG path data
  strokeNumber: number; // Order (1-indexed)
}

interface ExampleWord {
  word: string;         // "一人"
  reading: string;      // "ひとり"
  romaji: string;       // "hitori"
  meaning: string;      // "one person; alone"
}
```

### Progress Tracking

```typescript
interface UserProgress {
  userId: string;
  kanjiProgress: Map<string, KanjiProgress>; // Keyed by kanji.id
  studyStats: StudyStats;
  lastStudyDate: string;
  currentLesson: number;
}

interface KanjiProgress {
  kanjiId: string;
  status: 'new' | 'learning' | 'mastered' | 'review';
  recognitionScore: number;      // 0-100
  writingScore: number;          // 0-100
  readingScore: number;          // 0-100
  contextScore: number;          // 0-100
  lastReviewed: string;          // ISO date
  nextReview: string;            // SRS schedule
  totalAttempts: number;
  correctAttempts: number;
}

interface StudyStats {
  totalKanjiStudied: number;
  kanjiMastered: number;
  totalStudyTimeMinutes: number;
  currentStreak: number;
  longestStreak: number;
}
```

### Data Source Strategy

**Kanji Dataset**: Combine KanjiVG (stroke orders) + KANJIDIC2 (meanings/readings) + BCCWJ frequency data
- License: Creative Commons BY-SA 3.0
- Initial scope: 100 most frequent kanji (expand to 2,500 over time)
- Format: Pre-processed JSON bundled with app at `src/data/kanji-dataset.json`
- Size estimate: ~100 kanji = ~500KB, ~2,500 kanji = ~5-8MB (1-2MB compressed)

## Folder Structure

```
src/
├── navigation/
│   ├── RootNavigator.tsx              # Main navigation container
│   ├── MainTabNavigator.tsx           # Bottom tabs (Home, Practice, Progress, Settings)
│   └── types.ts                        # Navigation type definitions
│
├── screens/
│   ├── home/
│   │   ├── HomeScreen.tsx             # Dashboard with stats
│   │   └── LessonScreen.tsx           # Frequency-based kanji list
│   ├── practice/
│   │   ├── PracticeModeScreen.tsx     # Mode selection
│   │   ├── FlashcardScreen.tsx        # Recognition practice
│   │   ├── StrokeOrderScreen.tsx      # Writing practice
│   │   ├── MultipleChoiceScreen.tsx   # Quiz mode
│   │   ├── ContextPracticeScreen.tsx  # Words/phrases
│   │   └── ResultsScreen.tsx          # Session results
│   ├── progress/
│   │   ├── ProgressScreen.tsx         # Progress dashboard
│   │   ├── KanjiDetailScreen.tsx      # Individual kanji view
│   │   └── StatsScreen.tsx            # Analytics
│   └── settings/
│       ├── SettingsScreen.tsx
│       └── AboutScreen.tsx
│
├── components/
│   ├── kanji/
│   │   ├── KanjiCard.tsx              # Display kanji character
│   │   ├── KanjiList.tsx              # Scrollable list
│   │   ├── StrokeOrderCanvas.tsx      # Interactive drawing canvas
│   │   ├── StrokeAnimation.tsx        # Animated stroke demo
│   │   └── ReadingDisplay.tsx         # Format readings with audio
│   ├── practice/
│   │   ├── FlashcardComponent.tsx
│   │   ├── QuizQuestion.tsx
│   │   ├── ProgressBar.tsx
│   │   └── ScoreDisplay.tsx
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── LoadingScreen.tsx
│   │   └── EmptyState.tsx
│   └── layout/
│       ├── ScreenContainer.tsx        # Consistent wrapper
│       └── Header.tsx
│
├── store/
│   ├── kanjiStore.ts                  # Zustand: kanji data
│   ├── progressStore.ts               # Zustand: user progress
│   ├── practiceStore.ts               # Zustand: active practice session
│   └── settingsStore.ts               # Zustand: app settings
│
├── services/
│   ├── storage/
│   │   ├── StorageService.ts          # AsyncStorage wrapper
│   │   ├── KanjiDataService.ts        # Kanji CRUD operations
│   │   └── ProgressService.ts         # Progress CRUD
│   ├── practice/
│   │   ├── FlashcardService.ts        # Flashcard logic
│   │   ├── QuizService.ts             # Quiz generation
│   │   ├── SRSService.ts              # Spaced Repetition System
│   │   └── StrokeValidation.ts        # Stroke order validation
│   └── audio/
│       └── TTSService.ts              # Text-to-speech wrapper
│
├── hooks/
│   ├── useKanjiData.ts
│   ├── useProgress.ts
│   ├── usePracticeSession.ts
│   └── useAudio.ts
│
├── types/
│   ├── kanji.ts                       # Kanji type definitions
│   ├── progress.ts                    # Progress type definitions
│   ├── practice.ts                    # Practice type definitions
│   └── index.ts                       # Export all types
│
├── theme/
│   ├── theme.ts                       # React Native Paper theme
│   ├── colors.ts                      # Color palette
│   └── typography.ts                  # Font styles
│
└── data/
    ├── kanji-dataset.json             # Pre-processed kanji data
    └── sample-data.ts                 # Development sample data
```

## Navigation Structure

```
Root Navigator
├─ Main Tab Navigator (Bottom Tabs)
│  ├─ Home Tab
│  │  └─ HomeScreen → LessonScreen
│  ├─ Practice Tab
│  │  └─ PracticeModeScreen → [Flashcard/StrokeOrder/MultipleChoice/Context]Screen → ResultsScreen
│  ├─ Progress Tab
│  │  └─ ProgressScreen → KanjiDetailScreen / StatsScreen
│  └─ Settings Tab
│     └─ SettingsScreen → AboutScreen
```

## Implementation Phases

### Phase 1: Foundation & Setup (Week 1)
**Goal**: Establish project structure, navigation, and UI framework

**Tasks**:
1. Install all dependencies
2. Create complete folder structure under `src/`
3. Set up React Navigation with bottom tabs and stack navigators
4. Configure React Native Paper theme
5. Create placeholder screen components
6. Implement `ScreenContainer` and basic layout components
7. Test navigation flow on iOS, Android, and Web

**Critical Files**:
- `App.tsx` - Transform into navigation container
- `src/navigation/RootNavigator.tsx` - Create main navigator
- `src/navigation/MainTabNavigator.tsx` - Create bottom tabs
- `src/theme/theme.ts` - Configure Paper theme
- `src/screens/*/*.tsx` - Create placeholder screens

**Verification**:
- Run `npx expo start` and verify navigation works
- Test all 4 tabs are accessible
- Verify stack navigation forward/back works

---

### Phase 2: Data Layer & Storage (Week 2)
**Goal**: Implement type system, storage layer, and state management

**Tasks**:
1. Define all TypeScript interfaces in `src/types/`
2. Create initial kanji dataset (first 100 kanji by frequency)
   - Process KanjiVG stroke data
   - Extract KANJIDIC2 meanings/readings
   - Add romaji conversions
   - Include 3-5 example words per kanji
3. Implement `StorageService` wrapper for AsyncStorage
4. Create Zustand stores (kanjiStore, progressStore, practiceStore, settingsStore)
5. Build `KanjiDataService` and `ProgressService`
6. Implement data initialization on first app launch
7. Create custom hooks (useKanjiData, useProgress)

**Critical Files**:
- `src/types/kanji.ts` - Kanji type definitions
- `src/types/progress.ts` - Progress type definitions
- `src/data/kanji-dataset.json` - Initial 100 kanji dataset
- `src/services/storage/StorageService.ts` - AsyncStorage wrapper
- `src/store/kanjiStore.ts` - Kanji data store
- `src/store/progressStore.ts` - Progress tracking store
- `src/hooks/useKanjiData.ts` - Kanji data hook
- `src/hooks/useProgress.ts` - Progress tracking hook

**Verification**:
- Run app and verify kanji data loads from JSON
- Check AsyncStorage contains data after first launch
- Verify Zustand stores are accessible in components
- Test data persists after app restart

---

### Phase 3: Home & Progress Screens (Week 3)
**Goal**: Build dashboard, statistics, and kanji browsing

**Tasks**:
1. Implement `HomeScreen` with study stats dashboard
2. Create `LessonScreen` with frequency-based kanji list
3. Build `KanjiDetailScreen` with comprehensive kanji view
4. Implement `ProgressScreen` with progress dashboard
5. Create `KanjiCard`, `KanjiList`, and `ReadingDisplay` components
6. Integrate TTS (expo-speech) for pronunciation
7. Connect all screens to Zustand stores

**Critical Files**:
- `src/screens/home/HomeScreen.tsx` - Dashboard with stats
- `src/screens/home/LessonScreen.tsx` - Kanji list by frequency
- `src/screens/progress/KanjiDetailScreen.tsx` - Detailed kanji view
- `src/screens/progress/ProgressScreen.tsx` - Progress dashboard
- `src/components/kanji/KanjiCard.tsx` - Kanji display component
- `src/components/kanji/ReadingDisplay.tsx` - Readings with audio
- `src/services/audio/TTSService.ts` - TTS wrapper
- `src/hooks/useAudio.ts` - Audio hook

**Verification**:
- Navigate to Home tab and see kanji list
- Tap a kanji and see detailed view
- Tap readings to hear TTS pronunciation
- Verify Progress tab shows empty state (no progress yet)

---

### Phase 4: Flashcard Practice Mode (Week 4)
**Goal**: Implement first practice mode with SRS system

**Tasks**:
1. Build `FlashcardScreen` with card flip animation
2. Create `FlashcardComponent` (show kanji → flip → show meaning/reading)
3. Implement `FlashcardService` for session management
4. Build `SRSService` with SM-2 algorithm
5. Add self-rating UI (Again/Hard/Good/Easy)
6. Create `ResultsScreen` to show session summary
7. Update `progressStore` with practice results
8. Implement daily review queue

**Critical Files**:
- `src/screens/practice/FlashcardScreen.tsx` - Flashcard UI
- `src/components/practice/FlashcardComponent.tsx` - Card component
- `src/services/practice/FlashcardService.ts` - Session logic
- `src/services/practice/SRSService.ts` - Spaced repetition algorithm
- `src/screens/practice/ResultsScreen.tsx` - Session results

**Verification**:
- Start flashcard practice from Practice tab
- Verify card shows kanji, flips to reveal answer
- Rate card difficulty and verify next review date is calculated
- Complete session and see results screen
- Check progress is saved in AsyncStorage
- Restart app and verify progress persists

---

### Phase 5: Stroke Order Writing (Week 5)
**Goal**: Implement canvas-based writing practice

**Tasks**:
1. Set up React Native Skia canvas
2. Load and parse stroke order SVG paths from kanji data
3. Build `StrokeOrderCanvas` with gesture handling
4. Implement `StrokeAnimation` for demonstration
5. Create `StrokeValidation` service (simplified bounding box + order validation)
6. Add UI controls (hint, undo, clear)
7. Implement scoring based on stroke accuracy and order correctness

**Critical Files**:
- `src/screens/practice/StrokeOrderScreen.tsx` - Writing practice UI
- `src/components/kanji/StrokeOrderCanvas.tsx` - Interactive canvas
- `src/components/kanji/StrokeAnimation.tsx` - Animated demo
- `src/services/practice/StrokeValidation.ts` - Validation logic

**Verification**:
- Start stroke order practice
- Verify stroke animation plays correctly
- Draw strokes and verify validation feedback (green/red)
- Test undo/clear/hint buttons
- Complete writing and verify score calculation
- Test on physical device (simulator gestures may differ)

---

### Phase 6: Quiz & Context Modes (Week 6)
**Goal**: Complete remaining practice modes

**Tasks**:
1. Implement `MultipleChoiceScreen` with 4-option questions
2. Create `QuizService` for question generation
   - Generate distractors (similar meanings, readings, appearance)
   - Question types: meaning → kanji, kanji → meaning, reading quiz
3. Build `ContextPracticeScreen` for word/phrase practice
4. Display example words with target kanji highlighted
5. Integrate TTS for word pronunciation
6. Implement scoring for both modes
7. Connect to `progressStore` and update kanji progress

**Critical Files**:
- `src/screens/practice/MultipleChoiceScreen.tsx` - Quiz UI
- `src/screens/practice/ContextPracticeScreen.tsx` - Context practice UI
- `src/components/practice/QuizQuestion.tsx` - Quiz component
- `src/services/practice/QuizService.ts` - Quiz generation

**Verification**:
- Start multiple choice quiz
- Verify 4 options display with one correct answer
- Test immediate feedback (correct/incorrect)
- Start context practice
- Verify example words display correctly
- Tap to hear TTS pronunciation of words
- All 4 practice modes now complete

---

### Phase 7: Polish & Settings (Week 7)
**Goal**: Add settings, optimize performance, enhance UX

**Tasks**:
1. Implement `SettingsScreen` (theme, daily goal, study preferences)
2. Add progress charts to `StatsScreen` (study time, mastered kanji)
3. Implement streak tracking with notifications
4. Optimize kanji data loading (lazy loading, pagination)
5. Add loading states and error handling throughout
6. Implement haptic feedback for interactions
7. Add empty states for new users
8. Performance testing and optimization

**Critical Files**:
- `src/screens/settings/SettingsScreen.tsx` - Settings UI
- `src/screens/progress/StatsScreen.tsx` - Analytics/charts
- `src/store/settingsStore.ts` - Settings management

**Verification**:
- Navigate to Settings and verify preferences can be changed
- Check Progress tab shows charts and statistics
- Verify streak counter increments on daily study
- Test app performance with full 100-kanji dataset
- Verify smooth scrolling and transitions

---

### Phase 8: Testing & Refinement (Week 8)
**Goal**: Comprehensive testing and bug fixes

**Tasks**:
1. Manual testing on iOS (simulator + physical device)
2. Manual testing on Android (emulator + physical device)
3. Manual testing on Web browser
4. Test offline functionality (airplane mode)
5. Test data persistence across app restarts
6. Fix identified bugs and edge cases
7. Add error boundaries for graceful error handling
8. Improve accessibility (screen reader support, contrast)
9. Final polish and UX refinements

**Verification Checklist**:
- [ ] All 4 practice modes work correctly
- [ ] Progress saves and persists after app restart
- [ ] Navigation works on all platforms (iOS/Android/Web)
- [ ] TTS pronunciation works for all readings
- [ ] Stroke order drawing is smooth (60fps on device)
- [ ] SRS scheduling calculates correctly
- [ ] App works completely offline
- [ ] No crashes or errors during normal usage
- [ ] Data loads within 2 seconds on first launch
- [ ] Animations are smooth and responsive

## Key Technical Considerations

### Spaced Repetition System (SRS)

Implement simplified SM-2 (SuperMemo 2) algorithm:

```typescript
interface SRSItem {
  kanjiId: string;
  easinessFactor: number;  // 1.3 to 2.5 (default: 2.5)
  interval: number;         // Days until next review
  repetitions: number;      // Consecutive correct reviews
  nextReview: Date;
}

function calculateNextReview(item: SRSItem, quality: number): SRSItem {
  // quality: 0-5 (0=complete blackout, 5=perfect)
  let { easinessFactor, interval, repetitions } = item;

  // Update easiness factor
  easinessFactor = Math.max(1.3,
    easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  // Update interval
  if (quality < 3) {
    repetitions = 0;
    interval = 1;  // Reset if incorrect
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easinessFactor);
    repetitions++;
  }

  return { ...item, easinessFactor, interval, repetitions,
           nextReview: addDays(new Date(), interval) };
}
```

### Performance Optimization

1. **Lazy Loading**: Load kanji in chunks of 100
2. **Caching**: Keep current lesson tier in Zustand store
3. **Canvas Throttling**: Sample gesture events at 60fps max
4. **Memory Management**: Clear practice session data after saving results

### Stroke Order Validation Strategy

Use **simplified validation** (not pixel-perfect):
- Bounding box comparison (80% overlap tolerance)
- Stroke order correctness (primary focus)
- Direction vector matching
- Visual feedback overlay

**Fallback**: If validation proves too complex, implement "reference mode" where users trace displayed strokes.

## Potential Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| Stroke path matching complexity | Use simplified bounding box + order validation; focus on order correctness over pixel-perfect accuracy |
| Large dataset load times | Implement lazy loading (100 kanji chunks); compress JSON; cache in AsyncStorage |
| TTS quality for Japanese | Test expo-speech early; provide romaji fallback; allow TTS toggle in settings |
| Drawing UX on small screens | Allow pinch-to-zoom; provide stroke-by-stroke guided mode; optimize for tablets |
| Canvas performance on Web | Test Skia web support early; fallback: disable writing mode on web platform |
| User motivation over time | Implement streaks, achievements, progress visualization, varied practice modes |

## Critical Files Reference

### Files to Create (Priority Order):

1. **Navigation & Structure**:
   - `src/navigation/RootNavigator.tsx`
   - `src/navigation/MainTabNavigator.tsx`
   - `src/theme/theme.ts`

2. **Type Definitions**:
   - `src/types/kanji.ts`
   - `src/types/progress.ts`
   - `src/types/practice.ts`

3. **Data & Storage**:
   - `src/data/kanji-dataset.json`
   - `src/services/storage/StorageService.ts`
   - `src/store/kanjiStore.ts`
   - `src/store/progressStore.ts`

4. **Core Services**:
   - `src/services/practice/SRSService.ts`
   - `src/services/audio/TTSService.ts`

5. **Practice Screens** (implement in order):
   - `src/screens/practice/FlashcardScreen.tsx`
   - `src/screens/practice/StrokeOrderScreen.tsx`
   - `src/screens/practice/MultipleChoiceScreen.tsx`
   - `src/screens/practice/ContextPracticeScreen.tsx`

### File to Modify:

- `/Users/alexzad/simple-mobile/App.tsx` - Transform from single component to navigation container
- `/Users/alexzad/simple-mobile/package.json` - Add all dependencies
- `/Users/alexzad/simple-mobile/babel.config.js` - Add reanimated plugin

## Timeline Summary

| Phase | Duration | Focus |
|-------|----------|-------|
| 1 | Week 1 | Foundation: Navigation, UI, structure |
| 2 | Week 2 | Data layer: Types, storage, state |
| 3 | Week 3 | Browsing: Home, progress, kanji details |
| 4 | Week 4 | Practice: Flashcards + SRS |
| 5 | Week 5 | Practice: Stroke order writing |
| 6 | Week 6 | Practice: Quiz + context modes |
| 7 | Week 7 | Polish: Settings, optimization |
| 8 | Week 8 | Testing: Bug fixes, refinement |

**Total**: 8 weeks to production-ready MVP

## End-to-End Verification

After full implementation, verify complete user journey:

1. **First Launch**:
   - App loads kanji data from bundled JSON
   - Data persists to AsyncStorage
   - Home screen shows 100 kanji available

2. **Learning Flow**:
   - Select kanji from frequency list
   - Practice in all 4 modes
   - View results and updated progress
   - Check Progress tab shows improvement

3. **Return User**:
   - Open app next day
   - See review queue on Home screen
   - Complete reviews
   - Verify streak increments

4. **Offline Test**:
   - Enable airplane mode
   - All features work without network
   - Progress saves locally

5. **Cross-Platform**:
   - Test on iOS device/simulator
   - Test on Android device/emulator
   - Test in web browser (Chrome/Safari)
