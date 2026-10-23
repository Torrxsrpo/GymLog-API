import { Inject, Injectable } from "@nestjs/common";
import { MUSCLE_GROUP_REPOSITORY, type MuscleGroupRepositoryPort } from "../../domain/ports/MuscleGroupRepository.port.js";
import { toMuscleGroupResponse, type MuscleGroupResponse } from "../dtos/ExerciseResponse.js";

@Injectable()
export class GetMuscleGroupsUseCase {
    constructor(
        @Inject (MUSCLE_GROUP_REPOSITORY) private readonly muscleGroupRepository: MuscleGroupRepositoryPort) {}

    async execute(): Promise<MuscleGroupResponse[]> {
        const muscleGroups = await this.muscleGroupRepository.findAll();
        return muscleGroups.map(toMuscleGroupResponse);
    }
}
