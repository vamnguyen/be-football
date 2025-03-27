import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { ChatRoom } from './chat-room.entity';
import { MessageAttachment } from './message-attachment.entity';

@Entity('messages')
export class Message extends BaseEntity {
  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'boolean', default: false })
  isEdited: boolean;

  @ManyToOne(() => User, (user) => user.messages)
  author: User;

  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.messages)
  chatRoom: ChatRoom;

  @OneToMany(
    () => MessageAttachment,
    (messageAttachment) => messageAttachment.message,
    { cascade: true },
  )
  attachments: MessageAttachment[];

  @ManyToOne(() => Message, (message) => message.replies)
  parentMessage: Message;

  @OneToMany(() => Message, (message) => message.parentMessage)
  replies: Message[];
}
