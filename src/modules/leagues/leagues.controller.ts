import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { LeaguesService } from './leagues.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SPORTS } from '../../core/enums/sports.enum';

@Controller('leagues')
@UseGuards(JwtAuthGuard)
export class LeaguesController {
  constructor(private readonly leaguesService: LeaguesService) {}

  @Get()
  async findAll(@Query('sport') sport?: SPORTS) {
    return this.leaguesService.findAll(sport);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.leaguesService.findOne(id);
  }
}
