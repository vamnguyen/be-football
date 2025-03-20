import { DataSource } from 'typeorm';
import { Match } from '../../entities/match.entity';
import { LEAGUES } from '../../core/enums';

export const seedMatches = async (dataSource: DataSource) => {
  const matchRepository = dataSource.getRepository(Match);

  const matches = [
    {
      homeTeam: 'Manchester United',
      awayTeam: 'Liverpool',
      matchDate: new Date('2025-03-20T20:00:00Z'),
      league: LEAGUES.PREMIER_LEAGUE,
    },
    {
      homeTeam: 'Arsenal',
      awayTeam: 'Chelsea',
      matchDate: new Date('2025-03-21T19:45:00Z'),
      league: LEAGUES.PREMIER_LEAGUE,
    },
    {
      homeTeam: 'Manchester City',
      awayTeam: 'Tottenham Hotspur',
      matchDate: new Date('2025-03-22T20:00:00Z'),
      league: LEAGUES.PREMIER_LEAGUE,
    },
    {
      homeTeam: 'Real Madrid',
      awayTeam: 'Barcelona',
      matchDate: new Date('2025-03-23T20:00:00Z'),
      league: LEAGUES.LA_LIGA,
    },
    {
      homeTeam: 'Bayern Munich',
      awayTeam: 'Borussia Dortmund',
      matchDate: new Date('2025-03-24T19:30:00Z'),
      league: LEAGUES.BUNDESLIGA,
    },
    {
      homeTeam: 'Juventus',
      awayTeam: 'Inter Milan',
      matchDate: new Date('2025-03-25T20:00:00Z'),
      league: LEAGUES.SERIE_A,
    },
    {
      homeTeam: 'Vietnam',
      awayTeam: 'Laos',
      matchDate: new Date('2025-03-25T20:00:00Z'),
    },
    {
      homeTeam: 'Vietnam',
      awayTeam: 'Thailand',
      matchDate: new Date('2025-03-26T20:00:00Z'),
      league: LEAGUES.AFF_CUP,
    },
    {
      homeTeam: 'Vietnam',
      awayTeam: 'Philippines',
      matchDate: new Date('2025-03-27T20:00:00Z'),
    },
    {
      homeTeam: 'Vietnam',
      awayTeam: 'Indonesia',
      matchDate: new Date('2025-03-28T20:00:00Z'),
    },
  ];

  for (const match of matches) {
    const existingMatch = await matchRepository.findOne({
      where: {
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        matchDate: match.matchDate,
      },
    });

    if (!existingMatch) {
      const newMatch = matchRepository.create(match);

      await matchRepository.save(newMatch);
    }
  }
};
