import React from 'react';
import { View } from 'react-native';
import { useThemePreference } from '../../providers/AppThemeProvider';
import { SharedButton } from '@mysuite/ui';

export const ThemeToggle = () => {
  const { preference, setPreference } = useThemePreference();

  return (
    <View className="flex-row items-center my-3">
      <SharedButton
        title="Light"
        onPress={() => setPreference('light')}
        className={`px-3 py-2 my-0 mr-2 rounded-md ${preference === 'light' ? 'bg-primary' : 'bg-light dark:bg-dark opacity-70'}`}
        textClassName={preference === 'light' ? 'text-white' : 'text-light dark:text-dark'}
      />

      <SharedButton
        title="Dark"
        onPress={() => setPreference('dark')}
        className={`px-3 py-2 my-0 mr-2 rounded-md ${preference === 'dark' ? 'bg-primary dark:bg-primary-dark' : 'bg-light dark:bg-dark opacity-70'}`}
        textClassName={preference === 'dark' ? 'text-white' : 'text-light dark:text-dark'}
      />

      <SharedButton
        title="System"
        onPress={() => setPreference('system')}
        className={`px-3 py-2 my-0 rounded-md ${preference === 'system' ? 'bg-primary dark:bg-primary-dark' : 'bg-light dark:bg-dark opacity-70'}`}
        textClassName={preference === 'system' ? 'text-white' : 'text-light dark:text-dark'}
      />
    </View>
  );
};

export default ThemeToggle;
