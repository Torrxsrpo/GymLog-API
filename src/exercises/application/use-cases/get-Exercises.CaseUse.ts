import { Inject, Injectable } from "@nestjs/common";
import { EXERCISE_REPOSITORY, type ExerciseFilter, type ExerciseRepositoryPort } from "../../domain/ports/ExerciseRepository.port.js";
import { toExerciseResponse, type ExerciseResponse } from "../dtos/ExerciseResponse.js";

@Injectable()
export class GetExercisesUseCase {
    constructor(
        @Inject (EXERCISE_REPOSITORY) private readonly exerciseRepository: ExerciseRepositoryPort) {}

    async execute(filter: ExerciseFilter = {}): Promise<ExerciseResponse[]> {
        const exercises = await this.exerciseRepository.findAll(filter);
        return exercises.map(toExerciseResponse);
    }
}
