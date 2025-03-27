import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from '../../entities/match.entity';
import { PaginationResponseDto } from '../../core/dto/pagination.dto';
import { FilterMatchesDto } from './dto/filter-matches.dto';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
  ) {}

  async getUpcomingMatches(
    filter: FilterMatchesDto,
  ): Promise<PaginationResponseDto<Match>> {
    const { page = 1, limit = 10, leagueId, sport } = filter;
    const skip = (page - 1) * limit;

    const queryBuilder = this.matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.league', 'league')
      .where('match.matchDate > :now', { now: new Date() })
      .andWhere('match.isFinished = false');

    if (leagueId && leagueId !== 'All') {
      queryBuilder.andWhere('match.leagueId = :leagueId', { leagueId });
    }

    if (sport) {
      queryBuilder.andWhere('match.sport = :sport', { sport });
    }

    const [matches, total] = await queryBuilder
      .orderBy('match.matchDate', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: matches,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getMatchById(id: string): Promise<Match> {
    return this.matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.league', 'league')
      .leftJoinAndSelect('match.predictions', 'predictions')
      .leftJoinAndSelect('predictions.user', 'user')
      .where('match.id = :id', { id })
      .getOne();
  }
}
