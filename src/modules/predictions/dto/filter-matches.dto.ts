import { IsOptional } from 'class-validator';
import { LEAGUES } from '../../../core/enums';
import { PaginationDto } from 'src/core/dto/pagination.dto';

export class FilterMatchesDto extends PaginationDto {
  @IsOptional()
  league?: LEAGUES;
}
