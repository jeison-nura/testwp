import { runSeeders } from 'typeorm-extension';
import { AppDataSource } from '../data-source';

async function main() {
  try {
    // Initialize the data source
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');

    // Run seeders
    await runSeeders(AppDataSource);
    console.log('Seeding completed!');

    // Close the connection
    await AppDataSource.destroy();
    console.log('Data Source has been closed!');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

main();
