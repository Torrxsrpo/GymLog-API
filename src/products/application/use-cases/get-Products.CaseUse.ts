import { Inject, Injectable } from "@nestjs/common";
import { Product } from "../../domain/models/Product.entity.js";
import { PRODUCT_REPOSITORY, type ProductRepositoryPort } from "../../domain/ports/ProductRepository.port.js";

@Injectable()
export class GetProductsUseCase {
    constructor(
        @Inject (PRODUCT_REPOSITORY) private readonly productRepository: ProductRepositoryPort) {}

    async execute(): Promise<Product[]> {
        return await this.productRepository.findAll();
    }
}
