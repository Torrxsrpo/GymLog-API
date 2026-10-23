import { Exercise } from "../models/Exercise.entity.js";

export const EXERCISE_REPOSITORY = Symbol('EXERCISE_REPOSITORY');

export interface ExerciseFilter {
    muscleGroupId?: string;
}

export interface ExerciseRepositoryPort {
    findAll(filter?: ExerciseFilter): Promise<Exercise[]>;
    findById(id: string): Promise<Exercise | null>;
    findByIds(ids: string[]): Promise<Exercise[]>;
    findByName(name: string): Promise<Exercise | null>;
    save(exercise: Exercise): Promise<Exercise>;
}
