import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Exercise } from "../../domain/models/Exercise.entity.js";
import { ExerciseFilter, ExerciseRepositoryPort } from "../../domain/ports/ExerciseRepository.port.js";
import { exerciseMapper } from "./Exercise.mapper.js";
import { ExerciseOrmEntity } from "./ExerciseOrm.entity.js";

export class ExerciseRepositoryAdapter implements ExerciseRepositoryPort {
    constructor(
        @InjectRepository(ExerciseOrmEntity)
        private readonly repository: Repository<ExerciseOrmEntity>,
    ) {}

    async findAll(filter: ExerciseFilter = {}): Promise<Exercise[]> {
        const exercises = await this.repository.find({
            where: filter.muscleGroupId ? { muscleGroupId: filter.muscleGroupId } : {},
            order: { name: 'ASC' },
        });
        return exercises.map(exerciseMapper.toDomain);
    }

    async findById(id: string): Promise<Exercise | null> {
        const exercise = await this.repository.findOneBy({ id });
        return exercise ? exerciseMapper.toDomain(exercise) : null;
    }

    async findByIds(ids: string[]): Promise<Exercise[]> {
        if (ids.length === 0) {
            return [];
        }
        const exercises = await this.repository.findBy({ id: In(ids) });
        return exercises.map(exerciseMapper.toDomain);
    }

    // Comparación sin distinguir mayúsculas para no duplicar "Press banca" y "press banca"
    async findByName(name: string): Promise<Exercise | null> {
        const exercise = await this.repository
            .createQueryBuilder('exercise')
            .where('LOWER(exercise.name) = LOWER(:name)', { name })
            .getOne();
        return exercise ? exerciseMapper.toDomain(exercise) : null;
    }

    async save(exercise: Exercise): Promise<Exercise> {
        return exerciseMapper.toDomain(await this.repository.save(exerciseMapper.toOrm(exercise)));
    }
}
