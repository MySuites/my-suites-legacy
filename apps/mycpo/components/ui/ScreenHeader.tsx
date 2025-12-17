import React from 'react';
import { View, Text } from 'react-native';

interface ScreenHeaderProps {
  title: string;
  rightAction?: React.ReactNode;
  className?: string; // Allow additional styling if needed, though we aim for consistency
}

export function ScreenHeader({ title, rightAction, className }: ScreenHeaderProps) {
  return (
    <View className={`flex-row justify-between items-center mb-6 mt-10 ${className || ''}`}>
      <Text className="text-3xl font-bold text-apptext dark:text-apptext_dark">{title}</Text>
      {rightAction && (
        <View>
            {rightAction}
        </View>
      )}
    </View>
  );
}
