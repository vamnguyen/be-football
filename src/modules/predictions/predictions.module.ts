import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prediction } from '../../entities/prediction.entity';
import { PredictionsController } from './predictions.controller';
import { PredictionsService } from './predictions.service';
import { MatchesModule } from '../matches/matches.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Prediction]), MatchesModule, UsersModule],
  controllers: [PredictionsController],
  providers: [PredictionsService],
  exports: [PredictionsService],
})
export class PredictionsModule {}
