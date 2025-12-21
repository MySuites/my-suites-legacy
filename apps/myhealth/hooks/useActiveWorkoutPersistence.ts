import { useEffect } from "react";
import { Exercise } from "./useWorkoutManager";

interface UseActiveWorkoutPersistenceProps {
    exercises: Exercise[];
    workoutSeconds: number;
    workoutName: string;
    isRunning: boolean;
    routineId: string | null;
    setExercises: (exercises: Exercise[]) => void;
    setWorkoutSeconds: (seconds: number) => void;
    setWorkoutName: (name: string) => void;
    setRoutineId: (id: string | null) => void;
    setRunning: (running: boolean) => void;
    setHasActiveSession: (hasSession: boolean) => void;
}

export function useActiveWorkoutPersistence({
    exercises,
    workoutSeconds,
    workoutName,
    isRunning,
    routineId,
    setExercises,
    setWorkoutSeconds,
    setWorkoutName,
    setRoutineId,
    setRunning,
    setHasActiveSession,
}: UseActiveWorkoutPersistenceProps) {
    // Persist to local storage
    useEffect(() => {
        try {
            if (typeof window !== "undefined" && window.localStorage) {
                window.localStorage.setItem(
                    "myhealth_workout_exercises",
                    JSON.stringify(exercises),
                );
                window.localStorage.setItem(
                    "myhealth_workout_seconds",
                    workoutSeconds.toString(),
                );
                window.localStorage.setItem(
                    "myhealth_workout_name",
                    workoutName,
                );
                if (routineId) {
                    window.localStorage.setItem(
                        "myhealth_workout_routine_id",
                        routineId,
                    );
                } else {window.localStorage.removeItem(
                        "myhealth_workout_routine_id",
                    );}
                window.localStorage.setItem(
                    "myhealth_workout_running",
                    JSON.stringify(isRunning),
                );
            }
        } catch {
            // ignore
        }
    }, [exercises, workoutSeconds, workoutName, isRunning, routineId]);

    // Load from local storage
    useEffect(() => {
        try {
            if (typeof window !== "undefined" && window.localStorage) {
                const sec = window.localStorage.getItem(
                    "myhealth_workout_seconds",
                );
                if (sec) setWorkoutSeconds(parseInt(sec, 10));

                const name = window.localStorage.getItem(
                    "myhealth_workout_name",
                );
                if (name) setWorkoutName(name);

                const rId = window.localStorage.getItem(
                    "myhealth_workout_routine_id",
                );
                if (rId) setRoutineId(rId);

                const running = window.localStorage.getItem(
                    "myhealth_workout_running",
                );
                if (running) {
                    setRunning(JSON.parse(running));
                    if (JSON.parse(running)) setHasActiveSession(true);
                }
            }
        } catch {
            // ignore
        }
    }, [
        setWorkoutSeconds,
        setWorkoutName,
        setRoutineId,
        setRunning,
        setHasActiveSession,
    ]);

    const clearPersistence = () => {
        try {
            if (typeof window !== "undefined" && window.localStorage) {
                window.localStorage.removeItem("myhealth_workout_exercises");
                window.localStorage.removeItem("myhealth_workout_seconds");
                window.localStorage.removeItem("myhealth_workout_name");
                window.localStorage.removeItem("myhealth_workout_routine_id");
                window.localStorage.removeItem("myhealth_workout_running");
            }
        } catch {}
    };

    return { clearPersistence };
}
