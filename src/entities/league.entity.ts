import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Match } from './match.entity';
import { SPORTS } from '../core/enums/sports.enum';

@Entity('leagues')
export class League extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'enum', enum: SPORTS })
  sport: SPORTS;

  @Column({ nullable: true })
  logo?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Match, (match) => match.league)
  matches: Match[];
}
