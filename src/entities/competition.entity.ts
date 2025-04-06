import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Area } from './area.entity';
import { Team } from './team.entity';
import { Match } from './match.entity';

@Entity('competitions')
export class Competition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  code: string;

  @Column()
  type: string;

  @Column()
  emblem: string;

  @ManyToOne(() => Area, (area) => area.competitions)
  area: Area;

  @Column()
  lastUpdated: Date;

  @Column()
  numberOfAvailableSeasons: number;

  @OneToMany(() => Match, (match) => match.competition)
  matches: Match[];

  @Column('jsonb')
  currentSeason: {
    id: number;
    startDate: Date;
    endDate: Date;
    currentMatchday: number;
    winner: Team | null;
  };

  @Column('jsonb')
  seasons: {
    id: number;
    startDate: Date;
    endDate: Date;
    currentMatchday: number;
  }[];
}
