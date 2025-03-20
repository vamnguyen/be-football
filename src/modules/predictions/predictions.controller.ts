import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { FilterMatchesDto } from './dto/filter-matches.dto';
import { PaginationDto } from '../../core/dto/pagination.dto';

@Controller('predictions')
@UseGuards(JwtAuthGuard)
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  @Get('matches')
  async getUpcomingMatches(@Query() filter: FilterMatchesDto) {
    return this.predictionsService.getUpcomingMatches(filter);
  }

  @Post('predict')
  async createPrediction(
    @Body() body: { matchId: string; additionalContext?: string },
    @CurrentUser() user: User,
  ) {
    return this.predictionsService.createPrediction(
      body.matchId,
      user,
      body.additionalContext,
    );
  }

  @Get('my-predictions')
  async getUserPredictions(
    @CurrentUser() user: User,
    @Query() pagination: PaginationDto,
  ) {
    return this.predictionsService.getUserPredictions(user.id, pagination);
  }
}
