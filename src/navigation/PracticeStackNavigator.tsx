import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PracticeStackParamList } from './types';
import PracticeModeScreen from '../screens/practice/PracticeModeScreen';
import FlashcardScreen from '../screens/practice/FlashcardScreen';
import ResultsScreen from '../screens/practice/ResultsScreen';

const Stack = createNativeStackNavigator<PracticeStackParamList>();

export default function PracticeStackNavigator() {
  return (
    <Stack.Navigator>
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
      {/* Placeholder screens for future implementation */}
      <Stack.Screen
        name="StrokeOrderScreen"
        component={PracticeModeScreen} // Placeholder
        options={{
          title: 'Stroke Order Practice',
        }}
      />
      <Stack.Screen
        name="MultipleChoiceScreen"
        component={PracticeModeScreen} // Placeholder
        options={{
          title: 'Multiple Choice Quiz',
        }}
      />
      <Stack.Screen
        name="ContextPracticeScreen"
        component={PracticeModeScreen} // Placeholder
        options={{
          title: 'Context Practice',
        }}
      />
    </Stack.Navigator>
  );
}
