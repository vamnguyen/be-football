import { IsString, IsUUID } from 'class-validator';

export class MessageAttachmentDto {
  @IsUUID()
  id: string;

  @IsString()
  key: string;

  @IsString()
  url?: string;

  @IsString()
  mimetype?: string;
}
