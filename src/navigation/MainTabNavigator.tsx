import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import HomeStackNavigator from './HomeStackNavigator';
import PracticeStackNavigator from './PracticeStackNavigator';
import SettingsStackNavigator from './SettingsStackNavigator';
import ProgressScreen from '../screens/progress/ProgressScreen';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          headerShown: false,
          tabBarButtonTestID: 'tab-home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [
                  {
                    name: 'Home',
                    state: {
                      index: 0,
                      routes: [{ name: 'HomeScreen' }],
                    },
                  },
                  { name: 'Practice' },
                  { name: 'Progress' },
                  { name: 'Settings' },
                ],
              })
            );
          },
        })}
      />
      <Tab.Screen
        name="Practice"
        component={PracticeStackNavigator}
        options={{
          headerShown: false,
          tabBarButtonTestID: 'tab-practice',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="school" color={color} size={size} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.dispatch(
              CommonActions.reset({
                index: 1,
                routes: [
                  { name: 'Home' },
                  {
                    name: 'Practice',
                    state: {
                      index: 0,
                      routes: [{ name: 'PracticeModeScreen' }],
                    },
                  },
                  { name: 'Progress' },
                  { name: 'Settings' },
                ],
              })
            );
          },
        })}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          tabBarButtonTestID: 'tab-progress',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-line" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{
          headerShown: false,
          tabBarButtonTestID: 'tab-settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" color={color} size={size} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.dispatch(
              CommonActions.reset({
                index: 3,
                routes: [
                  { name: 'Home' },
                  { name: 'Practice' },
                  { name: 'Progress' },
                  {
                    name: 'Settings',
                    state: {
                      index: 0,
                      routes: [{ name: 'SettingsScreen' }],
                    },
                  },
                ],
              })
            );
          },
        })}
      />
    </Tab.Navigator>
  );
}
