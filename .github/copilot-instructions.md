# Project Guidelines

## Code Style
- Use TypeScript strict-safe patterns and keep changes narrow; avoid unrelated refactors.
- Follow existing React Native + React Native Paper patterns used in `src/screens` and `src/components`.
- Prefer Zustand selectors (`useStore((state) => state.field)`) over broad store reads to limit re-renders.
- Keep business logic in services under `src/services/*`; keep screens/components focused on UI and orchestration.
- Preserve existing navigation type safety in `src/navigation/types.ts`.

## Architecture
- App entry and providers are in `App.tsx` (Paper theme + app initialization).
- Navigation is tab + stack based under `src/navigation/*`.
- State is split by domain in `src/store/*`:
  - `kanjiStore`: kanji catalog + KanjiVG stroke data integration
  - `progressStore`: scores/stats + persistence
  - `practiceStore`: session flow and mode state
  - `settingsStore`: theme and user preferences
- Kanji stroke data uses a 3-tier approach via `src/services/kanjivg/*`:
  - Bundled data for core kanji
  - Cached fetched data
  - On-demand remote fetch

## Build and Test
- Install: `npm install`
- Run app: `npm start` (or `npx expo start`)
- Platform run scripts: `npm run ios`, `npm run android`, `npm run web`
- Unit tests: `npm test`
- Coverage: `npm run test:coverage`
- E2E (Maestro): `npm run test:e2e` (or `test:e2e:ios` / `test:e2e:android`)
- Before significant commits, run at least unit tests; for navigation/practice flow changes, run E2E flows too.

## Conventions
- Navigation/back-stack safety:
  - For cross-tab transitions that could strand users in nested screens, reset source stack before switching tabs.
  - Keep root screens configured without unexpected back-button behavior.
- Stroke practice/data checks:
  - Use KanjiVG store/service methods (`hasStrokeData`, `loadStrokeOrder`, tier checks) rather than ad-hoc stroke-data assumptions.
  - Prefer existing validation pipeline in `src/services/validation/*`; do not bypass adaptive thresholds and shape validation logic.
- Theme behavior:
  - Ensure UI colors come from Paper theme (`useTheme`) and continue honoring Light/Dark/Auto mode.
- Persistence:
  - Maintain AsyncStorage-backed flows and avoid introducing blocking startup behavior.

## Common Pitfalls
- `react-native-reanimated/plugin` must remain last in `babel.config.js` plugins.
- If Expo/device networking is unreliable, prefer tunnel mode (`npx expo start --tunnel`).
- If navigation appears stuck after practice/detail flows, check stack reset logic in navigation transitions.

## Read First
- `CLAUDE.md`
- `App.tsx`
- `src/navigation/types.ts`
- `src/store/kanjiStore.ts`
- `src/store/progressStore.ts`
- `src/services/validation/AdvancedStrokeValidator.ts`
- `.maestro/README.md`
