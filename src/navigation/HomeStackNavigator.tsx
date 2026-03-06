import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import HomeScreen from '../screens/home/HomeScreen';
import KanjiDetailScreen from '../screens/progress/KanjiDetailScreen';
import { HomeStackParamList } from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
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
        name="HomeScreen"
        component={HomeScreen}
        options={{ title: 'Learn Kanji' }}
      />
      <Stack.Screen
        name="KanjiDetail"
        component={KanjiDetailScreen}
        options={{ title: 'Kanji Details' }}
      />
    </Stack.Navigator>
  );
}
