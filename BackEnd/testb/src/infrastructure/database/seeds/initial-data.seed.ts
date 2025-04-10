import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { ProductEntity } from '../../../domain/entities/product.entity';
import { v4 as uuidv4 } from 'uuid';

export class InitialDataSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const productRepository = dataSource.getRepository(ProductEntity);

    // Check if products already exist
    const existingProductCount = await productRepository.count();

    if (existingProductCount === 0) {
      // No products exist, let's create some dummy data
      const products = [
        {
          id: uuidv4(),
          name: 'FF7 remake',
          description: 'the best rpg',
          price: 19.99,
          quantity: 100,
        },
        {
          id: uuidv4(),
          name: 'medal of honor',
          description: 'one of the best classic games',
          price: 9.99,
          quantity: 200,
        },
        {
          id: uuidv4(),
          name: 'crash bandicoot',
          description: 'to remember the old times',
          price: 199.99,
          quantity: 50,
        },
        {
          id: uuidv4(),
          name: 'age of empires',
          description: 'arise your army and destroy your enemies',
          price: 29.99,
          quantity: 500,
        },
      ];

      // Insert the products
      await productRepository.save(products);

      console.log('✅ Products seeded successfully');
    } else {
      console.log('ℹ️ Skipping product seeding - data already exists');
    }
  }
}
