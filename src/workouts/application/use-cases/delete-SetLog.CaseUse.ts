import { Inject, Injectable } from "@nestjs/common";
import { WORKOUT_SESSION_REPOSITORY, type WorkoutSessionRepositoryPort } from "../../domain/ports/WorkoutSessionRepository.port.js";
import { OwnedWorkoutSessionService } from "../services/OwnedWorkoutSession.service.js";
import { toWorkoutSessionResponse, type WorkoutSessionResponse } from "../dtos/WorkoutSessionResponse.js";

@Injectable()
export class DeleteSetLogUseCase {
    constructor(
        @Inject (WORKOUT_SESSION_REPOSITORY) private readonly sessionRepository: WorkoutSessionRepositoryPort,
        private readonly ownedSessions: OwnedWorkoutSessionService) {}

    async execute(userId: string, sessionId: string, setId: string): Promise<WorkoutSessionResponse> {
        const session = await this.ownedSessions.load(userId, sessionId);
        session.removeSet(setId);
        return toWorkoutSessionResponse(await this.sessionRepository.save(session));
    }
}
