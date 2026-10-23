import { Exercise } from "../../domain/models/Exercise.entity.js";
import { MuscleGroup } from "../../domain/models/MuscleGroup.entity.js";

export interface ExerciseResponse {
    id: string;
    name: string;
    img: string | null;
    muscleGroupId: string;
}

export interface MuscleGroupResponse {
    id: string;
    name: string;
}

export function toExerciseResponse(exercise: Exercise): ExerciseResponse {
    return {
        id: exercise.Id,
        name: exercise.getName(),
        img: exercise.getImg(),
        muscleGroupId: exercise.getMuscleGroupId(),
    };
}

export function toMuscleGroupResponse(muscleGroup: MuscleGroup): MuscleGroupResponse {
    return {
        id: muscleGroup.Id,
        name: muscleGroup.getName(),
    };
}
