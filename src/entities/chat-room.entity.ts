import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Match } from './match.entity';
import { Message } from './message.entity';
import { User } from './user.entity';

@Entity('chat_rooms')
export class ChatRoom extends BaseEntity {
  @Column()
  name: string;

  @OneToOne(() => Match)
  @JoinColumn({ name: 'matchId' })
  match: Match;

  @OneToMany(() => Message, (message) => message.chatRoom)
  messages: Message[];

  @OneToOne(() => User)
  @JoinColumn({ name: 'adminId' })
  admin: User;

  @ManyToMany(() => User, (user) => user.chatRooms)
  users: User[];
}
