import { Injectable } from '@nestjs/common';
import { ProductEntity } from 'src/domain/entities/product.entity';
import { ProductDto } from '../interfaces/product.dto';
import { Result } from 'src/common/result';
import { EntityManager } from 'typeorm';

@Injectable()
export class UpdateProductUseCase {
  constructor(private readonly entityManager: EntityManager) {}
  async execute(
    id: string,
    dto: ProductDto,
  ): Promise<Result<ProductEntity, Error>> {
    try {
      return await this.entityManager.transaction(
        async (transactionalEntityManager) => {
          const product = await transactionalEntityManager
            .createQueryBuilder(ProductEntity, 'product')
            .setLock('pessimistic_write')
            .where('product.id = :id', { id })
            .getOne();

          if (!product) {
            return Result.err(new Error('Product not found'));
          }
          if (dto.quantity === undefined) {
            return Result.err(new Error('quantity cant be empty or 0'));
          }
          const newQuantity = product.quantity - dto.quantity;
          if (newQuantity < 0) {
            return Result.err(new Error('Insufficient product quantity'));
          }
          product.quantity = newQuantity;

          const updatedProduct = await transactionalEntityManager.save(product);
          return Result.ok(updatedProduct);
        },
      );
    } catch (error) {
      return Result.err(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }
}
