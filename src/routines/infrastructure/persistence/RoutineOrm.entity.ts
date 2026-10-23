import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { UserOrmEntity } from "../../../users/infrastructure/persistence/UserOrm.entity.js";

@Entity({ name: 'routines' })
export class RoutineOrmEntity {
    @PrimaryColumn('uuid')
    id: string

    @Column('uuid')
    userId: string

    @Column('text')
    name: string

    @Column('timestamptz')
    date: Date

    @Column('int')
    frequency: number

    @ManyToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user?: UserOrmEntity
}
