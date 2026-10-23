import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { ExerciseOrmEntity } from "../../../exercises/infrastructure/persistence/ExerciseOrm.entity.js";
import { RoutineOrmEntity } from "./RoutineOrm.entity.js";

@Entity({ name: 'routine_exercises' })
export class RoutineExerciseOrmEntity {
    @PrimaryColumn('uuid')
    routineId: string

    @PrimaryColumn('uuid')
    exerciseId: string

    @Column('int')
    targetSets: number

    @Column('int')
    targetReps: number

    // Orden del ejercicio dentro de la rutina
    @Column('int')
    position: number

    @ManyToOne(() => RoutineOrmEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'routineId' })
    routine?: RoutineOrmEntity

    @ManyToOne(() => ExerciseOrmEntity, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'exerciseId' })
    exercise?: ExerciseOrmEntity
}
