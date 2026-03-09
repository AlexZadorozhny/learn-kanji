# Plan: Achieve 80%+ Test Coverage on ALL Files

## Goal
Achieve 80%+ line coverage on every single file in the codebase without excluding any testable files from coverage reports.

---

## 🎯 PROGRESS UPDATE (2026-03-09)

### ✅ Phase 1 Complete - Easy Wins
**Status:** All 3 files completed with 100% coverage

1. **PracticeModeScreen.tsx**: 100% coverage (was 75%)
   - Added 5 navigation handler tests
   - All 20 tests passing

2. **SettingsScreen.tsx**: 100% coverage (was 65.21%)
   - Added 8 event handler tests (theme changes, toggles, haptic feedback)
   - All 17 tests passing

3. **KanjiDetailScreen.tsx**: 100% coverage (was 62.5%)
   - Added 6 TTS interaction tests
   - All 21 tests passing

**Phase 1 Summary:** 19 tests added, 58 total tests, 100% average coverage

### ✅ Phase 2 Complete - Medium Difficulty
**Status:** All 2 files completed with 97%+ coverage

4. **MultipleChoiceScreen.tsx**: 97.18% coverage (was 55.22%)
   - Added 11 tests for answer selection, haptics, auto-advance, navigation
   - All 14 tests passing

5. **FlashcardScreen.tsx**: 98.14% coverage (was 45.09%)
   - Added 12 tests for rating buttons, SRS integration, session management
   - All 15 tests passing

**Phase 2 Summary:** 23 tests added, 29 total tests, 97.66% average coverage

### 📊 Overall Progress
- **Files Completed:** 5 of 15
- **Total Tests Added:** 42
- **Total Test Count:** 87 passing
- **Average Coverage (completed files):** 99.06%

### 🚧 Next Up: Phase 3 - Harder Screens
- ContextPracticeScreen.tsx (42.02% → 80%+)
- StrokeOrderScreen.tsx (44.64% → 80%+)
- FlashcardComponent.tsx (32.6% → 80%+)

---

## Current State Analysis (Initial)

### Files Below 80% Line Coverage

1. **PracticeModeScreen.tsx** - 75% (lines 68-128 uncovered)
2. **KanjiDetailScreen.tsx** - 62.5% (lines 22-28, 92, 118, 143 uncovered)
3. **SettingsScreen.tsx** - 65.21% (lines 21-22, 29-31, 92, 104, 116 uncovered)
4. **FlashcardComponent.tsx** - 32.6% (lines 20-33, 38-56, 60-72, 163-210 uncovered)
5. **FlashcardScreen.tsx** - 45.09% (lines 44-50, 55-56, 63-133, 156-157 uncovered)
6. **MultipleChoiceScreen.tsx** - 55.22% (lines 46, 51-52, 74-90, 95-154, 172-173, 209 uncovered)
7. **ContextPracticeScreen.tsx** - 42.02% (lines 47-49, 55-56, 63-72, 77-78, 82-150, 176-177, 219-268 uncovered)
8. **StrokeOrderScreen.tsx** - 44.64% (lines 44-50, 55-56, 63-65, 70-136, 159-160 uncovered)
9. **StrokeOrderCanvas.tsx** - 0% (entire component uncovered)
10. **All Store files** - 0% (kanjiStore, progressStore, practiceStore, settingsStore)
11. **Service files** - Variable coverage (TTSService, HapticService, SoundService, StorageService)

---

## Detailed Implementation Plan

### Phase 1: Easy Wins (Closest to 80%)

#### A. PracticeModeScreen.tsx (75% → 80%+)
**Target: 5 new tests**
**Uncovered:** Navigation button handlers (lines 68-128)

**Tests to Add:**
1. Test flashcard button press triggers navigation to FlashcardScreen
2. Test stroke order button press triggers navigation to StrokeOrderScreen
3. Test multiple choice button press triggers navigation to MultipleChoiceScreen
4. Test context practice button press triggers navigation to ContextPracticeScreen
5. Test button disabled states are respected

**Implementation Strategy:**
- Use `fireEvent.press()` to simulate button clicks
- Mock navigation and verify `navigation.navigate()` calls
- Test with both enabled and disabled states

---

#### B. SettingsScreen.tsx (65.21% → 80%+)
**Target: 8 new tests**
**Uncovered:** Event handlers (handleThemeChange, handleToggle)

**Tests to Add:**
1. Test theme segmented button press (Light → Dark)
2. Test theme segmented button press (Dark → Auto)
3. Test notifications toggle on/off
4. Test sound effects toggle on/off
5. Test haptic feedback toggle on/off
6. Test HapticService.light() called on theme change
7. Test HapticService.light() called on toggle (when haptics enabled)
8. Test HapticService NOT called on toggle (when haptics disabled)

**Implementation Strategy:**
- Use `fireEvent.press()` on segmented buttons
- Use `fireEvent` on Switch components
- Verify HapticService mock calls
- Test async handler completion

---

#### C. KanjiDetailScreen.tsx (62.5% → 80%+)
**Target: 6 new tests**
**Uncovered:** TTS speak handler (lines 22-28), speaker button interactions

**Tests to Add:**
1. Test on-yomi speaker button press calls TTSService.speak()
2. Test kun-yomi speaker button press calls TTSService.speak()
3. Test example word speaker button press calls TTSService.speak()
4. Test speaking state changes (setSpeakingId) during TTS
5. Test TTS error handling (catch block)
6. Test multiple rapid button presses (speaking state prevents concurrent calls)

**Implementation Strategy:**
- Use `fireEvent.press()` on IconButton components
- Mock TTSService.speak() to resolve/reject
- Use `waitFor()` for async state changes
- Test error scenarios with rejected promises

---

### Phase 2: Medium Difficulty (50-60% range)

#### D. MultipleChoiceScreen.tsx (55.22% → 80%+)
**Target: 12 new tests**
**Uncovered:** Answer selection, feedback display, next question flow

**Tests to Add:**
1. Test selecting correct answer shows green feedback
2. Test selecting incorrect answer shows red feedback
3. Test HapticService.success() called on correct answer
4. Test HapticService.error() called on incorrect answer
5. Test answer selection disables other buttons (showFeedback state)
6. Test auto-advance to next question after delay
7. Test progress bar updates after each answer
8. Test last question navigates to ResultsScreen
9. Test addResult called with correct/incorrect
10. Test updateKanjiProgress called after each question
11. Test session with no kanji navigates back
12. Test currentIndex increments on nextCard

**Implementation Strategy:**
- Use `fireEvent.press()` on answer buttons
- Use `jest.useFakeTimers()` for auto-advance testing
- Mock navigation, practiceStore, progressStore
- Test full question flow from start to finish

---

#### E. FlashcardScreen.tsx (45.09% → 80%+)
**Target: 15 new tests**
**Uncovered:** Session logic, handleRate function, navigation flow

**Tests to Add:**
1. Test session initialization with route params
2. Test session initialization with SRS due kanji
3. Test handleRate(1) - Again button
4. Test handleRate(2) - Hard button
5. Test handleRate(3) - Good button
6. Test handleRate(4) - Easy button
7. Test SRSService.updateProgress called with correct quality
8. Test progress bar updates after rating
9. Test nextCard called after rating
10. Test last card navigates to ResultsScreen
11. Test updateKanjiProgress called with SRS data
12. Test updateStudyStats called
13. Test session with no kanji navigates back
14. Test isTransitioning state during card changes
15. Test sessionStartTime tracking for timeSpent calculation

**Implementation Strategy:**
- Test full session lifecycle
- Mock SRSService, progressStore, practiceStore
- Use `waitFor()` for state transitions
- Test rating flow integration

---

### Phase 3: Harder (30-45% range)

#### F. ContextPracticeScreen.tsx (42.02% → 80%+)
**Target: 15 new tests**
**Uncovered:** Reveal button, TTS for words, action buttons

**Tests to Add:**
1. Test session initialization
2. Test reveal button press shows answer
3. Test HapticService.warning() called on reveal
4. Test TTS button press for each example word
5. Test speaking state during TTS
6. Test "Got It!" button updates contextScore (higher)
7. Test "Need Practice" button updates contextScore (lower)
8. Test nextCard called after rating
9. Test progress bar updates
10. Test last kanji navigates to ResultsScreen
11. Test addResult called with correct boolean
12. Test updateKanjiProgress called
13. Test session with no kanji navigates back
14. Test multiple example words TTS buttons
15. Test selectedAnswers state tracking

**Implementation Strategy:**
- Use `fireEvent.press()` on reveal and action buttons
- Mock TTSService, HapticService, practiceStore, progressStore
- Test reveal state transitions
- Test full context practice flow

---

#### G. StrokeOrderScreen.tsx (44.64% → 80%+)
**Target: 12 new tests**
**Uncovered:** Stroke completion handlers, session flow

**Tests to Add:**
1. Test session initialization with stroke order data
2. Test handleStrokeComplete(true) increments correctStrokes
3. Test handleStrokeComplete(false) increments totalStrokes only
4. Test handleAllStrokesComplete calculates accuracy
5. Test accuracy >= 70% marks as correct
6. Test accuracy < 70% marks as incorrect
7. Test addResult called with calculated result
8. Test updateKanjiProgress called with writingScore
9. Test nextCard called after completion
10. Test progress bar updates
11. Test last kanji navigates to ResultsScreen
12. Test session with no stroke data navigates back

**Implementation Strategy:**
- Mock StrokeOrderCanvas completely
- Test stroke tracking logic
- Test accuracy calculation (correctStrokes / totalStrokes)
- Test full stroke practice session flow

---

#### H. FlashcardComponent.tsx (32.6% → 80%+)
**Target: 18 new tests**
**Uncovered:** Flip animation, rating buttons, TTS integration

**Tests to Add:**
1. Test initial render shows kanji (front of card)
2. Test card flip on press (showAnswer becomes true)
3. Test back of card renders after flip
4. Test animated value changes on flip
5. Test "Again" button calls onRate(1)
6. Test "Hard" button calls onRate(2)
7. Test "Good" button calls onRate(3)
8. Test "Easy" button calls onRate(4)
9. Test rating buttons disabled during flip animation
10. Test speaker button press calls TTSService.speak()
11. Test speaking state updates during TTS
12. Test TTS speaks kanji readings
13. Test HapticService called on rating button press
14. Test card shows all kanji properties (character, meanings, readings)
15. Test card with multiple on-yomi readings
16. Test card with multiple kun-yomi readings
17. Test card with no kun-yomi readings
18. Test key prop forces remount on kanji change

**Implementation Strategy:**
- Use `fireEvent.press()` on card and buttons
- Mock Animated API for flip testing
- Mock TTSService and HapticService
- Test full component lifecycle
- Use `waitFor()` for state changes

---

### Phase 4: Store Unit Tests (0% → 80%+)

#### I. kanjiStore.ts
**Target: 8 tests**

**Tests to Add:**
1. Test initial state (empty kanjiData, loading false)
2. Test setKanjiData updates kanjiData
3. Test loadKanji sets loading true
4. Test loadKanji sets loading false after timeout
5. Test loadKanji populates kanjiData with sample data
6. Test getKanjiById returns correct kanji
7. Test getKanjiById returns undefined for non-existent ID
8. Test store persistence (if implemented)

---

#### J. progressStore.ts
**Target: 12 tests**

**Tests to Add:**
1. Test initial state (empty progress, default stats)
2. Test updateKanjiProgress creates new progress entry
3. Test updateKanjiProgress updates existing progress entry
4. Test updateKanjiProgress calls saveProgress
5. Test getKanjiProgress returns correct progress
6. Test getKanjiProgress returns undefined for non-existent kanji
7. Test updateStudyStats updates stats correctly
8. Test loadProgress loads from AsyncStorage
9. Test saveProgress saves to AsyncStorage
10. Test clearProgress removes all data
11. Test clearProgress resets to initial state
12. Test isLoaded flag after loadProgress

---

#### K. practiceStore.ts
**Target: 10 tests**

**Tests to Add:**
1. Test initial state (no session, empty results)
2. Test startSession creates new session
3. Test startSession sets mode and kanjiIds
4. Test addResult adds to results array
5. Test nextCard increments currentIndex
6. Test getSessionProgress returns correct progress
7. Test endSession clears currentSession
8. Test isSessionActive computed correctly
9. Test session results accumulate
10. Test currentIndex bounds checking

---

#### L. settingsStore.ts
**Target: 10 tests**

**Tests to Add:**
1. Test initial state (default theme, all toggles enabled)
2. Test setThemeMode updates theme
3. Test setThemeMode saves to AsyncStorage
4. Test setDailyGoal updates goal
5. Test setNotificationsEnabled updates flag
6. Test setSoundEnabled updates flag
7. Test setHapticsEnabled updates flag
8. Test loadSettings loads from AsyncStorage
9. Test settings persistence
10. Test all setters trigger AsyncStorage save

---

### Phase 5: Service Tests

#### M. StorageService.ts
**Target: 8 tests**

**Tests to Add:**
1. Test get() retrieves from AsyncStorage
2. Test get() returns null for non-existent key
3. Test get() parses JSON correctly
4. Test set() saves to AsyncStorage
5. Test set() stringifies objects
6. Test remove() deletes from AsyncStorage
7. Test clear() removes all keys
8. Test error handling in get/set/remove

---

#### N. TTSService.ts (if not covered)
**Target: 6 tests**

**Tests to Add:**
1. Test speak() calls Speech.speak()
2. Test speak() with Japanese voice
3. Test stop() calls Speech.stop()
4. Test getAvailableVoices() returns voices
5. Test error handling in speak()
6. Test concurrent speak calls

---

#### O. SoundService.ts
**Target: 6 tests**

**Tests to Add:**
1. Test playSuccess() loads and plays sound
2. Test playError() loads and plays sound
3. Test playCorrect() loads and plays sound
4. Test sound file paths are correct
5. Test error handling in sound loading
6. Test sound cleanup/unload

---

## Testing Strategy & Tools

### Key Testing Utilities

1. **fireEvent** - Simulate user interactions (press, change text, etc.)
2. **waitFor** - Wait for async operations and state changes
3. **act** - Wrap state updates
4. **jest.useFakeTimers()** - Control time-dependent code
5. **jest.advanceTimersByTime()** - Fast-forward timers

### Mock Strategies

**Navigation Mocks:**
```typescript
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
}));
```

**Store Mocks:**
```typescript
jest.mock('../../../store/practiceStore', () => ({
  usePracticeStore: jest.fn(),
}));
```

**Service Mocks:**
```typescript
jest.mock('../../../services/audio/TTSService', () => ({
  TTSService: {
    speak: jest.fn(() => Promise.resolve()),
  },
}));
```

### Testing Patterns

**Event Handler Testing:**
```typescript
const button = getByText('Button Text');
fireEvent.press(button);
expect(mockHandler).toHaveBeenCalled();
```

**Async Testing:**
```typescript
await waitFor(() => {
  expect(getByText('Updated Text')).toBeTruthy();
});
```

**Timer Testing:**
```typescript
jest.useFakeTimers();
fireEvent.press(button);
jest.advanceTimersByTime(1500);
expect(mockNavigate).toHaveBeenCalled();
```

---

## Implementation Order

### Priority 1: Easy Wins (Session 1)
- PracticeModeScreen: 5 tests
- SettingsScreen: 8 tests
- KanjiDetailScreen: 6 tests
**Subtotal: 19 tests**

### Priority 2: Medium Difficulty (Session 2)
- MultipleChoiceScreen: 12 tests
- FlashcardScreen: 15 tests
**Subtotal: 27 tests**

### Priority 3: Harder Screens (Session 3)
- ContextPracticeScreen: 15 tests
- StrokeOrderScreen: 12 tests
- FlashcardComponent: 18 tests
**Subtotal: 45 tests**

### Priority 4: Store Tests (Session 4)
- kanjiStore: 8 tests
- progressStore: 12 tests
- practiceStore: 10 tests
- settingsStore: 10 tests
**Subtotal: 40 tests**

### Priority 5: Service Tests (Session 5)
- StorageService: 8 tests
- TTSService: 6 tests
- SoundService: 6 tests
**Subtotal: 20 tests**

---

## Estimated Totals

**New Tests Needed:** ~151 tests
**Current Tests:** 90 tests
**Final Total:** ~241 tests

**Files to Reach 80%+:** All 24+ testable files

**Implementation Time Estimate:**
- Session 1: 2 hours
- Session 2: 3 hours
- Session 3: 4 hours
- Session 4: 3 hours
- Session 5: 2 hours
**Total: ~14 hours of focused work**

---

## Success Criteria

✅ Every testable file has 80%+ line coverage
✅ No files excluded from coverage reports (except external wrappers, navigation config)
✅ All tests passing
✅ Coverage report shows 80%+ overall
✅ Tests use proper React Testing Library patterns
✅ Tests are maintainable and well-documented

---

## Notes

- Store tests are isolated unit tests (not mocked)
- Screen tests use full component rendering with mocks
- Service tests mock external dependencies only
- All async operations use proper `waitFor()` or fake timers
- Event handlers tested with `fireEvent` utilities
