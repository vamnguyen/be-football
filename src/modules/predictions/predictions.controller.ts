import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@Controller('predictions')
@UseGuards(JwtAuthGuard)
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  @Get('matches')
  async getUpcomingMatches() {
    return this.predictionsService.getUpcomingMatches();
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
  async getUserPredictions(@CurrentUser() user: User) {
    return this.predictionsService.getUserPredictions(user.id);
  }
}
