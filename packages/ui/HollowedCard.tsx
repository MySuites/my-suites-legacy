import * as React from 'react';
import { View, Pressable, ViewProps, PressableProps } from 'react-native';
import { cssInterop } from 'nativewind';

interface CardProps extends Omit<PressableProps, 'children'> {
  children?: React.ReactNode;
  onPress?: () => void;
  className?: string;
}

// Enable className support for Pressable
cssInterop(Pressable, { className: 'style' });

export function HollowedCard({ children, style, className, onPress, ...props }: CardProps) {
  // Neumorphic HollowedCard "Faux Inset" Style using NativeWind
  // Strategy: slightly darker BG + Asymmetric borders to simulate inner shadow/highlight
  // Light Mode: slightly darker BG (gray-200), Top-Left Border Darker (gray-300), Bottom-Right Border lighter (white)
  // Dark Mode: darker BG (black/20), Top-Left Border Black, Bottom-Right Border lighter (gray-800)
  
  const baseClassName = `
    w-full mb-1 p-3 rounded-xl
    bg-gray-100 dark:bg-black/20
    active:bg-gray-200 dark:active:bg-black/40
    border-t-[3px] border-l-[3px] border-b-[1px] border-r-[1px]
    border-t-gray-300 border-l-gray-300 border-b-white border-r-white
    active:border-t-gray-400 active:border-l-gray-400 active:border-b-gray-200 active:border-r-gray-200
    dark:border-t-black/60 dark:border-l-black/60 dark:border-b-white/10 dark:border-r-white/10
    dark:active:border-t-black/80 dark:active:border-l-black/80 dark:active:border-b-white/5 dark:active:border-r-white/5
    ${className || ''}
  `.replace(/\s+/g, ' ').trim();
  
  const shadowStyle = { 
    //   overflow: 'hidden' as const
  };

  return onPress ? (
    <Pressable 
        style={[style as any, shadowStyle]} 
        className={baseClassName} 
        onPress={onPress} 
        {...props}
    >
        {children}
    </Pressable>
  ) : (
    <View style={[style, shadowStyle]} className={baseClassName} {...props}>
        {children}
    </View>
  );
}
