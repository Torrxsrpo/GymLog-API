import { Inject, Injectable } from "@nestjs/common";
import { ROUTINE_REPOSITORY, type RoutineRepositoryPort } from "../../domain/ports/RoutineRepository.port.js";
import { RoutineNotFoundException } from "../../domain/errors/RoutineNotFoundException.js";
import { toRoutineResponse, type RoutineResponse } from "../dtos/RoutineResponse.js";

@Injectable()
export class GetRoutineUseCase {
    constructor(
        @Inject (ROUTINE_REPOSITORY) private readonly routineRepository: RoutineRepositoryPort) {}

    async execute(userId: string, routineId: string): Promise<RoutineResponse> {
        const routine = await this.routineRepository.findByIdForUser(routineId, userId);
        if (!routine) {
            throw new RoutineNotFoundException(routineId);
        }
        return toRoutineResponse(routine);
    }
}
