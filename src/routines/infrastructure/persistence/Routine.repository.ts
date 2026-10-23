import { InjectRepository } from "@nestjs/typeorm";
import { In, Not, Repository } from "typeorm";
import { Routine } from "../../domain/models/Routine.entity.js";
import { RoutineRepositoryPort } from "../../domain/ports/RoutineRepository.port.js";
import { routineMapper } from "./Routine.mapper.js";
import { RoutineOrmEntity } from "./RoutineOrm.entity.js";
import { RoutineExerciseOrmEntity } from "./RoutineExerciseOrm.entity.js";

export class RoutineRepositoryAdapter implements RoutineRepositoryPort {
    constructor(
        @InjectRepository(RoutineOrmEntity)
        private readonly repository: Repository<RoutineOrmEntity>,
        @InjectRepository(RoutineExerciseOrmEntity)
        private readonly exerciseRepository: Repository<RoutineExerciseOrmEntity>,
    ) {}

    // La rutina y sus ejercicios se guardan juntos: los ejercicios que ya no están se borran
    async save(routine: Routine): Promise<Routine> {
        await this.repository.manager.transaction(async (manager) => {
            await manager.save(RoutineOrmEntity, routineMapper.toOrm(routine));

            const exerciseIds = routine.getExerciseIds();
            await manager.delete(RoutineExerciseOrmEntity, exerciseIds.length > 0
                ? { routineId: routine.Id, exerciseId: Not(In(exerciseIds)) }
                : { routineId: routine.Id });
            await manager.save(RoutineExerciseOrmEntity, routineMapper.toExerciseOrms(routine));
        });
        return routine;
    }

    async findByIdForUser(id: string, userId: string): Promise<Routine | null> {
        const routine = await this.repository.findOneBy({ id, userId });
        if (!routine) {
            return null;
        }
        const exercises = await this.exerciseRepository.findBy({ routineId: id });
        return routineMapper.toDomain(routine, exercises);
    }

    async findByUserId(userId: string): Promise<Routine[]> {
        const routines = await this.repository.find({ where: { userId }, order: { date: 'DESC' } });
        if (routines.length === 0) {
            return [];
        }

        const exercises = await this.exerciseRepository.findBy({ routineId: In(routines.map((routine) => routine.id)) });
        return routines.map((routine) =>
            routineMapper.toDomain(routine, exercises.filter((exercise) => exercise.routineId === routine.id)),
        );
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete({ id });
    }
}
