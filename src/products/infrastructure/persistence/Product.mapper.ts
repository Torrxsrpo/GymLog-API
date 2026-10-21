import { Product } from "../../domain/models/Product.entity.js";
import { ProductOrmEntity } from "./ProductOrm.entity.js";

export class productMapper {
  static toDomain(orm: ProductOrmEntity): Product {
    return new Product({
      id: orm.id,
      name: orm.name,
      description: orm.description,
      price: Number(orm.price),
      stock: orm.stock,
    });
  }

  static toOrm(domain: Product): ProductOrmEntity {
    const orm = new ProductOrmEntity();
    orm.id = domain.Id;
    orm.name = domain.getName();
    orm.description = domain.getDescription();
    orm.price = domain.getPrice().toFixed(2);
    orm.stock = domain.getStock();
    return orm;
  }
}
