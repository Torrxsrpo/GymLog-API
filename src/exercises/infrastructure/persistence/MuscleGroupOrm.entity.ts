import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: 'muscle_groups' })
export class MuscleGroupOrmEntity {
    @PrimaryColumn('text')
    id: string

    @Column('text', { unique: true })
    name: string
}
