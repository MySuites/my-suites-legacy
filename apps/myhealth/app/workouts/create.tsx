import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUITheme as useTheme, ThemedText } from '@mysuite/ui';
import { useAuth } from '@mysuite/auth';
import { useWorkoutManager, fetchExercises } from '../../hooks/workouts/useWorkoutManager';
import { useFloatingButton } from '../../providers/FloatingButtonContext';
import { useWorkoutDraft } from '../../hooks/workouts/useWorkoutDraft';
import { WorkoutDraftExerciseItem } from '../../components/workouts/WorkoutDraftExerciseItem';
import { ExerciseSelectorModal } from '../../components/workouts/ExerciseSelectorModal';
import { useActiveWorkout } from '../../providers/ActiveWorkoutProvider';

export default function CreateWorkoutScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { user } = useAuth();
    const { setIsHidden } = useFloatingButton();
    const { latestBodyWeight } = useActiveWorkout();
    
    useEffect(() => {
        setIsHidden(true);
        return () => setIsHidden(false);
    }, [setIsHidden]);

    const { 
        savedWorkouts, 
        saveWorkout, 
        updateSavedWorkout, 
        deleteSavedWorkout 
    } = useWorkoutManager();

    const editingWorkoutId = typeof id === 'string' ? id : null;
    const [workoutDraftName, setWorkoutDraftName] = useState("");
    
    const {
        workoutDraftExercises,
        setWorkoutDraftExercises,
        addExercise,
        removeExercise,
        moveExercise,
        updateSetTarget,
        addSet,
        removeSet
    } = useWorkoutDraft([]);

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [isAddingExercise, setIsAddingExercise] = useState(false);
    const [availableExercises, setAvailableExercises] = useState<any[]>([]);
    const [isLoadingExercises, setIsLoadingExercises] = useState(false);

    const [expandedDraftExerciseIndex, setExpandedDraftExerciseIndex] = useState<number | null>(null);

    useEffect(() => {
        if (editingWorkoutId) {
            const workout = savedWorkouts.find(w => w.id === editingWorkoutId);
            if (workout) {
                setWorkoutDraftName(workout.name);
                setWorkoutDraftExercises(workout.exercises ? JSON.parse(JSON.stringify(workout.exercises)) : []);
            } else {
                Alert.alert("Error", "Workout not found");
                router.back();
            }
        }
        setIsLoading(false);
    }, [editingWorkoutId, savedWorkouts, router, setWorkoutDraftExercises]);

    async function handleSaveWorkoutDraft() {
        if (!workoutDraftName.trim()) {
            Alert.alert("Required", "Please enter a workout name");
            return;
        }

        setIsSaving(true);
        const onSuccess = () => {
             setIsSaving(false);
             router.back();
        };

        if (editingWorkoutId) {
            updateSavedWorkout(editingWorkoutId, workoutDraftName, workoutDraftExercises, onSuccess);
        } else {
            saveWorkout(workoutDraftName, workoutDraftExercises, onSuccess);
        }
    }

    async function fetchAvailableExercises() {
        if (!user) return;
        setIsLoadingExercises(true);
        try {
             const { data } = await fetchExercises(user);
             setAvailableExercises(data || []);
        } catch (e) {
            console.error("Failed to fetch exercises", e);
        } finally {
            setIsLoadingExercises(false);
        }
    }

    function handleOpenAddExercise() {
        setIsAddingExercise(true);
        fetchAvailableExercises();
    }

    function handleAddExercise(exercise: any) {
        addExercise(exercise);
        setIsAddingExercise(false);
    }

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-light dark:bg-dark">
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-light dark:bg-dark">
             <View className="flex-row justify-between items-center p-4 border-b border-bg-dark dark:border-white/10 pt-4 android:pt-10">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                     <ThemedText type="link">Cancel</ThemedText>
                </TouchableOpacity>
                <ThemedText type="subtitle">{editingWorkoutId ? 'Edit Workout' : 'Create Workout'}</ThemedText>
                <TouchableOpacity disabled={isSaving} onPress={handleSaveWorkoutDraft} className="p-2">
                    {isSaving ? <ActivityIndicator size="small" /> : <ThemedText type="link" style={{ fontWeight: 'bold' }}>Save</ThemedText>}
                </TouchableOpacity>
            </View>

            <View className="flex-1 p-4">
                <TextInput 
                    placeholder="Workout Name" 
                    value={workoutDraftName} 
                    onChangeText={setWorkoutDraftName} 
                    className="bg-light dark:bg-dark text-light dark:text-dark p-4 rounded-xl text-base border border-transparent dark:border-white/10 mb-6"
                    placeholderTextColor={theme.icon}
                />
                
                <View className="flex-row justify-between items-center mb-2">
                    <ThemedText type="defaultSemiBold">Exercises</ThemedText>
                    <TouchableOpacity onPress={handleOpenAddExercise}>
                        <ThemedText type="link" style={{ fontSize: 16 }}>+ Add Exercise</ThemedText>
                    </TouchableOpacity>
                </View>

                {workoutDraftExercises.length === 0 ? (
                    <View className="flex-1 justify-center items-center opacity-50">
                        <ThemedText className="mb-2 text-lg" style={{ color: theme.icon }}>No exercises added yet</ThemedText>
                        <TouchableOpacity onPress={handleOpenAddExercise}>
                            <ThemedText type="link" style={{ fontSize: 18 }}>Add Exercise</ThemedText>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={workoutDraftExercises}
                        keyExtractor={(item, index) => `${index}-${item.name}`} 
                        className="flex-1 mb-4"
                        showsVerticalScrollIndicator={false}
                        renderItem={({item, index}) => (
                            <WorkoutDraftExerciseItem
                                item={item}
                                index={index}
                                isExpanded={expandedDraftExerciseIndex === index}
                                onToggleExpand={() => setExpandedDraftExerciseIndex(expandedDraftExerciseIndex === index ? null : index)}
                                onMove={(dir) => moveExercise(index, dir)}
                                onRemove={() => removeExercise(index)}
                                onUpdateSet={(setIndex, field, value) => updateSetTarget(index, setIndex, field, value)}
                                onAddSet={() => addSet(index)}
                                onRemoveSet={(setIndex) => removeSet(index, setIndex)}
                                latestBodyWeight={latestBodyWeight}
                            />
                        )}
                    />
                )}
                
                {editingWorkoutId && (
                    <TouchableOpacity 
                        onPress={() => {
                            Alert.alert('Delete Workout', 'Are you sure?', [
                                { text: 'Cancel', style: 'cancel' },
                                { 
                                    text: 'Delete', 
                                    style: 'destructive', 
                                    onPress: () => {
                                        deleteSavedWorkout(editingWorkoutId, {
                                            onSuccess: () => {
                                                router.back();
                                            }
                                        });
                                    }
                                }
                            ])
                        }} 
                        className="py-3 items-center mt-2 mb-6"
                    >
                        <Text className="text-red-500 font-semibold text-base">Delete Workout</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Add Exercise Modal */}
            <ExerciseSelectorModal
                visible={isAddingExercise}
                onClose={() => setIsAddingExercise(false)}
                onSelect={handleAddExercise}
                exercises={availableExercises}
                isLoading={isLoadingExercises}
            />
        </View>
    );
}
