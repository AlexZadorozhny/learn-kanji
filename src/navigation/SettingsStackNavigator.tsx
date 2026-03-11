import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import SettingsScreen from '../screens/settings/SettingsScreen';
import LicenseScreen from '../screens/settings/LicenseScreen';
import { SettingsStackParamList } from './types';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export default function SettingsStackNavigator() {
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
        name="SettingsScreen"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerBackVisible: false, // Hide back button on root screen
          headerLeft: () => null, // Explicitly remove left header element
        }}
      />
      <Stack.Screen
        name="LicenseScreen"
        component={LicenseScreen}
        options={{ title: 'Licenses & Attribution' }}
      />
    </Stack.Navigator>
  );
}
