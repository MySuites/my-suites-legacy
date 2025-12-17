import { Exercise } from "./providers/WorkoutManagerProvider";

export interface SavedWorkout {
    id: string;
    name: string;
    exercises: Exercise[];
    createdAt: string;
}

export interface Routine {
    id: string;
    name: string;
    sequence: any[];
    createdAt: string;
}
