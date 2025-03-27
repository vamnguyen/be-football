import { User } from '@/entities';
import { MessageAttachmentDto } from '../dto/message-attachment.dto';

export type CreateMessageType = {
  user: User;
  chatRoomId: string;
  content?: string | null;
  parentMessageId?: string | null;
  attachments?: MessageAttachmentDto[] | null;
};
