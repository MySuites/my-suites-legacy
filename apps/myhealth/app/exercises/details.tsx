import React, { useMemo } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText, useUITheme } from '@mysuite/ui';
import { useAuth } from '@mysuite/auth';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { useExerciseStats } from '../../hooks/workouts/useExerciseStats';
import { ExerciseChart } from '../../components/exercises/ExerciseChart';
import { ExerciseProperties } from '../../components/exercises/ExerciseProperties';

export default function ExerciseDetailsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const theme = useUITheme();
    const { user } = useAuth();
    
    const exercise = useMemo(() => {
        try {
            if (typeof params.exercise === 'string') {
                return JSON.parse(params.exercise);
            }
            return null;
        } catch {
            return null;
        }
    }, [params.exercise]);

    const {
        chartData,
        loadingChart,
        selectedMetric,
        setSelectedMetric,
        availableMetrics
    } = useExerciseStats(user, exercise);

    if (!exercise) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
                <ThemedText>Exercise not found.</ThemedText>
                <Pressable onPress={() => router.back()} style={{ marginTop: 20, padding: 10 }}>
                    <ThemedText type="link">Go Back</ThemedText>
                </Pressable>
            </View>
        );
    }

    const currentColors = {
        primary: theme.primary || '#FF6F61',
        background: theme.bgLight || '#FFF5F5',
        card: theme.bg || '#EAD4D4',
        text: theme.text || '#2D1F1F',
        border: theme.border || '#EAD4D4'
    };
    
    // Derived UI colors
    const cardBackground = currentColors.card;
    const toggleBackground = theme.bgDark || '#EAD4D4'; 
    const activeToggleBg = theme.bgLight || '#FFF5F5'; 
    const activeToggleText = theme.text || '#2D1F1F';

    return (
        <View style={{ flex: 1, backgroundColor: currentColors.background }}>
             {/* Header */}
             <View style={{ 
                 flexDirection: 'row', 
                 alignItems: 'center', 
                 justifyContent: 'space-between', 
                 paddingHorizontal: 16,
                 paddingVertical: 12,
                 borderBottomWidth: 1, 
                 borderBottomColor: currentColors.border
             }}>
                <Pressable onPress={() => router.back()} style={{ padding: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <IconSymbol name="chevron.left" size={20} color={currentColors.primary} />
                    <ThemedText type="link" style={{ color: currentColors.primary }}>Back</ThemedText>
                </Pressable>
                <ThemedText type="subtitle" style={{ color: currentColors.text }}>Details</ThemedText>
                <View style={{ width: 60 }} />
            </View>

            <ScrollView style={{ flex: 1, padding: 16 }}>
                <View style={{ marginBottom: 24 }}>
                    <ThemedText type="title" style={{ marginBottom: 4, color: currentColors.text }}>{exercise.name || 'Exercise'}</ThemedText>
                    <ThemedText style={{ fontSize: 18, color: currentColors.text, opacity: 0.7 }}>
                        {exercise.category || 'Category'}
                    </ThemedText>
                </View>

                {/* Performance Chart */}
                <ExerciseChart
                    data={chartData}
                    loading={loadingChart}
                    selectedMetric={selectedMetric}
                    onSelectMetric={setSelectedMetric}
                    availableMetrics={availableMetrics}
                    themeColors={currentColors}
                    cardBackground={cardBackground}
                    toggleBackground={toggleBackground}
                    activeToggleBg={activeToggleBg}
                    activeToggleText={activeToggleText}
                />

                <ExerciseProperties
                    properties={exercise.properties}
                    rawType={exercise.rawType}
                    themeColors={currentColors}
                    cardBackground={cardBackground}
                    toggleBackground={toggleBackground}
                />

                 <View style={{ 
                    backgroundColor: cardBackground,
                    borderRadius: 16, 
                    padding: 16, 
                    marginBottom: 120 
                }}>
                    <ThemedText type="defaultSemiBold" style={{ marginBottom: 12, color: currentColors.text }}>Instructions</ThemedText>
                    <ThemedText style={{ color: currentColors.text, opacity: 0.6, lineHeight: 24 }}>
                        No instructions available for this exercise yet.
                    </ThemedText>
                </View>

            </ScrollView>
        </View>
    );
}
