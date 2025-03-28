import { Expose } from 'class-transformer';

export class FileResponseDto {
  @Expose()
  id: string;

  @Expose()
  key: string;

  @Expose()
  url: string;

  @Expose()
  mimetype: string;
}
