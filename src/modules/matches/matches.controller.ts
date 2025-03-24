import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { FilterMatchesDto } from './dto/filter-matches.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get(':id')
  async getMatchById(@Param('id') id: string) {
    return this.matchesService.getMatchById(id);
  }

  @Get()
  async getUpcomingMatches(@Query() filter: FilterMatchesDto) {
    return this.matchesService.getUpcomingMatches(filter);
  }
}
