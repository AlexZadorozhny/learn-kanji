import { NavigatorScreenParams } from '@react-navigation/native';

// Tab Navigator Params
export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList> | undefined;
  Practice: NavigatorScreenParams<PracticeStackParamList> | undefined;
  Progress: undefined;
  Settings: undefined;
};

// Home Stack Params
export type HomeStackParamList = {
  HomeScreen: undefined;
  LessonScreen: undefined;
  KanjiDetail: {
    kanjiId: string;
  };
};

// Practice Stack Params
export type PracticeStackParamList = {
  PracticeModeScreen: undefined;
  FlashcardScreen: {
    kanjiIds?: string[];
  };
  StrokeOrderScreen: {
    kanjiIds?: string[];
    sessionKey?: number;
    fromKanjiDetail?: boolean;
    detailKanjiId?: string;
  };
  MultipleChoiceScreen: {
    kanjiIds?: string[];
  };
  ContextPracticeScreen: {
    kanjiIds?: string[];
  };
  ResultsScreen: {
    sessionId: string;
    returnTo?: 'KanjiDetail';
    returnKanjiId?: string;
  };
};

// Progress Stack Params
export type ProgressStackParamList = {
  ProgressScreen: undefined;
  KanjiDetail: {
    kanjiId: string;
  };
  StatsScreen: undefined;
};

// Settings Stack Params
export type SettingsStackParamList = {
  SettingsScreen: undefined;
  AboutScreen: undefined;
};

// Root Stack Params (if needed for modals, etc.)
export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
};
