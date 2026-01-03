import AsyncStorage from "@react-native-async-storage/async-storage";
import { AbstractPowerSyncDatabase } from "@powersync/react-native";
import uuid from "react-native-uuid";
import { TABLES as ASYNC_TABLES } from "../../providers/DataRepository";

const MIGRATION_KEY = "myhealth_sqlite_migration_complete";

export const migrateToSQLite = async (
    db: AbstractPowerSyncDatabase,
    userId: string,
): Promise<void> => {
    const isMigrated = await AsyncStorage.getItem(MIGRATION_KEY);
    if (isMigrated) return;

    console.log("Starting migration to SQLite...");

    try {
        // 1. Workouts (Templates)
        const workoutsJson = await AsyncStorage.getItem(ASYNC_TABLES.WORKOUTS);
        if (workoutsJson) {
            const workouts = JSON.parse(workoutsJson);
            for (const w of workouts) {
                if (w.deletedAt) continue;
                await db.execute(
                    `INSERT INTO workouts (id, name, user_id, exercises, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        w.id || uuid.v4(),
                        w.userId || userId, // Fallback to current user if missing
                        JSON.stringify(w.exercises || []),
                        new Date(w.createdAt || Date.now()).toISOString(),
                        new Date(w.updatedAt || Date.now()).toISOString(),
                    ],
                );
            }
        }

        // 2. History (Logs)
        // Need to migrate simple logs and join sets?
        // Old repo handled join manually. Here we insert into workout_logs and set_logs.
        const logsJson = await AsyncStorage.getItem(ASYNC_TABLES.WORKOUT_LOGS);
        const setLogsJson = await AsyncStorage.getItem(ASYNC_TABLES.SET_LOGS);

        if (logsJson) {
            const logs = JSON.parse(logsJson);
            for (const l of logs) {
                await db.execute(
                    `INSERT INTO workout_logs (id, user_id, workout_id, workout_name, workout_time, duration, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        l.id,
                        l.user_id || userId,
                        l.workout_id,
                        l.workout_name,
                        l.workout_time,
                        l.duration,
                        l.note,
                        l.created_at,
                        new Date(l.updatedAt || Date.now()).toISOString(),
                    ],
                );
            }
        }

        if (setLogsJson) {
            const sets = JSON.parse(setLogsJson);
            for (const s of sets) {
                await db.execute(
                    `INSERT INTO set_logs (id, workout_log_id, exercise_id, weight, reps, bodyweight, duration, distance, created_at, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        s.id,
                        s.workout_log_id,
                        s.exercise_id,
                        s.details?.weight,
                        s.details?.reps,
                        s.details?.bodyweight,
                        s.details?.duration,
                        s.details?.distance,
                        s.created_at,
                        JSON.stringify(s.details || {}),
                    ],
                );
            }
        }

        // 3. Body Measurements
        const bodyJson = await AsyncStorage.getItem(
            ASYNC_TABLES.BODY_MEASUREMENTS,
        );
        if (bodyJson) {
            const bodies = JSON.parse(bodyJson);
            for (const b of bodies) {
                await db.execute(
                    `INSERT INTO body_measurements (id, user_id, weight, date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        b.id || uuid.v4(),
                        b.userId || b.user_id || userId,
                        b.weight,
                        b.date,
                        b.createdAt || new Date().toISOString(),
                        new Date(b.updatedAt || Date.now()).toISOString(),
                    ],
                );
            }
        }

        // Mark complete
        await AsyncStorage.setItem(MIGRATION_KEY, "true");
        console.log("Migration to SQLite complete.");
    } catch (e) {
        console.error("Migration failed:", e);
        // Do not mark as complete so we retry? Or mark as failed?
    }
};
