import { IsString, IsUUID } from 'class-validator';

export class MessageAttachmentDto {
  @IsUUID()
  id: string;

  @IsString()
  url?: string;

  @IsString()
  mimetype?: string;
}
