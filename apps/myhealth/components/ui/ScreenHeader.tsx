import React from 'react';
import { View, Text } from 'react-native';

interface ScreenHeaderProps {
  title: string;
  rightAction?: React.ReactNode;
  className?: string; // Allow additional styling if needed, though we aim for consistency
}

export function ScreenHeader({ title, rightAction, className }: ScreenHeaderProps) {
  return (
    <View className={`px-4 pt-4 mt-10 ${className || ''}`}>
      <View className="flex-row justify-center items-center relative">
        <Text className="text-3xl font-bold text-light dark:text-dark text-center">{title}</Text>
        {rightAction && (
          <View className="absolute right-0">
              {rightAction}
          </View>
        )}
      </View>
      <View className="h-px bg-border dark:bg-border-dark mt-2 -mx-4" />
    </View>
  );
}
