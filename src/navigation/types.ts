import { NavigatorScreenParams } from '@react-navigation/native';

// Tab Navigator Params
export type MainTabParamList = {
  Home: undefined;
  Practice: undefined;
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
  };
  MultipleChoiceScreen: {
    kanjiIds?: string[];
  };
  ContextPracticeScreen: {
    kanjiIds?: string[];
  };
  ResultsScreen: {
    sessionId: string;
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
