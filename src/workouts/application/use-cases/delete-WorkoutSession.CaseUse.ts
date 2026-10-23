import { Inject, Injectable } from "@nestjs/common";
import { WORKOUT_SESSION_REPOSITORY, type WorkoutSessionRepositoryPort } from "../../domain/ports/WorkoutSessionRepository.port.js";
import { OwnedWorkoutSessionService } from "../services/OwnedWorkoutSession.service.js";

@Injectable()
export class DeleteWorkoutSessionUseCase {
    constructor(
        @Inject (WORKOUT_SESSION_REPOSITORY) private readonly sessionRepository: WorkoutSessionRepositoryPort,
        private readonly ownedSessions: OwnedWorkoutSessionService) {}

    async execute(userId: string, sessionId: string): Promise<void> {
        const session = await this.ownedSessions.load(userId, sessionId);
        await this.sessionRepository.delete(session.Id);
    }
}
