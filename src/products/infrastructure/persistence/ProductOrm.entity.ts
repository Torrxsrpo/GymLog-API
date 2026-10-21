import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: 'products' })
export class ProductOrmEntity {
    @PrimaryColumn('uuid')
    id: string

    @Column('text', { unique: true })
    name: string

    @Column('text')
    description: string

    // Postgres devuelve numeric como string; el mapper lo convierte a number
    @Column('numeric', { precision: 10, scale: 2 })
    price: string

    @Column('int', { default: 0 })
    stock: number
}
