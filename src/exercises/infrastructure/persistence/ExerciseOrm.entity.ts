import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { MuscleGroupOrmEntity } from "./MuscleGroupOrm.entity.js";

@Entity({ name: 'exercises' })
export class ExerciseOrmEntity {
    @PrimaryColumn('uuid')
    id: string

    @Column('text', { unique: true })
    name: string

    @Column('text', { nullable: true })
    img: string | null

    @Column('text')
    muscleGroupId: string

    // Solo para crear la FK; el dominio trabaja con muscleGroupId
    @ManyToOne(() => MuscleGroupOrmEntity, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'muscleGroupId' })
    muscleGroup?: MuscleGroupOrmEntity
}
