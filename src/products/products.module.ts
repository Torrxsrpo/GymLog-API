import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetProductsUseCase } from './application/use-cases/get-Products.CaseUse.js';
import { PRODUCT_REPOSITORY } from './domain/ports/ProductRepository.port.js';
import { ProductOrmEntity } from './infrastructure/persistence/ProductOrm.entity.js';
import { ProductRepositoryAdapter } from './infrastructure/persistence/Product.repository.js';
import { ProductSeeder } from './infrastructure/persistence/Product.seeder.js';
import { ProductsController } from './infrastructure/http/controllers/Products.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([ProductOrmEntity])],
  controllers: [ProductsController],
  providers: [
    //cases uses
    GetProductsUseCase,

    { provide: PRODUCT_REPOSITORY, useClass: ProductRepositoryAdapter },
    ProductSeeder,
  ],
})
export class ProductsModule {}
