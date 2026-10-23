import { InjectRepository } from "@nestjs/typeorm";
import { In, Not, Repository } from "typeorm";
import { WorkoutSession } from "../../domain/models/WorkoutSession.entity.js";
import { WorkoutSessionRepositoryPort } from "../../domain/ports/WorkoutSessionRepository.port.js";
import { workoutSessionMapper } from "./WorkoutSession.mapper.js";
import { WorkoutSessionOrmEntity } from "./WorkoutSessionOrm.entity.js";
import { SetLogOrmEntity } from "./SetLogOrm.entity.js";

export class WorkoutSessionRepositoryAdapter implements WorkoutSessionRepositoryPort {
    constructor(
        @InjectRepository(WorkoutSessionOrmEntity)
        private readonly repository: Repository<WorkoutSessionOrmEntity>,
        @InjectRepository(SetLogOrmEntity)
        private readonly setRepository: Repository<SetLogOrmEntity>,
    ) {}

    // La sesión y sus series se guardan juntas: las series que ya no están se borran
    async save(session: WorkoutSession): Promise<WorkoutSession> {
        await this.repository.manager.transaction(async (manager) => {
            await manager.save(WorkoutSessionOrmEntity, workoutSessionMapper.toOrm(session));

            const setIds = session.getSets().map((set) => set.Id);
            await manager.delete(SetLogOrmEntity, setIds.length > 0
                ? { workoutSessionId: session.Id, id: Not(In(setIds)) }
                : { workoutSessionId: session.Id });
            await manager.save(SetLogOrmEntity, workoutSessionMapper.toSetOrms(session));
        });
        return session;
    }

    async findByIdForUser(id: string, userId: string): Promise<WorkoutSession | null> {
        const session = await this.repository.findOneBy({ id, userId });
        if (!session) {
            return null;
        }
        const sets = await this.setRepository.findBy({ workoutSessionId: id });
        return workoutSessionMapper.toDomain(session, sets);
    }

    async findByUserId(userId: string): Promise<WorkoutSession[]> {
        const sessions = await this.repository.find({ where: { userId }, order: { time: 'DESC' } });
        if (sessions.length === 0) {
            return [];
        }

        const sets = await this.setRepository.findBy({ workoutSessionId: In(sessions.map((session) => session.id)) });
        return sessions.map((session) =>
            workoutSessionMapper.toDomain(session, sets.filter((set) => set.workoutSessionId === session.id)),
        );
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete({ id });
    }
}
