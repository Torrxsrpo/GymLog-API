import { Product } from "../models/Product.entity.js";

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface ProductRepositoryPort {
    findAll(): Promise<Product[]>;
}
