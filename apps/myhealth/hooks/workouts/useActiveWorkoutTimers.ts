import { useCallback, useEffect, useRef, useState } from "react";

export function useActiveWorkoutTimers() {
    const [isRunning, setRunning] = useState(false);
    const [workoutSeconds, setWorkoutSeconds] = useState(0);
    const workoutTimerRef = useRef<number | null>(null as any);

    useEffect(() => {
        if (isRunning) {
            workoutTimerRef.current = setInterval(() => {
                setWorkoutSeconds((s) => s + 1);
            }, 1000) as any;
        } else if (workoutTimerRef.current) {
            clearInterval(workoutTimerRef.current as any);
            workoutTimerRef.current = null;
        }

        return () => {
            if (workoutTimerRef.current) {
                clearInterval(workoutTimerRef.current as any);
            }
        };
    }, [isRunning]);

    const resetTimers = useCallback(() => {
        setWorkoutSeconds(0);
    }, []);

    return {
        isRunning,
        setRunning,
        workoutSeconds,
        setWorkoutSeconds,
        resetTimers,
    };
}
