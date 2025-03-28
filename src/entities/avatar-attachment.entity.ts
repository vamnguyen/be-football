import { Entity, OneToOne } from 'typeorm';
import { File } from './file.entity';
import { User } from './user.entity';

@Entity('avatar_attachments')
export class AvatarAttachment extends File {
  @OneToOne(() => User, (user) => user.avatar, { onDelete: 'CASCADE' })
  user: User;
}
