import { Inject, Injectable } from "@nestjs/common";
import { MuscleGroup } from "../../domain/models/MuscleGroup.entity.js";
import { MUSCLE_GROUP_REPOSITORY, type MuscleGroupRepositoryPort } from "../../domain/ports/MuscleGroupRepository.port.js";
import { DuplicateCatalogEntryException } from "../../domain/errors/DuplicateCatalogEntryException.js";
import { toMuscleGroupResponse, type MuscleGroupResponse } from "../dtos/ExerciseResponse.js";

interface CreateMuscleGroupInput {
    name: string;
}

@Injectable()
export class CreateMuscleGroupUseCase {
    constructor(
        @Inject (MUSCLE_GROUP_REPOSITORY) private readonly muscleGroupRepository: MuscleGroupRepositoryPort) {}

    async execute(input: CreateMuscleGroupInput): Promise<MuscleGroupResponse> {
        const muscleGroup = MuscleGroup.create(input.name);

        if (await this.muscleGroupRepository.findById(muscleGroup.Id)) {
            throw new DuplicateCatalogEntryException("Muscle group", muscleGroup.getName());
        }

        return toMuscleGroupResponse(await this.muscleGroupRepository.save(muscleGroup));
    }
}
