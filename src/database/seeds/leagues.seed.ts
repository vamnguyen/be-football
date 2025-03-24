import { DataSource } from 'typeorm';
import { League } from '../../entities/league.entity';
import { SPORTS } from '../../core/enums/sports.enum';
import { LEAGUES } from '../../core/enums/leagues.enum';

export const seedLeagues = async (dataSource: DataSource) => {
  const leagueRepository = dataSource.getRepository(League);

  await leagueRepository.save([
    {
      name: LEAGUES.PREMIER_LEAGUE,
      sport: SPORTS.FOOTBALL,
    },
    {
      name: LEAGUES.LA_LIGA,
      sport: SPORTS.FOOTBALL,
    },
    {
      name: LEAGUES.BUNDESLIGA,
      sport: SPORTS.FOOTBALL,
    },
    {
      name: LEAGUES.SERIE_A,
      sport: SPORTS.FOOTBALL,
    },
    {
      name: LEAGUES.AFF_CUP,
      sport: SPORTS.FOOTBALL,
    },
    {
      name: LEAGUES.WORLD_CUP,
      sport: SPORTS.FOOTBALL,
    },
    {
      name: LEAGUES.ASIAN_CUP,
      sport: SPORTS.FOOTBALL,
    },
    {
      name: LEAGUES.SEA_GAMES,
      sport: SPORTS.FOOTBALL,
    },
    {
      name: LEAGUES.LCK,
      sport: SPORTS.ESPORTS,
    },
    {
      name: LEAGUES.LPL,
      sport: SPORTS.ESPORTS,
    },
    {
      name: LEAGUES.VCS,
      sport: SPORTS.ESPORTS,
    },
  ]);
};
