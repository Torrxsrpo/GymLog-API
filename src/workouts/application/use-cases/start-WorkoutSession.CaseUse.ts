import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { WorkoutSession } from "../../domain/models/WorkoutSession.entity.js";
import { WORKOUT_SESSION_REPOSITORY, type WorkoutSessionRepositoryPort } from "../../domain/ports/WorkoutSessionRepository.port.js";
import { ROUTINE_REPOSITORY, type RoutineRepositoryPort } from "../../../routines/domain/ports/RoutineRepository.port.js";
import { RoutineNotFoundException } from "../../../routines/domain/errors/RoutineNotFoundException.js";
import { toWorkoutSessionResponse, type WorkoutSessionResponse } from "../dtos/WorkoutSessionResponse.js";

interface StartWorkoutSessionInput {
    routineId?: string;
    time?: Date;
    notes?: string;
}

@Injectable()
export class StartWorkoutSessionUseCase {
    constructor(
        @Inject (WORKOUT_SESSION_REPOSITORY) private readonly sessionRepository: WorkoutSessionRepositoryPort,
        @Inject (ROUTINE_REPOSITORY) private readonly routineRepository: RoutineRepositoryPort) {}

    async execute(userId: string, input: StartWorkoutSessionInput): Promise<WorkoutSessionResponse> {
        // Solo se puede entrenar con rutinas propias
        if (input.routineId && !await this.routineRepository.findByIdForUser(input.routineId, userId)) {
            throw new RoutineNotFoundException(input.routineId);
        }

        const session = WorkoutSession.start({
            id: randomUUID(),
            userId,
            routineId: input.routineId ?? null,
            time: input.time ?? new Date(),
            notes: input.notes ?? null,
        });

        return toWorkoutSessionResponse(await this.sessionRepository.save(session));
    }
}
