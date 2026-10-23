import { Controller, Get } from "@nestjs/common";
import { GetProductsUseCase } from "../../../application/use-cases/get-Products.CaseUse.js";

@Controller('products')
export class ProductsController {
    constructor(private readonly getProductsUseCase: GetProductsUseCase) {}

    @Get()
    async findAll() {
        const products = await this.getProductsUseCase.execute();

        return products.map((product) => ({
            id: product.Id,
            name: product.getName(),
            description: product.getDescription(),
            price: product.getPrice(),
            stock: product.getStock(),
        }));
    }
}
