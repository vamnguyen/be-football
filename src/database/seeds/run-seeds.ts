import { DataSource } from 'typeorm';
import { runSeeds } from './index';
import { config } from 'dotenv';

config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ['src/entities/*.entity.ts'],
  synchronize: false,
  logging: true,
});

dataSource
  .initialize()
  .then(async () => {
    try {
      await runSeeds(dataSource);
      console.log('Seeds completed successfully');
      process.exit(0);
    } catch (error) {
      console.error('Error running seeds:', error);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('Error initializing DataSource:', error);
    process.exit(1);
  });
