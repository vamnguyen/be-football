import { IsEnum, IsOptional, IsString } from 'class-validator';
import { FOOTBALL_TEAMS } from 'src/core/enums';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEnum(FOOTBALL_TEAMS)
  @IsOptional()
  favoriteTeam?: FOOTBALL_TEAMS;
}
