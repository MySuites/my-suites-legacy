import { Text, Pressable } from 'react-native';
import type { PressableProps } from 'react-native';
import { cssInterop } from 'nativewind';
import { useUITheme } from './theme';

// Enable className support for React Native components
cssInterop(Pressable, { className: 'style' });
cssInterop(Text, { className: 'style' });

export const SharedButton = ({ title, className, textClassName, style, ...props }: { title: string; className?: string; textClassName?: string } & PressableProps) => {
  const defaultClasses = 'p-4 my-4 rounded-lg active:opacity-80 items-center justify-center bg-light dark:bg-dark ios:shadow-sm';
  const combined = `${defaultClasses}${className ? ' ' + className : ''}`;

  return (
    <Pressable
      {...props}
      className={combined}
      style={[style] as any}>
      <Text className={textClassName || "text-center text-white font-bold"}>{title}</Text>
    </Pressable>
  );
};

export { UIThemeProvider, useUITheme } from './theme';
export { ThemedCard } from './examples/ThemedCard';
export { ThemedText } from './ThemedText';