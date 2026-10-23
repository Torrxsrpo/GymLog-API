import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { Exercise } from "../../domain/models/Exercise.entity.js";
import { EXERCISE_REPOSITORY, type ExerciseRepositoryPort } from "../../domain/ports/ExerciseRepository.port.js";
import { MUSCLE_GROUP_REPOSITORY, type MuscleGroupRepositoryPort } from "../../domain/ports/MuscleGroupRepository.port.js";
import { MuscleGroupNotFoundException } from "../../domain/errors/MuscleGroupNotFoundException.js";
import { DuplicateCatalogEntryException } from "../../domain/errors/DuplicateCatalogEntryException.js";
import { toExerciseResponse, type ExerciseResponse } from "../dtos/ExerciseResponse.js";

interface CreateExerciseInput {
    name: string;
    img?: string | null;
    muscleGroupId: string;
}

@Injectable()
export class CreateExerciseUseCase {
    constructor(
        @Inject (EXERCISE_REPOSITORY) private readonly exerciseRepository: ExerciseRepositoryPort,
        @Inject (MUSCLE_GROUP_REPOSITORY) private readonly muscleGroupRepository: MuscleGroupRepositoryPort) {}

    async execute(input: CreateExerciseInput): Promise<ExerciseResponse> {
        const exercise = Exercise.create({
            id: randomUUID(),
            name: input.name,
            img: input.img ?? null,
            muscleGroupId: input.muscleGroupId,
        });

        if (!await this.muscleGroupRepository.findById(exercise.getMuscleGroupId())) {
            throw new MuscleGroupNotFoundException(exercise.getMuscleGroupId());
        }
        if (await this.exerciseRepository.findByName(exercise.getName())) {
            throw new DuplicateCatalogEntryException("Exercise", exercise.getName());
        }

        return toExerciseResponse(await this.exerciseRepository.save(exercise));
    }
}
