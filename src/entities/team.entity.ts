import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Area } from './area.entity';
import { Match } from './match.entity';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  shortName: string;

  @Column()
  tla: string;

  @Column()
  crest: string;

  @Column()
  address: string;

  @Column()
  website: string;

  @Column()
  founded: number;

  @Column()
  clubColors: string;

  @Column()
  venue: string;

  @ManyToOne(() => Area, (area) => area.teams)
  area: Area;

  @OneToMany(() => Match, (match) => match.homeTeam)
  homeMatches: Match[];

  @OneToMany(() => Match, (match) => match.awayTeam)
  awayMatches: Match[];
}
