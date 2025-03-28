import { FILE_TYPE } from '@/core/enums';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UploadFileDto {
  @IsNotEmpty()
  @IsEnum(FILE_TYPE)
  type: FILE_TYPE;
}
