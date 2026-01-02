import { supabase } from "@mysuite/auth";

import ExerciseDefaultData from "../../assets/data/default-exercises.json";
import { DataRepository } from "../../providers/DataRepository";

export async function fetchExercises(user: any) {
    let data;

    if (user) {
        // Fetch user specific exercises with muscle groups
        const { data: userData, error } = await supabase
            .from("exercises")
            .select(`
                exercise_id, 
                exercise_name, 
                properties,
                exercise_muscle_groups (
                    role,
                    muscle_groups ( name )
                )
            `)
            .order("exercise_name", { ascending: true });

        if (error) return { data: [], error };
        data = userData;
    } else {
        // Guest: Use default data
        data = ExerciseDefaultData.map((e: any) => ({
            exercise_id: e.id,
            exercise_name: e.name,
            properties: e.type,
            exercise_muscle_groups: [{
                role: "primary",
                muscle_groups: { name: e.muscle_group },
            }],
        }));
    }

    const mapped = data.map((e: any) => {
        // Get primary muscle group or first available
        const muscles = e.exercise_muscle_groups || [];
        const primary = muscles.find((m: any) => m.role === "primary");
        const firstMuscle = primary
            ? primary.muscle_groups?.name
            : (muscles[0]?.muscle_groups?.name);

        // Parse properties from comma-separated string
        const properties = e.properties
            ? e.properties.split(",").map((s: string) => s.trim())
            : [];

        return {
            id: e.exercise_id,
            name: e.exercise_name,
            category: firstMuscle || "General",
            properties: properties,
            // Keep rawType if needed for now, or just rely on properties
            rawType: e.properties,
        };
    });

    return { data: mapped, error: null };
}

// Fetch all available muscle groups
export async function fetchMuscleGroups() {
    const { data, error } = await supabase
        .from("muscle_groups")
        .select("*")
        .order("name", { ascending: true });
    return { data, error };
}

// Fetch stats for chart
export async function fetchExerciseStats(
    user: any,
    exerciseId: string,
    metric: "weight" | "reps" | "duration" | "distance" = "weight",
) {
    if (!user) {
        // Guest: Calculate from local history
        // DataRepository.getExerciseStats only supports 'maxWeight' logic.
        // We need full day-by-day aggregation for the chart.
        // So we reimplement the aggregation logic using local history here.

        try {
            const history = await DataRepository.getHistory();
            const grouped = new Map();

            history.forEach((h: any) => {
                h.exercises.forEach((e: any) => {
                    // Check if matches by ID or Name (for reliability)
                    if (
                        e.id === exerciseId ||
                        e.name === exerciseId /* Fallback if ID is name */
                    ) {
                        if (e.logs) {
                            const dateKey = new Date(h.date).toDateString();

                            e.logs.forEach((log: any) => {
                                let val = 0;
                                let valid = false;

                                // Logic mirror from supabase version
                                if (metric === "weight" && log.weight) {
                                    val = log.weight;
                                    valid = true;
                                } else if (metric === "reps" && log.reps) {
                                    val = log.reps;
                                    valid = true;
                                } else if (
                                    metric === "duration" && log.duration
                                ) {
                                    val = log.duration;
                                    valid = true;
                                } else if (
                                    metric === "distance" && log.distance
                                ) {
                                    val = log.distance;
                                    valid = true;
                                }

                                if (valid) {
                                    if (!grouped.has(dateKey)) {
                                        grouped.set(dateKey, {
                                            date: h.date,
                                            max: val,
                                            total: val,
                                            dataPointText: val.toString(),
                                        });
                                    } else {
                                        const entry = grouped.get(dateKey);
                                        if (val > entry.max) {
                                            entry.max = val;
                                            entry.dataPointText = val
                                                .toString();
                                        }
                                        entry.total += val;
                                    }
                                }
                            });
                        }
                    }
                });
            });

            const sorted = Array.from(grouped.values()).sort((a: any, b: any) =>
                new Date(a.date).getTime() - new Date(b.date).getTime()
            );

            const chartData = sorted.map((item: any) => ({
                value: item.max,
                label: new Date(item.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                }),
                dataPointText: item.dataPointText,
            }));

            return { data: chartData, error: null };
        } catch (e) {
            console.error("Local stats error", e);
            return { data: [], error: e };
        }
    }

    const { data: setLogs, error } = await supabase
        .from("set_logs")
        // ...
        // ...

        // ... (Perform similar update for fetchLastExercisePerformance)

        .select(`
            details,
            created_at,
            workout_log_id
        `)
        .eq("exercise_id", exerciseId)
        .order("created_at", { ascending: true });

    if (error) return { data: [], error };

    // Aggregate by day
    const grouped = new Map();
    setLogs.forEach((log: any) => {
        if (!log.details) return;

        const dateKey = new Date(log.created_at).toDateString(); // Group by calendar day

        // Determine value based on requested metric
        let val = 0;
        let valid = false;

        if (
            metric === "weight" && log.details.weight &&
            !isNaN(parseFloat(log.details.weight))
        ) {
            val = parseFloat(log.details.weight);
            valid = true;
        } else if (
            metric === "reps" && log.details.reps &&
            !isNaN(parseFloat(log.details.reps))
        ) {
            val = parseFloat(log.details.reps);
            valid = true;
        } else if (
            metric === "duration" && log.details.duration &&
            !isNaN(parseFloat(log.details.duration))
        ) {
            val = parseFloat(log.details.duration);
            valid = true;
        } else if (
            metric === "distance" && log.details.distance &&
            !isNaN(parseFloat(log.details.distance))
        ) {
            val = parseFloat(log.details.distance);
            valid = true;
        }

        // If looking for weight but it's 0 or missing, it might be bodyweight.
        // For now, if valid=false, we skip.

        if (valid) {
            if (!grouped.has(dateKey)) {
                grouped.set(dateKey, {
                    date: log.created_at,
                    max: val,
                    total: val,
                    dataPointText: val.toString(),
                });
            } else {
                const entry = grouped.get(dateKey);
                // For weight, max is usually relevant. For reps, maybe max reps in a set?
                // Let's stick to MAX for now as "Personal Record" logic.
                if (val > entry.max) {
                    entry.max = val;
                    entry.dataPointText = val.toString();
                }
                entry.total += val;
            }
        }
    });

    const sorted = Array.from(grouped.values()).sort((a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const chartData = sorted.map((item: any) => ({
        value: item.max,
        label: new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        }),
        dataPointText: item.dataPointText,
    }));

    return { data: chartData, error: null };
}

export async function createCustomExerciseInSupabase(
    user: any,
    name: string,
    type: string = "bodyweight_reps",
    primaryMuscle?: string,
    secondaryMuscles?: string[],
) {
    if (!user) return { error: "User not logged in" };

    // 1. Create Exercise
    const { data: exerciseData, error: exerciseError } = await supabase
        .from("exercises")
        .insert([{
            exercise_name: name.trim(),
            properties: type,
            user_id: user.id,
        }])
        .select()
        .single();

    if (exerciseError || !exerciseData) {
        return { data: null, error: exerciseError };
    }

    // 2. Link Muscle Groups
    const muscleInserts: any[] = [];

    // We need to fetch muscle group IDs for the names provided
    // Ideally we pass IDs from the frontend, but if names, we resolve them.
    // Let's assume frontend passes IDs since we will switch to dropdowns relying on fetchMuscleGroups.
    // Or if names, we'd need a lookup. Let's assume IDs or names that strictly match.
    // Given the UI plan, we should fetch muscle groups first and pass their IDs.

    // However, if we want to be robust to mismatched names, let's fetch IDs for the provided strings if they look like names.
    // For now, let's assume the frontend will pass the correct ID if we provide it.

    if (primaryMuscle) {
        muscleInserts.push({
            exercise_id: exerciseData.exercise_id,
            muscle_group_id: primaryMuscle,
            role: "primary",
        });
    }

    if (secondaryMuscles && secondaryMuscles.length > 0) {
        secondaryMuscles.forEach((mId) => {
            // Avoid duplicate primary
            if (mId !== primaryMuscle) {
                muscleInserts.push({
                    exercise_id: exerciseData.exercise_id,
                    muscle_group_id: mId,
                    role: "secondary",
                });
            }
        });
    }

    if (muscleInserts.length > 0) {
        const { error: muscleError } = await supabase
            .from("exercise_muscle_groups")
            .insert(muscleInserts);

        if (muscleError) {
            console.warn("Failed to link muscle groups", muscleError);
            // We don't fail the whole creation, just warn
        }
    }

    return { data: exerciseData, error: null };
}
export async function fetchLastExercisePerformance(
    user: any,
    exerciseId: string,
    exerciseName?: string,
) {
    if (!user) {
        try {
            const history = await DataRepository.getHistory();
            // Find latest log containing this exercise
            // Sort history desc by date (it might be sorting naturally, but explicit is good if date is reliable)
            // LocalWorkoutLog usually ordered desc? Not guaranteed.
            // Better to iterate and find max date. Or sort.

            const sortedHistory = [...history].sort((a: any, b: any) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            for (const h of sortedHistory) {
                const ex = h.exercises.find((e) =>
                    e.id === exerciseId || e.name === exerciseName
                );
                if (ex && ex.logs && ex.logs.length > 0) {
                    // Found latest session
                    // Return details from this session
                    // Need to map SetLog to match what UI expects (just details)
                    // The UI expects an array of "details" objects (SetLogDetails)
                    return { data: ex.logs, error: null };
                }
            }
            return { data: null, error: "No previous performance found" };
        } catch (e) {
            return { data: null, error: e };
        }
    }

    if (!user) return { data: null, error: "User not logged in" };

    let latestLogId = null;

    if (exerciseId && (exerciseId.length > 20 || exerciseId.includes("-"))) {
        const { data: latestLogById } = await supabase
            .from("set_logs")
            .select(`
                workout_log_id,
                created_at,
                workout_logs!inner(user_id)
            `)
            .eq("exercise_id", exerciseId)
            .eq("workout_logs.user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (latestLogById) {
            latestLogId = latestLogById.workout_log_id;
        }
    }

    if (!latestLogId && exerciseName) {
        const { data: latestLogByName } = await supabase
            .from("set_logs")
            .select(`
                workout_log_id,
                created_at,
                workout_logs!inner(user_id)
            `)
            .eq("workout_logs.user_id", user.id)
            .contains("details", { exercise_name: exerciseName })
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (latestLogByName) {
            latestLogId = latestLogByName.workout_log_id;
        }
    }

    if (!latestLogId) {
        return { data: null, error: "No previous performance found" };
    }

    const { data: sets, error: setsError } = await supabase
        .from("set_logs")
        .select("details, exercise_id")
        .eq("workout_log_id", latestLogId)
        .order("created_at", { ascending: true });

    if (setsError) return { data: null, error: setsError };

    const filtered = (sets || []).filter((s) =>
        (exerciseId && s.exercise_id === exerciseId) ||
        (exerciseName && s.details?.exercise_name === exerciseName)
    );

    return { data: filtered.map((s) => s.details), error: null };
}
