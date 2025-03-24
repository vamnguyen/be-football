import { IsEnum, IsOptional } from 'class-validator';
import { SPORTS } from '../../../core/enums/sports.enum';
import { PaginationDto } from '../../../core/dto/pagination.dto';

export class FilterMatchesDto extends PaginationDto {
  @IsOptional()
  leagueId?: string;

  @IsEnum(SPORTS)
  sport: SPORTS;
}
