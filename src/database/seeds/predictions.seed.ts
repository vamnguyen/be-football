import { DataSource } from 'typeorm';
import { Prediction } from '../../entities/prediction.entity';
import { Match } from '../../entities/match.entity';
import { User } from '../../entities/user.entity';

export const seedPredictions = async (dataSource: DataSource) => {
  const predictionRepository = dataSource.getRepository(Prediction);
  const matchRepository = dataSource.getRepository(Match);
  const userRepository = dataSource.getRepository(User);

  // Get the first match and user for seeding
  const match = await matchRepository.findOne({
    where: {
      homeTeam: 'Manchester United',
      awayTeam: 'Liverpool',
      matchDate: new Date('2025-03-20T20:00:00Z'),
    },
  });

  const user = await userRepository.findOne({
    where: { email: 'test@gmail.com' },
  });

  if (!match || !user) {
    console.log('Match or user not found for seeding predictions');
    return;
  }

  const predictions = [
    {
      match,
      user,
      explanation: `
        <strong>Predicted Winner:</strong> Manchester United<br />
        <strong>Predicted Score:</strong> Manchester United 2 - 1 Liverpool<br />
        <strong>Confidence Score:</strong> 75<br />
        <strong>Explanation:</strong><br />
        Manchester United has been in good form recently, with their home record being particularly strong. 
        The team's midfield has shown great chemistry, and their attacking options are diverse. 
        While Liverpool is always dangerous, United's defensive improvements and home advantage should give them the edge.
      `,
      confidence: 75,
    },
    {
      match,
      user,
      explanation: `
        <strong>Predicted Winner:</strong> Draw<br />
        <strong>Predicted Score:</strong> Manchester United 1 - 1 Liverpool<br />
        <strong>Confidence Score:</strong> 65<br />
        <strong>Explanation:</strong><br />
        This is a high-stakes match between two evenly matched teams. 
        Both sides have shown defensive solidity in recent games, and the pressure of the occasion might lead to a cagey affair. 
        A draw seems the most likely outcome given the historical context and current form of both teams.
      `,
      confidence: 65,
    },
  ];

  for (const prediction of predictions) {
    const existingPrediction = await predictionRepository.findOne({
      where: {
        match: { id: prediction.match.id },
        user: { id: prediction.user.id },
        explanation: prediction.explanation,
      },
    });

    if (!existingPrediction) {
      const newPrediction = predictionRepository.create(prediction);
      await predictionRepository.save(newPrediction);
    }
  }
};
