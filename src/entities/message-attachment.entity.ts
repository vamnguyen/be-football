import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Message } from './message.entity';

@Entity('message_attachments')
export class MessageAttachment extends BaseEntity {
  @ManyToOne(() => Message, (message) => message.attachments)
  message: Message;

  @Column({ select: false })
  key: string;

  @Column()
  url: string;

  @Column()
  mimeType: string;
}
