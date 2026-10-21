import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { randomUUID } from "crypto";
import { Product } from "../../domain/models/Product.entity.js";
import { productMapper } from "./Product.mapper.js";
import { ProductOrmEntity } from "./ProductOrm.entity.js";

const SAMPLE_PRODUCTS = [
    { name: 'Proteína Whey 2lb', description: 'Proteína de suero sabor vainilla', price: 120000, stock: 25 },
    { name: 'Creatina Monohidratada 300g', description: 'Creatina micronizada sin sabor', price: 85000, stock: 40 },
    { name: 'Guantes de entrenamiento', description: 'Guantes con soporte de muñeca, talla M', price: 45000, stock: 15 },
    { name: 'Banda elástica de resistencia', description: 'Set de 5 bandas de distinta resistencia', price: 35000, stock: 30 },
    { name: 'Shaker 600ml', description: 'Mezclador con compartimento para polvo', price: 18000, stock: 50 },
];

// Inserta productos de ejemplo al arrancar si la tabla está vacía
@Injectable()
export class ProductSeeder implements OnApplicationBootstrap {
    private readonly logger = new Logger(ProductSeeder.name);

    constructor(
        @InjectRepository(ProductOrmEntity)
        private readonly repository: Repository<ProductOrmEntity>,
    ) {}

    async onApplicationBootstrap(): Promise<void> {
        if (await this.repository.count() > 0) {
            return;
        }

        const products = SAMPLE_PRODUCTS.map((product) => productMapper.toOrm(new Product({ id: randomUUID(), ...product })));
        await this.repository.save(products);
        this.logger.log(`Seeded ${products.length} sample products`);
    }
}
