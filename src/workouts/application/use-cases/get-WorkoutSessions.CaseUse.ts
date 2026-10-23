import { Inject, Injectable } from "@nestjs/common";
import { WORKOUT_SESSION_REPOSITORY, type WorkoutSessionRepositoryPort } from "../../domain/ports/WorkoutSessionRepository.port.js";
import { toWorkoutSessionResponse, type WorkoutSessionResponse } from "../dtos/WorkoutSessionResponse.js";

@Injectable()
export class GetWorkoutSessionsUseCase {
    constructor(
        @Inject (WORKOUT_SESSION_REPOSITORY) private readonly sessionRepository: WorkoutSessionRepositoryPort) {}

    async execute(userId: string): Promise<WorkoutSessionResponse[]> {
        const sessions = await this.sessionRepository.findByUserId(userId);
        return sessions.map(toWorkoutSessionResponse);
    }
}
