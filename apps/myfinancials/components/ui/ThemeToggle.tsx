import React from 'react';
import { View } from 'react-native';
import { useThemePreference } from '@/app/providers/AppThemeProvider';
import { SharedButton } from '@mysuite/ui';

export const ThemeToggle = () => {
  const { preference, setPreference } = useThemePreference();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 12 }}>
      <SharedButton
        title="Light"
        onPress={() => setPreference('light')}
        className={`px-3 py-2 my-0 mr-2 rounded-md ${preference === 'light' ? 'bg-primary/90 dark:bg-primary-dark/90' : 'bg-light dark:bg-light-lighter'}`}
      />

      <SharedButton
        title="Dark"
        onPress={() => setPreference('dark')}
        className={`px-3 py-2 my-0 mr-2 rounded-md ${preference === 'dark' ? 'bg-primary/90 dark:bg-primary-dark/90' : 'bg-light dark:bg-light-lighter'}`}
      />

      <SharedButton
        title="System"
        onPress={() => setPreference('system')}
        className={`px-3 py-2 my-0 rounded-md ${preference === 'system' ? 'bg-primary/90 dark:bg-primary-dark/90' : 'bg-light dark:bg-light-lighter'}`}
      />
    </View>
  );
};

export default ThemeToggle;
