import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export function ActiveWorkoutEmptyState() {
    const router = useRouter();

    return (
        <View className="flex-1 items-center justify-center">
            <Text className="text-xl text-light dark:text-dark mb-4">No exercises found</Text>
            <TouchableOpacity 
                className="px-6 py-3 rounded-xl bg-primary dark:bg-primary-dark"
                onPress={() => router.push('/exercises')}
            >
                <Text className="text-white font-semibold">+ Add Exercises</Text>
            </TouchableOpacity>
        </View>
    );
}
