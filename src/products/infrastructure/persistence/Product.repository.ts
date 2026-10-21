import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Product } from "../../domain/models/Product.entity.js";
import { ProductRepositoryPort } from "../../domain/ports/ProductRepository.port.js";
import { productMapper } from "./Product.mapper.js";
import { ProductOrmEntity } from "./ProductOrm.entity.js";

export class ProductRepositoryAdapter implements ProductRepositoryPort {
    constructor(
        @InjectRepository(ProductOrmEntity)
        private readonly repository: Repository<ProductOrmEntity>,
    ) {}

    async findAll(): Promise<Product[]> {
        const products = await this.repository.find({ order: { name: 'ASC' } });
        return products.map(productMapper.toDomain);
    }
}
