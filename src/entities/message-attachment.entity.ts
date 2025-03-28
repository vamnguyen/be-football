import { Entity, ManyToOne } from 'typeorm';
import { Message } from './message.entity';
import { File } from './file.entity';

@Entity('message_attachments')
export class MessageAttachment extends File {
  @ManyToOne(() => Message, (message) => message.attachments)
  message: Message;
}
