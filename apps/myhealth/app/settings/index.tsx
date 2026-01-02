import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useUITheme, ThemeToggle, IconSymbol } from '@mysuite/ui';
import { useThemePreference } from '../../providers/AppThemeProvider';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { BackButton } from '../../components/ui/BackButton';
import { ProfileButton } from '../../components/ui/ProfileButton';

export default function SettingsScreen() {
  const theme = useUITheme();
  console.log('SettingsScreen theme:', theme);
  const { preference, setPreference } = useThemePreference();

  return (
    <View className="flex-1 bg-light dark:bg-dark">
      <ScreenHeader 
        title="Settings" 
        leftAction={<BackButton />} 
        rightAction={<ProfileButton />}
      />

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 140 }}>
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-500 mb-2 uppercase">Appearance</Text>
          <ThemeToggle preference={preference} setPreference={setPreference} />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-500 mb-2 uppercase">Legal</Text>
          <TouchableOpacity className="flex-row justify-between items-center py-3 border-b border-light dark:border-dark" onPress={() => Alert.alert('Privacy Policy', 'Link to Privacy Policy')}>
            <Text className="text-base text-light dark:text-dark">Privacy Policy</Text>
            <IconSymbol name="chevron.right" size={20} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row justify-between items-center py-3 border-b border-light dark:border-dark" onPress={() => Alert.alert('Terms of Service', 'Link to Terms of Service')}>
            <Text className="text-base text-light dark:text-dark">Terms of Service</Text>
            <IconSymbol name="chevron.right" size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>
        
        <Text className="text-center text-xs text-gray-500 mt-6">Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}
