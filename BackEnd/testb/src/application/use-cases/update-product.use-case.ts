import { Injectable } from '@nestjs/common';
import { ProductEntity } from 'src/domain/entities/product.entity';
import { Result } from 'src/common/result';
import { EntityManager } from 'typeorm';
import { UpdateProductStockDto } from '../interfaces/product-update.interface';

@Injectable()
export class UpdateProductUseCase {
  constructor(private readonly entityManager: EntityManager) {}

  async execute(
    dto: UpdateProductStockDto,
  ): Promise<Result<ProductEntity, Error>> {
    try {
      const manager = dto.entityManager || this.entityManager;

      // If we have an external entity manager, use it directly
      // Otherwise, create a new transaction
      if (dto.entityManager) {
        // Direct execution with provided entity manager
        const product = await manager
          .createQueryBuilder(ProductEntity, 'product')
          .where('product.id = :id', { id: dto.productId })
          .getOne();

        if (!product) {
          return Result.err(new Error('Product not found'));
        }

        if (dto.quantity <= 0) {
          return Result.err(new Error('Quantity must be greater than zero'));
        }

        const newQuantity = product.quantity - dto.quantity;
        if (newQuantity < 0) {
          return Result.err(new Error('Insufficient product quantity'));
        }

        product.quantity = newQuantity;
        const updatedProduct = await manager.save(product);
        return Result.ok(updatedProduct);
      } else {
        // Execute in a new transaction
        return await manager.transaction(async (transactionalEntityManager) => {
          const product = await transactionalEntityManager
            .createQueryBuilder(ProductEntity, 'product')
            .setLock('pessimistic_write')
            .where('product.id = :id', { id: dto.productId })
            .getOne();

          if (!product) {
            return Result.err(new Error('Product not found'));
          }

          if (dto.quantity <= 0) {
            return Result.err(new Error('Quantity must be greater than zero'));
          }

          const newQuantity = product.quantity - dto.quantity;
          if (newQuantity < 0) {
            return Result.err(new Error('Insufficient product quantity'));
          }

          product.quantity = newQuantity;
          const updatedProduct = await transactionalEntityManager.save(product);
          return Result.ok(updatedProduct);
        });
      }
    } catch (error) {
      return Result.err(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }
}
