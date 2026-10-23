import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { ExerciseOrmEntity } from "../../../exercises/infrastructure/persistence/ExerciseOrm.entity.js";
import { WorkoutSessionOrmEntity } from "./WorkoutSessionOrm.entity.js";

@Entity({ name: 'set_logs' })
export class SetLogOrmEntity {
    @PrimaryColumn('uuid')
    id: string

    @Column('uuid')
    workoutSessionId: string

    @Column('uuid')
    exerciseId: string

    @Column('int')
    reps: number

    // Postgres devuelve numeric como string; el mapper lo convierte a number
    @Column('numeric', { precision: 6, scale: 2 })
    weight: string

    @Column('timestamptz')
    createdAt: Date

    @ManyToOne(() => WorkoutSessionOrmEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'workoutSessionId' })
    workoutSession?: WorkoutSessionOrmEntity

    @ManyToOne(() => ExerciseOrmEntity, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'exerciseId' })
    exercise?: ExerciseOrmEntity
}
