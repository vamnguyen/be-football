import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';
import { MessageAttachmentDto } from './message-attachment.dto';

export class CreateMessageDto {
  @IsOptional()
  @IsString()
  content?: string | null;

  @IsOptional()
  @IsUUID()
  parentMessageId?: string | null;

  @IsOptional()
  @IsArray()
  attachments?: MessageAttachmentDto[] | null;
}
