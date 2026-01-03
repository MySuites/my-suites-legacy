import { ColumnType, Schema, Table } from "@powersync/react-native";

export const AppSchema = new Schema({
    workouts: new Table({
        name: ColumnType.TEXT,
        user_id: ColumnType.TEXT,
        exercises: ColumnType.TEXT,
        created_at: ColumnType.TEXT,
        updated_at: ColumnType.TEXT,
    } as any),
    workout_logs: new Table({
        user_id: ColumnType.TEXT,
        workout_id: ColumnType.TEXT,
        workout_name: ColumnType.TEXT,
        workout_time: ColumnType.TEXT,
        duration: ColumnType.INTEGER,
        note: ColumnType.TEXT,
        created_at: ColumnType.TEXT,
        updated_at: ColumnType.TEXT,
    } as any),
    set_logs: new Table({
        workout_log_id: ColumnType.TEXT,
        exercise_id: ColumnType.TEXT,
        weight: ColumnType.REAL,
        reps: ColumnType.INTEGER,
        bodyweight: ColumnType.REAL,
        duration: ColumnType.INTEGER,
        distance: ColumnType.REAL,
        created_at: ColumnType.TEXT,
        details: ColumnType.TEXT,
    } as any),
    exercises: new Table({
        name: ColumnType.TEXT,
        user_id: ColumnType.TEXT,
        category: ColumnType.TEXT,
        muscle_group: ColumnType.TEXT,
        created_at: ColumnType.TEXT,
    } as any),
    body_measurements: new Table({
        user_id: ColumnType.TEXT,
        weight: ColumnType.REAL,
        date: ColumnType.TEXT,
        created_at: ColumnType.TEXT,
        updated_at: ColumnType.TEXT,
    } as any),
});
