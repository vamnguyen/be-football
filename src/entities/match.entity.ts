import { Entity, Column, OneToMany } from 'typeorm';
import { Prediction } from './prediction.entity';
import { BaseEntity } from './base.entity';
import { LEAGUES } from '../core/enums';

@Entity('matches')
export class Match extends BaseEntity {
  @Column()
  homeTeam: string;

  @Column()
  awayTeam: string;

  @Column()
  matchDate: Date;

  @Column({ type: 'enum', enum: LEAGUES, nullable: true })
  league: LEAGUES | null;

  @Column({ nullable: true })
  score?: string;

  @OneToMany(() => Prediction, (prediction) => prediction.match)
  predictions: Prediction[];
}
