import {
  Controller,
  Get,
  UseGuards,
  Param,
  Post,
  Body,
  Query,
} from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/entities/user.entity';
import { UserCreatePredictionDto } from './dto/user-create-prediction.dto';
import { PaginationDto } from '@/core/dto/pagination.dto';

@UseGuards(JwtAuthGuard)
@Controller('predictions')
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  @Get('ai-prediction/:matchId')
  async getAIPrediction(
    @Param('matchId') matchId: number,
    @CurrentUser() user: User,
  ) {
    return this.predictionsService.getAIPrediction(matchId, user);
  }

  @Post('user-prediction/:matchId')
  async userCreatePrediction(
    @CurrentUser() user: User,
    @Param('matchId') matchId: number,
    @Body() body: UserCreatePredictionDto,
  ) {
    return this.predictionsService.userCreatePrediction(user.id, matchId, body);
  }

  @Get('my-prediction/:matchId')
  async getMyPrediction(
    @CurrentUser() user: User,
    @Param('matchId') matchId: number,
  ) {
    return this.predictionsService.getMyPrediction(user.id, matchId);
  }

  @Get('community/:matchId')
  async getCommunityPredictions(
    @Param('matchId') matchId: number,
    @Query() paginationParams: PaginationDto,
  ) {
    return this.predictionsService.getCommunityPredictions(
      matchId,
      paginationParams,
    );
  }
}
