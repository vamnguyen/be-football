import { Expose } from 'class-transformer';
import { IsString, IsEmail } from 'class-validator';

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
}
