import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { SetLog } from "../../domain/models/SetLog.entity.js";
import { WORKOUT_SESSION_REPOSITORY, type WorkoutSessionRepositoryPort } from "../../domain/ports/WorkoutSessionRepository.port.js";
import { ExerciseCatalogService } from "../../../exercises/application/services/ExerciseCatalog.service.js";
import { OwnedWorkoutSessionService } from "../services/OwnedWorkoutSession.service.js";
import { toWorkoutSessionResponse, type WorkoutSessionResponse } from "../dtos/WorkoutSessionResponse.js";

interface AddSetLogInput {
    exerciseId: string;
    reps: number;
    weight: number;
}

@Injectable()
export class AddSetLogUseCase {
    constructor(
        @Inject (WORKOUT_SESSION_REPOSITORY) private readonly sessionRepository: WorkoutSessionRepositoryPort,
        private readonly ownedSessions: OwnedWorkoutSessionService,
        private readonly exerciseCatalog: ExerciseCatalogService) {}

    async execute(userId: string, sessionId: string, input: AddSetLogInput): Promise<WorkoutSessionResponse> {
        const session = await this.ownedSessions.load(userId, sessionId);
        await this.exerciseCatalog.ensureExist([input.exerciseId]);

        session.addSet(SetLog.create({
            id: randomUUID(),
            exerciseId: input.exerciseId,
            reps: input.reps,
            weight: input.weight,
            createdAt: new Date(),
        }));

        return toWorkoutSessionResponse(await this.sessionRepository.save(session));
    }
}
