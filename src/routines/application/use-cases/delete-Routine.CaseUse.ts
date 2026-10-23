import { Inject, Injectable } from "@nestjs/common";
import { ROUTINE_REPOSITORY, type RoutineRepositoryPort } from "../../domain/ports/RoutineRepository.port.js";
import { RoutineNotFoundException } from "../../domain/errors/RoutineNotFoundException.js";

@Injectable()
export class DeleteRoutineUseCase {
    constructor(
        @Inject (ROUTINE_REPOSITORY) private readonly routineRepository: RoutineRepositoryPort) {}

    // Las sesiones de entrenamiento de la rutina se conservan sin rutina asociada
    async execute(userId: string, routineId: string): Promise<void> {
        const routine = await this.routineRepository.findByIdForUser(routineId, userId);
        if (!routine) {
            throw new RoutineNotFoundException(routineId);
        }
        await this.routineRepository.delete(routine.Id);
    }
}
