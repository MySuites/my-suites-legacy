import { Text, Pressable } from 'react-native';
import type { PressableProps } from 'react-native';
import { cssInterop } from 'nativewind';

// Enable className support for React Native components (if not already enabled globally)
cssInterop(Pressable, { className: 'style' });
cssInterop(Text, { className: 'style' });

export const HollowedButton = ({ title, className, textClassName, style, ...props }: { title: string; className?: string; textClassName?: string } & PressableProps) => {
  // Neumorphic HollowedCard "Faux Inset" Style
  // Strategy: slightly darker BG + Asymmetric borders to simulate inner shadow/highlight
  const defaultClasses = `
    w-full mb-1 p-4 rounded-xl items-center justify-center
    bg-gray-100 dark:bg-black/20
    border-t-[3px] border-l-[3px] border-b-[1px] border-r-[1px]
    border-t-gray-300 border-l-gray-300 border-b-white border-r-white
    dark:border-t-black/60 dark:border-l-black/60 dark:border-b-white/10 dark:border-r-white/10
  `.replace(/\s+/g, ' ').trim();

  const combined = `${defaultClasses}${className ? ' ' + className : ''}`;

  return (
    <Pressable
      {...props}
      className={combined}
      style={style as any}
    >
      <Text className={textClassName || "text-center text-primary font-bold text-lg"}>{title}</Text>
    </Pressable>
  );
};
