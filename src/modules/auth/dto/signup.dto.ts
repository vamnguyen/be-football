import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { FOOTBALL_TEAMS } from 'src/core/enums';

export class SignupDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @Length(6, 100)
  password: string;

  @IsOptional()
  confirmPassword?: string;

  @IsNotEmpty()
  terms: boolean;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  favoriteTeam: FOOTBALL_TEAMS;
}
