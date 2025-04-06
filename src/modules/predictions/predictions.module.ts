import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prediction } from '@/entities';
import { PredictionsController } from './predictions.controller';
import { PredictionsService } from './predictions.service';
import { UsersModule } from '../users/users.module';
import { FootballDataModule } from '../football-data/football-data.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Prediction]),
    UsersModule,
    FootballDataModule,
  ],
  controllers: [PredictionsController],
  providers: [PredictionsService],
  exports: [PredictionsService],
})
export class PredictionsModule {}
