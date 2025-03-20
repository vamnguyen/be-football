import { DataSource } from 'typeorm';
import { seedMatches } from './matches.seed';
import { seedPredictions } from './predictions.seed';

export const runSeeds = async (dataSource: DataSource) => {
  try {
    console.log('Running seeds...');

    await seedMatches(dataSource);
    console.log('Matches seeded successfully');

    await seedPredictions(dataSource);
    console.log('Predictions seeded successfully');

    console.log('All seeds completed successfully');
  } catch (error) {
    console.error('Error running seeds:', error);
    throw error;
  }
};
