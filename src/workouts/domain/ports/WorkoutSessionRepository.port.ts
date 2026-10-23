import { WorkoutSession } from "../models/WorkoutSession.entity.js";

export const WORKOUT_SESSION_REPOSITORY = Symbol('WORKOUT_SESSION_REPOSITORY');

export interface WorkoutSessionRepositoryPort {
    save(session: WorkoutSession): Promise<WorkoutSession>;
    // Devuelve null si no existe o si pertenece a otro usuario
    findByIdForUser(id: string, userId: string): Promise<WorkoutSession | null>;
    findByUserId(userId: string): Promise<WorkoutSession[]>;
    delete(id: string): Promise<void>;
}
