import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { Routine } from "../../domain/models/Routine.entity.js";
import { RoutineExercise, type RoutineExerciseProps } from "../../domain/models/RoutineExercise.vo.js";
import { ROUTINE_REPOSITORY, type RoutineRepositoryPort } from "../../domain/ports/RoutineRepository.port.js";
import { ExerciseCatalogService } from "../../../exercises/application/services/ExerciseCatalog.service.js";
import { toRoutineResponse, type RoutineResponse } from "../dtos/RoutineResponse.js";

interface CreateRoutineInput {
    name: string;
    frequency: number;
    date?: Date;
    exercises: RoutineExerciseProps[];
}

@Injectable()
export class CreateRoutineUseCase {
    constructor(
        @Inject (ROUTINE_REPOSITORY) private readonly routineRepository: RoutineRepositoryPort,
        private readonly exerciseCatalog: ExerciseCatalogService) {}

    async execute(userId: string, input: CreateRoutineInput): Promise<RoutineResponse> {
        const routine = Routine.create({
            id: randomUUID(),
            userId,
            name: input.name,
            date: input.date ?? new Date(),
            frequency: input.frequency,
            exercises: input.exercises.map((exercise) => RoutineExercise.create(exercise)),
        });

        await this.exerciseCatalog.ensureExist(routine.getExerciseIds());

        return toRoutineResponse(await this.routineRepository.save(routine));
    }
}
