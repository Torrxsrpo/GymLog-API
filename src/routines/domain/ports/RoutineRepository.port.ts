import { Routine } from "../models/Routine.entity.js";

export const ROUTINE_REPOSITORY = Symbol('ROUTINE_REPOSITORY');

export interface RoutineRepositoryPort {
    save(routine: Routine): Promise<Routine>;
    // Devuelve null si no existe o si pertenece a otro usuario
    findByIdForUser(id: string, userId: string): Promise<Routine | null>;
    findByUserId(userId: string): Promise<Routine[]>;
    delete(id: string): Promise<void>;
}
