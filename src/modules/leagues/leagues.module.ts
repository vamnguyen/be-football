import { Module } from '@nestjs/common';
import { LeaguesController } from './leagues.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { League } from '../../entities/league.entity';
import { LeaguesService } from './leagues.service';

@Module({
  imports: [TypeOrmModule.forFeature([League])],
  controllers: [LeaguesController],
  providers: [LeaguesService],
})
export class LeaguesModule {}
