import { Expose } from 'class-transformer';
import { IsString, IsEmail, IsEnum } from 'class-validator';
import { FOOTBALL_TEAMS } from 'src/core/enums';

export class UserResponseDto {
  @Expose()
  @IsString()
  id: string;

  @Expose()
  @IsEmail()
  email: string;

  @Expose()
  @IsString()
  firstName: string;

  @Expose()
  @IsString()
  lastName: string;

  @Expose()
  @IsString()
  avatar: string;

  @Expose()
  @IsEnum(FOOTBALL_TEAMS)
  favoriteTeam: FOOTBALL_TEAMS;

  @Expose()
  @IsString()
  createdAt: string;
}
