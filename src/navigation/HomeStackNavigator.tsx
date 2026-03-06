import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen';
import KanjiDetailScreen from '../screens/progress/KanjiDetailScreen';
import { HomeStackParamList } from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator>
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
