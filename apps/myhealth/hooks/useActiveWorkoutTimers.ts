import { useCallback, useEffect, useRef, useState } from "react";

export function useActiveWorkoutTimers() {
    const [isRunning, setRunning] = useState(false);
    const [workoutSeconds, setWorkoutSeconds] = useState(0);
    const workoutTimerRef = useRef<number | null>(null as any);

    const [restSeconds, setRestSeconds] = useState(0);
    const restTimerRef = useRef<number | null>(null as any);

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

    useEffect(() => {
        if (restSeconds > 0) {
            restTimerRef.current = setInterval(() => {
                setRestSeconds((r) => {
                    if (r <= 1) {
                        clearInterval(restTimerRef.current as any);
                        restTimerRef.current = null;
                        return 0;
                    }
                    return r - 1;
                });
            }, 1000) as any;
        }

        return () => {
            if (restTimerRef.current) {
                clearInterval(restTimerRef.current as any);
            }
        };
    }, [restSeconds]);

    const resetTimers = useCallback(() => {
        setWorkoutSeconds(0);
        setRestSeconds(0);
    }, []);

    const startRestTimer = useCallback((seconds: number = 60) => {
        setRestSeconds(seconds);
    }, []);

    return {
        isRunning,
        setRunning,
        workoutSeconds,
        setWorkoutSeconds,
        restSeconds,
        setRestSeconds,
        resetTimers,
        startRestTimer,
    };
}
