import { DataSource } from 'typeorm';
import { seedPredictions } from './predictions.seed';
import { seedLeagues } from './leagues.seed';
import { seedMatches } from './matches.seed';

export const runSeeds = async (dataSource: DataSource) => {
  try {
    console.log('Running seeds...');

    await seedLeagues(dataSource);
    console.log('Leagues seeded successfully');

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
