import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import { PracticeStackParamList } from './types';
import PracticeModeScreen from '../screens/practice/PracticeModeScreen';
import FlashcardScreen from '../screens/practice/FlashcardScreen';
import StrokeOrderScreen from '../screens/practice/StrokeOrderScreen';
import MultipleChoiceScreen from '../screens/practice/MultipleChoiceScreen';
import ContextPracticeScreen from '../screens/practice/ContextPracticeScreen';
import ResultsScreen from '../screens/practice/ResultsScreen';

const Stack = createNativeStackNavigator<PracticeStackParamList>();

export default function PracticeStackNavigator() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
      }}
    >
      <Stack.Screen
        name="PracticeModeScreen"
        component={PracticeModeScreen}
        options={{
          title: 'Practice',
        }}
      />
      <Stack.Screen
        name="FlashcardScreen"
        component={FlashcardScreen}
        options={{
          headerShown: false, // Custom header in FlashcardScreen
        }}
      />
      <Stack.Screen
        name="ResultsScreen"
        component={ResultsScreen}
        options={{
          headerShown: false, // Custom header in ResultsScreen
          gestureEnabled: false, // Prevent swipe back during results
        }}
      />
      <Stack.Screen
        name="MultipleChoiceScreen"
        component={MultipleChoiceScreen}
        options={{
          headerShown: false, // Custom header in MultipleChoiceScreen
        }}
      />
      <Stack.Screen
        name="ContextPracticeScreen"
        component={ContextPracticeScreen}
        options={{
          headerShown: false, // Custom header in ContextPracticeScreen
        }}
      />
      <Stack.Screen
        name="StrokeOrderScreen"
        component={StrokeOrderScreen}
        options={{
          headerShown: false, // Custom header in StrokeOrderScreen
        }}
      />
    </Stack.Navigator>
  );
}
