import { Text, Pressable, StyleSheet } from 'react-native';
import type { PressableProps } from 'react-native';
import { cssInterop } from 'nativewind';
import { useUITheme } from './theme';

// Enable className support for React Native components
cssInterop(Pressable, { className: 'style' });
cssInterop(Text, { className: 'style' });

export const SharedButton = ({ title, className, style, ...props }: { title: string; className?: string } & PressableProps) => {
  const defaultClasses = 'p-4 my-4 rounded-lg active:opacity-80';
  const combined = `${defaultClasses}${className ? ' ' + className : ''}`;
  const theme = useUITheme();

  return (
    <Pressable
      {...props}
      className={combined}
      style={[{ backgroundColor: theme.primary, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6 }, style] as any}>
      <Text style={styles.title}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '700',
  },
});

export { UIThemeProvider, useUITheme } from './theme';
export { ThemedCard } from './examples/ThemedCard';