import { Injectable } from "@nestjs/common";
import { OwnedWorkoutSessionService } from "../services/OwnedWorkoutSession.service.js";
import { toWorkoutSessionResponse, type WorkoutSessionResponse } from "../dtos/WorkoutSessionResponse.js";

@Injectable()
export class GetWorkoutSessionUseCase {
    constructor(private readonly ownedSessions: OwnedWorkoutSessionService) {}

    async execute(userId: string, sessionId: string): Promise<WorkoutSessionResponse> {
        return toWorkoutSessionResponse(await this.ownedSessions.load(userId, sessionId));
    }
}
