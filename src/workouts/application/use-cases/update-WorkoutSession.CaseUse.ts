import { Inject, Injectable } from "@nestjs/common";
import { SessionStatus } from "../../domain/models/enums/SessionStatus.enum.js";
import { WORKOUT_SESSION_REPOSITORY, type WorkoutSessionRepositoryPort } from "../../domain/ports/WorkoutSessionRepository.port.js";
import { OwnedWorkoutSessionService } from "../services/OwnedWorkoutSession.service.js";
import { toWorkoutSessionResponse, type WorkoutSessionResponse } from "../dtos/WorkoutSessionResponse.js";

interface UpdateWorkoutSessionInput {
    status?: SessionStatus;
    notes?: string | null;
}

@Injectable()
export class UpdateWorkoutSessionUseCase {
    constructor(
        @Inject (WORKOUT_SESSION_REPOSITORY) private readonly sessionRepository: WorkoutSessionRepositoryPort,
        private readonly ownedSessions: OwnedWorkoutSessionService) {}

    async execute(userId: string, sessionId: string, input: UpdateWorkoutSessionInput): Promise<WorkoutSessionResponse> {
        const session = await this.ownedSessions.load(userId, sessionId);

        if (input.notes !== undefined) {
            session.updateNotes(input.notes);
        }
        if (input.status !== undefined) {
            session.changeStatus(input.status);
        }

        return toWorkoutSessionResponse(await this.sessionRepository.save(session));
    }
}
