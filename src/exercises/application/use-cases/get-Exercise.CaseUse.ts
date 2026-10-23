import { Inject, Injectable } from "@nestjs/common";
import { EXERCISE_REPOSITORY, type ExerciseRepositoryPort } from "../../domain/ports/ExerciseRepository.port.js";
import { ExerciseNotFoundException } from "../../domain/errors/ExerciseNotFoundException.js";
import { toExerciseResponse, type ExerciseResponse } from "../dtos/ExerciseResponse.js";

@Injectable()
export class GetExerciseUseCase {
    constructor(
        @Inject (EXERCISE_REPOSITORY) private readonly exerciseRepository: ExerciseRepositoryPort) {}

    async execute(id: string): Promise<ExerciseResponse> {
        const exercise = await this.exerciseRepository.findById(id);
        if (!exercise) {
            throw new ExerciseNotFoundException(id);
        }
        return toExerciseResponse(exercise);
    }
}
