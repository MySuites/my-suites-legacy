import React from 'react';
import { useUITheme } from '@mycsuite/ui';
import { ExerciseCard } from '../exercises/ExerciseCard';

interface ActiveWorkoutExerciseItemProps {
    exercise: any;
    index: number;
    isCurrent: boolean;
    restSeconds: number;
    completeSet: (exerciseIndex: number, input: any) => void;
    updateExercise: (exerciseIndex: number, updates: any) => void;
}

export function ActiveWorkoutExerciseItem({
    exercise,
    index,
    isCurrent,
    restSeconds,
    completeSet,
    updateExercise,
}: ActiveWorkoutExerciseItemProps) {
    const theme = useUITheme();

    return (
        <ExerciseCard 
            exercise={exercise}
            isCurrent={isCurrent}
            restSeconds={restSeconds}
            theme={theme}
            onCompleteSet={(input) => {
                const parsedInput = {
                    weight: input?.weight ? parseFloat(input.weight) : undefined,
                    reps: input?.reps ? parseFloat(input.reps) : undefined,
                    duration: input?.duration ? parseFloat(input.duration) : undefined,
                    distance: input?.distance ? parseFloat(input.distance) : undefined,
                };
                completeSet(index, parsedInput);
            }}
            onUncompleteSet={(setIndex) => {
                const currentLogs = exercise.logs || [];
                if (setIndex < currentLogs.length) {
                    const newLogs = [...currentLogs];
                    newLogs.splice(setIndex, 1);
                    updateExercise(index, { 
                        logs: newLogs, 
                        completedSets: (exercise.completedSets || 1) - 1,
                    });
                }
            }}
            onUpdateSetTarget={(setIndex, key, value) => {
                const numValue = value === '' ? 0 : parseFloat(value);
                const currentTargets = exercise.setTargets ? [...exercise.setTargets] : [];
                
                // Ensure targets exist up to setIndex
                while (currentTargets.length <= setIndex) {
                    currentTargets.push({ weight: 0, reps: exercise.reps });
                }

                currentTargets[setIndex] = {
                    ...currentTargets[setIndex],
                    [key]: isNaN(numValue) ? 0 : numValue
                };

                updateExercise(index, { setTargets: currentTargets });
            }}
            
            onUpdateLog={(setIndex, key, value) => {
                const newLogs = [...(exercise.logs || [])];
                if (newLogs[setIndex]) {
                    // Cast to any to allow string intermediate state for better input UX, 
                    // or assumes SetLog handles string/number.
                    // If strict typing requires number, we might need a local state approach.
                    // For now, mirroring flexible behavior.
                    (newLogs[setIndex] as any)[key] = value;
                    updateExercise(index, { logs: newLogs });
                }
            }}
            onAddSet={() => {
                const nextSetIndex = exercise.sets;
                const previousTarget = exercise.setTargets?.[nextSetIndex - 1];
                
                // Default fallback or use previous values
                const newTarget = previousTarget 
                    ? { ...previousTarget }
                    : { weight: 0, reps: exercise.reps };
                    
                const currentTargets = exercise.setTargets ? [...exercise.setTargets] : [];
                
                // Ensure array continuity
                while (currentTargets.length < nextSetIndex) {
                    currentTargets.push({ weight: 0, reps: exercise.reps });
                }
                
                currentTargets[nextSetIndex] = newTarget;

                updateExercise(index, { 
                    sets: exercise.sets + 1,
                    setTargets: currentTargets
                });
            }}
            onDeleteSet={(setIndex) => {
                const currentLogs = exercise.logs || [];
                const currentTarget = exercise.sets;
                const currentSetTargets = exercise.setTargets ? [...exercise.setTargets] : [];

                // Remove the target definition for this index if it exists
                // This ensures that if we delete set 1, set 2's target becomes the new set 1 target
                if (setIndex < currentSetTargets.length) {
                    currentSetTargets.splice(setIndex, 1);
                }
                
                if (setIndex < currentLogs.length) {
                    // Deleting a completed set (log)
                    const newLogs = [...currentLogs];
                    newLogs.splice(setIndex, 1);
                    updateExercise(index, { 
                        logs: newLogs, 
                        setTargets: currentSetTargets,
                        completedSets: Math.max(0, (exercise.completedSets || 1) - 1),
                        sets: Math.max(0, currentTarget - 1)
                    });
                } else {
                    // Deleting a future/planned set
                    updateExercise(index, { 
                        sets: Math.max(0, currentTarget - 1),
                        setTargets: currentSetTargets
                    });
                }
            }}
        />
    );
}
