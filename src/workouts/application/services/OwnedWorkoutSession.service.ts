import { Inject, Injectable } from "@nestjs/common";
import { WorkoutSession } from "../../domain/models/WorkoutSession.entity.js";
import { WORKOUT_SESSION_REPOSITORY, type WorkoutSessionRepositoryPort } from "../../domain/ports/WorkoutSessionRepository.port.js";
import { WorkoutSessionNotFoundException } from "../../domain/errors/WorkoutSessionNotFoundException.js";

// Carga una sesión del usuario o lanza 404 si no existe o es de otro usuario
@Injectable()
export class OwnedWorkoutSessionService {
    constructor(
        @Inject (WORKOUT_SESSION_REPOSITORY) private readonly sessionRepository: WorkoutSessionRepositoryPort) {}

    async load(userId: string, sessionId: string): Promise<WorkoutSession> {
        const session = await this.sessionRepository.findByIdForUser(sessionId, userId);
        if (!session) {
            throw new WorkoutSessionNotFoundException(sessionId);
        }
        return session;
    }
}
