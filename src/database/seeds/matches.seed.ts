import { Match } from '../../entities/match.entity';
import { DataSource } from 'typeorm';
import { FOOTBALL_TEAMS } from '../../core/enums/football-teams.enum';
import { SPORTS } from '../../core/enums/sports.enum';
import { LEAGUES } from '../../core/enums/leagues.enum';

export const seedMatches = async (dataSource: DataSource) => {
  const matchRepository = dataSource.getRepository(Match);
  const matches = await matchRepository.find();

  if (matches.length > 0) {
    return;
  }

  await matchRepository.save([
    {
      homeTeam: FOOTBALL_TEAMS.MAN_UNITED,
      awayTeam: FOOTBALL_TEAMS.LIVERPOOL,
      league: {
        name: LEAGUES.PREMIER_LEAGUE,
        sport: SPORTS.FOOTBALL,
      },
      matchDate: new Date('2025-03-23T20:00:00Z'),
      sport: SPORTS.FOOTBALL,
      matchTime: '20:00',
    },
    {
      homeTeam: FOOTBALL_TEAMS.BARCELONA,
      awayTeam: FOOTBALL_TEAMS.ATLETICO_MADRID,
      league: {
        name: LEAGUES.LA_LIGA,
        sport: SPORTS.FOOTBALL,
      },
      matchDate: new Date('2025-03-23T23:00:00Z'),
      sport: SPORTS.FOOTBALL,
      matchTime: '23:00',
    },
    {
      homeTeam: FOOTBALL_TEAMS.BAYERN_MUNICH,
      awayTeam: FOOTBALL_TEAMS.BORUSSIA_DORTMUND,
      league: {
        name: LEAGUES.BUNDESLIGA,
        sport: SPORTS.FOOTBALL,
      },
      matchDate: new Date('2025-03-24T20:00:00Z'),
      sport: SPORTS.FOOTBALL,
      matchTime: '20:00',
    },
    {
      homeTeam: FOOTBALL_TEAMS.JUVENTUS,
      awayTeam: FOOTBALL_TEAMS.AC_MILAN,
      league: {
        name: LEAGUES.SERIE_A,
        sport: SPORTS.FOOTBALL,
      },
      matchDate: new Date('2025-03-24T23:00:00Z'),
      sport: SPORTS.FOOTBALL,
      matchTime: '23:00',
    },
    {
      homeTeam: FOOTBALL_TEAMS.VIETNAM,
      awayTeam: FOOTBALL_TEAMS.THAILAND,
      league: {
        name: LEAGUES.AFF_CUP,
        sport: SPORTS.FOOTBALL,
      },
      matchDate: new Date('2025-03-25T21:00:00Z'),
      sport: SPORTS.FOOTBALL,
      matchTime: '21:00',
    },
    {
      homeTeam: FOOTBALL_TEAMS.VIETNAM,
      awayTeam: FOOTBALL_TEAMS.CAMBODIA,
      league: {
        name: LEAGUES.AFF_CUP,
        sport: SPORTS.FOOTBALL,
      },
      matchDate: new Date('2025-03-25T23:00:00Z'),
      sport: SPORTS.FOOTBALL,
      matchTime: '23:00',
    },
    {
      homeTeam: FOOTBALL_TEAMS.VIETNAM,
      awayTeam: FOOTBALL_TEAMS.LAOS,
      league: {
        name: LEAGUES.AFF_CUP,
        sport: SPORTS.FOOTBALL,
      },
      matchDate: new Date('2025-03-26T21:00:00Z'),
      sport: SPORTS.FOOTBALL,
      matchTime: '21:00',
    },
  ]);
};
