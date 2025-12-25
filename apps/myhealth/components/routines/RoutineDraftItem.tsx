import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ScaleDecorator } from 'react-native-draggable-flatlist';
import { ThemedText, useUITheme } from '@mysuite/ui';
import { IconSymbol } from '../ui/icon-symbol';

interface RoutineDraftItemProps {
    item: any;
    drag: () => void;
    isActive: boolean;
    onRemove: () => void;
}

export const RoutineDraftItem = ({
    item,
    drag,
    isActive,
    onRemove
}: RoutineDraftItemProps) => {
    const theme = useUITheme();

    return (
        <ScaleDecorator activeScale={1.05}>
            <TouchableOpacity
                onLongPress={drag}
                disabled={isActive}
                activeOpacity={1}
                className={`bg-light-lighter dark:bg-dark-lighter rounded-xl mb-3 overflow-hidden border p-3 flex-row items-center justify-between ${isActive ? 'border-primary dark:border-primary-dark' : 'border-bg-dark dark:border-bg-dark-dark'}`}
            >
                <View className="flex-row items-center flex-1 mr-2">
                        <View>
                        <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                        <Text className="text-light-muted dark:text-dark-muted text-sm">
                            {item.type === 'rest' ? 'Rest Day' : 'Workout'}
                        </Text>
                    </View>
                </View>
                
                <View className="flex-row items-center">
                    <TouchableOpacity onPressIn={drag} className="p-2 mr-2"> 
                            <IconSymbol name="line.3.horizontal" size={20} color={theme.icon as string} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={(e) => { e.stopPropagation(); onRemove(); }} className="p-2"> 
                        <IconSymbol name="trash.fill" size={18} color={theme.error as string} />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </ScaleDecorator>
    );
};
