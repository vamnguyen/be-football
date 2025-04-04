import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RedisModule } from '@/modules/redis/redis.module';
import { FootballDataService } from './football-data.service';
import { FootballDataController } from './football-data.controller';

@Module({
  imports: [HttpModule, RedisModule],
  controllers: [FootballDataController],
  providers: [FootballDataService],
})
export class FootballDataModule {}
