import { Text, Pressable } from 'react-native';
import type { PressableProps } from 'react-native';
import { cssInterop } from 'nativewind';

// Enable className support for React Native components
cssInterop(Pressable, { className: 'style' });
cssInterop(Text, { className: 'style' });

export const SharedButton = ({ title, ...props }: { title: string } & PressableProps) => {
  return (
    <Pressable
      {...props}
      className="p-4 my-4 bg-primary dark:bg-primary-dark rounded-lg active:opacity-80"
      style={{ shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6 }}>
      <Text className="text-center text-white font-bold">{title}</Text>
    </Pressable>
  );
};

export { UIThemeProvider, useUITheme } from './theme';
export { ThemedCard } from './examples/ThemedCard';