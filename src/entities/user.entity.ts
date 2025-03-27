import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { RefreshToken } from './refresh-token.entity';
import { hashSync, genSaltSync, compareSync } from 'bcrypt';
import { Message } from './message.entity';
import { ChatRoom } from './chat-room.entity';
import { ROLE } from '@/core/enums';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', select: false })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  firstName: string;

  @Column({ type: 'varchar', nullable: true })
  lastName: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ type: 'boolean', default: false })
  terms: boolean;

  @Column({ type: 'boolean', default: false })
  isBanned: boolean;

  @Column({ type: 'enum', enum: ROLE, default: ROLE.USER })
  role: ROLE;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ type: 'boolean', default: false })
  isOnline: boolean;

  @OneToMany(() => Message, (message) => message.author)
  messages: Message[];

  @ManyToMany(() => ChatRoom, (chatRoom) => chatRoom.users)
  chatRooms: ChatRoom[];

  @BeforeInsert()
  @BeforeUpdate()
  hashPassword() {
    if (this.password) {
      const salt = genSaltSync(10);
      this.password = hashSync(this.password, salt);
    }
  }

  comparePassword(passwordReceived: string): boolean {
    return compareSync(passwordReceived, this.password);
  }
}
