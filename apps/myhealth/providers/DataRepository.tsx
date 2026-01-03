import { AbstractPowerSyncDatabase } from '@powersync/react-native';
import uuid from 'react-native-uuid';
import ExerciseDefaultData from '../assets/data/default-exercises.json';
import type { LocalWorkoutLog, Exercise, SetLog } from "../utils/workout-api/types";

export const TABLES = {
    EXERCISES: "exercises",
    WORKOUTS: "workouts",
    WORKOUT_LOGS: "workout_logs",
    SET_LOGS: "set_logs",
    BODY_MEASUREMENTS: "body_measurements",
};

let db: AbstractPowerSyncDatabase | null = null;

const ensureDB = () => {
    if (!db) throw new Error("DataRepository: DB not initialized");
    return db;
};

export const DataRepository = {
    initialize: (database: AbstractPowerSyncDatabase) => {
        db = database;
    },
    
    // Legacy helper - mostly used for reading
    table: async (name: string) => { 
        const d = ensureDB();
        return await d.getAll(`SELECT * FROM ${name}`);
    },
    
    // Legacy helper - deprecated, throws to ensure we migrate usages
    upsert: async (table: string, data: any) => {
        console.warn("DataRepository.upsert is deprecated. Use specific save methods.");
        // We could implement generic SQL, but it's risky without schema knowledge per table
        throw new Error("Generic upsert not supported in SQL. Use specific methods.");
    },

    // --- Workouts (Templates) ---
    getWorkouts: async (): Promise<any[]> => {
        const d = ensureDB();
        const results = await d.getAll('SELECT * FROM workouts ORDER BY created_at DESC');
        return results.map((row: any) => ({
            ...row,
            exercises: row.exercises ? JSON.parse(row.exercises) : []
        }));
    },

    saveWorkouts: async (workouts: any[]): Promise<void> => {
       const d = ensureDB();
       await d.writeTransaction(async (tx) => {
           // Delete all? Or upsert? Legacy was full overwrite.
           // To be safe and match legacy behavior:
           // await tx.execute('DELETE FROM workouts'); 
           // BUT PowerSync might be syncing. Overwriting fully is dangerous if we have deletions.
           // Let's assume we just upsert them all.
           for (const w of workouts) {
               await tx.execute(
                   `INSERT OR REPLACE INTO workouts (id, name, user_id, exercises, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
                   [
                       w.id || uuid.v4(),
                       w.name,
                       w.userId || w.user_id,
                       JSON.stringify(w.exercises || []),
                       w.createdAt || new Date().toISOString(),
                       new Date().toISOString()
                   ]
               );
           }
       });
    },

    saveWorkout: async (workout: any): Promise<void> => {
        const d = ensureDB();
        const now = new Date().toISOString();
        const id = workout.id || uuid.v4();
        await d.execute(
            `INSERT OR REPLACE INTO workouts (id, name, user_id, exercises, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                id,
                workout.name,
                workout.userId,
                JSON.stringify(workout.exercises || []),
                workout.createdAt || now,
                now
            ]
        );
    },

    deleteWorkout: async (id: string): Promise<void> => {
        const d = ensureDB();
        await d.execute('DELETE FROM workouts WHERE id = ?', [id]);
    },


    // --- History (Logs) ---
    getHistory: async (): Promise<LocalWorkoutLog[]> => {
        const d = ensureDB();
        
        // 1. Get Logs
        const logs = await d.getAll<any>('SELECT * FROM workout_logs ORDER BY workout_time DESC');
        if (logs.length === 0) return [];

        // 2. Get Sets
        const logIds = logs.map(l => `'${l.id}'`).join(',');
        const sets = await d.getAll<any>(`SELECT * FROM set_logs WHERE workout_log_id IN (${logIds})`);

        return logs.map(log => {
            const logSets = sets.filter(s => s.workout_log_id === log.id);
            const exercisesMap = new Map<string, Exercise>();
            
            logSets.forEach(set => {
                const details = set.details ? JSON.parse(set.details) : {};
                const exId = set.exercise_id || details.exercise_id || 'unknown';
                const exName = details.exercise_name || 'Unknown Exercise';

                if (!exercisesMap.has(exId)) {
                    exercisesMap.set(exId, {
                        id: exId,
                        name: exName,
                        sets: 0,
                        reps: 0,
                        completedSets: 0,
                        logs: [],
                    });
                }
                const ex = exercisesMap.get(exId)!;
                ex.logs?.push({
                    id: set.id,
                    weight: set.weight || details.weight,
                    reps: set.reps || details.reps,
                    bodyweight: set.bodyweight || details.bodyweight,
                    duration: set.duration || details.duration,
                    distance: set.distance || details.distance,
                });
                ex.completedSets++;
            });

            return {
                id: log.id,
                workoutId: log.workout_id,
                userId: log.user_id,
                date: log.workout_time,
                workoutTime: log.workout_time,
                name: log.workout_name,
                duration: log.duration,
                note: log.note,
                notes: log.note,
                exercises: Array.from(exercisesMap.values()),
                createdAt: log.created_at,
                syncStatus: 'synced', 
                updatedAt: new Date(log.updated_at || log.created_at || Date.now()).getTime(),
            };
        });
    },

    saveHistory: async (logs: LocalWorkoutLog[]): Promise<void> => {
        const d = ensureDB();
        await d.writeTransaction(async (tx) => {
            for (const log of logs) {
               await tx.execute(
                   `INSERT OR REPLACE INTO workout_logs (id, user_id, workout_id, workout_name, workout_time, duration, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                   [
                       log.id || uuid.v4(),
                       log.userId,
                       log.workoutId,
                       log.name,
                       log.date || log.workoutTime,
                       log.duration,
                       log.note,
                       log.createdAt,
                       new Date(log.updatedAt || Date.now()).toISOString()
                   ]
               );
               
               if (log.exercises) {
                   for (const ex of log.exercises) {
                       if (ex.logs) {
                           for (const s of ex.logs) {
                               await tx.execute(
                                   `INSERT OR REPLACE INTO set_logs (id, workout_log_id, exercise_id, weight, reps, bodyweight, duration, distance, created_at, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                   [
                                       s.id || uuid.v4(),
                                       log.id,
                                       ex.id,
                                       s.weight,
                                       s.reps,
                                       s.bodyweight,
                                       s.duration,
                                       s.distance,
                                       log.createdAt,
                                       JSON.stringify({
                                           ...s,
                                           exercise_name: ex.name,
                                           exercise_id: ex.id
                                       })
                                   ]
                               );
                           }
                       }
                   }
               }
            }
        });
    },

    saveLog: async (log: Omit<LocalWorkoutLog, 'updatedAt' | 'syncStatus' | 'id'> & { id?: string }): Promise<LocalWorkoutLog> => {
         const d = ensureDB();
         const id = log.id || (uuid.v4() as string);
         const now = new Date().toISOString();
         
         await d.writeTransaction(async (tx) => {
             // 1. Log
             await tx.execute(
                `INSERT INTO workout_logs (id, user_id, workout_id, workout_name, workout_time, duration, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    id,
                    log.userId,
                    log.workoutId,
                    log.name,
                    log.date || now,
                    log.duration,
                    log.note,
                    now,
                    now
                ]
             );
             
             // 2. Sets
             if (log.exercises) {
                 for (const ex of log.exercises) {
                     if (ex.logs) {
                         for (const s of ex.logs) {
                             await tx.execute(
                                `INSERT INTO set_logs (id, workout_log_id, exercise_id, weight, reps, bodyweight, duration, distance, created_at, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                [
                                    s.id || uuid.v4(),
                                    id,
                                    ex.id,
                                    s.weight,
                                    s.reps,
                                    s.bodyweight,
                                    s.duration,
                                    s.distance,
                                    now,
                                    JSON.stringify({
                                       ...s,
                                       exercise_name: ex.name,
                                       exercise_id: ex.id
                                   })
                                ]
                             );
                         }
                     }
                 }
             }
         });
         
         return {
             ...log,
             id,
             updatedAt: Date.now(),
             syncStatus: 'pending'
         } as LocalWorkoutLog;
    },
    
    // --- Stats ---
    getExerciseStats: async (exerciseName: string) => {
        const d = ensureDB();
        const sets = await d.getAll<any>(
            `SELECT * FROM set_logs WHERE json_extract(details, '$.exercise_name') = ?`,
            [exerciseName]
        );
        
        let maxWeight = 0;
        let totalVolume = 0;
        let prDate = null;
        
        for (const set of sets) {
            const w = set.weight;
            const r = set.reps;
            if (w && w > maxWeight) {
                maxWeight = w;
                prDate = set.created_at;
            }
            if (w && r) {
                totalVolume += w * r;
            }
        }
        
        return { maxWeight, prDate, totalVolume };
    },
    
    // --- Base Data ---
    getDefaultExercises: async () => {
        return ExerciseDefaultData;
    },

    // --- Body Measurements ---
    getLatestBodyWeight: async (userId: string | null): Promise<number | null> => {
        const d = ensureDB();
        const results = await d.getAll<any>(
            `SELECT weight FROM body_measurements WHERE user_id = ? ORDER BY date DESC, created_at DESC LIMIT 1`,
            [userId || 'guest']
        );
        return results[0]?.weight || null;
    },

    getBodyWeightHistory: async (userId: string | null, startDate?: string): Promise<any[]> => {
        const d = ensureDB();
        let query = `SELECT * FROM body_measurements WHERE user_id = ?`;
        const params: any[] = [userId || 'guest'];
        
        if (startDate) {
            query += ` AND date >= ?`;
            params.push(startDate);
        }
        
        query += ` ORDER BY date ASC`;
        const res = await d.getAll(query, params);
        // Map snake_case to camelCase if needed for UI?
        // UI expects { weight, date }
        return res;
    },

    saveBodyWeight: async (log: { userId: string, weight: number, date: string, id?: string }): Promise<void> => {
        const d = ensureDB();
        const id = log.id || (uuid.v4() as string);
        const now = new Date().toISOString();
        
        await d.execute(
            `INSERT OR REPLACE INTO body_measurements (id, user_id, weight, date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                id,
                log.userId,
                log.weight,
                log.date,
                now,
                now
            ]
        );
    }
};
