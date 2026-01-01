import { useCallback, useEffect, useRef, useState } from "react";

export function useActiveWorkoutTimers() {
    const [isRunning, setRunning] = useState(false);
    const [workoutSeconds, setWorkoutSeconds] = useState(0);
    const [restSeconds, setRestSeconds] = useState(0);
    const workoutTimerRef = useRef<number | null>(null as any);
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
        if (restSeconds > 0 && !restTimerRef.current) {
            restTimerRef.current = setInterval(() => {
                setRestSeconds((s) => {
                    if (s <= 1) {
                        if (restTimerRef.current) {
                            clearInterval(restTimerRef.current as any);
                        }
                        restTimerRef.current = null;
                        return 0;
                    }
                    return s - 1;
                });
            }, 1000) as any;
        }

        return () => {
            // Cleanup on unmount or if we want to stop
            if (restTimerRef.current && restSeconds === 0) {
                clearInterval(restTimerRef.current as any);
                restTimerRef.current = null;
            }
        };
    }, [restSeconds]);

    // Ensure cleanup of rest timer on unmount
    useEffect(() => {
        return () => {
            if (restTimerRef.current) {
                clearInterval(restTimerRef.current as any);
            }
        };
    }, []);

    const startRestTimer = useCallback((seconds: number) => {
        // Clear existing if any
        if (restTimerRef.current) {
            clearInterval(restTimerRef.current as any);
            restTimerRef.current = null;
        }
        setRestSeconds(seconds);
    }, []);

    const resetTimers = useCallback(() => {
        setWorkoutSeconds(0);
        setRestSeconds(0);
        if (restTimerRef.current) {
            clearInterval(restTimerRef.current as any);
            restTimerRef.current = null;
        }
    }, []);

    return {
        isRunning,
        setRunning,
        workoutSeconds,
        setWorkoutSeconds,
        restSeconds,
        startRestTimer,
        resetTimers,
    };
}
