import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { SessionStatus } from "../../domain/models/enums/SessionStatus.enum.js";
import { UserOrmEntity } from "../../../users/infrastructure/persistence/UserOrm.entity.js";
import { RoutineOrmEntity } from "../../../routines/infrastructure/persistence/RoutineOrm.entity.js";

@Entity({ name: 'workout_sessions' })
export class WorkoutSessionOrmEntity {
    @PrimaryColumn('uuid')
    id: string

    @Column('uuid')
    userId: string

    @Column('uuid', { nullable: true })
    routineId: string | null

    @Column('timestamptz')
    time: Date

    @Column({ type: 'enum', enum: SessionStatus, default: SessionStatus.IN_PROGRESS })
    status: SessionStatus

    @Column('text', { nullable: true })
    notes: string | null

    @ManyToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user?: UserOrmEntity

    // Si se borra la rutina, el historial de sesiones se conserva
    @ManyToOne(() => RoutineOrmEntity, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'routineId' })
    routine?: RoutineOrmEntity
}
