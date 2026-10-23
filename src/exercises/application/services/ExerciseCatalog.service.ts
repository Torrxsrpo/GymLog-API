import { Inject, Injectable } from "@nestjs/common";
import { EXERCISE_REPOSITORY, type ExerciseRepositoryPort } from "../../domain/ports/ExerciseRepository.port.js";
import { ExerciseNotFoundException } from "../../domain/errors/ExerciseNotFoundException.js";

// Otros módulos (rutinas, sesiones) lo usan para validar ejercicios contra el catálogo
@Injectable()
export class ExerciseCatalogService {
    constructor(
        @Inject (EXERCISE_REPOSITORY) private readonly exerciseRepository: ExerciseRepositoryPort) {}

    async ensureExist(exerciseIds: string[]): Promise<void> {
        const found = await this.exerciseRepository.findByIds(exerciseIds);
        const foundIds = new Set(found.map((exercise) => exercise.Id));
        const missing = exerciseIds.filter((id) => !foundIds.has(id));

        if (missing.length > 0) {
            throw new ExerciseNotFoundException(missing);
        }
    }
}
