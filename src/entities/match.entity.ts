import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Prediction } from './prediction.entity';
import { Team } from './team.entity';
import { Competition } from './competition.entity';

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  utcDate: Date;

  @Column()
  status: string;

  @Column()
  matchday: number;

  @Column()
  stage: string;

  @Column()
  group: string;

  @Column()
  lastUpdated: Date;

  @ManyToOne(() => Team, (team) => team.homeMatches)
  homeTeam: Team;

  @ManyToOne(() => Team, (team) => team.awayMatches)
  awayTeam: Team;

  @ManyToOne(() => Competition, (competition) => competition.matches)
  competition: Competition;

  @OneToMany(() => Prediction, (prediction) => prediction.match)
  predictions: Prediction[];
}
