import { MuscleGroup } from "../models/MuscleGroup.entity.js";

export const MUSCLE_GROUP_REPOSITORY = Symbol('MUSCLE_GROUP_REPOSITORY');

export interface MuscleGroupRepositoryPort {
    findAll(): Promise<MuscleGroup[]>;
    findById(id: string): Promise<MuscleGroup | null>;
    save(muscleGroup: MuscleGroup): Promise<MuscleGroup>;
}
