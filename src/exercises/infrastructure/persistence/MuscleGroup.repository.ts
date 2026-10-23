import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MuscleGroup } from "../../domain/models/MuscleGroup.entity.js";
import { MuscleGroupRepositoryPort } from "../../domain/ports/MuscleGroupRepository.port.js";
import { muscleGroupMapper } from "./Exercise.mapper.js";
import { MuscleGroupOrmEntity } from "./MuscleGroupOrm.entity.js";

export class MuscleGroupRepositoryAdapter implements MuscleGroupRepositoryPort {
    constructor(
        @InjectRepository(MuscleGroupOrmEntity)
        private readonly repository: Repository<MuscleGroupOrmEntity>,
    ) {}

    async findAll(): Promise<MuscleGroup[]> {
        const muscleGroups = await this.repository.find({ order: { name: 'ASC' } });
        return muscleGroups.map(muscleGroupMapper.toDomain);
    }

    async findById(id: string): Promise<MuscleGroup | null> {
        const muscleGroup = await this.repository.findOneBy({ id });
        return muscleGroup ? muscleGroupMapper.toDomain(muscleGroup) : null;
    }

    async save(muscleGroup: MuscleGroup): Promise<MuscleGroup> {
        return muscleGroupMapper.toDomain(await this.repository.save(muscleGroupMapper.toOrm(muscleGroup)));
    }
}
