import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ProductEntity } from 'src/domain/entities/product.entity';
import { Result } from 'src/common/result';

@Injectable()
export class GetProductsUseCase {
  constructor(private readonly entityManager: EntityManager) {}

  async execute(): Promise<Result<ProductEntity[], Error>> {
    try {
      const products = await this.entityManager
        .createQueryBuilder(ProductEntity, 'product')
        .getMany();
      return Result.ok(products);
    } catch (error) {
      return Result.err(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  async getById(id: string): Promise<Result<ProductEntity, Error>> {
    try {
      const product = await this.entityManager
        .createQueryBuilder(ProductEntity, 'product')
        .where('product.id = :id', { id })
        .getOne();

      if (!product) {
        return Result.err(new Error('Product not found'));
      }

      return Result.ok(product);
    } catch (error) {
      return Result.err(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }
}
