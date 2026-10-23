import { Inject, Injectable } from "@nestjs/common";
import { ROUTINE_REPOSITORY, type RoutineRepositoryPort } from "../../domain/ports/RoutineRepository.port.js";
import { toRoutineResponse, type RoutineResponse } from "../dtos/RoutineResponse.js";

@Injectable()
export class GetRoutinesUseCase {
    constructor(
        @Inject (ROUTINE_REPOSITORY) private readonly routineRepository: RoutineRepositoryPort) {}

    async execute(userId: string): Promise<RoutineResponse[]> {
        const routines = await this.routineRepository.findByUserId(userId);
        return routines.map(toRoutineResponse);
    }
}
