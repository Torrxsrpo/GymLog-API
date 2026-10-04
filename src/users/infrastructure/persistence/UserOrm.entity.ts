import { Column, Entity, PrimaryColumn } from "typeorm";
import { Role } from "../../domain/models/enums/Role.enum.js";



@Entity({ name: 'users' })
export class UserOrmEntity {
    @PrimaryColumn('uuid')
    id: string

    @Column('text')
    name: string

    @Column('text' , { unique: true })
    email: string

    @Column('text')
    password: string

    @Column('boolean')
    status: boolean

    @Column({
    type: 'enum',
    enum: Role,
    array: true,
    default: [Role.USER],
    })
    Roles: Role[];
    } 