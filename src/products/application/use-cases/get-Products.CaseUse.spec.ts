import { GetProductsUseCase } from './get-Products.CaseUse.js';
import { ProductRepositoryPort } from '../../domain/ports/ProductRepository.port.js';
import { Product } from '../../domain/models/Product.entity.js';

describe('GetProductsUseCase', () => {
  const products = [
    new Product({ id: '1', name: 'Creatina', description: 'Sin sabor', price: 85000, stock: 40 }),
    new Product({ id: '2', name: 'Shaker', description: '600ml', price: 18000, stock: 50 }),
  ];

  let productRepository: ProductRepositoryPort;
  let useCase: GetProductsUseCase;

  beforeEach(() => {
    productRepository = { findAll: vi.fn(async () => products) };
    useCase = new GetProductsUseCase(productRepository);
  });

  it('devuelve todos los productos del repositorio', async () => {
    expect(await useCase.execute()).toEqual(products);
    expect(productRepository.findAll).toHaveBeenCalledOnce();
  });

  it('devuelve una lista vacía si no hay productos', async () => {
    vi.mocked(productRepository.findAll).mockResolvedValueOnce([]);

    expect(await useCase.execute()).toEqual([]);
  });
});
