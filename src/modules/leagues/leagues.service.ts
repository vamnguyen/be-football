import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { League } from '../../entities/league.entity';
import { SPORTS } from '../../core/enums/sports.enum';

@Injectable()
export class LeaguesService {
  constructor(
    @InjectRepository(League)
    private leagueRepository: Repository<League>,
  ) {}

  async findAll(sport?: SPORTS): Promise<League[]> {
    const queryBuilder = this.leagueRepository
      .createQueryBuilder('league')
      .where('league.isActive = true');

    if (sport) {
      queryBuilder.andWhere('league.sport = :sport', { sport });
    }

    return queryBuilder.orderBy('league.name', 'ASC').getMany();
  }

  async findOne(id: string): Promise<League> {
    return this.leagueRepository.findOneBy({ id });
  }
}
