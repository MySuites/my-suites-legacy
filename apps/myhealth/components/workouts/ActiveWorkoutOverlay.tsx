"use client"

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useActiveWorkout } from '../../providers/ActiveWorkoutProvider';
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { ActiveWorkoutEmptyState } from './ActiveWorkoutEmptyState';
import { ActiveWorkoutExerciseItem } from './ActiveWorkoutExerciseItem';

export function ActiveWorkoutOverlay() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    
    const {
        exercises,
        restSeconds,
        currentIndex,
        completeSet,
        updateExercise,
        isExpanded,
        setExpanded,

    } = useActiveWorkout();



    useEffect(() => {
        if (!isExpanded) return;

        const onBackPress = () => {
            setExpanded(false);
            return true; // prevent default behavior
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => subscription.remove();
    }, [isExpanded, setExpanded]);





    if (!isExpanded) return null;

    return (
        <Animated.View 
            style={{ paddingTop: insets.top + 50 }} // Top padding for Persistent Header
            className="absolute inset-0 z-[999] bg-background dark:bg-background_dark"
            entering={SlideInUp.duration(400)} 
            exiting={SlideOutUp.duration(400)}
        >
            <View className="flex-1">
                <ScrollView contentContainerStyle={{ padding: 5, paddingTop: 20, paddingBottom: 150 }}>
                     {(!exercises || exercises.length === 0) ? (
                        <ActiveWorkoutEmptyState />
                     ) : (
                        <>
                            {exercises.map((exercise, index) => (
                                <ActiveWorkoutExerciseItem
                                    key={index}
                                    exercise={exercise}
                                    index={index}
                                    isCurrent={index === currentIndex}
                                    restSeconds={restSeconds}
                                    completeSet={completeSet}
                                    updateExercise={updateExercise}
                                />
                            ))}
                            <TouchableOpacity 
                                className="mt-5 p-4 rounded-xl border border-dashed border-primary dark:border-primary_dark items-center justify-center"
                                onPress={() => router.push('/exercises')}
                            >
                                <Text className="text-base font-semibold text-primary dark:text-primary_dark">+ Add Exercise</Text>
                            </TouchableOpacity>
                        </>
                     )}
                </ScrollView>
            </View>

        </Animated.View>
    );
}

