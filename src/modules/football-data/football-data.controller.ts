import { Controller, Get, Param, Query } from '@nestjs/common';
import { FootballDataService } from './football-data.service';

@Controller('football-data')
export class FootballDataController {
  constructor(private readonly footballDataService: FootballDataService) {}

  @Get('areas/:id')
  getArea(@Param('id') id: number) {
    return this.footballDataService.getArea(id);
  }

  @Get('areas')
  getAreaList() {
    return this.footballDataService.getAreaList();
  }

  @Get('competitions')
  getCompetitionList() {
    return this.footballDataService.getCompetitionList();
  }

  @Get('competitions/:code')
  getCompetition(@Param('code') code: string) {
    return this.footballDataService.getCompetition(code);
  }

  @Get('competitions/:code/standings')
  getCompetitionStandings(
    @Param('code') code: string,
    @Query('matchday') matchday?: number,
    @Query('season') season?: string,
  ) {
    return this.footballDataService.getCompetitionStandings({
      code,
      matchday,
      season,
    });
  }

  @Get('competitions/:code/matches')
  getCompetitionMatches(
    @Param('code') code: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('stage') stage?: string,
    @Query('status') status?: string,
    @Query('matchday') matchday?: number,
    @Query('group') group?: string,
    @Query('season') season?: string,
  ) {
    return this.footballDataService.getCompetitionMatches({
      code,
      dateFrom,
      dateTo,
      stage,
      status,
      matchday,
      group,
      season,
    });
  }

  @Get('competitions/:code/teams')
  getCompetitionTeams(
    @Param('code') code: string,
    @Query('season') season?: string,
  ) {
    return this.footballDataService.getCompetitionTeams({
      code,
      season,
    });
  }

  @Get('competitions/:code/scorers')
  getCompetitionScorers(
    @Param('code') code: string,
    @Query('season') season?: string,
    @Query('limit') limit?: number,
  ) {
    return this.footballDataService.getCompetitionScorers({
      code,
      season,
      limit,
    });
  }

  @Get('teams/:id')
  getTeam(@Param('id') id: number) {
    return this.footballDataService.getTeam(id);
  }

  @Get('teams')
  getTeamList(
    @Query('offset') offset?: number,
    @Query('limit') limit?: number,
  ) {
    return this.footballDataService.getTeamList({ offset, limit });
  }

  @Get('teams/:id/matches')
  getTeamMatches(
    @Param('id') id: number,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('season') season?: string,
    @Query('competitions') competitions?: string,
    @Query('status') status?: string,
    @Query('venue') venue?: string,
    @Query('limit') limit?: number,
  ) {
    return this.footballDataService.getTeamMatches({
      id,
      dateFrom,
      dateTo,
      season,
      competitions,
      status,
      venue,
      limit,
    });
  }

  @Get('persons/:id')
  getPerson(@Param('id') id: number) {
    return this.footballDataService.getPerson(id);
  }

  @Get('persons/:id/matches')
  getPersonMatches(
    @Param('id') id: number,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('status') status?: string,
    @Query('competitions') competitions?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.footballDataService.getPersonMatches({
      id,
      dateFrom,
      dateTo,
      status,
      competitions,
      limit,
      offset,
    });
  }

  @Get('matches/:id')
  getMatch(@Param('id') id: number) {
    return this.footballDataService.getMatch(id);
  }

  @Get('matches')
  getMatchList(
    @Query('competitions') competitions?: string,
    @Query('ids') ids?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('status') status?: string,
  ) {
    return this.footballDataService.getMatchList({
      competitions,
      ids,
      dateFrom,
      dateTo,
      status,
    });
  }

  @Get('matches/:id/head2head')
  getMatchHead2Head(
    @Param('id') id: number,
    @Query('limit') limit?: number,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('status') status?: string,
  ) {
    return this.footballDataService.getMatchHead2Head({
      id,
      limit,
      dateFrom,
      dateTo,
      status,
    });
  }
}
