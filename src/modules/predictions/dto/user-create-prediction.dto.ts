import { IsString } from 'class-validator';

export class UserCreatePredictionDto {
  @IsString()
  result: string;

  @IsString()
  explanation: string;
}
