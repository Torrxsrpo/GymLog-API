import { Inject, Injectable } from "@nestjs/common";
import { RoutineExercise, type RoutineExerciseProps } from "../../domain/models/RoutineExercise.vo.js";
import { ROUTINE_REPOSITORY, type RoutineRepositoryPort } from "../../domain/ports/RoutineRepository.port.js";
import { RoutineNotFoundException } from "../../domain/errors/RoutineNotFoundException.js";
import { ExerciseCatalogService } from "../../../exercises/application/services/ExerciseCatalog.service.js";
import { toRoutineResponse, type RoutineResponse } from "../dtos/RoutineResponse.js";

interface UpdateRoutineInput {
    name?: string;
    frequency?: number;
    // Si se envía, reemplaza la lista completa de ejercicios
    exercises?: RoutineExerciseProps[];
}

@Injectable()
export class UpdateRoutineUseCase {
    constructor(
        @Inject (ROUTINE_REPOSITORY) private readonly routineRepository: RoutineRepositoryPort,
        private readonly exerciseCatalog: ExerciseCatalogService) {}

    async execute(userId: string, routineId: string, input: UpdateRoutineInput): Promise<RoutineResponse> {
        const routine = await this.routineRepository.findByIdForUser(routineId, userId);
        if (!routine) {
            throw new RoutineNotFoundException(routineId);
        }

        routine.update({
            name: input.name,
            frequency: input.frequency,
            exercises: input.exercises?.map((exercise) => RoutineExercise.create(exercise)),
        });

        if (input.exercises) {
            await this.exerciseCatalog.ensureExist(routine.getExerciseIds());
        }

        return toRoutineResponse(await this.routineRepository.save(routine));
    }
}
