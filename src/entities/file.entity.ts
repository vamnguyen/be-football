import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('files')
export class File extends BaseEntity {
  @Column()
  key: string;

  @Column()
  mimetype: string;

  @Column()
  url: string;
}
