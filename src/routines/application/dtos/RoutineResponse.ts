import { Routine } from "../../domain/models/Routine.entity.js";

export interface RoutineExerciseResponse {
    exerciseId: string;
    targetSets: number;
    targetReps: number;
}

export interface RoutineResponse {
    id: string;
    name: string;
    date: Date;
    frequency: number;
    exercises: RoutineExerciseResponse[];
}

export function toRoutineResponse(routine: Routine): RoutineResponse {
    return {
        id: routine.Id,
        name: routine.getName(),
        date: routine.getDate(),
        frequency: routine.getFrequency(),
        exercises: routine.getExercises().map((exercise) => ({
            exerciseId: exercise.getExerciseId(),
            targetSets: exercise.getTargetSets(),
            targetReps: exercise.getTargetReps(),
        })),
    };
}
