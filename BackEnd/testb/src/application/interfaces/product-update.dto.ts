import { EntityManager } from 'typeorm';

export interface UpdateProductStockDto {
  productId: string;
  quantity: number;
  entityManager?: EntityManager;
}
